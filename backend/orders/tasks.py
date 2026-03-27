from celery import shared_task
from django.core.mail import send_mail
from .models import Order

@shared_task
def send_order_success_email(order_id, user_email):
    order = Order.objects.get(id=order_id)
    subject = f"Order #{order.id} Confirmed! 🎉"
    message = f"Thank you for your purchase of ${order.total_price}."
    
    # This runs in the background while the user continues browsing
    send_mail(subject, message, 'noreply@shopdj.com', [user_email])