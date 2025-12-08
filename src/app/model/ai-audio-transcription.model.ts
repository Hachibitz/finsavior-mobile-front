export interface AiBillExtractionDTO {
    billName?: string;
    billValue?: number;
    billDescription?: string;
    billCategory?: string;
    billTable?: string;
    isInstallment?: boolean;
    installmentCount?: number;
    isRecurrent?: boolean;
    possibleDate?: string;
    redirectAction?: string;
}