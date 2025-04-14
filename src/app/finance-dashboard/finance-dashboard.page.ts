import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, 
  IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonDatetimeButton,
  IonButtons, IonButton, IonIcon, 
  IonItem, IonNote, IonList,
  IonDatetime, IonModal
} from '@ionic/angular/standalone';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { BillService } from '../service/bill.service';
import { CommonService } from '../service/common.service';
import { addIcons } from 'ionicons';
import { calendarOutline, analyticsOutline, homeOutline, arrowBackOutline } from 'ionicons/icons';
import { ChartConfiguration, ChartType } from 'chart.js';
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  Filler
} from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.page.html',
  styleUrls: ['./finance-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonSegment, IonSegmentButton,
    IonLabel, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonList, 
    IonButtons, IonButton, IonIcon,
    BaseChartDirective, IonItem, IonNote, 
    IonDatetime, IonDatetimeButton, IonModal
  ]
})
export class FinanceDashboardPage implements OnInit {
  @ViewChild('dateTimePicker') dateTimePicker?: IonDatetime;
  isDatePickerOpen = false;
  selectedMonthYear = '';

  viewMode: 'monthly' | 'category' = 'monthly';
  billDate: Date = new Date();
  loading = false;

  monthlyLabels: string[] = [];
  monthlyIncomes: number[] = [];
  monthlyExpenses: number[] = [];

  mainTableData: any[] = [];
  cardTableData: any[] = [];
  assetsTableData: any[] = [];

  getChartOptions(type: 'pie' | 'doughnut' | 'line'): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,/*      {
        duration: type === 'line' ? 800 : 1000,
        easing: 'easeOutQuart',
        onProgress: () => {
          // Optional: You can add custom animation logic here
        },
        onComplete: () => {
          // Optional: You can add custom animation logic here
        }
      }, (ADICIONAR ESSA ANIMAÇÃO E RESOLVER BUG DE LOOP)
      */
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              label += 'R$ ' + (context.raw as number).toFixed(2).replace('.', ',');
              return label;
            }
          }
        }
      }
    };
  }

  constructor(
    private billService: BillService,
    private commonService: CommonService,
    private router: Router
  ) {
    addIcons({homeOutline,calendarOutline,analyticsOutline,arrowBackOutline});
    Chart.register(
      PieController,
      ArcElement,
      Tooltip,
      Legend,
      CategoryScale,
      LinearScale,
      BarController,
      BarElement,
      LineElement, 
      LineController,
      PointElement,
      DoughnutController,
      Filler 
    );
  }

  async ngOnInit() {
    this.selectedMonthYear = this.commonService.formatDate(this.billDate);
    await this.loadData();
  }

  openDatePicker() {
    this.isDatePickerOpen = true;
  }
  
  closeDatePicker() {
    this.isDatePickerOpen = false;
  }

  async confirmDateSelection() {
    if (this.dateTimePicker) {
      const selectedValue = await this.dateTimePicker.value;
      if (selectedValue) {
        if (typeof selectedValue === 'string') {
          this.billDate = new Date(selectedValue);
          this.commonService.updateSelectedDate(this.billDate);
        } else if (Array.isArray(selectedValue) && selectedValue.length > 0) {
          this.billDate = new Date(selectedValue[0]);
          this.commonService.updateSelectedDate(this.billDate);
        }
        this.selectedMonthYear = this.commonService.formatDate(this.billDate);
        this.loadData();
      }
      this.closeDatePicker();
    }
  }

  async loadData() {
    this.loading = true;
  
    try {
      const monthKeys = this.getLastSixMonths();
      this.monthlyLabels = monthKeys.map(k => {
        const parts = k.split('/');
        if (parts.length !== 2) return k; // fallback
        const [month, year] = parts;
        return `${month}/${year?.slice(2) ?? ''}`;
      });
  
      const incomePromises = monthKeys.map(date => this.billService.loadAssetsTableData(date));
      const expensePromises = monthKeys.map(date => this.billService.loadMainTableData(date));
  
      const [incomeResults, expenseResults] = await Promise.all([
        Promise.all(incomePromises),
        Promise.all(expensePromises)
      ]);
  
      this.monthlyIncomes = incomeResults.map(data =>
        data
          .filter(item => ['Caixa', 'Ativo'].includes(item.billType))
          .reduce((sum, item) => sum + item.billValue, 0)
      );
  
      this.monthlyExpenses = expenseResults.map(data =>
        data
          .filter(item => item.billType === 'Passivo')
          .reduce((sum, item) => sum + item.billValue, 0)
      );
  
      // Dados do mês atual para os outros gráficos
      const currentDate = this.commonService.formatDate(this.billDate);
      const [mainData, cardData, assetsData] = await Promise.all([
        this.billService.loadMainTableData(currentDate),
        this.billService.loadCardTableData(currentDate),
        this.billService.loadAssetsTableData(currentDate)
      ]);
  
      this.mainTableData = [...mainData];
      this.cardTableData = [...cardData];
      this.assetsTableData = [...assetsData];
  
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }  

  onDateChange(event: any) {
    this.billDate = new Date(event.detail.value);
    this.loadData();
  }

  get totalIncome(): number {
    return this.assetsTableData
      .filter(item => ['Caixa', 'Ativo'].includes(item.billType))
      .reduce((sum, item) => sum + item.billValue, 0);
  }

  get totalExpenses(): number {
    return [...this.mainTableData, ...this.cardTableData]
      .filter(item => item.billType === 'Passivo')
      .reduce((sum, item) => sum + item.billValue, 0);
  }

  get topExpenses(): any[] {
    return [...this.mainTableData, ...this.cardTableData]
      .filter(item => item.billType === 'Passivo')
      .sort((a, b) => b.billValue - a.billValue)
      .slice(0, 5);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'monthly' ? 'category' : 'monthly';
  }

  // Gráfico de Receitas vs Despesas
  get incomeVsExpensesChart(): ChartConfiguration {
    return {
      type: 'pie' as ChartType,
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          data: [this.totalIncome, this.totalExpenses],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderWidth: 1
        }]
      },
      options: this.getChartOptions('pie')
    };
  }

  // Gráfico de Distribuição de Despesas
  get expensesByCategoryChart(): ChartConfiguration {
    const categories = this.getExpenseCategories();
    
    return {
      type: 'doughnut' as ChartType,
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: this.generateColors(Object.keys(categories).length),
          borderWidth: 1
        }]
      },
      options: this.getChartOptions('doughnut')
    };
  }

  // Gráfico de Evolução Mensal
  get monthlyTrendChart(): ChartConfiguration {
    return {
      type: 'line' as ChartType,
      data: {
        labels: this.monthlyLabels,
        datasets: [
          {
            label: 'Receitas',
            data: this.monthlyIncomes,
            borderColor: '#4CAF50',
            backgroundColor: (context: { chart: { ctx: any } }) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
              gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
              return gradient;
            },
            fill: 'start',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Despesas',
            data: this.monthlyExpenses,
            borderColor: '#F44336',
            backgroundColor: (context: { chart: { ctx: any } }) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(244, 67, 54, 0.3)');
              gradient.addColorStop(1, 'rgba(244, 67, 54, 0)');
              return gradient;
            },
            fill: 'start',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        ...this.getChartOptions('line'),
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };
  }  

  private getLastSixMonths(): string[] {
    const result: string[] = [];
    const baseDate = new Date(this.billDate);
  
    for (let i = 5; i >= 0; i--) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      result.push(this.commonService.formatDate(date));
    }
  
    return result;
  }  

  private getExpenseCategories(): Record<string, number> {
    const categories: Record<string, number> = {};
    [...this.mainTableData, ...this.cardTableData]
      .filter(item => item.billType === 'Passivo')
      .forEach(item => {
        const category = item.billCategory || 'Não categorizado';
        categories[category] = (categories[category] || 0) + item.billValue;
      });
    return categories;
  }

  // Método auxiliar para gerar cores
  private generateColors(count: number): string[] {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
  }

  redirectToSummaryPage() {
    this.router.navigate(['main-page/summary']);
  }
}