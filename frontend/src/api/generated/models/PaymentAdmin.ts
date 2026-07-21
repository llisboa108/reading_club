/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MethodEnum } from './MethodEnum';
import type { Status5d9Enum } from './Status5d9Enum';
export type PaymentAdmin = {
    readonly id: number;
    readonly member_email: string;
    readonly member_name: string;
    amount: string;
    method?: MethodEnum;
    readonly method_display: string;
    readonly status: Status5d9Enum;
    readonly status_display: string;
    readonly issued_at: string;
    due_date: string;
    readonly paid_at: string | null;
    notes?: string;
    receipt?: string | null;
};

