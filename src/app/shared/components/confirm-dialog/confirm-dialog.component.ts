import { Component, Inject } from '@angular/core'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'

export interface ConfirmDialogData {
  titulo: string
  mensaje: string
  textoConfirmar?: string
  textoCancelar?: string
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ data.textoCancelar ?? 'Cancelar' }}</button>
      <button mat-raised-button color="warn" (click)="ref.close(true)">
        {{ data.textoConfirmar ?? 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
