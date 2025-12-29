import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send campaign function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { campaignId }: SendCampaignRequest = await req.json();
    console.log("Campaign ID:", campaignId);

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "campaignId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*, email_templates(*)")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user's email domain configuration
    const { data: emailDomain, error: domainError } = await supabase
      .from("email_domains")
      .select("*")
      .eq("user_id", campaign.user_id)
      .eq("is_verified", true)
      .single();

    if (domainError || !emailDomain) {
      console.error("No verified email domain found for user:", campaign.user_id);
      return new Response(
        JSON.stringify({ 
          error: "Aucun domaine d'envoi vérifié trouvé. Veuillez configurer et vérifier un domaine dans les paramètres." 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Using verified domain: ${emailDomain.domain}, from: ${emailDomain.from_email}`);

    // Get pending recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from("email_campaign_recipients")
      .select("*, prospects(*)")
      .eq("campaign_id", campaignId)
      .eq("status", "en_attente");

    if (recipientsError) {
      console.error("Error fetching recipients:", recipientsError);
      return new Response(
        JSON.stringify({ error: "Error fetching recipients" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending recipients" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending to ${recipients.length} recipients via ${emailDomain.from_email}`);

    // Build from address using verified domain
    const fromAddress = `${emailDomain.from_name} <${emailDomain.from_email}>`;

    let successCount = 0;
    let errorCount = 0;

    // Send emails to each recipient
    for (const recipient of recipients) {
      const prospect = recipient.prospects;
      
      if (!prospect || !prospect.email) {
        console.log(`Skipping recipient ${recipient.id} - no email`);
        continue;
      }

      // Replace variables in content
      let emailContent = campaign.content;
      emailContent = emailContent.replace(/{{prenom}}/g, prospect.full_name?.split(" ")[0] || "");
      emailContent = emailContent.replace(/{{nom}}/g, prospect.full_name || "");
      emailContent = emailContent.replace(/{{email}}/g, prospect.email);
      emailContent = emailContent.replace(/{{entreprise}}/g, prospect.company || "");

      let emailSubject = campaign.subject;
      emailSubject = emailSubject.replace(/{{prenom}}/g, prospect.full_name?.split(" ")[0] || "");
      emailSubject = emailSubject.replace(/{{nom}}/g, prospect.full_name || "");

      try {
        const emailPayload: Record<string, unknown> = {
          from: fromAddress,
          to: [prospect.email],
          subject: emailSubject,
          html: emailContent,
        };

        if (emailDomain?.reply_to) {
          emailPayload.reply_to = emailDomain.reply_to;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        const result = await response.json();

        if (response.ok) {
          // Update recipient status to sent
          await supabase
            .from("email_campaign_recipients")
            .update({
              status: "envoye",
              sent_at: new Date().toISOString(),
            })
            .eq("id", recipient.id);

          successCount++;
          console.log(`Email sent to ${prospect.email}`);
        } else {
          // Update recipient status to error
          await supabase
            .from("email_campaign_recipients")
            .update({
              status: "erreur",
              error_message: result.message || "Unknown error",
            })
            .eq("id", recipient.id);

          errorCount++;
          console.error(`Error sending to ${prospect.email}:`, result);
        }
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
        await supabase
          .from("email_campaign_recipients")
          .update({
            status: "erreur",
            error_message: errorMessage,
          })
          .eq("id", recipient.id);

        errorCount++;
        console.error(`Exception sending to ${prospect.email}:`, errorMessage);
      }
    }

    // Update campaign status
    await supabase
      .from("email_campaigns")
      .update({
        status: "envoyee",
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    console.log(`Campaign sent: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        errors: errorCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-campaign:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
