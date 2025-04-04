import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-forgotten',
  templateUrl: './password-forgotten.page.html',
  styleUrls: ['./password-forgotten.page.scss'],
  standalone: true,
  providers: [
    AuthService
  ],
  imports: [
    IonicModule, CommonModule, 
    FormsModule, ReactiveFormsModule
  ]
})
export class PasswordForgottenPage implements OnInit {
  passwordRecoveryForm: FormGroup;
  resetPasswordForm: FormGroup;
  loading: boolean = false;
  step: number = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.passwordRecoveryForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {}

  async sendRecoveryEmail() {
    if (this.passwordRecoveryForm.invalid) {
      await this.presentAlert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }

    const email = this.passwordRecoveryForm.get('identifier')?.value;

    this.isLoading();
    this.authService.passwordRecovery(email).subscribe(
      async () => {
        this.step = 2; // Avança para a próxima etapa
        this.isLoading();
        await this.presentAlert('Sucesso', 'Um e-mail de recuperação foi enviado.');
      },
      async (error: HttpErrorResponse) => {
        this.isLoading();
        console.error('Erro ao enviar e-mail de recuperação:', error);
        await this.presentAlert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
      }
    );
  }

  async resetPassword() {
    if (this.resetPasswordForm.invalid) {
      await this.presentAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const { token, newPassword } = this.resetPasswordForm.value;

    this.isLoading();
    this.authService.resetPassword(token, newPassword).subscribe(
      async () => {
        this.isLoading();
        await this.presentAlert('Sucesso', 'Sua senha foi redefinida com sucesso.');
        this.step = 1;
        this.passwordRecoveryForm.reset();
        this.resetPasswordForm.reset();
        this.router.navigate(['/login']);
      },
      async (error: HttpErrorResponse) => {
        console.error('Erro ao redefinir a senha:', error);
        this.isLoading();
        await this.presentAlert('Erro', 'Não foi possível redefinir a senha. Verifique o token.');
      }
    );
  }

  isLoading(): void {
    this.loading = !this.loading;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}