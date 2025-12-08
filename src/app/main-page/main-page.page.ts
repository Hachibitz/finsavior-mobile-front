import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { BillRegisterRequest, TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { AnalysisType, AnalysisTypeEnum } from '../model/ai-advice.model';
import { UserService } from '../service/user.service';
import { CommonService } from '../service/common.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonTabs, IonTab,
  IonTabBar, IonTabButton, IonLabel,
  IonIcon, IonDatetime, IonModal,
  IonDatetimeButton, IonButtons, IonButton,
  IonItem, IonMenu, IonList,
  IonAvatar, IonMenuButton, IonPopover,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  wallet, cash, statsChart, 
  calendar, barChart, card, 
  personCircleOutline, logOutOutline, 
  cashOutline, addCircleOutline, helpCircle } from 'ionicons/icons';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../service/google-auth.service';
import { ViewWillEnter } from '@ionic/angular';
import { ThemeSelectorComponent } from '../modal/theme-selector/theme-selector.component';
import { FsCoinService } from '../service/fs-coin-service';
import { AdmobService } from '../service/admob.service';
import { Capacitor } from '@capacitor/core';

addIcons({
  'wallet': wallet,
  'cash': cash,
  'stats-chart': statsChart,
  'calendar': calendar,
  'bar-chart': barChart,
  'card': card,
  'person-circle-outline': personCircleOutline,
  'log-out-outline': logOutOutline,
  'cash-outline': cashOutline,
  'add-circle-outline': addCircleOutline,
  'help-circle': helpCircle
});

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.page.html',
    styleUrls: ['./main-page.page.scss'],
    imports: [
      CommonModule, FormsModule, ReactiveFormsModule,
      IonHeader, IonToolbar, IonTitle,
      IonContent, IonTabs, IonTab,
      IonTabBar, IonTabButton, IonLabel,
      IonIcon, IonDatetime, IonModal,
      IonDatetimeButton, IonButtons, IonButton,
      IonItem, IonMenu, IonList, IonAvatar,
      IonMenuButton, IonPopover, IonText
    ],
    providers: [
        ModalController
    ]
})
export class MainPageComponent implements OnInit, ViewWillEnter {
  @ViewChild('dateTimePicker') dateTimePicker?: IonDatetime;

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
  isProfileReady: boolean = false;

  isDragging = false;
  showDragHint = true;
  pressTimeout: any;
  position = { x: 0, y: 0 };
  offset = { x: 0, y: 0 };

  userFsCoins: number = 0;
  isWeb = Capacitor.getPlatform() === 'web';

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private alertController: AlertController,
    private userService: UserService,
    private commonService: CommonService,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private modalController: ModalController,
    private fsCoinService: FsCoinService,
    private admobService: AdmobService
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

  ionViewWillEnter(): void {
    this.position = { x: window.innerWidth - 180, y: window.innerHeight - 180 };
    this.loadData();
  }

  clearAllDataBeforeLoading() {
    this.mainTableForm.reset();
    this.cardTableForm.reset();
    this.rows = [];
    this.incomeRows = [];
    this.cardRows = [];
    this.selectedType = 'expense';
    this.isDatePickerOpen = false;
    this.showDropdown = false;
    this.isProfileReady = false;
    this.userData = null;
    this.userFsCoins = 0;
  }

  async ngOnInit(): Promise<void> {
    this.clearAllDataBeforeLoading();
    this.selectedMonthYear = this.commonService.formatDate(this.billDate);
    this.isAuthenticated = await this.authService.isAuthenticated();
    setTimeout(() => {
      this.showDragHint = false;
    }, 4000);

    this.fsCoinService.balance$.subscribe(bal => {
        this.userFsCoins = bal;
    });
    this.fsCoinService.refreshBalance();
  }

  async loadData(): Promise<void> {
    await this.commonService.selectedDate$.subscribe((date) => {
      this.billDate = date;
      this.selectedMonthYear = this.commonService.formatDate(this.billDate);
    });
    await this.setUserData();
  }

  async setUserData(): Promise<void> {
    this.isProfileReady = false;
    this.userData = null;
    this.showLoading();
    try {
      const userProfile = await this.userService.getProfileData();
      this.userFsCoins = await this.fsCoinService.getBalance();
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
      this.isProfileReady = true;
      this.hideLoading();
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

  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  closeDatePicker() {
    if (this.isDatePickerOpen) {
      this.isDatePickerOpen = false;
    }
  }

  async confirmDateSelection(): Promise<void> {
    if (this.dateTimePicker) {
      const selectedValue = await this.dateTimePicker.value;
      if (selectedValue) {
        const selectedDate = new Date(selectedValue.toLocaleString());
        this.billDate = selectedDate;
        this.commonService.updateSelectedDate(selectedDate);
        this.loadData();
      }
      this.closeDatePicker();
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

  goToSaviChat() {
    if (this.isDragging) {
      return;
    }
    this.router.navigateByUrl('/savi-ai-assistant-chat');
  }

  goToAboutApp() {
    this.router.navigateByUrl('/about-app');
  }

  goToAboutDev() {
    this.router.navigateByUrl('/about-dev');
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    target.classList.add('holding');
    if(event instanceof TouchEvent) {
      target.classList.add('active');
    }
  
    this.pressTimeout = setTimeout(() => {
      this.isDragging = true;
      target.classList.remove('holding');
      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
  
      this.offset = {
        x: clientX - this.position.x,
        y: clientY - this.position.y
      };
    }, 1000);
  }
  
  drag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
  
    event.preventDefault();
    event.stopPropagation();
  
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
  
    this.position = {
      x: clientX - this.offset.x,
      y: clientY - this.offset.y
    };
  }
  
  endDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();


    if(event instanceof TouchEvent) {
      const target = event.currentTarget as HTMLElement;
      target.classList.remove('active');
      target.classList.remove('holding');
    }
  
    clearTimeout(this.pressTimeout);
  
    if (!this.isDragging) {
      this.goToSaviChat();
    }
  
    setTimeout(() => this.isDragging = false, 100);
  }

  async openThemeModal() {
    const modal = await this.modalController.create({
      component: ThemeSelectorComponent,
    });
    return await modal.present();
  }

  async earnCoins() {
    const alert = await this.alertController.create({
      header: 'Ganhar 10 moedas',
      message: 'Assistir anúncio para receber 10 FScoins?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: () => {
            // Fechar o alerta manualmente e depois executar o restante fora
            alert.dismiss().then(() => {
              this.processRewardFlow();
            });
            return false; // impedir fechamento automático
          }
        }
      ]
    });
    await alert.present();
  }

  async processRewardFlow() {
    if(this.isWeb) {
      this.alertController.create({
        header: 'Atenção',
        message: 'Baixe o app na Play Store para usar essa funcionalidade.',
        buttons: ['OK']
      }).then(alert => alert.present());
      return
    }
    this.showLoading();
    try {
      const reward = await this.admobService.showRewardedAd();
      if (reward?.amount) {
        const earned = await this.fsCoinService.earnCoins();
        this.userFsCoins += earned;
      }
    } catch (e) {
      console.error('Erro ao carregar anúncio', e);
    } finally {
      this.hideLoading();
    }
  }

  async getCoinsBalance() {
    this.fsCoinService.getBalance()
      .then(bal => this.userFsCoins = bal)
      .catch(err => console.error(err));
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }
}