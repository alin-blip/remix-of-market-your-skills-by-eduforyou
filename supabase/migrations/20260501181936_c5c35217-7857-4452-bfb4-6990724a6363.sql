-- Grant Pro + admin to alin@eduforyou.co.uk (the actual logged-in account)
UPDATE public.profiles
SET role = 'admin'::user_role,
    is_eduforyou_member = true,
    onboarding_completed = true
WHERE email = 'alin@eduforyou.co.uk';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM public.profiles WHERE email = 'alin@eduforyou.co.uk'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.subscriptions (user_id, customer_email, plan, status, current_period_end, updated_at)
SELECT id, email, 'pro', 'active', now() + interval '100 years', now()
FROM public.profiles WHERE email = 'alin@eduforyou.co.uk'
ON CONFLICT (user_id) DO UPDATE SET plan = 'pro', status = 'active', current_period_end = now() + interval '100 years', updated_at = now();