import { Component, Injectable } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './service/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { TermsAndPrivacyService } from './service/terms-and-privacy-service';
import { BillService } from './service/bill.service';
import { UserService } from './service/user.service';
import { TokenInterceptor } from './security/TokenInterceptor';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CommonService } from './service/common.service';
import { PaymentService } from './service/payment.service';
import { GoogleAuthService } from './service/google-auth.service';
import { StorageService } from './service/storage.service';
import { AiAssistantService } from './service/ai-assistant.service';
import { ThemeService } from './service/theme.service';
import { FsCoinService } from './service/fs-coin-service';
import { AdmobService } from './service/admob.service';

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
    CommonService,
    PaymentService,
    GoogleAuthService,
    AiAssistantService,
    ThemeService,
    FsCoinService,
    AdmobService,
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    },
  ],
  imports: [HttpClientModule, IonApp, IonRouterOutlet, IonicStorageModule],
})
export class AppComponent {
  constructor(private storageService: StorageService, private themeService: ThemeService, private admobService: AdmobService) {
    this.initApp();
  }
  
  async initApp() {
    await this.storageService.init();
    await this.admobService.initialize();
  }
}
