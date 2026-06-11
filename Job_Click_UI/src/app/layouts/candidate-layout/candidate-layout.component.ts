import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { CandidateProfileStore } from '@features/candidate/state/candidate-profile.store';
import { CANDIDATE_NAV } from './candidate-nav';

/** Candidate workspace shell: collapsible sidebar + header + content outlet. */
@Component({
  selector: 'app-candidate-layout',
  standalone: false,
  templateUrl: './candidate-layout.component.html',
  styleUrl: './candidate-layout.component.scss',
})
export class CandidateLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly profileStore = inject(CandidateProfileStore);

  readonly currentUser = inject(CurrentUserStore);
  readonly nav = CANDIDATE_NAV;

  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  readonly initials = computed(() => deriveInitials(this.currentUser.displayName()));

  ngOnInit(): void {
    // Ensure the candidate's profile is available across all child pages.
    this.profileStore.load();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'U';
  }
  const parts = trimmed.split(/\s+/);
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}
