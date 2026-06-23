import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string>('');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  async login() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const result = await this.authService.login(this.username(), this.password());
    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Authentication failed. Please check credentials.');
    }
  }
}
