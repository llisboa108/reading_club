/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetTypeEnum } from './MeetTypeEnum';
export type MeetWriteRequest = {
    reading: number;
    moderator?: number | null;
    meet_date: string;
    start_page?: number | null;
    end_page?: number | null;
    meet_type?: MeetTypeEnum;
    meeting_link?: string;
    address?: string;
};

