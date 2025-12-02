import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    imports: [CommonModule]
})
export class ToastComponent {
  toastQueue: { message: string; color: 'success' | 'danger'; fadeOut: boolean }[] = [];

  showToast(message: string, color: 'success' | 'danger') {
    const toast = { message, color, fadeOut: false };
    this.toastQueue.push(toast);

    setTimeout(() => {
      toast.fadeOut = true;
      setTimeout(() => {
        this.toastQueue.shift();
      }, 300);
    }, 3000);
  }
}