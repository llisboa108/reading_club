from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AuthorViewSet,
    PublisherViewSet,
    BookViewSet,
    ReadingViewSet,
    MeetViewSet,
    NotificationViewSet,
    PublicBlogPostViewSet,
    BlogCategoryViewSet,
    PublicClubStatsView,
    QuoteViewSet,
    ContactMessageViewSet,
    TeamMemberViewSet,
    TimelineEntryViewSet,
)

router = DefaultRouter()
router.register("authors", AuthorViewSet, basename="authors")
router.register("publishers", PublisherViewSet, basename="publishers")
router.register("books", BookViewSet, basename="books")
router.register("readings", ReadingViewSet, basename="readings")
router.register("meets", MeetViewSet, basename="meets")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("blog", PublicBlogPostViewSet, basename="blog")
router.register("blog-categories", BlogCategoryViewSet, basename="blog-categories")
router.register("quotes", QuoteViewSet, basename="quotes")
router.register("contact-messages", ContactMessageViewSet, basename="contact-messages")
router.register("team-members", TeamMemberViewSet, basename="team-members")
router.register("timeline-entries", TimelineEntryViewSet, basename="timeline-entries")

urlpatterns = [
    path("public-stats/", PublicClubStatsView.as_view(), name="public-stats"),
]
urlpatterns += router.urls
