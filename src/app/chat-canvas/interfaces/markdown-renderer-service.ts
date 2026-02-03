import { InjectionToken } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

/**
 * Interface for a markdown renderer service.
 */
export interface MarkdownRendererService {
  render(markdown: string): Promise<SafeHtml>;
}

/**
 * Injection token for the MarkdownRendererService interface.
 */
export const MARKDOWN_RENDERER_SERVICE = new InjectionToken<MarkdownRendererService>(
  'MarkdownRendererService'
);
