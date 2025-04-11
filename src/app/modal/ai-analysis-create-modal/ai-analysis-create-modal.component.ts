import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonButton, IonContent,
  IonItem, IonLabel, IonInput, IonDatetime,
  IonDatetimeButton, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { UserService } from 'src/app/service/user.service';
import { PlanCoverageEnum } from 'src/app/model/payment.model';
import { AnalysisTypeEnum } from 'src/app/model/ai-advice.model';

@Component({
  selector: 'app-ai-analysis-create-modal',
  templateUrl: './ai-analysis-create-modal.component.html',
  styleUrls: ['./ai-analysis-create-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonInput, IonDatetime,
    IonDatetimeButton, IonSelect, IonSelectOption,
    FormsModule, NgxSliderModule
  ]
})
export class AiAnalysisCreateModalComponent {
  form: FormGroup;
  temperatureSliderValue: number = 0;
  sliderOptions: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 0, legend: "Mais precisão" },
      { value: 0.1 },
      { value: 0.2 },
      { value: 0.3 },
      { value: 0.4 },
      { value: 0.5, legend: "Equilibrado" },
      { value: 0.6 },
      { value: 0.7 },
      { value: 0.8 },
      { value: 0.9 },
      { value: 1, legend: "Mais criativo" }
    ],
    disabled: false
  };
  userHasNeededPlan = false;

  analysisTypes = [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL];

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      analysisType: ['', Validators.required],
      date: ['', Validators.required],
      temperature: [this.temperatureSliderValue, Validators.required]
    });
  
    const currentMonth = new Date();
    currentMonth.setHours(0, 0, 0, 0);
    this.form.patchValue({ date: currentMonth });
    this.form.get('date')?.markAsDirty(); 
    this.form.get('date')?.updateValueAndValidity();
  
    this.checkUserPlan();
  }
  

  dismissModal(role: string = 'cancel') {
    this.modalController.dismiss(null, role);
  }

  onSave() {
    if (this.form.valid) {
      const selectedDate = new Date(this.form.value.date);
      const analysisType = this.analysisTypes.filter(analysisType => analysisType.analysisTypeId == this.form.value.analysisType)[0];
      
      const finishDate = new Date(selectedDate);
      finishDate.setMonth(selectedDate.getMonth() + analysisType.period);
      finishDate.setDate(finishDate.getDate() - 1);
      finishDate.setHours(23, 59, 59);
      selectedDate.setHours(0, 0, 0);

      const formData = {
        analysisTypeId: this.form.value.analysisType,
        selectedDate: selectedDate,
        temperature: this.temperatureSliderValue,
        finishDate: finishDate
      };
      this.modalController.dismiss(formData, 'submit');
    } else {
      this.form.markAllAsTouched();
    }
  }

  checkUserPlan(): void {
    this.userService.getProfileData().then((result) => {
      this.userHasNeededPlan = result.plan.planId !== PlanCoverageEnum.FREE.planId;
      this.updateSliderState();
    }).catch((error) => {
      this.userHasNeededPlan = false;
      this.updateSliderState();
    });
  }

  updateSliderState() {
    this.sliderOptions = Object.assign({}, this.sliderOptions, {disabled: !this.userHasNeededPlan});
  }
}
