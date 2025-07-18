import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Rating } from 'primeng/rating';
import { Observable, forkJoin } from 'rxjs';
import { usersWithImage } from 'src/app/core/models/users';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RatingService } from 'src/app/core/services/rating.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  userId: number | null = null;
  loading: boolean = true;
  user: usersWithImage | null = null;
  ratings: Rating[] = [];
  ratingSummary: {
    averageScore: number;
    totalRatings: number;
  } = {
    averageScore: 0,
    totalRatings: 0
  };
  recentRatings: {
    score: number;
    comment: string;
    createdAt: string;
    reviewer: any;
    author_name: string;
  }[] = [];

  roleNames: { [key: number]: string } = {
    1: "Company",
    2: "Developer",
    3: "Admin"
  };

  accountSources: { [key: number]: string } = {
    1: "Local Account",
    2: "GitHub",
    3: "Google"
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private ratingService: RatingService,
    private developerService: DeveloperService,
    private notificationService: NotificationService,
    public layoutService: LayoutService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (!idParam) {
      this.notificationService.showErrorCustom('User ID is missing');
      return;
    }

    const userId = +idParam;
    
    if (isNaN(userId)) {
      this.notificationService.showErrorCustom('Invalid user ID');
      return;
    }

    this.userId = userId;
    this.getUserById(this.userId);
  }

  loadUserData(id: any): void {
    if (!this.userId) return;

    this.loading = true;
    
    forkJoin([
      this.userService.getUsersById(this.userId),
      this.ratingService.getPublicProfile(id)
    ]).subscribe({
      next: ([userData, profileData] : any) => {
        if (userData) {
          this.user = userData;
        } else {
          this.notificationService.showErrorCustom('User not found');
          return;
        }

        if (profileData) {
          this.ratingSummary = profileData.ratingSummary || {
            averageScore: 0,
            totalRatings: 0
          };
          this.recentRatings = profileData.recentRatings || [];
        }

        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showErrorCustom(err.error.error)
        this.loading = false;
      }
    });
  }

  loadDeveloper(id: number): void {
    this.loading = true;
    this.developerService.getDeveloperByIdUser(id).subscribe({
      next: (data) => {
        this.loadUserData(data.id)
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading developer:", error);
        this.loading = false;
      },
    });
  }

  public getUserById(id: any) {
    this.userService.getUsersById(id).subscribe({
      next: (userData: any) => {
        if (userData) {
          if (userData.role_id === 2) {
            this.loadDeveloper(userData.id);
          }
        }
      },
      error: (err) => {
        console.error("Error loading user:", err);
      },
    });
  }

  getRoleName(roleId: number): string {
    return this.roleNames[roleId] || `Role ${roleId}`;
  }

  getAccountSource(accountType: number): string {
    return this.accountSources[accountType] || `Type ${accountType}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getRatingStars(score: number | undefined) {
    const safeScore = score || 0;
    const fullStars = Math.floor(safeScore);
    const hasHalfStar = safeScore % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: Array(fullStars).fill(0),
      half: hasHalfStar ? [0] : [],
      empty: Array(emptyStars).fill(0)
    };
  }
}