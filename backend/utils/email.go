package utils

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// SendVerificationEmail sends the 6-digit verification code to the recipient's Gmail
func SendVerificationEmail(toEmail, code string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_FROM")

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	if smtpPort == "" {
		smtpPort = "587"
	}
	if fromEmail == "" {
		fromEmail = smtpUser
	}

	// If SMTP credentials are not configured in environment, log instructions and return nil
	if smtpUser == "" || smtpPass == "" {
		log.Printf("[EMAIL SERVICE] SMTP_USER or SMTP_PASS not set. Simulation: Email with code [%s] intended for %s. (Set SMTP_USER and SMTP_PASS in backend/.env for real dispatch)", code, toEmail)
		return nil
	}

	subject := "Your PulsePoll Verification Code"
	body := fmt.Sprintf(`From: PulsePoll <%s>
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { background-color: #ffffff; max-width: 480px; margin: 0 auto; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
    .code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 14px 24px; border-radius: 12px; display: inline-block; margin: 20px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color: #0f172a; margin-top: 0;">Verify your Gmail account</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">Welcome to PulsePoll. Please use the following 6-digit verification code to complete your registration:</p>
    <div style="text-align: center;">
      <div class="code">%s</div>
    </div>
    <p style="color: #64748b; font-size: 13px;">This code will expire in 15 minutes. If you did not request this verification, you can safely ignore this email.</p>
    <div class="footer">
      PulsePoll — Zero-latency Real-Time Polling Engine
    </div>
  </div>
</body>
</html>
`, fromEmail, toEmail, subject, code)

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	// Dispatch email
	go func() {
		// Use TLS handshake if on port 465, or STARTTLS on 587
		if smtpPort == "465" {
			tlsConfig := &tls.Config{
				InsecureSkipVerify: false,
				ServerName:         smtpHost,
			}
			conn, err := tls.Dial("tcp", addr, tlsConfig)
			if err != nil {
				log.Printf("[EMAIL ERROR] TLS connection failed: %v", err)
				return
			}
			client, err := smtp.NewClient(conn, smtpHost)
			if err != nil {
				log.Printf("[EMAIL ERROR] Failed creating SMTP client: %v", err)
				return
			}
			defer client.Quit()

			if err = client.Auth(auth); err != nil {
				log.Printf("[EMAIL ERROR] SMTP auth failed: %v", err)
				return
			}
			if err = client.Mail(fromEmail); err != nil {
				log.Printf("[EMAIL ERROR] MAIL FROM failed: %v", err)
				return
			}
			if err = client.Rcpt(toEmail); err != nil {
				log.Printf("[EMAIL ERROR] RCPT TO failed: %v", err)
				return
			}
			w, err := client.Data()
			if err != nil {
				log.Printf("[EMAIL ERROR] DATA command failed: %v", err)
				return
			}
			_, _ = w.Write([]byte(body))
			_ = w.Close()
			log.Printf("[EMAIL SERVICE] Verification email successfully sent via TLS to %s", toEmail)
		} else {
			err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, []byte(body))
			if err != nil {
				log.Printf("[EMAIL ERROR] Failed to send verification email to %s: %v", toEmail, err)
			} else {
				log.Printf("[EMAIL SERVICE] Verification email successfully sent to %s", toEmail)
			}
		}
	}()

	return nil
}
