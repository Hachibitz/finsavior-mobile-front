import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutDevPage } from './about-dev.page';

describe('AboutDevPage', () => {
  let component: AboutDevPage;
  let fixture: ComponentFixture<AboutDevPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutDevPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
