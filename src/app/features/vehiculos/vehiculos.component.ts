import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { forkJoin } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ApiService } from '../../core/services/api.service'
import { Cliente, Vehiculo } from '../../core/models/models'
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component'
import { VehiculoDialogComponent } from './vehiculos-dialog.component'

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Vehículos</h1>
          <p class="pr-subtitle">Flota de los clientes del taller</p>
        </div>
        <button mat-raised-button class="pr-btn-gold" (click)="abrir(null)">
          <mat-icon>add</mat-icon> Nuevo vehículo
        </button>
      </div>

      <!-- Resumen -->
      <div class="stats">
        <div class="pr-card stat">
          <div class="stat-icono navy"><mat-icon>directions_car</mat-icon></div>
          <div><p class="stat-valor">{{ stats.activos }}</p><p class="stat-label">Vehículos activos</p></div>
        </div>
        <div class="pr-card stat">
          <div class="stat-icono gold"><mat-icon>verified</mat-icon></div>
          <div><p class="stat-valor">{{ stats.renault }}</p><p class="stat-label">Renault</p></div>
        </div>
        <div class="pr-card stat">
          <div class="stat-icono red"><mat-icon>person_off</mat-icon></div>
          <div><p class="stat-valor">{{ stats.sinDueno }}</p><p class="stat-label">Sin propietario</p></div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="buscar">
          <mat-label>Buscar por placa, marca, modelo, dueño...</mat-label>
          <input matInput [(ngModel)]="busqueda" (ngModelChange)="aplicar()" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="f-marca">
          <mat-label>Marca</mat-label>
          <mat-select [(ngModel)]="marcaFiltro" (selectionChange)="aplicar()">
            <mat-option value="todas">Todas</mat-option>
            <mat-option *ngFor="let m of marcas" [value]="m">{{ m }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-slide-toggle [(ngModel)]="verInactivos" (change)="aplicar()">Ver inactivos</mat-slide-toggle>
      </div>

      <div *ngIf="cargando" class="centro"><mat-spinner diameter="36"></mat-spinner></div>

      <div *ngIf="!cargando && filtrados.length === 0" class="pr-card vacio">
        <mat-icon>search_off</mat-icon>
        <p>No se encontraron vehículos con esos filtros.</p>
      </div>

      <!-- Tarjetas -->
      <div class="grid-cards" *ngIf="!cargando">
        <div class="pr-card card" *ngFor="let v of filtrados" [class.inactivo]="!v.activo">
          <div class="card-head">
            <span class="placa">{{ v.placa }}</span>
            <span class="espacio"></span>
            <span class="badge-inactivo" *ngIf="!v.activo">Inactivo</span>
          </div>

          <div>
            <h3>{{ v.marca }} {{ v.modelo }}</h3>
            <p class="sub">{{ detalle(v) }}</p>
          </div>

          <ul class="datos">
            <li [class.sin-datos]="!v.cliente_id">
              <mat-icon>person</mat-icon>
              <span>{{ nombreCliente(v.cliente_id) }}</span>
            </li>
            <li *ngIf="v.kilometraje !== null && v.kilometraje !== undefined">
              <mat-icon>speed</mat-icon><span>{{ km(v.kilometraje) }} km</span>
            </li>
            <li *ngIf="v.vin"><mat-icon>tag</mat-icon><span class="vin">{{ v.vin }}</span></li>
          </ul>

          <p class="notas" *ngIf="v.notas">{{ v.notas }}</p>

          <div class="card-foot">
            <span class="espacio"></span>
            <button mat-icon-button matTooltip="Editar" (click)="abrir(v)"><mat-icon>edit</mat-icon></button>
            <button *ngIf="v.activo" mat-icon-button color="warn" matTooltip="Desactivar" (click)="desactivar(v)">
              <mat-icon>block</mat-icon>
            </button>
            <button *ngIf="!v.activo" mat-icon-button matTooltip="Reactivar" (click)="reactivar(v)">
              <mat-icon>restore</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
      .stat { display: flex; align-items: center; gap: 14px; }
      .stat-icono { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
      .stat-icono.navy { background: var(--pr-navy); }
      .stat-icono.gold { background: var(--pr-gold); color: var(--pr-navy); }
      .stat-icono.red { background: #dc2626; }
      .stat-valor { margin: 0; font-size: 22px; font-weight: 700; color: var(--pr-navy); }
      .stat-label { margin: 0; font-size: 12px; color: #6b7280; }

      .filtros { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
      .buscar { flex: 1; min-width: 260px; max-width: 420px; background: white; border-radius: 8px; }
      .f-marca { width: 180px; background: white; border-radius: 8px; }

      .centro { display: flex; justify-content: center; padding: 60px; }
      .vacio { text-align: center; padding: 48px; color: #9ca3af; }
      .vacio mat-icon { font-size: 40px; width: 40px; height: 40px; }

      .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px; }
      .card { display: flex; flex-direction: column; gap: 12px; transition: box-shadow 0.15s, transform 0.15s; }
      .card:hover { box-shadow: 0 6px 18px rgba(13, 27, 62, 0.12); transform: translateY(-2px); }
      .card.inactivo { opacity: 0.6; }

      .card-head { display: flex; align-items: center; }
      .placa { background: var(--pr-gold); color: #111; border: 2px solid #111; border-radius: 6px; padding: 3px 12px; font-family: 'Courier New', monospace; font-weight: 800; font-size: 16px; letter-spacing: 2px; }
      h3 { margin: 0; font-size: 16px; color: var(--pr-navy); }
      .sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }

      .datos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #374151; }
      .datos li { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .datos mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
      .datos li.sin-datos { color: #9ca3af; font-style: italic; }
      .vin { font-family: 'Courier New', monospace; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }

      .notas { margin: 0; font-size: 12px; color: #6b7280; background: #f9fafb; padding: 8px 10px; border-radius: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

      .card-foot { display: flex; align-items: center; margin-top: auto; border-top: 1px solid #f3f4f6; padding-top: 8px; }
      .espacio { flex: 1; }
      .badge-inactivo { font-size: 11px; font-weight: 600; color: #b91c1c; background: #fee2e2; padding: 2px 8px; border-radius: 99px; }
    `,
  ],
})
export class VehiculosComponent implements OnInit {
  private api = inject(ApiService)
  private dialog = inject(MatDialog)
  private snack = inject(MatSnackBar)

  cargando = true
  vehiculos: Vehiculo[] = []
  clientes: Cliente[] = []
  filtrados: Vehiculo[] = []
  marcas: string[] = []
  private cliMap = new Map<string, Cliente>()

  busqueda = ''
  marcaFiltro = 'todas'
  verInactivos = false
  stats = { activos: 0, renault: 0, sinDueno: 0 }

  ngOnInit() {
    this.cargar()
  }

  cargar() {
    this.cargando = true
    forkJoin({
      vehiculos: this.api.list<Vehiculo>('vehiculos'),
      clientes: this.api.list<Cliente>('clientes'),
    }).subscribe({
      next: ({ vehiculos, clientes }) => {
        this.vehiculos = vehiculos
        this.clientes = clientes
        this.cliMap = new Map(clientes.map((c) => [c.id, c]))
        const activos = vehiculos.filter((v) => v.activo)
        this.stats = {
          activos: activos.length,
          renault: activos.filter((v) => v.marca.toLowerCase().includes('renault')).length,
          sinDueno: activos.filter((v) => !v.cliente_id || !this.cliMap.has(v.cliente_id)).length,
        }
        this.marcas = [...new Set(vehiculos.map((v) => v.marca.trim()))].sort()
        this.cargando = false
        this.aplicar()
      },
      error: () => {
        this.cargando = false
        this.snack.open('No se pudieron cargar los vehículos', 'Cerrar', { duration: 3000 })
      },
    })
  }

  aplicar() {
    const q = this.busqueda.toLowerCase().trim()
    this.filtrados = this.vehiculos.filter((v) => {
      if (!this.verInactivos && !v.activo) return false
      if (this.marcaFiltro !== 'todas' && v.marca.trim() !== this.marcaFiltro) return false
      if (!q) return true
      return [v.placa, v.marca, v.modelo, v.vin, v.color, this.nombreCliente(v.cliente_id)].some((x) =>
        x?.toLowerCase().includes(q)
      )
    })
  }

  nombreCliente(id: string | null): string {
    return (id && this.cliMap.get(id)?.nombre) || 'Sin propietario'
  }

  detalle(v: Vehiculo): string {
    return [v.anio, v.color].filter(Boolean).join(' · ') || 'Sin más datos'
  }

  km(n: number): string {
    return n.toLocaleString('es-CO')
  }

  abrir(vehiculo: Vehiculo | null) {
    const clientes = this.clientes.filter((c) => c.activo || c.id === vehiculo?.cliente_id)
    this.dialog
      .open(VehiculoDialogComponent, { data: { vehiculo, clientes }, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((guardado) => guardado && this.cargar())
  }

  desactivar(v: Vehiculo) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Desactivar vehículo',
          mensaje: `El vehículo ${v.placa} dejará de aparecer en la lista y al crear órdenes, pero su historial se conserva.`,
          textoConfirmar: 'Desactivar',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return
        this.api.remove('vehiculos', v.id).subscribe({
          next: () => this.cargar(),
          error: () => this.snack.open('No se pudo desactivar', 'Cerrar', { duration: 3000 }),
        })
      })
  }

  reactivar(v: Vehiculo) {
    this.api.update<Vehiculo>('vehiculos', v.id, { activo: true }).subscribe({
      next: () => this.cargar(),
      error: () => this.snack.open('No se pudo reactivar', 'Cerrar', { duration: 3000 }),
    })
  }
}