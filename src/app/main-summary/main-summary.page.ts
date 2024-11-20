import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { BillService } from '../service/bill.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonButton,
  IonLabel, IonCardSubtitle, IonIcon,
  IonButtons
} from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { CommonService } from '../service/common.service';
import { CardTableDataResponse, MainTableDataResponse, PaymentCardTableDataResponse } from '../model/main.model';
import { addIcons } from 'ionicons';
import { helpCircle } from 'ionicons/icons';

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
    IonLabel, IonCardSubtitle, IonIcon,
    IonButtons
  ]
})
export class MainSummaryPage implements OnInit, ViewWillEnter {
  cards: { title: string; value: number; description: string }[] = [];
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
  totalLeft: number = 0;
  cardPaymentTotal: number = 0;

  constructor(
    private billService: BillService,
    private alertController: AlertController,
    private commonService: CommonService
  ) {
    addIcons({helpCircle});
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(date => {
      this.billDate = date;
      this.loadData();
    });
  }

  async loadData() {
    this.isLoading();
    const currentDate = await this.commonService.formatDate(this.billDate);
    const mainTableData = await this.billService.loadMainTableData(currentDate);
    const cardTableData = await this.billService.loadCardTableData(currentDate);
    const paymentCardTableData = await this.billService.loadPaymentCardTableData(currentDate);

    await this.calculateSummary(mainTableData, cardTableData, paymentCardTableData);
    await this.populateCards();
    this.isLoading();
  }

  async calculateSummary(mainTableData: MainTableDataResponse, cardTableData: CardTableDataResponse, paymentCardTableData: PaymentCardTableDataResponse) {
    this.cardPaymentTotal = paymentCardTableData.paymentCardTableDataList.reduce((acc, row) => acc + row.billValue, 0);
    this.totalPaid = mainTableData.mainTableDataList.filter(row => row.paid).reduce((acc, row) => acc + row.billValue, 0) + this.cardPaymentTotal;
    this.currentlyAvailableIncome = this.getAvailableIncome(mainTableData);
    this.totalDebit = this.getTotalDebit(mainTableData, cardTableData);
    this.totalLeft = (this.totalDebit - this.totalPaid);
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

  getIncomeTotal(mainTableData: any): number {
    return mainTableData.mainTableDataList.filter(
      (row: { billType: string; }) => ['Caixa', 'Ativo', 'Poupança'].includes(row.billType)
    ).reduce((acc: any, row: { billValue: any; }) => acc + row.billValue, 0);
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
      this.situationDescription =
        'Você está no vermelho. Considere rever suas despesas e fazer uma análise detalhada para planejar melhor seus pagamentos.';
    } else if (percentage >= 10) {
      this.situation = 'Azul';
      this.situationColor = 'blue';
      this.situationDescription =
        'Ótimo trabalho! Sua situação financeira está estável e saudável. Continue mantendo boas práticas financeiras.';
    } else {
      this.situation = 'Amarelo';
      this.situationColor = 'yellow';
      this.situationDescription =
        'Atenção: Sua liquidez está positiva, mas baixa. Considere ajustes para garantir mais segurança financeira.';
    }
  }

  populateCards() {
    this.cards = [
      {
        title: 'Saldo total',
        value: this.currentlyAvailableIncome,
        description: 'Saldo total disponível do mês (Caixa + Ativos)'
      },
      {
        title: 'Total de gastos',
        value: this.totalDebit,
        description: 'Somatório das contas do mês (Passivos e cartão)'
      },
      {
        title: 'Total não pago',
        value: this.totalLeft,
        description: 'Somatório do total de contas não pagas ainda.'
      },
      {
        title: 'Total pago de cartão',
        value: this.cardPaymentTotal,
        description: 'Somatório do total de pagamentos de cartão de crédito.'
      },
      {
        title: 'Status atual',
        value: this.currentStatus,
        description: 'Saldo total menos o total pago.'
      },
      {
        title: 'Saldo previsto',
        value: this.foreseenBalance,
        description: 'Saldo disponível após todas as contas serem pagas.'
      },
      {
        title: 'Liquidez',
        value: this.liquidAndRightsStatus,
        description: 'Soma de ativos e direitos menos passivos do mês.'
      }
    ];
  }

  async showDescription(description: string) {
    const alert = await this.alertController.create({
      header: 'Detalhes do Cálculo',
      message: description,
      buttons: ['OK']
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