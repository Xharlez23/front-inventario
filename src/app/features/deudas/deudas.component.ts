import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Deuda } from '../../core/models/models'

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class DeudasComponent {
  config: EntityConfig<Deuda> = {
    resource: 'deudas',
    titulo: 'Deudas',
    tituloSingular: 'deuda',
    columns: [
      { key: 'tipo', label: 'Tipo' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'monto_total', label: 'Monto total', format: (v) => `$${Number(v ?? 0).toLocaleString('es-CO')}` },
      { key: 'monto_pendiente', label: 'Pendiente', format: (v) => `$${Number(v ?? 0).toLocaleString('es-CO')}` },
      { key: 'estado', label: 'Estado' },
      { key: 'fecha_vence', label: 'Vence' },
    ],
    fields: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'cobrar', label: 'Por cobrar' },
          { value: 'pagar', label: 'Por pagar' },
        ],
      },
      { key: 'cliente_id', label: 'ID Cliente', type: 'text' },
      { key: 'proveedor_id', label: 'ID Proveedor', type: 'text' },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'monto_total', label: 'Monto total', type: 'number', required: true },
      { key: 'monto_pagado', label: 'Monto pagado', type: 'number' },
      { key: 'fecha_vence', label: 'Fecha de vencimiento', type: 'date' },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'pendiente', label: 'Pendiente' },
          { value: 'parcial', label: 'Parcial' },
          { value: 'pagado', label: 'Pagado' },
          { value: 'anulado', label: 'Anulado' },
        ],
      },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    defaultValue: { tipo: 'cobrar', estado: 'pendiente', monto_pagado: 0 },
  }
}
