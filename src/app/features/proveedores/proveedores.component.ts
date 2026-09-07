import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Proveedor } from '../../core/models/models'

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class ProveedoresComponent {
  config: EntityConfig<Proveedor> = {
    resource: 'proveedores',
    titulo: 'Proveedores',
    tituloSingular: 'proveedor',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'nit', label: 'NIT' },
      { key: 'contacto', label: 'Contacto' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'ciudad', label: 'Ciudad' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'nit', label: 'NIT', type: 'text' },
      { key: 'contacto', label: 'Persona de contacto', type: 'text' },
      { key: 'telefono', label: 'Teléfono', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'ciudad', label: 'Ciudad', type: 'text' },
      { key: 'direccion', label: 'Dirección', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
      { key: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    defaultValue: { activo: true },
  }
}
