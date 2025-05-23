import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Analysis } from 'src/app/model/ai-advice.model';
import { BillService } from 'src/app/service/bill.service';
import { 
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonButton,
    IonLabel, IonCardSubtitle, IonButtons
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownUtils } from 'src/app/utils/markdown-utils';

@Component({
  selector: 'app-ai-analysis-detail-modal.component',
  templateUrl: './ai-analysis-detail-modal.component.html',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonButton,
    IonLabel, IonCardSubtitle, IonButtons
  ]
})
export class AiAnalysisDetailModalComponent implements OnInit {
  @Input() analysis!: Analysis;
  loading: boolean = false;

  constructor(
    private modalController: ModalController,
    private billService: BillService,
    private alertController: AlertController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    console.log(this.analysis);
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  async confirmDeleteAnalysis(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: `Deseja realmente excluir a análise ${this.analysis.id}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.deleteAnalysis()
        }
      ]
    });

    await alert.present();
  }

  async deleteAnalysis(): Promise<void> {
    this.isLoading();
    try {
      await this.billService.deleteAiAnalysis(this.analysis.id);
      this.modalController.dismiss({ deleted: true });
    } catch (error) {
      this.showAlert('Erro', 'Erro ao excluir análise');
    } finally {
      this.isLoading();
    }
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  formatMarkdown(content: string): SafeHtml {
      return MarkdownUtils.formatMarkdown(content, this.sanitizer);
  }

  isLoading(): void {
    this.loading = !this.loading;
  }
}
