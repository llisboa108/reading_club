/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Book } from './Book';
import type { Member } from './Member';
import type { ReadingUser } from './ReadingUser';
import type { Status8ecEnum } from './Status8ecEnum';
export type Reading = {
    readonly id: number;
    book: Book;
    readonly suggested_by: Member;
    start_date: string;
    end_date?: string | null;
    status?: Status8ecEnum;
    readonly participants: Array<ReadingUser>;
};

