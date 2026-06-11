import { Component } from '@angular/core';

/** Split-screen shell for authentication pages: brand panel + content card. */
@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  readonly year = new Date().getFullYear();
}
