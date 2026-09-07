import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Cita } from '../../core/models/models'

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class CitasComponent {
  config: EntityConfig<Cita> = {
    resource: 'citas',
    titulo: 'Agenda',
    tituloSingular: 'cita',
    columns: [
      { key: 'fecha_hora', label: 'Fecha y hora' },
      { key: 'motivo', label: 'Motivo' },
      { key: 'duracion_min', label: 'Duración (min)' },
      { key: 'estado', label: 'Estado' },
    ],
    fields: [
      { key: 'cliente_id', label: 'ID Cliente', type: 'text' },
      { key: 'vehiculo_id', label: 'ID Vehículo', type: 'text' },
      { key: 'mecanico_id', label: 'ID Mecánico', type: 'text' },
      { key: 'fecha_hora', label: 'Fecha y hora', type: 'datetime-local', required: true },
      { key: 'duracion_min', label: 'Duración (min)', type: 'number' },
      { key: 'motivo', label: 'Motivo', type: 'text', required: true },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'programada', label: 'Programada' },
          { value: 'confirmada', label: 'Confirmada' },
          { value: 'completada', label: 'Completada' },
          { value: 'cancelada', label: 'Cancelada' },
        ],
      },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    defaultValue: { duracion_min: 30, estado: 'programada' },
  }
}
