import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { MainPageComponent } from '../main-page/main-page.page';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonLabel, 
  IonItem, IonList, IonIcon,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';

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
    BillService
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MainPageComponent, IonHeader, IonToolbar, 
    IonTitle, IonContent, IonButton,
    IonLabel, IonItem, IonList,
    IonIcon, IonButtons
  ]
})
export class MainAssetsPage implements OnInit {
  incomeRows: any[] = [];
  loading: boolean = false;

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private cdRef: ChangeDetectorRef,
    private mainPageComponent: MainPageComponent
  ) {}

  ngOnInit() {
    this.loadIncomeData();
  }

  async loadIncomeData() {
    this.loading = true;
    try {
      const result = await this.billService.loadMainTableData(this.mainPageComponent.formatDate(new Date()));
      this.incomeRows = result.mainTableDataList.filter(row => 
        row.billType === 'Caixa' || row.billType === 'Ativo' || row.billType === 'Poupança'
      );
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados de ativos e caixa');
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  async deleteItem(item: any) {
    this.loading = true;
    try {
      await this.billService.deleteItemFromMainTable(item.id);
      this.incomeRows = this.incomeRows.filter(row => row.id !== item.id);
      await this.showAlert('Sucesso', 'Item deletado com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao deletar item');
    } finally {
      this.loading = false;
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
}