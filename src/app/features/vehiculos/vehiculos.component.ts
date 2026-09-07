import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Vehiculo } from '../../core/models/models'

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class VehiculosComponent {
  config: EntityConfig<Vehiculo> = {
    resource: 'vehiculos',
    titulo: 'Vehículos',
    tituloSingular: 'vehículo',
    columns: [
      { key: 'placa', label: 'Placa' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'anio', label: 'Año' },
      { key: 'color', label: 'Color' },
      { key: 'kilometraje', label: 'Kilometraje' },
    ],
    fields: [
      { key: 'placa', label: 'Placa', type: 'text', required: true },
      { key: 'cliente_id', label: 'ID Cliente', type: 'text', placeholder: 'ID del cliente propietario' },
      { key: 'marca', label: 'Marca', type: 'text', required: true },
      { key: 'modelo', label: 'Modelo', type: 'text' },
      { key: 'anio', label: 'Año', type: 'number' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'kilometraje', label: 'Kilometraje', type: 'number' },
      { key: 'vin', label: 'VIN', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
      { key: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    defaultValue: { activo: true },
  }
}
