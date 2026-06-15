import { Component, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Id } from '@core/models/common.model';
import { MessageAttachment, OutgoingMessage } from '@core/models/messaging.model';
import { formatFileSize } from '@core/utils/format';

const PLACEHOLDER_URL = '/assets/mock/files/sample-resume.pdf';
const MAX_SIZE_MB = 5;

/** Message input with attachment support; emits the composed message on send. */
@Component({
  selector: 'app-message-composer',
  standalone: false,
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss',
})
export class MessageComposerComponent {
  readonly send = output<OutgoingMessage>();

  readonly text = new FormControl('', { nonNullable: true });
  readonly attachments = signal<MessageAttachment[]>([]);
  readonly error = signal<string | null>(null);

  private nextId = 1;

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.error.set(`Attachments must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    this.error.set(null);
    this.attachments.update((items) => [
      ...items,
      { id: this.nextId++, fileName: file.name, fileUrl: PLACEHOLDER_URL, sizeLabel: formatFileSize(file.size) },
    ]);
  }

  removeAttachment(id: Id): void {
    this.attachments.update((items) => items.filter((item) => item.id !== id));
  }

  submit(): void {
    const body = this.text.value.trim();
    const attachments = this.attachments();
    if (!body && attachments.length === 0) {
      return;
    }
    this.send.emit({ body, attachments });
    this.text.setValue('');
    this.attachments.set([]);
    this.error.set(null);
  }

  onEnter(event: Event): void {
    // Enter sends; Shift+Enter inserts a newline.
    const keyboard = event as KeyboardEvent;
    if (!keyboard.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }
}
