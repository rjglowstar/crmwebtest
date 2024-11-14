import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import { EventService } from '../../services';
import { ManageEvent } from '../../entities';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-eventnew',
  templateUrl: './eventnew.component.html',
  styleUrl: './eventnew.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EventnewComponent implements OnInit {

  public eventObj: ManageEvent = new ManageEvent();
  public previousEventsObj: ManageEvent[] = [];
  eventGallery: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    navigation: false,
    grabCursor: false,
    speed: 800,
    autoplay: {
      delay: 2500,
    },
    breakpoints: {
      480: {
        slidesPerView: 2,
        centeredSlides: true,
      },
      768: {
        slidesPerView: 2,
        centeredSlides: true,
      },
      992: {
        slidesPerView: 3,
        centeredSlides: true,
      }
    },
  };

  constructor(
    private spinnerService: NgxSpinnerService,
    private eventService: EventService,
    private alertDialogService: AlertdialogService,
  ) { }

  async ngOnInit() {
    await this.loadMostCurrentEvent();
    await this.loadLastFivePreviousEvents()
  }

  private async loadMostCurrentEvent() {
    try {
      this.spinnerService.show();
      this.eventObj = await this.eventService.getCurrentEvent();
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'An unexpected error occurred';
      this.alertDialogService.show(errorMessage);
    } finally {
      this.spinnerService.hide();
    }
  }

  private async loadLastFivePreviousEvents() {
    try {
      this.spinnerService.show();
      this.previousEventsObj = await this.eventService.getLastFivePreviEvents();
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'An unexpected error occurred';
      this.alertDialogService.show(errorMessage);
    } finally {
      this.spinnerService.hide();
    }
  }

  // Method to format date range
  public getFormattedDateRange(startDate: Date, endDate: Date): string {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (sDate.getMonth() === eDate.getMonth())
      return `${sDate.getDate()}th - ${eDate.getDate()}th ${eDate.toLocaleString('default', { month: 'short' })} ${eDate.getFullYear()}`;
    else
      return `${sDate.getDate()}th ${sDate.toLocaleString('default', { month: 'short' })} - ${eDate.getDate()}th ${eDate.toLocaleString('default', { month: 'short' })} ${eDate.getFullYear()}`;
  }
}
