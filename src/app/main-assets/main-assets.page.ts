import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { MainPageComponent } from '../main-page/main-page.page';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonLabel, 
  IonItem, IonList, IonIcon,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';
import { CommonService } from '../service/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { tableTypes } from '../model/main.model';
import { EditRegisterModalComponent } from '../modal/edit-register-modal/edit-register-modal.component';

addIcons({
  'trash': trash
});

export interface IncomeRow {
  id: number;
  Nome: string;
  Valor: string;
  Tipo: string;
  Descricao: string;
  Data: string
}

@Component({
  selector: 'app-main-assets',
  templateUrl: './main-assets.page.html',
  styleUrls: ['./main-assets.page.scss'],
  standalone: true,
  providers: [
    BillService, ModalController
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MainPageComponent, IonHeader, IonToolbar, 
    IonTitle, IonContent, IonButton,
    IonLabel, IonItem, IonList,
    IonIcon, IonButtons
  ]
})
export class MainAssetsPage implements OnInit, ViewWillEnter {
  incomeRows: any[] = [];
  loading: boolean = false;

  billDate: Date = new Date();

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private modalController: ModalController
  ) {
      addIcons({create,trash});}

  ngOnInit() {
    this.loadIncomeData();
  }

  async ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(async date => {
      this.billDate = date;
      await this.clearAllDataBeforeLoading();
      this.loadIncomeData();
    });
  }

  async clearAllDataBeforeLoading() {
    this.incomeRows = [];
  }

  async openAddRegisterModal() {
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent,
      componentProps: {
        tableType: tableTypes.ASSETS,
        billDate: this.billDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadIncomeData();
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
        this.isLoading();
        try {
          await this.billService.editItem(updatedItem);
          await this.loadIncomeData();
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

  async loadIncomeData(date: string = this.commonService.formatDate(this.billDate)) {
    this.isLoading();
    try {
      this.incomeRows = await this.billService.loadAssetsTableData(date);
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados de ativos e caixa');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
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
              this.incomeRows = this.incomeRows.filter(row => row.id !== item.id);
              await this.showAlert('Sucesso', 'Item deletado com sucesso');
            } catch (error) {
              await this.showAlert('Erro', 'Erro ao deletar item');
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

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  isLoading() {
    this.loading = !this.loading;
  }
}