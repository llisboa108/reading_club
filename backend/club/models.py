from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

User = settings.AUTH_USER_MODEL


# Book Models
class Author(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

class Publisher(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=150, blank=True)
    isbn = models.CharField(max_length=20, blank=True, unique=True)
    published_date = models.DateField(blank=True, null=True)
    pages = models.PositiveIntegerField()

    author = models.ForeignKey(
        Author,
        on_delete=models.PROTECT,
        related_name="books"
    )

    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.PROTECT,
        related_name="books"
    )
    cover = models.ImageField(
        upload_to="books/covers/",
        blank=True,
        null=True,
        help_text="Imagem de capa do livro",
    )

    def __str__(self):
        return self.title


# Reading Models
class ReadingStatus(models.TextChoices):
    PLANNED = "PLANNED", "Planejada"
    IN_PROGRESS = "IN_PROGRESS", "Em andamento"
    FINISHED = "FINISHED", "Finalizada"
    CANCELED = "CANCELED", "Cancelada"


class Reading(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)

    suggested_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="suggested_readings"
    )

    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=ReadingStatus.choices,
        default=ReadingStatus.PLANNED
    )

    users = models.ManyToManyField(
        User,
        through="ReadingUser",
        related_name="readings"
    )

    def __str__(self):
        return f"{self.book.title} ({self.start_date})"


# Users that participate in the reading
class ReadingUser(models.Model):
    reading = models.ForeignKey(Reading, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reading", "user")


# Meetings models
class MeetType(models.TextChoices):
    ONLINE = "ONLINE", "Online"
    IN_PERSON = "IN_PERSON", "Presencial"


class Meet(models.Model):
    reading = models.ForeignKey(
        Reading,
        on_delete=models.CASCADE,
        related_name="meets"
    )

    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="moderated_meets"
    )

    meet_date = models.DateTimeField()

    start_page = models.PositiveIntegerField(blank=True, null=True)
    end_page = models.PositiveIntegerField(blank=True, null=True)

    meet_type = models.CharField(
        max_length=20,
        choices=MeetType.choices,
        default=MeetType.IN_PERSON
    )

    meeting_link = models.URLField(blank=True)
    address = models.CharField(max_length=255, blank=True)

    users = models.ManyToManyField(
        User,
        through="MeetUser",
        related_name="meets"
    )

    def __str__(self):
        return f"{self.reading.book.title} – {self.meet_date.date()}"


# Meet participants
class MeetUser(models.Model):
    meet = models.ForeignKey(Meet, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("meet", "user")

# Meet Photos
class MeetPhoto(models.Model):
    meet = models.ForeignKey(
        Meet,
        on_delete=models.CASCADE,
        related_name="photos"
    )

    image = models.ImageField(upload_to="meetings/")


# Notifications models
class NotificationType(models.TextChoices):
    PAYMENT = "PAYMENT", "Pagamento"
    MEET = "MEET", "Encontro"
    READING = "READING", "Leitura"
    SYSTEM = "SYSTEM", "Sistema"


class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )

    message = models.CharField(max_length=255)

    is_seen = models.BooleanField(default=False)

    # Optional link to the object this notification is about (a Payment,
    # Subscription, Meet, ...) so the frontend can navigate straight to it
    # instead of only routing generically by `type`. Nullable because not
    # every notification has (or needs) a specific related object.
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_type_display()} - {self.user}"
    

# Blog Models

class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="blog_posts"
    )

    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts"
    )

    content = models.TextField()

    image = models.ImageField(
        upload_to="blog/",
        blank=True,
        null=True,
        help_text="Optional cover image"
    )

    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
