import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <h2>Confirm Operation</h2>
      <div class="dialog-content">
        <p>{{ data.message }}</p>
      </div>
      <div class="dialog-actions">
        <button class="btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
        <button class="btn-primary" (click)="dialogRef.close(true)">Confirm</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      background-color: #151b27;
      color: #e4e4e4;
      padding: 1.5rem;
      border-radius: 12px;
      min-width: 320px;
    }

    h2 {
      margin: 0 0 1.5rem;
      color: var(--primary);
      font-size: 1.5rem;
      font-weight: bold;
    }

    .dialog-content {
      margin-bottom: 1.5rem;
      
      p {
        margin: 0;
        color: #8f9bb3;
        line-height: 1.5;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;

      button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-primary {
        background-color: var(--primary);
        color: #0a0e17;

        &:hover:not(:disabled) {
          background-color: #E58319;
        }
      }

      .btn-secondary {
        background-color: #2a2f3a;
        color: #e4e4e4;

        &:hover:not(:disabled) {
          background-color: #353e4d;
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}
}
