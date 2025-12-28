import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestDomainDnsRequest {
  domainId: string;
}

type CheckStatus = "success" | "error" | "pending";

const normalizeTxt = (v: string) =>
  v
    .replace(/\"/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();

const toFqdn = (name: string, base: string) => {
  const n = (name || "").trim().replace(/\.$/, "");
  const b = (base || "").trim().replace(/\.$/, "");
  if (!n || n === "@") return b;
  if (n === b || n.endsWith(`.${b}`)) return n;
  return `${n}.${b}`;
};

const dohGoogle = async (name: string, type: string) => {
  const res = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    { method: "GET" },
  );
  const json = await res.json();
  const answers: string[] = Array.isArray(json?.Answer)
    ? json.Answer.map((a: { data?: string }) => a?.data).filter(Boolean)
    : [];
  return answers;
};

const dohCloudflare = async (name: string, type: string) => {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    {
      method: "GET",
      headers: {
        accept: "application/dns-json",
      },
    },
  );
  const json = await res.json();
  const answers: string[] = Array.isArray(json?.Answer)
    ? json.Answer.map((a: { data?: string }) => a?.data).filter(Boolean)
    : [];
  return answers;
};

const checkTxtExact = (answers: string[], expected: string) => {
  const exp = normalizeTxt(expected);
  return answers.some((a) => normalizeTxt(a) === exp);
};

const checkMxExact = (answers: string[], expectedHost: string) => {
  const exp = (expectedHost || "").trim().replace(/\.$/, "").toLowerCase();
  return answers.some((a) => {
    // format courant: "10 mail.example.com." (ou parfois sans priorité)
    const parts = String(a).trim().split(/\s+/);
    const host = (parts[parts.length - 1] || "").replace(/\.$/, "").toLowerCase();
    return host === exp;
  });
};

const statusFromResolvers = (a: CheckStatus, b: CheckStatus): CheckStatus => {
  // Priorité: mismatch/error > pending > success
  if (a === "error" || b === "error") return "error";
  if (a === "pending" || b === "pending") return "pending";
  return "success";
};

const handler = async (req: Request): Promise<Response> => {
  console.log("test-domain-dns called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { domainId }: TestDomainDnsRequest = await req.json();
    if (!domainId) {
      return new Response(JSON.stringify({ error: "domainId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1) Récupérer les enregistrements attendus depuis Resend
    const domainRes = await fetch(`https://api.resend.com/domains/${domainId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    });

    const domainJson = await domainRes.json();
    if (!domainRes.ok) {
      console.error("Resend domain fetch error:", domainJson);
      return new Response(JSON.stringify({ error: domainJson?.message || "Failed to fetch domain" }), {
        status: domainRes.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const domainName: string = domainJson?.name;
    const records: any[] = Array.isArray(domainJson?.records) ? domainJson.records : [];

    // 2) Vérifier publiquement (Google + Cloudflare) que les valeurs correspondent EXACTEMENT
    const checks = await Promise.all(
      records.map(async (r) => {
        const recordLabel = String(r?.record || r?.type || "DNS");
        const type = String(r?.type || "").toUpperCase();
        const fqdn = toFqdn(String(r?.name || ""), domainName);
        const expectedValue = String(r?.value || "");

        if (!fqdn || !type || !expectedValue) {
          return {
            type: recordLabel,
            status: "pending" as CheckStatus,
            message: "Vérification indisponible pour cet enregistrement",
            resolvers: { google: "pending", cloudflare: "pending" },
          };
        }

        const checkOne = async (resolver: "google" | "cloudflare") => {
          const answers = resolver === "google" ? await dohGoogle(fqdn, type) : await dohCloudflare(fqdn, type);
          if (!answers.length) return "error" as CheckStatus;
          if (type === "TXT") return (checkTxtExact(answers, expectedValue) ? "success" : "error") as CheckStatus;
          if (type === "MX") return (checkMxExact(answers, expectedValue) ? "success" : "error") as CheckStatus;
          // Types non gérés ici
          return "pending" as CheckStatus;
        };

        let googleStatus: CheckStatus = "pending";
        let cloudflareStatus: CheckStatus = "pending";

        try {
          googleStatus = await checkOne("google");
        } catch {
          googleStatus = "pending";
        }

        try {
          cloudflareStatus = await checkOne("cloudflare");
        } catch {
          cloudflareStatus = "pending";
        }

        const finalStatus = statusFromResolvers(googleStatus, cloudflareStatus);

        const message =
          finalStatus === "success"
            ? `Enregistrement ${recordLabel} détecté et conforme`
            : finalStatus === "error"
              ? `Enregistrement ${recordLabel} manquant ou différent (DNS publics)`
              : `Enregistrement ${recordLabel} en attente de propagation`;

        return {
          type: recordLabel,
          status: finalStatus,
          message,
          resolvers: { google: googleStatus, cloudflare: cloudflareStatus },
        };
      }),
    );

    return new Response(
      JSON.stringify({
        success: true,
        domain: domainName,
        checks,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in test-domain-dns:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
