import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_NAME = 'Market Your Skill'
const ROOT_DOMAIN = 'mk.eduforyou.co.uk'
const SENDER_DOMAIN = 'notify.mk.eduforyou.co.uk'
const FROM_DOMAIN = 'mk.eduforyou.co.uk'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, full_name } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const registerUrl = `https://${ROOT_DOMAIN}/auth/register`
    const firstName = full_name?.split(' ')[0] || 'Salut'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#0D1B2A,#1B2D45);padding:32px 40px;text-align:center;">
          <h1 style="color:#D4A843;font-size:24px;margin:0;font-family:'Playfair Display',Georgia,serif;">🎉 Felicitări!</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">
            Bună ${firstName},
          </p>
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">
            Aplicația ta pe <strong>Market Your Skill</strong> a fost <strong style="color:#D4A843;">aprobată</strong>! 🎊
          </p>
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Ești gata să îți construiești cariera de freelancer? Creează-ți contul acum și accesează toate instrumentele platformei.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${registerUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4A843,#C49B38);color:#0D1B2A;font-weight:700;font-size:16px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Creează-ți contul →
              </a>
            </td></tr>
          </table>
          <p style="color:#888;font-size:13px;margin:24px 0 0;text-align:center;">
            Dacă butonul nu funcționează, copiază acest link:<br>
            <a href="${registerUrl}" style="color:#D4A843;">${registerUrl}</a>
          </p>
        </td></tr>
        <tr><td style="background-color:#f8f8fa;padding:20px 40px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${SITE_NAME}. Toate drepturile rezervate.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Felicitări ${firstName}! Aplicația ta pe Market Your Skill a fost aprobată. Creează-ți contul aici: ${registerUrl}`

    const messageId = crypto.randomUUID()

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'waitlist_approved',
      recipient_email: email,
      status: 'pending',
    })

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: '🎉 Ai fost aprobat pe Market Your Skill!',
        html,
        text,
        purpose: 'transactional',
        label: 'waitlist_approved',
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue approval email', enqueueError)
      return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
