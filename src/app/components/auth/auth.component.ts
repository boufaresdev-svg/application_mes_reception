import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  pinCode = '';
  pinDisplay = signal<string[]>([]);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  addDigit(digit: string) {
    if (this.pinDisplay().length < 4) {
      this.pinCode += digit;
      this.pinDisplay.set([...this.pinDisplay(), '•']);
      this.errorMessage.set('');

      if (this.pinDisplay().length === 4) {
        this.login();
      }
    }
  }

  clear() {
    this.pinCode = '';
    this.pinDisplay.set([]);
    this.errorMessage.set('');
  }

  async login() {
    const success = await this.authService.login(this.pinCode);

    if (success) {
      this.router.navigate(['/menu']);
    } else {
      this.errorMessage.set('Code PIN incorrect');
      this.clear();
    }
  }
}
