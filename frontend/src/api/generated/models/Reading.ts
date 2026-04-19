/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Book } from './Book';
import type { ReadingUser } from './ReadingUser';
import type { Status8ecEnum } from './Status8ecEnum';
export type Reading = {
    readonly id: number;
    book: Book;
    start_date: string;
    end_date?: string | null;
    status?: Status8ecEnum;
    readonly participants: Array<ReadingUser>;
};

