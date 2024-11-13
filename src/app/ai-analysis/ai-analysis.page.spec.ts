import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiAnalysisPage } from './ai-analysis.page';

describe('AiAnalysisPage', () => {
  let component: AiAnalysisPage;
  let fixture: ComponentFixture<AiAnalysisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiAnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
