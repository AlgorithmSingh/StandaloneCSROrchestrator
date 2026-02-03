import { Component, inject, signal } from '@angular/core';
import { ChatCanvas } from './chat-canvas/chat-canvas';
import { ChatService } from './chat-canvas/services/chat.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [ChatCanvas, MatButton],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly agentName = signal('Orchestrator Agent');
  private readonly chatService = inject(ChatService);

  sendMessage(text: string) {
    this.chatService.sendMessage(text);
  }
}
