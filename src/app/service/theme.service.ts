import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('system');
  theme$ = this.themeSubject.asObservable();
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(private storage: StorageService) {
    this.init();
    // Escuta mudança do sistema
    this.prefersDark.addEventListener('change', () => {
      if (this.themeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  private async init() {
    const saved = await this.storage.get('selectedTheme') || 'system';
    this.themeSubject.next(saved);
    this.applyTheme(saved);
  }

  setTheme(theme: string) {
    this.storage.set('selectedTheme', theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: string) {
    const useDark = theme === 'dark'
      || (theme === 'system' && this.prefersDark.matches);
    document.documentElement.classList.toggle('ion-palette-dark', useDark);
  }
}
