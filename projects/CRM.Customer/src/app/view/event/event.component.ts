import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageEvent } from '../../entities';
import { EventService } from '../../services';
import { AppPreloadService } from 'shared/services';
import { fxCredential } from 'shared/enitites';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit {


  public eventObj: ManageEvent[] = [];
  private fxCredential!: fxCredential;

  constructor(
    private eventService: EventService,
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      this.eventObj = await this.eventService.getAllEvents();
      if (this.eventObj)
        this.spinnerService.hide();
    }
  }

  public redirectToDetailPage(item: ManageEvent): void {
    if (item) {
      sessionStorage.setItem('eventId', item.id.toString());
      this.router.navigate(['/eventdetail']);
    }    
  }

}
