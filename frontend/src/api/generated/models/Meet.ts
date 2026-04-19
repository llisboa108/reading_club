/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeetPhoto } from './MeetPhoto';
import type { MeetTypeEnum } from './MeetTypeEnum';
import type { MeetUser } from './MeetUser';
export type Meet = {
    readonly id: number;
    reading: number;
    readonly moderator: string;
    meet_date: string;
    start_page?: number | null;
    end_page?: number | null;
    meet_type?: MeetTypeEnum;
    meeting_link?: string;
    address?: string;
    readonly participants: Array<MeetUser>;
    readonly photos: Array<MeetPhoto>;
};

