import { Component, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-drag-drop-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: 'drag-drop-upload.html',
  styleUrls: ['drag-drop-upload.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DragDropUploadComponent {
  // Outputs
  fileUploaded = output<File>();
  fileCleared = output<void>();

  // Signals
  isDragOver = signal(false);
  uploadedFile = signal<File | null>(null);
  maxFileSizeMB = computed(() => this.settingsService.settings().maxFileSizeInMB);
  private maxSizeBytes = computed(() => this.maxFileSizeMB() * 1024 * 1024);

  constructor(
    private toastr: ToastrService,
    private settingsService: SettingsService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDragOver()) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDragOver()) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    input.value = '';
  }

  private handleFile(file: File): void {
    const validationError = this.validateFile(file);
    if (validationError) {
      this.toastr.error(validationError.message, validationError.title);
      return;
    }

    // File is valid
    this.uploadedFile.set(file);
    this.toastr.success(`${file.name} uploaded successfully`, 'File Uploaded');
    this.fileUploaded.emit(file);
  }

  private validateFile(file: File): { message: string; title: string } | null {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { message: 'Please upload a CSV file', title: 'Invalid File Type' };
    }

    if (file.size === 0) {
      return { message: 'The selected file is empty', title: 'Invalid File' };
    }

    if (file.size > this.maxSizeBytes()) {
      return {
        message: `File size exceeds ${this.maxFileSizeMB()} MB limit`,
        title: 'File Too Large'
      };
    }

    return null;
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.uploadedFile.set(null);
    this.fileCleared.emit();
    this.toastr.info('File cleared', 'Cleared');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}
