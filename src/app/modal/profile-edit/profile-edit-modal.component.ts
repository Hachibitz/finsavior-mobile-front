import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { UserService } from 'src/app/service/user.service';
import {
    IonButton, IonLabel, IonItem,
    IonContent, IonButtons, IonTitle,
    IonToolbar, IonHeader, IonInput
} from '@ionic/angular/standalone';
import { FileInputComponent } from 'src/app/file-input-component/file-input.component';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
  standalone: true,
  providers: [
    AlertController
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, 
    IonButton, IonLabel, IonItem,
    IonContent, IonButtons, IonTitle,
    IonToolbar, IonHeader, IonInput,
    FileInputComponent
  ]
})
export class ProfileEditModalComponent implements OnInit {
  @Input() form!: FormGroup;
  profilePicturePreview: string | ArrayBuffer | null = null;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private alertController: AlertController
  ) {}
  
  ngOnInit(): void {
    this.profilePicturePreview = this.form.value.profilePicture || null;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
  
      // Atualiza o valor do formulário
      this.form.get('profilePicture')?.setValue(file);
  
      // Atualiza o preview da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfileData() {
    this.configureFormCustomValidator();

    if (this.form.invalid) {
      await this.showAlert('Inválido', 'Pelo menos um campo deve ser preenchido.');
      return;
    }

    const formData = new FormData();

    const firstName = this.form.get('firstName')?.value;
    const lastName = this.form.get('lastName')?.value;
    const username = this.form.get('username')?.value;
    const profilePicture = this.form.get('profilePicture')?.value;

    if (firstName) formData.append('firstName', firstName);
    if (lastName) formData.append('lastName', lastName);
    if (username) formData.append('username', username);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    try {
      await this.userService.updateProfile(formData);
      await this.showAlert('Sucesso', 'Perfil atualizado com sucesso!');
      this.closeModal();
    } catch (error: any) {
      await this.showAlert('Erro', error.message || 'Erro ao atualizar perfil.');
    }
  }

  configureFormCustomValidator() {
    this.form.clearValidators();
    this.form.setValidators(this.atLeastOneFieldRequired());
    this.form.updateValueAndValidity();
  }

  atLeastOneFieldRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const firstName = control.get('firstName')?.value;
      const lastName = control.get('lastName')?.value;
      const username = control.get('username')?.value;
      const profilePicture = control.get('profilePicture')?.value;

      if (firstName || lastName || profilePicture || username) {
        return null;
      }

      return { atLeastOneRequired: true };
    };
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
