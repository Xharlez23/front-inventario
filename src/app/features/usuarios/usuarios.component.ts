import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ApiService } from '../../core/services/api.service'
import { AuthService } from '../../core/services/auth.service'
import { Perfil, Rol } from '../../core/models/models'

const ROLES: { value: Rol; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'mecanico', label: 'Mecánico' },
  { value: 'recepcionista', label: 'Recepcionista' },
]

/* ---------------------------- Diálogo crear / editar ---------------------------- */
@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.usuario ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="nombre" />
          <mat-error>El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Correo (para iniciar sesión)</mat-label>
          <input matInput type="email" formControlName="email" />
          <mat-error>Correo no válido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="!data.usuario">
          <mat-label>Contraseña inicial</mat-label>
          <input matInput [type]="ocultar ? 'password' : 'text'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" (click)="ocultar = !ocultar">
            <mat-icon>{{ ocultar ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-hint>Mínimo 6 caracteres. Compártela con la persona.</mat-hint>
          <mat-error>Mínimo 6 caracteres</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol">
            <mat-option *ngFor="let r of roles" [value]="r.value">{{ r.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-slide-toggle formControlName="activo" *ngIf="data.usuario">Usuario activo</mat-slide-toggle>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close(false)">Cancelar</button>
        <button mat-raised-button class="pr-btn-gold" type="submit" [disabled]="form.invalid || guardando">
          {{ data.usuario ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`.contenido { display: flex; flex-direction: column; min-width: min(420px, 85vw); padding-top: 8px !important; }`],
})
export class UsuarioDialogComponent {
  private fb = inject(FormBuilder)
  private api = inject(ApiService)
  private snack = inject(MatSnackBar)
  ref = inject(MatDialogRef<UsuarioDialogComponent, boolean>)
  data = inject<{ usuario: Perfil | null }>(MAT_DIALOG_DATA)

  roles = ROLES
  ocultar = true
  guardando = false

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    rol: ['mecanico' as Rol],
    activo: [true],
  })

  constructor() {
    const u = this.data.usuario
    if (u) {
      this.form.patchValue({ nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo })
      this.form.controls.email.disable() // el correo no se cambia
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)])
    }
  }

  guardar() {
    if (this.form.invalid) return
    const f = this.form.getRawValue()
    this.guardando = true

    const peticion = this.data.usuario
      ? this.api.update<Perfil>('auth/usuarios', this.data.usuario.id, {
          nombre: f.nombre!.trim(),
          rol: f.rol!,
          activo: f.activo!,
        })
      : this.api.create<Perfil>('auth/usuarios', {
          nombre: f.nombre!.trim(),
          email: f.email!.trim(),
          password: f.password!,
          rol: f.rol!,
        } as any)

    peticion.subscribe({
      next: () => {
        this.snack.open('Usuario guardado', 'Cerrar', { duration: 2000 })
        this.ref.close(true)
      },
      error: (e) => {
        this.guardando = false
        this.snack.open(e?.error?.error ?? 'No se pudo guardar', 'Cerrar', { duration: 4000 })
      },
    })
  }
}

/* ---------------------------------- Pantalla ---------------------------------- */
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="pr-page">
      <div class="pr-toolbar">
        <div>
          <h1 class="pr-title">Usuarios</h1>
          <p class="pr-subtitle">Quién puede entrar al sistema y con qué rol</p>
        </div>
        <button mat-raised-button class="pr-btn-gold" (click)="abrir(null)">
          <mat-icon>person_add</mat-icon> Nuevo usuario
        </button>
      </div>

      <div class="pr-card">
        <div *ngIf="cargando" style="display:flex; justify-content:center; padding:40px;">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <div style="overflow-x:auto;">
          <table mat-table [dataSource]="usuarios" *ngIf="!cargando" style="width:100%;">
            <ng-container matColumnDef="usuario">
              <th mat-header-cell *matHeaderCellDef>Usuario</th>
              <td mat-cell *matCellDef="let u">
                <div class="celda-usuario">
                  <div class="avatar">{{ u.nombre.charAt(0).toUpperCase() }}</div>
                  <div>
                    <strong>{{ u.nombre }}</strong>
                    <span class="yo" *ngIf="esYo(u)">tú</span>
                    <div class="email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="rol">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let u"><span class="chip" [ngClass]="u.rol">{{ rolLabel(u.rol) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let u">
                <span class="estado" [class.off]="!u.activo">{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let u" style="text-align:right; white-space:nowrap;">
                <button mat-icon-button matTooltip="Editar" (click)="abrir(u)"><mat-icon>edit</mat-icon></button>
                <button
                  mat-icon-button
                  [matTooltip]="u.activo ? 'Desactivar' : 'Reactivar'"
                  [disabled]="esYo(u)"
                  (click)="cambiarEstado(u)"
                >
                  <mat-icon>{{ u.activo ? 'person_off' : 'restore' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas" [class.fila-off]="!row.activo"></tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .celda-usuario { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
      .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--pr-navy); color: var(--pr-gold); display: flex; align-items: center; justify-content: center; font-weight: 700; }
      .email { font-size: 12px; color: #6b7280; }
      .yo { margin-left: 6px; font-size: 10px; background: #e5e7eb; padding: 1px 6px; border-radius: 99px; }
      .chip { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
      .chip.admin { background: rgba(13, 27, 62, 0.1); color: var(--pr-navy); }
      .chip.mecanico { background: rgba(217, 119, 6, 0.15); color: #b45309; }
      .chip.recepcionista { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }
      .estado { font-size: 12px; font-weight: 600; color: #047857; }
      .estado.off { color: #b91c1c; }
      .fila-off { opacity: 0.55; }
    `,
  ],
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService)
  private auth = inject(AuthService)
  private dialog = inject(MatDialog)
  private snack = inject(MatSnackBar)

  columnas = ['usuario', 'rol', 'estado', 'acciones']
  cargando = true
  usuarios: Perfil[] = []

  ngOnInit() {
    this.cargar()
  }

  cargar() {
    this.cargando = true
    this.api.list<Perfil>('auth/usuarios').subscribe({
      next: (d) => {
        this.usuarios = d
        this.cargando = false
      },
      error: () => {
        this.cargando = false
        this.snack.open('No se pudieron cargar los usuarios', 'Cerrar', { duration: 3000 })
      },
    })
  }

  rolLabel(rol: Rol) {
    return ROLES.find((r) => r.value === rol)?.label ?? rol
  }

  esYo(u: Perfil) {
    return u.id === this.auth.perfilActual?.id
  }

  abrir(usuario: Perfil | null) {
    this.dialog
      .open(UsuarioDialogComponent, { data: { usuario }, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((ok) => ok && this.cargar())
  }

  cambiarEstado(u: Perfil) {
    this.api.update<Perfil>('auth/usuarios', u.id, { activo: !u.activo }).subscribe({
      next: () => this.cargar(),
      error: (e) => this.snack.open(e?.error?.error ?? 'No se pudo actualizar', 'Cerrar', { duration: 3500 }),
    })
  }
}