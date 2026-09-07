import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { SidebarComponent } from '../sidebar/sidebar.component'

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatIconModule, MatButtonModule, SidebarComponent],
  template: `
    <div class="contenedor">
      <div class="sidebar-desktop">
        <app-sidebar></app-sidebar>
      </div>

      <div class="overlay" *ngIf="sidebarAbierto" (click)="sidebarAbierto = false">
        <div class="sidebar-mobile" (click)="$event.stopPropagation()">
          <app-sidebar (cerrar)="sidebarAbierto = false"></app-sidebar>
        </div>
      </div>

      <div class="main">
        <header class="topbar">
          <button mat-icon-button (click)="sidebarAbierto = true">
            <mat-icon style="color:white">menu</mat-icon>
          </button>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="topbar-icono">🔧</div>
            <span class="topbar-nombre">Punto Renault</span>
          </div>
        </header>

        <main class="pagina">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .contenedor {
        display: flex;
        height: 100vh;
        overflow: hidden;
        background: var(--pr-bg);
      }
      .sidebar-desktop {
        display: none;
        flex-shrink: 0;
      }
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 40;
        display: flex;
      }
      .sidebar-mobile {
        height: 100%;
        z-index: 50;
      }
      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .topbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: var(--pr-navy);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .topbar-icono {
        width: 28px;
        height: 28px;
        background: var(--pr-gold);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      .topbar-nombre {
        color: white;
        font-weight: 600;
        font-size: 14px;
      }
      .pagina {
        flex: 1;
        overflow-y: auto;
      }
      @media (min-width: 900px) {
        .sidebar-desktop {
          display: flex;
        }
        .topbar {
          display: none;
        }
      }
    `,
  ],
})
export class AppLayoutComponent {
  sidebarAbierto = false
}
