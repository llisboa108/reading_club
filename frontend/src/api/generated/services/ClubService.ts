/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Author } from '../models/Author';
import type { AuthorRequest } from '../models/AuthorRequest';
import type { BlogCategory } from '../models/BlogCategory';
import type { BlogPostDetail } from '../models/BlogPostDetail';
import type { BlogPostList } from '../models/BlogPostList';
import type { BlogPostWrite } from '../models/BlogPostWrite';
import type { BlogPostWriteRequest } from '../models/BlogPostWriteRequest';
import type { Book } from '../models/Book';
import type { BookWrite } from '../models/BookWrite';
import type { BookWriteRequest } from '../models/BookWriteRequest';
import type { Meet } from '../models/Meet';
import type { MeetWrite } from '../models/MeetWrite';
import type { MeetWriteRequest } from '../models/MeetWriteRequest';
import type { Notification } from '../models/Notification';
import type { PatchedAuthorRequest } from '../models/PatchedAuthorRequest';
import type { PatchedBlogPostWriteRequest } from '../models/PatchedBlogPostWriteRequest';
import type { PatchedBookWriteRequest } from '../models/PatchedBookWriteRequest';
import type { PatchedMeetWriteRequest } from '../models/PatchedMeetWriteRequest';
import type { PatchedPublisherRequest } from '../models/PatchedPublisherRequest';
import type { PatchedReadingWriteRequest } from '../models/PatchedReadingWriteRequest';
import type { Publisher } from '../models/Publisher';
import type { PublisherRequest } from '../models/PublisherRequest';
import type { Reading } from '../models/Reading';
import type { ReadingWrite } from '../models/ReadingWrite';
import type { ReadingWriteRequest } from '../models/ReadingWriteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClubService {
    /**
     * @returns Author
     * @throws ApiError
     */
    public static clubAuthorsList(): CancelablePromise<Array<Author>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/authors/',
        });
    }
    /**
     * @param requestBody
     * @returns Author
     * @throws ApiError
     */
    public static clubAuthorsCreate(
        requestBody: AuthorRequest,
    ): CancelablePromise<Author> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/authors/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este author.
     * @returns Author
     * @throws ApiError
     */
    public static clubAuthorsRetrieve(
        id: number,
    ): CancelablePromise<Author> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/authors/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este author.
     * @param requestBody
     * @returns Author
     * @throws ApiError
     */
    public static clubAuthorsUpdate(
        id: number,
        requestBody: AuthorRequest,
    ): CancelablePromise<Author> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/authors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este author.
     * @param requestBody
     * @returns Author
     * @throws ApiError
     */
    public static clubAuthorsPartialUpdate(
        id: number,
        requestBody?: PatchedAuthorRequest,
    ): CancelablePromise<Author> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/authors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este author.
     * @returns void
     * @throws ApiError
     */
    public static clubAuthorsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/authors/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns BlogPostList
     * @throws ApiError
     */
    public static clubBlogList(): CancelablePromise<Array<BlogPostList>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/blog/',
        });
    }
    /**
     * @param formData
     * @returns BlogPostWrite
     * @throws ApiError
     */
    public static clubBlogCreate(
        formData: BlogPostWriteRequest,
    ): CancelablePromise<BlogPostWrite> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/blog/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @returns BlogCategory
     * @throws ApiError
     */
    public static clubBlogCategoriesList(): CancelablePromise<Array<BlogCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/blog-categories/',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este blog category.
     * @returns BlogCategory
     * @throws ApiError
     */
    public static clubBlogCategoriesRetrieve(
        id: number,
    ): CancelablePromise<BlogCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/blog-categories/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param slug
     * @returns BlogPostDetail
     * @throws ApiError
     */
    public static clubBlogRetrieve(
        slug: string,
    ): CancelablePromise<BlogPostDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/blog/{slug}/',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * @param slug
     * @param formData
     * @returns BlogPostWrite
     * @throws ApiError
     */
    public static clubBlogUpdate(
        slug: string,
        formData: BlogPostWriteRequest,
    ): CancelablePromise<BlogPostWrite> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/blog/{slug}/',
            path: {
                'slug': slug,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param slug
     * @param formData
     * @returns BlogPostWrite
     * @throws ApiError
     */
    public static clubBlogPartialUpdate(
        slug: string,
        formData?: PatchedBlogPostWriteRequest,
    ): CancelablePromise<BlogPostWrite> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/blog/{slug}/',
            path: {
                'slug': slug,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param slug
     * @returns void
     * @throws ApiError
     */
    public static clubBlogDestroy(
        slug: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/blog/{slug}/',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * @returns Book
     * @throws ApiError
     */
    public static clubBooksList(): CancelablePromise<Array<Book>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/books/',
        });
    }
    /**
     * @param formData
     * @returns BookWrite
     * @throws ApiError
     */
    public static clubBooksCreate(
        formData: BookWriteRequest,
    ): CancelablePromise<BookWrite> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/books/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este book.
     * @returns Book
     * @throws ApiError
     */
    public static clubBooksRetrieve(
        id: number,
    ): CancelablePromise<Book> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/books/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este book.
     * @param formData
     * @returns BookWrite
     * @throws ApiError
     */
    public static clubBooksUpdate(
        id: number,
        formData: BookWriteRequest,
    ): CancelablePromise<BookWrite> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/books/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este book.
     * @param formData
     * @returns BookWrite
     * @throws ApiError
     */
    public static clubBooksPartialUpdate(
        id: number,
        formData?: PatchedBookWriteRequest,
    ): CancelablePromise<BookWrite> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/books/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este book.
     * @returns void
     * @throws ApiError
     */
    public static clubBooksDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/books/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Look up book metadata by ISBN
     * Queries the Google Books API for the given ISBN and returns book metadata (title, author, publisher, cover, etc.) to pre-fill the create-book form. Get-or-creates the matching Author/Publisher by name so the frontend can select them immediately. Admin-only.
     * @returns any No response body
     * @throws ApiError
     */
    public static booksLookupIsbn(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/books/lookup-isbn/',
        });
    }
    /**
     * @returns Meet
     * @throws ApiError
     */
    public static clubMeetsList(): CancelablePromise<Array<Meet>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/meets/',
        });
    }
    /**
     * @param requestBody
     * @returns MeetWrite
     * @throws ApiError
     */
    public static clubMeetsCreate(
        requestBody: MeetWriteRequest,
    ): CancelablePromise<MeetWrite> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/meets/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este meet.
     * @returns Meet
     * @throws ApiError
     */
    public static clubMeetsRetrieve(
        id: number,
    ): CancelablePromise<Meet> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/meets/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este meet.
     * @param requestBody
     * @returns MeetWrite
     * @throws ApiError
     */
    public static clubMeetsUpdate(
        id: number,
        requestBody: MeetWriteRequest,
    ): CancelablePromise<MeetWrite> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/meets/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este meet.
     * @param requestBody
     * @returns MeetWrite
     * @throws ApiError
     */
    public static clubMeetsPartialUpdate(
        id: number,
        requestBody?: PatchedMeetWriteRequest,
    ): CancelablePromise<MeetWrite> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/meets/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este meet.
     * @returns void
     * @throws ApiError
     */
    public static clubMeetsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/meets/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Notification
     * @throws ApiError
     */
    public static clubNotificationsList(): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/notifications/',
        });
    }
    /**
     * @param id
     * @returns Notification
     * @throws ApiError
     */
    public static clubNotificationsRetrieve(
        id: string,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/notifications/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mark a notification as seen
     * @param id
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsMarkSeen(
        id: string,
    ): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/notifications/{id}/mark-seen/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Publisher
     * @throws ApiError
     */
    public static clubPublishersList(): CancelablePromise<Array<Publisher>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/publishers/',
        });
    }
    /**
     * @param requestBody
     * @returns Publisher
     * @throws ApiError
     */
    public static clubPublishersCreate(
        requestBody: PublisherRequest,
    ): CancelablePromise<Publisher> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/publishers/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este publisher.
     * @returns Publisher
     * @throws ApiError
     */
    public static clubPublishersRetrieve(
        id: number,
    ): CancelablePromise<Publisher> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/publishers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este publisher.
     * @param requestBody
     * @returns Publisher
     * @throws ApiError
     */
    public static clubPublishersUpdate(
        id: number,
        requestBody: PublisherRequest,
    ): CancelablePromise<Publisher> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/publishers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este publisher.
     * @param requestBody
     * @returns Publisher
     * @throws ApiError
     */
    public static clubPublishersPartialUpdate(
        id: number,
        requestBody?: PatchedPublisherRequest,
    ): CancelablePromise<Publisher> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/publishers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este publisher.
     * @returns void
     * @throws ApiError
     */
    public static clubPublishersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/publishers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Reading
     * @throws ApiError
     */
    public static clubReadingsList(): CancelablePromise<Array<Reading>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/readings/',
        });
    }
    /**
     * @param requestBody
     * @returns ReadingWrite
     * @throws ApiError
     */
    public static clubReadingsCreate(
        requestBody: ReadingWriteRequest,
    ): CancelablePromise<ReadingWrite> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/club/readings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este reading.
     * @returns Reading
     * @throws ApiError
     */
    public static clubReadingsRetrieve(
        id: number,
    ): CancelablePromise<Reading> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/club/readings/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este reading.
     * @param requestBody
     * @returns ReadingWrite
     * @throws ApiError
     */
    public static clubReadingsUpdate(
        id: number,
        requestBody: ReadingWriteRequest,
    ): CancelablePromise<ReadingWrite> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/club/readings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este reading.
     * @param requestBody
     * @returns ReadingWrite
     * @throws ApiError
     */
    public static clubReadingsPartialUpdate(
        id: number,
        requestBody?: PatchedReadingWriteRequest,
    ): CancelablePromise<ReadingWrite> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/club/readings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este reading.
     * @returns void
     * @throws ApiError
     */
    public static clubReadingsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/club/readings/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
