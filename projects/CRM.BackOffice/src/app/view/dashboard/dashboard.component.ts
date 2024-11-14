import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement> = null as any;

  constructor() {
  }

  ngOnInit(): void { }
}
