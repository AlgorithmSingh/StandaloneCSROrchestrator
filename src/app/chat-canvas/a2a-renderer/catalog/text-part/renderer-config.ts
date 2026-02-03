import { RendererEntry } from '../../types';

/**
 * Renderer entry for text parts.
 */
export const TEXT_PART_RENDERER_ENTRY: RendererEntry = [
  'text_part',
  () => import('./text-part').then((m) => m.TextPartComponent),
];
