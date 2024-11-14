import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { CellClickEvent, CellCloseEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential, MasterDNorm } from 'shared/enitites';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Configurations, InvItem, Lead, LeadRejectedOffer, LeadRejectedOfferItem } from '../../../../entities';
import { ConfigurationService, InventoryService, LeadService, MasterConfigService } from '../../../../services';

@Component({
  selector: 'app-leadrejectedmodal',
  templateUrl: './leadrejectedmodal.component.html',
  styleUrls: ['./leadrejectedmodal.component.css']
})
export class LeadrejectedmodalComponent implements OnInit {

  @Input() public leadId!: string;
  @Input() public leadRejectedId!: string;
  @Input() public leadInvIds!: Array<string>;
  @Output() public toggle = new EventEmitter<any>();

  public fxCredential!: fxCredential;
  public gridViewInvItemList!: DataResult;
  public pageSize = 10;
  public skip = 0;
  public rejectedOfferItemAllList: Array<LeadRejectedOfferItem> = new Array<LeadRejectedOfferItem>();
  public rejectedOfferItemShowList: Array<LeadRejectedOfferItem> = new Array<LeadRejectedOfferItem>();
  public leadObj = new Lead();
  public configurations: Configurations = new Configurations();
  public customerName!: string;
  public customerCompany!: string;
  public leadNo!: number;
  public sellerName!: string;
  public brokerName!: string;
  public leadRejectedOffer: LeadRejectedOffer = new LeadRejectedOffer();

  public allTheShapes!: MasterDNorm[];
  public filterStoneId: string = '';
  public filterShapes: Array<string> = new Array<string>();
  public filterFWeight: number = null as any;
  public filterTWeight: number = null as any;
  public filterComment?: string | null;
  public filterOffer: number = null as any;
  public filterShapeChk: boolean = false;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  constructor(
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public inventoryService: InventoryService,
    public router: Router,
    public leadService: LeadService,
    private alertDialogService: AlertdialogService,
    private formBuilder: UntypedFormBuilder,
    public configurationService: ConfigurationService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
    await this.loadMasterConfig();
  }

  public async loadDefaultMethods() {
    try {

      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      this.configurations = await this.configurationService.getConfiguration();
      if (this.leadId) {
        this.leadObj = await this.leadService.getLeadById(this.leadId);
        this.customerName = this.leadObj.customer.name;
        this.customerCompany = this.leadObj.customer.companyName;
        this.brokerName = this.leadObj.broker.name;
        this.sellerName = this.leadObj.seller.name;
        this.leadNo = this.leadObj.leadNo;
        this.leadObj.leadInventoryItems = await this.leadService.getStonesByLeadId(this.leadId, false);
        if (this.leadInvIds && this.leadInvIds.length > 0)
          this.leadObj.leadInventoryItems = this.leadObj.leadInventoryItems.filter(x => this.leadInvIds.includes(x.invId));
        this.rejectedOfferItemAllList = this.mappingInvItemToLeadRejectedOfferItem(this.leadObj.leadInventoryItems);
        await this.loadInvListPaging();
        this.ApplySpecialStoneCriteriaForHighlight();
      }
      else {
        this.leadRejectedOffer = await this.leadService.getLeadRejecetdByOfferId(this.leadRejectedId);
        this.customerName = this.leadRejectedOffer.customer.name;
        this.customerCompany = this.leadRejectedOffer.customer.companyName;
        this.brokerName = this.leadRejectedOffer.broker.name;
        this.leadNo = this.leadRejectedOffer.leadNo;
        this.sellerName = this.leadRejectedOffer.seller.name;

        this.rejectedOfferItemAllList = this.leadRejectedOffer.rejectedInvItems;
        await this.loadInvListPaging();
      }

      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadInvListPaging() {
    this.rejectedOfferItemShowList = new Array<LeadRejectedOfferItem>();
    if (this.rejectedOfferItemAllList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.rejectedOfferItemAllList[i];
        if (element)
          this.rejectedOfferItemShowList.push(element);
      }
    }
    this.loadInventoryGrid(this.rejectedOfferItemAllList);

  }

  public loadInventoryGrid(invItems: LeadRejectedOfferItem[]) {
    this.gridViewInvItemList = process(this.rejectedOfferItemShowList, {});
    this.gridViewInvItemList.total = invItems.length;
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.rejectedOfferItemShowList = new Array<LeadRejectedOfferItem>();
    this.skip = event.skip;
    this.loadInvListPaging();
  }

  public cellClickHandler(e: CellClickEvent) {
    if (this.fxCredential.origin.toLowerCase() != 'admin')
      if (!e.isEdited)
        e.sender.editCell(e.rowIndex, e.columnIndex, this.createFormGroup(e.dataItem));
  }

  public createFormGroup(dataItem: LeadRejectedOfferItem): UntypedFormGroup {
    return this.formBuilder.group({
      offer: dataItem.offer,
      comment: dataItem.comment,
    });
  }

  public async cellCloseHandler(args: CellCloseEvent) {
    try {
      let { formGroup, dataItem } = args;
      if (formGroup.dirty) {
        dataItem.offer = formGroup.value.offer;
        dataItem.comment = formGroup.value.comment;
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(`Data insert fail, Try again later!`);
    }
  }

  public async onSubmit(form: NgForm) {
    this.alertDialogService.ConfirmYesNo(`Are you want to Reject stone(s)`, "Reject Offer Or Comment Stones").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (form.valid) {
            this.spinnerService.show();

            let validFlag = false;
            validFlag = this.rejectedOfferItemAllList.some(x => x.isRequired && ((x.offer == null || x.offer == undefined) && (x.comment == null || x.comment == undefined || x.comment == "")));
            let invalidStones = this.rejectedOfferItemAllList.filter(x => x.isRequired && ((x.offer == null || x.offer == undefined) && (x.comment == null || x.comment == undefined || x.comment == ""))).map(x => x.stoneId);
            if (validFlag) {
              this.spinnerService.hide();
              return this.alertDialogService.show(`<b>${invalidStones.join(",")}</b> ${invalidStones.length == 1 ? `stone is` : `stones are`} required to put offer, kindly add offer!`)
            }

            this.closeRejectedDialog(true);
            this.spinnerService.hide();
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    });
  }

  public closeRejectedDialog(isUpdate: boolean = false) {
    let closeAction = {
      isUpdate: isUpdate,
      isClose: false,
      invItem: isUpdate ? this.rejectedOfferItemAllList : []
    }

    this.toggle.emit(closeAction);
  }

  public ApplySpecialStoneCriteriaForHighlight() {
    this.rejectedOfferItemAllList.forEach(target => {
      var data = this.configurations.rejectedOfferCriteriaes.filter(z =>
        this.utilityService.filterFromToDecimalValues(target.weight, z.weightMin, z.weightMax) &&
        this.utilityService.filterArrayString(target.shape, z.shapes));

      if (data && data.length > 0) {
        target.isRequired = true;
      }
    });
  }

  public mappingInvItemToLeadRejectedOfferItem(inv: InvItem[]): LeadRejectedOfferItem[] {
    let invList: Array<LeadRejectedOfferItem> = new Array<LeadRejectedOfferItem>();
    for (let index = 0; index < inv.length; index++) {
      const element = inv[index];
      let invObj: LeadRejectedOfferItem = new LeadRejectedOfferItem();
      invObj.stoneId = element.stoneId;
      invObj.weight = element.weight;
      invObj.shape = element.shape;

      invObj.color = element.color;
      invObj.clarity = element.clarity;
      invObj.cut = element.cut;
      invObj.polish = element.polish;
      invObj.symmetry = element.symmetry;
      invObj.fluorescence = element.fluorescence;
      invObj.location = element.location;
      invObj.certificateNo = element.certificateNo;

      invObj.price = element.price;
      invObj.discDiff = (element.price.discount ?? 0) - element.fDiscount;

      invObj.aDiscount = element.aDiscount;
      invObj.fDiscount = element.fDiscount;
      invObj.netAmount = element.netAmount;
      invObj.perCarat = element.perCarat;
      invObj.vowDiscount = element.vowDiscount;
      invObj.vowAmount = element.vowAmount;
      invObj.fAmount = element.fAmount;
      invObj.supplier = element.supplier;

      invList.push(invObj);
    }
    return invList;
  }

  public async loadMasterConfig() {
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    masterConfigList.shape.forEach(x => x.isChecked = false);
    this.allTheShapes = masterConfigList.shape;
  }

  public async clearRejectFilter() {
    this.allTheShapes.forEach(x => x.isChecked = false);
    this.filterShapes = new Array<string>();
    this.filterFWeight = null as any;
    this.filterTWeight = null as any;
    this.filterStoneId = null as any;
    this.filterComment = null as any;
    this.filterOffer = null as any;

    this.rejectedOfferItemShowList = this.rejectedOfferItemAllList;
    this.loadInventoryGrid(this.rejectedOfferItemAllList);
  }

  public filterRejectedList() {
    try {
      let filterRejectedListData: LeadRejectedOfferItem[] = JSON.parse(JSON.stringify(this.rejectedOfferItemAllList));
      if (this.filterStoneId.length > 0) {
        let stoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId) : [];
        let lowerCaseStoneIds: string[] = []
        stoneIds.forEach(z => { lowerCaseStoneIds.push(z.toLowerCase()) });
        filterRejectedListData = filterRejectedListData.filter(z => lowerCaseStoneIds.includes(z.stoneId.toLowerCase()))
      }

      if (this.filterShapes.length > 0)
        filterRejectedListData = filterRejectedListData.filter(z => this.filterShapes.includes(z.shape));

      filterRejectedListData = filterRejectedListData.filter(z => this.utilityService.filterFromToDecimalValues(z.weight, this.filterFWeight, this.filterTWeight));
      this.rejectedOfferItemShowList = JSON.parse(JSON.stringify(filterRejectedListData));
      this.loadInventoryGrid(this.rejectedOfferItemAllList);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Filter fail, Try again later!');
    }
  }

  public updateCommentOrOffer() {
    try {
      if (((this.filterOffer == null || this.filterOffer == 0)) && !this.filterComment?.trim()) {
        this.alertDialogService.show('Please fill offer or comment!');
        return;
      }

      let filterStoneIds = this.rejectedOfferItemShowList.map(z => z.stoneId);
      this.rejectedOfferItemAllList.forEach(z => {
        if (this.filterOffer)
          z.offer = Number(this.filterOffer);
        if (this.filterComment?.trim())
          z.comment = this.filterComment;
      });

      let filterRejectListData = this.rejectedOfferItemAllList.filter(z => filterStoneIds.includes(z.stoneId));
      this.rejectedOfferItemShowList = JSON.parse(JSON.stringify(filterRejectListData));
      this.loadInventoryGrid(this.rejectedOfferItemAllList);
      this.utilityService.showNotification('Added or updated !');

      this.filterComment = null as any;
      this.filterOffer = null as any;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Update fail, Try again later!');
    }
  }

  public calculate() {
    var rejectedOfferData = this.rejectedOfferItemAllList;
    if (this.filterOffer) {
      for (let i = 0; i < rejectedOfferData.length; i++)
        rejectedOfferData[i].offer = (Number(rejectedOfferData[i].price.discount) + Number(this.filterOffer));
    }
    this.filterOffer = null as any;
  }

  public onMultiSelectChange(val: Array<any>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });
    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }

  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData.length == 0)
      list.forEach(x => x.isChecked = false);
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }


}
