/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status8ecEnum } from './Status8ecEnum';
export type PatchedReadingWriteRequest = {
    book?: number;
    suggested_by?: number | null;
    start_date?: string;
    end_date?: string | null;
    status?: Status8ecEnum;
    users?: Array<number>;
};

