import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { LoginRequest, RegisterRequest, AuthResponse, UserDetailResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://157.10.161.213:3000/api/v1';
    private currentUserSubject = new BehaviorSubject<UserDetailResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private storageService: StorageService,
        private router: Router
    ) {
        const user = this.storageService.getUser();
        if (user) {
            this.currentUserSubject.next(user);
        }
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.storageService.getRefreshToken();
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, { refresh_token: refreshToken }).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    logout(): void {
        this.storageService.clear();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!this.storageService.getToken();
    }

    getToken(): string | null {
        return this.storageService.getToken();
    }

    private handleAuthResponse(response: AuthResponse): void {
        this.storageService.setToken(response.token);
        this.storageService.setRefreshToken(response.refresh_token);
        this.storageService.setUser(response.user);
        // Cast UserResponse to UserDetailResponse for now, assuming they are compatible or we fetch details later
        this.currentUserSubject.next(response.user as unknown as UserDetailResponse);
    }
}
