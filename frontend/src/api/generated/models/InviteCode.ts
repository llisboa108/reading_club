/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InviteCode = {
    readonly id: number;
    code: string;
    is_active?: boolean;
    /**
     * How many times this code can be used
     */
    max_uses?: number;
    readonly used_count: number;
    readonly created_at: string;
};

