import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BillRegisterRequest, tableTypes } from 'src/app/model/main.model';
import { 
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonContent,
  IonItem, IonLabel, IonInput,
  IonSelectOption, IonSelect
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-edit-register-modal',
    templateUrl: './edit-register-modal.component.html',
    styleUrls: ['./edit-register-modal.component.scss'],
    providers: [
        ModalController
    ],
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        IonHeader, IonToolbar, IonTitle,
        IonButtons, IonButton, IonContent,
        IonItem, IonLabel, IonInput,
        IonSelectOption, IonSelect
    ]
})
export class EditRegisterModalComponent implements OnInit {
  @Input() registerData!: BillRegisterRequest;
  editForm!: FormGroup;

  expenseCategories: { label: string; value: string }[] = [
    { label: 'Alimentação', value: 'Alimentação' },
    { label: 'Moradia', value: 'Moradia' },
    { label: 'Energia', value: 'Energia' },
    { label: 'Água', value: 'Água' },
    { label: 'Internet', value: 'Internet' },
    { label: 'Transporte', value: 'Transporte' },
    { label: 'Saúde', value: 'Saúde' },
    { label: 'Educação', value: 'Educação' },
    { label: 'Cuidados Pessoais', value: 'Cuidados Pessoais' },
    { label: 'Lazer', value: 'Lazer' },
    { label: 'Seguro', value: 'Seguro' },
    { label: 'Pets', value: 'Pets' },
    { label: 'Assinaturas', value: 'Assinaturas' },
    { label: 'Compras', value: 'Compras' },
    { label: 'Outras', value: 'Outras' },
  ];

  incomeCategories: { label: string; value: string }[] = [
    { label: 'Salário', value: 'Salário' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Projetos', value: 'Projetos' },
    { label: 'Aposentadoria', value: 'Aposentadoria' },
    { label: 'Bolsas', value: 'Bolsas' },
    { label: 'Bonificações', value: 'Bonificações' },
    { label: 'Vendas', value: 'Vendas' },
    { label: 'Investimentos', value: 'Investimentos' },
    { label: 'Poupança', value: 'Poupança' },
    { label: 'Outras', value: 'Outras' },
  ];

  categories: { label: string; value: string }[] = [];

  showCategorySelect: boolean = false;

  constructor(private fb: FormBuilder, private modalController: ModalController) {}

  ngOnInit() {
    this.showCategorySelect = this.registerData.billTable !== tableTypes.PAYMENT_CARD;
    this.updateCategories();

    this.editForm = this.fb.group({
      billName: [this.registerData.billName, Validators.required],
      billDescription: [this.registerData.billDescription],
      billValue: [this.registerData.billValue, [Validators.required, Validators.min(1)]],
      billCategory: [this.registerData.billCategory || 'Outras', Validators.required],
    });
  }

  saveEdit() {
    if (this.editForm.valid) {
      const updatedData = { ...this.registerData, ...this.editForm.value };
      this.modalController.dismiss(updatedData, 'saved');
    }
  }

  updateCategories() {
    if (this.registerData.billTable === tableTypes.MAIN || this.registerData.billTable === tableTypes.CREDIT_CARD) {
      this.categories = [...this.expenseCategories];
    } else if (this.registerData.billTable === tableTypes.ASSETS) {
      this.categories = [...this.incomeCategories];
    } else {
      this.categories = [];
    }
  }

  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }
}