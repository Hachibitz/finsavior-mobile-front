import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonButton, IonContent,
  IonItem, IonLabel, IonInput, IonDatetime,
  IonDatetimeButton, IonSelect, IonSelectOption,
  IonIcon
} from '@ionic/angular/standalone';
import { UserService } from 'src/app/service/user.service';
import { PlanCoverageEnum } from 'src/app/model/payment.model';
import { AnalysisTypeEnum } from 'src/app/model/ai-advice.model';
import { CommonService } from 'src/app/service/common.service';
import { FsCoinService } from 'src/app/service/fs-coin-service';
import { AlertController, ViewWillLeave } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AdmobService } from 'src/app/service/admob.service';
import { helpCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
    selector: 'app-ai-analysis-create-modal',
    templateUrl: './ai-analysis-create-modal.component.html',
    styleUrls: ['./ai-analysis-create-modal.component.scss'],
    imports: [
        CommonModule, ReactiveFormsModule,
        IonHeader, IonToolbar, IonTitle,
        IonButtons, IonButton, IonContent,
        IonItem, IonLabel, IonInput, IonDatetime,
        IonDatetimeButton, IonSelect, IonSelectOption,
        FormsModule, NgxSliderModule, IonIcon
    ]
})
export class AiAnalysisCreateModalComponent implements ViewWillLeave {
  form: FormGroup;
  temperatureSliderValue: number = 0;
  sliderOptions: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 0, legend: "Mais precisão" },
      { value: 0.1 },
      { value: 0.2 },
      { value: 0.3 },
      { value: 0.4 },
      { value: 0.5, legend: "Equilibrado" },
      { value: 0.6 },
      { value: 0.7 },
      { value: 0.8 },
      { value: 0.9 },
      { value: 1, legend: "Mais criativo" }
    ],
    disabled: false
  };
  userHasNeededPlan = false;

  analysisTypes = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];
  isUsingFsCoins = false;
  userFsCoins: number = 0;
  coinsCostForAnalysis: number = 25;
  animate = false;
  isWeb = Capacitor.getPlatform() === 'web';
  earnAmount: number = 10;
  loading: boolean = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private userService: UserService,
    private commonService: CommonService,
    private fsCoinService: FsCoinService,
    private alertController: AlertController,
    private admobService: AdmobService
  ) {
    this.form = this.fb.group({
      analysisType: ['', Validators.required],
      date: ['', Validators.required],
      temperature: [this.temperatureSliderValue, Validators.required]
    });
  
    this.commonService.selectedDate$.subscribe(date => {
      const formattedDate = date.toISOString().slice(0, 7);
      this.form.patchValue({ date: formattedDate });
    });
    this.form.get('date')?.markAsDirty(); 
    this.form.get('date')?.updateValueAndValidity();

    addIcons({helpCircle});
  
    this.checkUserPlan();
    this.getCoinsBalance();
  }

  async ionViewWillLeave(): Promise<void> {
    await this.admobService.showSimpleInterstitial()
  }
  
  dismissModal(role: string = 'cancel') {
    this.modalController.dismiss(null, role);
  }

  onSave() {
    if (this.form.valid) {
      const [year, month] = this.form.value.date.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, 1);
      const analysisType = this.analysisTypes.filter(analysisType => analysisType.analysisTypeId == this.form.value.analysisType)[0];
      
      const finishDate = new Date(selectedDate);
      finishDate.setMonth(selectedDate.getMonth() + analysisType.period);
      finishDate.setDate(finishDate.getDate() - 1);
      finishDate.setHours(23, 59, 59);
      selectedDate.setHours(0, 0, 0);

      const formData = {
        analysisTypeId: this.form.value.analysisType,
        selectedDate: selectedDate,
        temperature: this.temperatureSliderValue,
        finishDate: finishDate,
        isUsingCoins: this.isUsingFsCoins
      };
      this.modalController.dismiss(formData, 'submit');
    } else {
      this.form.markAllAsTouched();
    }
  }

  checkUserPlan(): void {
    this.userService.getProfileData().then((result) => {
      this.userHasNeededPlan = result.plan.planId !== PlanCoverageEnum.FREE.planId;
      this.updateSliderState();
    }).catch((error) => {
      this.userHasNeededPlan = false;
      this.updateSliderState();
    });
  }

  onAnalysisTypeSelected() {
    if(this.checkCoinCostForChosenAnalysisType()) {
      this.form.patchValue({ analysisType: AnalysisTypeEnum.FREE.analysisTypeId });
      this.alertController.create({
        header: 'Saldo insuficiente',
        message: 'Você não possui moedas suficientes para usar a Savi com FSCoins.',
        buttons: [
          'OK',
          {
            text: 'Ganhar moedas',
            handler: () => {
              this.earnCoins();
            }
          }
        ]
      }).then(alert => alert.present());
      return;
    }
  }

  async getCoinsBalance() {
    this.fsCoinService.getBalance()
      .then(bal => this.userFsCoins = bal)
      .catch(err => console.error(err));
  }

  updateSliderState() {
    this.sliderOptions = Object.assign({}, this.sliderOptions, {disabled: !this.userHasNeededPlan});
  }

  toggleFsCoinsUsage() {
    if(this.isUsingFsCoins) {
      this.isUsingFsCoins = false;
      return;
    }
    if(this.checkCoinCostForChosenAnalysisType()) {
      this.alertController.create({
        header: 'Saldo insuficiente',
        message: 'Você não possui moedas suficientes para usar a Savi com FSCoins.',
        buttons: [
          'OK',
          {
            text: 'Ganhar moedas',
            handler: () => {
              this.earnCoins();
            }
          }
        ]
      }).then(alert => alert.present());
      return;
    }

    this.isUsingFsCoins = !this.isUsingFsCoins;

    this.animate = true;
    setTimeout(() => {
      this.animate = false;
    }, 300);
  }

  private checkCoinCostForChosenAnalysisType(): boolean {
    const currentChosenAnalysisId = this.form.value.analysisType ? this.form.value.analysisType : AnalysisTypeEnum.FREE.analysisTypeId;
    const costForCurrentChosenAnalysis = this.analysisTypes.find(type => type.analysisTypeId === currentChosenAnalysisId)!!.coinCostForAnalysis;
    return costForCurrentChosenAnalysis > this.userFsCoins;
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
    this.showLoading();
    try {
      const reward = await this.admobService.showRewardedAd();
      if (reward?.amount) {
        const earned = await this.fsCoinService.earnCoins();
        this.userFsCoins += earned;
      }
    } catch (e) {
      console.error('Erro ao carregar anúncio', e);
    } finally {
      this.hideLoading();
    }
  }

  showFsCoinsHelp() {
    this.alertController.create({
      header: 'O que são FSCoins?',
      message: 'FSCoins são a moeda virtual do FinSavior. Você pode usá-las para pagar por análises de IA e outras funcionalidades premium. Você pode ganhar FSCoins assistindo a anúncios ou realizando tarefas dentro do aplicativo. Custos: Chat com Savi: 25 FSCoins, Análise de IA Mensal: 25 FSCoins, Análise de IA Trimestral: 60 FSCoins, Análise de IA Anual: 120 FSCoins.',
      buttons: ['OK']
    }).then(alert => alert.present());
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }
}
