import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ItemResponse, Item, CreateLostItemRequest, CreateFoundItemRequest, CampusLocation, ItemCategory, Asset, CreateAssetRequest } from '../models/item.model';
import { Claim, CreateClaimRequest, ClaimResponse } from '../models/claim.model';
import { UserDetailResponse, UpdateUserRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'https://api.afsar.my.id/api/v1';

    constructor(private http: HttpClient) { }

    // Items
    getItems(filters?: { status?: string; type?: 'LOST' | 'FOUND' }): Observable<ItemResponse[]> {
        let params = new HttpParams();
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.type) params = params.set('type', filters.type);

        return this.http.get<ItemResponse[]>(`${this.baseUrl}/items`, { params });
    }

    getItem(id: string): Observable<ItemResponse> {
        return this.http.get<ItemResponse>(`${this.baseUrl}/items/${id}`);
    }

    // User Items (My Items) - Not available in API doc, mocking for now
    getMyItems(): Observable<ItemResponse[]> {
        // return this.http.get<ItemResponse[]>(`${this.baseUrl}/users/me/items`);
        return of([]);
    }

    reportLostItem(data: CreateLostItemRequest): Observable<ItemResponse> {
        return this.http.post<ItemResponse>(`${this.baseUrl}/items/lost`, data);
    }

    reportFoundItem(data: CreateFoundItemRequest): Observable<ItemResponse> {
        return this.http.post<ItemResponse>(`${this.baseUrl}/items/found`, data);
    }

    // Upload
    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData);
    }

    // Enumerations
    getCategories(): Observable<ItemCategory[]> {
        return this.http.get<ItemCategory[]>(`${this.baseUrl}/enumerations/item-categories`);
    }

    getCampusLocations(): Observable<CampusLocation[]> {
        return this.http.get<CampusLocation[]>(`${this.baseUrl}/enumerations/campus-locations`);
    }

    createCampusLocation(data: { name: string; latitude: number; longitude: number }): Observable<CampusLocation> {
        return this.http.post<CampusLocation>(`${this.baseUrl}/enumerations/campus-locations`, data);
    }

    // Claims
    submitClaim(data: any): Observable<ClaimResponse> {
        return this.http.post<ClaimResponse>(`${this.baseUrl}/claims`, data);
    }

    // User Claims (My Claims) - Not available in API doc, mocking for now
    getMyClaims(): Observable<Claim[]> {
        // return this.http.get<Claim[]>(`${this.baseUrl}/users/me/claims`);
        return of([]);
    }

    getClaimsForItem(itemId: string): Observable<Claim[]> {
        return this.http.get<Claim[]>(`${this.baseUrl}/items/${itemId}/claims`);
    }

    decideClaim(claimId: string, decision: 'APPROVED' | 'REJECTED'): Observable<void> {
        return this.http.put<void>(
            `${this.baseUrl}/claims/${claimId}/decide`,
            { status: decision }
        );
    }

    // User
    updateProfile(data: UpdateUserRequest): Observable<UserDetailResponse> {
        return this.http.put<UserDetailResponse>(`${this.baseUrl}/users/me`, data);
    }

    // Assets
    getMyAssets(): Observable<Asset[]> {
        return this.http.get<Asset[]>(`${this.baseUrl}/assets/my`);
    }

    createAsset(data: CreateAssetRequest): Observable<Asset> {
        return this.http.post<Asset>(`${this.baseUrl}/assets`, data);
    }
}
