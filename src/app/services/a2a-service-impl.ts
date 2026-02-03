import { A2AClient } from '@a2a-js/sdk/client';
import { AgentCard, MessageSendParams, Part, SendMessageSuccessResponse } from '@a2a-js/sdk';
import { A2aService } from '../chat-canvas/interfaces/a2a-service';
import { Injectable } from '@angular/core';

const AGENT_CARD_URL = 'http://localhost:10002/.well-known/agent-card.json';
const A2UI_EXTENSION = 'https://a2ui.org/a2a-extension/a2ui/v0.8';

/**
 * Custom fetch that adds A2UI extension headers.
 */
function fetchWithA2UIHeader(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('X-A2A-Extensions', A2UI_EXTENSION);
  console.log('[Orchestrator][A2aService] Fetch request to:', url.toString());
  console.log('[Orchestrator][A2aService] Request headers:', Object.fromEntries(headers.entries()));
  if (init?.body) {
    console.log('[Orchestrator][A2aService] Request body:', init.body);
  }
  return fetch(url, { ...init, headers });
}

@Injectable({
  providedIn: 'root',
})
export class A2aServiceImpl implements A2aService {
  private clientPromise: Promise<A2AClient> | null = null;
  private agentCard: AgentCard | null = null;

  private async getClient(): Promise<A2AClient> {
    if (!this.clientPromise) {
      this.clientPromise = A2AClient.fromCardUrl(AGENT_CARD_URL, {
        fetchImpl: fetchWithA2UIHeader,
      });
    }
    return this.clientPromise;
  }

  async sendMessage(parts: Part[], _signal?: AbortSignal): Promise<SendMessageSuccessResponse> {
    console.log('[Orchestrator][A2aService] sendMessage called with parts:', JSON.stringify(parts, null, 2));
    const client = await this.getClient();
    console.log('[Orchestrator][A2aService] A2A client ready');

    const params: MessageSendParams = {
      message: {
        messageId: crypto.randomUUID(),
        role: 'user',
        parts,
        kind: 'message',
        metadata: {
          a2uiClientCapabilities: {
            supportedCatalogIds: [
              'https://a2ui.org/specification/v0_8/standard_catalog_definition.json',
            ],
          },
        },
      },
    };
    console.log('[Orchestrator][A2aService] Sending message with params:', JSON.stringify(params, null, 2));

    const response = await client.sendMessage(params);
    console.log('[Orchestrator][A2aService] Raw response received:', JSON.stringify(response, null, 2));

    if ('error' in response) {
      console.error('[Orchestrator][A2aService] Error in response:', (response as { error: { message: string } }).error.message);
      throw new Error((response as { error: { message: string } }).error.message);
    }

    console.log('[Orchestrator][A2aService] Message sent successfully');
    return response as SendMessageSuccessResponse;
  }

  async getAgentCard(): Promise<AgentCard> {
    console.log('[Orchestrator][A2aService] getAgentCard called');
    if (this.agentCard) {
      console.log('[Orchestrator][A2aService] Returning cached agent card');
      return this.agentCard;
    }

    console.log('[Orchestrator][A2aService] Fetching agent card from:', AGENT_CARD_URL);
    const response = await fetchWithA2UIHeader(AGENT_CARD_URL);
    if (!response.ok) {
      console.error('[Orchestrator][A2aService] Failed to fetch agent card, status:', response.status);
      throw new Error('Failed to fetch agent card');
    }

    this.agentCard = (await response.json()) as AgentCard;
    console.log('[Orchestrator][A2aService] Agent card fetched:', JSON.stringify(this.agentCard, null, 2));
    return this.agentCard;
  }
}
