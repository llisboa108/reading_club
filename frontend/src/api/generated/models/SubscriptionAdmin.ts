/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Plan } from './Plan';
import type { StatusB05Enum } from './StatusB05Enum';
export type SubscriptionAdmin = {
    readonly id: number;
    readonly user_id: number;
    readonly member_email: string;
    readonly member_name: string;
    readonly status: StatusB05Enum;
    readonly plan: Plan;
    /**
     * Preço mensal personalizado, substituindo o preço do plano. Vale até ser removido pelo administrador.
     */
    custom_price?: string | null;
    /**
     * Acréscimo pontual somado apenas à próxima cobrança gerada. É zerado automaticamente depois de gerar esse pagamento.
     */
    surcharge_amount?: string | null;
    /**
     * Motivo do acréscimo (ex.: 'Projeto X'). Aparece nas notas do pagamento.
     */
    surcharge_reason?: string;
    readonly effective_base_price: string;
    readonly start_date: string;
    readonly end_date: string;
    readonly next_billing_date: string;
};

