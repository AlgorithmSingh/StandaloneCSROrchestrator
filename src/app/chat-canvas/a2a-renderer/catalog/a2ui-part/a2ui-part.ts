import { Part } from '@a2a-js/sdk';
import { RendererComponent } from '../../types';
import { ChatService } from '../../../services/chat.service';
import { UiMessageContent } from '../../../types/ui-message';
import { isA2aDataPart } from '../../../utils/type-guards';
import { BeginRenderingMessage } from '../../../utils/a2a-helpers';
import { Surface } from '@a2ui/angular';
import { Component, computed, inject, input } from '@angular/core';

/**
 * Component for rendering an A2UI surface embedded within an A2A message part.
 */
@Component({
  selector: 'a2ui-part',
  template: `
    @if (a2uiSurface() && a2uiSurfaceId()) {
      <a2ui-surface [surfaceId]="a2uiSurfaceId()!" [surface]="a2uiSurface()!" />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  imports: [Surface],
})
export class A2uiPartComponent implements RendererComponent {
  readonly uiMessageContent = input.required<UiMessageContent>();

  private readonly chatService = inject(ChatService);

  protected readonly a2uiSurfaceId = computed(() => {
    const part = this.uiMessageContent().data as Part;
    if (isA2aDataPart(part)) {
      if (part.data && typeof part.data === 'object' && 'beginRendering' in part.data) {
        const beginRenderingMessage = part.data['beginRendering'] as BeginRenderingMessage;
        return beginRenderingMessage.surfaceId;
      }
    }
    return undefined;
  });

  protected readonly a2uiSurface = computed(() => {
    const surfaceId = this.a2uiSurfaceId();
    if (!surfaceId) {
      return undefined;
    }
    return this.chatService.a2uiSurfaces().get(surfaceId);
  });
}
