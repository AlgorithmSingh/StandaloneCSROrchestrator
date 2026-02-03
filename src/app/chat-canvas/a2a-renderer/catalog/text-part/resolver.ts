import { Part } from '@a2a-js/sdk';
import { PartResolver } from '../../types';

/**
 * Resolver for text parts.
 */
export const TEXT_PART_RESOLVER: PartResolver = (part: Part): string | null => {
  if (part.kind === 'text') {
    return 'text_part';
  }
  return null;
};
