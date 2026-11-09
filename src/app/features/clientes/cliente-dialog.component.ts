import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ApiService } from '../../core/services/api.service'
import { Cliente } from '../../core/models/models'

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.cliente ? 'Editar cliente' : 'Nuevo cliente' }}</h2>

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-button-toggle-group formControlName="tipo" class="tipo">
          <mat-button-toggle value="natural"><mat-icon>person</mat-icon> Persona</mat-button-toggle>
          <mat-button-toggle value="empresa"><mat-icon>business</mat-icon> Empresa</mat-button-toggle>
        </mat-button-toggle-group>

        <div class="grid">
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ esEmpresa ? 'Razón social' : 'Nombre completo' }}</mat-label>
            <input matInput formControlName="nombre" />
            <mat-error>Este campo es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ esEmpresa ? 'NIT' : 'Cédula' }}</mat-label>
            <input matInput formControlName="identificacion" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" />
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-icon matSuffix>mail</mat-icon>
            <mat-error>Correo no válido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Ciudad</mat-label>
            <input matInput formControlName="ciudad" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="direccion" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notas</mat-label>
            <textarea matInput rows="2" formControlName="notas"></textarea>
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="activo">Cliente activo</mat-slide-toggle>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close(false)">Cancelar</button>
        <button mat-raised-button class="pr-btn-gold" type="submit" [disabled]="form.invalid || guardando">
          {{ data.cliente ? 'Guardar cambios' : 'Crear cliente' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .contenido { min-width: min(520px, 85vw); }
      .tipo { margin: 8px 0 20px; width: 100%; }
      .tipo mat-button-toggle { flex: 1; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
      .full { grid-column: 1 / -1; }
      @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ClienteDialogComponent {
  private fb = inject(FormBuilder)
  private api = inject(ApiService)
  private snack = inject(MatSnackBar)
  ref = inject(MatDialogRef<ClienteDialogComponent, boolean>)
  data = inject<{ cliente: Cliente | null }>(MAT_DIALOG_DATA)

  guardando = false

  form = this.fb.group({
    tipo: ['natural' as 'natural' | 'empresa'],
    nombre: ['', Validators.required],
    identificacion: [''],
    telefono: [''],
    email: ['', Validators.email],
    ciudad: [''],
    direccion: [''],
    notas: [''],
    activo: [true],
  })

  constructor() {
    const c = this.data.cliente
    if (c) {
      this.form.patchValue({
        tipo: c.tipo,
        nombre: c.nombre,
        identificacion: c.identificacion ?? '',
        telefono: c.telefono ?? '',
        email: c.email ?? '',
        ciudad: c.ciudad ?? '',
        direccion: c.direccion ?? '',
        notas: c.notas ?? '',
        activo: c.activo,
      })
    }
  }

  get esEmpresa() {
    return this.form.value.tipo === 'empresa'
  }

  guardar() {
    if (this.form.invalid) return
    const v = this.form.getRawValue()
    const vacioANull = (s: string | null) => (s?.trim() ? s.trim() : null)
    const body: any = {
      tipo: v.tipo,
      nombre: v.nombre!.trim(),
      identificacion: vacioANull(v.identificacion),
      telefono: vacioANull(v.telefono),
      email: vacioANull(v.email),
      ciudad: vacioANull(v.ciudad),
      direccion: vacioANull(v.direccion),
      notas: vacioANull(v.notas),
      activo: v.activo,
    }

    this.guardando = true
    const peticion = this.data.cliente
      ? this.api.update<Cliente>('clientes', this.data.cliente.id, body)
      : this.api.create<Cliente>('clientes', body)

    peticion.subscribe({
      next: () => {
        this.snack.open('Cliente guardado', 'Cerrar', { duration: 2000 })
        this.ref.close(true)
      },
      error: (e) => {
        this.guardando = false
        this.snack.open(e?.error?.error ?? 'No se pudo guardar', 'Cerrar', { duration: 3500 })
      },
    })
  }
}