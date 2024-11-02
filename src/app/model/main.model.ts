export const tableTypes: string[] = [
    'main',
    'credit-card'
]

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
    isRecurrent: boolean;
    paid: boolean;
}

export interface MainTableDataResponse {
    mainTableDataList: BillRegisterRequest[];
}

export interface CardTableDataResponse {
    cardTableDataList: BillRegisterRequest[];
}

export interface GenericResponse {
    status: string;
    message: string;
}