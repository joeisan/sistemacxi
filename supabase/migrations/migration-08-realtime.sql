-- Migration 08: Enable Realtime for Alerts
-- This allows clients to receive new alerts instantly without refreshing.

ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_alerts;

-- Ensure replica identity is set to DEFAULT (uses primary key)
ALTER TABLE public.tenant_alerts REPLICA IDENTITY DEFAULT;
