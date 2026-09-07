import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ApiService } from '../../../core/services/api.service'
import { EntityConfig } from '../../config/field-config'
import { GenericTableComponent } from '../generic-table/generic-table.component'
import { EntityFormDialogComponent } from '../entity-form-dialog/entity-form-dialog.component'
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'

@Component({
  selector: 'app-entity-crud-page',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  template: `
    <div class="pr-page">
      <app-generic-table
        [titulo]="config.titulo"
        [columns]="config.columns"
        [data]="datosFiltrados"
        [loading]="cargando"
        (agregar)="abrirFormulario()"
        (editar)="abrirFormulario($event)"
        (eliminar)="eliminar($event)"
        (filtroCambio)="filtrar($event)"
      ></app-generic-table>
    </div>
  `,
})
export class EntityCrudPageComponent implements OnInit {
  @Input() config!: EntityConfig

  private api = inject(ApiService)
  private dialog = inject(MatDialog)
  private snack = inject(MatSnackBar)

  cargando = true
  datos: any[] = []
  datosFiltrados: any[] = []

  ngOnInit() {
    this.cargar()
  }

  cargar() {
    this.cargando = true
    this.api.list(this.config.resource).subscribe({
      next: (data) => {
        this.datos = data
        this.datosFiltrados = data
        this.cargando = false
      },
      error: () => {
        this.cargando = false
        this.snack.open('No se pudieron cargar los datos', 'Cerrar', { duration: 3000 })
      },
    })
  }

  filtrar(texto: string) {
    const q = texto.toLowerCase().trim()
    this.datosFiltrados = !q
      ? this.datos
      : this.datos.filter((item) => JSON.stringify(item).toLowerCase().includes(q))
  }

  abrirFormulario(item?: any) {
    const ref = this.dialog.open(EntityFormDialogComponent, {
      data: {
        titulo: item ? `Editar ${this.config.tituloSingular}` : `Nuevo ${this.config.tituloSingular}`,
        fields: this.config.fields,
        value: item ?? this.config.defaultValue,
      },
    })

    ref.afterClosed().subscribe((valor) => {
      if (!valor) return
      const peticion = item
        ? this.api.update(this.config.resource, item.id, valor)
        : this.api.create(this.config.resource, valor)

      peticion.subscribe({
        next: () => {
          this.snack.open('Guardado correctamente', 'Cerrar', { duration: 2000 })
          this.cargar()
        },
        error: (err) => {
          this.snack.open(err?.error?.error ?? 'Ocurrió un error al guardar', 'Cerrar', { duration: 3000 })
        },
      })
    })
  }

  eliminar(item: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: `Eliminar ${this.config.tituloSingular}`,
        mensaje: `¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.`,
      },
    })

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return
      this.api.remove(this.config.resource, item.id).subscribe({
        next: () => {
          this.snack.open('Eliminado correctamente', 'Cerrar', { duration: 2000 })
          this.cargar()
        },
        error: () => {
          this.snack.open('No se pudo eliminar el registro', 'Cerrar', { duration: 3000 })
        },
      })
    })
  }
}
