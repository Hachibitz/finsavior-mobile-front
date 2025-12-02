import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButtons, IonButton,
  IonIcon, IonCardContent, IonCardHeader,
  IonCard, IonCardTitle, IonCardSubtitle,
  IonChip
} from '@ionic/angular/standalone';
import { UserService } from '../service/user.service';
import { PaymentService } from '../service/payment.service';
import { PLANS } from '../model/plan.model';
import { Plan } from '../model/payment.model';
import { AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { LoginRequest } from '../model/user.model';
import { AuthService } from '../service/auth.service';
import { PlanChoiceModalComponent } from '../modal/plan-choice-modal/plan-choice-modal.component';
import { loadStripe, Stripe, StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from 'src/environments/environment';

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.page.html',
    styleUrls: ['./subscription.page.scss'],
    providers: [
        ModalController
    ],
    imports: [
        IonContent, IonHeader, IonTitle,
        IonToolbar, CommonModule, FormsModule,
        IonButtons, IonButton, IonIcon,
        IonCardContent, IonCardHeader, IonCard,
        IonCardTitle, IonCardSubtitle, IonChip
    ]
})
export class SubscriptionPage implements OnInit, ViewWillEnter {

  private alertDisplayed: boolean = false;

  loading: boolean = false;

  plans = PLANS;

  groupedPlans: any[] = [];

  stripe: Stripe | undefined;
  checkout: StripeEmbeddedCheckout | undefined;

  currentPlan!: Plan;
  userEmail: string = '';
  username: string = '';

  constructor(
    private userService: UserService, private paymentService: PaymentService, 
    private alertCtrl: AlertController, private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) { }
  
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async params => {
      const sessionId = params.get('session_id');
      if (sessionId) {
        await this.handleSuccessfulCheckout(sessionId);
      }
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.clearAllDataBeforeLoading();
    this.getCurrentUserPlanData();
    this.groupPlans();
  }

  async clearAllDataBeforeLoading() {
    this.currentPlan = undefined!;
    this.userEmail = '';
    this.username = '';
  }

  async getCurrentUserPlanData() {
    const profileData = await this.userService.getProfileData()
    this.currentPlan = profileData.plan;
    this.userEmail = profileData.email;
    this.username = profileData.username;
  }

  async subscribe(plan: any) {
    try {
      if (this.currentPlan.planDs === 'FREE') {
        await this.showLoading();
        const checkoutSession = await this.paymentService.createCheckoutSession(plan.type, this.userEmail);

        if (checkoutSession.clientSecret) {
          const stripeInstance = await loadStripe(STRIPE_PUBLIC_KEY);
          if (!stripeInstance) {
            throw new Error('Failed to initialize Stripe.');
          }
          this.stripe = stripeInstance;

          this.checkout = await this.stripe.initEmbeddedCheckout({
            clientSecret: checkoutSession.clientSecret,
            onComplete: () => {
              this.handleSuccessfulCheckout("");
              setTimeout(() => {
                this.closeCheckout();
              }, 500);
            }
          });

          this.checkout.mount('#checkout');
        } else {
          window.location.href = checkoutSession.url; // fallback pra modo clássico se necessário
        }
      } else {
        const isUpgrade = this.comparePlans(plan.type, this.currentPlan.planDs) > 0;
        const isDowngrade = this.comparePlans(plan.type, this.currentPlan.planDs) < 0;
    
        const message = isUpgrade
          ? 'Você está fazendo um upgrade de plano. O valor proporcional ao restante do período atual será cobrado imediatamente.'
          : isDowngrade
            ? 'Você está fazendo um downgrade de plano. A alteração será aplicada no próximo ciclo de cobrança.'
            : 'Deseja realmente alterar seu plano?';
    
        const confirmAlert = await this.alertCtrl.create({
          header: 'Alterar plano',
          message,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Confirmar',
              handler: () => this.promptReLoginForPlanChange(plan)
            }
          ]
        });
    
        await confirmAlert.present();
      }
    } catch (error: any) {
      console.error('Erro ao preparar alteração de plano:', error);
      this.showErrorAlert('Erro ao preparar alteração de plano', error.message 
        || 'Erro ao processar a solicitação. Tente novamente mais tarde.');
    } finally {
      await this.hideLoading();
    }
  }

  closeCheckout() {
    this.checkout?.destroy();
    this.checkout = undefined;
  }
  
  private async promptReLoginForPlanChange(plan: any) {
    const loginAlert = await this.alertCtrl.create({
      header: 'Confirme sua identidade',
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: this.username,
          placeholder: 'Username',
          disabled: true
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Senha'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            await loginAlert.dismiss();
            await this.showLoading();
            const loginRequest: LoginRequest = {
              username: data.username,
              password: data.password,
              rememberMe: false
            };
  
            try {
              await this.authService.validateLogin(loginRequest);
  
              if (this.currentPlan.planDs === 'FREE') {
                const checkoutSession = await this.paymentService.createCheckoutSession(plan.type, this.userEmail);
                window.location.href = checkoutSession.url;
              } else {
                await this.paymentService.updateSubscription(plan.type, this.userEmail);
                await this.hideLoading();
                const alert = await this.alertCtrl.create({
                  header: 'Plano atualizado!',
                  message:
                    this.comparePlans(plan.type, this.currentPlan.planDs) > 0
                      ? 'Upgrade realizado! O valor proporcional já foi cobrado.'
                      : 'Downgrade confirmado. A alteração será aplicada no próximo ciclo.',
                  buttons: ['OK']
                });
                await alert.present();
                await alert.onDidDismiss();
                this.getCurrentUserPlanData();
              }
            } catch (e) {
              await this.hideLoading();
              const errorAlert = await this.alertCtrl.create({
                header: 'Erro de autenticação',
                message: 'Usuário ou senha inválidos.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            } finally {
              await this.hideLoading();
            }
          }
        }
      ]
    });
  
    await loginAlert.present();
  }
  
  /**
   * Método utilitário para comparar prioridade dos planos
   * Retorna >0 se novo plano for maior, <0 se for downgrade, 0 se igual
   */
  private comparePlans(newPlan: string, currentPlan: string): number {
    const extractBasePlan = (plan: string): string => {
      if (plan === 'FREE') return 'FREE';
      return plan.replace('STRIPE_', '').replace('_MONTHLY', '').replace('_ANNUAL', '');
    };
  
    const priority: Record<string, number> = {
      FREE: 0,
      BASIC: 1,
      PLUS: 2,
      PREMIUM: 3
    };
  
    const newBase = extractBasePlan(newPlan);
    const currentBase = extractBasePlan(currentPlan);
  
    return (priority[newBase] ?? 0) - (priority[currentBase] ?? 0);
  }  

  groupPlans() {
    const grouped: any = {};

    this.plans
    .forEach((plan) => {
      const baseName = plan.name.replace(' MENSAL', '').replace(' ANUAL', '');
      if (!grouped[baseName]) {
        grouped[baseName] = {
          name: baseName,
          monthly: null,
          yearly: null,
        };
      }

      if (plan.type.includes('MONTHLY')) {
        grouped[baseName].monthly = plan;
      } else if (plan.type.includes('ANNUAL')) {
        grouped[baseName].yearly = plan;
      } else {
        grouped[baseName].monthly = plan;
      }
    });

    this.groupedPlans = Object.values(grouped);
  }

  async openPlanChoiceModal(planGroup: any) {
    const modal = await this.modalCtrl.create({
      component: PlanChoiceModalComponent,
      componentProps: { 
        planGroup: planGroup 
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
      backdropDismiss: false,
      cssClass: 'plan-choice-modal'
    });
  
    modal.onDidDismiss().then((data) => {
      if (data?.data?.selectedPlan) {
        this.subscribe(data.data.selectedPlan);
      }
    });
  
    await modal.present();
  }

  async handleSuccessfulCheckout(sessionId: string) {
    if (this.alertDisplayed) {
      return;
    }
  
    this.alertDisplayed = true;

    const alert = await this.alertCtrl.create({
      header: 'Assinatura concluída!',
      message: 'Seu plano ficará disponível em instantes.',
      buttons: ['OK'],
    });
  
    await alert.present();
  
    await alert.onDidDismiss();
    this.router.navigate(['main-page/debits']);
  }

  async showErrorAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  shouldShowCancelButton(plan: any): boolean {
    return this.currentPlan?.planDs !== 'FREE' &&
           (plan.monthly.type === 'FREE');
  }
  
  handlePlanButtonClick(plan: any) {
    if (this.shouldShowCancelButton(plan)) {
      this.router.navigate(['/my-account']);
    } else {
      this.openPlanChoiceModal(plan);
    }
  }

  hideLoading() {
    this.loading = false;
  }

  showLoading() {
    this.loading = true;
  }
}