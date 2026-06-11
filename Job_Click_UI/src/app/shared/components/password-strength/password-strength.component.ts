import { Component, computed, input } from '@angular/core';

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface StrengthResult {
  level: StrengthLevel;
  label: string;
  /** Number of filled segments (0-4). */
  filled: number;
}

/** Lightweight password strength indicator. Presentational only. */
@Component({
  selector: 'app-password-strength',
  standalone: false,
  templateUrl: './password-strength.component.html',
  styleUrl: './password-strength.component.scss',
})
export class PasswordStrengthComponent {
  readonly password = input<string>('');

  readonly segments = [0, 1, 2, 3];
  readonly strength = computed<StrengthResult>(() => this.evaluate(this.password()));

  private evaluate(password: string): StrengthResult {
    if (!password) {
      return { level: 'weak', label: '', filled: 0 };
    }

    let met = 0;
    if (password.length >= 8) met++;
    if (/[A-Z]/.test(password)) met++;
    if (/[a-z]/.test(password)) met++;
    if (/\d/.test(password)) met++;
    if (/[^A-Za-z0-9]/.test(password)) met++;

    if (met <= 2) return { level: 'weak', label: 'Weak', filled: 1 };
    if (met === 3) return { level: 'fair', label: 'Fair', filled: 2 };
    if (met === 4) return { level: 'good', label: 'Good', filled: 3 };
    return { level: 'strong', label: 'Strong', filled: 4 };
  }
}
