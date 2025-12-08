import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { BillService } from '../../service/bill.service';
import { AlertController, LoadingController } from '@ionic/angular/standalone';
import { mic, square } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { FsCoinService } from '../../service/fs-coin-service';
import { AdmobService } from '../../service/admob.service';
import { Capacitor } from '@capacitor/core';

addIcons({ mic, square });

@Component({
  selector: 'app-voice-fab',
  template: `
    <div [ngClass]="mode === 'CHAT' ? 'voice-fab-inline' : 'voice-fab-floating'">
      <ion-fab-button 
        (click)="toggleRecording()" 
        [color]="isRecording ? 'danger' : 'primary'"
        [size]="mode === 'CHAT' ? 'small' : 'default'"> <ion-icon [name]="isRecording ? 'square' : 'mic'"></ion-icon>
      </ion-fab-button>
    </div>
  `,
  styles: [`
    /* Estilo Flutuante (Tabelas de Contas) */
    .voice-fab-floating {
      position: fixed;
      bottom: 90px;
      right: 20px;
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Estilo Inline (Chat WhatsApp) */
    .voice-fab-inline {
      position: relative; /* Segue o fluxo do footer */
      margin-left: 8px;   /* Espaço do botão de enviar texto */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Ajuste para o botão small ficar alinhado */
    .voice-fab-inline ion-fab-button {
        width: 40px;
        height: 40px;
        --box-shadow: none; /* Remove sombra pra ficar flat */
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [LoadingController, AlertController]
})
export class VoiceFabComponent {
  @Input() tableType: string = '';
  @Input() mode: 'BILL' | 'CHAT' = 'BILL';
  @Output() onBillDetected = new EventEmitter<any>();
  @Output() onTextTranscribed = new EventEmitter<string>();

  isRecording: boolean = false;
  userFsCoins: number = 0;
  audioCost: number = 10;
  isWeb = Capacitor.getPlatform() === 'web';
  lastRecordedBlob: Blob | null = null;

  constructor(
    private billService: BillService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private fsCoinService: FsCoinService,
    private admobService: AdmobService
  ) {
    this.refreshCoins();
  }

  async refreshCoins() {
    try {
      this.userFsCoins = await this.fsCoinService.getBalance();
    } catch (e) { console.error(e); }
  }

  async toggleRecording() {
    if (this.isRecording) await this.stopRecording();
    else await this.startRecording();
  }

  async startRecording() {
    try {
      const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
      if (!hasPermission.value) {
        const permission = await VoiceRecorder.requestAudioRecordingPermission();
        if (!permission.value) {
          this.showAlert('Permissão', 'Precisamos de permissão para ouvir suas contas!');
          return;
        }
      }
      this.isRecording = true;
      await VoiceRecorder.startRecording();
    } catch (error) {
      console.error('Erro ao iniciar gravação', error);
      this.isRecording = false;
    }
  }

  async stopRecording() {
    try {
      this.isRecording = false;
      const loader = await this.loadingController.create({ message: 'Processando áudio...' });
      await loader.present();

      const result = await VoiceRecorder.stopRecording();

      if (result.value && result.value.recordDataBase64) {
        this.lastRecordedBlob = this.base64ToBlob(result.value.recordDataBase64, 'audio/aac');
        await this.processAudioRequest(this.lastRecordedBlob, false, loader);
      } else {
        loader.dismiss();
      }
    } catch (error) {
      console.error(error);
      this.isRecording = false;
    }
  }

  private async processAudioRequest(blob: Blob, useCoins: boolean, loader: HTMLIonLoadingElement) {
    const formData = new FormData();
    formData.append('file', blob, 'audio.aac');
    formData.append('isUsingCoins', String(useCoins)); // Envia a flag

    if (this.mode === 'CHAT') {
        this.billService.transcribeAudioOnly(formData)
            .then((res: any) => {
                loader.dismiss();
                if (res?.text) this.onTextTranscribed.emit(res.text);
                if (useCoins) this.refreshCoins();
            })
            .catch(err => this.handleError(err, loader));
    } else {
        this.billService.processAudio(formData)
            .then((res: any) => {
                loader.dismiss();
                if (res.redirectAction === 'CHAT_SAVI') {
                    this.router.navigate(['/savi-ai-assistant-chat']);
                    return;
                }
                res.billTable = this.tableType;
                this.onBillDetected.emit(res);
                if (useCoins) this.refreshCoins();
            })
            .catch(err => this.handleError(err, loader));
    }
  }

  private async handleError(err: any, loader: any) {
    loader.dismiss();
    console.error(err);

    if (err.status === 403) {
        await this.refreshCoins();
        const msg = err.error?.message || 'Limite de áudio atingido no plano Free.';
        this.presentLimitAlert(msg);
    } else if (err.status === 412) { // InsufficientFsCoinsException
        this.presentInsufficientCoinsAlert();
    } else {
        this.showAlert('Erro', 'Não consegui processar o áudio. Tente novamente.');
    }
  }

  async presentLimitAlert(errorMessage: string) {
    const alert = await this.alertController.create({
      header: 'Limite Atingido ⭐',
      message: `${errorMessage} Deseja usar ${this.audioCost} FSCoins para transcrever este áudio? (Seu saldo: ${this.userFsCoins})`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Ver Planos', 
          handler: () => this.router.navigate(['/main-page/subscription']) 
        },
        {
          text: `Usar ${this.audioCost} Moedas`,
          handler: () => {
            if (this.userFsCoins >= this.audioCost) {
                this.retryWithCoins();
            } else {
                this.presentInsufficientCoinsAlert();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentInsufficientCoinsAlert() {
    const alert = await this.alertController.create({
      header: 'Saldo Insuficiente 🪙',
      message: `Você tem ${this.userFsCoins} moedas, mas precisa de ${this.audioCost}. Assista a um vídeo para ganhar moedas?`,
      buttons: [
        { text: 'Agora não', role: 'cancel' },
        {
          text: 'Assistir (+10 Moedas)',
          handler: () => {
             setTimeout(() => this.watchAdAndRetry(), 200); 
          }
        }
      ]
    });
    await alert.present();
  }

  async watchAdAndRetry() {
    if (this.isWeb) {
        alert('Ads indisponíveis na Web. Use nosso app disponível na Play Store para ganhar moedas!');
        return;
    }

    const loader = await this.loadingController.create({ message: 'Carregando anúncio...' });
    await loader.present();

    try {
        const reward = await this.admobService.showRewardedAd();
        if (reward) {
            await this.fsCoinService.earnCoins();
            await this.refreshCoins();
            loader.dismiss();
            this.retryWithCoins();
        } else {
            loader.dismiss();
        }
    } catch (e) {
        loader.dismiss();
        this.showAlert('Erro', 'Falha ao carregar anúncio.');
    }
  }

  async retryWithCoins() {
    if (this.lastRecordedBlob) {
        const loader = await this.loadingController.create({ message: 'Processando com moedas...' });
        await loader.present();
        await this.processAudioRequest(this.lastRecordedBlob, true, loader);
    }
  }

  private base64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: type });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}