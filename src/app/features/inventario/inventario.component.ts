import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Inventario } from '../../core/models/models'

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class InventarioComponent {
  config: EntityConfig<Inventario> = {
    resource: 'inventario',
    titulo: 'Inventario',
    tituloSingular: 'repuesto',
    columns: [
      { key: 'codigo', label: 'Código' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'unidad', label: 'Unidad' },
      { key: 'cantidad', label: 'Cantidad' },
      { key: 'cantidad_minima', label: 'Mínimo' },
      { key: 'precio_venta', label: 'Precio venta', format: (v) => `$${Number(v ?? 0).toLocaleString('es-CO')}` },
    ],
    fields: [
      { key: 'codigo', label: 'Código', type: 'text' },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'textarea' },
      { key: 'unidad', label: 'Unidad', type: 'text', placeholder: 'unidad, litro, caja...' },
      { key: 'cantidad', label: 'Cantidad', type: 'number', required: true },
      { key: 'cantidad_minima', label: 'Cantidad mínima', type: 'number' },
      { key: 'precio_compra', label: 'Precio de compra', type: 'number' },
      { key: 'precio_venta', label: 'Precio de venta', type: 'number' },
      { key: 'proveedor_id', label: 'ID Proveedor', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    defaultValue: { unidad: 'unidad', cantidad: 0, cantidad_minima: 0, precio_compra: 0, precio_venta: 0, activo: true },
  }
}
