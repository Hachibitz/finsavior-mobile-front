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
  IonInput, IonFooter
} from '@ionic/angular/standalone';
import { GoogleAuthService } from '../service/google-auth.service';
import { TermsAndPrivacyDialogPage } from '../modal/terms-and-privacy-dialog/terms-and-privacy-dialog.page';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { helpCircleOutline } from 'ionicons/icons';

addIcons({
  'help-circle-outline': helpCircleOutline
});

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  providers: [
    AuthService, ModalController
  ],
  imports: [
    CommonModule, FormsModule, IonHeader, 
    IonToolbar, IonTitle, IonContent, 
    IonButton, IonText, IonLabel, 
    IonItem, IonIcon, IonCard, 
    IonCardContent, IonCardHeader, IonCardTitle,
    IonCheckbox, IonInput, IonFooter
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

  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.authService.isAuthenticated();

    if(isAuthenticated) {
      this.router.navigate(['main-page/debits']);
    }
  }

  onLogin() {
    this.loginRequest = {
      username: this.userLogin,
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
  
          const autoPassword = this.generateStrongPassword();
  
          const signUpRequest = {
            email: googleProfile.email,
            emailConfirmation: googleProfile.email,
            username: this.generateUsernameFromEmail(googleProfile.email),
            firstName: this.extractFirstName(googleProfile.name),
            lastName: this.extractLastName(googleProfile.name),
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
  
  generateUsernameFromEmail(email: string): string {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Date.now();
  }
  
  extractFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }
  
  extractLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : 'Sobrenome';
  }
  
  generateStrongPassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const special = '@$!%*?&';
    const all = upper + lower + nums + special;
  
    let password = 
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      nums[Math.floor(Math.random() * nums.length)] +
      special[Math.floor(Math.random() * special.length)];
  
    while (password.length < 12) {
      password += all[Math.floor(Math.random() * all.length)];
    }
  
    return password.split('').sort(() => Math.random() - 0.5).join('');
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

  redirectToRegistration() {
    this.router.navigate(['/register']);
  }

  redirectToForgottenPassword() {
    this.router.navigate(['/password-forgotten']);
  }

  redirectToTicketPage() {
    this.router.navigate(['/ticket']);
  }

  isLoading() {
    this.loading = !this.loading;
  }

}
