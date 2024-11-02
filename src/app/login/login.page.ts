import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../model/user.model';
import { AuthService } from '../service/auth.service';
import { IonicModule, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  providers: [
    AuthService
  ],
  imports: [
    CommonModule, FormsModule, IonicModule
  ]
})
export class LoginPage implements OnInit {

  userLogin: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loginRequest!: LoginRequest;
  loading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {

  }

  ngOnInit() {
    
  }

  onLogin() {
    this.loginRequest = {
      userLogin: this.userLogin,
      password: this.password,
      rememberMe: this.rememberMe
    }
    
    this.isLoading();
    this.authService.login(this.loginRequest).then((response) => {
      console.log('Login realizado com sucesso!');
      this.router.navigate(['/main-page/debits']);
    }).catch((error) => {
      console.log(error)
    }).finally(() => {
      this.isLoading();
    })
  }

  redirectToRegistration() {
    this.router.navigate(['/register']);
    console.log('Redirecionando para cadastro...');
  }

  redirectToForgottenPassword() {
    // Lógica para redirecionar para a página de recuperação de senha
    console.log('Redirecionando para recuperação de senha...');
  }

  isLoading() {
    this.loading = !this.loading;
  }

}
