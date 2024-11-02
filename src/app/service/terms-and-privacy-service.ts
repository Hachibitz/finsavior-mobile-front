import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpErrorResponse
} from '@angular/common/http';
import { GET_PRIVACY_POLICY, GET_TERMS } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class TermsAndPrivacyService {

    constructor(private http: HttpClient) {

    }
    
    loadTermsAndConditions(): Promise<string> {
        const promessa = new Promise<string>((resolve, reject) => {
            this.http.get(GET_TERMS, { responseType: 'text' }).subscribe({
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

    loadPrivacyPolicy(): Promise<string> {
        const promessa = new Promise<string>((resolve, reject) => {
            this.http.get(GET_PRIVACY_POLICY, { responseType: 'text' }).subscribe({
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
}