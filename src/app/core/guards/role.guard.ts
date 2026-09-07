import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { filter, map, take } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { Rol } from '../models/models'

// Uso: { path: 'x', canActivate: [roleGuard(['admin'])], ... }
export function roleGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)

    return auth.loading$.pipe(
      filter((loading) => !loading),
      take(1),
      map(() => {
        const rol = auth.perfilActual?.rol
        if (rol && rolesPermitidos.includes(rol)) return true
        return router.createUrlTree(['/dashboard'])
      })
    )
  }
}
