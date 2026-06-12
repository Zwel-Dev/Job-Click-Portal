import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/** Implemented by components that may have unsaved changes. */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

/**
 * Blocks navigation away from a component with unsaved changes until the
 * component's `canDeactivate()` resolves true (typically via a confirm dialog).
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) =>
  component.canDeactivate ? component.canDeactivate() : true;
