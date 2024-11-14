import { Component, OnInit, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-diamondinfo',
  templateUrl: './diamondinfo.component.html',
  styleUrl: './diamondinfo.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DiamondinfoComponent implements OnInit {

  ngOnInit(): void { }

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  scrollToSection(sectionId: string, offset: number = 150) {
    const element = this.el.nativeElement.querySelector(sectionId);
    if (element) {
      const yOffset = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  }

}
