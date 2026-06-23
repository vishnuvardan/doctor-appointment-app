import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet],
  template: `
    <div class="admin-wrapper">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AdminLayoutComponent {}
