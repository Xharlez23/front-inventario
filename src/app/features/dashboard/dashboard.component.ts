import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { environment } from '../../../environments/environment'
import { DashboardResumen } from '../../core/models/models'
import { AuthService } from '../../core/services/auth.service'

interface Tarjeta {
  label: string
  valor: string
  icon: string
  color: string
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Hola, {{ (auth.perfil$ | async)?.nombre }} 👋</h1>
          <p class="pr-subtitle">Resumen general del taller</p>
        </div>
      </div>

      <div *ngIf="cargando" style="display:flex; justify-content:center; padding: 60px;">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <div *ngIf="!cargando" class="grid">
        <div class="pr-card tarjeta" *ngFor="let t of tarjetas">
          <div class="icono" [style.background]="t.color">
            <mat-icon>{{ t.icon }}</mat-icon>
          </div>
          <div>
            <p class="valor">{{ t.valor }}</p>
            <p class="label">{{ t.label }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="!cargando && resumen" class="pr-card" style="margin-top:20px;">
        <h3 style="margin-top:0; color: var(--pr-navy);">Reparaciones por estado</h3>
        <div class="fila-estado" *ngFor="let e of estadosOrdenados()">
          <span class="estado-label">{{ e.estado }}</span>
          <div class="barra-fondo">
            <div class="barra" [style.width.%]="e.porcentaje"></div>
          </div>
          <span class="estado-valor">{{ e.cantidad }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }
      .tarjeta {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .icono {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      .valor {
        font-size: 22px;
        font-weight: 700;
        color: var(--pr-navy);
        margin: 0;
      }
      .label {
        font-size: 12px;
        color: #6b7280;
        margin: 2px 0 0;
      }
      .fila-estado {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .estado-label {
        width: 160px;
        font-size: 13px;
        color: #374151;
        text-transform: capitalize;
      }
      .barra-fondo {
        flex: 1;
        height: 8px;
        border-radius: 4px;
        background: #f3f4f6;
        overflow: hidden;
      }
      .barra {
        height: 100%;
        background: var(--pr-gold);
      }
      .estado-valor {
        width: 24px;
        text-align: right;
        font-size: 13px;
        font-weight: 600;
        color: var(--pr-navy);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient)
  auth = inject(AuthService)

  cargando = true
  resumen: DashboardResumen | null = null
  tarjetas: Tarjeta[] = []

  ngOnInit() {
    this.http.get<DashboardResumen>(`${environment.apiUrl}/reportes/dashboard`).subscribe({
      next: (data) => {
        this.resumen = data
        this.tarjetas = [
          { label: 'Clientes activos', valor: String(data.total_clientes), icon: 'group', color: '#0D1B3E' },
          { label: 'Vehículos activos', valor: String(data.total_vehiculos), icon: 'directions_car', color: '#1A2D5A' },
          { label: 'Reparaciones activas', valor: String(data.reparaciones_activas), icon: 'build', color: '#F2C200' },
          {
            label: 'Deudas pendientes',
            valor: this.formatoMoneda(data.deudas_pendientes_total),
            icon: 'credit_card',
            color: '#DC2626',
          },
          { label: 'Repuestos en bajo stock', valor: String(data.inventario_bajo_stock), icon: 'inventory_2', color: '#059669' },
        ]
        this.cargando = false
      },
      error: () => {
        this.cargando = false
      },
    })
  }

  estadosOrdenados() {
    if (!this.resumen) return []
    const entradas = Object.entries(this.resumen.reparaciones_por_estado)
    const max = Math.max(1, ...entradas.map(([, v]) => v))
    return entradas
      .map(([estado, cantidad]) => ({
        estado: estado.replace(/_/g, ' '),
        cantidad,
        porcentaje: (cantidad / max) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
      valor
    )
  }
}
