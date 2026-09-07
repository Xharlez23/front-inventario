import { Component, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { FieldConfig } from '../../config/field-config'

export interface EntityFormDialogData {
  titulo: string
  fields: FieldConfig[]
  value: Record<string, any>
}

@Component({
  selector: 'app-entity-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="grid">
        <ng-container *ngFor="let f of data.fields">
          <mat-checkbox *ngIf="f.type === 'checkbox'" [formControlName]="f.key">
            {{ f.label }}
          </mat-checkbox>

          <mat-form-field *ngIf="f.type === 'select'" appearance="outline">
            <mat-label>{{ f.label }}</mat-label>
            <mat-select [formControlName]="f.key">
              <mat-option *ngFor="let opt of f.options" [value]="opt.value">{{ opt.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field *ngIf="f.type === 'textarea'" appearance="outline">
            <mat-label>{{ f.label }}</mat-label>
            <textarea matInput [formControlName]="f.key" rows="3" [placeholder]="f.placeholder ?? ''"></textarea>
          </mat-form-field>

          <mat-form-field
            *ngIf="!['checkbox', 'select', 'textarea'].includes(f.type)"
            appearance="outline"
          >
            <mat-label>{{ f.label }}</mat-label>
            <input
              matInput
              [type]="f.type"
              [formControlName]="f.key"
              [placeholder]="f.placeholder ?? ''"
            />
          </mat-form-field>
        </ng-container>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close()">Cancelar</button>
        <button mat-raised-button class="pr-btn-gold" color="primary" type="submit" [disabled]="form.invalid">
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 16px;
        min-width: 420px;
        max-width: 640px;
      }
      mat-form-field {
        width: 100%;
      }
      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
          min-width: 0;
        }
      }
    `,
  ],
})
export class EntityFormDialogComponent {
  form: FormGroup

  constructor(
    public ref: MatDialogRef<EntityFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EntityFormDialogData,
    private fb: FormBuilder
  ) {
    const group: Record<string, any> = {}
    for (const field of data.fields) {
      const validators = field.required ? [Validators.required] : []
      group[field.key] = [data.value?.[field.key] ?? (field.type === 'checkbox' ? false : ''), validators]
    }
    this.form = this.fb.group(group)
  }

  guardar() {
    if (this.form.invalid) return
    this.ref.close(this.form.value)
  }
}
