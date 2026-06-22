import { Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: BookingComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
