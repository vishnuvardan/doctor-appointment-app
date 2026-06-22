import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../config';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  // Login state signals
  isLoggedIn = signal<boolean>(false);
  username = signal<string>('');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Add PTO form signals
  isPtoModalOpen = signal<boolean>(false);
  formDoctorName = signal<string>('Dr. John Doe');
  formDate = signal<string>('');
  formSlot = signal<'morning' | 'evening'>('morning');
  formReason = signal<string>('');
  formError = signal<string>('');
  formSuccess = signal<string>('');
  isSubmitting = signal<boolean>(false);

  // PTO list signal
  ptoList = signal<any[]>([]);

  async ngOnInit() {
    // If credentials are saved or session persists (optional), we load it.
    // For now we just load if isLoggedIn is true
    if (this.isLoggedIn()) {
      await this.fetchPtoList();
    }
  }

  async fetchPtoList() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto`);
      const data = await response.json();
      if (response.ok) {
        // Sort by date ascending
        data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.ptoList.set(data);
      }
    } catch (error) {
      console.error('Error fetching PTO list:', error);
    }
  }

  async login() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username(),
          password: this.password()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.isLoggedIn.set(true);
        await this.fetchPtoList();
      } else {
        this.errorMessage.set(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (error) {
      this.errorMessage.set('Could not connect to authentication server.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  logout() {
    this.isLoggedIn.set(false);
    this.username.set('');
    this.password.set('');
    this.errorMessage.set('');
    this.ptoList.set([]);
  }

  openPtoModal() {
    this.formDoctorName.set('Dr. John Doe');
    this.formDate.set('');
    this.formSlot.set('morning');
    this.formReason.set('');
    this.formError.set('');
    this.formSuccess.set('');
    this.isPtoModalOpen.set(true);
  }

  closePtoModal() {
    this.isPtoModalOpen.set(false);
  }

  async submitPto() {
    this.formError.set('');
    this.formSuccess.set('');

    const doctor = this.formDoctorName().trim();
    const ptoDate = this.formDate();
    const slot = this.formSlot();
    const reason = this.formReason().trim();

    if (!doctor) {
      this.formError.set('Doctor name is required.');
      return;
    }
    if (!ptoDate) {
      this.formError.set('Date is required.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorName: doctor,
          date: ptoDate,
          slot,
          reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.formSuccess.set('Doctor unavailability added successfully!');
        await this.fetchPtoList();
        // Automatically close modal after 1.5 seconds
        setTimeout(() => {
          this.closePtoModal();
        }, 1500);
      } else {
        this.formError.set(data.error || 'Failed to add doctor unavailability.');
      }
    } catch (error) {
      this.formError.set('Could not connect to database server.');
      console.error('Submit PTO error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deletePto(id: string) {
    if (!confirm('Are you sure you want to cancel this PTO record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-pto/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.ptoList.update(list => list.filter(item => item._id !== id));
      } else {
        alert('Failed to delete PTO record.');
      }
    } catch (error) {
      console.error('Error deleting PTO:', error);
      alert('Could not connect to database server.');
    }
  }

  formatDateStr(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Keep the UTC timezone to align with MongoDB inputs
    });
  }
}
