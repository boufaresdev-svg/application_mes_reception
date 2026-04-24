import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Operator } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentOperatorSignal = signal<Operator | null>(null);
  currentOperator = this.currentOperatorSignal.asReadonly();

  constructor(private storage: StorageService) {
    this.loadOperatorFromStorage();
  }

  private loadOperatorFromStorage() {
    const stored = localStorage.getItem('currentOperator');
    if (stored) {
      this.currentOperatorSignal.set(JSON.parse(stored));
    }
  }

  async login(pinCode: string): Promise<boolean> {
    const operators = this.storage.getOperators();
    const operator = operators.find(o => o.pin_code === pinCode);

    if (!operator) {
      return false;
    }

    this.currentOperatorSignal.set(operator);
    localStorage.setItem('currentOperator', JSON.stringify(operator));
    return true;
  }

  logout() {
    this.currentOperatorSignal.set(null);
    localStorage.removeItem('currentOperator');
  }

  isAuthenticated(): boolean {
    return this.currentOperatorSignal() !== null;
  }
}
