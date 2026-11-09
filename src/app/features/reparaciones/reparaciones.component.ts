import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { forkJoin } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ApiService } from '../../core/services/api.service'
import { Cliente, MecanicoOpt, Reparacion, Vehiculo } from '../../core/models/models'
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component'
import { ReparacionDialogComponent } from './reparacion-dialog.component'
import { ESTADOS, estadoInfo, fmtMoneda } from './estados'

@Component({
  selector: 'app-reparaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Reparaciones</h1>
          <p class="pr-subtitle">{{ filas.length }} orden(es)</p>
        </div>
        <div class="acciones">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="f-estado">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="estadoFiltro" (selectionChange)="aplicar()">
              <mat-option value="activas">Activas</mat-option>
              <mat-option value="todas">Todas</mat-option>
              <mat-option *ngFor="let e of estados" [value]="e.value">{{ e.label }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="f-buscar">
            <mat-label>Buscar (placa, cliente, orden...)</mat-label>
            <input matInput [(ngModel)]="busqueda" (ngModelChange)="aplicar()" />
          </mat-form-field>
          <button mat-raised-button class="pr-btn-gold" (click)="abrir(null)">
            <mat-icon>add</mat-icon> Nueva orden
          </button>
        </div>
      </div>

      <div class="pr-card">
        <div *ngIf="cargando" style="display:flex; justify-content:center; padding:40px;">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
        <div *ngIf="!cargando && filas.length === 0" style="text-align:center; padding:40px; color:#9ca3af;">
          No hay órdenes para mostrar.
        </div>

        <div style="overflow-x:auto;">
          <table mat-table [dataSource]="filas" *ngIf="!cargando && filas.length > 0" style="width:100%;">
            <ng-container matColumnDef="numero_orden">
              <th mat-header-cell *matHeaderCellDef>Orden</th>
              <td mat-cell *matCellDef="let r"><strong>#{{ r.numero_orden }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="vehiculo">
              <th mat-header-cell *matHeaderCellDef>Vehículo</th>
              <td mat-cell *matCellDef="let r">{{ vehiculoLabel(r.vehiculo_id) }}</td>
            </ng-container>
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let r">{{ clienteNombre(r.vehiculo_id) }}</td>
            </ng-container>
            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Trabajo</th>
              <td mat-cell *matCellDef="let r" class="trunc">{{ r.descripcion }}</td>
            </ng-container>
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [style.color]="info(r.estado).color" [style.background]="info(r.estado).color + '1f'">
                  {{ info(r.estado).label }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="fecha_ingreso">
              <th mat-header-cell *matHeaderCellDef>Ingreso</th>
              <td mat-cell *matCellDef="let r">{{ r.fecha_ingreso }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef style="text-align:right;">Total</th>
              <td mat-cell *matCellDef="let r" style="text-align:right;">{{ fmt(r.total) }}</td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" style="text-align:right; white-space:nowrap;">
                <button mat-icon-button matTooltip="Abrir orden" (click)="abrir(r)"><mat-icon>edit</mat-icon></button>
                <button
                  mat-icon-button
                  color="warn"
                  matTooltip="Cancelar orden"
                  [disabled]="r.estado === 'cancelado' || r.estado === 'entregado'"
                  (click)="cancelar(r)"
                >
                  <mat-icon>block</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas" class="fila" (dblclick)="abrir(row)"></tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .acciones { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .f-estado { width: 170px; }
      .f-buscar { width: 260px; }
      .trunc { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chip { padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; white-space: nowrap; }
      .fila:hover { background: #fafafa; }
    `,
  ],
})
export class ReparacionesComponent implements OnInit {
  private api = inject(ApiService)
  private dialog = inject(MatDialog)
  private snack = inject(MatSnackBar)

  estados = ESTADOS
  info = estadoInfo
  fmt = fmtMoneda
  columnas = ['numero_orden', 'vehiculo', 'cliente', 'descripcion', 'estado', 'fecha_ingreso', 'total', 'acciones']

  cargando = true
  reparaciones: Reparacion[] = []
  filas: Reparacion[] = []
  mecanicos: MecanicoOpt[] = []
  private vehMap = new Map<string, Vehiculo>()
  private cliMap = new Map<string, Cliente>()

  estadoFiltro = 'activas'
  busqueda = ''

  ngOnInit() {
    this.cargar()
  }

  cargar() {
    this.cargando = true
    forkJoin({
      reparaciones: this.api.list<Reparacion>('reparaciones'),
      vehiculos: this.api.list<Vehiculo>('vehiculos'),
      clientes: this.api.list<Cliente>('clientes'),
      mecanicos: this.api.list<MecanicoOpt>('auth/mecanicos'),
    }).subscribe({
      next: (d) => {
        this.reparaciones = d.reparaciones
        this.mecanicos = d.mecanicos
        this.vehMap = new Map(d.vehiculos.map((v) => [v.id, v]))
        this.cliMap = new Map(d.clientes.map((c) => [c.id, c]))
        this.cargando = false
        this.aplicar()
      },
      error: () => {
        this.cargando = false
        this.snack.open('No se pudieron cargar las órdenes', 'Cerrar', { duration: 3000 })
      },
    })
  }

  aplicar() {
    const q = this.busqueda.toLowerCase().trim()
    this.filas = this.reparaciones.filter((r) => {
      if (this.estadoFiltro === 'activas' && ['entregado', 'cancelado'].includes(r.estado)) return false
      if (!['activas', 'todas'].includes(this.estadoFiltro) && r.estado !== this.estadoFiltro) return false
      if (!q) return true
      const texto = `${r.numero_orden} ${r.descripcion} ${this.vehiculoLabel(r.vehiculo_id)} ${this.clienteNombre(r.vehiculo_id)}`
      return texto.toLowerCase().includes(q)
    })
  }

  vehiculoLabel(id: string): string {
    const v = this.vehMap.get(id)
    return v ? `${v.placa} · ${v.marca} ${v.modelo ?? ''}`.trim() : '—'
  }

  clienteNombre(vehiculoId: string): string {
    const v = this.vehMap.get(vehiculoId)
    return (v?.cliente_id && this.cliMap.get(v.cliente_id)?.nombre) || '—'
  }

  abrir(reparacion: Reparacion | null) {
    const vehiculos = [...this.vehMap.values()]
      .filter((v) => v.activo || v.id === reparacion?.vehiculo_id)
      .map((v) => ({
        id: v.id,
        label: `${v.placa} · ${v.marca} ${v.modelo ?? ''}${v.cliente_id ? ' — ' + (this.cliMap.get(v.cliente_id)?.nombre ?? '') : ''}`,
      }))

    const ref = this.dialog.open(ReparacionDialogComponent, {
      maxWidth: '95vw',
      data: { reparacion, vehiculos, mecanicos: this.mecanicos },
    })
    ref.afterClosed().subscribe((huboCambios) => huboCambios && this.cargar())
  }

  cancelar(r: Reparacion) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: `Cancelar orden #${r.numero_orden}`,
          mensaje: 'La orden quedará en estado "Cancelado". Los repuestos ya descontados del inventario no se devuelven automáticamente.',
          textoConfirmar: 'Cancelar orden',
          textoCancelar: 'Volver',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return
        this.api.update<Reparacion>('reparaciones', r.id, { estado: 'cancelado' }).subscribe({
          next: () => this.cargar(),
          error: (e) => this.snack.open(e?.error?.error ?? 'No se pudo cancelar', 'Cerrar', { duration: 3000 }),
        })
      })
  }
}
