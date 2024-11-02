import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TermsAndPrivacyService } from '../service/terms-and-privacy-service';

@Component({
  selector: 'app-terms-and-privacy-dialog',
  templateUrl: './terms-and-privacy-dialog.page.html',
  styleUrls: ['./terms-and-privacy-dialog.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TermsAndPrivacyDialogPage implements OnInit {
  public contentTitle: string = '';
  public contentText: string = '';
  loading: boolean = false;

  constructor(
    private modalController: ModalController,
    private termsAndPrivacyService: TermsAndPrivacyService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.loadContent();
  }

  async loadContent() {
    if (this.contentTitle === 'privacy') {
      this.contentTitle = 'Política de Privacidade';
      this.contentText = await this.termsAndPrivacyService.loadPrivacyPolicy();
    } else {
      this.contentTitle = 'Termos e Condições';
      this.contentText = await this.termsAndPrivacyService.loadTermsAndConditions();
    }
    this.loading = false;
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
