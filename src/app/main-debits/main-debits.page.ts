import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { BillRegisterRequest, CardTableDataResponse, MainTableDataResponse, tableTypes, TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonText, 
  IonLabel, IonItem, IonInput, IonList,
  IonButtons, IonSelectOption, IonSelect,
  IonIcon, IonCheckbox
} from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { CommonService } from '../service/common.service';

addIcons({
  'trash': trash
});

@Component({
  selector: 'app-main-debits',
  templateUrl: './main-debits.page.html',
  styleUrls: ['./main-debits.page.scss'],
  standalone: true,
  providers: [
    BillService, ModalController, AlertController
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, 
    IonTitle, IonContent, IonLabel, 
    IonItem, IonInput, IonButton,
    IonText, IonList, IonButtons,
    IonSelectOption, IonSelect, IonIcon,
    IonCheckbox
  ]
})
export class MainDebitsPage implements OnInit, ViewWillEnter {
  mainTableForm: FormGroup;
  rows: any[] = [];
  loading: boolean = false;
  billDate: Date = new Date();
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Passivo', value: 'Passivo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' }
  ];
  totalDebit: number = 0;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private billService: BillService,
    private cdRef: ChangeDetectorRef,
    private modalController: ModalController,
    private commonService: CommonService
  ) {
    this.mainTableForm = this.fb.group({
      billName: ['', Validators.required],
      billValue: ['', [Validators.required, Validators.min(1)]],
      billDescription: [''],
      selectedType: ['', Validators.required]
    });
  }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(date => {
      this.billDate = date;
      this.loadTableData();
    });
  }

  async openAddRegisterModal() {
    const isCardAccount = false;
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        isCardAccount: isCardAccount,
        billDate: this.billDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadTableData();
      }
    });

    return await modal.present();
  }

  async loadTableData(): Promise<void> {
    this.rows = [];

    this.isLoading();
    try {
      const requestDate = this.commonService.formatDate(this.billDate);
      const mainTableResult = await this.billService.loadMainTableData(requestDate);
      this.updateTableData(mainTableResult);
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados das tabelas');
    } finally {
      this.isLoading();
    }
  }

  async updateTableData(mainTableData: MainTableDataResponse): Promise<void> {
    this.rows = await mainTableData.mainTableDataList.filter((row: { billType: string; }) => row.billType === 'Passivo');
    this.totalDebit = await this.rows.reduce((acc, row) => acc + row.billValue, 0);
    this.cdRef.detectChanges();
  }

  async deleteItem(item: any) {
    this.isLoading();
    try {
      await this.billService.deleteItemFromMainTable(item.id);
      this.rows = this.rows.filter(row => row.id !== item.id);
      await this.showAlert('Sucesso', 'Item deletado com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao deletar item');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
  }

  async togglePaid(item: any) {
    const updatedStatus = !item.paid;
    const billUpdate: BillRegisterRequest = {
      id: item.id,
      billName: item.billName,
      billValue: item.billValue,
      billDescription: item.billDescription,
      billType: item.billType,
      billDate: this.commonService.formatDate(this.billDate),
      paid: updatedStatus,
      billTable: tableTypes.MAIN,
      isRecurrent: false
    };
  
    this.isLoading();
    try {
      await this.billService.editItemFromMainTable(billUpdate);
      await this.loadTableData();
      await this.showAlert('Sucesso', `Item marcado como ${updatedStatus ? 'pago' : 'não pago'}.`);
    } catch (error) {
      await this.showAlert('Erro', 'Não foi possível atualizar o estado do item.');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  isLoading(): void {
    this.loading = !this.loading;
  }
}