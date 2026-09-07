import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { filter, map, take } from 'rxjs'
import { AuthService } from '../services/auth.service'

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  return auth.loading$.pipe(
    filter((loading) => !loading),
    take(1),
    map(() => (auth.user$.value ? true : router.createUrlTree(['/login'])))
  )
}
