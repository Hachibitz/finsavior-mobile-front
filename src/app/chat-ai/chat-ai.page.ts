import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonIcon, IonButton,
  IonItem, IonFooter, IonLabel,
  IonList, IonInput, IonButtons,
  IonPopover, IonText, IonFabButton,
  IonFab, IonCheckbox
} from '@ionic/angular/standalone';
import { ChatMessage, ChatRequest } from '../model/ai-advice.model';
import { MarkdownUtils } from '../utils/markdown-utils';
import { AlertController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { AiAssistantService } from '../service/ai-assistant.service';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  ellipsisVerticalOutline,
  sendOutline,
  arrowDownOutline,
  cashOutline,
  helpCircle
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FsCoinService } from '../service/fs-coin-service';
import { AdmobService } from '../service/admob.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { VoiceFabComponent } from '../components/voice-fab/voice-fab.component';

@Component({
    selector: 'app-chat-ai',
    templateUrl: './chat-ai.page.html',
    styleUrls: ['./chat-ai.page.scss'],
    imports: [
        IonContent, IonHeader, IonTitle,
        IonToolbar, CommonModule, FormsModule,
        IonIcon, IonButton, IonItem,
        IonFooter, IonLabel, IonList,
        IonInput, IonButtons, IonPopover,
        IonText, IonFabButton, IonFab,
        IonCheckbox, VoiceFabComponent
    ]
})
export class ChatAiPage implements OnInit, ViewWillEnter, ViewWillLeave {
  userMessage: string | null | undefined = '';
  chatHistory: ChatMessage[] = [];
  isTyping: boolean = false;
  isPopoverOpen = false;
  popoverEvent: any;

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  showScrollToBottomButton = false;

  offset = 0;
  limit = 10;
  loadingHistory = false;
  allHistoryLoaded = false;

  loading = false;
  userFsCoins = 0;
  earnAmount = 10; // Amount of coins to earn per ad view
  coinsForChatCost = 25; // Cost in coins to continue the chat
  isUsingFsCoins: boolean = false;
  animate = false;
  isWeb = Capacitor.getPlatform() === 'web';

  constructor(
    private aiAssistantService: AiAssistantService,
    private router: Router,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private fsCoinService: FsCoinService,
    private admobService: AdmobService
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'ellipsis-vertical-outline': ellipsisVerticalOutline,
      'send-outline': sendOutline,
      'arrow-down-outline': arrowDownOutline,
      'cash-outline': cashOutline,
      'help-circle': helpCircle
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadMoreMessages();
    await this.getCoinsBalance();
    setTimeout(() => this.scrollToBottom(), 500);
  }

  async ionViewWillLeave(): Promise<void> {
    await this.admobService.showSimpleInterstitial()
  }

  async ngOnInit() {
    
  }

  async loadMoreMessages() {
    if (this.loadingHistory || this.allHistoryLoaded) return;
    this.showLoading();

    const newMessages = await this.aiAssistantService.getChatHistory(this.offset, this.limit);

    if (newMessages.length === 0) {
      this.allHistoryLoaded = true;
    } else {
      this.chatHistory = [...newMessages, ...this.chatHistory];
      this.offset += this.limit;
    }

    this.hideLoading();
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
  
    this.showScrollToBottomButton = scrollTop > 300;
  
    if (scrollTop < 50) {
      this.loadMoreMessages();
    }
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  onAudioMessage(text: string) {
      if (!text) return;
      
      this.userMessage = text;
      this.sendMessage();
  }

  async sendMessage() {
    const trimmed = this.userMessage?.trim();
    if (!trimmed) return;

    this.chatHistory.push({ role: 'user', content: trimmed });
    this.userMessage = '';

    this.isTyping = true;
    this.chatHistory.push({ role: 'assistant', content: '...' });
    this.scrollToBottom();

    const contextLimit = 10;
    const limitedHistory = this.chatHistory.slice(-contextLimit);

    try {
      const message: ChatRequest = {
        question: trimmed,
        chatHistory: limitedHistory.map(m => `${m.role}: ${m.content}`),
        isUsingCoins: this.isUsingFsCoins
      };
      const res = await this.aiAssistantService.chatWithSavi(message);

      this.chatHistory.pop();
      this.chatHistory.push({ role: 'assistant', content: res!.answer });
    } catch (err: HttpErrorResponse | any) {
      console.error(err);
      const refusedUserMessage = trimmed;
    
      const errorMessage = typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || err?.message || '';
    
      if (err.status === 412 || err.status === 400) {
        await this.presentLimitAlert(refusedUserMessage, errorMessage);
      } else {
        this.chatHistory.push({
          role: 'assistant',
          content: 'Desculpe, houve um erro ao processar sua pergunta 😕',
        });
      }
    } finally {
      this.isTyping = false;
      this.scrollToBottom();
    }
  }

  openPopover(ev: any) {
    this.popoverEvent = ev;
    this.isPopoverOpen = true;
  }

  async clearChatHistory() {
    this.showLoading();
    await this.aiAssistantService.clearChatHistory()
    this.hideLoading();
    this.chatHistory = [];
    this.offset = 0;
    this.allHistoryLoaded = false;
    this.isPopoverOpen = false;
  }

  goBack() {
    window.history.back();
  }

  async presentLimitAlert(refusedUserMessage: string, errorMessage: string) {
    const alert = await this.alertController.create({
      header: 'Limite atingido',
      message: `${errorMessage} Para continuar usando a Savi, é necessário fazer um upgrade, aguardar o próximo mês ou usar FSCoins.`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        },
        {
          text: 'Planos',
          handler: () => {
            this.router.navigate(['/main-page/subscription']);
          }
        },
        {
          text: `Usar ${this.coinsForChatCost} FSCoins`,
          handler: () => {
            if(this.userFsCoins >= this.coinsForChatCost) {
              this.userMessage = refusedUserMessage;
              this.isUsingFsCoins = true;
              this.sendMessage();
            } else {
              this.alertController.create({
                header: 'Saldo insuficiente',
                message: 'Você não possui moedas suficientes para continuar usando a Savi.',
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
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  formatMarkdown(content: string): SafeHtml {
    return MarkdownUtils.formatMarkdown(content, this.sanitizer);
  }

  async getCoinsBalance() {
    this.fsCoinService.getBalance()
      .then(bal => this.userFsCoins = bal)
      .catch(err => console.error(err));
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

  toggleFsCoinsUsage() {
    if(this.userFsCoins < this.coinsForChatCost) {
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
