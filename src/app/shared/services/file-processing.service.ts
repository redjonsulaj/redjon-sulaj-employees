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

  parseCSV(file: File): Promise<EmployeeProject[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        worker: false,
        complete: (results: ParseResult<any>) => {
          try {
            const data = this.processCSVData(results.data);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private processCSVData(data: any[]): EmployeeProject[] {
    const processed: EmployeeProject[] = [];
    const today = new Date();

    if (data.length === 0) return [];

    const firstRow = data[0];
    const columnMapping = new Map<string, string>();

    for (const key in firstRow) {
      const normalized = key.trim().toLowerCase();
      columnMapping.set(key, normalized);
    }

    for (const row of data) {
      const normalizedRow: any = {};

      for (const [originalKey, normalizedKey] of columnMapping) {
        normalizedRow[normalizedKey] = row[originalKey];
      }

      const empId = this.parseNumber(normalizedRow['empid']);
      const projectId = this.parseNumber(normalizedRow['projectid']);
      const dateFrom = this.parseDate(normalizedRow['datefrom']);
      const dateTo = this.parseDate(normalizedRow['dateto']) || today;

      if (empId !== null && projectId !== null && dateFrom !== null) {
        processed.push({
          empId,
          projectId,
          dateFrom,
          dateTo
        });
      }
    }

    return processed;
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private parseDate(value: any): Date | null {
    if (!value || value.toString().trim().toUpperCase() === 'NULL') return null;

    const trimmed = value.toString().trim();

    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  findLongestCollaboration(data: EmployeeProject[]): TopPairResult | null {
    if (data.length < 2) return null;

    const projectGroups = new Map<number, EmployeeProject[]>();
    for (const record of data) {
      if (!projectGroups.has(record.projectId)) {
        projectGroups.set(record.projectId, []);
      }
      projectGroups.get(record.projectId)!.push(record);
    }

    const pairCollaborations = new Map<string, CollaborationResult[]>();

    for (const [projectId, employees] of projectGroups) {
      if (employees.length < 2) continue;

      employees.sort((a, b) => a.dateFrom.getTime() - b.dateFrom.getTime());

      for (let i = 0; i < employees.length; i++) {
        const emp1 = employees[i];
        const emp1End = (emp1.dateTo || new Date()).getTime();

        for (let j = i + 1; j < employees.length; j++) {
          const emp2 = employees[j];
          const emp2Start = emp2.dateFrom.getTime();

          if (emp2Start > emp1End) {
            break;
          }

          const overlap = this.calculateOverlapFast(emp1, emp2);
          if (overlap > 0) {
            const pairKey = this.getPairKey(emp1.empId, emp2.empId);

            if (!pairCollaborations.has(pairKey)) {
              pairCollaborations.set(pairKey, []);
            }

            pairCollaborations.get(pairKey)!.push({
              empId1: Math.min(emp1.empId, emp2.empId),
              empId2: Math.max(emp1.empId, emp2.empId),
              projectId,
              daysWorked: overlap
            });
          }
        }
      }
    }

    if (pairCollaborations.size === 0) return null;

    let maxTotalDays = 0;
    let topPair: TopPairResult | null = null;

    for (const [pairKey, projects] of pairCollaborations) {
      const totalDays = projects.reduce((sum, p) => sum + p.daysWorked, 0);

      if (totalDays > maxTotalDays) {
        maxTotalDays = totalDays;
        const [empId1, empId2] = pairKey.split('-').map(Number);
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

  private calculateOverlapFast(emp1: EmployeeProject, emp2: EmployeeProject): number {
    const today = Date.now();

    const start1 = emp1.dateFrom.getTime();
    const end1 = emp1.dateTo ? emp1.dateTo.getTime() : today;
    const start2 = emp2.dateFrom.getTime();
    const end2 = emp2.dateTo ? emp2.dateTo.getTime() : today;

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    if (overlapStart >= overlapEnd) {
      return 0;
    }

    const days = Math.ceil((overlapEnd - overlapStart) / 86400000) + 1;
    return days;
  }

  private getPairKey(empId1: number, empId2: number): string {
    const min = Math.min(empId1, empId2);
    const max = Math.max(empId1, empId2);
    return `${min}-${max}`;
  }
}
