import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../service/bill.service';
import { ModalController } from '@ionic/angular';
import { 
  AlertController, IonHeader, IonToolbar, 
  IonTitle, IonContent, IonButton, 
  IonItem, IonLabel, IonList , 
  IonIcon, IonButtons, IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';
import { CommonService } from '../service/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { TableDataResponse, tableTypes } from '../model/main.model';
import { EditRegisterModalComponent } from '../modal/edit-register-modal/edit-register-modal.component';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../components/toast/toast.component';

addIcons({ 'trash': trash });

@Component({
    selector: 'app-main-card-details',
    templateUrl: './main-card-details.page.html',
    styleUrls: ['./main-card-details.page.scss'],
    providers: [BillService, ModalController],
    imports: [
        CommonModule, IonHeader, IonToolbar,
        IonTitle, IonContent, IonLabel,
        IonItem, IonButton, IonList,
        IonIcon, IonButtons, IonSegment,
        IonSegmentButton, FormsModule,
        ToastComponent
    ]
})
export class MainCardDetailsPage implements OnInit, ViewWillEnter {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  cardRows: any[] = [];
  paymentRows: any[] = [];
  loading: boolean = false;
  billDate: Date = new Date();
  creditCardTotal: number = 0;
  selectedSegment: string = 'registers';

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private modalController: ModalController
  ) {
      addIcons({create,trash});
    
  }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(async date => {
      this.billDate = date;
      await this.clearAllDataBeforeLoading();
      this.loadCardTableData();
      this.loadPaymentData();
    });
  }

  async clearAllDataBeforeLoading() {
    this.cardRows = [];
    this.paymentRows = [];
    this.creditCardTotal = 0;
  }

  async loadCardTableData() {
    this.isLoading();
    this.cardRows = [];

    try {
      const result = await this.billService.loadCardTableData(this.commonService.formatDate(this.billDate));
      this.cardRows = result;
      this.creditCardTotal = this.getTotalCreditCard(result);
    } catch (error) {
      this.showAlert('Erro', 'Erro ao carregar dados de cartões');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
  }

  async loadPaymentData() {
    this.isLoading();
    this.paymentRows = [];

    try {
      const data = await this.billService.loadPaymentCardTableData(this.commonService.formatDate(this.billDate));
      this.paymentRows = data.filter((item: any) => item.billTable === 'PAYMENT_CARD');
    } catch (error) {
      console.error('Erro ao carregar pagamentos de fatura:', error);
    } finally {
      this.isLoading();
    }
  }

  async openAddRegisterModal() {
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        tableType: tableTypes.CREDIT_CARD,
        billDate: this.billDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadCardTableData();
        this.loadPaymentData();
      }
    });

    return await modal.present();
  }

  async cardPaymentRegisterModal() {
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        tableType: tableTypes.PAYMENT_CARD,
        billDate: this.billDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadCardTableData();
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
          const targetList = item.billTable === tableTypes.CREDIT_CARD ? this.cardRows : this.paymentRows;
          const index = targetList.findIndex((row) => row.id === updatedItem.id);
          if (index !== -1) {
            targetList[index] = { ...targetList[index], ...updatedItem };
          }
          await this.toastComponent.showToast('Registro atualizado com sucesso.', 'success');
        } catch (error) {
          await this.toastComponent.showToast('Erro ao atualizar o registro.', 'danger');
        } finally {
          this.cdRef.detectChanges();
        }
      }
    });
  
    return await modal.present();
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
              if (item.billTable === tableTypes.CREDIT_CARD) {
                this.cardRows = this.cardRows.filter((row) => row.id !== item.id);
              } else if (item.billTable === tableTypes.PAYMENT_CARD) {
                this.paymentRows = this.paymentRows.filter((row) => row.id !== item.id);
              }
              await this.toastComponent.showToast('Item excluído com sucesso.', 'success');
            } catch (error) {
              await this.toastComponent.showToast('Erro ao excluir item.', 'danger');
            } finally {
              this.cdRef.detectChanges();
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

  getTotalCreditCard(cardTableData: TableDataResponse): number {
    return cardTableData.reduce((acc, row) => acc + row.billValue, 0);
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
