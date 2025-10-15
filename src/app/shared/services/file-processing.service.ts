import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';

export interface EmployeeProject {
  empId: number;
  projectId: number;
  dateFrom: Date;
  dateTo: Date | null;
}

export interface CollaborationResult {
  empId1: number;
  empId2: number;
  projectId: number;
  daysWorked: number;
}

export interface TopPairResult {
  empId1: number;
  empId2: number;
  totalDays: number;
  projects: CollaborationResult[];
}

@Injectable({
  providedIn: 'root'
})
export class FileProcessingService {
  // Cache for parsed dates to avoid redundant parsing
  private readonly dateCache = new Map<string, Date | null>();
  private readonly MAX_CACHE_SIZE = 1000;
  // Pre-compile regex for better performance
  private readonly isoDateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

  // Constants for magic numbers
  private readonly MS_PER_DAY = 86400000;

  parseCSV(file: File): Promise<EmployeeProject[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        worker: false, // Consider setting to true for large files
        complete: (results: ParseResult<any>) => {
          try {
            const data = this.processCSVData(results.data);
            // Clear cache after parsing to free memory
            this.clearDateCache();
            resolve(data);
          } catch (error) {
            this.clearDateCache();
            reject(error);
          }
        },
        error: (error) => {
          this.clearDateCache();
          reject(error);
        }
      });
    });
  }

  private processCSVData(data: any[]): EmployeeProject[] {
    if (data.length === 0) return [];

    const processed: EmployeeProject[] = [];
    const today = new Date();

    // Build column mapping once
    const columnMapping = this.buildColumnMapping(data[0]);

    // Pre-allocate array size for better performance
    processed.length = 0;

    for (const row of data) {
      const empProject = this.parseEmployeeProject(row, columnMapping, today);
      if (empProject) {
        processed.push(empProject);
      }
    }

    return processed;
  }

  // Separate column mapping into its own method
  private buildColumnMapping(firstRow: any): Map<string, string> {
    const mapping = new Map<string, string>();

    for (const key in firstRow) {
      if (firstRow.hasOwnProperty(key)) {
        const normalized = key.trim().toLowerCase();
        mapping.set(key, normalized);
      }
    }

    return mapping;
  }

  // Extract employee project parsing logic
  private parseEmployeeProject(
    row: any,
    columnMapping: Map<string, string>,
    today: Date
  ): EmployeeProject | null {
    const normalizedRow = this.normalizeRow(row, columnMapping);

    const empId = this.parseNumber(normalizedRow['empid']);
    const projectId = this.parseNumber(normalizedRow['projectid']);
    const dateFrom = this.parseDate(normalizedRow['datefrom']);
    const dateTo = this.parseDate(normalizedRow['dateto']) || today;

    // Use explicit null checks
    if (empId === null || projectId === null || dateFrom === null) {
      return null;
    }

    return { empId, projectId, dateFrom, dateTo };
  }

  // Separate row normalization
  private normalizeRow(row: any, columnMapping: Map<string, string>): any {
    const normalizedRow: any = {};

    for (const [originalKey, normalizedKey] of columnMapping) {
      normalizedRow[normalizedKey] = row[originalKey];
    }

    return normalizedRow;
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;

    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private parseDate(value: any): Date | null {
    if (!value || value.toString().trim().toUpperCase() === 'NULL') {
      return null;
    }

    const trimmed = value.toString().trim();

    // Check cache first
    if (this.dateCache.has(trimmed)) {
      return this.dateCache.get(trimmed)!;
    }

    let parsedDate: Date | null = null;

    // Use pre-compiled regex
    const isoMatch = this.isoDateRegex.exec(trimmed);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      parsedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    } else {
      // Fallback to general date parsing
      const date = new Date(trimmed);
      parsedDate = isNaN(date.getTime()) ? null : date;
    }

    // Cache with size limit to prevent memory issues
    if (this.dateCache.size < this.MAX_CACHE_SIZE) {
      this.dateCache.set(trimmed, parsedDate);
    }

    return parsedDate;
  }

  private clearDateCache(): void {
    this.dateCache.clear();
  }

  findLongestCollaboration(data: EmployeeProject[]): TopPairResult | null {
    if (data.length < 2) return null;

    // Use efficient grouping
    const projectGroups = this.groupByProject(data);

    // Find collaborations with optimized algorithm
    const pairCollaborations = this.findPairCollaborations(projectGroups);

    // Clear maps to free memory
    projectGroups.clear();

    if (pairCollaborations.size === 0) {
      return null;
    }

    const topPair = this.findTopPair(pairCollaborations);

    // Clear after use
    pairCollaborations.clear();

    return topPair;
  }

  // Extract grouping logic
  private groupByProject(data: EmployeeProject[]): Map<number, EmployeeProject[]> {
    const groups = new Map<number, EmployeeProject[]>();

    for (const record of data) {
      const group = groups.get(record.projectId);
      if (group) {
        group.push(record);
      } else {
        groups.set(record.projectId, [record]);
      }
    }

    return groups;
  }

  // Extract collaboration finding logic
  private findPairCollaborations(
    projectGroups: Map<number, EmployeeProject[]>
  ): Map<string, CollaborationResult[]> {
    const pairCollaborations = new Map<string, CollaborationResult[]>();
    const today = Date.now();

    for (const [projectId, employees] of projectGroups) {
      if (employees.length < 2) continue;

      employees.sort((a, b) => a.dateFrom.getTime() - b.dateFrom.getTime());

      this.processPairsForProject(employees, projectId, today, pairCollaborations);
    }

    return pairCollaborations;
  }

  // Extract pair processing for single project
  private processPairsForProject(
    employees: EmployeeProject[],
    projectId: number,
    today: number,
    pairCollaborations: Map<string, CollaborationResult[]>
  ): void {
    for (let i = 0; i < employees.length - 1; i++) {
      const emp1 = employees[i];
      const emp1End = emp1.dateTo ? emp1.dateTo.getTime() : today;

      for (let j = i + 1; j < employees.length; j++) {
        const emp2 = employees[j];
        const emp2Start = emp2.dateFrom.getTime();

        if (emp2Start > emp1End) break;

        const overlap = this.calculateOverlap(emp1, emp2, today);

        if (overlap > 0) {
          this.addCollaboration(emp1, emp2, projectId, overlap, pairCollaborations);
        }
      }
    }
  }

  private addCollaboration(
    emp1: EmployeeProject,
    emp2: EmployeeProject,
    projectId: number,
    daysWorked: number,
    pairCollaborations: Map<string, CollaborationResult[]>
  ): void {
    const pairKey = this.getPairKey(emp1.empId, emp2.empId);
    const collaboration: CollaborationResult = {
      empId1: Math.min(emp1.empId, emp2.empId),
      empId2: Math.max(emp1.empId, emp2.empId),
      projectId,
      daysWorked
    };

    const existing = pairCollaborations.get(pairKey);
    if (existing) {
      existing.push(collaboration);
    } else {
      pairCollaborations.set(pairKey, [collaboration]);
    }
  }

  private calculateOverlap(
    emp1: EmployeeProject,
    emp2: EmployeeProject,
    today: number
  ): number {
    const start1 = emp1.dateFrom.getTime();
    const end1 = emp1.dateTo ? emp1.dateTo.getTime() : today;
    const start2 = emp2.dateFrom.getTime();
    const end2 = emp2.dateTo ? emp2.dateTo.getTime() : today;

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    if (overlapStart >= overlapEnd) return 0;

    return Math.ceil((overlapEnd - overlapStart) / this.MS_PER_DAY) + 1;
  }

  private findTopPair(
    pairCollaborations: Map<string, CollaborationResult[]>
  ): TopPairResult | null {
    let maxTotalDays = 0;
    let topPair: TopPairResult | null = null;

    for (const [pairKey, projects] of pairCollaborations) {
      let totalDays = 0;
      for (const project of projects) {
        totalDays += project.daysWorked;
      }

      if (totalDays > maxTotalDays) {
        maxTotalDays = totalDays;
        const [empId1, empId2] = pairKey.split('-').map(n => parseInt(n, 10));
        topPair = {
          empId1,
          empId2,
          totalDays,
          projects
        };
      }
    }

    return topPair;
  }

  private getPairKey(empId1: number, empId2: number): string {
    return empId1 < empId2 ? `${empId1}-${empId2}` : `${empId2}-${empId1}`;
  }
}
