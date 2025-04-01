import { Injectable } from '@angular/core';
import { 
         LOAD_CARD_TABLE_DATA, 
         LOAD_MAIN_TABLE_DATA, 
         BILLS_SERVICE_BILL_REGISTER, 
         GENERATE_AI_ADVICE,
         GET_AI_ADVICE,
         DELETE_AI_ANALYSIS,
         BILLS_SERVICE_CARD_PAYMENT_REGISTER,
         LOAD_PAYMENT_CARD_TABLE_DATA,
         EDIT_ITEM,
         DELETE_ITEM,
         LOAD_ASSETS_TABLE_DATA} from 'src/environments/environment';
import {
    HttpClient,
    HttpErrorResponse,
    HttpParams
} from '@angular/common/http';
import { BillRegisterRequest, GenericResponse, TableDataResponse } from '../model/main.model';
import { AiAdviceRequest, AiAdviceResponse, Analysis } from '../model/ai-advice.model';

@Injectable({ providedIn: 'root' })
export class BillService {

    constructor(private http: HttpClient) { }

    billRegister(saveRequest: BillRegisterRequest): Promise<string> {
        const promessa = new Promise<string>((resolve, reject) => {
            this.http.post<string>(BILLS_SERVICE_BILL_REGISTER, saveRequest, { responseType: 'json' }).subscribe({
                next: (result: string) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    loadPaymentCardTableData(billDate: string): Promise<TableDataResponse> {
        const params = new HttpParams().set('billDate', encodeURIComponent(billDate));

        const promessa = new Promise<TableDataResponse>((resolve, reject) => {
            this.http.get<TableDataResponse>(LOAD_PAYMENT_CARD_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: TableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    loadMainTableData(billDate: string): Promise<TableDataResponse> {
        const params = new HttpParams().set('billDate', encodeURIComponent(billDate));

        const promessa = new Promise<TableDataResponse>((resolve, reject) => {
            this.http.get<TableDataResponse>(LOAD_MAIN_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: TableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    loadCardTableData(billDate: string): Promise<TableDataResponse> {
        const params = new HttpParams().set('billDate', billDate);

        const promessa = new Promise<TableDataResponse>((resolve, reject) => {
            this.http.get<TableDataResponse>(LOAD_CARD_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: TableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    loadAssetsTableData(billDate: string): Promise<TableDataResponse> {
        const params = new HttpParams().set('billDate', encodeURIComponent(billDate));

        const promessa = new Promise<TableDataResponse>((resolve, reject) => {
            this.http.get<TableDataResponse>(LOAD_ASSETS_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: TableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    deleteItem(itemId: number): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            const params = new HttpParams().set('itemId', itemId.toString());

            this.http.delete<GenericResponse>(DELETE_ITEM, { params: params, responseType: 'json' }).subscribe({
                next: (result: GenericResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    editItem(billUpdate: BillRegisterRequest): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {

            this.http.put<GenericResponse>(EDIT_ITEM, billUpdate, { responseType: 'json' }).subscribe({
                next: (result: GenericResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    generateAiAdvice(aiAdviceRequest: AiAdviceRequest): Promise<AiAdviceResponse> {
        const promessa = new Promise<AiAdviceResponse>((resolve, reject) => {
            this.http.post<AiAdviceResponse>(GENERATE_AI_ADVICE, aiAdviceRequest, { responseType: 'json' }).subscribe({
                next: (result: AiAdviceResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    getAiAdvices(): Promise<Analysis[]> {
        const promessa = new Promise<Analysis[]>((resolve, reject) => {
            this.http.get<Analysis[]>(GET_AI_ADVICE, { responseType: 'json' }).subscribe({
                next: (result: Analysis[]) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    deleteAiAnalysis(analysisId: number): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            const requestUrl = DELETE_AI_ANALYSIS+"/"+analysisId;
            this.http.delete<GenericResponse>(requestUrl, { responseType: 'json' }).subscribe({
                next: (result: GenericResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    }
}