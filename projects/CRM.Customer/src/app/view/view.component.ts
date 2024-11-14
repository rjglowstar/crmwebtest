import { Component, OnInit, Renderer2 } from '@angular/core';
import { keys } from 'shared/auth';
import { AppPreloadService, SuggestionService } from 'shared/services';
import Lenis from '@studio-freight/lenis';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styles: [
  ]
})
export class ViewComponent implements OnInit {

  public isSuggestion: boolean = false;
  public isLoginCheck: boolean = false;
  lenis: any;

  constructor(
    private suggestionSharedService: SuggestionService,
    public appPreloadService: AppPreloadService,
    private renderer: Renderer2,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.renderer.removeClass(document.body, 'chLan');
    if (localStorage.getItem('language') === 'ch')
      this.renderer.addClass(document.body, 'chLan');

    if (sessionStorage.getItem('userToken')) {
      this.renderer.removeClass(document.body, 'default');
      this.renderer.addClass(document.body, 'cLogIn');
      this.renderer.setAttribute(document.body, 'data-lenis-prevent', '');
    } else {
      this.renderer.removeClass(document.body, 'cLogIn');
      this.renderer.addClass(document.body, 'default');
    }

    if (sessionStorage.getItem("fxCredentials")) {
      let fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (fxCredential && fxCredential.fullName)
        keys.loginUserIdent = fxCredential.fullName;
      this.isLoginCheck = true;
    }

    this.suggestionSharedService.selectedSuggestion$.subscribe((res) => {
      this.isSuggestion = res;
    })
  }

  public isLogincheck(event: boolean) {
    this.isLoginCheck = false;
  }

  ngAfterViewInit(): void {
    // Initialize Lenis with custom settings
    this.lenis = new Lenis({
      duration: 1.5,
      easing: (t: number) => (--t) * t * t + 1,
      smooth: true,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothTouch: true,
    } as any);

    // Start requestAnimationFrame loop
    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  public onActivate(e: any, outlet: any) {
    if (this.lenis) {
      //lenis reset the scroll position top
      this.lenis.scrollTo(0, { immediate: true });
    } else {
      outlet.scrollTop = 0;
    }
  }
}


