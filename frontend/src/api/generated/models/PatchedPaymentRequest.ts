/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MethodEnum } from './MethodEnum';
import type { PaymentStatusEnum } from './PaymentStatusEnum';
export type PatchedPaymentRequest = {
    amount?: string;
    method?: MethodEnum;
    status?: PaymentStatusEnum;
    due_date?: string;
    paid_at?: string | null;
    notes?: string;
    receipt?: Blob | null;
};

