
# Create your models here.
from djongo import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('citizen', 'Citizen'),
        ('admin', 'Admin'),
        ('officer', 'Officer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    region = models.CharField(max_length=100, blank=True, null=True)
    REQUIRED_FIELDS = ['email', 'role']
