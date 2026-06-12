import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { environment } from '@env';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { Resume } from '@core/models/candidate.model';
import { formatDate, formatFileSize } from '@core/utils/format';
import { ResumeService } from '../../services/resume.service';
import { ResumePreviewDialogComponent } from './resume-preview-dialog.component';

@Component({
  selector: 'app-resume-manager',
  standalone: false,
  templateUrl: './resume-manager.component.html',
  styleUrl: './resume-manager.component.scss',
})
export class ResumeManagerComponent {
  private readonly resumeService = inject(ResumeService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly uploading = signal(false);
  readonly resumes = signal<Resume[]>([]);

  readonly maxSizeMb = environment.allowFileSizeMb;
  readonly formatDate = formatDate;
  readonly formatFileSize = formatFileSize;
  readonly skeletons = [0, 1];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  onFileSelected(file: File): void {
    this.uploading.set(true);
    this.resumeService
      .upload(file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (resume) => {
          this.resumes.update((list) => [resume, ...list]);
          this.toast.success('Resume uploaded.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  setDefault(resume: Resume): void {
    if (resume.isDefault) {
      return;
    }
    this.resumeService.setDefault(resume.id).subscribe({
      next: () => {
        this.resumes.update((list) => list.map((r) => ({ ...r, isDefault: r.id === resume.id })));
        this.toast.success('Default resume updated.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(resume: Resume): void {
    this.confirm
      .confirm({
        title: 'Remove resume',
        message: `Remove "${resume.fileName}"?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.resumeService.remove(resume.id).subscribe({
          next: () => {
            this.toast.success('Resume removed.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  preview(resume: Resume): void {
    this.dialog.open(ResumePreviewDialogComponent, {
      data: { resume },
      width: '760px',
      maxWidth: '94vw',
      autoFocus: false,
    });
  }

  download(resume: Resume): void {
    const anchor = document.createElement('a');
    anchor.href = resume.fileUrl;
    anchor.download = resume.fileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.resumeService.list().subscribe({
      next: (list) => {
        this.resumes.set(list);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load your resumes.');
        this.loading.set(false);
      },
    });
  }
}
