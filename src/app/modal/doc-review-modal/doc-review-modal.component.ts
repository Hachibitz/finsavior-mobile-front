import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { createOutline, checkmark } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { BillService } from '../../service/bill.service';

addIcons({ createOutline, checkmark });

@Component({
  selector: 'app-doc-review-modal',
  templateUrl: './doc-review-modal.component.html',
  styleUrls: ['./doc-review-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DocReviewModalComponent implements OnInit {
  @Input() extractedBills: any[] = [];
  @Input() defaultTableType: string = 'MAIN';
  @Input() docType: string = '';

  constructor(
    private modalController: ModalController,
    private billService: BillService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.extractedBills = this.extractedBills.map(b => ({
      ...b,
      selected: true,
      editing: false,
      // Se for extrato, valores negativos são saídas (Passivo), positivos entradas (Ativo)
      // Se for Cartão, tudo é Passivo (geralmente)
      billType: this.determineType(b.billValue), 
      billTable: this.defaultTableType === 'CARD' ? 'CREDIT_CARD' : 'MAIN',
      // Remove sinal negativo do valor para exibição/salvamento se necessário
      billValue: Math.abs(b.billValue) 
    }));
  }

  determineType(value: number): string {
    if (this.docType === 'CREDIT_CARD') return 'Passivo';
    return value < 0 ? 'Passivo' : 'Ativo';
  }

  getSelectedCount() {
    return this.extractedBills.filter(b => b.selected).length;
  }

  close() {
    this.modalController.dismiss();
  }

  async saveSelected() {
    const selected = this.extractedBills.filter(b => b.selected);
    
    // Mapeia para o formato que o backend espera no batch-register
    const payload = selected.map(item => ({
        billName: item.billName,
        billValue: item.billValue,
        billDescription: item.billDescription || 'Importado via PDF',
        billDate: item.possibleDate, // O backend deve tratar string dd/MM/yyyy
        billType: item.billType,
        billTable: item.billTable, // 'main' ou 'credit_card'
        isRecurrent: item.isRecurrent || false,
        billCategory: item.billCategory,
        // Adicione lógica de parcelas se a IA pegou
        isInstallment: item.isInstallment || false,
        totalInstallments: item.installmentCount || 1,
        entryMethod: 'AI_DOCUMENT'
    }));

    const loader = await this.loadingController.create({ message: 'Salvando...' });
    await loader.present();

    this.billService.batchRegister(payload).subscribe({
      next: () => {
        loader.dismiss();
        this.showAlert('Sucesso', `${payload.length} contas importadas!`);
        this.modalController.dismiss({ saved: true });
      },
      error: (err) => {
        loader.dismiss();
        console.error(err);
        this.showAlert('Erro', 'Falha ao salvar contas.');
      }
    });
  }

  async showAlert(header: string, msg: string) {
    const alert = await this.alertController.create({ header, message: msg, buttons: ['OK'] });
    await alert.present();
  }
}