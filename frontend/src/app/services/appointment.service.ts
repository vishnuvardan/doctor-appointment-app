import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../config';

export interface AppointmentRecord {
  _id?: string;
  patientName: string;
  mobileNumber: string;
  date: string;
  slot: 'morning' | 'evening';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  async getAppointments(date?: string): Promise<AppointmentRecord[]> {
    try {
      const url = date ? `${API_BASE_URL}/api/appointments?date=${date}` : `${API_BASE_URL}/api/appointments`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch appointments, status:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async createAppointment(appointment: AppointmentRecord): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointment)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to schedule appointment.' };
      }
    } catch (error) {
      console.error('Create appointment error:', error);
      return { success: false, error: 'Could not connect to database server.' };
    }
  }
}
