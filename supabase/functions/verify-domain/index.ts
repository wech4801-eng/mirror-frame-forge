import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AddDomainRequest {
  domain: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Verify domain function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Safe debug (do NOT log the full key)
    console.log(
      "RESEND_API_KEY loaded:",
      `${RESEND_API_KEY.slice(0, 6)}... (len=${RESEND_API_KEY.length})`
    );

    const body: AddDomainRequest = await req.json();
    const normalizedDomain = (body?.domain ?? "").trim().toLowerCase();

    if (!normalizedDomain) {
      return new Response(
        JSON.stringify({ error: "domain is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic validation to prevent common mistakes (missing TLD, spaces, etc.)
    if (normalizedDomain.includes(" ") || !normalizedDomain.includes(".")) {
      return new Response(
        JSON.stringify({
          error: "Veuillez saisir un domaine complet (ex: exemple.com).",
          code: "invalid_domain",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Adding domain to Resend:", normalizedDomain);

    // Add domain to Resend
    const addResponse = await fetch("https://api.resend.com/domains", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: normalizedDomain }),
    });

    const addResult = await addResponse.json().catch(() => ({}));

    if (!addResponse.ok) {
      const code = (addResult as any)?.name ?? "resend_error";
      const message = (addResult as any)?.message ?? "Failed to add domain";

      const hint =
        code === "restricted_api_key"
          ? "Votre clé Resend est limitée à l’envoi. Créez une clé API avec accès complet (Domains) puis remplacez RESEND_API_KEY."
          : message;

      console.error("Error adding domain:", {
        status: addResponse.status,
        code,
        message,
      });

      return new Response(
        JSON.stringify({ error: hint, code }),
        {
          status: addResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Domain added to Resend:", addResult);

    // Return the DNS records that need to be configured
    return new Response(
      JSON.stringify({
        success: true,
        domain_id: addResult.id,
        records: addResult.records || [],
        status: addResult.status,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-domain:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
