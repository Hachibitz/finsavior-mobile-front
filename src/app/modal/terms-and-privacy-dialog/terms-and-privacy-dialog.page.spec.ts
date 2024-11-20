import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsAndPrivacyDialogPage } from './terms-and-privacy-dialog.page';

describe('TermsAndPrivacyDialogComponentPage', () => {
  let component: TermsAndPrivacyDialogPage;
  let fixture: ComponentFixture<TermsAndPrivacyDialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsAndPrivacyDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
