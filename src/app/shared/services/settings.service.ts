import { Injectable, signal } from '@angular/core';

export interface AppSettings {
  // File Upload
  maxFileSizeInMB: number;
  // Processing
  showLoadingSpinner: boolean;
  manualSubmit: boolean;
  // Results Display
  autoShowResults: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  maxFileSizeInMB: 10,
  showLoadingSpinner: true,
  manualSubmit: false,
  autoShowResults: true,
};

const STORAGE_KEY = 'app_settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSignal = signal<AppSettings>(this.loadSettings());

  get settings() {
    return this.settingsSignal.asReadonly();
  }

  constructor() {
    // Load settings from localStorage on init
    this.settingsSignal.set(this.loadSettings());
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const current = this.settingsSignal();
    const updated = { ...current, ...settings };
    this.settingsSignal.set(updated);
    this.saveSettings(updated);
  }

  resetSettings(): void {
    this.settingsSignal.set(DEFAULT_SETTINGS);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }
}
