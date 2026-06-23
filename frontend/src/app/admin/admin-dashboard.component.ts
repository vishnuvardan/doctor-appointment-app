import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PtoService } from '../services/pto.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private ptoService = inject(PtoService);
  private router = inject(Router);

  // Expose signal directly from service
  ptoList = this.ptoService.ptoList;

  // Add PTO form signals
  isPtoModalOpen = signal<boolean>(false);
  formDoctorName = signal<string>('Pradeep');
  formDate = signal<string>('');
  formSlot = signal<'morning' | 'evening'>('morning');
  formReason = signal<string>('');
  formError = signal<string>('');
  formSuccess = signal<string>('');
  isSubmitting = signal<boolean>(false);

  async ngOnInit() {
    await this.ptoService.fetchPtoList();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  openPtoModal() {
    this.formDoctorName.set('Pradeep');
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

    const result = await this.ptoService.addPto({
      doctorName: doctor,
      date: ptoDate,
      slot,
      reason
    });

    this.isSubmitting.set(false);

    if (result.success) {
      this.formSuccess.set('Doctor unavailability added successfully!');
      // Automatically close modal after 1.5 seconds
      setTimeout(() => {
        this.closePtoModal();
      }, 1500);
    } else {
      this.formError.set(result.error || 'Failed to add doctor unavailability.');
    }
  }

  async deletePto(id: string | undefined) {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this PTO record?')) {
      return;
    }

    const result = await this.ptoService.deletePto(id);
    if (!result.success) {
      alert(result.error || 'Failed to delete PTO record.');
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
