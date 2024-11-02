import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { BillRegisterRequest, TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { AnalysisType, AnalysisTypeEnum } from '../model/ai-advice.model';
import { UserService } from '../service/user.service';
import { MainSummaryPage } from '../main-summary/main-summary.page';
import { MainAssetsPage } from '../main-assets/main-assets.page';
import { MainDebitsPage } from '../main-debits/main-debits.page';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.page.html',
  styleUrls: ['./main-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, 
    FormsModule, ReactiveFormsModule,
    MainSummaryPage, MainAssetsPage,
    MainDebitsPage
  ]
})
export class MainPageComponent implements OnInit {
  mainTableForm: FormGroup;
  cardTableForm: FormGroup;

  rows: any[] = [];
  incomeRows: any[] = [];
  cardRows: any[] = [];

  selectedPage = 'debits';

  selectedType!: string;
  darkMode: boolean = false;
  loading: boolean = false;
  billDate!: Date;
  userData: any;
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Passivo', value: 'Passivo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' }
  ];
  analysisTypes: AnalysisType[] = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private alertController: AlertController,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
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

  ngOnInit(): void {
    this.billDate = new Date();
    this.loadData();
  }

  goToPage(page: string): void {
    this.selectedPage = page;
  }

  async loadData(): Promise<void> {
    await this.setTableData();
    await this.setUserData();
  }

  async setTableData(): Promise<void> {
    try {
      this.loading = true;
      const result = await this.billService.loadMainTableData(this.formatDate(this.billDate));
      this.updateTableData(result);
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados da tabela principal');
    } finally {
      this.loading = false;
    }
  }

  updateTableData(data: any): void {
    data.mainTableDataList.forEach((row: any) => {
      if (row.billType === 'Caixa' || row.billType === 'Ativo' || row.billType === 'Poupança') {
        this.incomeRows.push(row);
      } else {
        this.rows.push(row);
      }
    });
    this.cdRef.detectChanges();
  }

  async setUserData(): Promise<void> {
    try {
      this.loading = true;
      this.userData = await this.userService.getProfileData();
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      this.loading = false;
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

  formatDate(date: Date): string {
    const dateString = date.toString();
    const parts = dateString.split(' ');

    const month = parts[1];
    const year = parts[3];

    return month+year;
  }

  async addRegisterMain(): Promise<void> {
    if (this.mainTableForm.invalid) {
      await this.showAlert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const billRequest: BillRegisterRequest = {
        ...this.mainTableForm.value,
        billDate: this.formatDate(this.billDate),
        billTable: 'main',
        isRecurrent: false
      };
      await this.billService.billRegister(billRequest);
      await this.showAlert('Sucesso', 'Registro adicionado com sucesso');
      await this.setTableData();
    } catch (error) {
      await this.showAlert('Erro', 'Falha ao adicionar registro');
    }
  }
}