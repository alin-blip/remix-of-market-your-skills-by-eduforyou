-- Create new admin user with confirmed email
DO $$
DECLARE
  new_user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'alinflorinradu@icloud.com' LIMIT 1;

  IF existing_user_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'alinflorinradu@icloud.com',
      crypt('Performance2026@', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Alin Florin Radu"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'alinflorinradu@icloud.com', 'email_verified', true),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    new_user_id := existing_user_id;
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name, onboarding_completed, verified)
  VALUES (new_user_id, 'alinflorinradu@icloud.com', 'Alin Florin Radu', true, true)
  ON CONFLICT (id) DO NOTHING;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Also assign admin to existing google account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'alin@eduforyou.co.uk'
ON CONFLICT (user_id, role) DO NOTHING;