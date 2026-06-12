import { Component, input, output, signal } from '@angular/core';

/** Drag-and-drop / click file picker with type + size validation. Emits the chosen File. */
@Component({
  selector: 'app-file-upload',
  standalone: false,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  /** Comma-separated extensions, e.g. ".pdf,.doc,.docx". Empty = accept any. */
  readonly accept = input<string>('');
  readonly maxSizeMb = input<number>(5);
  readonly disabled = input(false);
  readonly hint = input<string>('');
  readonly fileSelected = output<File>();

  readonly dragOver = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) {
      return;
    }
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handle(file);
    }
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handle(file);
    }
    input.value = '';
  }

  private handle(file: File): void {
    this.errorMessage.set(null);
    if (!this.isAccepted(file)) {
      this.errorMessage.set('Unsupported file type.');
      return;
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.errorMessage.set(`File is larger than ${this.maxSizeMb()} MB.`);
      return;
    }
    this.fileSelected.emit(file);
  }

  private isAccepted(file: File): boolean {
    const accept = this.accept().trim().toLowerCase();
    if (!accept) {
      return true;
    }
    const name = file.name.toLowerCase();
    return accept
      .split(',')
      .map((ext) => ext.trim())
      .some((ext) => ext.startsWith('.') && name.endsWith(ext));
  }
}
