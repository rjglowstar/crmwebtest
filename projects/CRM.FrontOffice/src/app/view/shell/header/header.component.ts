import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Align } from '@progress/kendo-angular-popup';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationResponse } from 'shared/businessobjects';
import { Notifications } from 'shared/enitites';
import { NotificationService, UtilityService, WebsocketService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { StoneSearchRequest, StoneSearchResponse } from '../../../businessobjects';
import { fxCredential } from '../../../entities';
import { HeaderService } from '../../../services/header/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})

export class HeaderComponent implements OnInit {

  @Input() user: any;
  @Output() toggleNotification: EventEmitter<any> = new EventEmitter();
  public notifications!: NotificationResponse;
  public message: Notifications = new Notifications();
  public notificationShow = false;
  public fxCredentials!: fxCredential;

  //#region Search Stone
  public stoneSearchRequest: StoneSearchRequest = new StoneSearchRequest();
  public stoneSearchResponse: StoneSearchResponse[] = [];
  public stoneId: string = null as any;
  public certificateNo: string = null as any;
  public userSearchString: string = "";

  public isReleaseNote: boolean = false;

  public showSearchOption = false;
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;

  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "right", vertical: "top" };
  //#endregion

  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private notificationService: NotificationService,
    private headerService: HeaderService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private websocketService: WebsocketService) {

    notificationService.messageResponse.subscribe(async msg => {
      if (msg) {
        let messages = JSON.parse(msg);
        this.notifications.notifications.unshift(messages);
        this.notifications.notifications.splice(-1);
        await this.loadNotifications();
      }
    });

    notificationService.messageLoad.subscribe(async flag => {
      if (flag)
        await this.loadNotifications();
    });

  }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    if (sessionStorage.getItem("fxCredentials")) {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (this.fxCredentials.id)
        await this.loadNotifications();
    }
    this.loadScripts();
  }

  public async loadNotifications() {
    try {
      this.notifications = await this.notificationService.getMessgeByReceiver(this.fxCredentials.id);
      this.notifications.notifications.reverse();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public notificationClick() {
    this.notificationShow = !this.notificationShow;
  }

  public async removeNotification(i: number, notification: Notifications) {
    try {
      let id = notification.id;
      if (id) {
        let response = await this.notificationService.deleteMessage(id);
        if (response)
          this.notificationService.MessageLoadSub();
      }

      this.notifications.notifications.splice(i, 1);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);

    }
  }

  public logoutClick(): void {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to Logout?", "Logout").subscribe(async (res: any) => {
      if (res.flag)
        await this.logOut();
    });
  }

  public async logOut(): Promise<void> {
    try {

      await this.notificationService.deleteConnectionSocket(JSON.parse(sessionStorage.getItem("userToken") ?? "").ident);
      this.websocketService.subject = undefined as any;
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(["/login"]);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }

  }

  public notificationActionClick(notification: Notifications) {
    if (notification.categoryType == 'information')
      return;

    if (notification.action) {
      this.toggleNotification.emit(notification);
      this.notificationShow = false;
    }
  }

  public sendToNotificationPage() {
    this.notificationClick();
    this.router.navigateByUrl("/notifications");
  }

  getStoneImageByShape(shape: string) {
    let url = 'commonAssets/images/1.png';

    switch (shape.toLowerCase()) {
      case "cmb":
        url = 'commonAssets/images/10.png';
        break;
      case "em":
        url = 'commonAssets/images/7.png';
        break;
      case "smb":
        url = 'commonAssets/images/2.png';
        break;
      case "sqem":
        url = 'commonAssets/images/8.png';
        break;
      case "pb":
        url = 'commonAssets/images/3.png';
        break;
      case "mb":
        url = 'commonAssets/images/6.png';
        break;
      case "ob":
        url = 'commonAssets/images/5.png';
        break;
      case "hb":
        url = 'commonAssets/images/4.png';
        break;
      case "ccrmb":
        url = 'commonAssets/images/9.png';
        break;
      case "mtrib":
        url = 'commonAssets/images/11.png';
        break;
      default:
        url = 'commonAssets/images/1.png';
        break;
    }
    return url;
  }

  public onSearchToggle(): void {
    this.showSearchOption = !this.showSearchOption;
  }

  public async searchStone() {
    this.showSearchOption = true;
    try {
      this.spinnerService.show();

      let newManualString: string[] = [];
      if (this.userSearchString && this.userSearchString != "") {
        newManualString = this.utilityService.checkCertificateIds(this.userSearchString);
      }
      if (newManualString && newManualString.length > 0) {
        const uniqueCertificates = new Set<string>();
        const uniqueStoneIds = new Set<string>();

        newManualString?.forEach(z => {
          let flag = this.onlyNumbers(z);

          if (flag) {
            uniqueCertificates.add(z as string);
          } else {
            uniqueStoneIds.add(z?.toUpperCase() as string);
          }
        });

        this.stoneSearchRequest.certificateNos = Array.from(uniqueCertificates);
        this.stoneSearchRequest.stoneIds = Array.from(uniqueStoneIds);
      }

      let res = await this.headerService.getInventoryItemsByStoneSearch(this.stoneSearchRequest);
      if (res && res.length) {
        this.stoneSearchResponse = res;
        // this.userSearchString = "";
      }
      else
        this.stoneSearchResponse = [];

      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onlyNumbers(str: string) {
    return /^[0-9]+$/.test(str);
  }

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showSearchOption = false;
      this.userSearchString = "";
      this.stoneSearchResponse = [];
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  //#endregion


  public openReleaseNoteDialog(): void {
    this.isReleaseNote = true;
  }

  loadScripts() {
    let documentSideBar: any = document;

    // Menu Sidebar toggle
    documentSideBar.querySelector(".sidebar_headToggle").addEventListener("click", function () {
      documentSideBar.body.classList.toggle("active");
    });

    documentSideBar.querySelector(".tog_menu").addEventListener("click", function () {
      documentSideBar.querySelector(".navbar-collapse").classList.toggle("active");
    });
  }

}