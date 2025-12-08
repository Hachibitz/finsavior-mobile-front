import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { BillService } from '../../service/bill.service';
import { BillRegisterRequest, tableTypes, TipoConta } from '../../model/main.model';
import { 
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, 
    IonSelect, IonSelectOption,
    IonCheckbox, IonSegment, IonSegmentButton, 
    IonIcon
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
          <ion-label position="floating">Valor (Parcela ou Total)</ion-label>
          <ion-input type="number" formControlName="billValue"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Descrição</ion-label>
          <ion-input formControlName="billDescription"></ion-input>
        </ion-item>

        <ion-item *ngIf="showCategorySelect">
          <ion-label>Categoria</ion-label>
          <ion-select formControlName="billCategory" interface="action-sheet" (ionChange)="onCategoryChange($event)">
            <ion-select-option *ngFor="let category of categories" [value]="category.value">
              {{ category.label }}
            </ion-select-option>
            <ion-select-option value="custom">+ Nova Categoria...</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item *ngIf="isCustomCategory" class="animate-fade">
           <ion-label position="floating">Digite a Nova Categoria</ion-label>
           <ion-input formControlName="customCategory"></ion-input>
        </ion-item>

        <div *ngIf="isAssets">
          <ion-item>
            <ion-label>Tipo</ion-label>
            <ion-select formControlName="billType" interface="action-sheet">
              <ion-select-option *ngFor="let type of billTypes" [value]="type.value">{{ type.label }}</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <div class="frequency-section" *ngIf="showRecurrentCheckbox" style="margin-top: 20px;">
            <ion-label style="margin-left: 15px; font-size: 0.9em; color: gray;">Frequência</ion-label>
            <ion-segment (ionChange)="onFrequencyChange($event)" [value]="frequencyType">
                <ion-segment-button value="SINGLE">
                    <ion-label>Único</ion-label>
                </ion-segment-button>
                <ion-segment-button value="RECURRENT">
                    <ion-label>Fixo</ion-label>
                </ion-segment-button>
                <ion-segment-button value="INSTALLMENT">
                    <ion-label>Parcelado</ion-label>
                </ion-segment-button>
            </ion-segment>
        </div>

        <ion-item *ngIf="frequencyType === 'INSTALLMENT'" lines="none" class="animate-fade">
            <ion-label position="stacked">Número de Parcelas</ion-label>
            <ion-input 
                type="number" 
                formControlName="installmentCount" 
                placeholder="Ex: 12">
            </ion-input>
        </ion-item>

        <ion-item *ngIf="frequencyType === 'RECURRENT'" lines="none" class="animate-fade">
           <p style="font-size: 0.8em; color: var(--ion-color-medium);">
             Isso repetirá a conta todos os meses até Dezembro.
           </p>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="billRegisterForm.invalid" class="ion-margin-top">Salvar</ion-button>
      </form>
    </ion-content>
  `,
    imports: [
        IonHeader, IonToolbar, IonTitle,
        IonContent, IonButtons, IonButton,
        IonItem, IonLabel, IonInput,
        IonSelect, IonSelectOption, CommonModule,
        ReactiveFormsModule, IonCheckbox, 
        IonSegment, IonSegmentButton, IonIcon
    ],
    standalone: true
})
export class AddRegisterModalComponent implements OnInit {

  isAssets: boolean = false;
  showRecurrentCheckbox: boolean = false;
  showCategorySelect: boolean = false;
  frequencyType: 'SINGLE' | 'RECURRENT' | 'INSTALLMENT' = 'SINGLE';

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

  @Input() initialData: any = null;
  isCustomCategory: boolean = false;
  entryMethod: 'MANUAL' | 'AUDIO' = 'MANUAL';

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
      frequencyType: ['SINGLE'],
      installmentCount: [2]
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  populateForm(data: any) {
    this.entryMethod = 'AUDIO';
    if (data.isInstallment) {
      this.frequencyType = 'INSTALLMENT';
      this.billRegisterForm.get('installmentCount')?.setValidators([Validators.required, Validators.min(2)]);
    } else if (data.isRecurrent) {
      this.frequencyType = 'RECURRENT';
    } else {
      this.frequencyType = 'SINGLE';
    }

    this.billRegisterForm.patchValue({
      billName: data.billName,
      billValue: data.billValue,
      billDescription: data.billDescription,
      billCategory: data.billCategory || 'Outras',
      installmentCount: data.installmentCount,
      frequencyType: this.frequencyType,
      entryMethod: this.entryMethod
    });
    
    this.billRegisterForm.updateValueAndValidity();
  }

  onCategoryChange(event: any) {
    if (event.detail.value === 'custom') {
      this.isCustomCategory = true;
      this.billRegisterForm.get('customCategory')?.setValidators([Validators.required]);
    } else {
      this.isCustomCategory = false;
      this.billRegisterForm.get('customCategory')?.clearValidators();
      this.billRegisterForm.get('customCategory')?.setValue('');
    }
    this.billRegisterForm.get('customCategory')?.updateValueAndValidity();
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

  onFrequencyChange(event: any) {
    this.frequencyType = event.detail.value;
    const countControl = this.billRegisterForm.get('installmentCount');

    if (this.frequencyType === 'INSTALLMENT') {
        countControl?.setValidators([Validators.required, Validators.min(2)]);
    } else {
        countControl?.clearValidators();
    }
    countControl?.updateValueAndValidity();
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

    const formVal = this.billRegisterForm.value;

    let finalCategory = formVal.billCategory;
    if (this.isCustomCategory) {
        finalCategory = formVal.customCategory;
    }
    
    const billRegisterRequest: BillRegisterRequest = {
      ...formVal,
      billDate: this.commonService.formatDate(this.billDate),
      billTable: this.tableType,
      paid: false,
      isRecurrent: this.frequencyType === 'RECURRENT',
      isInstallment: this.frequencyType === 'INSTALLMENT',
      installmentCount: this.frequencyType === 'INSTALLMENT' ? formVal.installmentCount : null,
      frequencyType: this.frequencyType,
      entryMethod: this.entryMethod
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
