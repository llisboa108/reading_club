/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Plan } from './Plan';
import type { SubscriptionStatusEnum } from './SubscriptionStatusEnum';
export type Subscription = {
    readonly id: number;
    status?: SubscriptionStatusEnum;
    plan: Plan;
    start_date: string;
    end_date: string;
    next_billing_date: string;
};

