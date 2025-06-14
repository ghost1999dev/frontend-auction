import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicAuctionViewComponent } from './public-auction-view.component';

describe('PublicAuctionViewComponent', () => {
  let component: PublicAuctionViewComponent;
  let fixture: ComponentFixture<PublicAuctionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicAuctionViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicAuctionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
