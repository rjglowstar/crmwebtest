import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-csr',
  templateUrl: './csr.component.html',
  styleUrls: ['./csr.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CsrComponent implements OnInit {
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

  enrichSlider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    navigation: false,
    grabCursor: false,
    speed: 800,
    pagination: { clickable: true },
    autoplay: {
      delay: 3500,
    }
  };

  testimonySlider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: true,
    navigation: false,
    grabCursor: false,
    speed: 600,
    pagination: { clickable: true },
    autoplay: {
      delay: 4000,
    },
  };

  initiativeSlider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: true,
    navigation: false,
    grabCursor: false,
    speed: 600,
    pagination: { clickable: true },
    autoplay: {
      delay: 4000,
    },
  };
}
