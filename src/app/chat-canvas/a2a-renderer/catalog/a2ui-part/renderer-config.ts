import { RendererEntry } from '../../types';

/**
 * Renderer entry for A2UI data parts.
 */
export const A2UI_PART_RENDERER_ENTRY: RendererEntry = [
  'a2ui_part',
  () => import('./a2ui-part').then((m) => m.A2uiPartComponent),
];
