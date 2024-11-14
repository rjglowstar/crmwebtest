import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media-components.css'
})
export class MediaComponent implements OnInit, AfterViewInit {
  @Input() mediaTitle: any;
  @Input() mediaType: any;
  @Input() mediaSrc: any;

  public iFrameLoader = true;

  @Output() closeDialog = new EventEmitter();
  constructor(public sanitizer: DomSanitizer,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
  }

  closeMediaDialog() {
    this.closeDialog.emit(false);
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public copyDiamondVideoLink() {
    navigator.clipboard.writeText(this.mediaSrc);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.iFrameLoader = false;
    }, 800);
  }

}
