import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainErrorComponent } from './main-error.component';

describe('MainErrorComponent', () => {
  let component: MainErrorComponent;
  let fixture: ComponentFixture<MainErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
