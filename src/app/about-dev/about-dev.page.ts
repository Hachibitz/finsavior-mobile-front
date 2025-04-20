import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonButton, IonButtons 
} from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, logoGithub, logoLinkedin } from 'ionicons/icons';

addIcons({
  'logo-github': logoGithub,
  'logo-linkedin': logoLinkedin,
  'arrow-back': arrowBack,
});

@Component({
  selector: 'app-about-dev',
  templateUrl: './about-dev.page.html',
  styleUrls: ['./about-dev.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule, 
    IonButton, IonIcon, IonButtons
  ]
})
export class AboutDevPage implements OnInit {
  githubUrl = 'https://github.com/Hachibitz';
  linkedinUrl = 'https://www.linkedin.com/in/felipe-almeida-dev';

  constructor() {
      addIcons({arrowBack,logoGithub,logoLinkedin}); }

  ngOnInit() {
  }

  openGitHub() {
    window.open(this.githubUrl, '_blank');
  }

  openLinkedIn() {
    window.open(this.linkedinUrl, '_blank');
  }

  goBack() {
    window.history.back();
  }

}
