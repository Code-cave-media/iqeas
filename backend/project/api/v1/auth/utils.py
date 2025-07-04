from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime

def send_welcome_email(username, password, to_email , pk_Id):
    html_template = Template("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Welcome to Our Platform</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f6f9;
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        h1 {
          color: #2c3e50;
          text-align: center;
        }
        p {
          font-size: 16px;
          color: #555;
        }
        .credentials {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          font-family: monospace;
        }
        .btn {
          display: inline-block;
          padding: 12px 20px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          text-align: center;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #aaa;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Welcome to Our Platform</h1>
        <p>Hi <strong>{{ username }}</strong>,</p>

        <p>We're thrilled to have you on board! Your account has been successfully created.</p>

        <div class="credentials">
          <p><strong>Username:</strong> {{ username }}</p>
          <p><strong>Password:</strong> {{ password }}</p>
        </div>

        <p>Click the button below to create your own password and login:</p>
        <a href="http://127.0.0.1:8000/api/v1/auth/user/update/password/{{pk_Id}}/">Click Here</a>
       

        <p>If you did not request this account, please ignore this email.</p>

      </div>
    </body>
    </html>
    """)

    context = Context({
        'username': username,
        'password': password,
        'pk_Id' : pk_Id,
        'current_year': datetime.now().year,
    })

    html_message = html_template.render(context)

    subject = 'Welcome to Our Site'
    text_message = f"Welcome {username}, your account has been created.\nUsername: {username}\nPassword: {password}"
    from_email = settings.DEFAULT_FROM_EMAIL

    email = EmailMultiAlternatives(subject, text_message, from_email, [to_email])
    email.attach_alternative(html_message, "text/html")
    email.send()
