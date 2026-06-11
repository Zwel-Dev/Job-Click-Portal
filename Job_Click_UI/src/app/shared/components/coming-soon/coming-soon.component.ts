import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/** Generic placeholder for routes not yet implemented. Reads `data.label` from the route. */
@Component({
  selector: 'app-coming-soon',
  standalone: false,
  templateUrl: './coming-soon.component.html',
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);

  readonly label = toSignal(
    this.route.data.pipe(map((data) => (data['label'] as string | undefined) ?? 'This section')),
    { initialValue: 'This section' },
  );
}
