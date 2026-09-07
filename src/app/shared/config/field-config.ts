export interface ColumnConfig<T = any> {
  key: keyof T & string
  label: string
  /** Funcion opcional para transformar el valor mostrado en la tabla */
  format?: (value: any, row: T) => string
}

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date' | 'datetime-local'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: SelectOption[]
  placeholder?: string
}

export interface EntityConfig<T = any> {
  resource: string
  titulo: string
  tituloSingular: string
  columns: ColumnConfig<T>[]
  fields: FieldConfig[]
  defaultValue: Partial<T>
}
