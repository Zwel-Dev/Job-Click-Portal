import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyVerification, VerificationFormValue } from '@core/models/company.model';
import { CompanyService } from './company.service';

/**
 * Company verification workflow. Delegates to CompanyService so the verification
 * status stays consistent with the company overview/shell (single source of truth).
 */
@Injectable({ providedIn: 'root' })
export class CompanyVerificationService {
  private readonly companyService = inject(CompanyService);

  get(): Observable<CompanyVerification> {
    return this.companyService.getVerification();
  }

  submit(value: VerificationFormValue): Observable<CompanyVerification> {
    return this.companyService.submitVerification(value);
  }

  resubmit(value: VerificationFormValue): Observable<CompanyVerification> {
    return this.companyService.submitVerification(value);
  }
}
