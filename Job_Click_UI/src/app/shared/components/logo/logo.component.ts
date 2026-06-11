import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Job Click Portal brand logo. Renders the transparent lockup; use `onDark`
 * on dark/colored surfaces to place it on a legible light chip.
 */
@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  /** Rendered logo height in pixels (width scales to the square artwork). */
  readonly size = input<number>(40);
  /** Wrap the logo in a light chip for legibility on dark/colored surfaces. */
  readonly onDark = input(false, { transform: booleanAttribute });
  /** Accessible alternative text. */
  readonly alt = input<string>('Job Click Portal');

  protected readonly src = 'assets/logo/job_click_logo_transparent.png';
}
