import { AgentCard, Part, SendMessageSuccessResponse } from '@a2a-js/sdk';
import { InjectionToken } from '@angular/core';

/**
 * Interface for the A2A (Agent-to-Agent) service.
 */
export interface A2aService {
  sendMessage(parts: Part[], signal?: AbortSignal): Promise<SendMessageSuccessResponse>;
  getAgentCard(): Promise<AgentCard>;
}

/**
 * Injection token for the A2aService interface.
 */
export const A2A_SERVICE = new InjectionToken<A2aService>('A2aService');
