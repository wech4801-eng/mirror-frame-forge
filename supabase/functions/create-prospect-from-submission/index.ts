import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id, landing_page_id, email, full_name, phone, additional_data } = await req.json();

    if (!landing_page_id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the landing page owner (user_id)
    const { data: landingPage, error: lpError } = await supabaseAdmin
      .from("landing_pages")
      .select("user_id, client_name")
      .eq("id", landing_page_id)
      .single();

    if (lpError || !landingPage) {
      console.error("Landing page not found:", lpError);
      return new Response(
        JSON.stringify({ error: "Landing page not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if prospect already exists for this user
    const { data: existingProspect } = await supabaseAdmin
      .from("prospects")
      .select("id")
      .eq("user_id", landingPage.user_id)
      .eq("email", email)
      .maybeSingle();

    if (existingProspect) {
      console.log("Prospect already exists:", existingProspect.id);
      return new Response(
        JSON.stringify({ message: "Prospect already exists", prospect_id: existingProspect.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract name from additional_data if full_name is empty
    let prospectName = full_name;
    if (!prospectName && additional_data) {
      // Try common field names for name
      prospectName = additional_data.full_name || 
                     additional_data.name || 
                     additional_data.nom ||
                     (additional_data.Prenom ? `${additional_data.Prenom} ${additional_data.nom || ''}`.trim() : null) ||
                     email.split('@')[0];
    }
    if (!prospectName) {
      prospectName = email.split('@')[0];
    }

    // Extract phone from additional_data if phone is empty
    let prospectPhone = phone;
    if (!prospectPhone && additional_data) {
      prospectPhone = additional_data.phone || additional_data.telephone || additional_data.tel || null;
    }

    // Extract company from additional_data
    let prospectCompany = null;
    if (additional_data) {
      prospectCompany = additional_data.company || additional_data.entreprise || additional_data.societe || null;
    }

    // Create the prospect
    const { data: newProspect, error: createError } = await supabaseAdmin
      .from("prospects")
      .insert({
        user_id: landingPage.user_id,
        full_name: prospectName,
        email: email,
        phone: prospectPhone,
        company: prospectCompany,
        status: "nouveau",
        source: `Landing Page: ${landingPage.client_name}`,
        notes: additional_data ? `Données additionnelles: ${JSON.stringify(additional_data)}` : null
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating prospect:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Prospect created successfully:", newProspect.id);

    // Apply routing rules for the new prospect
    try {
      await supabaseAdmin.rpc("apply_routing_rules", { prospect_id: newProspect.id });
      console.log("Routing rules applied for prospect:", newProspect.id);
    } catch (routingError) {
      console.error("Error applying routing rules:", routingError);
    }

    // Create notification for the user
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: landingPage.user_id,
        title: "Nouveau prospect",
        message: `${prospectName} s'est inscrit via la landing page "${landingPage.client_name}"`,
        type: "success",
        link: "/prospects"
      });

    return new Response(
      JSON.stringify({ success: true, prospect_id: newProspect.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in create-prospect-from-submission:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
