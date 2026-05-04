-- =============================================
-- Planify: Setup Email Reminders Cron Job
-- =============================================

-- 1. Enable necessary extensions (Requires Superuser/Supabase Dashboard admin)
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the Cron Job to run every 10 minutes
-- Note: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- Note: Replace 'YOUR_ANON_KEY' with your actual Supabase Anon Key
SELECT cron.schedule(
    'send-reminders-job',
    '*/10 * * * *', -- Every 10 minutes
    $$
    SELECT net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
        ),
        body:='{}'::jsonb
    );
    $$
);

-- Note: To unschedule the job, you can run:
-- SELECT cron.unschedule('send-reminders-job');
