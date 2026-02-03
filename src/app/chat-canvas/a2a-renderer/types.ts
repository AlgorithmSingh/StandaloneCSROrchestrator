import { Artifact, Part } from '@a2a-js/sdk';
import { UiMessageContent } from '../types/ui-message';
import { InputSignal, Type } from '@angular/core';

/**
 * Interface for a component that renders content.
 */
export interface RendererComponent {
  readonly uiMessageContent: InputSignal<UiMessageContent>;
}

/**
 * Type for a function that dynamically loads a RendererComponent class.
 */
export type RendererComponentClassLoader = () => Promise<Type<RendererComponent>>;

/**
 * Represents an entry in the renderer map.
 */
export type RendererEntry = [
  variantName: string,
  componentClassLoader: RendererComponentClassLoader
];

/**
 * Type definition for a function that resolves a content variant for a Part.
 */
export type PartResolver = (part: Part) => string | null;

/**
 * Unresolved variant for a Part.
 */
export const UNRESOLVED_PART_VARIANT = 'unresolved_part';

/**
 * Type definition for a function that resolves a content variant for an Artifact.
 */
export type ArtifactResolver = (artifact: Artifact) => string | null;

/**
 * Unresolved variant for an Artifact.
 */
export const UNRESOLVED_ARTIFACT_VARIANT = 'unresolved_artifact';
