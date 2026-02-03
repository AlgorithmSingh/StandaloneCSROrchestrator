import { InjectionToken, inject } from '@angular/core';
import {
  ArtifactResolver,
  PartResolver,
  RendererComponentClassLoader,
  RendererEntry,
} from './types';

/** Injection token for PartResolvers. */
export const PART_RESOLVERS = new InjectionToken<readonly PartResolver[]>('PART_RESOLVERS', {
  providedIn: 'root',
  factory: () => [],
});

/** Injection token for RendererEntries. */
export const RENDERERS = new InjectionToken<readonly RendererEntry[]>('RENDERERS', {
  providedIn: 'root',
  factory: () => [],
});

/** Map of variant name to renderer class loader. */
export const RENDERERS_MAP = new InjectionToken<ReadonlyMap<string, RendererComponentClassLoader>>(
  'RENDERERS_MAP',
  {
    factory: () => {
      return renderersToMap(inject(RENDERERS));
    },
  }
);

/** Injection token for ArtifactResolvers. */
export const ARTIFACT_RESOLVERS = new InjectionToken<readonly ArtifactResolver[]>(
  'ARTIFACT_RESOLVERS',
  { providedIn: 'root', factory: () => [] }
);

function renderersToMap(
  renderers: readonly RendererEntry[]
): ReadonlyMap<string, RendererComponentClassLoader> {
  const rendererNames = new Set(renderers.map(([variantName]) => variantName));
  if (rendererNames.size !== renderers.length) {
    console.warn('Duplicate renderer names found, using only the last one.');
  }
  return new Map(renderers);
}
