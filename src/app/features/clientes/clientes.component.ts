import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ApiService } from '../../core/services/api.service'
import { Cliente } from '../../core/models/models'
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component'
import { ClienteDialogComponent } from './cliente-dialog.component'

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Clientes</h1>
          <p class="pr-subtitle">Personas y empresas que atiende el taller</p>
        </div>
        <button mat-raised-button class="pr-btn-gold" (click)="abrir(null)">
          <mat-icon>person_add</mat-icon> Nuevo cliente
        </button>
      </div>

      <!-- Resumen -->
      <div class="stats">
        <div class="pr-card stat">
          <div class="stat-icono navy"><mat-icon>groups</mat-icon></div>
          <div><p class="stat-valor">{{ stats.activos }}</p><p class="stat-label">Clientes activos</p></div>
        </div>
        <div class="pr-card stat">
          <div class="stat-icono gold"><mat-icon>person</mat-icon></div>
          <div><p class="stat-valor">{{ stats.personas }}</p><p class="stat-label">Personas</p></div>
        </div>
        <div class="pr-card stat">
          <div class="stat-icono blue"><mat-icon>business</mat-icon></div>
          <div><p class="stat-valor">{{ stats.empresas }}</p><p class="stat-label">Empresas</p></div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="buscar">
          <mat-label>Buscar por nombre, documento, teléfono...</mat-label>
          <input matInput [(ngModel)]="busqueda" (ngModelChange)="aplicar()" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-button-toggle-group [(ngModel)]="tipoFiltro" (change)="aplicar()" class="toggle-tipo">
          <mat-button-toggle value="todos">Todos</mat-button-toggle>
          <mat-button-toggle value="natural">Personas</mat-button-toggle>
          <mat-button-toggle value="empresa">Empresas</mat-button-toggle>
        </mat-button-toggle-group>

        <mat-slide-toggle [(ngModel)]="verInactivos" (change)="aplicar()">Ver inactivos</mat-slide-toggle>
      </div>

      <div *ngIf="cargando" class="centro"><mat-spinner diameter="36"></mat-spinner></div>

      <div *ngIf="!cargando && filtrados.length === 0" class="pr-card vacio">
        <mat-icon>search_off</mat-icon>
        <p>No se encontraron clientes con esos filtros.</p>
      </div>

      <!-- Tarjetas -->
      <div class="grid-cards" *ngIf="!cargando">
        <div class="pr-card card" *ngFor="let c of filtrados" [class.inactivo]="!c.activo">
          <div class="card-head">
            <div class="avatar" [class.empresa]="c.tipo === 'empresa'">{{ iniciales(c.nombre) }}</div>
            <div class="info">
              <h3>{{ c.nombre }}</h3>
              <p class="doc">{{ c.identificacion || 'Sin documento' }}</p>
            </div>
            <span class="chip" [class.chip-emp]="c.tipo === 'empresa'">
              {{ c.tipo === 'empresa' ? 'Empresa' : 'Persona' }}
            </span>
          </div>

          <ul class="datos">
            <li *ngIf="c.telefono"><mat-icon>phone</mat-icon><a [href]="'tel:' + c.telefono">{{ c.telefono }}</a></li>
            <li *ngIf="c.email"><mat-icon>mail</mat-icon><a [href]="'mailto:' + c.email">{{ c.email }}</a></li>
            <li *ngIf="ubicacion(c)"><mat-icon>place</mat-icon><span>{{ ubicacion(c) }}</span></li>
            <li *ngIf="!c.telefono && !c.email && !ubicacion(c)" class="sin-datos">Sin datos de contacto</li>
          </ul>

          <p class="notas" *ngIf="c.notas">{{ c.notas }}</p>

          <div class="card-foot">
            <span class="badge-inactivo" *ngIf="!c.activo">Inactivo</span>
            <span class="espacio"></span>
            <button mat-icon-button matTooltip="Editar" (click)="abrir(c)"><mat-icon>edit</mat-icon></button>
            <button
              *ngIf="c.activo"
              mat-icon-button
              color="warn"
              matTooltip="Desactivar"
              (click)="desactivar(c)"
            >
              <mat-icon>person_off</mat-icon>
            </button>
            <button *ngIf="!c.activo" mat-icon-button matTooltip="Reactivar" (click)="reactivar(c)">
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
      .stat-icono.blue { background: #2563eb; }
      .stat-valor { margin: 0; font-size: 22px; font-weight: 700; color: var(--pr-navy); }
      .stat-label { margin: 0; font-size: 12px; color: #6b7280; }

      .filtros { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
      .buscar { flex: 1; min-width: 260px; max-width: 420px; background: white; border-radius: 8px; }
      .toggle-tipo { background: white; }

      .centro { display: flex; justify-content: center; padding: 60px; }
      .vacio { text-align: center; padding: 48px; color: #9ca3af; }
      .vacio mat-icon { font-size: 40px; width: 40px; height: 40px; }

      .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
      .card { display: flex; flex-direction: column; gap: 12px; transition: box-shadow 0.15s, transform 0.15s; }
      .card:hover { box-shadow: 0 6px 18px rgba(13, 27, 62, 0.12); transform: translateY(-2px); }
      .card.inactivo { opacity: 0.6; }

      .card-head { display: flex; align-items: center; gap: 12px; }
      .avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--pr-gold); color: var(--pr-navy); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .avatar.empresa { background: var(--pr-navy); color: var(--pr-gold); border-radius: 12px; }
      .info { flex: 1; min-width: 0; }
      .info h3 { margin: 0; font-size: 15px; color: var(--pr-navy); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .doc { margin: 2px 0 0; font-size: 12px; color: #6b7280; }

      .chip { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; background: rgba(242, 194, 0, 0.18); color: #8a6d00; }
      .chip.chip-emp { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }

      .datos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #374151; }
      .datos li { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .datos mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
      .datos a { color: inherit; text-decoration: none; overflow: hidden; text-overflow: ellipsis; }
      .datos a:hover { color: var(--pr-navy); text-decoration: underline; }
      .sin-datos { color: #9ca3af; font-style: italic; }

      .notas { margin: 0; font-size: 12px; color: #6b7280; background: #f9fafb; padding: 8px 10px; border-radius: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

      .card-foot { display: flex; align-items: center; margin-top: auto; border-top: 1px solid #f3f4f6; padding-top: 8px; }
      .espacio { flex: 1; }
      .badge-inactivo { font-size: 11px; font-weight: 600; color: #b91c1c; background: #fee2e2; padding: 2px 8px; border-radius: 99px; }
    `,
  ],
})
export class ClientesComponent implements OnInit {
  private api = inject(ApiService)
  private dialog = inject(MatDialog)
  private snack = inject(MatSnackBar)

  cargando = true
  clientes: Cliente[] = []
  filtrados: Cliente[] = []
  busqueda = ''
  tipoFiltro: 'todos' | 'natural' | 'empresa' = 'todos'
  verInactivos = false
  stats = { activos: 0, personas: 0, empresas: 0 }

  ngOnInit() {
    this.cargar()
  }

  cargar() {
    this.cargando = true
    this.api.list<Cliente>('clientes').subscribe({
      next: (data) => {
        this.clientes = data
        this.stats = {
          activos: data.filter((c) => c.activo).length,
          personas: data.filter((c) => c.activo && c.tipo === 'natural').length,
          empresas: data.filter((c) => c.activo && c.tipo === 'empresa').length,
        }
        this.cargando = false
        this.aplicar()
      },
      error: () => {
        this.cargando = false
        this.snack.open('No se pudieron cargar los clientes', 'Cerrar', { duration: 3000 })
      },
    })
  }

  aplicar() {
    const q = this.busqueda.toLowerCase().trim()
    this.filtrados = this.clientes.filter((c) => {
      if (!this.verInactivos && !c.activo) return false
      if (this.tipoFiltro !== 'todos' && c.tipo !== this.tipoFiltro) return false
      if (!q) return true
      return [c.nombre, c.identificacion, c.telefono, c.email, c.ciudad].some((v) => v?.toLowerCase().includes(q))
    })
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/)
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?'
  }

  ubicacion(c: Cliente): string {
    return [c.direccion, c.ciudad].filter(Boolean).join(', ')
  }

  abrir(cliente: Cliente | null) {
    this.dialog
      .open(ClienteDialogComponent, { data: { cliente }, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((guardado) => guardado && this.cargar())
  }

  desactivar(c: Cliente) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Desactivar cliente',
          mensaje: `"${c.nombre}" dejará de aparecer en la lista, pero su historial se conserva. Puedes reactivarlo cuando quieras.`,
          textoConfirmar: 'Desactivar',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return
        this.api.remove('clientes', c.id).subscribe({
          next: () => this.cargar(),
          error: () => this.snack.open('No se pudo desactivar', 'Cerrar', { duration: 3000 }),
        })
      })
  }

  reactivar(c: Cliente) {
    this.api.update<Cliente>('clientes', c.id, { activo: true }).subscribe({
      next: () => this.cargar(),
      error: () => this.snack.open('No se pudo reactivar', 'Cerrar', { duration: 3000 }),
    })
  }
}