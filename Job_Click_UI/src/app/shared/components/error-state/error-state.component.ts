import { Component, input, output } from '@angular/core';

/** Inline error placeholder with a retry action. */
@Component({
  selector: 'app-error-state',
  standalone: false,
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
})
export class ErrorStateComponent {
  readonly message = input<string>('Something went wrong while loading this content.');
  readonly retryLabel = input<string>('Try again');
  readonly retry = output<void>();
}
