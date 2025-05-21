import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsApplicationComponent } from './projects-application.component';

describe('ProjectsApplicationComponent', () => {
  let component: ProjectsApplicationComponent;
  let fixture: ComponentFixture<ProjectsApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectsApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
