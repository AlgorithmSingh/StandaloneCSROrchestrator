import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'avatar',
  template: `
    <div class="container">
      @if (showProgressIndicator()) {
        <div class="progress-indicator-wrapper">
          <mat-progress-spinner
            mode="indeterminate"
            color="primary"
            aria-label="Agent is thinking"
            class="progress-indicator"
            strokeWidth="2"
            diameter="32"
          />
        </div>
      }
      <div [class]="showProgressIndicator() ? 'agent-icon-container' : 'large-icon-container'">
        <ng-container
          *ngTemplateOutlet="
            agentIcon;
            context: {
              agentIconUrl: iconUrl(),
              iconClass: showProgressIndicator() ? 'icon' : 'large-icon'
            }
          "
        />
      </div>
    </div>

    <ng-template #agentIcon let-agentIconUrl="agentIconUrl" let-iconClass="iconClass">
      <div class="agent-icon">
        @if (agentIconUrl) {
          <img [src]="agentIconUrl" [class]="iconClass" role="presentation" alt="" />
        } @else {
          <mat-icon [class]="iconClass">spark</mat-icon>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .progress-indicator-wrapper {
      position: absolute;
      top: 0;
      left: 0;
    }

    .progress-indicator {
      --mdc-circular-progress-active-indicator-color: var(--mat-sys-primary);
    }

    .agent-icon-container {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .large-icon-container {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agent-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      width: 20px;
      height: 20px;
    }

    .large-icon {
      width: 28px;
      height: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatProgressSpinner, NgTemplateOutlet],
})
export class Avatar {
  readonly iconUrl = input<string | SafeUrl | undefined>(undefined);
  readonly showProgressIndicator = input<boolean>(true);
}
