/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatchedPaymentRequest } from '../models/PatchedPaymentRequest';
import type { PatchedPlanWriteRequest } from '../models/PatchedPlanWriteRequest';
import type { Payment } from '../models/Payment';
import type { PaymentAdmin } from '../models/PaymentAdmin';
import type { PaymentConfirmRequest } from '../models/PaymentConfirmRequest';
import type { PaymentCreate } from '../models/PaymentCreate';
import type { PaymentCreateRequest } from '../models/PaymentCreateRequest';
import type { PaymentRequest } from '../models/PaymentRequest';
import type { Plan } from '../models/Plan';
import type { PlanWrite } from '../models/PlanWrite';
import type { PlanWriteRequest } from '../models/PlanWriteRequest';
import type { Subscription } from '../models/Subscription';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BillingService {
    /**
     * @returns Payment
     * @throws ApiError
     */
    public static paymentsList(): CancelablePromise<Array<Payment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/payments/',
        });
    }
    /**
     * @param requestBody
     * @returns PaymentCreate
     * @throws ApiError
     */
    public static paymentsCreate(
        requestBody: PaymentCreateRequest,
    ): CancelablePromise<PaymentCreate> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/billing/payments/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Confirm a payment
     * Confirms a pending payment. Only financial users can perform this action.
     * @param paymentId
     * @param requestBody
     * @returns any No response body
     * @throws ApiError
     */
    public static paymentsConfirm(
        paymentId: number,
        requestBody: PaymentConfirmRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/billing/payments/{payment_id}/confirm/',
            path: {
                'payment_id': paymentId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Create a Mercado Pago checkout preference for a payment
     * Creates a Checkout Pro preference for one of the caller's own pending payments and returns the checkout URL to redirect to.
     * @param paymentId
     * @returns any No response body
     * @throws ApiError
     */
    public static paymentsMercadoPagoPreference(
        paymentId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/billing/payments/{payment_id}/mercadopago-preference/',
            path: {
                'payment_id': paymentId,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este payment.
     * @returns Payment
     * @throws ApiError
     */
    public static paymentsRetrieve(
        id: number,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/payments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este payment.
     * @param requestBody
     * @returns Payment
     * @throws ApiError
     */
    public static billingPaymentsUpdate(
        id: number,
        requestBody: PaymentRequest,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/billing/payments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este payment.
     * @param requestBody
     * @returns Payment
     * @throws ApiError
     */
    public static billingPaymentsPartialUpdate(
        id: number,
        requestBody?: PatchedPaymentRequest,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/billing/payments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este payment.
     * @returns void
     * @throws ApiError
     */
    public static billingPaymentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/billing/payments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List pending payments across all members
     * Only financial staff can list every member's pending payments.
     * @returns PaymentAdmin
     * @throws ApiError
     */
    public static paymentsPendingList(): CancelablePromise<Array<PaymentAdmin>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/payments/pending/',
        });
    }
    /**
     * @returns Plan
     * @throws ApiError
     */
    public static planList(): CancelablePromise<Array<Plan>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/plans/',
        });
    }
    /**
     * @param requestBody
     * @returns PlanWrite
     * @throws ApiError
     */
    public static billingPlansCreate(
        requestBody: PlanWriteRequest,
    ): CancelablePromise<PlanWrite> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/billing/plans/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este plan.
     * @returns Plan
     * @throws ApiError
     */
    public static planRetrieve(
        id: number,
    ): CancelablePromise<Plan> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/plans/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este plan.
     * @param requestBody
     * @returns PlanWrite
     * @throws ApiError
     */
    public static billingPlansUpdate(
        id: number,
        requestBody: PlanWriteRequest,
    ): CancelablePromise<PlanWrite> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/billing/plans/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este plan.
     * @param requestBody
     * @returns PlanWrite
     * @throws ApiError
     */
    public static billingPlansPartialUpdate(
        id: number,
        requestBody?: PatchedPlanWriteRequest,
    ): CancelablePromise<PlanWrite> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/billing/plans/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id Um valor inteiro único que identifica este plan.
     * @returns void
     * @throws ApiError
     */
    public static billingPlansDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/billing/plans/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Subscription
     * @throws ApiError
     */
    public static billingSubscriptionRetrieve(): CancelablePromise<Subscription> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/billing/subscription/',
        });
    }
}
