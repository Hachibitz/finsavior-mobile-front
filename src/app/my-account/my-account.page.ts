import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton, IonLabel,
  IonItem, IonInput, IonChip, 
  IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonButtons
} from '@ionic/angular/standalone';
import { UserService } from '../service/user.service';
import { ProfileEditModalComponent } from '../modal/profile-edit/profile-edit-modal.component';
import { DeleteAccountModalComponent } from '../modal/delete-account/delete-account-modal.component';
import { ChangePasswordModalComponent } from '../modal/change-password/change-password-modal.component';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { PaymentService } from '../service/payment.service';
import { AuthService } from '../service/auth.service';
import { LoginRequest } from '../model/user.model';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
  standalone: true,
  providers: [
    ModalController, AlertController
  ],
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule, 
    ReactiveFormsModule, IonButton, IonLabel,
    IonItem, IonInput, IonChip, 
    IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonButtons
  ]
})
export class MyAccountPage implements OnInit, ViewWillEnter {

  isDarkMode: boolean = false;
  passwordForm: FormGroup;
  deleteAccountForm: FormGroup;
  profileDataForm: FormGroup;
  profilePicturePreview: string | null = null;
  profilePlan: string = "";
  loading: boolean = false;
  userEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private userService: UserService,
    private modalController: ModalController,
    private router: Router,
    private paymentService: PaymentService,
    private authService: AuthService,
  ) {
    this.passwordForm = this.fb.group({
      username: ['', Validators.required],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    });

    this.deleteAccountForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.profileDataForm = this.fb.group({
      firstName: ['', null],
      lastName: ['', null],
      username: ['', null],
      profilePicture: [null],
      name: ['', null],
    });
  }

  ionViewWillEnter(): void {
    this.loadUserProfile();
  }

  ngOnInit(): void {
    
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }
  
  async loadUserProfile() {
    try {
      const profile = await this.userService.getProfileData();
      this.profilePlan = profile.plan.planDs;
      const profilePictureBase64 = profile.profilePicture
        ? `data:image/jpeg;base64,${profile.profilePicture}`
        : null;

      this.profilePicturePreview = profilePictureBase64;
      this.userEmail = profile.email;

      this.profileDataForm.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        profilePicture: profilePictureBase64,
        name: profile.name
      });

      this.deleteAccountForm.patchValue({
        username: profile.username
      });

      this.passwordForm.patchValue({
        username: profile.username
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      await this.showAlert('Erro', 'Não foi possível carregar os dados do perfil.');
    }
  }

  async changePassword(data: any) {
    if (!data || data.newPassword !== data.confirmNewPassword) {
      await this.showAlert('Erro', 'As senhas não coincidem ou os dados estão incompletos.');
      return;
    }
  
    try {
      await this.userService.changeAccountPassword(data);
      await this.showAlert('Sucesso', 'Senha alterada com sucesso!');
    } catch (error: any) {
      await this.showAlert('Erro', error.message);
    }
  }
  
  async deleteAccount(data: any) {
    if (!data) {
      await this.showAlert('Erro', 'Dados incompletos para exclusão da conta.');
      return;
    }
  
    const confirmationAlert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Tem certeza? Esta ação é permanente e apagará todos os seus dados.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.userService.deleteAccountAndData({ ...data, confirmation: true });
              await this.showAlert('Sucesso', 'Sua conta será excluída em breve!');
            } catch (error) {
              await this.showAlert('Erro', 'Falha ao excluir conta. Tente novamente mais tarde.');
            }
          }
        }
      ]
    });
  
    await confirmationAlert.present();
  }

  async openProfileEditModal() {
    const modal = await this.modalController.create({
      component: ProfileEditModalComponent,
      componentProps: { form: this.profileDataForm }
    });
    await modal.present();
  }

  async openChangePasswordModal() {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent,
      componentProps: { form: this.passwordForm }
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data) {
      await this.changePassword(result.data);
    }
  }
  
  async openDeleteAccountModal() {
    const modal = await this.modalController.create({
      component: DeleteAccountModalComponent,
      componentProps: { form: this.deleteAccountForm }
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data) {
      await this.deleteAccount(result.data);
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async confirmCancelSubscription() {
    const optionAlert = await this.alertController.create({
      header: 'Cancelar assinatura',
      message: 'Deseja cancelar sua cobrança recorrente cancelar imediatamente?',
      buttons: [
        {
          text: 'Cancelar sua cobrança recorrente',
          handler: () => this.promptReLogin(true)
        },
        {
          text: 'Cancelar agora',
          handler: () => this.promptReLogin(true)
        },
        {
          text: 'Voltar',
          role: 'cancel'
        }
      ]
    });
  
    await optionAlert.present();
  }
  
  private async promptReLogin(immediate: boolean) {
    const loginAlert = await this.alertController.create({
      header: 'Confirme sua identidade',
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: this.passwordForm.get('username')?.value,
          placeholder: 'Username',
          disabled: true
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Senha'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            await loginAlert.dismiss();
            await this.showLoading();
            const loginRequest: LoginRequest = {
              username: data.username,
              password: data.password,
              rememberMe: false
            };
  
            try {
              await this.authService.validateLogin(loginRequest);
              await this.cancelSubscription(immediate);
              await this.hideLoading();
            } catch (e) {
              await this.hideLoading();
              const errorAlert = await this.alertController.create({
                header: 'Erro de autenticação',
                message: 'Usuário ou senha inválidos.',
                buttons: ['OK']
              });
  
              await errorAlert.present();
            }
          }
        }
      ]
    });
  
    await loginAlert.present();
  }  
  
  private async cancelSubscription(immediate: boolean) {
    try {
      await this.paymentService.cancelSubscription(immediate);
  
      const msg = immediate
        ? 'Sua assinatura foi cancelada. Em breve isso irá refletir na sua conta.'
        : 'A cobrança recorrente foi desativada. Você continuará com acesso até o fim do período vigente.';
  
      const successAlert = await this.alertController.create({
        header: 'Assinatura cancelada',
        message: msg,
        buttons: ['OK']
      });
  
      await successAlert.present();
    } catch (error) {
      const errorAlert = await this.alertController.create({
        header: 'Erro',
        message: 'Ocorreu um erro ao cancelar a assinatura. Tente novamente mais tarde.',
        buttons: ['OK']
      });
  
      await errorAlert.present();
    }
  }

  async openCustomerPortal() {
    await this.showLoading();
    try {
      const email = this.userEmail
      const response = await this.paymentService.createCustomerPortalSession(email);
      window.location.href = response!.url;
    } catch (error) {
      await this.showAlert('Erro', 'Não foi possível abrir a página de pagamento.');
    } finally {
      await this.hideLoading();
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  async showLoading() {
    this.loading = true;
  }
  
  async hideLoading() {
    this.loading = false;
  }

}
