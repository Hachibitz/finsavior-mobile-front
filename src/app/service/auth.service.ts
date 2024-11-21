import { Injectable } from '@angular/core';
import { PASSWORD_RESET, PASSWORD_RESET_REQUEST, SERVICE_LOGIN, SIGNUP_SERVICE, VALIDATE_TOKEN_SERVICE } from 'src/environments/environment';
import {
    HttpClient,
    HttpErrorResponse
} from '@angular/common/http';
import { LoginRequest, SignUpRequest, SignUpResponse } from '../model/user.model';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private _storage: Storage | null = null;

    constructor(private http: HttpClient, private storage: Storage) {
        this.initStorage();
    }

    async initStorage() {
        this._storage = await this.storage.create();
    }

    login(loginRequest: LoginRequest): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.http.post(SERVICE_LOGIN, loginRequest, { responseType: 'text', withCredentials: true }).subscribe({
                next: (result: string) => {
                    this.setToken(result);
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
    }

    logout(): void {
        this.clearStorage();
    }

    signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
        const promessa = new Promise<SignUpResponse>((resolve, reject) => {
            this.http.post<SignUpResponse>(SIGNUP_SERVICE, signUpRequest, { responseType: 'json' }).subscribe({
                next: (result: SignUpResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    }

    clearStorage(): void {
        this.storage.clear();
    }

    validateToken(token: string): Promise<boolean> {
        const url = VALIDATE_TOKEN_SERVICE+"?token="+token;
        const headers = { 'ngrok-skip-browser-warning': 'true' };
        const promessa = new Promise<boolean>((resolve, reject) => {
            this.http.get<boolean>(url, { headers, responseType: 'json' as 'json' }).subscribe({
                next: (result: boolean) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
        return promessa;
    }

    resetPassword(token: string, newPassword: string): Promise<any> {
        const promessa = new Promise<any>((resolve, reject) => {
            this.http.post(PASSWORD_RESET, { token, newPassword }).subscribe({
                next: (result: any) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                }
            });
        });
        return promessa;
    }

    passwordRecovery(identifier: string): Promise<any> {
        const url = PASSWORD_RESET_REQUEST+"?email="+identifier;
        const promessa = new Promise<any>((resolve, reject) => {
            this.http.post(url, null).subscribe({
                next: (result: any) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                }
            });
        });
        return promessa;
    }

    async isAuthenticated(): Promise<boolean> {
        try {
          const result = await this.validateToken(await this.getToken());
          return result;
        } catch (error) {
          return false;
        }
    }

    async setToken(token: string) {
        await this.storage.set('token', token);
    }
    
    async getToken(): Promise<string> {
        try {
            const result = await this.storage.get('token');
            return result || '';
        } catch (error) {
            console.log(error);
            return '';
        }
    }
}