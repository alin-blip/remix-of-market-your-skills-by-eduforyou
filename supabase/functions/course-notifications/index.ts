import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "course_completed" | "progress_reminder" | "welcome";
  user_id: string;
  course_id?: string;
  user_email: string;
  user_name: string;
  course_title?: string;
  progress_percent?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { type, user_id, course_id, user_email, user_name, course_title, progress_percent }: NotificationRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case "course_completed":
        subject = `🎉 Felicitări! Ai completat cursul "${course_title}"`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .trophy { font-size: 64px; margin-bottom: 20px; }
              h1 { color: #1f2937; margin: 0 0 10px; font-size: 28px; }
              .subtitle { color: #6b7280; font-size: 16px; margin-bottom: 30px; }
              .highlight { color: #f59e0b; font-weight: bold; }
              .course-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
              .course-title { font-size: 20px; font-weight: bold; color: #92400e; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="trophy">🏆</div>
                  <h1>Felicitări, ${user_name}!</h1>
                  <p class="subtitle">Ai demonstrat dedicare și ai completat cu succes cursul!</p>
                </div>
                
                <div class="course-box">
                  <div class="course-title">${course_title}</div>
                  <p style="color: #92400e; margin: 10px 0 0;">100% Completat ✓</p>
                </div>
                
                <p style="color: #4b5563; text-align: center;">
                  Acum poți descărca <span class="highlight">certificatul tău</span> direct din aplicație!
                </p>
                
                <div style="text-align: center;">
                  <a href="https://freedomlauncher.ro/learning-hub" class="cta-button">
                    Descarcă Certificatul →
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 Freedom Launcher. Toate drepturile rezervate.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "progress_reminder":
        subject = `📚 Nu uita de cursul tău: "${course_title}"`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .icon { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #1f2937; margin: 0 0 10px; font-size: 24px; }
              .progress-bar { background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; margin: 20px 0; }
              .progress-fill { background: linear-gradient(90deg, #10b981 0%, #34d399 100%); height: 100%; transition: width 0.3s; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="icon">📖</div>
                  <h1>Salut, ${user_name}!</h1>
                  <p style="color: #6b7280;">Ai început cursul "${course_title}" și ai făcut progres!</p>
                </div>
                
                <div style="text-align: center;">
                  <p style="color: #374151; font-weight: bold;">Progresul tău: ${progress_percent}%</p>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress_percent}%"></div>
                  </div>
                  <p style="color: #6b7280;">Mai ai doar ${100 - (progress_percent || 0)}% până la finalizare!</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://freedomlauncher.ro/course/${course_id}" class="cta-button">
                    Continuă Cursul →
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 Freedom Launcher. Toate drepturile rezervate.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "welcome":
        subject = "🚀 Bine ai venit la Freedom Launcher!";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .icon { font-size: 64px; margin-bottom: 20px; }
              h1 { color: #1f2937; margin: 0 0 10px; font-size: 28px; }
              .feature { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9fafb; border-radius: 8px; margin: 10px 0; }
              .feature-icon { font-size: 24px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="icon">🎓</div>
                  <h1>Bine ai venit, ${user_name}!</h1>
                  <p style="color: #6b7280;">Ești la un pas de a-ți construi cariera de freelancer!</p>
                </div>
                
                <div class="feature">
                  <span class="feature-icon">📚</span>
                  <span>Cursuri premium pentru freelanceri</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🎯</span>
                  <span>Tool-uri AI pentru profilul tău</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">💼</span>
                  <span>Generator de gig-uri optimizate</span>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://freedomlauncher.ro/learning-hub" class="cta-button">
                    Explorează Cursurile →
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 Freedom Launcher. Toate drepturile rezervate.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown notification type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    const emailResponse = await resend.emails.send({
      from: "Freedom Launcher <noreply@resend.dev>",
      to: [user_email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in course-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
