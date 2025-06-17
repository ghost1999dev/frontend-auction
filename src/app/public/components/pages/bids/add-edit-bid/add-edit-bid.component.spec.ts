import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBidComponent } from './add-edit-bid.component';

describe('AddEditBidComponent', () => {
  let component: AddEditBidComponent;
  let fixture: ComponentFixture<AddEditBidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditBidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
