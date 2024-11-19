import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { 
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput,
    ReactiveFormsModule, CommonModule, FormsModule
  ]
})
export class ChangePasswordModalComponent {
  @Input() form!: FormGroup;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('Preencha todos os campos corretamente.');
      return;
    }
    this.modalController.dismiss(this.form.value);
  }
}
