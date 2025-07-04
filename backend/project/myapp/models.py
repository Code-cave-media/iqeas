from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=255, default='user')
    def __str__(self):
        return self.username