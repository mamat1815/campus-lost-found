import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    showFaculty = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]], // Add custom validator for @students.uii.ac.id if needed
            password: ['', [Validators.required, Validators.minLength(6)]],
            phone: ['', [Validators.required]],
            role: ['PUBLIK', [Validators.required]],
            identity_number: ['', [Validators.required]],
            faculty: ['']
        });

        this.registerForm.get('role')?.valueChanges.subscribe(role => {
            this.showFaculty = role === 'MAHASISWA';
            const facultyControl = this.registerForm.get('faculty');
            if (this.showFaculty) {
                facultyControl?.setValidators([Validators.required]);
            } else {
                facultyControl?.clearValidators();
            }
            facultyControl?.updateValueAndValidity();
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.toastr.success('Registration successful! Please login.');
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                this.isLoading = false;
                // Error handled by interceptor
            }
        });
    }
}
