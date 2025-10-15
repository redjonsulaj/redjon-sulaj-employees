import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  success(message: string, title?: string): void {
    const displayMessage = title ? `${title}: ${message}` : message;
    toast.success(displayMessage, {
      duration: 3000,
    });
  }

  error(message: string, title?: string): void {
    const displayMessage = title ? `${title}: ${message}` : message;
    toast.error(displayMessage, {
      duration: 5000,
    });
  }

  warning(message: string, title?: string): void {
    const displayMessage = title ? `${title}: ${message}` : message;
    toast.warning(displayMessage, {
      duration: 3000,
    });
  }

  info(message: string, title?: string): void {
    const displayMessage = title ? `${title}: ${message}` : message;
    toast.info(displayMessage, {
      duration: 3000,
    });
  }
}
