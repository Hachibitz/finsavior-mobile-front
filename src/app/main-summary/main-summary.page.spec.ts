import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainSummaryPage } from './main-summary.page';

describe('MainSummaryPage', () => {
  let component: MainSummaryPage;
  let fixture: ComponentFixture<MainSummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
