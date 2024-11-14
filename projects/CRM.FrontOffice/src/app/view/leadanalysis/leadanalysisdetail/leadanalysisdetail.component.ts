import { Component, Input, OnInit } from '@angular/core';
import { InvItem } from '../../../entities';
import { LeadService } from '../../../services';
import { __await } from 'tslib';
import { DataResult } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { environment } from 'environments/environment.prod';
import { OrderDetailResponse } from '../../../businessobjects';

@Component({
  selector: 'app-leadanalysisdetail',
  templateUrl: './leadanalysisdetail.component.html',
  styleUrls: ['./leadanalysisdetail.component.css']
})
export class LeadanalysisdetailComponent implements OnInit {
  @Input() leadAnalysisDetail:OrderDetailResponse=new OrderDetailResponse()
  public isShowMedia: boolean = false;
  public leadDetail: InvItem[] = new Array<InvItem>();
  public detailPageSize = 10;
  public detailSkip = 0
  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string
  public gridDetailView!: DataResult;
  constructor(private leadService: LeadService,
    private spinnerService:NgxSpinnerService) { }

 async ngOnInit() {
  console.log(this.leadAnalysisDetail);
  
    this.leadDetail =await this.leadService.getStonesByLeadId(this.leadAnalysisDetail.leadId);
    this.loadDetailGrid()
  }

  public loadDetailGrid(): void {
    this.detailSkip=0
    this.gridDetailView = {
      data: this.leadDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize),
      total: this.leadDetail.length
    };
    this.spinnerService.hide();
  }

  public pageChangeDetail({ skip, take }: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = skip;
    this.detailPageSize = take;
    this.loadDetailGrid();
  }


  public openMediaDialog(title: string, stoneId: string, type: string): void {
    if (stoneId) {
      this.mediaTitle = title;

      if (type == "iframe")
        this.mediaSrc = environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "img")
        this.mediaSrc = environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "cert")
        this.mediaSrc = environment.certiURL.replace('{certiNo}', stoneId);
      else if (type == "download")
        this.mediaSrc = environment.otherImageBaseURL.replace('{stoneId}', stoneId.toLowerCase()) + "/video.mp4";
      else
        this.mediaSrc = stoneId;

      this.mediaType = type;
      this.isShowMedia = true;
    }
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }
}
