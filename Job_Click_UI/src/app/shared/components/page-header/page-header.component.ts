import { Component, input } from '@angular/core';

/** Page title + optional subtitle, with a right-aligned `[actions]` slot. */
@Component({
  selector: 'app-page-header',
  standalone: false,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
