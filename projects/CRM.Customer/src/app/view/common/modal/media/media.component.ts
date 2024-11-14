import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.css'
})
export class MediaComponent implements OnInit {
  @Input() mediaType: any;
  @Input() mediaSrc: any;
  @Output() closeDialog = new EventEmitter();

  public iFrameLoader = true;

  constructor(public sanitizer: DomSanitizer,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
  }

  closeMediaDialog() {
    this.closeDialog.emit(false);
  }

  public copyDiamondVideoLink() {
    navigator.clipboard.writeText(this.mediaSrc);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
  }

  public sanitizeURL(url: string) {    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.iFrameLoader = false;
    }, 800);
  }

}
