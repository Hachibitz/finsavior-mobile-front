import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatAiPage } from './chat-ai.page';

describe('ChatAiPage', () => {
  let component: ChatAiPage;
  let fixture: ComponentFixture<ChatAiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatAiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
