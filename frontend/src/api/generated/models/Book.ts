/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Author } from './Author';
import type { Publisher } from './Publisher';
export type Book = {
    readonly id: number;
    title: string;
    subtitle?: string;
    isbn?: string;
    published_date?: string | null;
    pages: number;
    author: Author;
    publisher: Publisher;
    cover?: string | null;
};

