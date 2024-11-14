import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-craftsmanship',
  templateUrl: './craftsmanship.component.html',
  styleUrl: './craftsmanship.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CraftsmanshipComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() { }

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


  manuFacProcess: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 600,
    autoplay: {
      delay: 4000,
    },
  };

  capabili_slider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 600,
    autoplay: {
      delay: 4000,
    },
  };
}
