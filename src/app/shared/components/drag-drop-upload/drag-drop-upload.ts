import { Component, output, input, signal } from '@angular/core';
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
  styleUrls: ['drag-drop-upload.scss']
})
export class DragDropUploadComponent {
  // Outputs
  fileUploaded = output<File>();
  fileCleared = output<void>();

  // Signals
  isDragOver = signal(false);
  uploadedFile = signal<File | null>(null);
  maxFileSizeMB = signal(10);

  constructor(
    private toastr: ToastrService,
    private settingsService: SettingsService
  ) {
    // Get max file size from settings
    this.maxFileSizeMB.set(this.settingsService.settings().maxFileSizeInMB);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
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
  }

  private handleFile(file: File): void {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.toastr.error('Please upload a CSV file', 'Invalid File Type');
      return;
    }

    // Validate file size
    const maxSizeBytes = this.maxFileSizeMB() * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.toastr.error(
        `File size exceeds ${this.maxFileSizeMB()} MB limit`,
        'File Too Large'
      );
      return;
    }

    // Validate file is not empty
    if (file.size === 0) {
      this.toastr.error('The selected file is empty', 'Invalid File');
      return;
    }

    // File is valid
    this.uploadedFile.set(file);
    this.toastr.success(`${file.name} uploaded successfully`, 'File Uploaded');
    this.fileUploaded.emit(file);
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
