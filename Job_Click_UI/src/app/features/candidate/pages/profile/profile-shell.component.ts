import { Component, OnInit, inject } from '@angular/core';
import { CandidateProfileStore } from '../../state/candidate-profile.store';
import { AVAILABILITY_STATUS_LABELS } from '@core/enums/availability-status.enum';
import { PROFILE_VISIBILITY_LABELS } from '@core/enums/profile-visibility.enum';

@Component({
  selector: 'app-profile-shell',
  standalone: false,
  templateUrl: './profile-shell.component.html',
  styleUrl: './profile-shell.component.scss',
})
export class ProfileShellComponent implements OnInit {
  readonly store = inject(CandidateProfileStore);
  readonly availabilityLabels = AVAILABILITY_STATUS_LABELS;
  readonly visibilityLabels = PROFILE_VISIBILITY_LABELS;

  readonly sections = [
    { id: 'personal', label: 'Personal' },
    { id: 'summary', label: 'Summary' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  ngOnInit(): void {
    this.store.load();
  }

  scrollTo(id: string): void {
    document.getElementById('section-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }
}
