import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';

SwiperCore.use([Autoplay, Navigation, Pagination]);
@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AboutusComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    this.router.events.subscribe(() => {
      this.route.fragment.subscribe(fragment => {
        if (fragment) {
          setTimeout(() => {
            this.scrollToSection(fragment);
          }, 0);
        }
      });
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnInit(): void {
  }

  coreValue_Slider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 600,
    autoplay: {
      delay: 2500,
    },
  };

  whyUs_slider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 600,
    autoplay: {
      delay: 4500,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        centeredSlides: true,
      }
    },
  };
}
