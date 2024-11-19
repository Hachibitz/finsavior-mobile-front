import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, 
    IonButton, IonLabel, IonItem,
    IonContent, IonButtons, IonTitle,
    IonToolbar, IonHeader, IonInput,
    FileInputComponent
  ]
})
export class ProfileEditModalComponent {
  @Input() form!: FormGroup;
  profilePicturePreview: string | ArrayBuffer | null = null;

  constructor(
    private modalController: ModalController,
    private userService: UserService
  ) {}

  closeModal() {
    this.modalController.dismiss();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.form.get('profilePicture')?.setValue(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfileData() {
    if (this.form.invalid) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const formData = new FormData();
    formData.append('username', this.form.get('username')?.value);
    formData.append('firstName', this.form.get('firstName')?.value);
    formData.append('lastName', this.form.get('lastName')?.value);
    formData.append('email', this.form.get('email')?.value);

    const profilePicture = this.form.get('profilePicture')?.value;
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      //await this.userService.updateProfile(formData);
      alert('Perfil atualizado com sucesso!');
      this.closeModal();
    } catch (error) {
      alert('Erro ao atualizar perfil.');
    }
  }
}
