import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.scss'],
})
export class SidebarRightComponent implements OnInit {
  currentUser: any;
  multiRoles = false;
  transform = false;
  currentRole: any;
  organisation: any;
  isRPI = false;

  // New properties for modern sidebar
  isCollapsed = false;
  isSidebarOpen = false;
  pendingRequests = 0; // Can be updated with actual data

  constructor(
    public service: UserService,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = localStorage.getItem('curUser');
    this.currentUser = JSON.parse(this.currentUser);
    this.organisation = localStorage.getItem('organisation');
    this.organisation = JSON.parse(this.organisation);

    if (this.currentUser.roles.length > 1) {
      this.currentRole = 'ROLE_ADMIN';
    } else {
      this.currentRole = this.currentUser.roles[0].name;
    }

    // Check for saved collapsed state
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      this.isCollapsed = savedCollapsed === 'true';
      this.updateBodyClass();
    }

    // Auto-collapse on smaller screens
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
    if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
      this.isCollapsed = true;
      this.updateBodyClass();
    }
  }

  private updateBodyClass(): void {
    if (this.isCollapsed) {
      this.renderer.addClass(document.body, 'sidebar-collapsed');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-collapsed');
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
    this.updateBodyClass();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getRoleDisplayName(): string {
    const roleMap: { [key: string]: string } = {
      ROLE_ADMIN: 'Administrateur',
      ROLE_QUALITY_DIRECTOR: 'Directeur Qualité',
      ROLE_DG: 'Direction Générale',
      ROLE_DRH: 'Ressources Humaines',
      ROLE_USER: 'Utilisateur',
      ROLE_AUDITOR: 'Auditeur',
      ROLE_MANAGER: 'Manager',
    };
    return roleMap[this.currentRole] || 'Utilisateur';
  }

  isUserRouteActive(): boolean {
    return this.router.url.startsWith('/user');
  }

  problemListView(): any {
    const current = document.getElementById('submenu2');
    const current1 = document.getElementById('icon1');

    if (current.style.display === 'none') {
      current.style.display = 'block';
      if (this.transform === true) {
        current1.style.transform = 'rotate(0deg)';
      }
    } else {
      current.style.display = 'none';
      current1.style.transform = 'rotate(90deg)';
    }
    this.transform = true;
  }

  productListView(): any {
    const current = document.getElementById('submenu1');
    const current1 = document.getElementById('icon');

    if (current.style.display === 'none') {
      current.style.display = 'block';
      if (this.transform === true) {
        current1.style.transform = 'rotate(0deg)';
      }
    } else {
      current.style.display = 'none';
      current1.style.transform = 'rotate(90deg)';
    }
    this.transform = true;
  }

  logout(): void {
    // Clear authentication token
    localStorage.removeItem('token');

    // Navigate to login page
    this.router.navigate(['/user/login']);
  }
}
