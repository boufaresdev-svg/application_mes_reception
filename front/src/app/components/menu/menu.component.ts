import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  operator = this.authService.currentOperator;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
