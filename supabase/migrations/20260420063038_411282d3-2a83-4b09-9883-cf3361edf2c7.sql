-- Add multi-tenant B2B company context fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS company_industry text,
  ADD COLUMN IF NOT EXISTS company_size text,
  ADD COLUMN IF NOT EXISTS company_website text,
  ADD COLUMN IF NOT EXISTS company_country text,
  ADD COLUMN IF NOT EXISTS company_sells text,
  ADD COLUMN IF NOT EXISTS icp_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ipp_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS partnership_offer_json jsonb DEFAULT '{}'::jsonb;

-- Add hybrid commission fields to clients (will become Partners in 2D)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS partner_type text,
  ADD COLUMN IF NOT EXISTS commission_pct numeric,
  ADD COLUMN IF NOT EXISTS commission_fixed numeric,
  ADD COLUMN IF NOT EXISTS commission_currency text DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS performance_bonus_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_status text DEFAULT 'prospect';

-- Add per-partner / commission breakdown to freelance_income (becomes commission ledger in 2D)
ALTER TABLE public.freelance_income
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referrals_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_pct numeric,
  ADD COLUMN IF NOT EXISTS commission_fixed numeric,
  ADD COLUMN IF NOT EXISTS revenue_attributed numeric,
  ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending';