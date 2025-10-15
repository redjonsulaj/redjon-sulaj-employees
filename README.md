# Employee Collaboration Analyzer

An Angular application that analyzes CSV data to identify pairs of employees who have worked together on common projects for the longest period of time.

## Project Overview

This application processes employee project assignment data and calculates collaboration periods between employee pairs. It identifies which two employees have worked together across one or multiple projects for the longest cumulative time period.

### Key Features

- **CSV File Upload**: Drag-and-drop or click-to-browse file upload functionality
- **Collaboration Analysis**: Calculates overlapping work periods for employee pairs across projects
- **Visual Results**: Displays the top collaboration pair with detailed project breakdowns
- **Data Visualization**: Shows uploaded CSV data with virtual scrolling for performance
- **Configurable Settings**: Customize file size limits, processing behavior, and display options
- **Real-time Feedback**: Toast notifications for user actions and processing status

## Business Logic

### Data Processing Algorithm

The application implements an efficient algorithm to find the longest collaboration:

1. **CSV Parsing**: Reads and validates CSV data with columns:
  - `EmpID` - Employee identifier
  - `ProjectID` - Project identifier
  - `DateFrom` - Start date of assignment
  - `DateTo` - End date of assignment (NULL means current/today)

2. **Date Handling**:
  - Supports multiple date formats (ISO, standard date strings)
  - NULL or empty `DateTo` values are treated as "present day"
  - Caches parsed dates for performance optimization

3. **Collaboration Calculation**:
  - Groups employees by project
  - For each project, identifies overlapping work periods between employee pairs
  - Calculates overlap in days: `max(start1, start2)` to `min(end1, end2)`
  - Adds 1 day to include both boundary dates in the count

4. **Aggregation**:
  - Sums total days worked together across all common projects
  - Identifies the pair with the maximum total collaboration time
  - Returns detailed breakdown by project

### Example

Given this CSV data:

```csv
EmpID,ProjectID,DateFrom,DateTo
143,12,2013-11-01,2014-01-05
218,10,2012-05-16,NULL
218,12,2013-11-01,2014-11-15
143,10,2009-01-01,2011-04-27
```

**Employee 143 and 218** worked together on:
- **Project 12**: November 1, 2013 to January 5, 2014 = **66 days**

If they also worked together on Project 10 (with overlapping dates), those days would be added to find the total collaboration period.

## Technical Architecture

### Technology Stack

- **Framework**: Angular 20.3.x with standalone components
- **UI Library**: Angular Material Design
- **CSV Parsing**: PapaParse library
- **Notifications**: ngx-sonner toast system
- **State Management**: Angular Signals
- **Styling**: SCSS with Material theming

### Performance Optimizations

- **Date Caching**: Memoizes parsed dates to avoid redundant parsing
- **Efficient Grouping**: Groups data by project before pair analysis
- **Sorted Processing**: Pre-sorts employees by start date to optimize overlap detection
- **Virtual Scrolling**: Uses CDK virtual scrolling for large datasets
- **Batch Updates**: Minimizes change detection cycles with signal batching
- **Async Processing**: Uses setTimeout for large datasets to prevent UI blocking

### Project Structure

```
src/app/
├── home/                          # Main application page
│   ├── home.component.ts          # Core business logic and state
│   ├── home.component.html        # Results display and UI
│   └── home.component.scss        # Styling
├── settings/                      # Configuration page
│   └── settings.component.ts      # User preferences
├── layout/                        # App shell with navigation
│   └── layout.component.ts        # Sidebar and routing
├── shared/
│   ├── components/
│   │   └── drag-drop-upload/      # Reusable file upload component
│   └── services/
│       ├── file-processing.service.ts  # CSV parsing and algorithm
│       ├── settings.service.ts         # User settings management
│       └── toastr.service.ts           # Notification wrapper
└── app.routes.ts                  # Application routing

test-data/                         # Test CSV files and test cases
├── basic-example.csv              # Simple test case
├── multiple-projects.csv          # Multiple project collaborations
├── null-dates.csv                 # Testing NULL date handling
├── edge-cases.csv                 # Edge cases and boundary conditions
└── README.md                      # Test data documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Development Server

To start a local development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Building

To build the project for production:

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory. The production build optimizes the application for performance and speed.

## Usage

1. **Upload CSV File**: Drag and drop a CSV file or click the upload area to browse
2. **Configure Settings** (optional): Navigate to Settings page to adjust:
  - Maximum file size limit (1-100 MB)
  - Loading spinner visibility
  - Manual vs automatic processing
  - Auto-display of CSV data
3. **View Results**: The application displays:
  - Top collaboration pair (Employee IDs and total days)
  - Breakdown by project with days worked
  - Original CSV data (if enabled)

### CSV File Format

Required columns (case-insensitive, whitespace-tolerant):
- `EmpID` - Integer employee identifier
- `ProjectID` - Integer project identifier
- `DateFrom` - Date in format YYYY-MM-DD (or other parseable formats)
- `DateTo` - Date in format YYYY-MM-DD, or NULL/empty for current date

Example:
```csv
EmpID,ProjectID,DateFrom,DateTo
143,12,2013-11-01,2014-01-05
218,10,2012-05-16,NULL
218,12,2013-11-01,2014-11-15
```

## Testing

To execute unit tests with Karma:

```bash
ng test
```

### Test Data

Test CSV files are located in the `test-data/` directory at the project root. This directory contains various test cases to validate the application's functionality:

#### Available Test Cases

1. **basic-example.csv** - Simple scenario with 2 employees on 2 projects
  - Tests basic overlap calculation
  - Expected result: Clear collaboration pair

2. **multiple-projects.csv** - Multiple employees working on several projects
  - Tests aggregation across multiple projects
  - Validates cumulative day calculation

3. **null-dates.csv** - Includes NULL values in DateTo column
  - Tests handling of ongoing projects (NULL = today)
  - Validates date parsing logic

4. **edge-cases.csv** - Boundary conditions and edge cases:
  - Single-day overlaps
  - Non-overlapping dates
  - Same start/end dates
  - Multiple NULL dates
  - Employees working alone on projects

5. **large-dataset.csv** - Performance testing with 1000+ records
  - Tests virtual scrolling
  - Validates performance optimizations

#### Creating Your Own Test Files

When creating test CSV files, ensure they follow this format:

```csv
EmpID,ProjectID,DateFrom,DateTo
143,12,2013-11-01,2014-01-05
218,10,2012-05-16,NULL
218,12,2013-11-01,2014-11-15
143,10,2009-01-01,2011-04-27
```

**Guidelines:**
- Column names are case-insensitive but should match: EmpID, ProjectID, DateFrom, DateTo
- Use ISO date format (YYYY-MM-DD) for best compatibility
- Use NULL or leave empty for DateTo to represent "present day"
- Include various scenarios: overlaps, non-overlaps, multiple projects, edge cases

See `test-data/README.md` for detailed documentation on each test case and expected results.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component:

```bash
ng generate component component-name
```

For a complete list of available schematics (components, directives, pipes):

```bash
ng generate --help
```

## Additional Resources

For more information on using the Angular CLI:
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Material Documentation](https://material.angular.io/)
- [PapaParse Documentation](https://www.papaparse.com/)

## License

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.
