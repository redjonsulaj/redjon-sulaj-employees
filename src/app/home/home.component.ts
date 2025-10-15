import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Welcome Home</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>This is the home page of your Angular v20 application.</p>
        <p>Navigate using the sidebar to explore different sections.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 600px;
      margin: 20px 0;
    }
  `]
})
export class HomeComponent {}
