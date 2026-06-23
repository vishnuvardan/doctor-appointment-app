import { Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../config';

export interface DoctorPtoRecord {
  _id?: string;
  doctorName: string;
  date: string;
  slot: 'morning' | 'evening';
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PtoService {
  private _ptoList = signal<DoctorPtoRecord[]>([]);
  readonly ptoList = this._ptoList.asReadonly();
  
  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  async fetchPtoList() {
    this._isLoading.set(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto`);
      if (response.ok) {
        const data = await response.json();
        // Sort by date ascending
        data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this._ptoList.set(data);
      } else {
        console.error('Failed to fetch PTO list, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching PTO list:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  async addPto(pto: DoctorPtoRecord): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pto)
      });

      const data = await response.json();

      if (response.ok) {
        await this.fetchPtoList();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to add doctor unavailability.' };
      }
    } catch (error) {
      console.error('Add PTO error:', error);
      return { success: false, error: 'Could not connect to database server.' };
    }
  }

  async deletePto(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this._ptoList.update(list => list.filter(item => item._id !== id));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete PTO record.' };
      }
    } catch (error) {
      console.error('Error deleting PTO:', error);
      return { success: false, error: 'Could not connect to database server.' };
    }
  }
}
