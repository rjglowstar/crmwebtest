import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-releasenote',
  templateUrl: './releasenote.component.html',
  styleUrls: ['./releasenote.component.css']
})
export class ReleasenoteComponent implements OnInit {

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  // @Output() ChildEvent = new EventEmitter();

  constructor(public utilityService: UtilityService,
    private appPreloadService: AppPreloadService,
    private configService: ConfigService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private router: Router) { }

  async ngOnInit() {

  }


  public closeReleaseNoteDialog(): void {
    this.toggle.emit(false);
  }
}