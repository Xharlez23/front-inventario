import { Component } from '@angular/core'
import { EntityCrudPageComponent } from '../../shared/components/entity-crud-page/entity-crud-page.component'
import { EntityConfig } from '../../shared/config/field-config'
import { Cliente } from '../../core/models/models'

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [EntityCrudPageComponent],
  template: `<app-entity-crud-page [config]="config"></app-entity-crud-page>`,
})
export class ClientesComponent {
  config: EntityConfig<Cliente> = {
    resource: 'clientes',
    titulo: 'Clientes',
    tituloSingular: 'cliente',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'identificacion', label: 'Identificación' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'email', label: 'Email' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'tipo', label: 'Tipo' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'identificacion', label: 'Identificación', type: 'text' },
      { key: 'telefono', label: 'Teléfono', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'direccion', label: 'Dirección', type: 'text' },
      { key: 'ciudad', label: 'Ciudad', type: 'text' },
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { value: 'natural', label: 'Persona natural' },
          { value: 'empresa', label: 'Empresa' },
        ],
      },
      { key: 'notas', label: 'Notas', type: 'textarea' },
      { key: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    defaultValue: { tipo: 'natural', activo: true },
  }
}
