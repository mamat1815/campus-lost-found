import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { ItemCategory } from '../../../core/models/item.model';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
    selector: 'app-add-asset-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
    templateUrl: './add-asset-dialog.component.html',
    styleUrls: ['./add-asset-dialog.component.scss']
})
export class AddAssetDialogComponent implements OnInit {
    @Output() close = new EventEmitter<void>();
    @Output() assetCreated = new EventEmitter<void>();

    assetForm: FormGroup;
    categories: ItemCategory[] = [];
    isLoading = false;
    uploadedImageUrl = '';

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private toastr: ToastrService
    ) {
        this.assetForm = this.fb.group({
            description: ['', [Validators.required]],
            category_id: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.apiService.getCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    onImageUploaded(url: string): void {
        this.uploadedImageUrl = url;
    }

    onSubmit(): void {
        if (this.assetForm.invalid) {
            return;
        }

        this.isLoading = true;
        const payload = {
            ...this.assetForm.value,
            private_image_url: this.uploadedImageUrl
        };

        this.apiService.createAsset(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.toastr.success('Asset created successfully');
                this.assetCreated.emit();
                this.close.emit();
            },
            error: () => {
                this.isLoading = false;
                this.toastr.error('Failed to create asset');
            }
        });
    }
}
