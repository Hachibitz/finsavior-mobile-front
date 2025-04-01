import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AiAnalysisDetailModalComponent } from '../modal/ai-analysis-detail/ai-analysis-detail-modal.component';
import { BillService } from '../service/bill.service';
import { Analysis, AnalysisType, AnalysisTypeEnum } from '../model/ai-advice.model';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonLabel, 
  IonItem, IonList, IonButtons, 
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { AiAnalysisCreateModalComponent } from '../modal/ai-analysis-create-modal/ai-analysis-create-modal.component';
import { UserData } from '../model/user.model';
import { UserService } from '../service/user.service';
import { CommonService } from '../service/common.service';
import { Router } from '@angular/router';
import { Plan, PlanCoverageEnum, PlanEnum } from '../model/payment.model';
import { ViewWillEnter } from '@ionic/angular';

addIcons({
  'trash': trash
});

@Component({
  selector: 'app-ai-analysis',
  templateUrl: './ai-analysis.page.html',
  styleUrls: ['./ai-analysis.page.scss'],
  standalone: true,
  providers: [
    ModalController, AlertController
  ],
  imports: [
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButton, IonLabel,
    IonItem, IonList, IonButtons,
    IonIcon, CommonModule
  ]
})
export class AiAnalysisPage implements OnInit, ViewWillEnter {
  analyses: Analysis[] = [];
  filteredAnalyses: Analysis[] = [];
  loading: boolean = false;

  analysisTypeListLabels = [
    {id: '1', label: 'Mensal'},
    {id: '2', label: 'Trimestral'},
    {id: '3', label: 'Anual'}
  ]

  analysisTypes: AnalysisType[] = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];

  userData!: UserData;

  constructor(
    private billService: BillService,
    private modalController: ModalController,
    private alertController: AlertController,
    private userService: UserService,
    private commonService: CommonService,
    private router: Router
  ) {
      addIcons({trash});}

  ngOnInit(): void {
    this.setUserData();
  }

  ionViewWillEnter() {
    this.loadAnalysis();
  }

  async loadAnalysis(): Promise<void> {
    this.loading = true;
    try {
      const data = await this.billService.getAiAdvices();
      data.forEach((register) => {
        register.analysisType = this.analysisTypeListLabels.filter(type => type.id == register.analysisType)[0].label;
      });
      this.analyses = data;
      this.filteredAnalyses = data;
    } catch (error) {
      this.showAlert('Erro', 'Erro ao carregar análises de IA');
    } finally {
      this.loading = false;
    }
  }

  setUserData(): void {
    this.isLoading();
    this.userService.getProfileData().then((result) => {
      this.userData = result;
    })
    .catch((error) => {
      this.showAlert('Erro', error.message || 'Erro ao carregar dados do usuário');
    })
    .finally(() => {
      this.isLoading();
    });
  }

  async viewAnalysis(analysis: Analysis): Promise<void> {
    const modal = await this.modalController.create({
      component: AiAnalysisDetailModalComponent,
      componentProps: { analysis }
    });
    await modal.present();
  }

  async deleteAnalysis(analysisId: number, event: Event): Promise<void> {
    event.stopPropagation();  // Evita abrir o modal ao deletar

    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: `Tem certeza de que deseja excluir a análise ${analysisId}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.loading = true;
            try {
              await this.billService.deleteAiAnalysis(analysisId);
              this.filteredAnalyses = this.filteredAnalyses.filter(a => a.id !== analysisId);
              this.showAlert('Sucesso', `Análise ${analysisId} excluída com sucesso`);
            } catch (error) {
              this.showAlert('Erro', 'Erro ao excluir a análise');
            } finally {
              this.loading = false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async openAiAnalysisDialog() {
    const modal = await this.modalController.create({
      component: AiAnalysisCreateModalComponent
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.role === 'submit' && result.data) {
        const { analysisTypeId, selectedDate, temperature, finishDate } = result.data;
  
        const haveCoverage = this.validateSelectedAnalisysAndPlan(this.userData, analysisTypeId);
        if (!haveCoverage) {
          this.showAlert(
            'Aviso',
            'Seu plano não cobre a análise selecionada. Faça o upgrade agora mesmo!'
          );
        } else {
          this.generateAiAdvice(analysisTypeId, selectedDate, temperature, finishDate);
        }
      }
    });
  
    await modal.present();
  }

  validateSelectedAnalisysAndPlan(userData: UserData, selectedAnalisys: number): boolean {
    const plan: Plan = PlanEnum.find(profilePlan => profilePlan.planId == userData.plan.planId)!!;
    const coverageList: AnalysisType[] = Object.values(PlanCoverageEnum).find(planCoverage => planCoverage.planId === plan.planId)!!.coverages;

    const chosenAnalysis: AnalysisType = coverageList.find(coverage => coverage.analysisTypeId == selectedAnalisys)!!;

    if(chosenAnalysis) {
      return true;
    }

    return false;
  }
  
  async generateAiAdvice(analysisTypeId: number, startingDate: Date, temperature: number, finishDate: Date): Promise<void> {
    const [mainAndIncomeTable, cardTable] = await Promise.all([
      this.getFormattedMainAndIncomeTables(analysisTypeId, startingDate),
      this.getFormattedCardTable(analysisTypeId, startingDate),
    ]);
  
    const aiAdviceRequest = {
      mainAndIncomeTable,
      cardTable,
      date: this.toLocalISOString(new Date()),
      analysisTypeId,
      temperature,
      startDate: this.toLocalISOString(startingDate),
      finishDate: this.toLocalISOString(finishDate),
    };
  
    try {
      this.isLoading();
      const result = await this.billService.generateAiAdvice(aiAdviceRequest);
      await this.loadAnalysis();
      const data = await this.analyses.find(analysis => analysis.id == result.id)!;
      await this.viewAnalysis(data);
    } catch (error: any) {
      this.showAlert('Erro', error.message || 'Erro ao gerar conselho de IA');
    } finally {
      this.isLoading();
    }
  }
  
  async getFormattedMainAndIncomeTables(analysisTypeId: number, startingDate: Date): Promise<string> {
    const analysisType = this.analysisTypes.find(type => type.analysisTypeId === analysisTypeId)!;
    let combinedString = '';
  
    for (let i = 0; i < analysisType.period; i++) {
      const currentMonth = this.addMonths(startingDate, i);
  
      const mainTableData = await this.billService.loadMainTableData(this.commonService.formatDate(currentMonth));
      const assetsTableData = await this.billService.loadAssetsTableData(this.commonService.formatDate(currentMonth));
      const incomeData = assetsTableData;
  
      combinedString += `\n--- Mês: ${this.commonService.formatDate(currentMonth)} ---\n`;
      combinedString += '### Dados Gerais (Main Table):\n';
      combinedString += this.generateFormattedTable(mainTableData);
  
      combinedString += '\n### Rendas (Income Table):\n';
      combinedString += this.generateFormattedTable(incomeData);
    }
  
    return combinedString;
  }
  
  async getFormattedCardTable(analysisTypeId: number, startingDate: Date): Promise<string> {
    const analysisType = this.analysisTypes.find(type => type.analysisTypeId === analysisTypeId)!;
    let combinedString = '';
  
    for (let i = 0; i < analysisType.period; i++) {
      const currentMonth = this.addMonths(startingDate, i);
  
      const cardTableData = await this.billService.loadCardTableData(this.commonService.formatDate(currentMonth));
      combinedString += `\n--- Mês: ${this.commonService.formatDate(currentMonth)} ---\n`;
      combinedString += '### Cartões de Crédito (Card Table):\n';
      combinedString += this.generateFormattedTable(cardTableData);
    }
  
    return combinedString;
  }
  
  generateFormattedTable(data: any[]): string {
    if (!data || data.length === 0) {
      return 'Nenhum dado disponível.\n';
    }
  
    const headers = Object.keys(data[0]);
    const headerLine = headers.join(' | ');
    const separatorLine = headers.map(() => '---').join(' | ');
    const rows = data.map(item => headers.map(header => item[header] ?? '').join(' | ')).join('\n');
  
    return `${headerLine}\n${separatorLine}\n${rows}\n`;
  }
  
  toLocalISOString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60000);
    return adjustedDate.toISOString().slice(0, -1);
  }

  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  formatDateStringForScreen(date: string): string {
    return date.replaceAll('-', '/').replaceAll('T', ' ').substring(0, 10);
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
