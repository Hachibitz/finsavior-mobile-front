import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  providers: [
    ModalController
  ]
})
export class ThemeSelectorComponent {
  selectedTheme = 'system';

  constructor(
    private modalController: ModalController,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.selectedTheme = theme;
    });
  }

  changeTheme() {
    this.themeService.setTheme(this.selectedTheme);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}