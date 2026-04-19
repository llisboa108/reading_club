/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MethodEnum } from './MethodEnum';
import type { PaymentStatusEnum } from './PaymentStatusEnum';
export type Payment = {
    readonly id: number;
    amount: string;
    method?: MethodEnum;
    readonly method_display: string;
    status?: PaymentStatusEnum;
    readonly status_display: string;
    readonly issued_at: string;
    due_date: string;
    paid_at?: string | null;
    notes?: string;
    receipt?: string | null;
};

