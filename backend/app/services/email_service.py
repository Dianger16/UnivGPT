import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_otp_email(receiver_email: str, otp: str, user_name: str = "User"):
        """Sends a professional OTP email with UniGPT branding."""
        try:
            # Email Content with HTML and Professional Styling
            subject = f"Your UniGPT Verification Code: {otp}"

            # Professional HTML Template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eeeeee; }}
                    .header {{ background: #000000; padding: 30px; text-align: center; }}
                    .logo-text {{ color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }}
                    .logo-accent {{ color: #f97316; }}
                    .content {{ padding: 40px; color: #333333; line-height: 1.6; }}
                    .greeting {{ font-size: 18px; font-weight: 600; margin-bottom: 20px; }}
                    .otp-box {{ background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px dashed #d1d5db; }}
                    .otp-code {{ font-size: 32px; font-weight: 800; color: #f97316; letter-spacing: 5px; }}
                    .footer {{ background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eeeeee; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header" style="text-align: center; background: #000000; padding: 40px 20px;">
                        <div style="display: inline-block; vertical-align: middle; margin-right: 15px;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="4" r="2" fill="white" />
                                <circle cx="12" cy="20" r="2" fill="white" />
                                <circle cx="4" cy="8" r="2" fill="white" />
                                <circle cx="4" cy="16" r="2" fill="white" />
                                <circle cx="20" cy="8" r="2" fill="white" />
                                <circle cx="20" cy="16" r="2" fill="white" />
                                <circle cx="12" cy="12" r="2.5" fill="white" />
                                <line x1="12" y1="4" x2="4" y2="8" />
                                <line x1="12" y1="4" x2="20" y2="8" />
                                <line x1="4" y1="8" x2="4" y2="16" />
                                <line x1="20" y1="8" x2="20" y2="16" />
                                <line x1="4" y1="16" x2="12" y2="20" />
                                <line x1="20" y1="16" x2="12" y2="20" />
                                <line x1="4" y1="8" x2="12" y2="12" />
                                <line x1="20" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="20" x2="12" y2="12" />
                            </svg>
                        </div>
                        <div class="logo-text" style="display: inline-block; vertical-align: middle; font-size: 32px; font-weight: 800; letter-spacing: -1px; color: white;">Univ<span style="color: #f97316;">GPT</span></div>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello {user_name},</div>
                        <p>Welcome to UnivGPT! To complete your registration, please use the verification code below. This code will expire in 10 minutes.</p>
                        <div class="otp-box">
                            <div class="otp-code">{otp}</div>
                        </div>
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                        <p>Best regards,<br>The UnivGPT Team</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 UnivGPT. All rights reserved.<br>
                        Professional Academic AI Assistant
                    </div>
                </div>
            </body>
            </html>
            """

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
            msg["To"] = receiver_email

            msg.attach(MIMEText(html_content, "html"))

            # SMTP Server Configuration
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

            logger.info(f"OTP Email sent successfully to {receiver_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    @staticmethod
    def send_flagged_alert_email(
        student_id: str,
        student_role: str,
        user_query: str,
        user_name: str = "Unknown",
        user_email: str = "Unknown",
    ):
        """Sends an alert to the admin about flagged/inappropriate student behavior."""
        try:
            delivery_email = settings.smtp_user

            subject = "ACTION REQUIRED: Flagged User Behavior in UnivGPT"

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9f9f9; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #ffcccc; overflow: hidden; box-shadow: 0 4px 12px rgba(255,0,0,0.1); }}
                    .header {{ background: #dc2626; padding: 20px; color: white; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }}
                    .content {{ padding: 30px; color: #333; line-height: 1.6; }}
                    .details-box {{ background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; font-family: monospace; white-space: pre-wrap; }}
                    .label {{ font-weight: 600; color: #555; width: 100px; display: inline-block; }}
                    .footer {{ background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Safety Alert: Policy Violation</div>
                    <div class="content">
                        <p><strong>Admin Alert:</strong></p>
                        <p>The UnivGPT moderation system has flagged a message for violating professional conduct policies.</p>
                        
                        <p><strong>Incident Details:</strong></p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                            <div style="margin-bottom: 8px;"><span class="label">Name:</span> {user_name}</div>
                            <div style="margin-bottom: 8px;"><span class="label">Email:</span> {user_email}</div>
                            <div style="margin-bottom: 8px;"><span class="label">User ID:</span> {student_id}</div>
                            <div><span class="label">Role:</span> {student_role}</div>
                        </div>
                        
                        <p><strong>Flagged Query:</strong></p>
                        <div class="details-box">{user_query}</div>
                        
                        <p>Please review and take appropriate disciplinary action.</p>
                    </div>
                    <div class="footer">Automated Moderation System • UnivGPT</div>
                </div>
            </body>
            </html>
            """

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
            msg["To"] = delivery_email

            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

            logger.info(f"Flagged alert email successfully sent for user {student_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to send flag alert email: {e}")
            return False
