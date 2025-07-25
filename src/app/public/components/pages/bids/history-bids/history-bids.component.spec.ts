import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryBidsComponent } from './history-bids.component';

describe('HistoryBidsComponent', () => {
  let component: HistoryBidsComponent;
  let fixture: ComponentFixture<HistoryBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
