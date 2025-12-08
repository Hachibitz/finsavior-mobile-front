import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { BillService } from '../../service/bill.service';
import { AlertController, LoadingController } from '@ionic/angular/standalone';
import { mic, square } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';

addIcons({ mic, square });

@Component({
  selector: 'app-voice-fab',
  template: `
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="ion-margin-bottom" style="margin-bottom: 75px;">
      <ion-fab-button (click)="toggleRecording()" [color]="isRecording ? 'danger' : 'primary'">
        <ion-icon [name]="isRecording ? 'square' : 'mic'"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [LoadingController, AlertController]
})
export class VoiceFabComponent {
  @Input() tableType: string = '';
  @Output() onBillDetected = new EventEmitter<any>();

  isRecording: boolean = false;

  constructor(
    private billService: BillService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {}

  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
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
        const blob = this.base64ToBlob(result.value.recordDataBase64, 'audio/aac');
        const formData = new FormData();
        formData.append('file', blob, 'audio.aac');

        this.billService.processAudio(formData)
          .then((aiResult) => {
            loader.dismiss();
            if (aiResult.redirectAction === 'CHAT_SAVI') {
                this.router.navigate(['/savi-ai-assistant-chat']); 
                return;
            }
            aiResult.billTable = this.tableType;
            this.onBillDetected.emit(aiResult);
          })
          .catch(async (err) => {
            loader.dismiss();
            console.error(err);
            if (err.status === 403) {
                this.showUpgradeAlert(err.error?.message || 'Limite de áudio atingido no plano Free.');
            } else {
                this.showAlert('Erro', 'Não entendi o áudio. Tente novamente.');
            }
          });
      } else {
        loader.dismiss();
      }
    } catch (error) {
      console.error(error);
      this.isRecording = false;
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

  async showUpgradeAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Limite Atingido ⭐',
      message: msg,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Ver Planos', 
          handler: () => this.router.navigate(['/main-page/subscription']) 
        }
      ]
    });
    await alert.present();
  }
}