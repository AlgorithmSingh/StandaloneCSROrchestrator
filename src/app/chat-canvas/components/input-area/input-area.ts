import { ChatService } from '../../services/chat.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'input-area',
  template: `
    <form (ngSubmit)="validateAndSendMessage()" [formGroup]="formGroup" #form>
      <div class="input-row">
        <div (keydown.enter)="submitIfEnterKeydownEvent($event)" class="text-area-container">
          <mat-form-field appearance="outline" class="text-field">
            <textarea
              matInput
              cdkTextareaAutosize
              #autosize="cdkTextareaAutosize"
              cdkAutosizeMinRows="1"
              cdkAutosizeMaxRows="30"
              placeholder="Ask a question"
              aria-label="Ask a question"
              [formControl]="formGroup.controls.query"
              aria-required="true"
              #textarea
            ></textarea>
          </mat-form-field>
        </div>
        @if (chatService.isA2aStreamOpen()) {
          <button
            mat-icon-button
            class="action-button stop-button"
            (click)="cancelOngoingStreamAndFocusInput()"
            aria-label="Stop agent execution"
            matTooltip="Stop agent execution"
            type="button"
          >
            <mat-icon class="stop-button-icon">stop</mat-icon>
          </button>
        } @else {
          <button
            mat-icon-button
            class="action-button"
            aria-label="Send message"
            matTooltip="Send message"
            type="submit"
            [disabled]="formGroup.controls.query.value.trim() === ''"
          >
            <mat-icon>send</mat-icon>
          </button>
        }
      </div>
    </form>
    <div class="disclaimer">AI sometimes generates inaccurate info, so double-check responses.</div>
  `,
  styles: `
    form {
      width: 100%;
    }

    .input-row {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .text-area-container {
      flex: 1;
    }

    .text-field {
      width: 100%;
    }

    .text-field textarea {
      resize: none;
    }

    .action-button {
      margin-bottom: 0.5rem;
    }

    .stop-button {
      --mdc-icon-button-icon-color: var(--mat-sys-error);
    }

    .disclaimer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--mat-sys-outline);
      margin-top: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkTextareaAutosize,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatTooltip,
    ReactiveFormsModule,
  ],
})
export class InputArea {
  protected readonly chatService = inject(ChatService);

  protected readonly formGroup = new FormGroup({
    query: new FormControl('', {
      nonNullable: true,
    }),
  });

  protected readonly form = viewChild.required<ElementRef<HTMLFormElement>>('form');
  protected readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  protected submitIfEnterKeydownEvent(event: Event) {
    if (
      !isKeyboardEvent(event) ||
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    event.preventDefault();
    this.form().nativeElement.requestSubmit();
  }

  protected validateAndSendMessage() {
    if (this.formGroup.controls.query.value.trim() === '') {
      return;
    }

    const query = this.formGroup.value.query!;
    console.log('[Orchestrator][InputArea] User submitting message:', query);
    this.chatService.cancelOngoingStream();
    this.chatService.sendMessage(query);
    this.formGroup.reset();
  }

  protected cancelOngoingStreamAndFocusInput() {
    this.chatService.cancelOngoingStream();
    this.textarea().nativeElement.focus();
  }
}

function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return event.type === 'keydown';
}
