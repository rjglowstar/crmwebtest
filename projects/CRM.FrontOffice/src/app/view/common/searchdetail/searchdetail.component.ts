import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { InclusionConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { InventoryItems, PricingHistory } from '../../../entities';
import { MasterConfigService, PricingRequestService } from '../../../services';

@Component({
  selector: 'app-searchdetail',
  templateUrl: './searchdetail.component.html',
  styleUrls: ['./searchdetail.component.css']
})
export class SearchdetailComponent implements OnInit {

  @Input() invItemsSearchResult: InventoryItems = new InventoryItems();

  public inclusionData: MasterDNorm[] = [];
  public measurementData: MasterDNorm[] = [];
  public listPricingHistory: PricingHistory[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementConfig: MeasurementConfig = new MeasurementConfig();

  constructor(public sanitizer: DomSanitizer,
    private pricingRequestService: PricingRequestService,
    private masterConfigService: MasterConfigService) { }

  async ngOnInit() {
    await this.getMasterConfigData();

  }

  public async getMasterConfigData() {

    let pricingHistory = await this.pricingRequestService.getPricingHistory(this.invItemsSearchResult.stoneId);
    if (pricingHistory) {
      pricingHistory.forEach(z => {
        if (this.listPricingHistory.find(a => a.id == z.id) == null)
          this.listPricingHistory.push(z);
      });
    }
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.inclusionData = masterConfigList.inclusions;
    this.measurementData = masterConfigList.measurements;

    this.inclusionConfig = masterConfigList.inclusionConfig;
    this.measurementConfig = masterConfigList.measurementConfig;
  }

  public sanitizeURL(type: string) {
    let url: string = "commonAssets/images/image-not-found.jpg";
    switch (type.toLowerCase()) {
      case "image":
        url = this.invItemsSearchResult.media.isPrimaryImage
          ? environment.imageURL.replace('{stoneId}', this.invItemsSearchResult.stoneId.toLowerCase())
          : "commonAssets/images/image-not-found.jpg";
        break;
      case "video":
        url = this.invItemsSearchResult.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', this.invItemsSearchResult.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        url = this.invItemsSearchResult.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', this.invItemsSearchResult.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

public calculateDateDiff(date: Date): string {
  let today = new Date();
  let calDate = new Date(date);

  var diff = Math.abs(today.getTime() - calDate.getTime());
  var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  if (today.getMonth() == calDate.getMonth() && today.getFullYear() == calDate.getFullYear())
    diffDays = today.getDate() - calDate.getDate();

  return diffDays.toString() + ' days ago';
}

}