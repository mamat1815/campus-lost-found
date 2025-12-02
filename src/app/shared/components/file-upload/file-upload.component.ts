import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
    @Output() fileUploaded = new EventEmitter<string>();

    previewUrl: string | null = null;
    isUploading = false;
    uniqueId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService
    ) { }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                this.toastr.error('Please upload an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                this.toastr.error('File size should be less than 5MB');
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrl = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload
            this.uploadFile(file);
        }
    }

    uploadFile(file: File): void {
        this.isUploading = true;
        this.apiService.uploadFile(file).subscribe({
            next: (response) => {
                this.isUploading = false;
                this.fileUploaded.emit(response.url);
                this.toastr.success('Image uploaded successfully');
            },
            error: () => {
                this.isUploading = false;
                this.previewUrl = null;
                this.toastr.error('Failed to upload image');
            }
        });
    }

    removeImage(): void {
        this.previewUrl = null;
        this.fileUploaded.emit('');
    }
}
