import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const toastr = inject(ToastrService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An error occurred';

            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.status === 0) {
                errorMessage = 'Network error - please check connection';
            }

            // Avoid showing toast for 401 as it's handled by auth interceptor (mostly)
            // But if it fails there, we might want to show it. 
            // For now, let's show all errors except maybe 401 if we want to be silent about expiry
            if (error.status !== 401) {
                toastr.error(errorMessage);
            }

            return throwError(() => error);
        })
    );
};
