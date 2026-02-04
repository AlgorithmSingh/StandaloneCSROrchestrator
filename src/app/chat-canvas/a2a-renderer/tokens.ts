import { InjectionToken } from '@angular/core';
import {
  ArtifactResolver,
  PartResolver,
  RendererComponentClassLoader,
  RendererEntry,
} from './types';

/** Injection token for PartResolvers. */
export const PART_RESOLVERS = new InjectionToken<readonly PartResolver[]>('PART_RESOLVERS');

/** Injection token for RendererEntries. */
export const RENDERERS = new InjectionToken<readonly RendererEntry[]>('RENDERERS');

/** Map of variant name to renderer class loader. */
export const RENDERERS_MAP = new InjectionToken<ReadonlyMap<string, RendererComponentClassLoader>>(
  'RENDERERS_MAP'
);

/** Injection token for ArtifactResolvers. */
export const ARTIFACT_RESOLVERS = new InjectionToken<readonly ArtifactResolver[]>('ARTIFACT_RESOLVERS');

/** Converts renderer entries to a map. */
export function renderersToMap(
  renderers: readonly RendererEntry[]
): ReadonlyMap<string, RendererComponentClassLoader> {
  const rendererNames = new Set(renderers.map(([variantName]) => variantName));
  if (rendererNames.size !== renderers.length) {
    console.warn('Duplicate renderer names found, using only the last one.');
  }
  return new Map(renderers);
}
