import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { ItemCategory } from '../../../core/models/item.model';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
    selector: 'app-report-lost',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FileUploadComponent],
    templateUrl: './report-lost.component.html',
    styleUrls: ['./report-lost.component.scss']
})
export class ReportLostComponent implements OnInit {
    reportForm: FormGroup;
    categories: ItemCategory[] = [];
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
            date_lost: ['', [Validators.required]],
            location_last_seen: ['', [Validators.required]],
            description: [''],
            urgency: ['NORMAL', [Validators.required]],
            offer_reward: [false],
            show_phone: [false],
            contacts: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.addContact(); // Add one contact by default
    }

    get contacts() {
        return this.reportForm.get('contacts') as FormArray;
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

    onImageUploaded(url: string): void {
        this.uploadedImageUrl = url;
    }

    onSubmit(): void {
        if (this.reportForm.invalid) {
            this.toastr.error('Please fill in all required fields');
            return;
        }

        this.isLoading = true;
        const payload = {
            ...this.reportForm.value,
            image_url: this.uploadedImageUrl
        };

        this.apiService.reportLostItem(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.toastr.success('Item reported successfully');
                this.router.navigate(['/items']);
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }
}
