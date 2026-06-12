import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Resume } from '@core/models/candidate.model';

export interface ResumePreviewData {
  resume: Resume;
}

@Component({
  selector: 'app-resume-preview-dialog',
  standalone: false,
  templateUrl: './resume-preview-dialog.component.html',
  styleUrl: './resume-preview-dialog.component.scss',
})
export class ResumePreviewDialogComponent {
  readonly data = inject<ResumePreviewData>(MAT_DIALOG_DATA);
  private readonly sanitizer = inject(DomSanitizer);

  readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    this.data.resume.fileUrl,
  );
}
