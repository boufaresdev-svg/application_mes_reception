import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ReceptionOrder, Weighing } from '../../models/types';

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.css'
})
export class ReceptionComponent implements OnInit {
  order = signal<ReceptionOrder | null>(null);
  weighings = signal<Weighing[]>([]);
  loading = signal(true);
  weighing = signal(false);
  saving = signal(false);

  quantity = 0;

  showAddForm = signal(false);
  operator = this.authService.currentOperator;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      await this.loadOrder(orderId);
      await this.loadWeighings(orderId);
    }
    this.loading.set(false);
  }

  async loadOrder(orderId: string) {
    const order = await this.dataService.getOrder(orderId);
    this.order.set(order);

    if (order && order.status === 'pending') {
      await this.dataService.updateOrderStatus(orderId, 'in_progress');
      order.status = 'in_progress';
      this.order.set({ ...order });
    }
  }

  async loadWeighings(orderId: string) {
    const weighings = await this.dataService.getWeighings(orderId);
    this.weighings.set(weighings);
  }

  startWeighing() {
    this.weighing.set(true);
    this.quantity = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
  }

  cancelWeighing() {
    this.weighing.set(false);
    this.quantity = 0;
  }

  async finishWeighing() {
    const order = this.order();
    if (!order || this.quantity <= 0) return;

    this.saving.set(true);

    const weighing = {
      order_id: order.id,
      quantity: this.quantity
    };

    const success = await this.dataService.addWeighing(weighing);

    if (success) {
      await this.loadWeighings(order.id);
      await this.loadOrder(order.id);
      this.weighing.set(false);
      this.quantity = 0;
    }

    this.saving.set(false);
  }

  async completeOrder() {
    const order = this.order();
    if (!order || this.weighings().length === 0) return;

    const confirmed = confirm(`Voulez-vous clôturer le bon ${order.order_number} ?`);
    if (confirmed) {
      await this.dataService.updateOrderStatus(order.id, 'completed');
      this.router.navigate(['/orders']);
    }
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

  getTotal(): number {
    return this.weighings().reduce((sum, w) => sum + Number(w.quantity), 0);
  }

printPDF() {
  const order = this.order();
  if (!order) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const weighings = this.weighings();
  const total = this.getTotal();
  const operator = this.operator();

  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Bon de Réception - ${order.order_number}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #0f172a; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 20px; }
      .header-center { text-align: center; flex: 1; }
      .header-center h1 { color: #0c4a6e; font-size: 24px; margin-bottom: 5px; }
      .info-section { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
      .info-row:last-child { border-bottom: none; }
      .info-label { font-weight: bold; color: #475569; }
      .info-value { color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #0ea5e9; color: white; padding: 10px; text-align: left; font-weight: 600; }
      td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
      tr:hover { background: #f8fafc; }
      .total-section { background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 10px; font-weight: bold; display: flex; justify-content: space-between; font-size: 20px; color: #0c4a6e; }
      .footer { margin-top: 30px; padding-top: 10px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 14px; color: #64748b; }
      img { max-height: 60px; max-width: 60px; }
      @media print {
        body { padding: 10px; }
        .header img { max-height: 50px; max-width: 50px; }
        table, th, td { font-size: 12px; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div><img src="http://localhost:4200/assets/logo-delice.jpg" alt="Logo"></div>
      <div class="header-center">
        <h1>Bon de Réception Laitière</h1>
        <p>${order.order_number}</p>
      </div>
      <div><img src="http://localhost:4200/assets/logo-sms2i.jpg" alt="Logo"></div>
    </div>

    <div class="info-section">
      <div class="info-row"><span class="info-label">Fournisseur:</span><span class="info-value">${order.supplier_name}</span></div>
      <div class="info-row"><span class="info-label">Date de création:</span><span class="info-value">${new Date(order.created_at).toLocaleString('fr-FR')}</span></div>
      ${order.completed_at ? `<div class="info-row"><span class="info-label">Date de clôture:</span><span class="info-value">${new Date(order.completed_at).toLocaleString('fr-FR')}</span></div>` : ''}
      <div class="info-row"><span class="info-label">Opérateur:</span><span class="info-value">${operator?.name || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Statut:</span><span class="info-value">${order.status === 'completed' ? 'Terminé' : order.status === 'in_progress' ? 'En cours' : 'En attente'}</span></div>
    </div>

    <h2 style="color: #0c4a6e; margin-bottom: 10px;">Détail des pesées</h2>
    <table>
      <thead>
        <tr><th>N°</th><th>Date et Heure</th><th>Quantité (L)</th></tr>
      </thead>
      <tbody>
        ${weighings.map((w, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${new Date(w.created_at).toLocaleString('fr-FR')}</td>
            <td>${w.quantity} L</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section"><span>Total:</span><span>${total} L</span></div>

    <div class="footer">
      <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
      <p>MES Réceptions</p>
    </div>
  </body>
  </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}


}
