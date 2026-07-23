from django.contrib import admin
from django.utils import timezone
from .models import (
    Author,
    Publisher,
    Book,
    Reading,
    ReadingUser,
    Meet,
    MeetUser,
    MeetPhoto,
    Notification,
    BlogCategory,
    BlogPost,
    Quote,
    ContactMessage,
    TeamMember,
    TimelineEntry,
)

# Admin Books
@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name")
    search_fields = ("first_name", "last_name")

@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "publisher", "pages")
    list_filter = ("publisher", "author")
    search_fields = ("title", "isbn")


# Admin Readings
class ReadingUserInline(admin.TabularInline):
    model = ReadingUser
    extra = 1

@admin.register(Reading)
class ReadingAdmin(admin.ModelAdmin):
    list_display = ("book", "status", "start_date", "end_date")
    list_filter = ("status",)
    date_hierarchy = "start_date"
    inlines = [ReadingUserInline]

# Admin Meetings
class MeetUserInline(admin.TabularInline):
    model = MeetUser
    extra = 1

class MeetPhotoInline(admin.TabularInline):
    model = MeetPhoto
    extra = 1

@admin.register(Meet)
class MeetAdmin(admin.ModelAdmin):
    list_display = ("reading", "meet_date", "meet_type", "moderator")
    list_filter = ("meet_type",)
    date_hierarchy = "meet_date"
    inlines = [MeetUserInline, MeetPhotoInline]


# Admin Notifications
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "is_seen", "created_at")
    list_filter = ("type", "is_seen")
    search_fields = ("user__email", "message")
    readonly_fields = ("created_at",)


# Admin Blog
@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "is_published", "published_at")
    list_filter = ("is_published", "category")
    search_fields = ("title", "content")
    prepopulated_fields = {"slug": ("title",)}

    actions = ["publish_posts"]

    def publish_posts(self, request, queryset):
        queryset.update(
            is_published=True,
            published_at=timezone.now()
        )

    publish_posts.short_description = "Publish selected posts"


# Admin — landing page quotes carousel
@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ("__str__", "attribution", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("text", "attribution")


# Admin — landing page contact/inquiry submissions
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)


# Admin — landing page team grid
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "role")


# Admin — landing page history timeline
@admin.register(TimelineEntry)
class TimelineEntryAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title", "description")

