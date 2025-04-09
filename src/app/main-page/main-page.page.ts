import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { BillRegisterRequest, TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { AnalysisType, AnalysisTypeEnum } from '../model/ai-advice.model';
import { UserService } from '../service/user.service';
import { MainSummaryPage } from '../main-summary/main-summary.page';
import { MainAssetsPage } from '../main-assets/main-assets.page';
import { MainDebitsPage } from '../main-debits/main-debits.page';
import { CommonService } from '../service/common.service';
import { MainCardDetailsPage } from '../main-card-details/main-card-details.page';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonTabs, IonTab,
  IonTabBar, IonTabButton, IonLabel,
  IonIcon, IonDatetime, IonModal,
  IonDatetimeButton, IonButtons, IonButton,
  IonItem, IonMenu, IonList,
  IonAvatar, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wallet, cash, statsChart, calendar, barChart, card, personCircleOutline } from 'ionicons/icons';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../service/google-auth.service';

addIcons({
  'wallet': wallet,
  'cash': cash,
  'stats-chart': statsChart,
  'calendar': calendar,
  'bar-chart': barChart,
  'card': card,
  'person-circle-outline': personCircleOutline
});

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.page.html',
  styleUrls: ['./main-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MainSummaryPage, MainAssetsPage, MainDebitsPage,
    IonHeader, IonToolbar, IonTitle, 
    IonContent, IonTabs, IonTab,
    IonTabBar, IonTabButton, IonLabel,
    IonIcon, IonDatetime, IonModal,
    IonDatetimeButton, IonButtons, IonButton,
    MainCardDetailsPage, IonItem, IonMenu,
    IonList, IonAvatar, IonMenuButton
  ]
})
export class MainPageComponent implements OnInit {
  showDropdown: boolean = false;

  mainTableForm: FormGroup;
  cardTableForm: FormGroup;

  rows: any[] = [];
  incomeRows: any[] = [];
  cardRows: any[] = [];

  selectedType!: string;
  darkMode: boolean = false;
  loading: boolean = false;
  billDate: Date = new Date();
  selectedMonthYear: string = '';
  userData: any;
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Passivo', value: 'Passivo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' },
    { label: 'Pagamento de Cartão', value: 'CardPayment' }
  ];
  analysisTypes: AnalysisType[] = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];

  isDatePickerOpen: boolean = false;
  userLogin: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private alertController: AlertController,
    private userService: UserService,
    private commonService: CommonService,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {
    this.mainTableForm = this.fb.group({
      billName: ['', [Validators.required]],
      billValue: ['', [Validators.required, Validators.min(1)]],
      billDescription: [''],
      selectedType: ['', [Validators.required]]
    });

    this.cardTableForm = this.fb.group({
      cardBillName: ['', [Validators.required]],
      cardBillValue: ['', [Validators.required, Validators.min(1)]],
      cardBillDescription: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadData();
    this.selectedMonthYear = this.commonService.formatDate(this.billDate);
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  async loadData(): Promise<void> {
    await this.commonService.selectedDate$.subscribe((date) => {
      this.billDate = date;
      this.selectedMonthYear = this.commonService.formatDate(this.billDate);
    });
    await this.setUserData();
  }

  async setUserData(): Promise<void> {
    this.isLoading();
    try {
      const userProfile = await this.userService.getProfileData();
      if(userProfile.profilePicture) {
        const base64Image = `data:image/png;base64,${userProfile.profilePicture}`;
        this.userData = {
          ...userProfile,
          profilePicture: base64Image
        };
      }
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      this.isLoading();
    }
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async addRegisterMain(): Promise<void> {
    if (this.mainTableForm.invalid) {
      await this.showAlert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const billRequest: BillRegisterRequest = {
        ...this.mainTableForm.value,
        billDate: this.commonService.formatDate(this.billDate),
        billTable: 'main',
        isRecurrent: false
      };
      await this.billService.billRegister(billRequest);
      await this.showAlert('Sucesso', 'Registro adicionado com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Falha ao adicionar registro');
    }
  }

  onDateChange(event: any) {
    const selectedDate = new Date(event.detail.value);
    this.billDate = selectedDate;
    this.commonService.updateSelectedDate(selectedDate);
    this.loadData();
    this.closeDatePicker();
  }

  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  closeDatePicker() {
    if (this.isDatePickerOpen) {
      this.isDatePickerOpen = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  async login(): Promise<void> {
    const loginRequest = {
      username: this.userLogin,
      password: this.password,
      rememberMe: this.rememberMe,
    };

    try {
      await this.authService.login(loginRequest);
      this.isAuthenticated = true;
      this.showAlert('Sucesso', 'Login realizado com sucesso!');
      this.navigateTo('main-page/debits');
      this.toggleDropdown();
    } catch (error: any) {
      this.showAlert('Erro', error.error);
    }
  }

  async navigateTo(route: string): Promise<void> {
    this.router.navigate([route]);
  }

  async logout(): Promise<void> {
    await this.googleAuthService.logoutFromGoogle();
    await this.authService.logout();
    this.navigateTo('login');
  }

  async upgradeToPro(): Promise<void> {
    this.router.navigate(['main-page/subscription']);
  }

  isLoading(): void {
    this.loading = !this.loading;
  }
}