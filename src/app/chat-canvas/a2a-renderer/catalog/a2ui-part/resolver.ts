import { Part } from '@a2a-js/sdk';
import { PartResolver } from '../../types';

/**
 * Resolver for A2UI data parts.
 */
export const A2UI_PART_RESOLVER: PartResolver = (part: Part): string | null => {
  if (
    part.kind === 'data' &&
    part.data &&
    typeof part.data === 'object' &&
    'beginRendering' in part.data
  ) {
    return 'a2ui_part';
  }
  return null;
};
