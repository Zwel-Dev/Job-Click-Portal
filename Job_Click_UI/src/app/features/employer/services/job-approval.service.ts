import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from '@core/models/common.model';
import { EmployerJob } from '../models/employer-job.model';
import { JobService } from './job.service';

/**
 * Job approval workflow API. Delegates to JobService so the approval queue and
 * job list share one source of truth (Project_Doc §7).
 */
@Injectable({ providedIn: 'root' })
export class JobApprovalService {
  private readonly jobService = inject(JobService);

  queue(): Observable<EmployerJob[]> {
    return this.jobService.listPending();
  }

  approve(id: Id): Observable<EmployerJob> {
    return this.jobService.approve(id);
  }

  reject(id: Id, reason: string): Observable<EmployerJob> {
    return this.jobService.reject(id, reason);
  }
}
