import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, IonContent, IonToolbar,
  IonTitle, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { TermsAndPrivacyService } from '../../service/terms-and-privacy-service';

@Component({
    selector: 'app-terms-and-privacy-dialog',
    templateUrl: './terms-and-privacy-dialog.page.html',
    styleUrls: ['./terms-and-privacy-dialog.page.scss'],
    imports: [
        ReactiveFormsModule, CommonModule, FormsModule,
        IonHeader, IonContent, IonToolbar,
        IonTitle, IonButtons, IonButton
    ]
})
export class TermsAndPrivacyDialogPage implements OnInit {
  @Input() type!: string;

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
    if (this.type === 'privacy') {
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
