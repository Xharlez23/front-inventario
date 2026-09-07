import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { initializeApp } from 'firebase/app'
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { environment } from '../../../environments/environment'
import { Perfil } from '../models/models'

const firebaseApp = initializeApp(environment.firebase)

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  private auth: Auth = getAuth(firebaseApp)

  user$ = new BehaviorSubject<User | null>(null)
  perfil$ = new BehaviorSubject<Perfil | null>(null)
  loading$ = new BehaviorSubject<boolean>(true)

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      this.user$.next(user)
      if (user) {
        try {
          const perfil = await firstValueFrom(this.http.get<Perfil>(`${environment.apiUrl}/auth/me`))
          this.perfil$.next(perfil)
        } catch {
          this.perfil$.next(null)
        }
      } else {
        this.perfil$.next(null)
      }
      this.loading$.next(false)
    })
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password)
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth)
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser
    if (!user) return null
    return user.getIdToken()
  }

  get perfilActual(): Perfil | null {
    return this.perfil$.value
  }

  get esAdmin(): boolean {
    return this.perfilActual?.rol === 'admin'
  }

  get esMecanico(): boolean {
    return this.perfilActual?.rol === 'mecanico'
  }
}
