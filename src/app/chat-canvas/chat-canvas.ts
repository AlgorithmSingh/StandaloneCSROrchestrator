import { ChatHistory, MessageDecorator } from './components/chat-history/chat-history';
import { InputArea } from './components/input-area/input-area';
import { ChatService } from './services/chat.service';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'chat-canvas',
  template: `
    <div class="chat-canvas">
      <div class="chat-panel">
        <div class="chat-history-container">
          <chat-history
            [history]="chatService.history()"
            [emptyHistoryTemplate]="emptyHistoryTemplate()"
            [messageDecorator]="messageDecorator()"
          />
        </div>
        <div class="input-area-container">
          <input-area />
        </div>
      </div>
    </div>
  `,
  styles: `
    .chat-canvas {
      display: flex;
      height: 100%;
      width: 100%;
    }

    .chat-panel {
      display: flex;
      flex-direction: column;
      flex: 1;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .chat-history-container {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 1rem;
    }

    .input-area-container {
      padding: 1rem 0;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatHistory, InputArea],
})
export class ChatCanvas {
  readonly emptyHistoryTemplate = input<TemplateRef<unknown>>();
  readonly messageDecorator = input<MessageDecorator | undefined>(undefined);

  protected readonly chatService = inject(ChatService);
}
