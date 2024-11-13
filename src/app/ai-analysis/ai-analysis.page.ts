import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AiAnalysisDetailModalComponent } from '../modal/ai-analysis-detail/ai-analysis-detail-modal.component';
import { BillService } from '../service/bill.service';
import { Analysis } from '../model/ai-advice.model';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonLabel, 
  IonItem, IonList, IonButtons, 
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

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
export class AiAnalysisPage implements OnInit {
  analyses: Analysis[] = [];
  filteredAnalyses: Analysis[] = [];
  loading: boolean = false;

  analysisTypeListLabels = [
    {id: '1', label: 'Mensal'},
    {id: '2', label: 'Trimestral'},
    {id: '3', label: 'Anual'}
  ]

  constructor(
    private billService: BillService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
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

  async openAiAnalysisDialog(): Promise<void> {
    // Função de geração de nova análise - configuração adicional
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
