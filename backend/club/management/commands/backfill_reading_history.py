import itertools
import random
import re
from datetime import date, datetime, time, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import User
from club.management.commands.reading_history_data import BOOKS
from club.models import (
    Author,
    Book,
    Meet,
    MeetType,
    MeetUser,
    Publisher,
    Reading,
    ReadingStatus,
    ReadingUser,
    TeamMember,
)

# Only the first N books (real chronological order) are actually finished;
# the rest are currently-being-read/future and get a Book entry only.
FINISHED_BOOK_COUNT = 61

BR_TZ = ZoneInfo("America/Sao_Paulo")
ONLINE_LOCAL_TIME = time(19, 0)
IN_PERSON_LOCAL_TIME = time(15, 0)

# The club's "férias literárias" run December-February (see LandingAbout.tsx
# copy); March-November is the only active season a meet can fall in.
SEASON_START_MONTH, SEASON_END_MONTH = 3, 11

# First Tuesday shortly after the club's real August 2018 founding.
SCHEDULE_START_DATE = date(2018, 9, 4)
SCHEDULE_SEED = 20180901


def _to_utc(local_date, local_time):
    return datetime.combine(local_date, local_time, tzinfo=BR_TZ).astimezone(ZoneInfo("UTC"))


def _in_season(d):
    return SEASON_START_MONTH <= d.month <= SEASON_END_MONTH


def _skip_to_season(d):
    if d.month == 12:
        return date(d.year + 1, SEASON_START_MONTH, 1)
    if d.month < SEASON_START_MONTH:
        return date(d.year, SEASON_START_MONTH, 1)
    return d


def _next_tuesday_on_or_after(d):
    return d + timedelta(days=(1 - d.weekday()) % 7)


def _build_schedule(n, start, seed):
    rng = random.Random(seed)
    cursor = start
    schedule = []

    for _ in range(n):
        cursor = _skip_to_season(cursor)
        first_tue = _next_tuesday_on_or_after(cursor)
        second_tue = first_tue + timedelta(days=7)
        third_tue = first_tue + timedelta(days=14)

        # Don't let a late-season book's meets bleed into the vacation
        # window; push the whole book to next season instead.
        if not _in_season(third_tue) or not _in_season(third_tue + timedelta(days=19)):
            cursor = _skip_to_season(date(third_tue.year, 12, 1))
            first_tue = _next_tuesday_on_or_after(cursor)
            second_tue = first_tue + timedelta(days=7)
            third_tue = first_tue + timedelta(days=14)

        # In-person meet: usually the Sunday right after the 3rd online
        # meet, occasionally a nearby weekend day ("pode variar").
        offset_days = rng.choices([5, 4, 12], weights=[75, 15, 10])[0]
        in_person = third_tue + timedelta(days=offset_days)
        if not _in_season(in_person):
            in_person = third_tue + timedelta(days=5)
        if not _in_season(in_person):
            in_person = date(third_tue.year, SEASON_END_MONTH, 30)

        schedule.append(
            {
                "online_dates": [first_tue, second_tue, third_tue],
                "in_person_date": in_person,
            }
        )

        gap = rng.randint(5, 14)
        cursor = in_person + timedelta(days=gap)

    return schedule


class Command(BaseCommand):
    help = (
        "Backfill real historical Books/Readings/Meets from "
        "reading_history_data.BOOKS, for demo/analytics data population."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run the full seed inside a transaction and roll it back at the end.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        self._validate_books()

        counts = {
            "books_created": 0,
            "readings_created": 0,
            "meets_created": 0,
            "reading_user_created": 0,
            "meet_user_created": 0,
            "members_created": 0,
        }

        with transaction.atomic():
            members = self._ensure_member_users(counts)
            schedule = _build_schedule(FINISHED_BOOK_COUNT, SCHEDULE_START_DATE, SCHEDULE_SEED)
            moderator_cycle = itertools.cycle(members)

            for index, data in enumerate(BOOKS):
                book = self._get_or_create_book(data, counts, dry_run)
                if index < FINISHED_BOOK_COUNT:
                    self._create_reading_with_meets(
                        book, schedule[index], members, moderator_cycle, counts
                    )

            if dry_run:
                self._print_plausibility_check(schedule)
                transaction.set_rollback(True)

        self._print_summary(counts, dry_run)

    def _validate_books(self):
        if len(BOOKS) != 65:
            raise CommandError(f"Expected 65 books in BOOKS, found {len(BOOKS)}.")

        isbns = [b["isbn"] for b in BOOKS]
        if len(set(isbns)) != len(isbns):
            dupes = {i for i in isbns if isbns.count(i) > 1}
            raise CommandError(f"Duplicate ISBNs in BOOKS: {dupes}")

        for i, data in enumerate(BOOKS):
            for field in ("title", "isbn", "author_first_name", "publisher_name", "pages"):
                if not data.get(field):
                    raise CommandError(f"Book #{i + 1} ({data.get('title')}) missing '{field}'.")

    def _ensure_member_users(self, counts):
        members = []
        for team_member in TeamMember.objects.filter(is_active=True).order_by("order", "created_at"):
            email = f"{slugify(team_member.name)}@membros.sonhosliterarios.local"
            user = User.objects.filter(email=email).first()
            if user is None:
                user = User.objects.create_user(email=email, password=None)
                user.profile.full_name = team_member.name
                user.profile.save()
                counts["members_created"] += 1

            year_match = re.search(r"\d{4}", team_member.role)
            year = int(year_match.group()) if year_match else 2018
            user.date_joined = datetime(year, 1, 1, 12, 0, tzinfo=ZoneInfo("UTC"))
            user.save(update_fields=["date_joined"])

            members.append(user)

        if not members:
            raise CommandError("No active TeamMember rows found - nothing to attach as attendees.")

        return members

    def _get_or_create_author(self, first_name, last_name):
        author = Author.objects.filter(
            first_name__iexact=first_name, last_name__iexact=last_name
        ).first()
        return author or Author.objects.create(first_name=first_name, last_name=last_name)

    def _get_or_create_publisher(self, name):
        publisher = Publisher.objects.filter(name__iexact=name).first()
        return publisher or Publisher.objects.create(name=name)

    def _get_or_create_book(self, data, counts, dry_run):
        author = self._get_or_create_author(data["author_first_name"], data["author_last_name"])
        publisher = self._get_or_create_publisher(data["publisher_name"])

        published_date = None
        if data.get("published_date"):
            published_date = datetime.strptime(data["published_date"], "%Y-%m-%d").date()

        book, created = Book.objects.get_or_create(
            isbn=data["isbn"],
            defaults={
                "title": data["title"],
                "subtitle": data.get("subtitle", ""),
                "pages": data["pages"],
                "published_date": published_date,
                "author": author,
                "publisher": publisher,
            },
        )

        if created:
            counts["books_created"] += 1
            if not dry_run:
                self._attach_cover_from_url(book, data.get("cover_url"))
            elif data.get("cover_url"):
                self.stdout.write(f"[dry-run] would download cover from {data['cover_url']}")

        return book

    def _attach_cover_from_url(self, book, url):
        if not url:
            return
        try:
            response = httpx.get(url, timeout=10)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            self.stdout.write(self.style.WARNING(f"Cover download failed for '{book.title}': {exc}"))
            return
        book.cover.save(f"{uuid4().hex}.jpg", ContentFile(response.content), save=True)

    def _create_reading_with_meets(self, book, book_schedule, members, moderator_cycle, counts):
        online_dates = book_schedule["online_dates"]
        in_person_date = book_schedule["in_person_date"]

        start_date = online_dates[0]
        end_date = in_person_date

        reading, created = Reading.objects.get_or_create(
            book=book,
            defaults={
                "start_date": start_date,
                "end_date": end_date,
                "status": ReadingStatus.FINISHED,
            },
        )
        if created:
            counts["readings_created"] += 1

        for member in members:
            _, ru_created = ReadingUser.objects.get_or_create(reading=reading, user=member)
            if ru_created:
                counts["reading_user_created"] += 1

        quarter = max(book.pages // 4, 1)
        meet_specs = []
        for i, meet_date in enumerate(online_dates):
            meet_specs.append(
                {
                    "meet_date": _to_utc(meet_date, ONLINE_LOCAL_TIME),
                    "meet_type": MeetType.ONLINE,
                    "start_page": i * quarter + 1,
                    "end_page": (i + 1) * quarter,
                }
            )
        meet_specs.append(
            {
                "meet_date": _to_utc(in_person_date, IN_PERSON_LOCAL_TIME),
                "meet_type": MeetType.IN_PERSON,
                "start_page": 3 * quarter + 1,
                "end_page": book.pages,
            }
        )

        for spec in meet_specs:
            moderator = next(moderator_cycle)
            meet, meet_created = Meet.objects.get_or_create(
                reading=reading,
                meet_date=spec["meet_date"],
                defaults={
                    "moderator": moderator,
                    "start_page": spec["start_page"],
                    "end_page": spec["end_page"],
                    "meet_type": spec["meet_type"],
                },
            )
            if meet_created:
                counts["meets_created"] += 1

            for member in members:
                _, mu_created = MeetUser.objects.get_or_create(meet=meet, user=member)
                if mu_created:
                    counts["meet_user_created"] += 1

    def _print_plausibility_check(self, schedule):
        last_meet_date = schedule[-1]["in_person_date"]
        today = timezone.localdate()
        delta_days = (today - last_meet_date).days

        if delta_days < 21:
            self.stdout.write(
                self.style.WARNING(
                    f"Book #{FINISHED_BOOK_COUNT}'s last meet ({last_meet_date}) is less than "
                    f"3 weeks before today ({today}) - consider tuning SCHEDULE_START_DATE."
                )
            )
        elif delta_days > 190:
            self.stdout.write(
                self.style.WARNING(
                    f"Book #{FINISHED_BOOK_COUNT}'s last meet ({last_meet_date}) is more than "
                    f"~6 months before today ({today}) - consider tuning SCHEDULE_START_DATE."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Book #{FINISHED_BOOK_COUNT}'s last meet lands on {last_meet_date} "
                    f"({delta_days} days before today) - plausible."
                )
            )

    def _print_summary(self, counts, dry_run):
        prefix = "[DRY RUN] " if dry_run else ""
        self.stdout.write(self.style.SUCCESS(f"{prefix}Members created: {counts['members_created']}"))
        self.stdout.write(self.style.SUCCESS(f"{prefix}Books created: {counts['books_created']}"))
        self.stdout.write(self.style.SUCCESS(f"{prefix}Readings created: {counts['readings_created']}"))
        self.stdout.write(self.style.SUCCESS(f"{prefix}Meets created: {counts['meets_created']}"))
        self.stdout.write(
            self.style.SUCCESS(f"{prefix}ReadingUser rows created: {counts['reading_user_created']}")
        )
        self.stdout.write(
            self.style.SUCCESS(f"{prefix}MeetUser rows created: {counts['meet_user_created']}")
        )
        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run complete - transaction rolled back, no changes saved."))
