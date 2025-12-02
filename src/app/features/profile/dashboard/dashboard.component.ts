import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ItemResponse, Asset } from '../../../core/models/item.model';
import { Claim } from '../../../core/models/claim.model';
import { UserResponse } from '../../../core/models/user.model';

import { ItemCardComponent } from '../../../shared/components/item-card/item-card.component';
import { AddAssetDialogComponent } from '../add-asset-dialog/add-asset-dialog.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ItemCardComponent, AddAssetDialogComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    activeTab: 'ITEMS' | 'CLAIMS' | 'ASSETS' = 'ITEMS';
    myItems: ItemResponse[] = [];
    myClaims: Claim[] = [];
    myAssets: Asset[] = [];
    user: UserResponse | null = null;
    isLoading = false;
    showAddAssetModal = false;

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.user = user;
        });
    }

    ngOnInit(): void {
        this.loadMyItems();
    }

    switchTab(tab: 'ITEMS' | 'CLAIMS' | 'ASSETS'): void {
        this.activeTab = tab;
        if (tab === 'ITEMS') {
            this.loadMyItems();
        } else if (tab === 'CLAIMS') {
            this.loadMyClaims();
        } else {
            this.loadMyAssets();
        }
    }

    loadMyItems(): void {
        this.isLoading = true;
        this.apiService.getMyItems().subscribe({
            next: (items) => {
                this.myItems = items;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    loadMyClaims(): void {
        this.isLoading = true;
        this.apiService.getMyClaims().subscribe({
            next: (claims) => {
                this.myClaims = claims;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    loadMyAssets(): void {
        this.isLoading = true;
        this.apiService.getMyAssets().subscribe({
            next: (assets) => {
                this.myAssets = assets;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    openAddAssetModal(): void {
        this.showAddAssetModal = true;
    }

    closeAddAssetModal(): void {
        this.showAddAssetModal = false;
    }

    onAssetCreated(): void {
        this.loadMyAssets();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'CLAIMED': return 'bg-orange-100 text-orange-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    downloadQrCode(asset: Asset): void {
        if (!asset.qr_code_url) return;

        let url = asset.qr_code_url;
        if (!url.startsWith('http')) {
            // Handle relative paths
            if (url.startsWith('/')) {
                url = `https://api.afsar.my.id${url}`;
            } else {
                url = `https://api.afsar.my.id/${url}`;
            }
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${asset.id}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
