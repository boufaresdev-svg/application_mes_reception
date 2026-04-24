import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ReceptionOrder, Weighing } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private storage: StorageService) {}

  async getReceptionOrders(): Promise<ReceptionOrder[]> {
    const orders = this.storage.getOrders();
    return orders.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getOrder(id: string): Promise<ReceptionOrder | null> {
    return this.storage.getOrder(id);
  }

  async getWeighings(orderId: string): Promise<Weighing[]> {
    const weighings = this.storage.getWeighingsByOrder(orderId);
    return weighings.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async addWeighing(weighing: Omit<Weighing, 'id' | 'created_at'>): Promise<boolean> {
    this.storage.addWeighing(weighing);
    await this.updateOrderTotal(weighing.order_id);
    return true;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    this.storage.updateOrder(orderId, updateData);
    return true;
  }

  private async updateOrderTotal(orderId: string): Promise<void> {
    const weighings = await this.getWeighings(orderId);
    const total = weighings.reduce((sum, w) => sum + Number(w.quantity), 0);
    this.storage.updateOrder(orderId, { total_quantity: total });
  }
}
