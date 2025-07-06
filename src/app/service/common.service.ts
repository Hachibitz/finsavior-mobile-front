import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());
  selectedDate$ = this.selectedDateSubject.asObservable();
  loadingTimeoutMs = 20000;

  constructor(private loadingController: LoadingController) {}

  updateSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  formatDate(date: Date): string {
    const dateString = date.toString();
    const parts = dateString.split(' ');

    const month = parts[1];
    const year = parts[3];

    return `${month}${year}`;
  }

  async showLoading(message = 'Carregando...', timeoutMs = this.loadingTimeoutMs) {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      backdropDismiss: false,
    });
    
    await loading.present();

    setTimeout(async () => {
      const isPresented = await loading.dismiss();
      if (isPresented) {
        console.warn('Loading foi fechado automaticamente após timeout.');
      }
    }, timeoutMs);

    return loading;
  }
}
