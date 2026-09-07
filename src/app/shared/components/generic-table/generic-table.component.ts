import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ColumnConfig } from '../../config/field-config'

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="pr-toolbar">
      <div>
        <h1 class="pr-title">{{ titulo }}</h1>
        <p class="pr-subtitle">{{ data.length }} registro(s)</p>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <mat-form-field appearance="outline" style="width: 240px;" subscriptSizing="dynamic">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="filtro" (ngModelChange)="filtroCambio.emit($event)" />
        </mat-form-field>
        <button mat-raised-button class="pr-btn-gold" (click)="agregar.emit()">
          <mat-icon>add</mat-icon>
          Nuevo
        </button>
      </div>
    </div>

    <div class="pr-card">
      <div *ngIf="loading" style="display:flex; justify-content:center; padding: 40px;">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <div *ngIf="!loading && data.length === 0" style="text-align:center; padding: 40px; color:#9ca3af;">
        No hay registros para mostrar.
      </div>

      <table mat-table [dataSource]="data" *ngIf="!loading && data.length > 0" style="width:100%;">
        <ng-container *ngFor="let col of columns" [matColumnDef]="col.key">
          <th mat-header-cell *matHeaderCellDef>{{ col.label }}</th>
          <td mat-cell *matCellDef="let row">{{ col.format ? col.format(row[col.key], row) : row[col.key] }}</td>
        </ng-container>

        <ng-container matColumnDef="__acciones">
          <th mat-header-cell *matHeaderCellDef style="text-align:right;">Acciones</th>
          <td mat-cell *matCellDef="let row" style="text-align:right;">
            <button mat-icon-button matTooltip="Editar" (click)="editar.emit(row)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Eliminar" color="warn" (click)="eliminar.emit(row)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnasConAcciones"></tr>
        <tr mat-row *matRowDef="let row; columns: columnasConAcciones"></tr>
      </table>
    </div>
  `,
})
export class GenericTableComponent implements OnChanges {
  @Input() titulo = ''
  @Input() columns: ColumnConfig[] = []
  @Input() data: any[] = []
  @Input() loading = false

  @Output() agregar = new EventEmitter<void>()
  @Output() editar = new EventEmitter<any>()
  @Output() eliminar = new EventEmitter<any>()
  @Output() filtroCambio = new EventEmitter<string>()

  filtro = ''
  columnasConAcciones: string[] = []

  ngOnChanges(): void {
    this.columnasConAcciones = [...this.columns.map((c) => c.key), '__acciones']
  }
}
