import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar } from '@angular/material/snack-bar'
import { map, startWith } from 'rxjs'
import { ApiService } from '../../core/services/api.service'
import { Cliente, Vehiculo } from '../../core/models/models'

// El cliente debe elegirse de la lista (o dejarse vacio), no escribirse a mano
function clienteElegido(c: AbstractControl): ValidationErrors | null {
  return typeof c.value === 'string' && c.value.trim() ? { noElegido: true } : null
}

@Component({
  selector: 'app-vehiculo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.vehiculo ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <div class="grid">
          <mat-form-field appearance="outline">
            <mat-label>Placa</mat-label>
            <input matInput formControlName="placa" class="placa-input" maxlength="8" />
            <mat-error>La placa es obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Propietario</mat-label>
            <input matInput formControlName="cliente" [matAutocomplete]="auto" />
            <mat-icon matSuffix>person_search</mat-icon>
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="mostrarCliente">
              <mat-option *ngFor="let c of clientesFiltrados | async" [value]="c">
                {{ c.nombre }} <small *ngIf="c.identificacion">· {{ c.identificacion }}</small>
              </mat-option>
            </mat-autocomplete>
            <mat-hint>Escribe para buscar</mat-hint>
            <mat-error>Elige un cliente de la lista</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Marca</mat-label>
            <input matInput formControlName="marca" />
            <mat-error>La marca es obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Modelo</mat-label>
            <input matInput formControlName="modelo" placeholder="Logan, Duster, Sandero..." />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Año</mat-label>
            <input matInput type="number" formControlName="anio" />
            <mat-error>Año entre 1950 y {{ anioMax }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Color</mat-label>
            <input matInput formControlName="color" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Kilometraje</mat-label>
            <input matInput type="number" formControlName="kilometraje" />
            <span matTextSuffix>km</span>
            <mat-error>No puede ser negativo</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>VIN / Chasis</mat-label>
            <input matInput formControlName="vin" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notas</mat-label>
            <textarea matInput rows="2" formControlName="notas"></textarea>
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="activo">Vehículo activo</mat-slide-toggle>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close(false)">Cancelar</button>
        <button mat-raised-button class="pr-btn-gold" type="submit" [disabled]="form.invalid || guardando">
          {{ data.vehiculo ? 'Guardar cambios' : 'Crear vehículo' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .contenido { min-width: min(560px, 85vw); padding-top: 8px !important; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
      .full { grid-column: 1 / -1; }
      .placa-input { text-transform: uppercase; font-weight: 700; letter-spacing: 2px; }
      @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class VehiculoDialogComponent {
  private fb = inject(FormBuilder)
  private api = inject(ApiService)
  private snack = inject(MatSnackBar)
  ref = inject(MatDialogRef<VehiculoDialogComponent, boolean>)
  data = inject<{ vehiculo: Vehiculo | null; clientes: Cliente[] }>(MAT_DIALOG_DATA)

  guardando = false
  anioMax = new Date().getFullYear() + 1

  form = this.fb.group({
    placa: ['', Validators.required],
    cliente: [null as Cliente | string | null, clienteElegido],
    marca: ['Renault', Validators.required],
    modelo: [''],
    anio: [null as number | null, [Validators.min(1950), Validators.max(this.anioMax)]],
    color: [''],
    kilometraje: [null as number | null, Validators.min(0)],
    vin: [''],
    notas: [''],
    activo: [true],
  })

  clientesFiltrados = this.form.controls.cliente.valueChanges.pipe(
    startWith(null as Cliente | string | null),
    map((v) => (typeof v === 'string' ? v : v?.nombre ?? '').toLowerCase().trim()),
    map((q) =>
      this.data.clientes
        .filter((c) => !q || `${c.nombre} ${c.identificacion ?? ''}`.toLowerCase().includes(q))
        .slice(0, 30)
    )
  )

  mostrarCliente = (c: Cliente | string | null): string => (c && typeof c === 'object' ? c.nombre : '')

  constructor() {
    const v = this.data.vehiculo
    if (v) {
      this.form.patchValue({
        placa: v.placa,
        cliente: this.data.clientes.find((c) => c.id === v.cliente_id) ?? null,
        marca: v.marca,
        modelo: v.modelo ?? '',
        anio: v.anio,
        color: v.color ?? '',
        kilometraje: v.kilometraje,
        vin: v.vin ?? '',
        notas: v.notas ?? '',
        activo: v.activo,
      })
    }
  }

  guardar() {
    if (this.form.invalid) return
    const f = this.form.getRawValue()
    const n = (s: string | null) => (s?.trim() ? s.trim() : null)

    const body: any = {
      placa: f.placa!.trim().toUpperCase().replace(/[\s-]/g, ''),
      cliente_id: f.cliente && typeof f.cliente === 'object' ? f.cliente.id : null,
      marca: f.marca!.trim(),
      modelo: n(f.modelo),
      anio: f.anio ?? null,
      color: n(f.color),
      kilometraje: f.kilometraje ?? null,
      vin: n(f.vin),
      notas: n(f.notas),
      activo: f.activo,
    }

    this.guardando = true
    const peticion = this.data.vehiculo
      ? this.api.update<Vehiculo>('vehiculos', this.data.vehiculo.id, body)
      : this.api.create<Vehiculo>('vehiculos', body)

    peticion.subscribe({
      next: () => {
        this.snack.open('Vehículo guardado', 'Cerrar', { duration: 2000 })
        this.ref.close(true)
      },
      error: (e) => {
        this.guardando = false
        this.snack.open(e?.error?.error ?? 'No se pudo guardar', 'Cerrar', { duration: 4000 })
      },
    })
  }
}