import {Component, computed, signal, untracked} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FileProcessingService, TopPairResult, EmployeeProject, CollaborationResult } from '../shared/services/file-processing.service';
import { SettingsService } from '../shared/services/settings.service';
import { DragDropUploadComponent } from '../shared/components/drag-drop-upload/drag-drop-upload';
import { ToastrService } from '../shared/services/toastr.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    DragDropUploadComponent,
    ScrollingModule
  ],
  templateUrl: 'home.component.html',
  styleUrl: 'home.component.scss'
})
export class HomeComponent {
  uploadedFile = signal<File | null>(null);
  isProcessing = signal(false);
  results = signal<TopPairResult | null>(null);
  csvData = signal<EmployeeProject[]>([]);
  showCsvData = signal(false);
  processedWithNoResults = signal(false);

  displayedColumns = ['empId1', 'empId2', 'projectId', 'daysWorked'];
  csvColumns = ['empId', 'projectId', 'dateFrom', 'dateTo'];

  constructor(
    private fileProcessingService: FileProcessingService,
    private settingsService: SettingsService,
    private toastr: ToastrService
  ) {}

  get settings() {
    return this.settingsService.settings;
  }

  showCsvDataNow = computed(() =>
    this.settings().autoShowCSVData &&
    this.csvData().length > 0 &&
    this.showCsvData()
  );

  onFileUploaded(file: File): void {
    this.uploadedFile.set(file);

    this.resetState();
    if (!this.settings().manualSubmit) {
      this.processFile();
    }
  }

  private resetState(): void {
    this.csvData.set([]);
    this.showCsvData.set(false);
    this.results.set(null);
    this.processedWithNoResults.set(false);
  }

  onFileCleared(): void {
    this.uploadedFile.set(null);

    this.batchUpdate({
      csvData: [],
      showCsvData: false,
      results: null,
      processedWithNoResults: false,
      isProcessing: false
    });
  }

  async processFile(): Promise<void> {
    const file = this.uploadedFile();
    if (!file) {
      this.toastr.error('No file selected', 'Error');
      return;
    }

    const shouldAutoShow = untracked(() => this.settings().autoShowCSVData);

    this.isProcessing.set(true);

    try {
      const data = await this.fileProcessingService.parseCSV(file);

      if (data.length === 0) {
        this.toastr.error('No valid data found in CSV file', 'Processing Error');
        this.isProcessing.set(false);
        return;
      }

      this.toastr.info(`Processing ${data.length} records...`, 'Processing');

      const result = await this.processDataWithProgress(data);

      this.updateResults(data, result, shouldAutoShow);

      if (result) {
        this.toastr.success(
          `Found collaboration: Employees ${result.empId1} & ${result.empId2} worked together for ${result.totalDays} days`,
          'Analysis Complete'
        );
      } else {
        this.toastr.warning('No collaboration pairs found', 'No Results');
      }

    } catch (error: any) {
      this.isProcessing.set(false);
      this.toastr.error(
        error.message || 'Failed to process CSV file',
        'Processing Error'
      );
      console.error('Error processing file:', error);
    }
  }

  private updateResults(
    data: EmployeeProject[],
    result: TopPairResult | null,
    shouldAutoShow: boolean
  ): void {
    this.csvData.set(data);
    this.showCsvData.set(shouldAutoShow);
    this.results.set(result);
    this.processedWithNoResults.set(!result);
    this.isProcessing.set(false);
  }

  private async processDataWithProgress(data: EmployeeProject[]): Promise<TopPairResult | null> {
    const ASYNC_THRESHOLD = 1000;

    if (data.length > ASYNC_THRESHOLD) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = this.fileProcessingService.findLongestCollaboration(data);
          resolve(result);
        }, 50);
      });
    }

    return this.fileProcessingService.findLongestCollaboration(data);
  }

  private batchUpdate(updates: {
    csvData?: EmployeeProject[];
    showCsvData?: boolean;
    results?: TopPairResult | null;
    processedWithNoResults?: boolean;
    isProcessing?: boolean;
  }): void {
    if (updates.csvData !== undefined) {
      this.csvData.set(updates.csvData);
    }
    if (updates.showCsvData !== undefined) {
      this.showCsvData.set(updates.showCsvData);
    }
    if (updates.results !== undefined) {
      this.results.set(updates.results);
    }
    if (updates.processedWithNoResults !== undefined) {
      this.processedWithNoResults.set(updates.processedWithNoResults);
    }
    if (updates.isProcessing !== undefined) {
      this.isProcessing.set(updates.isProcessing);
    }
  }

  toggleCsvData(): void {
    this.showCsvData.set(true);
  }

  hideCsvData(): void {
    this.showCsvData.set(false);
    this.toastr.info('CSV data hidden', 'Hidden');
  }

  formatDate(date: Date | null): string {
    if (!date) return 'NULL (Today)';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  trackByEmpId(index: number, item: EmployeeProject): string {
    return `${item.empId}-${item.projectId}-${index}`;
  }

  trackByResult(index: number, item: CollaborationResult): string {
    return `${item.empId1}-${item.empId2}-${item.projectId}`;
  }
}
