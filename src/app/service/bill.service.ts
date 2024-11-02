import { Injectable } from '@angular/core';
import { DELETE_ITEM_CARD_TABLE, 
         DELETE_ITEM_MAIN_TABLE, 
         EDIT_ITEM_CARD_TABLE, 
         EDIT_ITEM_MAIN_TABLE, 
         LOAD_CARD_TABLE_DATA, 
         LOAD_MAIN_TABLE_DATA, 
         BILLS_SERVICE_BILL_REGISTER, 
         GENERATE_AI_ADVICE,
         GET_AI_ADVICE,
         DELETE_AI_ANALYSIS} from 'src/environments/environment';
import {
    HttpClient,
    HttpErrorResponse,
    HttpParams
} from '@angular/common/http';
import { BillRegisterRequest, CardTableDataResponse, GenericResponse, MainTableDataResponse } from '../model/main.model';
import { AiAdviceRequest, AiAdviceResponse, Analysis } from '../model/ai-advice.model';

@Injectable({ providedIn: 'root' })
export class BillService {

    constructor(private http: HttpClient) { }

    billRegister(saveRequest: BillRegisterRequest): Promise<string> {
        const params = new HttpParams().set('isRecurrent', saveRequest.isRecurrent);

        const promessa = new Promise<string>((resolve, reject) => {
            this.http.post<string>(BILLS_SERVICE_BILL_REGISTER, saveRequest, { params: params, responseType: 'json' }).subscribe({
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

    loadMainTableData(billDate: string): Promise<MainTableDataResponse> {
        const params = new HttpParams().set('billDate', encodeURIComponent(billDate));

        const promessa = new Promise<MainTableDataResponse>((resolve, reject) => {
            this.http.get<MainTableDataResponse>(LOAD_MAIN_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: MainTableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    loadCardTableData(billDate: string): Promise<CardTableDataResponse> {
        const params = new HttpParams().set('billDate', billDate);

        const promessa = new Promise<CardTableDataResponse>((resolve, reject) => {
            this.http.get<CardTableDataResponse>(LOAD_CARD_TABLE_DATA, { params: params, responseType: 'json' }).subscribe({
                next: (result: CardTableDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    };

    deleteItemFromMainTable(itemId: number): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            const params = new HttpParams().set('itemId', itemId.toString());

            this.http.delete<GenericResponse>(DELETE_ITEM_MAIN_TABLE, { params: params, responseType: 'json' }).subscribe({
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

    deleteItemFromCardTable(itemId: number): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            const params = new HttpParams().set('itemId', itemId.toString());

            this.http.delete<GenericResponse>(DELETE_ITEM_CARD_TABLE, { params: params, responseType: 'json' }).subscribe({
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

    editItemFromMainTable(billUpdate: BillRegisterRequest): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {

            this.http.put<GenericResponse>(EDIT_ITEM_MAIN_TABLE, billUpdate, { responseType: 'json' }).subscribe({
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

    editItemFromCardTable(billUpdate: BillRegisterRequest): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            this.http.put<GenericResponse>(EDIT_ITEM_CARD_TABLE, billUpdate, { responseType: 'json' }).subscribe({
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