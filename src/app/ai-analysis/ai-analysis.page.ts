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
import { HttpErrorResponse } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { FsCoinService } from '../service/fs-coin-service';
import { AdmobService } from '../service/admob.service';

addIcons({
  'trash': trash
});

@Component({
    selector: 'app-ai-analysis',
    templateUrl: './ai-analysis.page.html',
    styleUrls: ['./ai-analysis.page.scss'],
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

  isWeb = Capacitor.getPlatform() === 'web';
  earnAmount: number = 10;

  analysisTypeListLabels = [
    {id: '1', label: 'Mensal'},
    {id: '2', label: 'Trimestral'},
    {id: '3', label: 'Anual'}
  ]

  analysisTypes: AnalysisType[] = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];

  userData!: UserData;
  userFsCoins: number = 0;

  constructor(
    private billService: BillService,
    private modalController: ModalController,
    private alertController: AlertController,
    private userService: UserService,
    private router: Router,
    private fsCoinService: FsCoinService,
    private admobService: AdmobService
  ) {
      addIcons({trash});}

  ngOnInit(): void {
    
  }

  async ionViewWillEnter() {
    await this.clearAllDataBeforeLoading();
    this.setUserData();
    this.loadAnalysis();
    this.getCoinsBalance();
  }

  async clearAllDataBeforeLoading() {
    this.analyses = [];
    this.filteredAnalyses = [];
    this.userData = {} as UserData;
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
    if (!analysis) {
      console.error('Análise inválida:', analysis);
      this.showAlert('Erro', 'Análise não encontrada.');
      return;
    }

    const modal = await this.modalController.create({
      component: AiAnalysisDetailModalComponent,
      componentProps: { analysis }
    });
    await modal.present();
  }

  async deleteAnalysis(analysisId: number, event: Event): Promise<void> {
    event.stopPropagation();

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
  
    modal.onDidDismiss().then(async (result) => {
      if (result.role === 'submit' && result.data) {
        const { analysisTypeId, selectedDate, temperature, finishDate, isUsingCoins } = result.data;
  
        this.isLoading();
        const haveCoverage = await this.validateSelectedAnalisysAndPlan(analysisTypeId);
        this.isLoading();
        if (!haveCoverage) {
          this.showUpgradePlanAlert(
            'Aviso',
            'Seu plano não cobre a análise selecionada. Faça o upgrade agora mesmo!'
          );
        } else {
          this.generateAiAdvice(analysisTypeId, selectedDate, temperature, finishDate, isUsingCoins);
        }
      }
    });
  
    await modal.present();
  }

  async validateSelectedAnalisysAndPlan(selectedAnalisys: number): Promise<boolean> {
    return await this.billService.validateHasCoverage(selectedAnalisys)
  }  
  
  async generateAiAdvice(analysisTypeId: number, startingDate: Date, temperature: number, finishDate: Date, isUsingCoins: boolean = false): Promise<void> {  
    const aiAdviceRequest = {
      analysisTypeId,
      temperature,
      startDate: this.toLocalISOString(startingDate),
      finishDate: this.toLocalISOString(finishDate),
      isUsingCoins: isUsingCoins
    };
  
    try {
      this.isLoading();
      const result = await this.billService.generateAiAdvice(aiAdviceRequest);
      const analysis: Analysis = await this.billService.getAiAdviceById(result.id);
      analysis.analysisType = this.analysisTypeListLabels.filter(type => type.id == analysis.analysisType)[0].label;
      await this.viewAnalysis(analysis);
    } catch (err: HttpErrorResponse | any) {
      const errorMessage = typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || err?.message || '';
      if(err.status === 412) {
        this.showAlert('Alerta', errorMessage || 'Saldo insuficiente para gerar análise de IA');
      }
      this.showAlert('Erro', errorMessage || 'Erro ao gerar conselho de IA');
    } finally {
      this.loadAnalysis();
      this.isLoading();
    }
  }

  async earnCoins() {
    const alert = await this.alertController.create({
      header: `Ganhar ${this.earnAmount} moedas`,
      message: `Assistir anúncio para receber ${this.earnAmount} FScoins?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: () => {
            alert.dismiss().then(() => {
              this.processRewardFlow();
            });
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  async processRewardFlow() {
    if(this.isWeb) {
      this.alertController.create({
        header: 'Atenção',
        message: 'Baixe o app na Play Store para usar essa funcionalidade.',
        buttons: ['OK']
      }).then(alert => alert.present());
      return
    }
    this.isLoading();
    try {
      const reward = await this.admobService.showRewardedAd();
      if (reward?.amount) {
        const earned = await this.fsCoinService.earnCoins();
        this.userFsCoins += earned;
      }
    } catch (e) {
      console.error('Erro ao carregar anúncio', e);
    } finally {
      this.isLoading();
    }
  }
  
  toLocalISOString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60000);
    return adjustedDate.toISOString().slice(0, -1);
  }

  formatDateStringForScreen(date: string): string {
    return date.replaceAll('-', '/').replaceAll('T', ' ').substring(0, 10);
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        'OK',
        {
          text: 'Ganhar moedas',
          handler: () => {
            this.earnCoins();
          }
        }
      ]
    });
    await alert.present();
  }

  async showUpgradePlanAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Planos',
          handler: () => {
            this.router.navigate(['main-page/subscription']);
          }
        },
        {
          text: 'Fechar',
          role: 'cancel'
        }
      ]
    });
  
    await alert.present();
  }  

  isLoading(): void {
    this.loading = !this.loading;
  }

  async getCoinsBalance() {
    this.fsCoinService.getBalance()
      .then(bal => this.userFsCoins = bal)
      .catch(err => console.error(err));
  }
}
