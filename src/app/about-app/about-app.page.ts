import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton, IonLabel, 
  IonIcon, IonItem, IonList,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { mailOutline, arrowBack } from 'ionicons/icons';
import { Router } from '@angular/router';

addIcons({
  'mail-outline': mailOutline,
  'arrow-back': arrowBack,
});

@Component({
  selector: 'app-about-app',
  templateUrl: './about-app.page.html',
  styleUrls: ['./about-app.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule, 
    IonButton, IonLabel, IonIcon, 
    IonItem, IonList, IonButtons
  ]
})
export class AboutAppPage implements OnInit {

  email = 'mailto:contato@finsavior.com.br';

  constructor(private router: Router) {
      addIcons({arrowBack,mailOutline}); 
  }

  ngOnInit() {
  }

  sendEmail() {
    window.open(this.email, '_blank');
  }

  goBack() {
    window.history.back();
  }

}
