import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonCard, IonCardHeader,
  IonCardContent, IonCardTitle, IonSelect,
  IonSelectOption, IonButton, IonLabel,
  IonItem, IonInput, IonTextarea,
  IonText, IonButtons
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { TICKET_CONTACT } from 'src/environments/environment';
import { ViewWillEnter, AlertController } from '@ionic/angular';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.page.html',
  styleUrls: ['./ticket.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, 
    IonToolbar, CommonModule, FormsModule,
    IonCard, IonItem, IonCardHeader,
    IonCardContent, IonCardTitle, IonSelect,
    IonSelectOption, IonButton, IonLabel,
    ReactiveFormsModule, IonInput, IonTextarea,
    IonText, IonButtons
  ]
})
export class TicketPage implements ViewWillEnter {
  ticket = {
    name: '',
    email: '',
    type: '',
    message: '',
  };

  loading = false;

  constructor(private router: Router, private http: HttpClient, private userService: UserService, private alertController: AlertController) {}
  
  async ionViewWillEnter(): Promise<void> {
    this.showLoading()
    this.ticket.email = await (await this.userService.getProfileData()).email
    this.hideLoading()
  }

  isFormValid(): boolean {
    const { name, email, type, message } = this.ticket;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
  
    return (
      !!name &&
      !!email &&
      !!type &&
      !!message &&
      isEmailValid
    );
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async submitTicket(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control?.markAsTouched();
      });
      return;
    }
  
    this.showLoading()
  
    try {
      await firstValueFrom(this.http.post(TICKET_CONTACT, this.ticket));
      this.showAlert('Sucesso', 'Mensagem enviada com sucesso!');
      this.redirectToMainPage();
    } catch (error) {
      this.showAlert('Erro', 'Erro ao enviar sua mensagem. Tente novamente.');
    } finally {
      this.hideLoading()
    }
  }

  redirectToMainPage() {
    this.router.navigate(['/main-page']);
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }
}