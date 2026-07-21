import httpx

OPEN_LIBRARY_API_URL = "https://openlibrary.org/api/books"


class ISBNLookupError(Exception):
    """Raised when the external ISBN lookup service can't be reached."""


class ISBNNotFoundError(ISBNLookupError):
    """Raised when no book is found for the given ISBN."""


def fetch_book_metadata(isbn: str) -> dict:
    bibkey = f"ISBN:{isbn}"
    try:
        response = httpx.get(
            OPEN_LIBRARY_API_URL,
            params={"bibkeys": bibkey, "format": "json", "jscmd": "data"},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError as exc:
        raise ISBNLookupError("Could not reach the ISBN lookup service.") from exc

    book = data.get(bibkey)
    if not book:
        raise ISBNNotFoundError(f"No book found for ISBN {isbn}.")

    cover = book.get("cover") or {}
    authors = book.get("authors") or []
    publishers = book.get("publishers") or []

    return {
        "title": book.get("title", ""),
        "subtitle": book.get("subtitle", ""),
        "published_date": _normalize_published_date(book.get("publish_date")),
        "pages": book.get("number_of_pages"),
        "cover_url": cover.get("large") or cover.get("medium") or cover.get("small"),
        "author_name": authors[0]["name"] if authors else None,
        "publisher_name": publishers[0]["name"] if publishers else "",
    }


def _normalize_published_date(value):
    """Open Library's publish_date is a free-text string - sometimes just
    a year ("1997"), sometimes "Jul 1997" or a full date. Django's
    DateField needs YYYY-MM-DD, so anything we can't confidently parse
    down to at least a year is left blank for the admin to fill in."""
    if not value:
        return None

    digits = "".join(ch for ch in value if ch.isdigit() or ch == "-")
    parts = [p for p in digits.split("-") if p]
    if not parts:
        return None

    year = parts[0]
    if len(year) != 4:
        return None

    month = parts[1] if len(parts) > 1 else "01"
    day = parts[2] if len(parts) > 2 else "01"

    try:
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
    except ValueError:
        return None


def split_author_name(full_name: str) -> tuple[str, str]:
    """Best-effort split of a full name into (first_name, last_name):
    the last word is treated as the surname. Doesn't handle compound
    surnames correctly, but is good enough for pre-filling a form the
    admin can still edit."""
    parts = full_name.strip().rsplit(" ", 1)
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]
