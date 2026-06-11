import { Component, input } from '@angular/core';

/** Empty-state placeholder with an icon, title, message, and optional action slot. */
@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
}
