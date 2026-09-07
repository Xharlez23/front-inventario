import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient)
  private base = environment.apiUrl

  list<T>(resource: string, params: Record<string, string> = {}): Observable<T[]> {
    const query = new URLSearchParams(params).toString()
    return this.http.get<T[]>(`${this.base}/${resource}${query ? `?${query}` : ''}`)
  }

  get<T>(resource: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${resource}/${id}`)
  }

  create<T>(resource: string, body: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.base}/${resource}`, body)
  }

  update<T>(resource: string, id: string, body: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.base}/${resource}/${id}`, body)
  }

  remove(resource: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${resource}/${id}`)
  }
}
