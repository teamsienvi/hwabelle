-- Create orders table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount INTEGER NOT NULL DEFAULT 0,  -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Service role can insert (used by the webhook edge function)
-- No explicit policy needed — service role bypasses RLS
