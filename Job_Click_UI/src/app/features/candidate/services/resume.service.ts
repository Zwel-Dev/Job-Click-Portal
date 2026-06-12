import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env';
import { ApiBaseService } from '@core/http/api-base.service';
import { API } from '@core/constants/api-endpoints';
import { Id } from '@core/models/common.model';
import { Resume } from '@core/models/candidate.model';
import { MOCK_RESUMES } from './mock/mock-resumes';

const MOCK_LATENCY = 450;

/**
 * Candidate resumes. Stateful in the mock backend so uploads/default/remove
 * persist within the session and stay in sync with the apply dialog (C1.4).
 * Uploaded files use an object URL so preview/download work on the real file.
 */
@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly api = inject(ApiBaseService);

  private resumes: Resume[] = clone(MOCK_RESUMES);
  private nextId = 600;

  list(): Observable<Resume[]> {
    return environment.useMock
      ? of(clone(this.resumes)).pipe(delay(MOCK_LATENCY))
      : this.api.get<Resume[]>(API.candidate.resumes);
  }

  upload(file: File): Observable<Resume> {
    if (!environment.useMock) {
      const form = new FormData();
      form.append('file', file);
      return this.api.post<Resume>(API.candidate.resumes, form);
    }
    const resume: Resume = {
      id: this.nextId++,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      sizeBytes: file.size,
      isDefault: this.resumes.length === 0,
      uploadedAt: new Date().toISOString(),
    };
    this.resumes = [resume, ...this.resumes];
    return of({ ...resume }).pipe(delay(MOCK_LATENCY));
  }

  setDefault(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.post<void>(`${API.candidate.resumes}/${id}/default`, {});
    }
    this.resumes = this.resumes.map((resume) => ({ ...resume, isDefault: resume.id === id }));
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }

  remove(id: Id): Observable<void> {
    if (!environment.useMock) {
      return this.api.delete<void>(`${API.candidate.resumes}/${id}`);
    }
    const removed = this.resumes.find((resume) => resume.id === id);
    this.resumes = this.resumes.filter((resume) => resume.id !== id);
    // If the default was removed, promote the most recent remaining resume.
    if (removed?.isDefault && this.resumes.length) {
      this.resumes = this.resumes.map((resume, index) => ({ ...resume, isDefault: index === 0 }));
    }
    if (removed && removed.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removed.fileUrl);
    }
    return of(undefined).pipe(delay(MOCK_LATENCY));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
