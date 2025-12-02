import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CampusLocation } from '../../../core/models/item.model';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
    selector: 'app-scan-asset',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FileUploadComponent],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Asset Found
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                You have scanned a found asset. Please provide details to help return it.
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form [formGroup]="scanForm" (ngSubmit)="onSubmit()">
                    
                    <!-- Location -->
                    <div class="mb-4">
                        <label for="location" class="block text-sm font-medium text-gray-700">Location Found</label>
                        <select id="location" formControlName="location_id"
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="" disabled>Select a location</option>
                            <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</option>
                        </select>
                        <div *ngIf="scanForm.get('location_id')?.touched && scanForm.get('location_id')?.invalid" class="text-red-500 text-xs mt-1">
                            Location is required.
                        </div>
                    </div>

                    <!-- Note -->
                    <div class="mb-4">
                        <label for="note" class="block text-sm font-medium text-gray-700">Note (Optional)</label>
                        <textarea id="note" formControlName="note" rows="3"
                            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Where exactly did you find it?"></textarea>
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                        <app-file-upload (fileUploaded)="onImageUploaded($event)"></app-file-upload>
                    </div>

                    <!-- Submit Button -->
                    <div>
                        <button type="submit" [disabled]="scanForm.invalid || isSubmitting"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            <i *ngIf="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
                            Report Found
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  `
})
export class ScanAssetComponent implements OnInit {
    scanForm: FormGroup;
    locations: CampusLocation[] = [];
    assetId: string | null = null;
    isSubmitting = false;
    uploadedImageUrl: string | null = null;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private authService: AuthService
    ) {
        this.scanForm = this.fb.group({
            location_id: ['', Validators.required],
            note: ['']
        });
    }

    ngOnInit(): void {
        this.assetId = this.route.snapshot.paramMap.get('id');
        if (!this.assetId) {
            // Handle error or redirect
            this.router.navigate(['/']);
            return;
        }

        this.loadLocations();
    }

    loadLocations(): void {
        this.apiService.getCampusLocations().subscribe({
            next: (locs) => this.locations = locs,
            error: (err) => console.error('Failed to load locations', err)
        });
    }

    onImageUploaded(url: string): void {
        this.uploadedImageUrl = url;
    }

    onSubmit(): void {
        if (this.scanForm.invalid || !this.assetId) return;

        this.isSubmitting = true;

        const currentUser = this.authService.getToken() ? JSON.parse(localStorage.getItem('user') || '{}') : null;

        const requestData = {
            ...this.scanForm.value,
            image_url: this.uploadedImageUrl,
            finder_id: currentUser?.id
        };

        this.apiService.reportAssetFound(this.assetId, requestData).subscribe({
            next: () => {
                // As requested: Update lost mode to true after reporting
                if (this.assetId) {
                    this.apiService.updateAssetLostMode(this.assetId, true).subscribe({
                        next: () => {
                            this.isSubmitting = false;
                            alert('Thank you! The owner has been notified and asset marked as lost.');
                            this.router.navigate(['/']);
                        },
                        error: (err) => {
                            console.error('Failed to update lost mode', err);
                            // Even if this fails, the report was successful, so we probably still want to finish
                            this.isSubmitting = false;
                            alert('Report submitted, but failed to update status. Owner notified.');
                            this.router.navigate(['/']);
                        }
                    });
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Failed to report found asset', err);
                alert('Failed to submit report. Please try again.');
            }
        });
    }
}
