import { Component, input } from '@angular/core';

/** Shimmering placeholder block for loading states. */
@Component({
  selector: 'app-skeleton',
  standalone: false,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly radius = input<string>('var(--jc-radius-sm)');
}
