/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogCategory } from './BlogCategory';
export type BlogPostList = {
    readonly id: number;
    title: string;
    slug: string;
    readonly author: string;
    category: BlogCategory;
    image: string;
    published_at?: string | null;
};

