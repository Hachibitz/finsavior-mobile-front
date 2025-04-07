import { Component, Injectable } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './service/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { TermsAndPrivacyService } from './service/terms-and-privacy-service';
import { BillService } from './service/bill.service';
import { UserService } from './service/user.service';
import { TokenInterceptor } from './security/TokenInterceptor';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { CommonService } from './service/common.service';
import { PaymentService } from './service/payment.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  providers: [
    AuthService,
    CookieService,
    BillService,
    UserService,
    Injectable,
    HttpClient,
    TermsAndPrivacyService,
    IonicStorageModule,
    Storage,
    CommonService,
    PaymentService,
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    },
  ],
  imports: [HttpClientModule, IonApp, IonRouterOutlet, IonicStorageModule],
})
export class AppComponent {
  constructor() {}
}
