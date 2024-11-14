import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavPanelItem } from 'shared/businessobjects';
import { EmpPermission, fxCredential } from 'shared/enitites';
import { AppPreloadService } from 'shared/services';
import { NavigationService } from '../../../services';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
})

export class SideMenuComponent implements OnInit {
  @Input() user: any;
  public navList!: NavPanelItem[];
  menuItems: any = [];

  public fxCredentials!: fxCredential;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.functionForListeners(window.screen.width)
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: any) {
    this.functionForListeners(window.screen.width)
  }

  constructor(private navigationService: NavigationService, private router: Router, private appPreloadService: AppPreloadService) {
  }

  ngOnInit(): void {
    this.defaultMethodsLoad();
  }

  public defaultMethodsLoad() {
    this.setUserData();
    this.setMenuByPermission();
    this.loadScripts();
  }

  public setUserData() {
    if (sessionStorage.getItem("fxCredentials"))
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
  }

  setMenuByPermission() {
    let permissions = sessionStorage.getItem("userPermission");
    if (permissions) {
      this.navList = this.navigationService.getNavPanelItems();
      let data = JSON.parse(permissions) as EmpPermission;
      if (data && data.navGroups && data.navItems)
        this.bindMenuByPermission(data);
    }
  }

  public bindMenuByPermission(data: EmpPermission) {
    this.menuItems = [];

    //Init Dashboard
    this.menuItems.push({ menuName: 'Dashboard', menuUrl: "/dashboard", menuImage: "dashboard", subMenu: [], expand: false });

    this.navList.forEach(nav => {
      let menuGroup: any;

      let userRight = data.navGroups.find((c: any) => c.name == nav.name);
      if (userRight) {
        menuGroup = { menuName: userRight.name, menuUrl: nav.path, menuImage: nav.icon, expand: false, subMenu: [] };

        if (nav.items && nav.items.length > 0) {
          nav.items.forEach(subNav => {
            let userRightItems = data.navItems.find((c: any) => c.name == subNav.name);

            if (userRightItems) {
              let menuItem: any;
              menuItem = { subMenuName: userRightItems.name, subMenuUrl: subNav.path, subMenuImage: subNav.icon, expand: false };

              menuGroup.subMenu.push(menuItem);
            }
          });
        }

        this.menuItems.push(menuGroup);
      }
    });
    this.activeRouteCollapse();
  }

  public activeRouteCollapse() {
    let activePage = this.router.url;
    let index = this.menuItems.findIndex((c: any) => c.subMenu.map((d: any) => d.subMenuUrl.split("/")[1]).includes(activePage.split("/")[1]))
    if (index > -1) {
      this.menuItems[index].expand = true;
    }
  }

  functionForListeners(windowlight: any) {
    if (windowlight < 991) {
      document.body.classList.add('active')
    }
    else {
      document.body.classList.remove('active')
    }
  }

  loadScripts() {
    let documentSideBar: any = document;

    // left panel open-close
    documentSideBar.querySelector(".sidebar_toggle").addEventListener("click", function () {
      documentSideBar.body.classList.toggle("active");
    });
  }

  toggleClass(i: any) {
    for (let index = 0; index < this.menuItems.length; index++) {
      const element = this.menuItems[index];
      if (index != i)
        element.expand = false;
    }
    this.menuItems[i].expand = !this.menuItems[i].expand;
    return false;
  }

  onRightClick(item: any) {
    this.router.navigate([]).then(result => { window.open(item.menuUrl, '_blank'); });
    return false;
  }

  onSubRightClick(item: any) {
    this.router.navigate([]).then(result => { window.open(item.subMenuUrl, '_blank'); });
    return false;
  }

}