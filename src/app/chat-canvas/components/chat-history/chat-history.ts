import { Message } from '../message/message';
import { ChatService } from '../../services/chat.service';
import { UiMessage } from '../../types/ui-message';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  Type,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';

/**
 * Type for a message decorator component loader function.
 */
export type MessageDecorator = () => Promise<Type<unknown>>;

@Component({
  selector: 'chat-history',
  template: `
    <div role="log" class="chat-history">
      @let internalHistory = historyByTurn();
      @if (internalHistory.length === 0) {
        <div class="empty-history">
          <ng-template #defaultEmptyHistoryTemplate>
            <p class="empty-history-text">Hello</p>
          </ng-template>
          <ng-container
            *ngTemplateOutlet="emptyHistoryTemplate() ?? defaultEmptyHistoryTemplate"
          ></ng-container>
        </div>
      } @else {
        <div class="chat-history-items">
          @for (turn of internalHistory; track $index; let isLastTurn = $last) {
            <div class="turn-container" #turnContainer>
              @for (message of turn; track $index) {
                <ng-template #coreContentTemplateRef>
                  <message [message]="message" />
                </ng-template>
                <div role="group" tabindex="-1" class="chat-history-message-container">
                  @if (resolvedMessageDecorator()) {
                    <ng-container
                      *ngComponentOutlet="
                        resolvedMessageDecorator();
                        inputs: { message: message, coreContentTemplateRef: coreContentTemplateRef }
                      "
                    ></ng-container>
                  } @else {
                    <ng-container *ngTemplateOutlet="coreContentTemplateRef"></ng-container>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .chat-history {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .empty-history {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      padding: 2rem;
    }

    .empty-history-text {
      color: var(--mat-sys-outline);
      font-size: 1.25rem;
    }

    .chat-history-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }

    .turn-container {
      display: flex;
      flex-direction: column;
    }

    .chat-history-message-container {
      outline: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Message, NgComponentOutlet, NgTemplateOutlet],
})
export class ChatHistory {
  readonly history = input.required<UiMessage[]>();
  readonly emptyHistoryTemplate = input<TemplateRef<unknown>>();
  readonly messageDecorator = input<MessageDecorator | undefined>(undefined);

  private readonly chatService = inject(ChatService);
  private readonly turnContainers = viewChildren<ElementRef<HTMLElement>>('turnContainer');

  protected readonly historyByTurn = computed(() => {
    const history = this.history();
    const historyByTurn: UiMessage[][] = [];
    let currentTurn: UiMessage[] = [];

    for (const message of history) {
      if (currentTurn.length === 0) {
        currentTurn.push(message);
        continue;
      }
      const lastMessage = currentTurn[currentTurn.length - 1];
      if (message.role.type === 'ui_agent' && lastMessage.role.type === 'ui_user') {
        currentTurn.push(message);
      } else {
        historyByTurn.push(currentTurn);
        currentTurn = [message];
      }
    }

    if (currentTurn.length > 0) {
      historyByTurn.push(currentTurn);
    }

    return historyByTurn;
  });

  protected readonly resolvedMessageDecorator = signal<Type<unknown> | null>(null);

  protected readonly surfaces = computed(() => this.chatService.a2uiSurfaces());

  constructor() {
    // Load message decorator asynchronously when it changes
    effect(() => {
      const decoratorLoader = this.messageDecorator();
      if (!decoratorLoader) {
        this.resolvedMessageDecorator.set(null);
        return;
      }
      decoratorLoader().then((cls) => this.resolvedMessageDecorator.set(cls));
    });

    afterRenderEffect({
      write: () => {
        const turnContainers = this.turnContainers();
        const turnContainer = turnContainers.at(-1)?.nativeElement;
        turnContainer?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      },
    });
  }
}
