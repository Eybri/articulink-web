import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Design Tokens (Based on Articulink Mobile Brand Palette)
COLORS = {
    "cream": "#FAF8F4",
    "royal_blue": "#1A4480",
    "teal": "#2A8FA0",
    "text_dark": "#1C2B3A",
    "text_mid": "#4A5A6A",
    "sand_mid": "#DDD6C8"
}

# Path to local assets
ASSETS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")

def get_base_template(content_html, first_name, title):
    """
    Returns a unified HTML template with brand colors and embedded white logo.
    """
    return f"""
    <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body {{ margin: 0; padding: 0; background-color: {COLORS['cream']}; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }}
                .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid {COLORS['sand_mid']}; box-shadow: 0 4px 20px rgba(26, 68, 128, 0.05); }}
                .header {{ background-color: {COLORS['royal_blue']}; padding: 40px 20px; text-align: center; }}
                .logo {{ width: 140px; height: auto; margin-bottom: 10px; }}
                .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }}
                .content {{ padding: 40px 32px; color: {COLORS['text_dark']}; line-height: 1.6; }}
                .footer {{ padding: 32px; font-size: 13px; color: {COLORS['text_mid']}; border-top: 1px solid {COLORS['sand_mid']}; background-color: {COLORS['cream']}; }}
                .appeal-box {{ background-color: rgba(42, 143, 160, 0.05); border: 1px solid {COLORS['teal']}; padding: 15px; border-radius: 8px; margin-top: 24px; font-size: 14px; color: {COLORS['text_mid']}; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo" alt="Articulink Logo" class="logo">
                    <h1>{title}</h1>
                </div>
                <div class="content">
                    <p style="font-size: 16px;">Hello <strong>{first_name}</strong>,</p>
                    {content_html}
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>Articulink Administration</strong></p>
                    <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">
                        This is an official administrative notification from the Articulink platform. 
                        To appeal any decision, please contact us at <a href="mailto:articulink00@gmail.com" style="color: {COLORS['teal']}; text-decoration: underline;">articulink00@gmail.com</a>.
                    </p>
                </div>
            </div>
        </body>
    </html>
    """

def attach_logo(msg):
    """Utility to attach the logo as an inline CID."""
    try:
        logo_path = os.path.join(ASSETS_PATH, "logo.png")
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<logo>")
                img.add_header("Content-Disposition", "inline", filename="logo.png")
                msg.attach(img)
    except Exception as e:
        logger.error(f"Failed to attach logo to email: {str(e)}")

def send_deactivation_email(email: str, first_name: str, deactivation_type: str, reason: str, end_date: datetime = None):
    """
    Send an email to a deactivated user using brand palette and embedded logo.
    """
    try:
        smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from = [os.getenv(k) for k in ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]]
        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from]): return

        type_label = "temporarily" if deactivation_type == "temporary" else "permanently"
        duration_info = f"<p style='color: {COLORS['teal']}; font-weight: 600;'>This deactivation is scheduled to end on: {end_date.strftime('%B %d, %Y')}</p>" if deactivation_type == "temporary" and end_date else ""

        content_html = f"""
        <p>This automated message is to inform you that your account has been <strong>{type_label}</strong> deactivated.</p>
        
        <div style="background-color: #FFF5F5; border-left: 4px solid #F87171; padding: 20px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #991B1B; font-weight: 600; margin-top: 0; margin-bottom: 8px; font-size: 14px; text-transform: uppercase;">Reason for Deactivation</p>
            <p style="color: {COLORS['text_dark']}; margin: 0;">{reason or "No specific reason was provided by the administrator."}</p>
        </div>
        {duration_info}
        <p>We take our community guidelines and account security very seriously. If you have questions or wish to appeal this decision, please use the contact information provided below.</p>
        """

        html = get_base_template(content_html, first_name, "Account Deactivated")
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Account Notice: Articulink Deactivation"
        msg["From"], msg["To"] = smtp_from, email
        msg.attach(MIMEText(html, "html"))
        
        # Attach the brand logo
        attach_logo(msg)

        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logger.info(f"📧 Deactivation notice delivered to {email}")

    except Exception as e:
        logger.error(f"❌ Failed to deliver deactivation notice: {str(e)}")

def send_activation_email(email: str, first_name: str):
    """
    Send an email to a reactivated user using brand palette and embedded logo.
    """
    try:
        smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from = [os.getenv(k) for k in ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]]
        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from]): return

        content_html = f"""
        <p>Welcome back! We are pleased to notify you that your Articulink account is now **fully reactivated**.</p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid {COLORS['teal']}; padding: 20px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #166534; font-weight: 600; margin-top: 0; margin-bottom: 8px; font-size: 14px; text-transform: uppercase;">Status: Active</p>
            <p style="color: {COLORS['text_dark']}; margin: 0;">Your access to all features and services has been restored. You can now log in and continue where you left off.</p>
        </div>
        """

        html = get_base_template(content_html, first_name, "Account Reactivated")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome Back! Your Articulink Account is Now Active"
        msg["From"], msg["To"] = smtp_from, email
        msg.attach(MIMEText(html, "html"))
        
        # Attach the brand logo
        attach_logo(msg)

        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logger.info(f"📧 Reactivaton notice delivered to {email}")

    except Exception as e:
        logger.error(f"❌ Failed to deliver reactivation notice: {str(e)}")
