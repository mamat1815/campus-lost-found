import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { ItemCategory, CampusLocation } from '../../../core/models/item.model';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
    selector: 'app-report-found',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FileUploadComponent],
    templateUrl: './report-found.component.html',
    styleUrls: ['./report-found.component.scss']
})
export class ReportFoundComponent implements OnInit {
    reportForm: FormGroup;
    categories: ItemCategory[] = [];
    locations: CampusLocation[] = [];
    isLoading = false;
    uploadedImageUrl = '';

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.reportForm = this.fb.group({
            title: ['', [Validators.required]],
            category_id: ['', [Validators.required]],
            location_name: ['', [Validators.required]],
            latitude: ['', [Validators.required]],
            longitude: ['', [Validators.required]],
            date_found: ['', [Validators.required]],
            return_method: ['BRING_BY_FINDER', [Validators.required]],
            cod: [false],
            show_phone: [false],
            contacts: this.fb.array([]),
            verifications: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.addContact();
        this.addVerification(); // Require at least one verification question
    }

    get contacts() {
        return this.reportForm.get('contacts') as FormArray;
    }

    get verifications() {
        return this.reportForm.get('verifications') as FormArray;
    }

    loadCategories(): void {
        this.apiService.getCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    addContact(): void {
        const contactGroup = this.fb.group({
            platform: ['WHATSAPP', [Validators.required]],
            value: ['', [Validators.required]]
        });
        this.contacts.push(contactGroup);
    }

    removeContact(index: number): void {
        this.contacts.removeAt(index);
    }

    addVerification(): void {
        const verificationGroup = this.fb.group({
            question: ['', [Validators.required]],
            answer: ['', [Validators.required]]
        });
        this.verifications.push(verificationGroup);
    }

    removeVerification(index: number): void {
        this.verifications.removeAt(index);
    }

    onImageUploaded(url: string): void {
        this.uploadedImageUrl = url;
    }

    getCurrentLocation(): void {
        if (!navigator.geolocation) {
            this.toastr.error('Geolocation is not supported by this browser.');
            return;
        }

        this.isLoading = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                this.reportForm.patchValue({
                    latitude: userLat,
                    longitude: userLng
                });
                this.toastr.success('Location coordinates captured.');
                this.isLoading = false;
            },
            (error) => {
                this.isLoading = false;
                let errorMessage = 'Error getting location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for Geolocation.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                }
                this.toastr.error(errorMessage);
            }
        );
    }

    onSubmit(): void {
        if (this.reportForm.invalid) {
            this.toastr.error('Please fill in all required fields');
            return;
        }

        if (this.verifications.length === 0) {
            this.toastr.error('At least one verification question is required');
            return;
        }

        this.isLoading = true;

        // 1. Create Campus Location
        const locationData = {
            name: this.reportForm.value.location_name,
            latitude: this.reportForm.value.latitude,
            longitude: this.reportForm.value.longitude
        };

        this.apiService.createCampusLocation(locationData).subscribe({
            next: (location) => {
                // 2. Report Found Item with new location ID
                const payload = {
                    ...this.reportForm.value,
                    location_id: location.id,
                    image_url: this.uploadedImageUrl
                };
                // Remove temp fields
                delete payload.location_name;
                delete payload.latitude;
                delete payload.longitude;

                this.apiService.reportFoundItem(payload).subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.toastr.success('Item reported successfully');
                        this.router.navigate(['/items']);
                    },
                    error: () => {
                        this.isLoading = false;
                    }
                });
            },
            error: () => {
                this.isLoading = false;
                this.toastr.error('Failed to create location. Please try again.');
            }
        });
    }
}
