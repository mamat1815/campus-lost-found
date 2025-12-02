import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { ItemResponse } from '../../../core/models/item.model';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';

@Component({
    selector: 'app-item-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ImageUrlPipe],
    templateUrl: './item-detail.component.html',
    styleUrls: ['./item-detail.component.scss']
})
export class ItemDetailComponent implements OnInit {
    item: ItemResponse | null = null;
    isLoading = true;
    isClaiming = false;
    claimForm: FormGroup;
    isSubmittingClaim = false;
    currentUserId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private toastr: ToastrService,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        this.claimForm = this.fb.group({
            answers: this.fb.array([])
        });

        this.authService.currentUser$.subscribe(user => {
            this.currentUserId = user ? user.id : null;
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadItem(id);
        } else {
            this.toastr.error('Item not found');
            this.router.navigate(['/items']);
        }
    }

    loadItem(id: string): void {
        this.isLoading = true;
        this.apiService.getItem(id).subscribe({
            next: (item) => {
                this.item = item;
                this.isLoading = false;
                if (item.type === 'FOUND' && item.verifications) {
                    this.initClaimForm(item.verifications);
                }
            },
            error: () => {
                this.isLoading = false;
                this.router.navigate(['/items']);
            }
        });
    }

    get answers() {
        return this.claimForm.get('answers') as FormArray;
    }

    initClaimForm(verifications: any[]): void {
        this.answers.clear();
        verifications.forEach(v => {
            this.answers.push(this.fb.group({
                question_id: [v.id],
                question: [v.question],
                answer: ['', Validators.required]
            }));
        });
    }

    startClaim(): void {
        this.isClaiming = true;
    }

    cancelClaim(): void {
        this.isClaiming = false;
        this.claimForm.reset();
        if (this.item?.verifications) {
            this.initClaimForm(this.item.verifications);
        }
    }

    submitClaim(): void {
        if (this.claimForm.invalid) {
            this.toastr.error('Please answer all verification questions');
            return;
        }

        if (!this.item) return;

        this.isSubmittingClaim = true;
        const answers = this.answers.value.map((a: any) => ({
            question_id: a.question_id,
            answer: a.answer
        }));

        const payload = {
            item_id: this.item.id,
            answers: answers
        };

        this.apiService.submitClaim(payload).subscribe({
            next: () => {
                this.isSubmittingClaim = false;
                this.isClaiming = false;
                this.toastr.success('Claim submitted successfully');
                this.loadItem(this.item!.id); // Reload to update status if needed
            },
            error: () => {
                this.isSubmittingClaim = false;
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'CLAIMED': return 'bg-orange-100 text-orange-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
