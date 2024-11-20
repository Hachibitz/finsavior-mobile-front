import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BilltypesGuidePage } from './billtypes-guide.page';

describe('BilltypesGuidePage', () => {
  let component: BilltypesGuidePage;
  let fixture: ComponentFixture<BilltypesGuidePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BilltypesGuidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
