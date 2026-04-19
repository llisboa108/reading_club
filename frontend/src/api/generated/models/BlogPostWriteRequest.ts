/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BlogPostWriteRequest = {
    title: string;
    slug: string;
    content: string;
    /**
     * Optional cover image
     */
    image?: Blob | null;
    category?: number | null;
    is_published?: boolean;
    published_at?: string | null;
};

