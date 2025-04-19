import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton, IonText,
  IonIcon 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { GoogleAuthService } from '../service/google-auth.service';
import { 
  extractFirstName, 
  extractLastName, 
  generateStrongPassword, 
  generateUsernameFromEmail 
} from '../utils/common-authentication-utils';
import { AlertController, ModalController } from '@ionic/angular';
import { TermsAndPrivacyDialogPage } from '../modal/terms-and-privacy-dialog/terms-and-privacy-dialog.page';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  providers: [
    ModalController
  ],
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule,
    IonButton, IonText, IonIcon
  ]
})
export class LandingPagePage implements OnInit {

  loading: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private googleAuthService: GoogleAuthService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  async ngOnInit(): Promise<void> {
    const isLoggedInGoogle = await this.googleAuthService.observeFirebaseAuthState();
    const isAuthenticated = await this.authService.isAuthenticated();
    const isLoggedIn = isAuthenticated || isLoggedInGoogle

    if(isLoggedIn) {
      this.router.navigate(['/main-page/debits']);
    }
  }

  async googleSignUp() {
    this.isLoading();
  
    try {
      const idToken = await this.googleAuthService.signIn();
      const googleProfile = await this.googleAuthService.getGoogleProfile();
  
      try {
        await this.googleAuthService.googleRefreshSignIn(idToken.idToken);
        this.router.navigate(['/main-page/debits']);
      } catch (error: any) {
        if (error.status === 404 || error.status === 400) {
          console.log('Usuário não cadastrado, criando conta...');
          const accepted = await this.confirmTerms();
          if (!accepted) return;
  
          const autoPassword = generateStrongPassword();
  
          const signUpRequest = {
            email: googleProfile.email,
            emailConfirmation: googleProfile.email,
            username: generateUsernameFromEmail(googleProfile.email),
            firstName: extractFirstName(googleProfile.name),
            lastName: extractLastName(googleProfile.name),
            password: autoPassword,
            passwordConfirmation: autoPassword,
            agreement: true
          };
  
          await this.authService.signUp(signUpRequest);
          const loginResult = await this.googleAuthService.googleRefreshSignIn(idToken.idToken);
          this.router.navigate(['/main-page/debits']);
        } else {
          this.showAlert('Erro', 'Erro ao autenticar com Google');
        }
      }
    } catch (error) {
      this.showAlert('Erro', 'Falha ao autenticar com Google');
    } finally {
      this.isLoading();
    }
  }
  
  async confirmTerms(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Termos e Condições',
        message: `
          Ao continuar, você declara que leu e aceita os Termos de Uso e a Política de Privacidade.
          Você pode visualizá-los abaixo.
        `,
        buttons: [
          {
            text: 'Termos',
            handler: async () => {
              const modal = await this.modalController.create({
                component: TermsAndPrivacyDialogPage,
                componentProps: { type: 'terms' }
              });
              await modal.present();
              await modal.onDidDismiss();
              const accepted = await this.confirmTerms();
              resolve(accepted);
            }
          },
          {
            text: 'Privacidade',
            handler: async () => {
              const modal = await this.modalController.create({
                component: TermsAndPrivacyDialogPage,
                componentProps: { type: 'privacy' }
              });
              await modal.present();
              await modal.onDidDismiss();
              const accepted = await this.confirmTerms();
              resolve(accepted);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Continuar',
            handler: () => resolve(true)
          }
        ],
        backdropDismiss: false
      });
  
      await alert.present();
    });
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  redirectToRegistration() {
    this.router.navigate(['/register']);
  }

  isLoading() {
    this.loading = !this.loading;
  }

}
