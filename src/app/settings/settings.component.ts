import { Component, signal, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../shared/services/settings.service';
import {ToastrService} from '../shared/services/toastr.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Application Settings</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="settings-form">

          <!-- File Upload Settings -->
          <h3 class="section-title">File Upload Settings</h3>

          <mat-form-field appearance="outline">
            <mat-label>Maximum File Size (MB)</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="localSettings.maxFileSizeInMB"
              min="1"
              max="100"
              (change)="onSettingsChange()"
            >
          </mat-form-field>

          <!-- Processing Settings -->
          <h3 class="section-title">Processing Settings</h3>

          <mat-slide-toggle
            [(ngModel)]="localSettings.showLoadingSpinner"
            (change)="onSettingsChange()"
          >
            Show Loading Spinner
          </mat-slide-toggle>
          <p class="setting-description">Display a loading spinner while processing large CSV files</p>

          <mat-slide-toggle
            [(ngModel)]="localSettings.manualSubmit"
            (change)="onSettingsChange()"
          >
            Manual Submit Mode
          </mat-slide-toggle>
          <p class="setting-description">Require manual confirmation before processing uploaded files (better security)</p>

          <!-- CSV Display Settings -->
          <h3 class="section-title">CSV Data Display Settings</h3>

          <mat-slide-toggle
            [(ngModel)]="localSettings.autoShowCSVData"
            (change)="onSettingsChange()"
          >
            Auto Show CSV Data
          </mat-slide-toggle>
          <p class="setting-description">Automatically display CSV Data after processing completes</p>

          <!-- Action Buttons -->
          <div class="button-group">
            <button
              mat-raised-button
              color="primary"
              (click)="saveSettings()"
            >
              Save Settings
            </button>

            <button
              mat-raised-button
              color="warn"
              (click)="resetSettings()"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px 0;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      margin: 24px 0 12px 0;
      color: #3f51b5;
      font-size: 18px;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }

    mat-form-field {
      width: 100%;
    }

    mat-slide-toggle {
      margin: 8px 0;
    }

    .setting-description {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #666;
      padding-left: 8px;
    }

    .button-group {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class SettingsComponent {
  localSettings: AppSettings;

  constructor(
    private settingsService: SettingsService,
    private toastr: ToastrService
  ) {
    // Initialize with current settings
    this.localSettings = { ...this.settingsService.settings() };
  }

  onSettingsChange(): void {
    // Auto-save on change (optional - you can remove this if you want manual save only)
    this.saveSettings();
  }

  saveSettings(): void {
    // Validate settings
    if (this.localSettings.maxFileSizeInMB < 1 || this.localSettings.maxFileSizeInMB > 100) {
      this.toastr.error('File size must be between 1 and 100 MB', 'Invalid Setting');
      return;
    }

    this.settingsService.updateSettings(this.localSettings);
    this.toastr.success('Settings saved successfully', 'Settings Saved');
  }

  resetSettings(): void {
    this.settingsService.resetSettings();
    this.localSettings = { ...this.settingsService.settings() };
    this.toastr.info('Settings reset to defaults', 'Settings Reset');
  }
}
