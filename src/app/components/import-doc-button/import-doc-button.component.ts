import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { documentTextOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpClient } from '@angular/common/http';
import { DocReviewModalComponent } from '../../modal/doc-review-modal/doc-review-modal.component';
import { FsCoinService } from '../../service/fs-coin-service';
import { AdmobService } from '../../service/admob.service';
import { Capacitor } from '@capacitor/core';
import { AI_DOCUMENT_UPLOAD } from 'src/environments/environment';

addIcons({ documentTextOutline });

@Component({
  selector: 'app-import-doc-button',
  template: `
    <ion-button (click)="checkCoinsAndTrigger()">
      <ion-icon slot="icon-only" name="document-text-outline"></ion-icon>
    </ion-button>
    <input #fileInput type="file" (change)="onFileSelected($event)" hidden accept="application/pdf">
  `,
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [LoadingController, AlertController, ModalController]
})
export class ImportDocButtonComponent {
  @Input() docType: 'BANK_STATEMENT' | 'CREDIT_CARD' = 'BANK_STATEMENT';
  @Input() tableType: 'MAIN' | 'CARD' = 'MAIN';

  importCost: number = 10;
  userFsCoins: number = 0;
  isWeb = Capacitor.getPlatform() === 'web';

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private fsCoinService: FsCoinService,
    private admobService: AdmobService
  ) {}

  async checkCoinsAndTrigger() {
    try {
      this.userFsCoins = await this.fsCoinService.getBalance();
    } catch (e) {
      console.error(e);
    }

    if (this.userFsCoins < this.importCost) {
      this.presentInsufficientCoinsAlert();
    } else {
      this.triggerFileInput();
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    fileInput.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.showAlert('Erro', 'Apenas arquivos PDF são aceitos no momento.');
      return;
    }

    this.processUpload(file, event.target);
  }

  async processUpload(file: File, fileInputElement: any, password?: string) {
    const loader = await this.loadingController.create({ 
      message: password ? 'Desbloqueando e lendo documento...' : 'Lendo documento com IA...' 
    });
    await loader.present();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', this.docType);
    
    if (password) {
      formData.append('password', password);
    }

    this.http.post<any[]>(AI_DOCUMENT_UPLOAD, formData).subscribe({
      next: async (extractedBills) => {
        loader.dismiss();
        fileInputElement.value = null;
        this.openReviewModal(extractedBills);
      },
      error: async (err) => {
        loader.dismiss();
        console.error(err);
        
        const errorMessage = err.error?.msg || err.error?.message || '';

        if (errorMessage.includes('PASSWORD_REQUIRED')) {
          this.promptForPassword(file, fileInputElement, !!password);
        } else {
          fileInputElement.value = null;
          this.showAlert('Erro', 'Falha ao processar o documento. Verifique se é um PDF válido.');
        }
      }
    });
  }

  async promptForPassword(file: File, fileInputElement: any, retry: boolean = false) {
    const alert = await this.alertController.create({
      header: 'PDF Protegido',
      message: retry 
        ? 'Senha incorreta. Tente novamente para desbloquear o arquivo.' 
        : 'Este PDF exige uma senha (ex: os primeiros dígitos do CPF).',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Digite a senha do PDF'
        }
      ],
      backdropDismiss: false,
      buttons: [
        { 
          text: 'Cancelar', 
          role: 'cancel',
          handler: () => {
             fileInputElement.value = null;
          }
        },
        {
          text: 'Continuar',
          handler: (data) => {
            if (data.password) {
              this.processUpload(file, fileInputElement, data.password);
            } else {
              this.showAlert('Aviso', 'A senha é obrigatória para continuar com este arquivo.');
              fileInputElement.value = null;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async openReviewModal(bills: any[]) {
    const modal = await this.modalController.create({
      component: DocReviewModalComponent,
      componentProps: {
        extractedBills: bills,
        defaultTableType: this.tableType,
        docType: this.docType
      }
    });
    
    modal.onDidDismiss().then((data) => {
      if (data.data?.saved) {
        window.location.reload();
      }
    });

    await modal.present();
  }

  async presentInsufficientCoinsAlert() {
    const alert = await this.alertController.create({
      header: 'Saldo Insuficiente 🪙',
      message: `A importação via IA custa ${this.importCost} moedas. Seu saldo é ${this.userFsCoins}. Deseja assistir a um anúncio para ganhar mais?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
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
      this.showAlert('Atenção', 'Ads indisponíveis na Web. Use o app Android para ganhar moedas.');
      return;
    }

    const loader = await this.loadingController.create({ message: 'Carregando anúncio...' });
    await loader.present();

    try {
      const reward = await this.admobService.showRewardedAd();
      if (reward) {
        await this.fsCoinService.earnCoins();
        await this.fsCoinService.getBalance().then(bal => this.userFsCoins = bal);
        loader.dismiss();
        
        if (this.userFsCoins >= this.importCost) {
            this.triggerFileInput();
        } else {
            this.showAlert('Saldo', `Você ganhou moedas! Saldo atual: ${this.userFsCoins}. Precisa de ${this.importCost}.`);
        }
      } else {
        loader.dismiss();
      }
    } catch (e) {
      loader.dismiss();
      this.showAlert('Erro', 'Falha ao carregar anúncio.');
    }
  }

  async showAlert(header: string, msg: string) {
    const alert = await this.alertController.create({ header, message: msg, buttons: ['OK'] });
    await alert.present();
  }
}