import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { 
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  standalone: true,
  providers: [
    AlertController
  ],
  imports: [
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput,
    ReactiveFormsModule, CommonModule, FormsModule
  ]
})
export class DeleteAccountModalComponent {
  @Input() form!: FormGroup;

  constructor(private modalController: ModalController, private alertController: AlertController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.showAlert('Inválido', 'Preencha todos os campos corretamente.');
      return;
    }
    this.modalController.dismiss(this.form.value);
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
