import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../service/bill.service';
import { ModalController } from '@ionic/angular';
import { 
  AlertController, IonHeader, IonToolbar, 
  IonTitle, IonContent, IonButton, 
  IonItem, IonLabel, IonList , 
  IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';
import { CommonService } from '../service/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { TableDataResponse, tableTypes } from '../model/main.model';
import { EditRegisterModalComponent } from '../modal/edit-register-modal/edit-register-modal.component';

addIcons({ 'trash': trash });

@Component({
  selector: 'app-main-card-details',
  templateUrl: './main-card-details.page.html',
  styleUrls: ['./main-card-details.page.scss'],
  standalone: true,
  providers: [BillService, ModalController],
  imports: [
    CommonModule, IonHeader, IonToolbar, 
    IonTitle, IonContent, IonLabel, 
    IonItem, IonButton, IonList,
    IonIcon, IonButtons
  ]
})
export class MainCardDetailsPage implements OnInit, ViewWillEnter {
  cardRows: any[] = [];
  loading: boolean = false;
  billDate: Date = new Date();
  creditCardTotal: number = 0;

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

  ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(date => {
      this.billDate = date;
      this.loadCardTableData();
    });
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
    item.billTable = tableTypes.CREDIT_CARD;
    const modal = await this.modalController.create({
      component: EditRegisterModalComponent,
      componentProps: { registerData: item },
    });
  
    modal.onDidDismiss().then(async (result) => {
      if (result.role === 'saved') {
        const updatedItem = result.data;
        this.isLoading();
        try {
          await this.billService.editItem(updatedItem);
          await this.loadCardTableData();
          await this.showAlert('Sucesso', 'Registro atualizado com sucesso!');
        } catch (error) {
          await this.showAlert('Erro', 'Erro ao atualizar o registro.');
        } finally {
          this.isLoading();
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
            this.isLoading();
            try {
              await this.billService.deleteItem(item.id);
              this.cardRows = this.cardRows.filter(row => row.id !== item.id);
              await this.showAlert('Sucesso', 'Item de cartão excluído com sucesso');
            } catch (error) {
              await this.showAlert('Erro', 'Erro ao excluir item');
            } finally {
              this.isLoading();
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
