// base interface for material snackbar notifications

export interface NotificationServiceInterface {
    message: string;
    action?: string;
    duration?: number;
    type: 'warn' | 'accent' | 'default'
  }
  