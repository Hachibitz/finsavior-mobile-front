import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../service/bill.service';
import { ModalController } from '@ionic/angular';
import { 
  AlertController, IonHeader, IonToolbar, 
  IonTitle, IonContent, IonButton, 
  IonItem, IonLabel, IonList , 
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { CommonService } from '../service/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';

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
    IonIcon
  ]
})
export class MainCardDetailsPage implements OnInit, ViewWillEnter {
  cardRows: any[] = [];
  loading: boolean = false;
  billDate: Date = new Date();

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private modalController: ModalController
  ) {
      addIcons({trash});
    
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
      this.cardRows = result.cardTableDataList;
    } catch (error) {
      this.showAlert('Erro', 'Erro ao carregar dados de cartões');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
  }

  async openAddRegisterModal() {
    const isCardAccount = true;
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        isCardAccount: isCardAccount
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadCardTableData();
      }
    });

    return await modal.present();
  }

  async deleteItem(item: any) {
    this.isLoading();
    try {
      await this.billService.deleteItemFromCardTable(item.id);
      this.cardRows = this.cardRows.filter(row => row.id !== item.id);
      await this.showAlert('Sucesso', 'Item de cartão excluído com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao excluir item');
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
