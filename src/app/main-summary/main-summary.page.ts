import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { MainPageComponent } from '../main-page/main-page.page';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-main-summary',
  templateUrl: './main-summary.page.html',
  styleUrls: ['./main-summary.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MainPageComponent, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonButton
  ]
})
export class MainSummaryPage implements OnInit {
  currentlyAvailableIncome: number = 0;
  liquidStatus: number = 0;
  liquidAndRightsStatus: number = 0;
  foreseenBalance: number = 0;
  situation: string = '';
  situationColor: string = '';
  loading: boolean = false;

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private mainPageComponent: MainPageComponent
  ) {}

  ngOnInit() {
    this.calculateSummary();
  }

  async calculateSummary() {
    this.loading = true;
    try {
      const data = await this.billService.loadMainTableData(this.mainPageComponent.formatDate(new Date()));
      this.updateSummaryData(data.mainTableDataList);
      this.updateSituation();
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar resumo financeiro');
    } finally {
      this.loading = false;
    }
  }

  updateSummaryData(data: any[]) {
    this.currentlyAvailableIncome = data
      .filter(row => row.billType === 'Caixa' || row.billType === 'Ativo')
      .reduce((acc, row) => acc + row.billValue, 0);
    this.liquidStatus = this.currentlyAvailableIncome - data.filter(row => row.paid).reduce((acc, row) => acc + row.billValue, 0);
    this.foreseenBalance = this.liquidStatus; 
  }

  updateSituation() {
    const percentage = (this.foreseenBalance / this.currentlyAvailableIncome) * 100;
    if (this.foreseenBalance < 0) {
      this.situation = 'Vermelho';
      this.situationColor = 'red';
    } else if (percentage >= 10) {
      this.situation = 'Azul';
      this.situationColor = 'blue';
    } else {
      this.situation = 'Amarelo';
      this.situationColor = 'yellow';
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

  async openAiAdviceDialog() {
    const alert = await this.alertController.create({
      header: 'Conselhos da IA',
      message: 'Deseja gerar conselhos e insights financeiros?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Gerar',
          handler: async () => {
            this.loading = true;
            try {
              //await this.billService.generateAiAdvice(/* request data here */);
              await this.showAlert('Sucesso', 'Conselho da IA gerado com sucesso!');
            } catch (error) {
              await this.showAlert('Erro', 'Erro ao gerar conselho da IA');
            } finally {
              this.loading = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }
}