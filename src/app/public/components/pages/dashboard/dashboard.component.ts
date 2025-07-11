import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { delay, forkJoin, map, Observable, of, Subscription } from "rxjs";
import { AuthService } from "src/app/core/auth/auth.service";
import { Product } from "src/app/core/models/product";
import { LayoutService } from "src/app/core/services/app.layout.service";
import { CompaniesService } from "src/app/core/services/companies.service";
import { DashboardService } from "src/app/core/services/dashboard.service";
import { DeveloperService } from "src/app/core/services/developer.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ProductService } from "src/app/core/services/product.service";
import { ProjectsService } from "src/app/core/services/projects.service";
import { UserService } from "src/app/core/services/user.service";
import girosData from "src/assets/giros.json";

interface GiroEmpresarial {
  codigo: string;
  nombre: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  items!: MenuItem[];
  products!: Product[];
  chartData: any;
  chartOptions: any;

  public girosEmpresariales: any[] = [];
  public filteredGiros: GiroEmpresarial[] = [];
  public selectedGiro: GiroEmpresarial | null = null;

  public user: any;
  subscription!: Subscription;
  displayAlert = false;
  userType: "developer" | "company" | null = null;
  developerForm!: FormGroup;
  companyForm!: FormGroup;
  submitted = false;
  clicked = false;
  businessTypeTags: string[] = [];
  loading: boolean = true;
  projectsByStatusChartData: any;
  ratingsChartData: any;

  // Datos para developer
  totalApplications: number = 0;
  totalFavorites: number = 0;
  myRatingsDistribution: any = {};
  myAverageRating: number = 0;
  featuredProjects: any[] = [];

  // Datos para company
  myProjectsByStatus: any = {};
  myProjectsWithApplicants: any[] = [];

  passwordChecks = {
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  };

  confirmPassword = "";

  constructor(
    public layoutService: LayoutService,
    public developerService: DeveloperService,
    public companyService: CompaniesService,
    public userRoleService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    private usersService: UserService,
    private developerSrv: DeveloperService,
    private notificationServices: NotificationService,
    private companiesServices: CompaniesService,
    private dashboardService: DashboardService,
    private projectsService: ProjectsService
  ) {
    this.developerForm = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      address: ["", Validators.required],
      phone: [
        "",
        [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)],
      ],
      bio: [""],
      linkedin: [""],
      occupation: [""],
      portfolio: [""],
    });

    this.companyForm = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      image: [""],
      address: ["", Validators.required],
      phone: [
        "",
        [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)],
      ],
      business_type: ["", Validators.required],
      nrc_number: [
        "",
        {
          validators: [Validators.required, Validators.pattern(/^\d{6}-\d$/)],
          asyncValidators: [this.nrcValidator.bind(this)],
          updateOn: "blur",
        },
      ],
      web_site: [""],
      nit_number: [""],
    });
  }

  ngOnInit() {
    this.validateUserRole();
    this.getUserById(this.id);
    this.initMenuItems();
    this.loadGirosEmpresariales();
  }

  private loadGirosEmpresariales(): void {
    // Extrae el objeto principal del array
    const girosObject = girosData[0];

    // Transforma a array de objetos {codigo, nombre}
    this.girosEmpresariales = Object.entries(girosObject).map(
      ([codigo, nombre]) => ({
        codigo,
        nombre: nombre as string, // Asegura que nombre sea string
      })
    );

    this.filteredGiros = [...this.girosEmpresariales];
  }

  loadDeveloperDashboard() {
    forkJoin([
      this.dashboardService.getTotalProjectApplications(),
      this.dashboardService.getTotalFavoriteProjects(),
      this.dashboardService.getMyRatingsDistribution(),
      this.dashboardService.getMyAverageRating(),
      this.projectsService.getAllProjects({ status: 1 }), // Proyectos activos
    ]).subscribe({
      next: ([applications, favorites, ratings, avgRating, projects]) => {
        this.totalApplications = applications.total;
        this.totalFavorites = favorites.total;
        this.myRatingsDistribution = ratings.distribution;
        this.myAverageRating = avgRating.average;
        this.featuredProjects = projects.filter((project: any) => 
          project.status === 1 && 
          (project.days_remaining !== null && project.days_remaining > 0)
        );
        this.updateDeveloperChart();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading developer dashboard:", err);
        this.loading = false;
      },
    });
  }

  loadCompanyDashboard() {
    forkJoin([
      this.dashboardService.getMyProjectsByStatus(),
      this.dashboardService.getMyProjectsWithApplicantCount(),
      this.dashboardService.getMyRatingsDistribution(),
      this.dashboardService.getMyAverageRating(),
    ]).subscribe({
      next: ([projectsStatus, projectsWithApplicants, ratings, avgRating]) => {
        this.myProjectsByStatus = projectsStatus;
        this.myProjectsWithApplicants = projectsWithApplicants.data;
        this.myRatingsDistribution = ratings.distribution;
        this.myAverageRating = avgRating.average;

        this.updateCompanyCharts();
        this.loading = false;
        console.log(this.myProjectsWithApplicants);
      },
      error: (err) => {
        console.error("Error loading company dashboard:", err);
        this.loading = false;
      },
    });
  }

  updateCompanyCharts() {
    const documentStyle = getComputedStyle(document.documentElement);

    // Gráfico de proyectos por estado
    this.projectsByStatusChartData = {
      labels: ["Pendiente", "Activo", "Inactivo", "Rechazado", "Finalizado"],
      datasets: [
        {
          data: [
            this.myProjectsByStatus.Pendiente || 0,
            this.myProjectsByStatus.Activo || 0,
            this.myProjectsByStatus.Inactivo || 0,
            this.myProjectsByStatus.Rechazado || 0,
            this.myProjectsByStatus.Finalizado || 0,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--green-500"),
            documentStyle.getPropertyValue("--red-500"),
            documentStyle.getPropertyValue("--pink-500"),
            documentStyle.getPropertyValue("--blue-500"),
          ],
        },
      ],
    };

    // Gráfico de distribución de calificaciones (igual que developers pero para company)
    this.ratingsChartData = {
      labels: [
        "1 Estrella",
        "2 Estrellas",
        "3 Estrellas",
        "4 Estrellas",
        "5 Estrellas",
      ],
      datasets: [
        {
          data: [
            this.myRatingsDistribution[1] || 0,
            this.myRatingsDistribution[2] || 0,
            this.myRatingsDistribution[3] || 0,
            this.myRatingsDistribution[4] || 0,
            this.myRatingsDistribution[5] || 0,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue("--red-500"),
            documentStyle.getPropertyValue("--orange-500"),
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--green-500"),
            documentStyle.getPropertyValue("--blue-500"),
          ],
        },
      ],
    };
  }

  updateDeveloperChart() {
    const documentStyle = getComputedStyle(document.documentElement);

    this.chartData = {
      labels: [
        "1 Estrella",
        "2 Estrellas",
        "3 Estrellas",
        "4 Estrellas",
        "5 Estrellas",
      ],
      datasets: [
        {
          label: "Distribución de Calificaciones",
          data: [
            this.myRatingsDistribution[1] || 0,
            this.myRatingsDistribution[2] || 0,
            this.myRatingsDistribution[3] || 0,
            this.myRatingsDistribution[4] || 0,
            this.myRatingsDistribution[5] || 0,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue("--red-500"),
            documentStyle.getPropertyValue("--orange-500"),
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--green-500"),
            documentStyle.getPropertyValue("--blue-500"),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue("--red-400"),
            documentStyle.getPropertyValue("--orange-400"),
            documentStyle.getPropertyValue("--yellow-400"),
            documentStyle.getPropertyValue("--green-400"),
            documentStyle.getPropertyValue("--blue-400"),
          ],
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: documentStyle.getPropertyValue("--text-color"),
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const total = this.getTotalRatings();
              const value = context.raw as number;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  // Agrega este método en la clase DashboardComponent (después del método getUserInfo por ejemplo)
  getTotalRatings(): number {
    if (!this.myRatingsDistribution) return 0;

    return Object.values(this.myRatingsDistribution).reduce(
      (sum: number, count: any) => {
        return sum + (count || 0);
      },
      0
    );
  }

  // También agreguemos este método para obtener los proyectos por estado para companies
  getCompanyProjectsStatusArray(): any[] {
    if (!this.myProjectsByStatus) return [];

    return [
      { label: "Pendiente", value: this.myProjectsByStatus["Pendiente"] || 0 },
      { label: "Activo", value: this.myProjectsByStatus["Activo"] || 0 },
      { label: "Inactivo", value: this.myProjectsByStatus["Inactivo"] || 0 },
      { label: "Rechazado", value: this.myProjectsByStatus["Rechazado"] || 0 },
      {
        label: "Finalizado",
        value: this.myProjectsByStatus["Finalizado"] || 0,
      },
    ];
  }

  getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: "Pendiente",
      1: "Activo",
      2: "Inactivo",
      3: "Rechazado",
      4: "Finalizado",
    };
    return statusMap[status] || "Desconocido";
  }

  /* Todos los demás métodos existentes se mantienen igual */
  updatePasswordChecks() {
    const value =
      this.userType === "developer"
        ? this.developerForm.get("password")?.value || ""
        : this.companyForm.get("password")?.value || "";

    this.passwordChecks = {
      length: value.length >= 6,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
    };
  }

  passwordMatchValidator(): boolean {
    const password =
      this.userType === "developer"
        ? this.developerForm.get("password")?.value
        : this.companyForm.get("password")?.value;
    return password === this.confirmPassword;
  }

  public getUserById(id: any) {
    this.usersService.getUsersById(id).subscribe((next: any) => {
      if (next) {
        this.user = next;
        console.log(next.role_id);
        if (next.role_id === 2) {
          // Developer
          this.loadDeveloperDashboard();
        } else if (next.role_id === 1) {
          // Company
          this.loadCompanyDashboard();
        }
      }
    });
  }

  nrcValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      delay(500),
      map((value) => {
        return value && value.match(/^\d{6}-\d$/) ? null : { invalidNrc: true };
      })
    );
  }

  formatNitNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, "");

    if (value.length === 0) {
      this.companyForm.get("nit_number")?.setValue("");
      return;
    }

    let formattedValue = "";

    if (value.length <= 9) {
      formattedValue = value.substring(0, 8);
      if (value.length > 8) {
        formattedValue += "-" + value.substring(8, 9);
      }
    } else {
      const a = value.substring(0, 4);
      const b = value.substring(4, 10);
      const c = value.substring(10, 13);
      const d = value.substring(13, 15);

      formattedValue = a;
      if (b) formattedValue += "-" + b;
      if (c) formattedValue += "-" + c;
      if (d) formattedValue += "-" + d;
    }

    this.companyForm.get("nit_number")?.setValue(formattedValue);
    input.value = formattedValue;

    requestAnimationFrame(() => {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }

  formatPhone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length === 0) {
      this.developerForm.get("phone")?.setValue("");
      return;
    }

    const countryCode = "503";
    let mainNumber = value;

    if (value.startsWith("503")) {
      mainNumber = value.substring(3);
    }

    let formattedValue = `+(${countryCode})`;

    if (mainNumber.length > 0) {
      formattedValue += ` ${mainNumber.substring(0, 4)}`;
      if (mainNumber.length > 4) {
        formattedValue += `-${mainNumber.substring(4, 8)}`;
      }
    }

    this.developerForm.get("phone")?.setValue(formattedValue);

    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  formatPhoneCompany(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length === 0) {
      this.companyForm.get("phone")?.setValue("");
      return;
    }

    const countryCode = "503";
    let mainNumber = value;

    if (value.startsWith("503")) {
      mainNumber = value.substring(3);
    }

    let formattedValue = `+(${countryCode})`;

    if (mainNumber.length > 0) {
      formattedValue += ` ${mainNumber.substring(0, 4)}`;
      if (mainNumber.length > 4) {
        formattedValue += `-${mainNumber.substring(4, 8)}`;
      }
    }

    this.companyForm.get("phone")?.setValue(formattedValue);

    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  formatNrcNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, "");

    if (value.length === 0) {
      this.companyForm.get("nrc_number")?.setValue("");
      return;
    }

    let formattedValue = value.substring(0, 6);
    if (value.length > 6) {
      formattedValue += "-" + value.substring(6, 7);
    }

    this.companyForm.get("nrc_number")?.setValue(formattedValue);

    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  onBusinessTypeAdd(event: any) {
    const value = event.value;
    if (value && /^[a-zA-ZÑñ\s,]+$/.test(value)) {
      this.companyForm.get("business_type")?.setValue(value);
    } else {
      this.businessTypeTags = this.businessTypeTags.filter(
        (tag) => tag !== value
      );
    }
  }

  onBusinessTypeRemove(event: any) {
    this.companyForm.get("business_type")?.setValue(this.businessTypeTags);
  }

  getTotalCompanyProjects(): number {
    if (!this.myProjectsByStatus) return 0;

    return Object.values(this.myProjectsByStatus).reduce(
      (sum: number, count: any) => sum + (count || 0),
      0
    );
  }

  validateUserRole() {
    this.displayAlert = false;
    const userId = this.getUserInfo();

    if (!userId) {
      this.showError("No se pudo identificar al usuario");
      this.displayAlert = false;
      return;
    }

    this.userRoleService.checkUserRoles(userId).subscribe({
      next: ({ hasRole }) => {
        if (!hasRole) {
          this.displayAlert = true;
          this.showWarning(
            "Complete su registro para acceder a todas las funciones"
          );
        }
      },
      error: (err) => {
        this.showError("Error al verificar tus permisos");
        console.error("Error:", err);
      },
    });
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  selectUserType(type: "developer" | "company") {
    this.userType = type;
    this.submitted = false;

    if (type === "company") {
      setTimeout(() => {
        // Esto fuerza a PrimeNG a renderizar el dropdown correctamente
        this.filteredGiros = [...this.filteredGiros];
      });
    }
  }

  private showWarning(message: string) {
    this.notificationServices.showErrorCustom(message);
  }

  private showError(message: string) {
    this.notificationServices.showErrorCustom(message);
  }

  onSubmitDeveloper() {
    this.submitted = true;
    const password = this.developerForm.get("password")?.value;
    const address = this.developerForm.get("address")?.value;
    const phone = this.developerForm.get("phone")?.value;
    const bio = this.developerForm.get("bio")?.value;
    const linkedin = this.developerForm.get("linkedin")?.value;
    const occupation = this.developerForm.get("occupation")?.value;
    const portfolio = this.developerForm.get("portfolio")?.value;

    const userToCreate: any = {
      role_id: 2,
      password: password,
      address: address,
      phone: phone,
    };

    this.usersService.updatedUsersPassport(userToCreate, this.id).subscribe({
      next: (response: any) => {
        const developerAdd: any = {
          bio: bio,
          user_id: this.id,
          linkedin: linkedin,
          occupation: occupation,
          portfolio: portfolio,
        };

        this.developerSrv
          .createDeveloper(developerAdd)
          .subscribe((next: any) => {
            if (next) {
              this.displayAlert = false;
              this.notificationServices.showSuccessCustom(
                "¡Felicidades! Su cuenta se ha actualizado con éxito."
              );
            }
          });
      },
    });
  }

  onSubmitCompany() {
    this.submitted = true;
    const password = this.companyForm.get("password")?.value;
    const address = this.companyForm.get("address")?.value;
    const phone = this.companyForm.get("phone")?.value;
    const business_type = this.companyForm.get("business_type")?.value;
    const nrc_number = this.companyForm.get("nrc_number")?.value;
    const web_site = this.companyForm.get("web_site")?.value;
    const nit_number = this.companyForm.get("nit_number")?.value;

    const userToCreate: any = {
      role_id: 1,
      password: password,
      address: address,
      phone: phone,
    };

    this.usersService.updatedUsersPassport(userToCreate, this.id).subscribe({
      next: (response: any) => {
        const adminAdd: any = {
          user_id: this.id,
          nrc_number: nrc_number,
          business_type: business_type,
          web_site: web_site,
          nit_number: nit_number,
        };

        this.companiesServices
          .createCompanies(adminAdd)
          .subscribe((next: any) => {
            if (next) {
              this.displayAlert = false;
              this.notificationServices.showSuccessCustom(
                "¡Felicidades! Su cuenta se ha actualizado con éxito."
              );
            }
          });
      },
    });
  }

  goBack() {
    if (this.userType) {
      this.userType = null;
    } else {
      this.displayAlert = false;
      this.authSvc.logout();
    }
  }

  register() {
    this.submitted = true;
    this.confirmPassword = this.confirmPassword || "";

    if (!this.passwordMatchValidator()) {
      this.notificationServices.showErrorCustom("Las contraseñas no coinciden");
      return;
    }

    if (!Object.values(this.passwordChecks).every(Boolean)) {
      this.notificationServices.showErrorCustom(
        "La contraseña no cumple con todos los requisitos"
      );
      return;
    }

    if (this.userType === "developer") {
      if (this.developerForm.valid) {
        this.clicked = true;
        this.onSubmitDeveloper();
      }
    } else if (this.userType === "company") {
      if (this.companyForm.valid) {
        this.clicked = true;
        this.onSubmitCompany();
      }
    } else {
      this.notificationServices.showErrorCustom(
        "Por favor seleccione un tipo de usuario"
      );
    }
  }

  initMenuItems() {
    this.items = [
      { label: "Actualizar", icon: "pi pi-refresh" },
      { label: "Exportar", icon: "pi pi-download" },
    ];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getUserInfo() {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)["id"];
    } else {
      return null;
    }
  }

  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();
}
