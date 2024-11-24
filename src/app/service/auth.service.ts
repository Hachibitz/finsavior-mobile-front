import { Injectable } from '@angular/core';
import { AUTH_SERVICE, GOOGLE_LOGIN, PASSWORD_RESET, PASSWORD_RESET_REQUEST, REFRESH_TOKEN, SERVICE_LOGIN, SIGNUP_SERVICE, VALIDATE_TOKEN_SERVICE } from 'src/environments/environment';
import {
    HttpClient,
    HttpErrorResponse
} from '@angular/common/http';
import { LoginRequest, SignUpRequest, SignUpResponse } from '../model/user.model';
import { Storage } from '@ionic/storage-angular';
import { Platform, isPlatform } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

declare const google: any;
declare const gapi: any;

@Injectable({ providedIn: 'root' })
export class AuthService {

    private _storage: Storage | null = null;

    constructor(private http: HttpClient, private storage: Storage, private platform: Platform) {
        this.initStorage();

        if(!isPlatform("capacitor")) {
            GoogleAuth.initialize();
        }
        this.platform.ready().then(() => {
            GoogleAuth.initialize();
        })
    }

    async initStorage() {
        this._storage = await this.storage.create();
    }

    login(loginRequest: LoginRequest): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          this.http.post<{ accessToken: string; refreshToken: string }>(SERVICE_LOGIN, loginRequest).subscribe({
            next: (result) => {
              this.setTokens(result.accessToken, result.refreshToken);
              resolve();
            },
            error: (e: HttpErrorResponse) => {
              reject(e);
            },
          });
        });
    }      

    async googleSignIn() {
        return await GoogleAuth.signIn();
    }

    /*implement when possible
    async googleSignIn2(): Promise<any> {
        return new Promise((resolve, reject) => {
            google.accounts.id.initialize({
            client_id: environment.googleClientId, // Substitua pelo seu Client ID
            callback: (response: any) => {
                if (response && response.credential) {
                const user = this.decodeJwt(response.credential);
                resolve(user);
                } else {
                reject('Erro ao autenticar com Google');
                }
            },
            });

            google.accounts.id.prompt(); // Exibe o prompt de login do Google
        });
    }

    decodeJwt(token: string): any {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }*/

    async googleLogout(): Promise<void> {
        await GoogleAuth.signOut(); // Apenas para logout visual (opcional)
        this.clearStorage();
    }

    checkGoogleLoggedIn() {
        GoogleAuth.refresh()
        .then((data) => {
            if (data.accessToken) {
                this.setAccessToken(data.accessToken);
            }
        })
        .catch((error) => {
            this.refreshToken();
        });
    }

    loginWithGoogle(idToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        return new Promise<{ accessToken: string; refreshToken: string }>((resolve, reject) => {
            this.http.post<{ accessToken: string; refreshToken: string }>(GOOGLE_LOGIN, idToken).subscribe({
                next: (result: { accessToken: string; refreshToken: string }) => {
                    this.setTokens(result.accessToken, result.refreshToken);
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
        const url = `${VALIDATE_TOKEN_SERVICE}?token=${token}`;
        const headers = { 'ngrok-skip-browser-warning': 'true' };
        return new Promise<boolean> ((resolve, reject) => {
            this.http.get<boolean>(url, { headers }).subscribe({
                next: (result: boolean) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                }
            });
        })
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
            const accessToken = await this.getToken();

            const isValid = await this.validateToken(accessToken).catch(async (error) => {

                try {
                    await this.refreshToken();
                    return true;
                } catch (refreshError) {
                    return false;
                }
            });

            if (isValid) {
                return true;
            }
        } catch (error) {
            console.error("Erro inesperado: ", error);
        }

        return false;
    }

    async setAccessToken(token: string) {
        await this.storage.set('accessToken', token);
    }
    
    async getToken(): Promise<string> {
        try {
            const result = await this.storage.get('accessToken');
            return result || '';
        } catch (error) {
            return '';
        }
    }

    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        await this.setAccessToken(accessToken);
        await this.storage.set('refreshToken', refreshToken);
    }
    
    async getRefreshToken(): Promise<string> {
        return await this.storage.get('refreshToken');
    }
    
    async refreshToken(): Promise<string> {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available.');
        }

        return new Promise<string>((resolve, reject) => {
            this.http.post<string>(`${REFRESH_TOKEN}`, refreshToken, { responseType: 'text' as 'json', withCredentials: true }).subscribe({
                next: (result: string) => {
                    this.setAccessToken(result);
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e);
                },
            });
        });
    }
}