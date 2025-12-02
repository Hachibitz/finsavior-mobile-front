import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../model/user.model';
import { AuthService } from '../service/auth.service';
import { AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonText, IonLabel, 
  IonItem, IonIcon, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCheckbox,
  IonInput, IonFooter, IonButtons
} from '@ionic/angular/standalone';
import { GoogleAuthService } from '../service/google-auth.service';
import { TermsAndPrivacyDialogPage } from '../modal/terms-and-privacy-dialog/terms-and-privacy-dialog.page';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { helpCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { extractFirstName, extractLastName, generateStrongPassword, generateUsernameFromEmail } from '../utils/common-authentication-utils';

addIcons({
  'help-circle-outline': helpCircleOutline
});

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    providers: [
        AuthService, ModalController
    ],
    imports: [
        CommonModule, FormsModule, IonHeader,
        IonToolbar, IonTitle, IonContent,
        IonButton, IonText, IonLabel,
        IonItem, IonIcon, IonCard,
        IonCardContent, IonCardHeader, IonCardTitle,
        IonCheckbox, IonInput, IonFooter,
        IonButtons
    ]
})
export class LoginPage implements OnInit {

  userLogin: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loginRequest!: LoginRequest;
  loading: boolean = false;
  googleUser: any;

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private alertController: AlertController, 
    private googleAuthService: GoogleAuthService,
    private modalController: ModalController
  ) {
      addIcons({arrowBackOutline,helpCircleOutline});

  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.authService.isAuthenticated();

    if(isAuthenticated) {
      this.router.navigate(['main-page/debits']);
    }
  }

  onLogin() {
    this.loginRequest = {
      username: this.userLogin.trim(),
      password: this.password,
      rememberMe: this.rememberMe
    }
    
    this.isLoading();
    this.authService.login(this.loginRequest).then((response) => {
      this.showAlert('Sucesso', 'Login realizado com sucesso!');
      this.router.navigate(['/main-page/debits']);
    }).catch((error) => {
      const errorMessage = error.error || 'Erro ao realizar o login. Verifique as informações.';
      this.showAlert('Erro', errorMessage);
    }).finally(() => {
      this.clearCredentials();
      this.isLoading();
    })
  }

  async googleSignIn() {
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
  
  async openTermsDialog() {
    const modal = await this.modalController.create({
      component: TermsAndPrivacyDialogPage,
      componentProps: { type: 'terms' }
    });
    await modal.present();
  }

  async openPrivacyDialog() {
    const modal = await this.modalController.create({
      component: TermsAndPrivacyDialogPage,
      componentProps: { type: 'privacy' }
    });
    await modal.present();
  }

  clearCredentials() {
    this.userLogin = '';
    this.password = '';
    this.rememberMe = false;
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  goBack() {
    window.history.back();
  }

  isLoading() {
    this.loading = !this.loading;
  }

}
