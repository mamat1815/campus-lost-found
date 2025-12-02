import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse } from '../../../core/models/user.model';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    currentUser: UserResponse | null = null;
    isDashboard = false;
    isMenuOpen = false;
    isProfileDropdownOpen = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.checkRoute(event.url);
        });
    }

    ngOnInit(): void {
        this.checkRoute(this.router.url);
    }

    checkRoute(url: string): void {
        // Check if current route is dashboard (profile)
        this.isDashboard = url.includes('/profile');
    }

    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    toggleProfileDropdown(): void {
        this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
