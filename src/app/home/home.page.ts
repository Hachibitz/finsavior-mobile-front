import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.goToLoginPage();
  }

  goToLoginPage() {
    this.router.navigate(["/login"])
  }
}
