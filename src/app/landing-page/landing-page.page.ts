import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { GoogleAuthService } from '../service/google-auth.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule,
    IonButton
  ]
})
export class LandingPagePage implements OnInit {

  constructor(private router: Router, private authService: AuthService, private googleAuthService: GoogleAuthService) { }

  async ngOnInit(): Promise<void> {
    const isLoggedInGoogle = await this.googleAuthService.observeFirebaseAuthState();
    const isAuthenticated = await this.authService.isAuthenticated();
    const isLoggedIn = isAuthenticated || isLoggedInGoogle

    if(isLoggedIn) {
      this.router.navigate(['/main-page/debits']);
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  redirectToRegistration() {
    this.router.navigate(['/register']);
  }

}
