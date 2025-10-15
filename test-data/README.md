# Test Data Documentation

This directory contains CSV test files for validating the Employee Collaboration Analyzer application.

## Test Files Overview

### 1. basic-example.csv
**Purpose:** Simple scenario to verify basic functionality

**Data:**
- 4 records
- 2 employees (143, 218)
- 2 projects (10, 12)
- Mix of completed and ongoing projects (NULL dates)

**Expected Result:**
- **Top Pair:** Employees 143 & 218
- **Total Days:** 66 days
- **Common Projects:** Project 12 only
  - Overlap: November 1, 2013 to January 5, 2014 = 66 days

**What It Tests:**
- Basic overlap calculation
- NULL date handling (DateTo = today)
- Simple pair identification

---

### 2. multiple-projects.csv
**Purpose:** Complex scenario with multiple employees working across several projects

**Data:**
- 13 records
- 5 employees (101, 102, 103, 104, 105)
- 5 projects (1, 2, 3, 4, 5)
- Various overlap patterns

**Expected Result:**
- **Top Pair:** Employees 101 & 105
- **Total Days:** ~1,628+ days (varies by current date for NULL values)
- **Common Projects:** Project 5 only
  - Project 5: May 1, 2021 - Present (ongoing)
  - As of October 2025: approximately 1,628 days

**Note:** While employees 101 & 102 worked together on 3 projects (1, 2, 3) totaling 454 days, employees 101 & 105 have been working together continuously on Project 5 since May 2021, accumulating significantly more days due to the ongoing nature of their collaboration

**What It Tests:**
- Aggregation across multiple projects
- Multiple employee pairs
- Cumulative day calculation
- Complex overlap scenarios

---

### 3. null-dates.csv
**Purpose:** Validate NULL date handling and ongoing projects

**Data:**
- 10 records
- 5 employees (201, 202, 203, 204, 205)
- 4 projects (100, 200, 300, 400)
- Heavy use of NULL (ongoing) projects

**Expected Result:**
- **Top Pair:** Employees 201 & 202
- **Total Days:** 1000+ days (varies significantly by current date)
- **Common Projects:** Projects 100, 200, and 400
  - Project 100: Mar 1 - Jun 30, 2023 = 122 days
  - Project 200: Aug 1, 2023 - Present = ongoing
  - Project 400: Jan 1, 2024 - Present = ongoing

**What It Tests:**
- NULL date interpretation (treated as "today")
- Long-running ongoing projects
- Date comparison with current date
- Multiple NULL dates in same project

---

### 4. edge-cases.csv
**Purpose:** Boundary conditions and edge cases

**Data:**
- 20 records
- 18 employees (301-318)
- 13 projects (1-13)
- Various edge scenarios

**Test Scenarios:**
1. **Same-day overlap** (Project 1): Employees 301 & 302 work same single day
2. **No overlap** (Project 2): Employees 303 & 304 work consecutive, non-overlapping periods
3. **Exact same period** (Project 3): Employees 305 & 306 have identical dates
4. **Single employee** (Projects 5, 8, 9, 12, 13): Only one employee per project
5. **Partial overlap** (Project 7): 6-day overlap between employees 311 & 312
6. **Adjacent start dates** (Project 10): Employees 314 & 315 start/end on consecutive days
7. **Different start dates on ongoing** (Project 11): Both NULL but different starts
8. **Minimal overlap** (Project 11): Employees 316 & 317 with 15-day offset start

**Expected Result:**
- **Top Pair:** Employees 309 & 310 OR 316 & 317 (depending on current date)
- Tests various edge cases for robustness

**What It Tests:**
- Single-day overlaps (boundary case)
- Non-overlapping consecutive dates
- Identical date ranges
- Solo employee projects (should not create pairs)
- Partial overlaps of varying lengths
- NULL date variations

---

### 5. large-dataset.csv
**Purpose:** Performance and scalability testing

**Data:**
- 90 records
- 85 employees (1001-1085)
- 20 projects (1-20)
- Realistic distribution of work assignments

**Expected Result:**
- **Top Pair:** Employees 1021 & 1022 (or 1041 & 1042, or 1081 & 1082 - all tied)
- **Total Days:** ~1537-1538 days (varies slightly by calculation method)
- **Common Projects:** Project 6 (for 1021 & 1022)
  - Project 6: Aug 1, 2021 - Present (ongoing)
  - As of October 2025: approximately 1537 days

**Note:** There are three pairs tied with the same maximum days:
- Employees 1021 & 1022 on Project 6
- Employees 1041 & 1042 on Project 10
- Employees 1081 & 1082 on Project 20

The application returns the first pair found (typically 1021 & 1022)

**What It Tests:**
- Performance with larger datasets
- Virtual scrolling functionality
- Memory efficiency
- Algorithm speed with multiple comparisons
- UI responsiveness during processing

---

## Using Test Files

### Quick Test
Upload any test file through the application's drag-and-drop interface or file browser.

### Manual Validation
1. Upload the test file
2. Compare results with expected results above
3. Verify the project breakdown matches expectations
4. Check CSV data display for accuracy

### Automated Testing
These files can be integrated into unit tests by:
```typescript
const testFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
const result = await fileProcessingService.parseCSV(testFile);
```

## Creating Custom Test Files

When creating additional test files, follow this format:

```csv
EmpID,ProjectID,DateFrom,DateTo
101,1,2020-01-01,2020-12-31
102,1,2020-06-01,NULL
```

**Guidelines:**
- Use consistent date format: YYYY-MM-DD
- Use NULL for ongoing projects (DateTo)
- Include varied scenarios: overlaps, gaps, multiple projects
- Test both simple and complex cases
- Document expected results

## Common Test Scenarios

✅ **Basic Overlap:** Two employees, one project, clear overlap
✅ **Multiple Projects:** Same pair across different projects
✅ **NULL Dates:** Ongoing projects with no end date
✅ **No Overlap:** Consecutive but non-overlapping periods
✅ **Single Day:** Minimum overlap (1 day)
✅ **Exact Match:** Identical start and end dates
✅ **Solo Projects:** One employee per project (no pairs)
✅ **Large Scale:** Many employees and projects

## Troubleshooting

**Issue:** Results don't match expected values for NULL dates
- **Cause:** NULL dates use current date, which changes daily
- **Solution:** Expected totals for NULL dates are approximate

**Issue:** No results found
- **Check:** Ensure employees actually overlap on same projects
- **Check:** Verify date formats are correct (YYYY-MM-DD)

**Issue:** Performance slow with large files
- **Expected:** Files with 100+ records may show loading spinner
- **Solution:** This is normal; async processing handles it

## Notes

- All dates assume UTC/local timezone
- NULL dates are interpreted as "today" at processing time
- Overlap calculation is inclusive (includes both start and end dates)
- Results may vary slightly for files with NULL dates based on current date
