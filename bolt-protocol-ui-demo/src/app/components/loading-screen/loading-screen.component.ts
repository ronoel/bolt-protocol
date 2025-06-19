import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-screen">
      <img src="/assets/images/bolt-icon.png" alt="BitFund (BTF)" class="logo">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Carregando BitFund...</p>
    </div>
  `,
  styles: [`
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #0a0e17;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      z-index: 9999;
    }

    .logo {
      width: 80px;
      height: 80px;
      animation: pulse 2s infinite;
    }

    p {
      color: #8f9bb3;
      font-size: 1rem;
      margin: 0;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `]
})
export class LoadingScreenComponent {}
