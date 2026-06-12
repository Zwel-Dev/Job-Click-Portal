import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { Department, DepartmentFormValue } from '@core/models/company.model';
import { CompanyService } from '../../services/company.service';
import { CompanyContextStore } from '../../state/company-context.store';
import { DepartmentDialogData, DepartmentFormDialogComponent } from '../../components/department-form-dialog/department-form-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: false,
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly companyContext = inject(CompanyContextStore);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly skeletons = [0, 1, 2];

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  add(): void {
    this.openDialog({ mode: 'create' }, (value) => this.companyService.saveDepartment(value), 'Department added.');
  }

  edit(department: Department): void {
    const data: DepartmentDialogData = {
      mode: 'edit',
      value: { name: department.name, description: department.description },
    };
    this.openDialog(data, (value) => this.companyService.saveDepartment(value, department.id), 'Department updated.');
  }

  remove(department: Department): void {
    if (department.jobCount > 0) {
      this.toast.error('Reassign this department\'s jobs before deleting it.');
      return;
    }
    this.confirm
      .confirm({
        title: 'Delete department',
        message: `Delete the "${department.name}" department?`,
        confirmLabel: 'Delete',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.companyService.removeDepartment(department.id).subscribe({
          next: () => {
            this.toast.success('Department deleted.');
            this.companyContext.reload();
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private openDialog(
    data: DepartmentDialogData,
    save: (value: DepartmentFormValue) => ReturnType<CompanyService['saveDepartment']>,
    message: string,
  ): void {
    this.dialog
      .open(DepartmentFormDialogComponent, { data, width: '440px' })
      .afterClosed()
      .subscribe((value: DepartmentFormValue | null | undefined) => {
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
    this.companyService.listDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load departments.');
        this.loading.set(false);
      },
    });
  }
}
