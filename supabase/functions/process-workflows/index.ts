import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkflowStep {
  type: string;
  template_id?: string;
  template_key?: string;
  delay_days?: number;
  delay_hours?: number;
  delay_minutes?: number;
  subject?: string;
  content?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Process workflows function called at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all workflow executions that are due to be processed
    const now = new Date().toISOString();
    const { data: pendingExecutions, error: fetchError } = await supabase
      .from("workflow_executions")
      .select(`
        *,
        campaigns:email_campaigns(*),
        prospects(*)
      `)
      .eq("status", "in_progress")
      .lte("next_execution_at", now)
      .limit(100);

    if (fetchError) {
      console.error("Error fetching pending executions:", fetchError);
      return new Response(
        JSON.stringify({ error: "Error fetching executions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!pendingExecutions || pendingExecutions.length === 0) {
      console.log("No pending workflow executions to process");
      return new Response(
        JSON.stringify({ message: "No pending executions", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${pendingExecutions.length} workflow executions`);

    let processedCount = 0;
    let errorCount = 0;

    for (const execution of pendingExecutions) {
      try {
        const campaign = execution.campaigns;
        const prospect = execution.prospects;

        if (!campaign || !prospect) {
          console.log(`Skipping execution ${execution.id} - missing campaign or prospect`);
          continue;
        }

        // Check if campaign is still active
        if (!campaign.is_active) {
          console.log(`Campaign ${campaign.id} is not active, pausing execution`);
          await supabase
            .from("workflow_executions")
            .update({ status: "paused" })
            .eq("id", execution.id);
          continue;
        }

        // Get workflow steps from campaign
        const workflowSteps: WorkflowStep[] = campaign.workflow_steps || [];
        const currentStep = execution.current_step;

        if (currentStep >= workflowSteps.length) {
          // Workflow completed
          console.log(`Workflow completed for execution ${execution.id}`);
          await supabase
            .from("workflow_executions")
            .update({ 
              status: "completed",
              last_executed_at: now
            })
            .eq("id", execution.id);
          processedCount++;
          continue;
        }

        const step = workflowSteps[currentStep];
        console.log(`Processing step ${currentStep} for prospect ${prospect.email}:`, step);

        // Process step based on type
        if (step.type === "send_email") {
          // Get user's email domain configuration
          const { data: emailDomain } = await supabase
            .from("email_domains")
            .select("*")
            .eq("user_id", campaign.user_id)
            .eq("is_verified", true)
            .single();

          if (!emailDomain) {
            console.error(`No verified email domain for user ${campaign.user_id}`);
            await supabase
              .from("workflow_executions")
              .update({ 
                status: "failed",
                metadata: { error: "No verified email domain" }
              })
              .eq("id", execution.id);
            errorCount++;
            continue;
          }

          // Get email content - either from template or step
          let emailSubject = step.subject || campaign.subject;
          let emailContent = step.content || campaign.content;

          // If template_id is specified, get the template
          if (step.template_id) {
            const { data: template } = await supabase
              .from("email_templates")
              .select("*")
              .eq("id", step.template_id)
              .single();

            if (template) {
              emailSubject = template.subject;
              emailContent = template.content;
            }
          }

          // Replace variables in content
          const firstName = prospect.full_name?.split(" ")[0] || "";
          const fullName = prospect.full_name || "";
          const email = prospect.email || "";
          const company = prospect.company || "";

          emailContent = emailContent
            .replace(/\{\{prenom\}\}/gi, firstName)
            .replace(/\{\{nom\}\}/gi, fullName)
            .replace(/\{\{email\}\}/gi, email)
            .replace(/\{\{entreprise\}\}/gi, company)
            .replace(/\{prenom\}/gi, firstName)
            .replace(/\{nom\}/gi, fullName)
            .replace(/\{email\}/gi, email)
            .replace(/\{entreprise\}/gi, company);

          emailSubject = emailSubject
            .replace(/\{\{prenom\}\}/gi, firstName)
            .replace(/\{\{nom\}\}/gi, fullName)
            .replace(/\{prenom\}/gi, firstName)
            .replace(/\{nom\}/gi, fullName);

          // Send email
          const fromAddress = `${emailDomain.from_name} <${emailDomain.from_email}>`;
          
          const emailPayload: Record<string, unknown> = {
            from: fromAddress,
            to: [prospect.email],
            subject: emailSubject,
            html: emailContent,
          };

          if (emailDomain.reply_to) {
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
            console.log(`Email sent to ${prospect.email} for step ${currentStep}`);
            
            // Update or create recipient record
            await supabase
              .from("email_campaign_recipients")
              .upsert({
                campaign_id: campaign.id,
                prospect_id: prospect.id,
                status: "envoye",
                sent_at: now,
              }, { onConflict: "campaign_id,prospect_id" });

          } else {
            console.error(`Failed to send email to ${prospect.email}:`, result);
          }
        }

        // Calculate next execution time
        const nextStep = currentStep + 1;
        let nextExecutionAt: Date | null = null;

        if (nextStep < workflowSteps.length) {
          const nextStepConfig = workflowSteps[nextStep];
          nextExecutionAt = new Date();
          
          if (nextStepConfig.delay_days) {
            nextExecutionAt.setDate(nextExecutionAt.getDate() + nextStepConfig.delay_days);
          }
          if (nextStepConfig.delay_hours) {
            nextExecutionAt.setHours(nextExecutionAt.getHours() + nextStepConfig.delay_hours);
          }
          if (nextStepConfig.delay_minutes) {
            nextExecutionAt.setMinutes(nextExecutionAt.getMinutes() + nextStepConfig.delay_minutes);
          }
        }

        // Update execution
        await supabase
          .from("workflow_executions")
          .update({
            current_step: nextStep,
            last_executed_at: now,
            next_execution_at: nextExecutionAt?.toISOString() || null,
            status: nextStep >= workflowSteps.length ? "completed" : "in_progress",
          })
          .eq("id", execution.id);

        processedCount++;
        console.log(`Successfully processed execution ${execution.id}`);

      } catch (stepError) {
        console.error(`Error processing execution ${execution.id}:`, stepError);
        errorCount++;
      }
    }

    console.log(`Workflow processing complete: ${processedCount} processed, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-workflows:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
