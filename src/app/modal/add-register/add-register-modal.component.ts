import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { BillService } from '../../service/bill.service';
import { BillRegisterRequest, tableTypes, TipoConta } from '../../model/main.model';
import { 
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, 
    IonSelect, IonSelectOption,
    IonCheckbox
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../service/common.service';

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
      <form [formGroup]="billRegisterForm" (ngSubmit)="addRegister()">
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
        <ion-item *ngIf="showCategorySelect">
          <ion-label>Categoria</ion-label>
          <ion-select formControlName="billCategory" interface="action-sheet">
            <ion-select-option *ngFor="let category of categories" [value]="category.value">
              {{ category.label }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <div *ngIf="isAssets">
          <ion-item>
            <ion-label>Tipo</ion-label>
            <ion-select formControlName="billType" interface="action-sheet">
              <ion-select-option *ngFor="let type of billTypes" [value]="type.value">{{ type.label }}</ion-select-option>
            </ion-select>
          </ion-item>
        </div>
        <ion-item *ngIf="showRecurrentCheckbox">
          <ion-label>Recorrente</ion-label>
          <ion-checkbox 
            formControlName="isRecurrent" 
            (ionChange)="onRecurrentChange($event)">
          </ion-checkbox>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="billRegisterForm.invalid">Salvar</ion-button>
      </form>
    </ion-content>
  `,
    standalone: true,
    imports: [
        IonHeader, IonToolbar, IonTitle, 
        IonContent, IonButtons, IonButton,
        IonItem, IonLabel, IonInput, 
        IonSelect, IonSelectOption, CommonModule,
        ReactiveFormsModule, IonCheckbox
    ]
})
export class AddRegisterModalComponent {

  isAssets: boolean = false;
  showRecurrentCheckbox: boolean = false;
  showCategorySelect: boolean = false;

  private _tableType: string = '';
  @Input() set tableType(value: string) {
    this._tableType = value;
    this.isAssets = this.tableType == tableTypes.ASSETS;
    this.showRecurrentCheckbox = this.tableType !== tableTypes.PAYMENT_CARD;
    this.showCategorySelect = this.tableType !== tableTypes.PAYMENT_CARD;
    this.setValidationRules();
    this.updateCategories();
  }
  
  get tableType(): string {
    return this._tableType;
  }

  private _billDate: Date = new Date();
  @Input() set billDate(value: Date) {
    this._billDate = value;
  }
  
  get billDate(): Date {
    return this._billDate;
  }

  billRegisterForm: FormGroup;
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' }
  ];

  loading: boolean =  false;

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

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private fb: FormBuilder,
    private billService: BillService,
    private commonService: CommonService
  ) {
    this.billRegisterForm = this.fb.group({
      billName: ['', Validators.required],
      billValue: ['', [Validators.required, Validators.min(1)]],
      billDescription: [''],
      billType: [''],
      isRecurrent: [false],
      billCategory: ['Outras'],
    });
  }

  setValidationRules() {
    if (this.isAssets) {
      this.billRegisterForm.get('billType')?.setValidators(Validators.required);
    } else {
      this.billRegisterForm.get('billType')?.clearValidators();
    }
  
    this.billRegisterForm.get('billType')?.updateValueAndValidity();
  }

  updateCategories() {
    if (this.tableType === tableTypes.MAIN || this.tableType === tableTypes.CREDIT_CARD) {
      this.categories = [...this.expenseCategories];
    } else if (this.tableType === tableTypes.ASSETS) {
      this.categories = [...this.incomeCategories];
    } else {
      this.categories = [];
    }
  }

  onRecurrentChange(event: any) {
    if (event.detail.checked) {
      this.confirmRecurrentChange();
    }
  }

  async confirmRecurrentChange() {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Deseja realmente marcar este registro como recorrente? Irá adicionar em todos os meses restantes do ano.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.billRegisterForm.patchValue({ isRecurrent: false });
          },
        },
        {
          text: 'Oxe, claro! Só faça como pedi >:[',
          handler: () => {
            
          },
        },
      ],
    });
  
    await alert.present();
  }

  async addRegister() {
    if (this.billRegisterForm.invalid) return;

    const billRegisterRequest: BillRegisterRequest = {
      ...this.billRegisterForm.value,
      billDate: this.commonService.formatDate(this.billDate),
      billTable: this.tableType,
      paid: false,
      isRecurrent: this.billRegisterForm.value.isRecurrent
    };

    this.setBillType(billRegisterRequest);

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

  setBillType(billRegisterRequest: BillRegisterRequest) {
    if(this.tableType != tableTypes.ASSETS && this.tableType != tableTypes.PAYMENT_CARD) {
      billRegisterRequest.billType = 'Passivo';
    }

    if(this.tableType == tableTypes.PAYMENT_CARD) {
      billRegisterRequest.billType = 'Payment';
    }
  }

  dismiss(role: string = 'cancel') {
    this.modalController.dismiss(null, role);
  }

  private isLoading() {
    this.loading = !this.loading
  }
}
