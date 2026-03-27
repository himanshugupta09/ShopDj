import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom.settings')

app = Celery('ecom')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically discover tasks in all installed apps (store, users, orders)
app.autodiscover_tasks()