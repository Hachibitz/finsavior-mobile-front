import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonText, 
  IonHeader, IonTitle, IonToolbar, 
  IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonItem, IonLabel, 
  IonInput, IonButton, IonCheckbox } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent,
    IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonCheckbox,
    IonText, 
  ]
})
export class LoginPage implements OnInit {

  userLogin: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(private router: Router) {

  }

  ngOnInit() {
    
  }

  onLogin() {
    if (this.userLogin && this.password) {
      // Lógica de login aqui
      console.log('Login bem-sucedido!');
      // Redirecionar para outra página após o login
      this.router.navigate(['/home']);
    }
  }

  redirectToRegistration() {
    // Lógica para redirecionar para a página de cadastro
    console.log('Redirecionando para cadastro...');
  }

  redirectToForgottenPassword() {
    // Lógica para redirecionar para a página de recuperação de senha
    console.log('Redirecionando para recuperação de senha...');
  }

}
