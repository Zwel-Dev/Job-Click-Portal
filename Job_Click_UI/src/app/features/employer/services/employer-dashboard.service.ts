import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  APPLICATION_STATUS_META,
  ApplicationStatus,
  PIPELINE_BOARD_STAGES,
} from '@core/enums/application-status.enum';
import { JobStatus } from '@core/enums/job-status.enum';
import { OfferStatus } from '@core/enums/offer-status.enum';
import { JobService } from './job.service';
import { ApplicantService } from './applicant.service';
import { OfferService } from './offer.service';
import { EmployerDashboardData, EmployerKpis, PipelineStageCount } from '../models/employer-dashboard.model';

/**
 * Aggregates the recruiter dashboard snapshot (KPIs + pipeline + recent
 * applicants) from the job, applicant, and offer services via forkJoin.
 */
@Injectable({ providedIn: 'root' })
export class EmployerDashboardService {
  private readonly jobService = inject(JobService);
  private readonly applicantService = inject(ApplicantService);
  private readonly offerService = inject(OfferService);

  load(recentLimit = 5): Observable<EmployerDashboardData> {
    return forkJoin({
      jobs: this.jobService.list({ ownerScope: 'all', sort: 'newest', page: 1, pageSize: 100 }),
      applicants: this.applicantService.listAll(),
      offers: this.offerService.list(),
    }).pipe(
      map(({ jobs, applicants, offers }) => {
        const kpis: EmployerKpis = {
          activeJobs: jobs.data.filter((job) => job.status === JobStatus.Published).length,
          totalApplicants: applicants.length,
          inInterview: applicants.filter((applicant) => applicant.status === ApplicationStatus.Interview).length,
          offersOut: offers.filter((offer) => offer.status === OfferStatus.Sent).length,
        };
        const pipeline: PipelineStageCount[] = PIPELINE_BOARD_STAGES.map((status) => ({
          status,
          label: APPLICATION_STATUS_META[status].label,
          tone: APPLICATION_STATUS_META[status].tone,
          count: applicants.filter((applicant) => applicant.status === status).length,
        }));
        return {
          kpis,
          pipeline,
          recentApplicants: applicants.slice(0, recentLimit),
        };
      }),
    );
  }
}
