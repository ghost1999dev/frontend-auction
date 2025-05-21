import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectsApplicationComponent } from './add-edit-projects-application.component';

describe('AddEditProjectsApplicationComponent', () => {
  let component: AddEditProjectsApplicationComponent;
  let fixture: ComponentFixture<AddEditProjectsApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditProjectsApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditProjectsApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
