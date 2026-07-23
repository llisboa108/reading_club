/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubscriptionAdminWrite = {
    plan: number;
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
};

