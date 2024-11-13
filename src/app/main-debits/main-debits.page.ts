import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AddRegisterModalComponent } from '../modal/add-register/add-register-modal.component';
import { TipoConta } from '../model/main.model';
import { BillService } from '../service/bill.service';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonButton, IonText, 
  IonLabel, IonItem, IonInput, IonList,
  IonButtons, IonSelectOption, IonSelect,
  IonIcon
} from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { CommonService } from '../service/common.service';

addIcons({
  'trash': trash
});

@Component({
  selector: 'app-main-debits',
  templateUrl: './main-debits.page.html',
  styleUrls: ['./main-debits.page.scss'],
  standalone: true,
  providers: [
    BillService, ModalController, AlertController
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, 
    IonTitle, IonContent, IonLabel, 
    IonItem, IonInput, IonButton,
    IonText, IonList, IonButtons,
    IonSelectOption, IonSelect, IonIcon
  ]
})
export class MainDebitsPage implements OnInit, ViewWillEnter {
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
    private modalController: ModalController,
    private commonService: CommonService
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

  ionViewWillEnter() {
    this.commonService.selectedDate$.subscribe(date => {
      this.billDate = date;
      this.loadMainTableData();
    });
  }

  async openAddRegisterModal() {
    const modal = await this.modalController.create({
      component: AddRegisterModalComponent
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === 'saved') {
        this.loadMainTableData();
      }
    });

    return await modal.present();
  }

  async loadMainTableData(date: string = this.commonService.formatDate(this.billDate)) {
    this.rows = [];

    this.isLoading()
    this.billService.loadMainTableData(date).then((result) => {
      this.rows = result.mainTableDataList.filter(row => row.billType === 'Passivo');
    }).catch((error) => {
      console.log(error)
      this.showAlert('Erro', 'Erro ao carregar dados de débitos');
    }).finally(() => {
      this.isLoading()
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
      billDate: this.commonService.formatDate(this.billDate),
      billTable: 'main',
      isRecurrent: false,
      paid: false
    };

    this.isLoading();
    try {
      await this.billService.billRegister(billRegisterRequest);
      await this.showAlert('Sucesso', 'Débito cadastrado com sucesso!');
      await this.loadMainTableData();
    } catch (error) {
      console.log(error)
      await this.showAlert('Erro', 'Erro ao cadastrar débito');
    } finally {
      this.isLoading();
      this.cdRef.detectChanges();
    }
  }

  async deleteItem(item: any) {
    this.isLoading();
    try {
      await this.billService.deleteItemFromMainTable(item.id);
      this.rows = this.rows.filter(row => row.id !== item.id);
      await this.showAlert('Sucesso', 'Item deletado com sucesso');
    } catch (error) {
      await this.showAlert('Erro', 'Erro ao deletar item');
    } finally {
      this.isLoading();
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

  isLoading(): void {
    this.loading = !this.loading;
  }
}