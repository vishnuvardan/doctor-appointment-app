import { Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'pb_admin_auth';

  // State signals
  private _isLoggedIn = signal<boolean>(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    const session = localStorage.getItem(this.STORAGE_KEY);
    if (session === 'true') {
      this._isLoggedIn.set(true);
    }
  }

  isAuthenticated(): boolean {
    return this._isLoggedIn();
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this._isLoggedIn.set(true);
        localStorage.setItem(this.STORAGE_KEY, 'true');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed. Please check credentials.' };
      }
    } catch (error) {
      console.error('Login service error:', error);
      return { success: false, error: 'Could not connect to authentication server.' };
    }
  }

  logout() {
    this._isLoggedIn.set(false);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
