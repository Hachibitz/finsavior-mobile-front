import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonButton,
  IonLabel, IonCardSubtitle
} from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { CommonService } from '../service/common.service';
import { CardTableDataResponse, MainTableDataResponse } from '../model/main.model';

@Component({
  selector: 'app-main-summary',
  templateUrl: './main-summary.page.html',
  styleUrls: ['./main-summary.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonButton,
    IonLabel, IonCardSubtitle
  ]
})
export class MainSummaryPage implements OnInit, ViewWillEnter {
  currentlyAvailableIncome: number = 0;
  currentStatus: number = 0;
  liquidAndRightsStatus: number = 0;
  foreseenBalance: number = 0;
  situation: string = '';
  situationColor: string = '';
  situationDescription: string = '';
  loading: boolean = false;
  billDate: Date = new Date();
  totalPaid: number = 0;
  totalDebit: number = 0;
  totalLeft: string = '';

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private commonService: CommonService
  ) {}

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(date => {
      this.billDate = date;
      this.loadData();
    });
  }

  async loadData() {
    const currentDate = this.commonService.formatDate(this.billDate);
    const mainTableData = await this.billService.loadMainTableData(currentDate);
    const cardTableData = await this.billService.loadCardTableData(currentDate);

    this.calculateSummary(mainTableData, cardTableData);
  }

  async calculateSummary(mainTableData: MainTableDataResponse, cardTableData: CardTableDataResponse) {
    this.totalPaid = mainTableData.mainTableDataList.filter(row => row.paid).reduce((acc, row) => acc + row.billValue, 0);
    this.currentlyAvailableIncome = this.getAvailableIncome(mainTableData);
    this.setTotals(mainTableData, cardTableData);

    this.currentStatus = this.currentlyAvailableIncome - this.totalPaid;
    this.liquidAndRightsStatus = this.getIncomeTotal(mainTableData) - this.totalDebit;
    this.foreseenBalance = this.currentlyAvailableIncome - this.totalDebit;

    this.updateSituation();
  }

  getAvailableIncome(mainTableData: MainTableDataResponse): any {
    return mainTableData.mainTableDataList.filter(
      row => row.billType === 'Caixa' || row.billType === 'Ativo'
    ).reduce((acc, incomeRow) => acc + incomeRow.billValue, 0);
  }

  setTotals(mainTableData: MainTableDataResponse, cardTableData: CardTableDataResponse): void {
    this.totalDebit = this.getTotalDebit(mainTableData, cardTableData);
    this.totalLeft = (this.totalDebit - this.totalPaid).toFixed(2);
  }

  getIncomeTotal(mainTableData: MainTableDataResponse): number {
    return mainTableData.mainTableDataList.filter(
      row => row.billType === 'Caixa' || row.billType === 'Ativo' || row.billType === 'Poupança'
    ).reduce((acc, incomeRow) => acc + incomeRow.billValue, 0);
  }

  getTotalDebit(mainTableData: MainTableDataResponse, cardTableData: CardTableDataResponse): number {
    return (mainTableData.mainTableDataList.filter(row => row.billType === 'Passivo').reduce((acc, row) => acc + row.billValue, 0)) 
    + cardTableData.cardTableDataList.reduce((acc, row) => acc + row.billValue, 0);
  }

  updateSituation() {
    const percentage = (this.foreseenBalance / this.currentlyAvailableIncome) * 100;
    if (this.foreseenBalance < 0) {
      this.situation = 'Vermelho';
      this.situationColor = 'red';
      this.situationDescription = 'Saldo previsto menor que 0. Faça uma análise com a IA, pode te ajudar!';
    } else if (percentage >= 10) {
      this.situation = 'Azul';
      this.situationColor = 'blue';
      this.situationDescription = 'Saldo previsto maior que 10% do saldo disponível. Parabéns! Você está bem organizado com suas finanças. Faça uma análise de IA para te ajudar a se manter no Azul.';
    } else {
      this.situation = 'Amarelo';
      this.situationColor = 'yellow';
      this.situationDescription = 'Ponto de atenção: saldo previsto positivo mas próximo de 0. Uma análise com a IA pode te ajudar a evitar desvios futuros.';
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

  isLoading(): void {
    this.loading = !this.loading;
  }
}