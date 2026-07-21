/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MethodEnum } from './MethodEnum';
export type PatchedPaymentRequest = {
    amount?: string;
    method?: MethodEnum;
    due_date?: string;
    notes?: string;
    receipt?: Blob | null;
};

