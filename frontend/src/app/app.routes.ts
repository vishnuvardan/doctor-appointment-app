import { Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { AdminLoginComponent } from './admin/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: '', component: BookingComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent, canActivate: [loginGuard] },
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [authGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
