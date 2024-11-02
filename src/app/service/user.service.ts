import { Injectable } from '@angular/core';
import { CHANGE_ACCOUNT_PASSWORD, DELETE_ACCOUNT_AND_DATA, GET_PROFILE_DATA, USER_PROFILE } from 'src/environments/environment';
import {
    HttpClient,
    HttpErrorResponse
} from '@angular/common/http';
import { ChangeAccountPasswordRequest, DeleteAccountAndDataRequest, DeleteAccountAndDataResponse, LoginRequest, SignUpRequest, SignUpResponse, UploadProfilePictureRequest, UserData } from '../model/user.model';
import { CookieService } from 'ngx-cookie-service';
import { GenericResponse } from '../model/main.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    deleteAccountAndData(deleteAccountAndDataRequest: DeleteAccountAndDataRequest): Promise<DeleteAccountAndDataResponse> {
        const promessa = new Promise<DeleteAccountAndDataResponse>((resolve, reject) => {
            this.http.post<DeleteAccountAndDataResponse>(DELETE_ACCOUNT_AND_DATA, deleteAccountAndDataRequest, { responseType: 'json' }).subscribe({
                next: (result: DeleteAccountAndDataResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e.error);
                },
            });
        });
        return promessa;
    }

    changeAccountPassword(changeAccountPasswordRequest: ChangeAccountPasswordRequest): Promise<DeleteAccountAndDataResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            this.http.post<DeleteAccountAndDataResponse>(CHANGE_ACCOUNT_PASSWORD, changeAccountPasswordRequest, { responseType: 'json' }).subscribe({
                next: (result: GenericResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e.error);
                },
            });
        });
        return promessa;
    }

    uploadProfilePicture(request: FormData): Promise<GenericResponse> {
        const promessa = new Promise<GenericResponse>((resolve, reject) => {
            this.http.post<GenericResponse>(`${USER_PROFILE}/upload-picture`, request).subscribe({
                next: (result: GenericResponse) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e.error);
                },
            });
        });
        
        return promessa;
    }

    getProfileData(): Promise<UserData> {
        const promessa = new Promise<UserData>((resolve, reject) => {
                this.http.get<UserData>(GET_PROFILE_DATA, { responseType: 'json' }).subscribe({
                next: (result: UserData) => {
                    resolve(result);
                },
                error: (e: HttpErrorResponse) => {
                    reject(e.error);
                },
            });
        });
        return promessa;
    }
}