import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  configureChatCanvasFeatures,
  usingA2aService,
  usingA2uiRenderers,
  usingDefaultSanitizerMarkdownRenderer,
} from './chat-canvas/config';
import { A2aServiceImpl } from './services/a2a-service-impl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    configureChatCanvasFeatures(
      usingA2aService(A2aServiceImpl),
      usingA2uiRenderers(),
      usingDefaultSanitizerMarkdownRenderer()
    ),
  ],
};
