import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { TipoConta } from '../model/main.model';
import { 
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, 
    IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from '../main-page/main-page.page';

@Component({
  selector: 'app-add-register-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Adicionar Registro</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <div class="overlay" *ngIf="loading">
        <div class="custom-loader"></div>
    </div>

    <ion-content class="ion-padding">
      <form [formGroup]="mainTableForm" (ngSubmit)="addRegisterMain()">
        <ion-item>
          <ion-label position="floating">Nome da Conta</ion-label>
          <ion-input formControlName="billName"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Valor</ion-label>
          <ion-input type="number" formControlName="billValue"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Descrição</ion-label>
          <ion-input formControlName="billDescription"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Tipo</ion-label>
          <ion-select formControlName="billType" interface="action-sheet">
            <ion-select-option *ngFor="let type of billTypes" [value]="type.value">{{ type.label }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="mainTableForm.invalid">Salvar</ion-button>
      </form>
    </ion-content>
  `,
    standalone: true,
    imports: [
        IonHeader, IonToolbar, IonTitle, 
        IonContent, IonButtons, IonButton,
        IonItem, IonLabel, IonInput, 
        IonSelect, IonSelectOption, CommonModule,
        ReactiveFormsModule, MainPageComponent
    ]
})
export class AddRegisterModalComponent {
  mainTableForm: FormGroup;
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Passivo', value: 'Passivo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' }
  ];

  tableTypes: string[] = [
    'main',
    'credit-card'
  ]

  loading: boolean =  false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private billService: BillService,
    private mainPageComponent: MainPageComponent
  ) {
    this.mainTableForm = this.fb.group({
      billName: ['', Validators.required],
      billValue: ['', [Validators.required, Validators.min(1)]],
      billDescription: [''],
      billType: ['', Validators.required]
    });
  }

  async addRegisterMain() {
    if (this.mainTableForm.invalid) return;

    const billRegisterRequest = {
      ...this.mainTableForm.value,
      billDate: this.mainPageComponent.formatDate(new Date()),
      billTable: this.tableTypes[0],
      isRecurrent: false,
      paid: false
    };

    this.isLoading();
    try {
      await this.billService.billRegister(billRegisterRequest);
      this.isLoading();
      this.dismiss('saved');
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      this.isLoading()
    }
  }

  dismiss(role: string = 'cancel') {
    this.modalController.dismiss(null, role);
  }

  private isLoading() {
    this.loading = !this.loading
  }
}
