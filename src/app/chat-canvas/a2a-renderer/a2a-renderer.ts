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
    effect(() => {
      const content = this.uiMessageContent();
      const componentClassLoader = this.renderersMap.get(content.variant);
      if (!componentClassLoader) {
        console.warn(`No renderer found for variant: ${content.variant}`);
        this.componentClass.set(null);
        return;
      }
      componentClassLoader().then((cls) => this.componentClass.set(cls));
    });
  }
}
