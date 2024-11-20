import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton, IonLabel,
  IonItem, IonInput
} from '@ionic/angular/standalone';
import { UserService } from '../service/user.service';
import { ProfileEditModalComponent } from '../modal/profile-edit/profile-edit-modal.component';
import { DeleteAccountModalComponent } from '../modal/delete-account/delete-account-modal.component';
import { ChangePasswordModalComponent } from '../modal/change-password/change-password-modal.component';
import { Router } from '@angular/router';

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
    IonItem, IonInput
  ]
})
export class MyAccountPage implements OnInit {

  isDarkMode: boolean = false;
  passwordForm: FormGroup;
  deleteAccountForm: FormGroup;
  profileDataForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private userService: UserService,
    private modalController: ModalController,
    private router: Router
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
      profilePicture: [null]
    });
  }

  ngOnInit(): void {
    
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
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

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}
