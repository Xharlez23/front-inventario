import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { MovimientoCaja } from '../../core/models/models'

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class CajaComponent {
  config: EntityConfig<MovimientoCaja> = {
    resource: 'caja',
    titulo: 'Caja',
    tituloSingular: 'movimiento',
    columns: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'valor', label: 'Valor', format: (v) => `$${Number(v ?? 0).toLocaleString('es-CO')}` },
      { key: 'tipo_pago', label: 'Pago' },
    ],
    fields: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'ingreso', label: 'Ingreso' },
          { value: 'egreso', label: 'Egreso' },
        ],
      },
      {
        key: 'categoria',
        label: 'Categoría',
        type: 'select',
        required: true,
        options: [
          { value: 'servicio', label: 'Servicio' },
          { value: 'repuesto', label: 'Repuesto' },
          { value: 'salario', label: 'Salario' },
          { value: 'arriendo', label: 'Arriendo' },
          { value: 'servicios_publicos', label: 'Servicios públicos' },
          { value: 'compra_inventario', label: 'Compra de inventario' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'valor', label: 'Valor', type: 'number', required: true },
      {
        key: 'tipo_pago',
        label: 'Método de pago',
        type: 'select',
        options: [
          { value: 'efectivo', label: 'Efectivo' },
          { value: 'transferencia', label: 'Transferencia' },
          { value: 'tarjeta', label: 'Tarjeta' },
          { value: 'credito', label: 'Crédito' },
        ],
      },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'reparacion_id', label: 'ID Reparación', type: 'text' },
    ],
    defaultValue: { tipo: 'ingreso', categoria: 'servicio', fecha: new Date().toISOString().slice(0, 10) },
  }
}
