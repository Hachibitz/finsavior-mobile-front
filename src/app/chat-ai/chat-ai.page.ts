import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonIcon, IonButton,
  IonItem, IonFooter, IonLabel,
  IonList, IonInput, IonButtons,
  IonPopover, IonText, IonFabButton,
  IonFab
} from '@ionic/angular/standalone';
import { ChatMessage, ChatRequest } from '../model/ai-advice.model';
import { AlertController } from '@ionic/angular';
import { AiAssistantService } from '../service/ai-assistant.service';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  ellipsisVerticalOutline,
  sendOutline,
  arrowDownOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-ai',
  templateUrl: './chat-ai.page.html',
  styleUrls: ['./chat-ai.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule, 
    IonIcon, IonButton, IonItem,
    IonFooter, IonLabel, IonList,
    IonInput, IonButtons, IonPopover,
    IonText, IonFabButton, IonFab
  ]
})
export class ChatAiPage implements OnInit {
  userMessage: string | null | undefined = '';
  chatHistory: ChatMessage[] = [];
  isTyping: boolean = false;
  isPopoverOpen = false;
  popoverEvent: any;

  showScrollToBottomButton = false;

  offset = 0;
  limit = 10;
  loadingHistory = false;
  allHistoryLoaded = false;

  loading = false;

  constructor(
    private aiAssistantService: AiAssistantService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'ellipsis-vertical-outline': ellipsisVerticalOutline,
      'send-outline': sendOutline,
      'arrow-down-outline': arrowDownOutline
    });
  }

  async ngOnInit() {
    await this.loadMoreMessages();
    this.scrollToBottom();
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
      };
      const res = await this.aiAssistantService.chatWithSavi(message);

      this.chatHistory.pop();
      this.chatHistory.push({ role: 'assistant', content: res!.answer });
    } catch (err: any) {
      console.error(err);
      this.chatHistory.pop();
    
      const errorMessage = typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || err?.message || '';
    
      if (errorMessage.includes('Limite de mensagens') || errorMessage.includes('Limite de tokens')) {
        await this.presentLimitAlert();
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

  scrollToBottom() {
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      if (content) (content as any).scrollToBottom(300);
    }, 100);
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

  redirectToMainPage() {
    this.router.navigate(['main-page/debits']);
  }

  async presentLimitAlert() {
    const alert = await this.alertController.create({
      header: 'Limite atingido',
      message: 'Você atingiu o limite do seu plano atual. Para continuar usando a Savi, é necessário fazer um upgrade ou aguardar o próximo mês.',
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
        }
      ]
    });
  
    await alert.present();
  }  

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }
}
