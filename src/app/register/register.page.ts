import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { TermsAndPrivacyDialogPage } from '../modal/terms-and-privacy-dialog/terms-and-privacy-dialog.page';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

addIcons({
  'arrow-back-outline': arrowBackOutline,
});

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    providers: [
        AuthService, ModalController
    ],
    imports: [
        CommonModule, FormsModule,
        ReactiveFormsModule, IonicModule
    ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  passwordCriteria = {
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  };
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService,
    private modalController: ModalController
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      emailConfirmation: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required]],
      agreement: [false, [Validators.requiredTrue]]
    }, { validators: [this.passwordMatchValidator, this.emailMatchValidator] });
  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.authService.isAuthenticated();

    if(isAuthenticated) {
      this.router.navigate(['main-page/debits']);
    }
  }

  signUp() {
    if (this.registerForm.invalid) {
      this.presentAlert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const signUpRequest = {
      email: this.registerForm.get('email')?.value.trim(),
      emailConfirmation: this.registerForm.get('emailConfirmation')?.value.trim(),
      username: this.registerForm.get('username')?.value.trim(),
      firstName: this.registerForm.get('name')?.value,
      lastName: this.registerForm.get('lastname')?.value,
      password: this.registerForm.get('password')?.value,
      passwordConfirmation: this.registerForm.get('passwordConfirmation')?.value,
      agreement: this.registerForm.get('agreement')?.value,
    };

    this.isLoading();
    this.authService
      .signUp(signUpRequest)
      .then((result) => {
        this.presentAlert('Cadastro realizado com sucesso!');
        this.navigateTo('login');        
      })
      .catch((error) => {
        const errorMessage = error.error?.message || 'Erro ao realizar o cadastro. Tente novamente mais tarde.';
        this.presentAlert(errorMessage);
      })
      .finally(() => {
        this.isLoading();
      });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('passwordConfirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPassword() {
    const password = this.registerForm.get('password')?.value;
    this.passwordCriteria.length = password.length >= 8;
    this.passwordCriteria.upper = /[A-Z]/.test(password);
    this.passwordCriteria.lower = /[a-z]/.test(password);
    this.passwordCriteria.number = /[0-9]/.test(password);
    this.passwordCriteria.special = /[@$!%*?&]/.test(password);
  }

  emailMatchValidator(form: FormGroup) {
    const email = form.get('email')?.value;
    const emailConfirmation = form.get('emailConfirmation')?.value;
    return email === emailConfirmation ? null : { emailMismatch: true };
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  goBack() {
    window.history.back();
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message,
      buttons: ['OK']
    });
    await alert.present();
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

  isLoading() {
    this.loading = !this.loading;
  }
}