import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryProjectsComponent } from './history-projects.component';

describe('HistoryProjectsComponent', () => {
  let component: HistoryProjectsComponent;
  let fixture: ComponentFixture<HistoryProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
