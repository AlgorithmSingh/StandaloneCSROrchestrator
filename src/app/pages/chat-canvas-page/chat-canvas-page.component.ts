import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatCanvas } from '../../chat-canvas/chat-canvas';
import { ChatService } from '../../chat-canvas/services/chat.service';

@Component({
  selector: 'app-chat-canvas-page',
  standalone: true,
  imports: [CommonModule, ChatCanvas, MatButtonModule, MatIconModule],
  templateUrl: './chat-canvas-page.component.html',
  styleUrl: './chat-canvas-page.component.scss',
})
export class ChatCanvasPageComponent {
  protected readonly agentName = signal('Orchestrator Agent');
  private readonly chatService = inject(ChatService);

  sendMessage(text: string) {
    this.chatService.sendMessage(text);
  }
}
