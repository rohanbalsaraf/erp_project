import os
import sys
import django
from django.core.mail import send_mail
from dotenv import load_dotenv

# Ensure the project root is in the path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, '..'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'college_erp.settings')
django.setup()

def send_test_email():
    try:
        subject = 'College ERP - SMTP Connection Test'
        message = 'Congratulations! Your College ERP system is now successfully connected to Gmail SMTP. You can now send real emails to students and teachers.'
        from_email = os.getenv('EMAIL_HOST_USER')
        recipient_list = ['rohanbalsaraf9@gmail.com']

        print(f"Attempting to send test email from {from_email} to {recipient_list}...")
        
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
        print("SUCCESS: Test email sent! Check your inbox.")
    except Exception as e:
        print(f"FAILURE: Could not send email. Error: {str(e)}")

if __name__ == '__main__':
    send_test_email()
