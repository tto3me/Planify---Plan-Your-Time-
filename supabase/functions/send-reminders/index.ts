import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch tasks that haven't been notified yet and have a reminder set
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        auth_users:user_id (email)
      `)
      .eq("is_deleted", false)
      .eq("is_notified", false)
      .neq("status", "completed")
      .neq("reminder", "Aucun")
      .not("reminder", "is", null);

    if (tasksError) {
      throw tasksError;
    }

    const now = new Date();
    const emailsToSend: any[] = [];
    const tasksToMarkAsNotified: string[] = [];

    for (const task of tasks || []) {
      // Calculate target date based on task.date and task.time
      // task.date is 'YYYY-MM-DD'
      // task.time is 'HH:MM - HH:MM' or 'HH:MM'
      const startTimeStr = task.time.split('-')[0].trim();
      const taskDateTime = new Date(`${task.date}T${startTimeStr}:00`);

      if (isNaN(taskDateTime.getTime())) continue;

      let timeThreshold = new Date(taskDateTime);

      if (task.reminder === "10 min avant") {
        timeThreshold.setMinutes(timeThreshold.getMinutes() - 10);
      } else if (task.reminder === "1 heure avant") {
        timeThreshold.setHours(timeThreshold.getHours() - 1);
      } else if (task.reminder === "1 jour avant") {
        timeThreshold.setDate(timeThreshold.getDate() - 1);
      } else {
        // Unknown reminder type, skip
        continue;
      }

      // If the current time is past the threshold, send the reminder
      if (now >= timeThreshold) {
        // user_email depends on how we joined. In Supabase edge functions with service_role, joining auth.users requires special config or we just fetch it directly.
        // Actually, joining auth.users is often forbidden by default even with service_role if not using the right RPC or exposing the schema.
        // To be safe, let's fetch the user email via admin api.
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(task.user_id);
        
        if (userError || !userData.user) {
          console.error(`Could not fetch user ${task.user_id}`);
          continue;
        }
        
        const email = userData.user.email;

        emailsToSend.push({
          from: "Planify <notifications@planify.life>", // Replace with verified domain in Resend
          to: [email],
          subject: `Rappel : ${task.title}`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #2563eb;">Rappel Planify</h2>
              <p>Bonjour,</p>
              <p>Ceci est un rappel automatique pour votre événement à venir :</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e293b;">${task.title}</h3>
                <p style="margin: 5px 0;"><strong>Date :</strong> ${task.date}</p>
                <p style="margin: 5px 0;"><strong>Heure :</strong> ${task.time}</p>
                <p style="margin: 5px 0;"><strong>Type :</strong> ${task.type}</p>
              </div>
              <p>Connectez-vous sur votre tableau de bord pour plus de détails.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Planify - Votre Assistant Personnel</p>
            </div>
          `,
        });

        tasksToMarkAsNotified.push(task.id);
      }
    }

    if (emailsToSend.length > 0) {
      // Send emails using Resend Batch API
      const resendRes = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailsToSend),
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        throw new Error(`Resend API error: ${errorText}`);
      }

      // Mark tasks as notified
      for (const taskId of tasksToMarkAsNotified) {
        await supabase
          .from("tasks")
          .update({ is_notified: true })
          .eq("id", taskId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsToSend.length 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
