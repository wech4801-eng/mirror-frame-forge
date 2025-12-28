import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckDomainRequest {
  domainId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Check domain status function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { domainId }: CheckDomainRequest = await req.json();

    if (!domainId) {
      return new Response(
        JSON.stringify({ error: "domainId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Checking domain status:", domainId);

    // Get domain status from Resend
    const response = await fetch(`https://api.resend.com/domains/${domainId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error checking domain:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to check domain" }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Domain status:", result);

    // Check individual record statuses
    const records = result.records || [];
    const dkimRecord = records.find((r: { type: string; name?: string }) => r.type === "TXT" && r.name?.includes("._domainkey"));
    const spfRecord = records.find((r: { type: string; name?: string }) => r.type === "TXT" && !r.name?.includes("._domainkey"));
    const mxRecord = records.find((r: { type: string }) => r.type === "MX");

    return new Response(
      JSON.stringify({
        success: true,
        status: result.status,
        is_verified: result.status === "verified",
        dkim_status: dkimRecord?.status || "pending",
        spf_status: spfRecord?.status || "pending",
        mx_status: mxRecord?.status || "pending",
        records: records,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-domain-status:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
