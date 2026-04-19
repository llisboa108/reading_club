/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MethodEnum } from './MethodEnum';
export type PaymentCreateRequest = {
    amount: string;
    method?: MethodEnum;
    due_date: string;
    external_id?: string | null;
    receipt?: Blob | null;
    notes?: string;
};

