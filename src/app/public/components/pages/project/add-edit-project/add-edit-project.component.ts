import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { Project, UpdateProject } from 'src/app/core/models/projects';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/core/services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Category } from 'src/app/core/models/categories';
import { CategoryService } from 'src/app/core/services/categories.service';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss'],
})
export class AddEditProjectComponent implements OnInit {
  
  @Input() projectId?: number;
  @Input() companyId!: number;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() isRepublishing: boolean = false;

  categories: Category[] = []; // Add this property

  termsAccepted: boolean = false;
  displayTermsDialog: boolean = false;

  termsPdfUrl = 'assets/docs/test.pdf';
  pdfLoadError = false;

  project: Project = {} as Project;
  submitted: boolean = false;
  loading: boolean = false;
  editorConfig!: AngularEditorConfig;
  private themeSubscription!: Subscription;
  isDarkMode = false; // Agrega esta propiedad

  constructor(
    private projectsService: ProjectsService,
    private notificationServices: NotificationService,
    private layoutService: LayoutService,
    private categoryService: CategoryService, // Add this
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadCategories(); // Add this line before loading the project

    if (this.projectId) {
      this.loadProject(this.projectId);
    }

    this.updateEditorConfig();
    this.isDarkMode = this.layoutService.config.colorScheme === 'dark';

    this.themeSubscription = this.layoutService.configUpdate$.subscribe(() => {
      this.isDarkMode = this.layoutService.config.colorScheme === 'dark';
      this.updateEditorConfig();
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.notificationServices.showErrorCustom('No se pudo cargar categorías');
        console.error('No se pudo cargar categorías:', error);
      }
    });
  }

  public keyPressNumbersWithDecimal(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  updateEditorConfig() {
    const isDark = this.layoutService.config.colorScheme === 'dark';
    
    this.editorConfig = {
      editable: true,
      spellcheck: true,
      height: '15rem',
      minHeight: '5rem',
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: 'p',
      defaultFontName: 'Arial',
      defaultFontSize: '3',
      toolbarHiddenButtons: [
        ['insertImage', 'insertVideo']
      ],
      customClasses: this.getCustomClasses(isDark),
      uploadUrl: 'v1/image',
      sanitize: true,
      toolbarPosition: 'top'
    };
  }

  getCustomClasses(isDark: boolean): any[] {
    return [
      {
        name: 'text-dark',
        class: isDark ? 'text-light' : 'text-dark',
      },
      {
        name: 'editor-dark',
        class: isDark ? 'editor-dark-theme' : 'editor-light-theme',
      }
    ];
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

   // Add these methods
   showTermsDialog() {
    this.displayTermsDialog = true;
  }

  acceptTerms() {
    this.termsAccepted = true;
    this.displayTermsDialog = false;
  }


  onPdfError(error: any) {
    console.error('Error loading PDF:', error);
    this.pdfLoadError = true;
  }

  closeDialog() {
    this.displayTermsDialog = false;
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectsService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
      },
      error: () => {
        this.notificationServices.showErrorCustom('No se pudo cargar proyectos')
        this.loading = false;
      }
    });
  }

  saveProject(): void {
    this.submitted = true;

    if ((!this.projectId || this.isRepublishing) && !this.termsAccepted) {
      this.notificationServices.showErrorCustom('Debe aceptar los términos y condiciones');
      return;
    }
    
    if (!this.project.project_name?.trim()) {
      return;
    }

    this.loading = true;
    
    if (this.project.id && !this.isRepublishing) {
        // Update project
        const updateData: UpdateProject = {
          company_id: this.companyId,
          category_id: this.project.category_id, // Add this
          project_name: this.project.project_name,
          description: this.project.description,
          long_description: this.project.long_description,
          budget: this.project.budget,
          days_available: this.project.days_available
        };

        console.log(updateData)
  
        this.projectsService.updateProject(this.project.id, updateData).subscribe({
          next: () => {
            this.notificationServices.showSuccessCustom('Proyecto actualizado con éxito')
            this.saved.emit();
            this.loading = false;
          },
          error: () => {
            this.notificationServices.showErrorCustom('No se pudo actualizar el proyecto')
            this.loading = false;
          }
        });
    }else{
      // Para republicar o crear nuevo
      const projectData = {
        company_id: this.companyId,
        category_id: this.project.category_id,
        project_name: this.project.project_name,
        description: this.project.description,
        long_description: this.project.long_description,
        budget: this.project.budget,
        days_available: this.project.days_available,
        status: 0 // Siempre activo para republicaciones
      };

      if (this.isRepublishing) {
        // Clonar el proyecto existente
        this.projectsService.createProject(projectData).subscribe({
            next: () => {
                this.notificationServices.showSuccessCustom('Proyecto publicado con éxito');
                this.saved.emit();
                this.loading = false;
            },
            error: () => {
                this.notificationServices.showErrorCustom('No se pudo volver a publicar el proyecto');
                this.loading = false;
            }
        });
      } else {
          this.projectsService.createProject(projectData)
          .subscribe({
            next: () => {
              this.notificationServices.showSuccessCustom('Proyecto creado con éxito')
              this.saved.emit();
              this.loading = false;
            },
            error: () => {
              this.notificationServices.showErrorCustom('No se pudo crear el proyecto')
              this.loading = false;
            }
          });      
        }
    }
  }

  shouldDisableFields(): boolean {
    return !!this.projectId && !this.isRepublishing;
  }

  cancel(): void {
    this.cancelled.emit();
  }
}