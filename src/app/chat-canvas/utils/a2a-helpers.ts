import { Artifact, Message, Part, SendMessageSuccessResponse, Task } from '@a2a-js/sdk';
import { isA2aDataPart } from './type-guards';

const ADK_A2A_THOUGHT_KEY = 'adk_thought';

// Define the ServerToClientMessage type locally since it's not exported from @a2ui/angular
export type ServerToClientMessage = {
  beginRendering?: unknown;
  surfaceUpdate?: unknown;
  dataModelUpdate?: unknown;
  deleteSurface?: unknown;
};

// Define BeginRenderingMessage type locally
export interface BeginRenderingMessage {
  surfaceId: string;
  rootComponentId?: string;
  styles?: unknown;
}

/**
 * Returns true if the part is an agent thought.
 */
export function isAgentThought(part: Part): boolean {
  return part.metadata?.[ADK_A2A_THOUGHT_KEY] === 'true';
}

/**
 * Extracts all A2A Parts from a SendMessageSuccessResponse.
 */
export function extractA2aPartsFromResponse(response: SendMessageSuccessResponse): Part[] {
  if (response.result.kind === 'task') {
    const task: Task = response.result;
    return [
      ...(task.status.message?.parts ?? []),
      ...(task.artifacts ?? []).flatMap((artifact: Artifact) => artifact.parts),
    ];
  } else {
    const message: Message = response.result;
    return message.parts;
  }
}

/**
 * Extracts A2UI ServerToClientMessages from an array of A2A Parts.
 */
export function extractA2uiDataParts(parts: Part[]): ServerToClientMessage[] {
  return parts.reduce<ServerToClientMessage[]>((messages, part) => {
    if (isA2aDataPart(part)) {
      if (part.data && typeof part.data === 'object') {
        if ('beginRendering' in part.data) {
          messages.push({
            beginRendering: part.data['beginRendering'],
          });
        } else if ('surfaceUpdate' in part.data) {
          messages.push({
            surfaceUpdate: part.data['surfaceUpdate'],
          });
        } else if ('dataModelUpdate' in part.data) {
          messages.push({
            dataModelUpdate: part.data['dataModelUpdate'],
          });
        } else if ('deleteSurface' in part.data) {
          messages.push({
            deleteSurface: part.data['deleteSurface'],
          });
        }
      }
    }
    return messages;
  }, []);
}
