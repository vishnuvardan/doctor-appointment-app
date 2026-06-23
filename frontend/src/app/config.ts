import { environment } from '../environments/environment';

// Maps the API base URL directly to Angular's active environment configuration
export const API_BASE_URL = environment.apiUrl;

// Weekly clinic holidays (fully disabled for bookings)
export const CLINIC_WEEKLY_HOLIDAYS: string[] = ['wednesday', 'sunday'];

