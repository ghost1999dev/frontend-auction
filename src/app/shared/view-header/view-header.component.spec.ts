import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHeaderComponent } from './view-header.component';

describe('ViewHeaderComponent', () => {
  let component: ViewHeaderComponent;
  let fixture: ComponentFixture<ViewHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
