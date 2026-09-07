import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Reparacion } from '../../core/models/models'

@Component({
  selector: 'app-reparaciones',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class ReparacionesComponent {
  config: EntityConfig<Reparacion> = {
    resource: 'reparaciones',
    titulo: 'Reparaciones',
    tituloSingular: 'orden de reparación',
    columns: [
      { key: 'numero_orden', label: 'N° Orden' },
      { key: 'vehiculo_id', label: 'Vehículo' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'estado', label: 'Estado' },
      { key: 'fecha_ingreso', label: 'Ingreso' },
      { key: 'total', label: 'Total', format: (v) => `$${Number(v ?? 0).toLocaleString('es-CO')}` },
    ],
    fields: [
      { key: 'vehiculo_id', label: 'ID Vehículo', type: 'text', required: true },
      { key: 'mecanico_id', label: 'ID Mecánico', type: 'text' },
      { key: 'tecnico_nombre', label: 'Nombre del técnico', type: 'text' },
      { key: 'fecha_ingreso', label: 'Fecha de ingreso', type: 'date', required: true },
      { key: 'fecha_estimada', label: 'Fecha estimada de entrega', type: 'date' },
      { key: 'fecha_entrega', label: 'Fecha real de entrega', type: 'date' },
      { key: 'kilometraje', label: 'Kilometraje', type: 'number' },
      { key: 'descripcion', label: 'Descripción del trabajo', type: 'textarea', required: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'recibido', label: 'Recibido' },
          { value: 'diagnostico', label: 'En diagnóstico' },
          { value: 'en_proceso', label: 'En proceso' },
          { value: 'esperando_repuesto', label: 'Esperando repuesto' },
          { value: 'listo', label: 'Listo' },
          { value: 'entregado', label: 'Entregado' },
          { value: 'cancelado', label: 'Cancelado' },
        ],
      },
      { key: 'subtotal', label: 'Subtotal', type: 'number' },
      { key: 'descuento', label: 'Descuento', type: 'number' },
      { key: 'total', label: 'Total', type: 'number' },
    ],
    defaultValue: {
      estado: 'recibido',
      fecha_ingreso: new Date().toISOString().slice(0, 10),
      subtotal: 0,
      descuento: 0,
      total: 0,
    },
  }
}
