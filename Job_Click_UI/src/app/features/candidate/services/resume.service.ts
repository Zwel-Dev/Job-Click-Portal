import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { Resume } from '@core/models/candidate.model';
import { MOCK_RESUMES } from './mock/mock-resumes';

const MOCK_LATENCY = 350;

/**
 * Candidate resumes. C1.4 exposes the list (for the apply dialog); upload /
 * set-default / remove and the full resume manager arrive in a later slice.
 */
@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly api = inject(ApiBaseService);

  list(): Observable<Resume[]> {
    if (!environment.useMock) {
      return this.api.get<Resume[]>(API.candidate.resumes);
    }
    return of(JSON.parse(JSON.stringify(MOCK_RESUMES)) as Resume[]).pipe(delay(MOCK_LATENCY));
  }
}
