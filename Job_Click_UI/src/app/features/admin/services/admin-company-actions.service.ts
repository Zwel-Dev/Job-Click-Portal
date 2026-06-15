import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiError } from '@core/models/common.model';
import { AdminCompany } from '@core/models/admin-company.model';
import { CompanyStatus } from '@core/enums/company-status.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { AdminCompanyService } from './admin-company.service';

/**
 * Mutating company actions shared by the list and detail page — suspend /
 * activate, with confirm + toast. Suspending gates the company's entire employer
 * workspace (§11), so the confirm spells that out.
 */
@Injectable({ providedIn: 'root' })
export class AdminCompanyActionsService {
  private readonly service = inject(AdminCompanyService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  /**
   * Suspend or activate `company` (the inverse of its current state) with a
   * confirm step. Resolves to the updated company, or `null` if cancelled/failed.
   */
  toggleStatus(company: AdminCompany): Observable<AdminCompany | null> {
    const suspending = company.status !== CompanyStatus.Suspended;
    const action = suspending ? 'Suspend' : 'Activate';

    return this.confirm
      .confirm({
        title: `${action} ${company.name}?`,
        message: suspending
          ? `Suspending blocks ${company.name}'s entire employer workspace — its team cannot post jobs or manage hiring until it is reactivated.`
          : `${company.name} will regain full access to its employer workspace.`,
        confirmLabel: action,
        danger: suspending,
      })
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(null);
          }
          const next = suspending ? CompanyStatus.Suspended : CompanyStatus.Active;
          return this.service.setStatus(company.id, next).pipe(
            tap((updated) =>
              this.toast.success(
                suspending ? `${updated.name} has been suspended.` : `${updated.name} has been activated.`,
              ),
            ),
            catchError((error: ApiError) => {
              this.toast.error(error.message ?? 'Could not update the company.');
              return of(null);
            }),
          );
        }),
      );
  }
}
