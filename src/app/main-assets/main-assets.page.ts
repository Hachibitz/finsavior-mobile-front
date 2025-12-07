import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { ToastComponent } from '../components/toast/toast.component';
import { VoiceFabComponent } from '../components/voice-fab/voice-fab.component';

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
    providers: [
        BillService, ModalController
    ],
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        MainPageComponent, IonHeader, IonToolbar,
        IonTitle, IonContent, IonButton,
        IonLabel, IonItem, IonList,
        IonIcon, IonButtons, ToastComponent, 
        VoiceFabComponent
    ]
})
export class MainAssetsPage implements OnInit, ViewWillEnter {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

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
        this.loadIncomeData();
      }
    });

    await modal.present();
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
        try {
          await this.billService.editItem(updatedItem);
          const index = this.incomeRows.findIndex((row) => row.id === updatedItem.id);
          if (index !== -1) {
            this.incomeRows[index] = { ...this.incomeRows[index], ...updatedItem };
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
            try {
              await this.billService.deleteItem(item.id);
              this.incomeRows = this.incomeRows.filter((row) => row.id !== item.id);
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