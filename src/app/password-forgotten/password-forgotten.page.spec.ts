import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordForgottenPage } from './password-forgotten.page';

describe('PasswordForgottenPage', () => {
  let component: PasswordForgottenPage;
  let fixture: ComponentFixture<PasswordForgottenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordForgottenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
