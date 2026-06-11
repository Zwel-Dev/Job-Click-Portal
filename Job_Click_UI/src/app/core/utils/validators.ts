import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Group-level validator that flags when two password fields differ.
 * Sets `passwordMismatch` on the confirm control so the error shows in place.
 */
export function passwordsMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value as string | undefined;
    const confirmControl = group.get(confirmKey);
    const confirm = confirmControl?.value as string | undefined;

    if (!confirmControl || !confirm) {
      return null;
    }

    if (password === confirm) {
      // Clear a previously-set mismatch error without wiping other errors.
      if (confirmControl.hasError('passwordMismatch')) {
        const { passwordMismatch: _removed, ...rest } = confirmControl.errors ?? {};
        confirmControl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }

    confirmControl.setErrors({ ...(confirmControl.errors ?? {}), passwordMismatch: true });
    return { passwordMismatch: true };
  };
}

/** Requires at least 8 characters with upper-case, lower-case, and a number. */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string) ?? '';
    if (!value) {
      return null;
    }
    const valid =
      value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
    return valid ? null : { weakPassword: true };
  };
}
