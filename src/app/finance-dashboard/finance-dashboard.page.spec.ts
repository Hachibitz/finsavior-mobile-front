import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceDashboardPage } from './finance-dashboard.page';

describe('FinanceChartsPage', () => {
  let component: FinanceDashboardPage;
  let fixture: ComponentFixture<FinanceDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
