import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { environment } from '../../../environments/environment'

interface ReporteCaja {
  ingresos: number
  egresos: number
  balance: number
  por_categoria: Record<string, number>
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Reportes</h1>
          <p class="pr-subtitle">Balance de caja por rango de fechas</p>
        </div>
      </div>

      <div class="pr-card" style="margin-bottom:16px; display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Desde</mat-label>
          <input matInput type="date" [(ngModel)]="desde" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Hasta</mat-label>
          <input matInput type="date" [(ngModel)]="hasta" />
        </mat-form-field>
        <button mat-raised-button class="pr-btn-gold" (click)="consultar()">Consultar</button>
      </div>

      <div *ngIf="cargando" style="display:flex; justify-content:center; padding:40px;">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <div *ngIf="!cargando && reporte" class="grid">
        <div class="pr-card resumen">
          <p class="label">Ingresos</p>
          <p class="valor verde">{{ formatoMoneda(reporte.ingresos) }}</p>
        </div>
        <div class="pr-card resumen">
          <p class="label">Egresos</p>
          <p class="valor rojo">{{ formatoMoneda(reporte.egresos) }}</p>
        </div>
        <div class="pr-card resumen">
          <p class="label">Balance</p>
          <p class="valor" [class.verde]="reporte.balance >= 0" [class.rojo]="reporte.balance < 0">
            {{ formatoMoneda(reporte.balance) }}
          </p>
        </div>
      </div>

      <div *ngIf="!cargando && reporte" class="pr-card" style="margin-top:16px;">
        <h3 style="margin-top:0; color: var(--pr-navy);">Por categoría</h3>
        <div class="fila" *ngFor="let c of categorias()">
          <span class="cat-label">{{ c.categoria }}</span>
          <span class="cat-valor">{{ formatoMoneda(c.valor) }}</span>
        </div>
        <p *ngIf="categorias().length === 0" style="color:#9ca3af;">Sin movimientos en el rango seleccionado.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      .resumen .label {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
      }
      .resumen .valor {
        margin: 4px 0 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--pr-navy);
      }
      .verde {
        color: #059669 !important;
      }
      .rojo {
        color: #dc2626 !important;
      }
      .fila {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f3f4f6;
        font-size: 14px;
      }
      .cat-label {
        text-transform: capitalize;
        color: #374151;
      }
      .cat-valor {
        font-weight: 600;
        color: var(--pr-navy);
      }
    `,
  ],
})
export class ReportesComponent {
  private http = inject(HttpClient)

  desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  hasta = new Date().toISOString().slice(0, 10)
  cargando = false
  reporte: ReporteCaja | null = null

  ngOnInit() {
    this.consultar()
  }

  consultar() {
    this.cargando = true
    this.http
      .get<ReporteCaja>(`${environment.apiUrl}/reportes/caja`, { params: { desde: this.desde, hasta: this.hasta } })
      .subscribe({
        next: (data) => {
          this.reporte = data
          this.cargando = false
        },
        error: () => {
          this.cargando = false
        },
      })
  }

  categorias() {
    if (!this.reporte) return []
    return Object.entries(this.reporte.por_categoria)
      .map(([categoria, valor]) => ({ categoria: categoria.replace(/_/g, ' '), valor }))
      .sort((a, b) => b.valor - a.valor)
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
      valor
    )
  }
}
