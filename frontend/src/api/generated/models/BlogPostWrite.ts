/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BlogPostWrite = {
    title: string;
    slug: string;
    content: string;
    /**
     * Optional cover image
     */
    image?: string | null;
    category?: number | null;
    is_published?: boolean;
    published_at?: string | null;
};

