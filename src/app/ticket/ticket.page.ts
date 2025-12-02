import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, 
  IonToolbar, IonCard, IonCardHeader,
  IonCardContent, IonCardTitle, IonSelect,
  IonSelectOption, IonButton, IonLabel,
  IonItem, IonInput, IonTextarea,
  IonText, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { TICKET_CONTACT } from 'src/environments/environment';
import { ViewWillEnter, AlertController } from '@ionic/angular';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { arrowBackOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
  'arrow-back-outline': arrowBackOutline,
});

@Component({
    selector: 'app-ticket',
    templateUrl: './ticket.page.html',
    styleUrls: ['./ticket.page.scss'],
    imports: [
        IonContent, IonHeader, IonTitle,
        IonToolbar, CommonModule, FormsModule,
        IonCard, IonItem, IonCardHeader,
        IonCardContent, IonCardTitle, IonSelect,
        IonSelectOption, IonButton, IonLabel,
        ReactiveFormsModule, IonInput, IonTextarea,
        IonText, IonButtons, IonIcon
    ]
})
export class TicketPage implements ViewWillEnter {
  ticket: {
    name: string;
    email: string;
    emailConfirmation: string;
    type: string;
    message: string;
    isAuthenticated: boolean;
  } = {
    name: '',
    email: '',
    emailConfirmation: '',
    type: '',
    message: '',
    isAuthenticated: false
  };  

  loading = false;
  emailAndConfirmationEmailFields = false;
  emailMismatch = false;

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private userService: UserService, 
    private alertController: AlertController,
    private authService: AuthService
  ) {
      addIcons({arrowBackOutline});}
  
  async ionViewWillEnter(): Promise<void> {
    this.showLoading();
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.emailAndConfirmationEmailFields = true;
    } else {
      this.ticket.email = (await this.userService.getProfileData()).email;
      this.ticket.isAuthenticated = true;
    }
    
    this.hideLoading();
  }

  validateEmailsMatch(): void {
    this.emailMismatch = this.ticket.email !== this.ticket.emailConfirmation;
  }

  isFormValid(): boolean {
    const { name, email, emailConfirmation, type, message } = this.ticket;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    
    const emailFieldsValid = this.emailAndConfirmationEmailFields 
      ? isEmailValid && email === emailConfirmation
      : isEmailValid;

    return (
      !!name &&
      !!email &&
      !!type &&
      !!message &&
      emailFieldsValid
    );
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  shouldShowEmailMismatchError(emailConfirmation: any): boolean {
    if (!emailConfirmation) return false;
    return (emailConfirmation.invalid && emailConfirmation.touched) ||
           (this.ticket.email !== this.ticket.emailConfirmation && emailConfirmation.touched);
  }  

  async submitTicket(form: NgForm) {
    if (form.invalid || this.emailMismatch) {
      Object.values(form.controls).forEach(control => {
        control?.markAsTouched();
      });
      return;
    }

    const payload = this.emailAndConfirmationEmailFields 
      ? this.ticket 
      : { ...this.ticket, emailConfirmation: undefined };

    this.showLoading();
  
    try {
      await firstValueFrom(this.http.post(TICKET_CONTACT, payload));
      this.showAlert('Sucesso', 'Mensagem enviada com sucesso!');
      this.redirectToMainPage();
    } catch (error) {
      this.showAlert('Erro', 'Erro ao enviar sua mensagem. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }

  redirectToMainPage() {
    this.router.navigate(['/main-page']);
  }

  goBack() {
    window.history.back();
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