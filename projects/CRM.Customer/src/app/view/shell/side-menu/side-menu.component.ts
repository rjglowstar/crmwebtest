import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-side-menu',
  templateUrl: './side-menu.component.html',
  styles: [
  ]
})
export class SideMenuComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.functionForListeners(window.screen.width)
  }

  @HostListener('window:load', ['$event'])
  onLoad(event: any) {
    this.functionForListeners(window.screen.width)
  }

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.defaultMethodsLoad();
  }

  public defaultMethodsLoad() {
    //this.loadScripts();
  }

  loadScripts() {
    let documentSideBar: any = document;

    // left panel open-close
    documentSideBar.querySelector(".l-click").addEventListener("click", function () {
      documentSideBar.body.classList.toggle("active");
    });

    // Mobile top menu navigation
    documentSideBar.querySelector(".hum-menu").addEventListener("click", function () {
      if (documentSideBar.querySelector(".nav-right").classList.contains("active")) {
        documentSideBar.querySelector(".nav-right").classList.remove("active");
        documentSideBar.querySelector(".hum-menu").classList.remove("active");
      } else {
        documentSideBar.querySelector(".nav-right").classList.add("active");
        documentSideBar.querySelector(".hum-menu").classList.add("active");
      }
    });

  }

  functionForListeners(windowlight: any) {
    if (windowlight < 991) {
      document.body.classList.add('active')
    }
    else {
      document.body.classList.remove('active')
    }
  }

}
