import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Enroll new prospects function called at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active campaigns with auto_enroll_new_prospects enabled
    const { data: autoEnrollCampaigns, error: campaignsError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("is_active", true)
      .eq("auto_enroll_new_prospects", true);

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
      return new Response(
        JSON.stringify({ error: "Error fetching campaigns" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!autoEnrollCampaigns || autoEnrollCampaigns.length === 0) {
      console.log("No campaigns with auto-enrollment enabled");
      return new Response(
        JSON.stringify({ message: "No auto-enroll campaigns", enrolled: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${autoEnrollCampaigns.length} auto-enroll campaigns`);

    let totalEnrolled = 0;

    for (const campaign of autoEnrollCampaigns) {
      const targetGroups: string[] = campaign.target_groups || [];
      
      if (targetGroups.length === 0) {
        console.log(`Campaign ${campaign.id} has no target groups`);
        continue;
      }

      // Get all prospects in target groups
      const { data: prospectGroups, error: pgError } = await supabase
        .from("prospect_groups")
        .select("prospect_id")
        .in("group_id", targetGroups);

      if (pgError) {
        console.error(`Error fetching prospect groups for campaign ${campaign.id}:`, pgError);
        continue;
      }

      const prospectIds = [...new Set(prospectGroups?.map(pg => pg.prospect_id) || [])];
      
      if (prospectIds.length === 0) {
        continue;
      }

      // Get existing recipients for this campaign
      const { data: existingRecipients } = await supabase
        .from("email_campaign_recipients")
        .select("prospect_id")
        .eq("campaign_id", campaign.id);

      const existingProspectIds = new Set(existingRecipients?.map(r => r.prospect_id) || []);

      // Get existing workflow executions
      const { data: existingExecutions } = await supabase
        .from("workflow_executions")
        .select("prospect_id")
        .eq("campaign_id", campaign.id);

      const existingExecutionIds = new Set(existingExecutions?.map(e => e.prospect_id) || []);

      // Filter to only new prospects
      const newProspectIds = prospectIds.filter(id => 
        !existingProspectIds.has(id) && !existingExecutionIds.has(id)
      );

      if (newProspectIds.length === 0) {
        console.log(`No new prospects to enroll for campaign ${campaign.id}`);
        continue;
      }

      console.log(`Enrolling ${newProspectIds.length} new prospects in campaign ${campaign.id}`);

      // Get workflow steps
      const workflowSteps = campaign.workflow_steps || [];
      const totalSteps = workflowSteps.length || 1;

      // Calculate first execution time (immediate or based on first step delay)
      const now = new Date();
      let firstExecutionAt = now;
      
      if (workflowSteps.length > 0 && workflowSteps[0]) {
        const firstStep = workflowSteps[0];
        if (firstStep.delay_days) {
          firstExecutionAt = new Date(now.getTime() + firstStep.delay_days * 24 * 60 * 60 * 1000);
        }
        if (firstStep.delay_hours) {
          firstExecutionAt = new Date(firstExecutionAt.getTime() + firstStep.delay_hours * 60 * 60 * 1000);
        }
        if (firstStep.delay_minutes) {
          firstExecutionAt = new Date(firstExecutionAt.getTime() + firstStep.delay_minutes * 60 * 1000);
        }
      }

      // Create workflow executions for new prospects
      const executions = newProspectIds.map(prospectId => ({
        campaign_id: campaign.id,
        prospect_id: prospectId,
        workflow_id: campaign.workflow_id,
        current_step: 0,
        total_steps: totalSteps,
        status: "in_progress",
        next_execution_at: firstExecutionAt.toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("workflow_executions")
        .insert(executions);

      if (insertError) {
        console.error(`Error creating executions for campaign ${campaign.id}:`, insertError);
        continue;
      }

      // Create recipient records
      const recipients = newProspectIds.map(prospectId => ({
        campaign_id: campaign.id,
        prospect_id: prospectId,
        status: "en_attente",
      }));

      const { error: recipientError } = await supabase
        .from("email_campaign_recipients")
        .insert(recipients);

      if (recipientError) {
        console.error(`Error creating recipients for campaign ${campaign.id}:`, recipientError);
      }

      totalEnrolled += newProspectIds.length;
      console.log(`Enrolled ${newProspectIds.length} prospects in campaign ${campaign.id}`);
    }

    console.log(`Total enrolled: ${totalEnrolled}`);

    return new Response(
      JSON.stringify({
        success: true,
        enrolled: totalEnrolled,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in enroll-new-prospects:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
