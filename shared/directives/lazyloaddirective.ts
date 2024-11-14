import { AfterViewInit, Directive, ElementRef, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[imgLazyLoad]',
})
export class LazyLoadDirective implements AfterViewInit {
    @HostBinding('attr.src') srcAttr = null as any;
    @Input('imgLazyLoad') lazyImage?: string;

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
    }

    private canLazyLoad() {
        return window && 'IntersectionObserver' in window;
    }

    private lazyLoadImage() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach((entry: any) => {
                if (entry.isIntersecting) {
                    this.loadImage();
                    obs.unobserve(this.el.nativeElement);
                }
            });
        });
        obs.observe(this.el.nativeElement);
    }

    private loadImage() {
        this.srcAttr = this.lazyImage;
    }

}