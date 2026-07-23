/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Plan } from './Plan';
import type { StatusB05Enum } from './StatusB05Enum';
export type Subscription = {
    readonly id: number;
    status?: StatusB05Enum;
    plan: Plan;
    start_date: string;
    end_date: string;
    next_billing_date: string;
};

