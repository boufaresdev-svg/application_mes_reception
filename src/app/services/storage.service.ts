import { Injectable } from '@angular/core';
import { Operator, ReceptionOrder, Weighing } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly OPERATORS_KEY = 'milk_operators';
  private readonly ORDERS_KEY = 'milk_orders';
  private readonly WEIGHINGS_KEY = 'milk_weighings';

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    if (!localStorage.getItem(this.OPERATORS_KEY)) {
      const operators: Operator[] = [
        {
          id: '1',
          name: 'Opérateur Principal',
          pin_code: '1111',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.OPERATORS_KEY, JSON.stringify(operators));
    }

    if (!localStorage.getItem(this.ORDERS_KEY)) {
      const orders: ReceptionOrder[] = [
        {
          id: '1',
          order_number: 'BR-2026-001',
          supplier_name: 'Ferme Durand',
          status: 'pending',
          total_quantity: 0,
          created_at: new Date().toISOString(),
          operator_id: '1'
        },
        {
          id: '2',
          order_number: 'BR-2026-002',
          supplier_name: 'Ferme Leclerc',
          status: 'pending',
          total_quantity: 0,
          created_at: new Date().toISOString(),
          operator_id: '1'
        },
        {
          id: '3',
          order_number: 'BR-2026-003',
          supplier_name: 'GAEC des Prés Verts',
          status: 'completed',
          total_quantity: 500,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          completed_at: new Date().toISOString(),
          operator_id: '1'
        },
        {
          id: '4',
          order_number: 'BR-2026-004',
          supplier_name: 'Ferme Rousseau',
          status: 'pending',
          total_quantity: 0,
          created_at: new Date().toISOString(),
          operator_id: '1'
        }
      ];
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }

    if (!localStorage.getItem(this.WEIGHINGS_KEY)) {
      localStorage.setItem(this.WEIGHINGS_KEY, JSON.stringify([]));
    }
  }

  getOperators(): Operator[] {
    const data = localStorage.getItem(this.OPERATORS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getOrders(): ReceptionOrder[] {
    const data = localStorage.getItem(this.ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getOrder(id: string): ReceptionOrder | null {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  saveOrders(orders: ReceptionOrder[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  updateOrder(id: string, updates: Partial<ReceptionOrder>): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.saveOrders(orders);
    }
  }

  getWeighings(): Weighing[] {
    const data = localStorage.getItem(this.WEIGHINGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getWeighingsByOrder(orderId: string): Weighing[] {
    return this.getWeighings().filter(w => w.order_id === orderId);
  }

  addWeighing(weighing: Omit<Weighing, 'id' | 'created_at'>): Weighing {
    const weighings = this.getWeighings();
    const newWeighing: Weighing = {
      ...weighing,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    weighings.push(newWeighing);
    localStorage.setItem(this.WEIGHINGS_KEY, JSON.stringify(weighings));
    return newWeighing;
  }
}
