import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PtoService } from '../services/pto.service';
import { AppointmentService } from '../services/appointment.service';
import { CLINIC_WEEKLY_HOLIDAYS } from '../config';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-booking',
  imports: [FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  readonly title = 'Book the Doctor';

  private ptoService = inject(PtoService);
  private appointmentService = inject(AppointmentService);

  // State signals
  currentDate = new Date();
  activeYear = signal<number>(this.currentDate.getFullYear());
  activeMonth = signal<number>(this.currentDate.getMonth()); // 0-11
  selectedDate = signal<Date | null>(null);
  selectedSession = signal<'morning' | 'evening' | null>(null);
  isModalOpen = signal<boolean>(false);
  isSuccess = signal<boolean>(false);

  // Patient booking form signals
  patientName = signal<string>('');
  mobileNumber = signal<string>('');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  async ngOnInit() {
    await this.ptoService.fetchPtoList();
  }

  isHoliday(date: Date): boolean {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    return CLINIC_WEEKLY_HOLIDAYS.includes(dayName);
  }

  isSlotBlocked(date: Date | null, slot: 'morning' | 'evening'): boolean {
    if (!date) return false;
    if (this.isHoliday(date)) return true;
    return this.ptoService.ptoList().some(pto => {
      const ptoDate = new Date(pto.date);
      return (
        pto.slot === slot &&
        ptoDate.getUTCFullYear() === date.getFullYear() &&
        ptoDate.getUTCMonth() === date.getMonth() &&
        ptoDate.getUTCDate() === date.getDate()
      );
    });
  }

  isDayFullyBlocked(date: Date): boolean {
    if (this.isHoliday(date)) return true;
    return this.isSlotBlocked(date, 'morning') && this.isSlotBlocked(date, 'evening');
  }

  // Month names for display
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Weekdays header
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generated calendar days
  calendarDays = computed(() => {
    const year = this.activeYear();
    const month = this.activeMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // First day of the current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of the week of the first day (0 = Sunday, 6 = Saturday)
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill in days from the previous month
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDaysCount - i);
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime()
      });
    }

    // Fill in days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime()
      });
    }

    // Fill in days of the next month to make a grid of 42 cells (6 rows * 7 days)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime()
      });
    }

    return days;
  });

  // Navigation
  prevMonth() {
    if (this.activeMonth() === 0) {
      this.activeMonth.set(11);
      this.activeYear.update(y => y - 1);
    } else {
      this.activeMonth.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.activeMonth() === 11) {
      this.activeMonth.set(0);
      this.activeYear.update(y => y + 1);
    } else {
      this.activeMonth.update(m => m + 1);
    }
  }

  // Booking actions
  selectDay(day: CalendarDay) {
    if (day.isPast) return; // Can't book in the past

    this.selectedDate.set(day.date);
    this.selectedSession.set(null); // Reset session choice
    this.isSuccess.set(false); // Reset success state
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  selectSession(session: 'morning' | 'evening') {
    if (this.isSlotBlocked(this.selectedDate(), session)) return;
    this.selectedSession.set(session);
  }

  async submitBooking() {
    if (!this.selectedDate() || !this.selectedSession() || !this.patientName().trim() || !this.mobileNumber().trim()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const year = this.selectedDate()!.getFullYear();
    const month = String(this.selectedDate()!.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate()!.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const result = await this.appointmentService.createAppointment({
      patientName: this.patientName().trim(),
      mobileNumber: this.mobileNumber().trim(),
      date: formattedDate,
      slot: this.selectedSession()!
    });

    this.isSubmitting.set(false);

    if (result.success) {
      this.isSuccess.set(true);
    } else {
      this.errorMessage.set(result.error || 'Failed to schedule appointment.');
    }
  }

  resetBooking() {
    this.isModalOpen.set(false);
    this.isSuccess.set(false);
    this.selectedDate.set(null);
    this.selectedSession.set(null);
    this.patientName.set('');
    this.mobileNumber.set('');
    this.errorMessage.set('');
  }

  // Helper
  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
