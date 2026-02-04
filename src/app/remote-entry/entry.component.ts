import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [CommonModule, RouterOutlet],
  selector: 'orchestrator-remote-entry',
  template: '<router-outlet></router-outlet>',
})
export class RemoteEntryComponent {}
