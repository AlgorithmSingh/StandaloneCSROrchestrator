import { Route } from '@angular/router';
import {
  configureChatCanvasFeatures,
  usingA2aService,
  usingA2uiRenderers,
  usingDefaultSanitizerMarkdownRenderer,
} from '../chat-canvas/config';
import { A2aServiceImpl } from '../services/a2a-service-impl';

export const remoteRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('../pages/chat-canvas-page/chat-canvas-page.component').then(
        (m) => m.ChatCanvasPageComponent,
      ),
    // Provide all chat canvas features at route level to ensure
    // they're available when the lazy-loaded component is created.
    // This is necessary for module federation scenarios where
    // app-level environment providers may not be accessible.
    providers: [
      configureChatCanvasFeatures(
        usingA2aService(A2aServiceImpl),
        usingA2uiRenderers(),
        usingDefaultSanitizerMarkdownRenderer(),
      ),
    ],
  },
];
