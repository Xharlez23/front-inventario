import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatTabsModule } from '@angular/material/tabs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ApiService } from '../../core/services/api.service'
import {
  EstadoReparacion,
  Inventario,
  MecanicoOpt,
  Reparacion,
  ReparacionRepuesto,
  ReparacionServicio,
} from '../../core/models/models'
import { ESTADOS, fmtMoneda } from './estados'

export interface ReparacionDialogData {
  reparacion: Reparacion | null
  vehiculos: { id: string; label: string }[]
  mecanicos: MecanicoOpt[]
}

@Component({
  selector: 'app-reparacion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ reparacion ? 'Orden #' + reparacion.numero_orden : 'Nueva orden de reparación' }}
    </h2>

    <mat-dialog-content class="contenido">
      <mat-tab-group [(selectedIndex)]="tabIndex" animationDuration="0ms">
        <!-- ============ DATOS ============ -->
        <mat-tab label="Datos">
          <form [formGroup]="form" class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Vehículo</mat-label>
              <mat-select formControlName="vehiculo_id">
                <mat-option *ngFor="let v of data.vehiculos" [value]="v.id">{{ v.label }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mecánico</mat-label>
              <mat-select formControlName="mecanico_id">
                <mat-option value="">Sin asignar</mat-option>
                <mat-option *ngFor="let m of data.mecanicos" [value]="m.id">{{ m.nombre }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option *ngFor="let e of estados" [value]="e.value">{{ e.label }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha de ingreso</mat-label>
              <input matInput type="date" formControlName="fecha_ingreso" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Entrega estimada</mat-label>
              <input matInput type="date" formControlName="fecha_estimada" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Kilometraje</mat-label>
              <input matInput type="number" formControlName="kilometraje" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Descripción del trabajo</mat-label>
              <textarea matInput rows="3" formControlName="descripcion"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Observaciones</mat-label>
              <textarea matInput rows="2" formControlName="observaciones"></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- ============ SERVICIOS Y REPUESTOS ============ -->
        <mat-tab label="Servicios y repuestos" [disabled]="!reparacion">
          <ng-container *ngIf="reparacion">
            <h3 class="seccion">Servicios (mano de obra)</h3>
            <div class="fila-item" *ngFor="let s of servicios">
              <span class="desc">{{ s.descripcion }}</span>
              <span>{{ s.cantidad }} × {{ fmt(s.precio_unitario) }}</span>
              <strong>{{ fmt(s.subtotal) }}</strong>
              <button mat-icon-button color="warn" (click)="quitarServicio(s)"><mat-icon>close</mat-icon></button>
            </div>
            <p class="vacio" *ngIf="servicios.length === 0">Sin servicios agregados.</p>

            <div class="agregar">
              <mat-form-field appearance="outline" class="f-desc" subscriptSizing="dynamic">
                <mat-label>Servicio</mat-label>
                <input matInput [(ngModel)]="nuevoServicio.descripcion" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="f-num" subscriptSizing="dynamic">
                <mat-label>Cant.</mat-label>
                <input matInput type="number" min="1" [(ngModel)]="nuevoServicio.cantidad" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="f-num" subscriptSizing="dynamic">
                <mat-label>Precio</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="nuevoServicio.precio_unitario" />
              </mat-form-field>
              <button mat-stroked-button (click)="agregarServicio()"><mat-icon>add</mat-icon>Agregar</button>
            </div>

            <h3 class="seccion">Repuestos</h3>
            <div class="fila-item" *ngFor="let r of repuestos">
              <span class="desc">{{ r.descripcion }}</span>
              <span>{{ r.cantidad }} × {{ fmt(r.precio_unitario) }}</span>
              <strong>{{ fmt(r.subtotal) }}</strong>
              <button mat-icon-button color="warn" (click)="quitarRepuesto(r)"><mat-icon>close</mat-icon></button>
            </div>
            <p class="vacio" *ngIf="repuestos.length === 0">Sin repuestos agregados.</p>

            <div class="agregar">
              <mat-form-field appearance="outline" class="f-desc" subscriptSizing="dynamic">
                <mat-label>Del inventario (opcional)</mat-label>
                <mat-select [(ngModel)]="nuevoRepuesto.inventario_id" (selectionChange)="alElegirInventario($event.value)">
                  <mat-option [value]="null">Repuesto externo (manual)</mat-option>
                  <mat-option *ngFor="let i of inventario" [value]="i.id" [disabled]="i.cantidad <= 0">
                    {{ i.nombre }} (stock: {{ i.cantidad }})
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="f-desc" subscriptSizing="dynamic">
                <mat-label>Descripción</mat-label>
                <input matInput [(ngModel)]="nuevoRepuesto.descripcion" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="f-num" subscriptSizing="dynamic">
                <mat-label>Cant.</mat-label>
                <input matInput type="number" min="1" [(ngModel)]="nuevoRepuesto.cantidad" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="f-num" subscriptSizing="dynamic">
                <mat-label>Precio</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="nuevoRepuesto.precio_unitario" />
              </mat-form-field>
              <button mat-stroked-button (click)="agregarRepuesto()"><mat-icon>add</mat-icon>Agregar</button>
            </div>

            <div class="totales">
              <div><span>Subtotal</span><strong>{{ fmt(reparacion.subtotal) }}</strong></div>
              <div class="desc-row">
                <span>Descuento</span>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="f-num">
                  <input matInput type="number" min="0" [(ngModel)]="descuento" (change)="guardarDescuento()" />
                </mat-form-field>
              </div>
              <div class="total"><span>Total</span><strong>{{ fmt(reparacion.total) }}</strong></div>
            </div>
          </ng-container>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cerrar</button>
      <button
        *ngIf="tabIndex === 0"
        mat-raised-button
        class="pr-btn-gold"
        [disabled]="form.invalid || guardando"
        (click)="guardar()"
      >
        {{ reparacion ? 'Guardar cambios' : 'Crear orden' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .contenido { min-width: min(760px, 90vw); }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; padding-top: 16px; }
      .full { grid-column: 1 / -1; }
      .seccion { margin: 16px 0 8px; color: var(--pr-navy); font-size: 15px; }
      .fila-item { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
      .fila-item .desc { flex: 1; }
      .vacio { color: #9ca3af; font-size: 13px; margin: 4px 0; }
      .agregar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
      .f-desc { flex: 1; min-width: 160px; }
      .f-num { width: 100px; }
      .totales { margin-top: 20px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
      .totales > div { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
      .totales .total { font-size: 18px; color: var(--pr-navy); border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px; }
      @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ReparacionDialogComponent implements OnInit {
  private fb = inject(FormBuilder)
  private api = inject(ApiService)
  private snack = inject(MatSnackBar)
  private ref = inject(MatDialogRef<ReparacionDialogComponent, boolean>)
  data = inject<ReparacionDialogData>(MAT_DIALOG_DATA)

  estados = ESTADOS
  fmt = fmtMoneda

  reparacion: Reparacion | null = this.data.reparacion
  tabIndex = 0
  guardando = false
  cambios = false

  servicios: ReparacionServicio[] = []
  repuestos: ReparacionRepuesto[] = []
  inventario: Inventario[] = []
  descuento = 0

  nuevoServicio = { descripcion: '', cantidad: 1, precio_unitario: 0 }
  nuevoRepuesto: { inventario_id: string | null; descripcion: string; cantidad: number; precio_unitario: number } = {
    inventario_id: null,
    descripcion: '',
    cantidad: 1,
    precio_unitario: 0,
  }

  form = this.fb.group({
    vehiculo_id: ['', Validators.required],
    mecanico_id: [''],
    estado: ['recibido' as EstadoReparacion],
    fecha_ingreso: [new Date().toISOString().slice(0, 10), Validators.required],
    fecha_estimada: [''],
    kilometraje: [null as number | null],
    descripcion: ['', Validators.required],
    observaciones: [''],
  })

  ngOnInit() {
    if (this.reparacion) {
      const r = this.reparacion
      this.form.patchValue({
        vehiculo_id: r.vehiculo_id,
        mecanico_id: r.mecanico_id ?? '',
        estado: r.estado,
        fecha_ingreso: r.fecha_ingreso,
        fecha_estimada: r.fecha_estimada ?? '',
        kilometraje: r.kilometraje,
        descripcion: r.descripcion,
        observaciones: r.observaciones ?? '',
      })
      this.descuento = r.descuento
      this.cargarItems()
    }
    this.api.list<Inventario>('inventario', { activo: 'true' }).subscribe((d) => (this.inventario = d))
  }

  // ---------- Datos ----------
  guardar() {
    if (this.form.invalid) return
    const v = this.form.getRawValue()
    const mecanico = this.data.mecanicos.find((m) => m.id === v.mecanico_id)
    const body: any = {
      vehiculo_id: v.vehiculo_id,
      mecanico_id: v.mecanico_id || null,
      tecnico_nombre: mecanico?.nombre ?? null,
      estado: v.estado,
      fecha_ingreso: v.fecha_ingreso,
      fecha_estimada: v.fecha_estimada || null,
      kilometraje: v.kilometraje ?? null,
      descripcion: v.descripcion,
      observaciones: v.observaciones || null,
    }

    this.guardando = true
    const peticion = this.reparacion
      ? this.api.update<Reparacion>('reparaciones', this.reparacion.id, body)
      : this.api.create<Reparacion>('reparaciones', body)

    peticion.subscribe({
      next: (r) => {
        const eraNueva = !this.reparacion
        this.reparacion = { ...(this.reparacion ?? ({} as Reparacion)), ...r }
        this.descuento = this.reparacion.descuento ?? 0
        this.cambios = true
        this.guardando = false
        this.snack.open('Guardado', 'Cerrar', { duration: 1500 })
        if (eraNueva) {
          this.tabIndex = 1 // pasa directo a agregar servicios/repuestos
        }
      },
      error: (e) => this.error(e),
    })
  }

  // ---------- Items ----------
  private base(sub: 'servicios' | 'repuestos') {
    return `reparaciones/${this.reparacion!.id}/${sub}`
  }

  cargarItems() {
    this.api.list<ReparacionServicio>(this.base('servicios')).subscribe((d) => (this.servicios = d))
    this.api.list<ReparacionRepuesto>(this.base('repuestos')).subscribe((d) => (this.repuestos = d))
  }

  private refrescar() {
    this.cambios = true
    this.cargarItems()
    this.api.get<Reparacion>('reparaciones', this.reparacion!.id).subscribe((r) => {
      this.reparacion = r
      this.descuento = r.descuento
    })
    this.api.list<Inventario>('inventario', { activo: 'true' }).subscribe((d) => (this.inventario = d))
  }

  agregarServicio() {
    const s = this.nuevoServicio
    if (!s.descripcion.trim() || s.cantidad <= 0) return
    this.api.create<ReparacionServicio>(this.base('servicios'), s).subscribe({
      next: () => {
        this.nuevoServicio = { descripcion: '', cantidad: 1, precio_unitario: 0 }
        this.refrescar()
      },
      error: (e) => this.error(e),
    })
  }

  quitarServicio(s: ReparacionServicio) {
    this.api.remove(this.base('servicios'), s.id).subscribe({ next: () => this.refrescar(), error: (e) => this.error(e) })
  }

  alElegirInventario(id: string | null) {
    const item = this.inventario.find((i) => i.id === id)
    if (item) {
      this.nuevoRepuesto.descripcion = item.nombre
      this.nuevoRepuesto.precio_unitario = item.precio_venta
    }
  }

  agregarRepuesto() {
    const r = this.nuevoRepuesto
    if (!r.descripcion.trim() || r.cantidad <= 0) return
    this.api.create<ReparacionRepuesto>(this.base('repuestos'), r).subscribe({
      next: () => {
        this.nuevoRepuesto = { inventario_id: null, descripcion: '', cantidad: 1, precio_unitario: 0 }
        this.refrescar()
      },
      error: (e) => this.error(e),
    })
  }

  quitarRepuesto(r: ReparacionRepuesto) {
    this.api.remove(this.base('repuestos'), r.id).subscribe({ next: () => this.refrescar(), error: (e) => this.error(e) })
  }

  guardarDescuento() {
    this.api
      .update<Reparacion>('reparaciones', this.reparacion!.id, { descuento: Number(this.descuento) || 0 })
      .subscribe({ next: () => this.refrescar(), error: (e) => this.error(e) })
  }

  cerrar() {
    this.ref.close(this.cambios)
  }

  private error(e: any) {
    this.guardando = false
    this.snack.open(e?.error?.error ?? 'Ocurrió un error', 'Cerrar', { duration: 3500 })
  }
}
