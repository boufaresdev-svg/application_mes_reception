import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { MenuComponent } from './components/menu/menu.component';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { ReceptionComponent } from './components/reception/reception.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'menu', component: MenuComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersListComponent, canActivate: [authGuard] },
  { path: 'reception/:id', component: ReceptionComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/auth' }
];
