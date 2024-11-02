import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainAssetsPage } from './main-assets.page';

describe('MainAssetsPage', () => {
  let component: MainAssetsPage;
  let fixture: ComponentFixture<MainAssetsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainAssetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
