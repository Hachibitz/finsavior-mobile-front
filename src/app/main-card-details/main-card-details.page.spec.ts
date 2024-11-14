import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainCardDetailsPage } from './main-card-details.page';

describe('MainCardDetailsPage', () => {
  let component: MainCardDetailsPage;
  let fixture: ComponentFixture<MainCardDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainCardDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
