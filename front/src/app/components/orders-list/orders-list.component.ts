import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ReceptionOrder } from '../../models/types';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.css'
})
export class OrdersListComponent implements OnInit {
  orders = signal<ReceptionOrder[]>([]);
  loading = signal(true);
  operator = this.authService.currentOperator;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.loading.set(true);
    const orders = await this.dataService.getReceptionOrders();
    this.orders.set(orders);
    this.loading.set(false);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  selectOrder(order: ReceptionOrder) {
    this.router.navigate(['/reception', order.id]);
  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  printAllOrders() {
  const printWindow = window.open('', '', 'width=1200,height=800');
  if (!printWindow) return;

  const orders = this.orders();
  const operator = this.operator?.() || '—';
  const currentDate = new Date().toLocaleString('fr-FR');

  const totalLiters = orders.reduce(
    (sum, o) => sum + (Number(o.total_quantity) || 0),
    0
  );

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport de Réception Laitière</title>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  background: white;
  color: #1e293b;
  padding: 32px;
}

.container {
  max-width: 1100px;
  margin: auto;
}

/* ================= HEADER ================= */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #0ea5e9;
  padding-bottom: 20px;
  margin-bottom: 32px;
}

.header img {
  width: 60px;
  height: auto;
}

.header-center {
  text-align: center;
}

.header-center h1 {
  font-size: 26px;
  color: #0c4a6e;
}

.header-center p {
  font-size: 14px;
  color: #64748b;
}

/* ================= SUMMARY ================= */
.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.card {
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
}

.total { background: #10b981; }
.completed { background: #8b5cf6; }
.progress { background: #f59e0b; }
.pending { background: #ef4444; }

.card span {
  display: block;
  font-size: 28px;
  margin-top: 6px;
}

/* ================= TABLE ================= */
h2 {
  color: #0c4a6e;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead {
  background: #0ea5e9;
  color: white;
}

th, td {
  padding: 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-in_progress {
  background: #fef3c7;
  color: #92400e;
}

.status-pending {
  background: #fee2e2;
  color: #991b1b;
}

/* ================= FOOTER ================= */
.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
  font-size: 13px;
  color: #475569;
  display: flex;
  justify-content: space-between;
}

/* ================= PRINT ================= */
@media print {
  body { padding: 0; }
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <img src="assets/logo-delice.jpg">
    <div class="header-center">
      <h1>Rapport de Réception Laitière</h1>
      <p>Liste complète des bons de réception</p>
    </div>
    <img src="assets/logo-sms2i.jpg">
  </div>

  <div class="summary">
    <div class="card total">Total (L)<span>${totalLiters}</span></div>
    <div class="card completed">Terminés<span>${completedCount}</span></div>
    <div class="card progress">En cours<span>${inProgressCount}</span></div>
    <div class="card pending">En attente<span>${pendingCount}</span></div>
  </div>

  <h2>Détails des bons (${orders.length})</h2>

  <table>
    <thead>
      <tr>
        <th>N° Bon</th>
        <th>Fournisseur</th>
        <th>Quantité</th>
        <th>Statut</th>
        <th>Création</th>
        <th>Clôture</th>
      </tr>
    </thead>
    <tbody>
      ${orders.map(o => `
        <tr>
          <td><strong>${o.order_number}</strong></td>
          <td>${o.supplier_name}</td>
          <td><strong>${o.total_quantity || 0} L</strong></td>
          <td>
            <span class="status status-${o.status}">
              ${this.getStatusLabel(o.status)}
            </span>
          </td>
          <td>${new Date(o.created_at).toLocaleString('fr-FR')}</td>
          <td>${o.completed_at ? new Date(o.completed_at).toLocaleString('fr-FR') : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <p><strong>Date d'impression :</strong> ${currentDate}</p>
      <p><strong>Opérateur :</strong> ${operator}</p>
    </div>
    <div>MES – Réception Lait</div>
  </div>

</div>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}

}
