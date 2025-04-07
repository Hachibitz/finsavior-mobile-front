import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlanChoiceModalComponent } from './plan-choice-modal.component';

describe('PlanChoiceModalComponent', () => {
  let component: PlanChoiceModalComponent;
  let fixture: ComponentFixture<PlanChoiceModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PlanChoiceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanChoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
