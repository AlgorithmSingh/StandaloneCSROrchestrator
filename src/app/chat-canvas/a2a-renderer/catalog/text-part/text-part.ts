import { TextPart } from '@a2a-js/sdk';
import { RendererComponent } from '../../types';
import { MARKDOWN_RENDERER_SERVICE } from '../../../interfaces/markdown-renderer-service';
import { UiMessageContent } from '../../../types/ui-message';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

/**
 * Component for rendering a text part from an A2A message.
 */
@Component({
  selector: 'text-part',
  template: '',
  styles: `
    :host {
      display: block;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPartComponent implements RendererComponent {
  readonly uiMessageContent = input.required<UiMessageContent>();

  private readonly markdownRendererService = inject(MARKDOWN_RENDERER_SERVICE);

  protected readonly text = computed(() => (this.uiMessageContent().data as TextPart).text);

  private readonly renderedHtml = signal<SafeHtml | string>('');

  @HostBinding('innerHTML')
  get innerHtml(): SafeHtml | string {
    return this.renderedHtml();
  }

  constructor() {
    effect(async () => {
      this.renderedHtml.set(await this.markdownRendererService.render(this.text()));
    });
  }
}
