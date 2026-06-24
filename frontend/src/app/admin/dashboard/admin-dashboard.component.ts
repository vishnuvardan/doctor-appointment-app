import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PtoService } from '../../services/pto.service';
import { AppointmentService, AppointmentRecord } from '../../services/appointment.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private ptoService = inject(PtoService);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  // Expose signal directly from service
  ptoList = this.ptoService.ptoList;

  // Appointments state signals
  selectedAppointmentDate = signal<string>('');
  appointmentsList = signal<AppointmentRecord[]>([]);
  isAppointmentsLoading = signal<boolean>(false);

  // Add PTO form signals
  isPtoModalOpen = signal<boolean>(false);
  formDoctorName = signal<string>('Pradeep');
  formDate = signal<string>('');
  formSlotMorning = signal<boolean>(true);
  formSlotEvening = signal<boolean>(false);
  formReason = signal<string>('');
  formError = signal<string>('');
  formSuccess = signal<string>('');
  isSubmitting = signal<boolean>(false);

  async ngOnInit() {
    // Default to today's date in local time YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.selectedAppointmentDate.set(`${year}-${month}-${day}`);

    await this.ptoService.fetchPtoList();
    await this.fetchAppointments();
  }

  async fetchAppointments() {
    this.isAppointmentsLoading.set(true);
    const date = this.selectedAppointmentDate();
    if (date) {
      const list = await this.appointmentService.getAppointments(date);
      this.appointmentsList.set(list);
    } else {
      this.appointmentsList.set([]);
    }
    this.isAppointmentsLoading.set(false);
  }

  async onAppointmentDateChange(dateStr: string) {
    this.selectedAppointmentDate.set(dateStr);
    await this.fetchAppointments();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  openPtoModal() {
    this.formDoctorName.set('Pradeep');
    this.formDate.set('');
    this.formSlotMorning.set(true);
    this.formSlotEvening.set(false);
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
    const reason = this.formReason().trim();

    if (!doctor) {
      this.formError.set('Doctor name is required.');
      return;
    }
    if (!ptoDate) {
      this.formError.set('Date is required.');
      return;
    }
    if (!this.formSlotMorning() && !this.formSlotEvening()) {
      this.formError.set('At least one session slot (Morning or Evening) must be selected.');
      return;
    }

    this.isSubmitting.set(true);

    const slotsToSubmit: ('morning' | 'evening')[] = [];
    if (this.formSlotMorning()) slotsToSubmit.push('morning');
    if (this.formSlotEvening()) slotsToSubmit.push('evening');

    let overallSuccess = true;
    let errorMessage = '';

    for (const slot of slotsToSubmit) {
      const result = await this.ptoService.addPto({
        doctorName: doctor,
        date: ptoDate,
        slot,
        reason
      });
      if (!result.success) {
        overallSuccess = false;
        errorMessage = result.error || 'Failed to add doctor unavailability.';
      }
    }

    this.isSubmitting.set(false);

    if (overallSuccess) {
      this.formSuccess.set('Doctor unavailability added successfully!');
      // Automatically close modal after 1.5 seconds
      setTimeout(() => {
        this.closePtoModal();
      }, 1500);
    } else {
      this.formError.set(errorMessage);
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

  async navigateAppointmentDate(offset: number) {
    const currentDateStr = this.selectedAppointmentDate();
    if (!currentDateStr) return;

    const parts = currentDateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    date.setDate(date.getDate() + offset);

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');

    const nextDateStr = `${nextYear}-${nextMonth}-${nextDay}`;
    this.selectedAppointmentDate.set(nextDateStr);
    await this.fetchAppointments();
  }

  getSMSLink(appt: AppointmentRecord): string {
    const formattedDate = this.formatDateStr(appt.date);
    const sessionTime = appt.slot === 'morning' ? '10:30 AM - 01:00 PM' : '06:30 PM - 08:30 PM';
    const message = `Gentle reminder to visit Pradeep Siddha clinic on ${formattedDate} during the ${appt.slot === 'morning' ? 'Morning' : 'Evening'} slot (${sessionTime}).`;
    return `sms:${appt.mobileNumber}?body=${encodeURIComponent(message)}`;
  }
}
