import { A2aRenderer } from '../../a2a-renderer/a2a-renderer';
import { AgentHeader } from '../agent-header/agent-header';
import { ChatService } from '../../services/chat.service';
import { Role, UiAgent, UiMessage, UiMessageContent } from '../../types/ui-message';
import { isAgentThought } from '../../utils/a2a-helpers';
import { isA2aPart } from '../../utils/type-guards';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'message',
  template: `
    @let role = message().role;

    <div
      [class.agent-message-row]="isRoleAgent(role)"
      [class.user-message-row]="!isRoleAgent(role)"
      class="message-row"
    >
      @if (isRoleAgent(role)) {
        <agent-header
          [agentName]="getAgentName(role)"
          [agentIconUrl]="role.iconUrl"
          [agentThoughts]="agentThoughts()"
          [showProgressIndicator]="showProgressIndicator()"
        />
      }
      <div [class.user-message-container]="!isRoleAgent(role)" class="message-container">
        @for (content of messageContents(); track $index) {
          <div>
            <a2a-renderer [uiMessageContent]="content" />
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .message-row {
      margin-bottom: 1rem;
    }

    .agent-message-row {
      padding-right: 2rem;
    }

    .user-message-row {
      display: flex;
      justify-content: flex-end;
      padding-left: 2rem;
    }

    .message-container {
      line-height: 1.5;
    }

    .user-message-container {
      background: var(--mat-sys-surface-container-high);
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      max-width: 80%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentHeader, A2aRenderer],
})
export class Message {
  readonly message = input.required<UiMessage>();

  private readonly chatService = inject(ChatService);

  protected getAgentName(role: UiAgent) {
    const rootagentName = role.name;
    return role.subagentName ? `${rootagentName} + ${role.subagentName}` : rootagentName;
  }

  protected readonly agentThoughts = computed(() =>
    this.message().contents.filter((content) => containsAgentThought(content))
  );

  protected readonly messageContents = computed(() =>
    this.message().contents.filter((content) => !containsAgentThought(content))
  );

  protected readonly showProgressIndicator = computed(() => {
    return this.message().status === 'pending';
  });

  protected readonly surfaces = computed(() => this.chatService.a2uiSurfaces());

  protected isRoleAgent(role: Role): role is UiAgent {
    return role.type === 'ui_agent';
  }
}

function containsAgentThought(content: UiMessageContent): boolean {
  if (isA2aPart(content.data)) {
    return isAgentThought(content.data);
  }
  return false;
}
