import { A2aRenderer } from '../../a2a-renderer/a2a-renderer';
import { Avatar } from '../avatar/avatar';
import { UiMessageContent } from '../../types/ui-message';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'agent-header',
  template: `
    <div class="agent-header">
      <div class="agent-header-part">
        <avatar [showProgressIndicator]="showProgressIndicator()" [iconUrl]="agentIconUrl()" />
      </div>
      @if (agentName()) {
        <div class="agent-header-part agent-name">
          <strong>{{ agentName() }}</strong>
        </div>
      }
      @if (statusText()) {
        <div class="agent-header-part agent-header-status-text">
          {{ statusText() }}
        </div>
      }
      @if (containsAgentThoughts()) {
        <button
          mat-button
          class="view-agent-thoughts-button"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="agentThoughtsContentId"
          type="button"
          (click)="expanded.set(!expanded())"
          [id]="agentThoughtsButtonId"
        >
          Show thinking
          <mat-icon iconPositionEnd>
            @if (expanded()) {
              keyboard_arrow_up
            } @else {
              keyboard_arrow_down
            }
          </mat-icon>
        </button>
      }
    </div>
    <div
      [id]="agentThoughtsContentId"
      [class.hide]="!expanded()"
      [attr.aria-labelledby]="agentThoughtsButtonId"
      role="region"
      class="agent-thoughts-content"
    >
      @for (agentThought of agentThoughts(); track $index) {
        <a2a-renderer [uiMessageContent]="agentThought" />
      }
    </div>
  `,
  styles: `
    .agent-header {
      display: flex;
      align-items: center;
      flex-flow: row wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .agent-header-part {
      display: flex;
      align-items: center;
    }

    .agent-name {
      font-size: 0.875rem;
    }

    .agent-header-status-text {
      color: var(--mat-sys-outline);
      font-size: 0.75rem;
    }

    .view-agent-thoughts-button {
      font-size: 0.75rem;
      height: auto;
      padding: 0.25rem 0.5rem;
    }

    .agent-thoughts-content {
      margin-left: 2.5rem;
      padding: 0.5rem;
      background: var(--mat-sys-surface-container);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .agent-thoughts-content.hide {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, A2aRenderer, MatButton, MatIcon],
})
export class AgentHeader {
  private static instanceCount = 0;

  readonly agentIconUrl = input<string | SafeUrl | undefined>(undefined);
  readonly agentName = input<string | undefined>(undefined);
  readonly showProgressIndicator = input<boolean>(false);
  readonly statusText = input<string | undefined>(undefined);
  readonly agentThoughts = input<readonly UiMessageContent[] | undefined>(undefined);

  protected readonly expanded = signal<boolean>(false);
  protected readonly containsAgentThoughts = computed(() => {
    const agentThoughts = this.agentThoughts();
    return agentThoughts && agentThoughts.length > 0;
  });

  private readonly instanceId = AgentHeader.instanceCount++;
  protected readonly agentThoughtsButtonId = `view-agent-thoughts-button-${this.instanceId}`;
  protected readonly agentThoughtsContentId = `agent-thoughts-content-${this.instanceId}`;
}
