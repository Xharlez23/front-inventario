import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { RouterLink, RouterLinkActive, Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { AuthService } from '../../core/services/auth.service'

interface NavItem {
  to: string
  icon: string
  label: string
  soloAdmin?: boolean
}

const NAV: NavItem[] = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/clientes', icon: 'group', label: 'Clientes' },
  { to: '/vehiculos', icon: 'directions_car', label: 'Vehículos' },
  { to: '/reparaciones', icon: 'build', label: 'Reparaciones' },
  { to: '/inventario', icon: 'inventory_2', label: 'Inventario' },
  { to: '/caja', icon: 'payments', label: 'Caja' },
  { to: '/deudas', icon: 'credit_card', label: 'Deudas' },
  { to: '/citas', icon: 'calendar_month', label: 'Agenda' },
  { to: '/proveedores', icon: 'storefront', label: 'Proveedores' },
  { to: '/reportes', icon: 'bar_chart', label: 'Reportes' },
  { to: '/usuarios', icon: 'admin_panel_settings', label: 'Usuarios', soloAdmin: true },
]

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <aside class="aside">
      <div class="logo-area">
        <div class="logo-icono">🔧</div>
        <div>
          <p class="logo-nombre">Punto Renault</p>
          <p class="logo-sub">Sistema de gestión</p>
        </div>
      </div>

      <nav class="nav">
        <a
          *ngFor="let item of items"
          [routerLink]="item.to"
          routerLinkActive="activo"
          class="nav-item"
          (click)="cerrar.emit()"
        >
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <div class="perfil-area">
        <div class="perfil-fila">
          <div class="perfil-avatar">{{ inicial() }}</div>
          <div style="min-width:0; flex:1;">
            <p class="perfil-nombre">{{ (auth.perfil$ | async)?.nombre ?? 'Usuario' }}</p>
            <span class="perfil-rol">{{ (auth.perfil$ | async)?.rol ?? '—' }}</span>
          </div>
        </div>
        <button mat-button class="btn-logout" (click)="cerrarSesion()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .aside {
        width: 256px;
        height: 100%;
        background: var(--pr-navy);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .logo-area {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .logo-icono {
        width: 36px;
        height: 36px;
        background: var(--pr-gold);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .logo-nombre {
        color: white;
        font-weight: 700;
        font-size: 15px;
        margin: 0;
        line-height: 1.2;
      }
      .logo-sub {
        color: rgba(255, 255, 255, 0.4);
        font-size: 11px;
        margin: 0;
      }
      .nav {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 2px;
        cursor: pointer;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        font-weight: 500;
        transition: background 0.15s;
      }
      .nav-item:hover {
        background: rgba(255, 255, 255, 0.06);
      }
      .nav-item.activo {
        background: var(--pr-gold);
        color: var(--pr-navy);
      }
      .perfil-area {
        padding: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .perfil-fila {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .perfil-avatar {
        width: 36px;
        height: 36px;
        background: var(--pr-navy-light);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pr-gold);
        font-weight: 700;
        font-size: 14px;
        flex-shrink: 0;
      }
      .perfil-nombre {
        color: white;
        font-size: 13px;
        font-weight: 500;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .perfil-rol {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 99px;
        font-weight: 500;
        background: rgba(242, 194, 0, 0.2);
        color: var(--pr-gold);
      }
      .btn-logout {
        color: rgba(255, 255, 255, 0.5);
        width: 100%;
        justify-content: flex-start;
      }
    `,
  ],
})
export class SidebarComponent {
  @Output() cerrar = new EventEmitter<void>()
  get items() {
    return NAV.filter((i) => !i.soloAdmin || this.auth.esAdmin)
  }

  constructor(public auth: AuthService, private router: Router) { }

  inicial(): string {
    return this.auth.perfilActual?.nombre?.charAt(0)?.toUpperCase() ?? '?'
  }

  async cerrarSesion() {
    await this.auth.signOut()
    this.router.navigate(['/login'])
  }
}
