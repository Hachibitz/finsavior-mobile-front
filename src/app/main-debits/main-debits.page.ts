import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { MainPageComponent } from '../main-page/main-page.page';

@Component({
  selector: 'app-main-debits',
  templateUrl: './main-debits.page.html',
  styleUrls: ['./main-debits.page.scss'],
  standalone: true,
  providers: [
    BillService
  ],
  imports: [
    IonicModule, CommonModule, 
    FormsModule, ReactiveFormsModule,
    MainPageComponent
  ]
})
export class MainDebitsPage implements OnInit {
  mainTableForm: FormGroup;
  rows: any[] = [];
  loading: boolean = false;
  billDate: Date = new Date();
  billTypes: TipoConta[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Passivo', value: 'Passivo' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Poupança', value: 'Poupança' }
  ];

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private billService: BillService,
    private cdRef: ChangeDetectorRef,
    private mainPageComponent: MainPageComponent
  ) {
    this.mainTableForm = this.fb.group({
      billName: ['', Validators.required],
      billValue: ['', [Validators.required, Validators.min(1)]],
      billDescription: [''],
      selectedType: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMainTableData();
  }

  async loadMainTableData() {
    this.loading = true;
    this.rows = [];

    this.billService.loadMainTableData(this.mainPageComponent.formatDate(this.billDate)).then((result) => {
      this.rows = result.mainTableDataList.filter(row => row.billType === 'Passivo');
    }).catch((error) => {
      this.showAlert('Erro', 'Erro ao carregar dados de débitos');
    }).finally(() => {
      this.loading = false;
      this.cdRef.detectChanges();
    })
  }

  async addRegisterMain() {
    if (this.mainTableForm.invalid) {
      await this.showAlert('Aviso', 'Preencha todos os campos obrigatórios');
      return;
    }

    const billRegisterRequest = {
      ...this.mainTableForm.value,
      billDate: this.mainPageComponent.formatDate(this.billDate),
      billTable: 'main',
      isRecurrent: false,
      paid: false
    };

    this.loading = true;
    try {
      await this.billService.billRegister(billRegisterRequest);
      await this.showAlert('Sucesso', 'Débito cadastrado com sucesso!');
      await this.loadMainTableData();
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao cadastrar débito');
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  async deleteItem(item: any) {
    this.loading = true;
    try {
      await this.billService.deleteItemFromMainTable(item.id);
      this.rows = this.rows.filter(row => row.id !== item.id);
      await this.showAlert('Sucesso', 'Item deletado com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao deletar item');
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
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
}