export interface AnalysisType {
    label: string;
    analysisTypeId: number;
    period: number;
}

export const AnalysisTypeEnum = {
    ANNUAL: { label: '1 Ano', analysisTypeId: 3, period: 12 },
    TRIMESTER: { label: '3 Meses', analysisTypeId: 2, period: 3 },
    FREE: { label: '1 Mês', analysisTypeId: 1, period: 1 }
};

export interface AiAdviceRequest {
    mainAndIncomeTable: String;
    cardTable: String;
    date: string;
    analysisTypeId: number;
    temperature: number;
    startDate: string;
    finishDate: string;
}

export interface AiAdviceResponse {
    id: number;
}

export interface Analysis {
    id: number;
    analysisType: string;
    date: string;
    resultAnalysis: string;
    startDate: string;
    finishDate: string;
    temperature: number;
}