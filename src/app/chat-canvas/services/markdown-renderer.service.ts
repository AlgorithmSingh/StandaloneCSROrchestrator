import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownRendererService } from '../interfaces/markdown-renderer-service';

/**
 * A simple markdown renderer that uses the DomSanitizer.
 */
@Injectable({
  providedIn: 'root',
})
export class SanitizerMarkdownRendererService implements MarkdownRendererService {
  private readonly sanitizer = inject(DomSanitizer);

  render(markdown: string): Promise<SafeHtml> {
    return Promise.resolve(this.sanitizer.bypassSecurityTrustHtml(markdown));
  }
}
