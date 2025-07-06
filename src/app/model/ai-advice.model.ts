export interface AnalysisType {
    label: string;
    analysisTypeId: number;
    period: number;
}

export const AnalysisTypeEnum = {
    ANNUAL: { label: '1 Ano', analysisTypeId: 3, period: 12, coinCostForAnalysis: 120 },
    TRIMESTER: { label: '3 Meses', analysisTypeId: 2, period: 3, coinCostForAnalysis: 60 },
    FREE: { label: '1 Mês', analysisTypeId: 1, period: 1, coinCostForAnalysis: 25 }
};

export interface AiAdviceRequest {
    analysisTypeId: number;
    temperature: number;
    startDate: string;
    finishDate: string;
    isUsingCoins: boolean;
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

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    answer: string;
}

export interface ChatRequest {
    question: string;
    chatHistory?: string[];
    date?: string;
    isUsingCoins?: boolean;
}