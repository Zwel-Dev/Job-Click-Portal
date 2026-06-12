import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { CompanyLocation, CompanyLocationFormValue } from '@core/models/company.model';
import { CompanyService } from '../../services/company.service';
import { CompanyContextStore } from '../../state/company-context.store';
import { LocationDialogData, LocationFormDialogComponent } from '../../components/location-form-dialog/location-form-dialog.component';

@Component({
  selector: 'app-company-locations',
  standalone: false,
  templateUrl: './company-locations.component.html',
  styleUrl: './company-locations.component.scss',
})
export class CompanyLocationsComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly companyContext = inject(CompanyContextStore);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly locations = signal<CompanyLocation[]>([]);
  readonly skeletons = [0, 1, 2];

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  add(): void {
    const data: LocationDialogData = { mode: 'create', lockHeadOffice: this.locations().length === 0 };
    this.openDialog(data, (value) => this.companyService.saveLocation(value), 'Location added.');
  }

  edit(location: CompanyLocation): void {
    const onlyHeadOffice = location.isHeadOffice && this.locations().length === 1;
    const data: LocationDialogData = {
      mode: 'edit',
      lockHeadOffice: onlyHeadOffice,
      value: {
        country: location.country,
        state: location.state,
        city: location.city,
        address: location.address,
        postalCode: location.postalCode,
        isHeadOffice: location.isHeadOffice,
      },
    };
    this.openDialog(data, (value) => this.companyService.saveLocation(value, location.id), 'Location updated.');
  }

  setHeadOffice(location: CompanyLocation): void {
    this.companyService.setHeadOffice(location.id).subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.toast.success(`${location.city} is now the head office.`);
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(location: CompanyLocation): void {
    this.confirm
      .confirm({
        title: 'Delete location',
        message: `Delete the ${location.city} location?`,
        confirmLabel: 'Delete',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.companyService.removeLocation(location.id).subscribe({
          next: () => {
            this.toast.success('Location deleted.');
            this.companyContext.reload();
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private openDialog(
    data: LocationDialogData,
    save: (value: CompanyLocationFormValue) => ReturnType<CompanyService['saveLocation']>,
    message: string,
  ): void {
    this.dialog
      .open(LocationFormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe((value: CompanyLocationFormValue | null | undefined) => {
        if (!value) {
          return;
        }
        save(value).subscribe({
          next: () => {
            this.toast.success(message);
            this.companyContext.reload();
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.companyService.listLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load locations.');
        this.loading.set(false);
      },
    });
  }
}
