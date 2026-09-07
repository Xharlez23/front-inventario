import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehiculos/vehiculos.component').then((m) => m.VehiculosComponent),
      },
      {
        path: 'reparaciones',
        loadComponent: () =>
          import('./features/reparaciones/reparaciones.component').then((m) => m.ReparacionesComponent),
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventario/inventario.component').then((m) => m.InventarioComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./features/caja/caja.component').then((m) => m.CajaComponent),
      },
      {
        path: 'deudas',
        loadComponent: () => import('./features/deudas/deudas.component').then((m) => m.DeudasComponent),
      },
      {
        path: 'citas',
        loadComponent: () => import('./features/citas/citas.component').then((m) => m.CitasComponent),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
]
