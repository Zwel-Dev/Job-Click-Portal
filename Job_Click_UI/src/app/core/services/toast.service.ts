import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Thin wrapper over MatSnackBar for transient success / error / info messages. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'jc-toast--success');
  }

  error(message: string): void {
    this.open(message, 'jc-toast--error');
  }

  info(message: string): void {
    this.open(message, 'jc-toast--info');
  }

  private open(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3500,
      panelClass: [panelClass],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
