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
  IonInput 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  providers: [
    AuthService
  ],
  imports: [
    CommonModule, FormsModule, IonHeader, 
    IonToolbar, IonTitle, IonContent, 
    IonButton, IonText, IonLabel, 
    IonItem, IonIcon, IonCard, 
    IonCardContent, IonCardHeader, IonCardTitle,
    IonCheckbox, IonInput
  ]
})
export class LoginPage implements OnInit {

  userLogin: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loginRequest!: LoginRequest;
  loading: boolean = false;

  constructor(private router: Router, private authService: AuthService, private alertController: AlertController) {

  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.authService.isAuthenticated();

    if(isAuthenticated) {
      this.router.navigate(['main-page/debits']);
    }
  }

  onLogin() {
    this.loginRequest = {
      userLogin: this.userLogin,
      password: this.password,
      rememberMe: this.rememberMe
    }
    
    this.isLoading();
    this.authService.login(this.loginRequest).then((response) => {
      this.showAlert('Sucesso', 'Login realizado com sucesso!');
      this.router.navigate(['/main-page/debits']);
    }).catch((error) => {
      console.log(error)
      this.showAlert('Erro', error.error);
    }).finally(() => {
      this.clearCredentials();
      this.isLoading();
    })
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
    // Lógica para redirecionar para a página de recuperação de senha
    console.log('Redirecionando para recuperação de senha...');
  }

  isLoading() {
    this.loading = !this.loading;
  }

}
