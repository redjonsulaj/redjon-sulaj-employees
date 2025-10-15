import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Settings</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="settings-form">
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput placeholder="Enter username">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" placeholder="Enter email">
          </mat-form-field>

          <mat-slide-toggle>Enable notifications</mat-slide-toggle>
          <mat-slide-toggle>Dark mode</mat-slide-toggle>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 600px;
      margin: 20px 0;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class SettingsComponent {}
