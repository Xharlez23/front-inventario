import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { AuthService } from '../../core/services/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="contenedor">
      <div class="tarjeta">
        <div class="logo">🔧</div>
        <h1 class="titulo">Punto Renault</h1>
        <p class="subtitulo">Ingresa a tu cuenta</p>

        <form [formGroup]="form" (ngSubmit)="ingresar()">
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Correo</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <p *ngIf="error" class="error">{{ error }}</p>

          <button
            mat-raised-button
            class="pr-btn-gold"
            style="width:100%; margin-top: 8px;"
            type="submit"
            [disabled]="form.invalid || cargando"
          >
            <mat-spinner *ngIf="cargando" diameter="18" style="display:inline-block; margin-right:8px;"></mat-spinner>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .contenedor {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--pr-navy);
        padding: 16px;
      }
      .tarjeta {
        background: white;
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 360px;
        text-align: center;
      }
      .logo {
        width: 56px;
        height: 56px;
        background: var(--pr-gold);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 26px;
      }
      .titulo {
        margin: 0;
        color: var(--pr-navy);
        font-size: 20px;
        font-weight: 700;
      }
      .subtitulo {
        color: #6b7280;
        font-size: 13px;
        margin: 4px 0 24px;
      }
      .error {
        color: #dc2626;
        font-size: 13px;
        text-align: left;
        margin: -4px 0 8px;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private auth = inject(AuthService)
  private router = inject(Router)

  cargando = false
  error = ''

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  async ingresar() {
    if (this.form.invalid) return
    this.cargando = true
    this.error = ''
    try {
      const { email, password } = this.form.value
      await this.auth.signIn(email!, password!)
      this.router.navigate(['/dashboard'])
    } catch (err: any) {
      this.error = 'Correo o contraseña incorrectos'
    } finally {
      this.cargando = false
    }
  }
}
