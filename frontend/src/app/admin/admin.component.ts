import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
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

  async login() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
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
      const response = await fetch('http://localhost:5000/api/doctor-pto', {
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
}
