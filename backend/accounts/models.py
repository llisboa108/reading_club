from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

# Customized user manager to not use usernamo
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.pop("username", None)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.pop("username", None)  # ← ESSENCIAL
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa ter is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa ter is_superuser=True")

        return self._create_user(email, password, **extra_fields)

# User Model
class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    is_financial = models.BooleanField(
        default=False,
        help_text="User responsible for financial operations"
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    

# Porfile model
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    full_name = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to="profiles/", blank=True, null=True)

    phone = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)

    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name or self.user.email


# Unique code, only for members
class InviteCode(models.Model):
    code = models.CharField(
        max_length=50,
        unique=True
    )

    is_active = models.BooleanField(default=True)

    max_uses = models.PositiveIntegerField(
        default=1,
        help_text="How many times this code can be used"
    )

    used_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def can_be_used(self) -> bool:
        return self.is_active and self.used_count < self.max_uses

    def register_use(self):
        self.used_count += 1
        if self.used_count >= self.max_uses:
            self.is_active = False
        self.save(update_fields=["used_count", "is_active"])

    def __str__(self):
        return f"{self.code} ({self.used_count}/{self.max_uses})"