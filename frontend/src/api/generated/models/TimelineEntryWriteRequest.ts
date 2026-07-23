/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TimelineEntryWriteRequest = {
    title: string;
    /**
     * Texto livre — ex. 'Dezembro de 2018' quando não há um dia exato.
     */
    date: string;
    description: string;
    image: Blob;
    /**
     * Ex.: publicação do Instagram sobre o marco.
     */
    link?: string;
    order?: number;
    is_active?: boolean;
};

