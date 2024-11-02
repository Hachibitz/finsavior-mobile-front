import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';

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
  loading: boolean = false;
  disableButton: boolean = false;
  timer: number = 0;
  timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    this.passwordRecoveryForm = this.fb.group({
      identifier: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    
  }

  async onSubmit() {
    if (this.passwordRecoveryForm.valid) {
      const identifier = this.passwordRecoveryForm.get('identifier')?.value;

      this.isLoading();
      await this.authService.passwordRecovery(identifier).then((result) => {
        this.presentAlert('Instruções de recuperação de senha foram enviadas para seu email.');
        this.startTimer();
      }).catch((error) => {
        this.presentAlert('Erro ao solicitar recuperação de senha: ' + error.message);
      }).finally(() => {
        this.isLoading();
      });
    }
  }

  startTimer() {
    this.disableButton = true;
    this.timer = 120;

    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.disableButton = false;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  isLoading(): void {
    this.loading = !this.loading;
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}