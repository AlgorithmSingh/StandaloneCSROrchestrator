import { Route } from '@angular/router';

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
  },
];
