import { AgentCard, SendMessageSuccessResponse } from '@a2a-js/sdk';
import { Types } from '@a2ui/lit/0.8';
import { PART_RESOLVERS } from '../a2a-renderer/tokens';
import { A2A_SERVICE } from '../interfaces/a2a-service';
import { UiAgent, UiMessage, UiMessageContent } from '../types/ui-message';
import { extractA2aPartsFromResponse, extractA2uiDataParts } from '../utils/a2a-helpers';
import { convertPartToUiMessageContent } from '../utils/ui-message-utils';
import { MessageProcessor, DispatchedEvent } from '@a2ui/angular';
import { inject, Injectable, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';

/**
 * Service responsible for managing chat interactions.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly a2aService = inject(A2A_SERVICE);
  private readonly a2uiMessageProcessor = inject(MessageProcessor);
  private readonly partResolvers = inject(PART_RESOLVERS);

  private agentCard = signal<AgentCard | null>(null);
  private readonly contextId = signal<string | undefined>(undefined);
  private abortController: AbortController | null = null;

  readonly history = signal<UiMessage[]>([]);
  readonly isA2aStreamOpen = signal(false);
  readonly a2uiSurfaces = signal(new Map<string, Types.Surface>(this.a2uiMessageProcessor.getSurfaces()));

  constructor() {
    // Fetch agent card on init
    this.a2aService.getAgentCard().then(
      (card) => this.agentCard.set(card),
      (err) => console.error('Failed to fetch agent card:', err)
    );

    this.a2uiMessageProcessor.events.subscribe(async (event: DispatchedEvent) => {
      console.log('[Orchestrator][ChatService] A2UI event received:', JSON.stringify(event.message, null, 2));
      try {
        await this.sendMessage(JSON.stringify(event.message));
        console.log('[Orchestrator][ChatService] A2UI event processed successfully');
        event.completion.next([]);
        event.completion.complete();
      } catch (err) {
        console.error('[Orchestrator][ChatService] A2UI event processing failed:', err);
        event.completion.error(err);
      }
    });
  }

  async sendMessage(text: string) {
    console.log('[Orchestrator][ChatService] sendMessage called with:', text);
    this.addUserAndPendingAgentMessages(text);
    this.isA2aStreamOpen.set(true);
    console.log('[Orchestrator][ChatService] Stream opened, sending to A2A service...');

    try {
      this.abortController = new AbortController();
      const a2aResponse = await this.a2aService.sendMessage(
        [{ kind: 'text', text }],
        this.abortController.signal
      );
      console.log('[Orchestrator][ChatService] Received A2A response:', JSON.stringify(a2aResponse, null, 2));
      this.handleSuccess(a2aResponse);
    } catch (error) {
      console.error('[Orchestrator][ChatService] Error during message send:', error);
      this.handleError(error);
    } finally {
      console.log('[Orchestrator][ChatService] Stream closed');
      this.isA2aStreamOpen.set(false);
      this.abortController = null;
    }
  }

  async cancelOngoingStream(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private addUserAndPendingAgentMessages(text: string) {
    const now = new Date().toISOString();
    const userMessage = this.createNewUserMessage(text, now);
    const agentMessage = this.createPendingAgentMessage(now);
    this.history.update((curr) => [...curr, userMessage, agentMessage]);
  }

  private handleSuccess(response: SendMessageSuccessResponse) {
    console.log('[Orchestrator][ChatService] handleSuccess - Processing response');
    const agentResponseParts = extractA2aPartsFromResponse(response);
    console.log('[Orchestrator][ChatService] Extracted A2A parts:', JSON.stringify(agentResponseParts, null, 2));
    const newContents = agentResponseParts.map(
      (part): UiMessageContent => convertPartToUiMessageContent(part, this.partResolvers)
    );
    console.log('[Orchestrator][ChatService] Converted to UI contents:', newContents.length, 'items');

    this.updateLastMessage((msg) => ({
      ...msg,
      role: this.createRole(response),
      contents: [...msg.contents, ...newContents],
      status: 'completed',
      lastUpdated: new Date().toISOString(),
    }));

    const a2uiDataParts = extractA2uiDataParts(agentResponseParts);
    console.log('[Orchestrator][ChatService] A2UI data parts to process:', JSON.stringify(a2uiDataParts, null, 2));
    this.a2uiMessageProcessor.processMessages(a2uiDataParts as any);
    this.a2uiSurfaces.set(new Map(this.a2uiMessageProcessor.getSurfaces()));
    console.log('[Orchestrator][ChatService] Message processing complete, surfaces updated');
  }

  private handleError(error: unknown) {
    let errorMessage = 'Something went wrong: ' + error;
    if (error instanceof Error && error.name === 'AbortError') {
      errorMessage = 'You cancelled the response.';
    }

    const errorContent: UiMessageContent = {
      type: 'ui_message_content',
      id: uuid(),
      data: {
        kind: 'text',
        text: errorMessage,
      },
      variant: 'text_part',
    };

    this.updateLastMessage((msg) => ({
      ...msg,
      contents: [...msg.contents, errorContent],
      status: 'completed',
      lastUpdated: new Date().toISOString(),
    }));
  }

  private updateLastMessage(updater: (msg: UiMessage) => UiMessage) {
    this.history.update((history) => {
      if (history.length === 0) return history;
      const lastMessage = history[history.length - 1];
      return [...history.slice(0, -1), updater(lastMessage)];
    });
  }

  private createNewUserMessage(text: string, nowTimestamp: string): UiMessage {
    return {
      type: 'ui_message',
      id: uuid(),
      contextId: this.contextId() ?? '',
      role: {
        type: 'ui_user',
      },
      contents: [
        {
          type: 'ui_message_content',
          id: uuid(),
          data: {
            kind: 'text',
            text,
          },
          variant: 'text_part',
        },
      ],
      status: 'pending',
      created: nowTimestamp,
      lastUpdated: nowTimestamp,
    };
  }

  private createPendingAgentMessage(nowTimestamp: string): UiMessage {
    return {
      type: 'ui_message',
      id: uuid(),
      contextId: this.contextId() ?? '',
      role: this.createRole(),
      contents: [],
      status: 'pending',
      created: nowTimestamp,
      lastUpdated: nowTimestamp,
    };
  }

  private createRole(response?: SendMessageSuccessResponse): UiAgent {
    const rootagentRole: UiAgent = {
      type: 'ui_agent',
      name: this.agentCard()?.name ?? 'Agent',
      iconUrl: this.agentCard()?.iconUrl ?? 'gemini-color.svg',
    };

    const subagentCard = response?.result?.metadata?.['a2a_subagent'];
    if (!subagentCard) {
      return rootagentRole;
    }

    const agentRole: UiAgent = {
      ...rootagentRole,
      subagentName: (subagentCard as AgentCard).name,
    };

    return agentRole;
  }
}
