"""Email sending — verification and password reset. Moved out of app.py as-is."""

import traceback
from flask import current_app
from flask_mail import Message

from extensions import mail


def send_verification_email(to_email, token, name):
    try:
        verification_link = f"https://study-portal-ill8.onrender.com/api/verify-email?token={token}"

        msg = Message(
            subject="Verify Your Study Portal Account",
            recipients=[to_email],
            html=f"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Welcome, {name}! 👋</h2>
                <p>Thank you for registering at Study Portal.</p>
                <p>Click the button below to verify your email:</p>
                <a href="{verification_link}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy this link: <span style="color: #4f46e5;">{verification_link}</span></p>
                <p>This link expires in 24 hours.</p>
                <hr>
                <p style="color: #999; font-size: 12px;">© 2026 Study Portal</p>
            </body>
            </html>
            """,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        mail.send(msg)
        print(f" Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f" Email sending failed: {str(e)}")
        traceback.print_exc()
        return False


def send_password_reset_email(to_email, token, name):
    try:
        reset_link = f"https://study-portal-app.vercel.app/reset-password?token={token}"

        print(f"📧 Password reset for: {to_email}")
        print(f"🔗 Reset link: {reset_link}")

        msg = Message(
            subject="Reset Your Study Portal Password",
            recipients=[to_email],
            html=f"""
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Password Reset Request</h2>
                <p>Click <a href="{reset_link}">here</a> to reset your password.</p>
                <p>Or copy this link: {reset_link}</p>
                <p>Link expires in 1 hour.</p>
            </div>
            """,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        mail.send(msg)
        print(f" Email sent to {to_email}")
        return True

    except Exception as e:
        print(f" Email failed: {str(e)}")
        return True
