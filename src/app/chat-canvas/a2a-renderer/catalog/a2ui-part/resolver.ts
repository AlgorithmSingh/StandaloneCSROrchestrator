import { Part } from '@a2a-js/sdk';
import { PartResolver } from '../../types';

/**
 * Resolver for A2UI data parts.
 * Matches parts with mimeType 'application/json+a2ui' or containing A2UI message types.
 */
export const A2UI_PART_RESOLVER: PartResolver = (part: Part): string | null => {
  if (part.kind !== 'data' || !part.data || typeof part.data !== 'object') {
    return null;
  }

  // Check for A2UI mimeType
  if (part.metadata?.['mimeType'] === 'application/json+a2ui') {
    return 'a2ui_part';
  }

  // Check for known A2UI message types
  if (
    'beginRendering' in part.data ||
    'surfaceUpdate' in part.data ||
    'dataModelUpdate' in part.data
  ) {
    return 'a2ui_part';
  }

  return null;
};
