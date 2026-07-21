/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlanWriteRequest = {
    name: string;
    description?: string;
    price: string;
    is_active?: boolean;
    /**
     * Default plan for new users
     */
    is_default?: boolean;
};

