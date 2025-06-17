import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAuctionComponent } from './add-edit-auction.component';

describe('AddEditAuctionComponent', () => {
  let component: AddEditAuctionComponent;
  let fixture: ComponentFixture<AddEditAuctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditAuctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
