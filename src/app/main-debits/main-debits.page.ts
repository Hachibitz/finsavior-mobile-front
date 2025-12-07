import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { EditRegisterModalComponent } from '../modal/edit-register-modal/edit-register-modal.component';
import { BillRegisterRequest, TableDataResponse, tableTypes, TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonText, 
  IonLabel, IonItem, IonInput, IonList,
  IonButtons, IonSelectOption, IonSelect,
  IonIcon, IonCheckbox, IonToast
} from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';
import { CommonService } from '../service/common.service';
import { ToastComponent } from '../components/toast/toast.component';
import { VoiceFabComponent } from '../components/voice-fab/voice-fab.component';

addIcons({
  'trash': trash,
  'create': create
});

@Component({
    selector: 'app-main-debits',
    templateUrl: './main-debits.page.html',
    styleUrls: ['./main-debits.page.scss'],
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
        IonCheckbox, IonToast, ToastComponent,
        VoiceFabComponent
    ]
})
export class MainDebitsPage implements OnInit, ViewWillEnter {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

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

  toast = {
    isOpen: false,
    message: '',
    color: '',
    duration: 3000, // Duração em milissegundos
    position: 'top' as 'top' | 'bottom' | 'middle' // Posição do toast
  };

  toastQueue: { message: string; color: 'success' | 'danger'; fadeOut: boolean }[] = [];

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

  async ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(async date => {
      this.billDate = date;
      await this.clearAllDataBeforeLoading();
      await this.loadTableData();
    });
  }

  async onVoiceDataReceived(aiData: any) {
    const { AddRegisterModalComponent } = await import('../modal/add-register/add-register-modal.component');
    
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        tableType: tableTypes.MAIN,
        billDate: this.billDate,
        initialData: aiData
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadTableData();
      }
    });

    await modal.present();
  }

  async clearAllDataBeforeLoading() {
    this.rows = [];
    this.totalDebit = 0;
  }

  async openAddRegisterModal() {
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        tableType: tableTypes.MAIN,
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

  async openEditModal(item: any) {
    const modal = await this.modalController.create({
      component: EditRegisterModalComponent,
      componentProps: { registerData: item },
    });
  
    modal.onDidDismiss().then(async (result) => {
      if (result.role === 'saved') {
        const updatedItem = result.data;
        try {
          await this.billService.editItem(updatedItem);
          const index = this.rows.findIndex((row) => row.id === updatedItem.id);
          if (index !== -1) {
            this.rows[index] = { ...this.rows[index], ...updatedItem };
          }
          await this.toastComponent.showToast(`Item atualizado com sucesso.`, 'success');
        } catch (error) {
          await this.toastComponent.showToast('Erro ao atualizar item.', 'danger');
          this.loadTableData();
        } finally {
          this.cdRef.detectChanges();
        }
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

  async updateTableData(mainTableData: TableDataResponse): Promise<void> {
    this.rows = await mainTableData.filter((row: { billType: string; }) => row.billType === 'Passivo');
    this.totalDebit = await this.rows.reduce((acc, row) => acc + row.billValue, 0);
    this.cdRef.detectChanges();
  }

  async deleteItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Deseja realmente excluir este item?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              await this.billService.deleteItem(item.id);
              this.rows = this.rows.filter(row => row.id !== item.id);
              await this.toastComponent.showToast('Item deletado com sucesso.', 'success');
            } catch (error) {
              await this.toastComponent.showToast('Erro ao deletar item.', 'danger');
            } finally {
              this.cdRef.detectChanges();
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

  async togglePaid(item: any) {
    const originalStatus = !item.paid;
    const updatedStatus = item.paid;
  
    const billUpdate: BillRegisterRequest = {
      id: item.id,
      billName: item.billName,
      billValue: item.billValue,
      billDescription: item.billDescription,
      billType: item.billType,
      billDate: this.commonService.formatDate(this.billDate),
      paid: updatedStatus,
      billTable: tableTypes.MAIN,
      billCategory: item.billCategory,
      isRecurrent: item.isRecurrent
    };
  
    try {
      await this.billService.editItem(billUpdate);
      const statusMessage = updatedStatus ? 'pago' : 'não pago';
      await this.toastComponent.showToast(`Item marcado como ${statusMessage}.`, 'success');
    } catch (error) {
      item.paid = originalStatus;
      await this.toastComponent.showToast('Não foi possível atualizar o estado do item.', 'danger');
    } finally {
      this.cdRef.detectChanges();
    }
  }

  showToast(message: string, color: 'success' | 'danger') {
    const toast = { message, color, fadeOut: false };
    this.toastQueue.push(toast);
  
    setTimeout(() => {
      toast.fadeOut = true;
      setTimeout(() => {
        this.toastQueue.shift();
        this.cdRef.detectChanges();
      }, 300);
    }, 3000);
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