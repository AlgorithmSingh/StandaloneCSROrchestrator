import { RENDERERS_MAP } from './tokens';
import { UiMessageContent } from '../types/ui-message';
import { NgComponentOutlet } from '@angular/common';
import { Component, Type, computed, effect, inject, input, signal } from '@angular/core';
import { RendererComponent } from './types';

/**
 * Dynamically renders a component based on the provided UiMessageContent variant.
 */
@Component({
  selector: 'a2a-renderer',
  template: `
    @if (componentClass()) {
      <ng-container
        *ngComponentOutlet="componentClass(); inputs: { uiMessageContent: uiMessageContent() }"
      ></ng-container>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  imports: [NgComponentOutlet],
})
export class A2aRenderer {
  readonly uiMessageContent = input.required<UiMessageContent>();

  private readonly renderersMap = inject(RENDERERS_MAP);

  protected readonly componentClass = signal<Type<RendererComponent> | null>(null);

  constructor() {
    // Debug: Log available renderers
    console.log('[Orchestrator][A2aRenderer] Available renderers:', Array.from(this.renderersMap.keys()));

    effect(() => {
      const content = this.uiMessageContent();
      console.log('[Orchestrator][A2aRenderer] Looking for renderer:', content.variant);
      const componentClassLoader = this.renderersMap.get(content.variant);
      if (!componentClassLoader) {
        console.warn(`No renderer found for variant: ${content.variant}. Available:`, Array.from(this.renderersMap.keys()));
        this.componentClass.set(null);
        return;
      }
      componentClassLoader().then((cls) => this.componentClass.set(cls));
    });
  }
}
