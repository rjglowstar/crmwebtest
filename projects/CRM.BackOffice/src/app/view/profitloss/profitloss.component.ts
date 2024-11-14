import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fxCredential } from 'shared/enitites';

@Component({
  selector: 'app-profitloss',
  templateUrl: './profitloss.component.html',
  styleUrls: ['./profitloss.component.css']
})
export class ProfitlossComponent implements OnInit {

  public filterFlag = false;
  private fxCredential!: fxCredential;

  public isViewButtons: boolean = false;

  constructor(
    private router: Router) { }

  ngOnInit(): void {
    this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

}
