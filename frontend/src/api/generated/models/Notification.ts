/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TypeEnum } from './TypeEnum';
export type Notification = {
    readonly id: number;
    type: TypeEnum;
    message: string;
    is_seen?: boolean;
    readonly created_at: string;
    readonly target_type: string | null;
    readonly target_id: number;
};

