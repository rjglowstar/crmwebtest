import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-sustainability',
  templateUrl: './sustainability.component.html',
  styleUrl: './sustainability.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SustainabilityComponent implements AfterViewInit {

  public companyName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilityService: UtilityService,
  ) { }

  async ngOnInit() {
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
  }
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
}
