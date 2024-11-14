import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileStore, fxCredential } from 'shared/enitites';
import { AppPreloadService, FileStoreService, UtilityService } from 'shared/services';
import { ManageEvent, ManageEventImages } from '../../entities';
import { EventService } from '../../services';
import { Fancybox } from '@fancyapps/ui';

@Component({
  selector: 'app-eventdetail',
  templateUrl: './eventdetail.component.html',
  styleUrl: './eventdetail.component.css'
})
export class EventdetailComponent implements OnInit {

  // public eventObj: any;
  public eventObj: ManageEvent = new ManageEvent();
  private fxCredential!: fxCredential;

  currentIndex: any = -1;
  showFlag: any = false;
  imageObject: Array<object> = [];

  constructor(
    private eventService: EventService,
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private fileStoreService: FileStoreService,
    private utilityService: UtilityService,
    private elRef: ElementRef
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();    
    Fancybox.bind(this.elRef.nativeElement, '[data-fancybox]', {
      Images: {
        zoom: true,
      }      
    });
  }

  ngOnDestroy() {
    Fancybox.unbind(this.elRef.nativeElement);
    Fancybox.close();
  }

  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      let eventId = sessionStorage.getItem("eventId");
      if (eventId) {
        let data = await this.eventService.getbyId(eventId);
        this.spinnerService.hide();
        this.eventObj = data;
        if (this.eventObj.id) {
          let imageList: FileStore[] = await this.fileStoreService.getFileByIdent(this.eventObj.id);
          if (imageList && imageList.length > 0) {
            for (let index = 0; index < imageList.length; index++) {
              const element = imageList[index];
              element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
              element.filePath = await this.fileStoreService.getPathToBase64(element.id, element.type);
              element.filePath = this.loadImage(element.filePath) || null as any;
            }
            imageList.forEach((ele) => {
              this.imageObject.push({
                image: ele.filePath,
                thumbImage: ele.fileThumbnail
              });
            })
            this.eventObj.images = this.mappingImages(imageList);
          }
        }
      }
    }
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public mappingImages(imageList: FileStore[]): ManageEventImages[] {
    let mapImages: ManageEventImages[] = [];
    imageList.forEach(element => {
      let obj: ManageEventImages = new ManageEventImages();
      obj.imageName = element.fileName;
      obj.imageType = element.type
      obj.imageString = element.fileThumbnail
      obj.createdDate = element.createdDate;
      mapImages.push(obj);
    });
    return mapImages;
  }

  public redirectToParentPage(): void {
    this.router.navigate(["event"]);
    sessionStorage.removeItem("eventId");
  }


  showLightbox(index: any) {
    this.currentIndex = index;
    this.showFlag = true;
  }

  closeEventHandler() {
    this.showFlag = false;
    this.currentIndex = -1;
  }
}
