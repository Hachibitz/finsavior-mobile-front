import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CANCEL_SUBSCRIPTION, CREATE_CHECKOUT, CUSTOMER_PORTAL, UPDATE_SUBSCRIPTION } from 'src/environments/environment';
import { CheckoutSessionDTO } from '../model/plan.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

    constructor(private http: HttpClient) {}

    createCheckoutSession(planType: string, email: string): Promise<CheckoutSessionDTO> {
        const promessa = new Promise<CheckoutSessionDTO>((resolve, reject) => {
            this.http.post<CheckoutSessionDTO>(CREATE_CHECKOUT, { planType, email }).subscribe({
                next: (result: CheckoutSessionDTO) => {
                    resolve(result);
                },
                error: (e) => {
                    reject(e.error);
                },
            });
        });
        return promessa;
    }

    cancelSubscription(immediate: boolean = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          this.http.post(CANCEL_SUBSCRIPTION, { immediate }).subscribe({
            next: () => resolve(),
            error: (e) => reject(e.error),
          });
        });
    }      
    
    updateSubscription(planType: string, email: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          this.http.post<void>(UPDATE_SUBSCRIPTION, { planType, email }).subscribe({
            next: () => resolve(),
            error: (e) => reject(e.error),
          });
        });
    }

    createCustomerPortalSession(email: string): Promise<{ url: string; } | undefined> {
      return this.http.post<{ url: string }>(CUSTOMER_PORTAL, null, {
        params: new HttpParams().set('email', email)
      }).toPromise();
    }
      
}
