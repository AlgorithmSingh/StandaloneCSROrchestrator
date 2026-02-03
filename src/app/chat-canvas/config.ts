import { A2UI_PART_RENDERER_ENTRY } from './a2a-renderer/catalog/a2ui-part/renderer-config';
import { A2UI_PART_RESOLVER } from './a2a-renderer/catalog/a2ui-part/resolver';
import { TEXT_PART_RENDERER_ENTRY } from './a2a-renderer/catalog/text-part/renderer-config';
import { TEXT_PART_RESOLVER } from './a2a-renderer/catalog/text-part/resolver';
import { PART_RESOLVERS, RENDERERS } from './a2a-renderer/tokens';
import { PartResolver, RendererEntry } from './a2a-renderer/types';
import { A2A_SERVICE, A2aService } from './interfaces/a2a-service';
import { MARKDOWN_RENDERER_SERVICE, MarkdownRendererService } from './interfaces/markdown-renderer-service';
import { SanitizerMarkdownRendererService } from './services/markdown-renderer.service';
import { Catalog, DEFAULT_CATALOG, Theme } from '@a2ui/angular';
import { EnvironmentProviders, Provider, Type, makeEnvironmentProviders } from '@angular/core';

const DEFAULT_RENDERERS: readonly RendererEntry[] = [
  A2UI_PART_RENDERER_ENTRY,
  TEXT_PART_RENDERER_ENTRY,
];

const DEFAULT_PART_RESOLVERS: readonly PartResolver[] = [
  A2UI_PART_RESOLVER,
  TEXT_PART_RESOLVER,
];

/**
 * Configure chat canvas features.
 */
export function configureChatCanvasFeatures(
  a2aFeature: A2aFeature,
  a2uiFeature: A2uiFeature,
  ...additionalFeatures: ReadonlyArray<Exclude<ChatCanvasFeatures, A2aFeature | A2uiFeature>>
): EnvironmentProviders {
  const defaultPartResolversFeature = usingPartResolvers(...DEFAULT_PART_RESOLVERS);
  const defaultRenderersFeature = usingRenderers(...DEFAULT_RENDERERS);

  return makeEnvironmentProviders([
    [
      a2aFeature,
      a2uiFeature,
      defaultPartResolversFeature,
      defaultRenderersFeature,
      ...additionalFeatures,
    ].map((feature) => feature.providers),
  ]);
}

/**
 * Configure A2A service.
 */
export function usingA2aService<T extends A2aService>(a2aServiceClass: Type<T>): A2aFeature {
  return {
    kind: ChatCanvasFeatureKind.A2A_FEATURE,
    providers: [{ provide: A2A_SERVICE, useClass: a2aServiceClass }],
  };
}

/**
 * Configure markdown renderer.
 */
export function usingMarkdownRenderer<T extends MarkdownRendererService>(
  markdownRendererClass: Type<T>
): MarkdownFeature {
  return {
    kind: ChatCanvasFeatureKind.MARKDOWN_FEATURE,
    providers: [{ provide: MARKDOWN_RENDERER_SERVICE, useClass: markdownRendererClass }],
  };
}

/**
 * Use default sanitizer markdown renderer.
 */
export function usingDefaultSanitizerMarkdownRenderer(): MarkdownFeature {
  return usingMarkdownRenderer(SanitizerMarkdownRendererService);
}

/**
 * Configure part resolvers.
 */
export function usingPartResolvers(...partResolvers: readonly PartResolver[]): PartResolverFeature {
  return {
    kind: ChatCanvasFeatureKind.PART_RESOLVER_FEATURE,
    providers: [
      partResolvers.map((resolver) => ({
        provide: PART_RESOLVERS,
        useValue: resolver,
        multi: true,
      })),
    ],
  };
}

/**
 * Configure renderers.
 */
export function usingRenderers(...renderers: readonly RendererEntry[]): RendererFeature {
  return {
    kind: ChatCanvasFeatureKind.RENDERER_FEATURE,
    providers: [
      renderers.map((renderer) => ({
        provide: RENDERERS,
        useValue: renderer,
        multi: true,
      })),
    ],
  };
}

/**
 * Default theme with component class mappings.
 */
const DEFAULT_THEME: Theme = {
  components: {
    AudioPlayer: {},
    Button: {},
    Card: {},
    Column: {},
    CheckBox: {
      container: {},
      element: {},
      label: {},
    },
    DateTimeInput: {
      container: {},
      element: {},
      label: {},
    },
    Divider: {},
    Image: {
      all: {},
      icon: {},
      avatar: {},
      smallFeature: {},
      mediumFeature: {},
      largeFeature: {},
      header: {},
    },
    Icon: {},
    List: {},
    Modal: {
      backdrop: {},
      element: {},
    },
    MultipleChoice: {
      container: {},
      element: {},
      label: {},
    },
    Row: {},
    Slider: {
      container: {},
      element: {},
      label: {},
    },
    Tabs: {
      container: {},
      element: {},
      controls: {
        all: {},
        selected: {},
      },
    },
    Text: {
      all: {},
      h1: {},
      h2: {},
      h3: {},
      h4: {},
      h5: {},
      caption: {},
      body: {},
    },
    TextField: {
      container: {},
      element: {},
      label: {},
    },
    Video: {},
  },
  elements: {
    a: {},
    audio: {},
    body: {},
    button: {},
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    h5: {},
    iframe: {},
    input: {},
    p: {},
    pre: {},
    textarea: {},
    video: {},
  },
  markdown: {
    p: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    ul: [],
    ol: [],
    li: [],
    a: [],
    strong: [],
    em: [],
  },
};

/**
 * Configure A2UI renderers.
 */
export function usingA2uiRenderers(customCatalog?: Catalog, theme?: Theme): A2uiFeature {
  return {
    kind: ChatCanvasFeatureKind.A2UI_FEATURE,
    providers: [
      {
        provide: Catalog,
        useValue: {
          ...DEFAULT_CATALOG,
          ...(customCatalog ?? {}),
        },
      },
      {
        provide: Theme,
        useValue: {
          ...DEFAULT_THEME,
          ...(theme ?? {}),
        },
      },
    ],
  };
}

export interface ChatCanvasFeature<FeatureKind extends ChatCanvasFeatureKind> {
  kind: FeatureKind;
  providers: readonly Provider[];
}

export type MarkdownFeature = ChatCanvasFeature<ChatCanvasFeatureKind.MARKDOWN_FEATURE>;
export type A2aFeature = ChatCanvasFeature<ChatCanvasFeatureKind.A2A_FEATURE>;
export type PartResolverFeature = ChatCanvasFeature<ChatCanvasFeatureKind.PART_RESOLVER_FEATURE>;
export type RendererFeature = ChatCanvasFeature<ChatCanvasFeatureKind.RENDERER_FEATURE>;
export type A2uiFeature = ChatCanvasFeature<ChatCanvasFeatureKind.A2UI_FEATURE>;

export type ChatCanvasFeatures =
  | MarkdownFeature
  | A2aFeature
  | PartResolverFeature
  | RendererFeature
  | A2uiFeature;

export enum ChatCanvasFeatureKind {
  A2A_FEATURE,
  MARKDOWN_FEATURE,
  PART_RESOLVER_FEATURE,
  RENDERER_FEATURE,
  A2UI_FEATURE,
}
