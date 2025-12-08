export const tableTypes = {
    MAIN: 'MAIN',
    CREDIT_CARD: 'CREDIT_CARD',
    PAYMENT_CARD: 'PAYMENT_CARD',
    ASSETS: 'ASSETS'
}

export interface TipoConta {
    label: string;
    value: string;
}

export interface SelectedMonth {
    label: string;
    value: string;
}

export interface BillRegisterRequest {
    id?: number;
    billDate: string;
    billType: string;
    billName: string;
    billValue: number;
    billDescription: string;
    billTable: string;
    billCategory: string;
    isRecurrent: boolean;
    isInstallment?: boolean;
    installmentCount?: number;
    entryMethod?: 'MANUAL' | 'AUDIO';
    paid: boolean;
}

export type TableDataResponse = BillRegisterRequest[];

export interface GenericResponse {
    status: string;
    message: string;
}