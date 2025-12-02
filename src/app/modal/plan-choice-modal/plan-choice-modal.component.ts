import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButtons, IonButton,
  IonList, IonItem, IonLabel,
  ModalController
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-plan-choice-modal',
    templateUrl: './plan-choice-modal.component.html',
    styleUrls: ['./plan-choice-modal.component.scss'],
    imports: [
        CommonModule, FormsModule,
        IonContent, IonHeader, IonTitle,
        IonToolbar, IonButtons, IonButton,
        IonList, IonItem, IonLabel
    ]
})
export class PlanChoiceModalComponent {
  @Input() planGroup: any; 

  constructor(private modalCtrl: ModalController) {} 

  selectPlan(plan: any) {
    this.modalCtrl.dismiss({ selectedPlan: plan });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}