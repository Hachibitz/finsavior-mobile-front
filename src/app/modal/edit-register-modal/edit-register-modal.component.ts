import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BillRegisterRequest } from 'src/app/model/main.model';
import { 
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonContent,
  IonItem, IonLabel, IonInput
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-register-modal',
  templateUrl: './edit-register-modal.component.html',
  styleUrls: ['./edit-register-modal.component.scss'],
  standalone: true,
  providers: [
    ModalController
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput
  ]
})
export class EditRegisterModalComponent implements OnInit {
  @Input() registerData!: BillRegisterRequest;
  editForm!: FormGroup;

  constructor(private fb: FormBuilder, private modalController: ModalController) {}

  ngOnInit() {
    this.editForm = this.fb.group({
      billName: [this.registerData.billName, Validators.required],
      billDescription: [this.registerData.billDescription],
      billValue: [this.registerData.billValue, [Validators.required, Validators.min(1)]],
    });
  }

  saveEdit() {
    if (this.editForm.valid) {
      const updatedData = { ...this.registerData, ...this.editForm.value };
      this.modalController.dismiss(updatedData, 'saved');
    }
  }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }
}