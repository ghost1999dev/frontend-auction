import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerBidsComponent } from './winner-bids.component';

describe('WinnerBidsComponent', () => {
  let component: WinnerBidsComponent;
  let fixture: ComponentFixture<WinnerBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WinnerBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinnerBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
