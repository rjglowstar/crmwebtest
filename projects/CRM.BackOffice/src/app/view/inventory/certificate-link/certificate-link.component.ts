import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { InventoryItems } from '../../../entities';
import { NotificationService } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-certificate-link',
  templateUrl: './certificate-link.component.html',
  styleUrl: './certificate-link.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CertificateLinkComponent {

  public certiDownloadLink: string = "";
  public validStones: InventoryItems[] = [];
  public finalItems: Array<{id: string, stoneLine: any, button: boolean}> = [];

  constructor(private route: ActivatedRoute,
    private spinnerService: NgxSpinnerService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
  ) { }

  getSiblingText(event: any) {
    var getEle = document.getElementById(event);
    var getCertiLink = getEle?.querySelector('span')?.innerText;

    if (getCertiLink) {
      navigator.clipboard.writeText(getCertiLink)
      this.notificationService.show({
        content: "Your links has been copied!",
        cssClass: "button-notification",
        animation: { type: "fade", duration: 10 },
        position: { horizontal: "right", vertical: "bottom" },
        type: { style: "success", icon: true },
      });
    }
  }

  async ngOnInit() {
    this.spinnerService.show();
    this.validStones = await this.inventoryService.getInventoryByStoneIdsToGenLink();
    this.spinnerService.hide();
    if (this.validStones.length > 0) {
      let count = 0;
      let stoneLine = '';

      this.validStones.forEach((z, i) => {
        let itemDetail = `itemDetailVOs%5B${count}%5D.selected=true&_itemDetailVOs%5B${count}%5D.selected=on&itemDetailVOs%5B${count}%5D.itemReportId=${z.certificateNo}&itemDetailVOs%5B${count}%5D.pdfFlag=TRUE&itemDetailVOs%5B${count}%5D.caratWeight=${z.weight}`;

        if (count == 0) {
          // For the first item in the group, start building the stoneLine with additional parameters
          stoneLine += `flag=downloadBulkPdf&downloadpdf=Download+PDF+Reports&${itemDetail}&`;
        } else if (count == 19) {
          // For the 20th item in the group, complete the stoneLine and push to finalItems
          stoneLine += `flag=downloadBulkPdf&downloadpdf=Download+PDF+Reports&${itemDetail}`;
          this.finalItems.push({
            id: `cl_${i}`,
            stoneLine: stoneLine,
            button: true
          });
          // Reset stoneLine and count for the next group
          stoneLine = '';
          count = -1;
        } else {
          // For other items, keep appending to the stoneLine
          stoneLine += `flag=downloadBulkPdf&downloadpdf=Download+PDF+Reports&${itemDetail}&`;
        }
        count++;
      });

      // Handle any remaining items that did not complete a group of 20
      if (stoneLine.length > 0) {
        this.finalItems.push({
          id: `cl_${this.validStones.length}`,
          stoneLine: stoneLine,
          button: true
        });
      }
    }
    this.spinnerService.hide();
  }
}