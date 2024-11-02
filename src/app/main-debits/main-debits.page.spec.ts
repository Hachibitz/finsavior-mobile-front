import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainDebitsPage } from './main-debits.page';

describe('MainDebitsPage', () => {
  let component: MainDebitsPage;
  let fixture: ComponentFixture<MainDebitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainDebitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
