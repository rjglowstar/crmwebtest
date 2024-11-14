import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { listGrainingItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventoryItems, Repairing, RInvItem } from '../../../../entities';
import { CommuteService, InclusionuploadService, InventoryService, MasterConfigService, RepairingService } from '../../../../services';

@Component({
  selector: 'app-repairing-modal',
  templateUrl: './repairing-modal.component.html',
  styleUrls: ['./repairing-modal.component.css']
})
export class RepairingModalComponent implements OnInit {

  @Input() repairingObj = new Repairing();
  @Output() public toggle = new EventEmitter<boolean>();

  public masterConfigList!: MasterConfig;
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public allTheShapes!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public isFormValid: boolean = false;
  public listGrainingItems = listGrainingItems;
  public repairingType: string = "Issue";
  public expandMode: number = PanelBarExpandMode.Single;
  public searchStoneId: string = '';
  public inventoryObj: RInvItem = new RInvItem();
  public isOpen: boolean = false;

  constructor(
    public router: Router,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private masterConfigService: MasterConfigService,
    public datepipe: DatePipe,
    private inclusionUploadService: InclusionuploadService,
    private _repairService: RepairingService,
    private commuteService: CommuteService,
    private inventoryService: InventoryService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    try {
      setTimeout(() => {
        this.isOpen = true;
      }, 100);
      await this.getMasterConfigData();
      if (this.repairingObj.id)
        this.setRepaingObj();

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getMasterConfigData() {
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.inclusions);
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
    this.measurementConfig = this.masterConfigList.measurementConfig;

    let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
    allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });

  }

  public setRepaingObj() {
    this.repairingType = this.repairingObj.isIssue;
    if (this.repairingObj.isIssue === 'Issue')
      this.inventoryObj = JSON.parse(JSON.stringify(this.repairingObj.defectedStone));
    else
      this.inventoryObj = JSON.parse(JSON.stringify(this.repairingObj.repairedStone));
  }

  public async getInventoryMeasurementData(isNewData: boolean = false) {
    try {
      let result = await this.inclusionUploadService.getInventoryByStoneId(this.searchStoneId);
      if (result)
        this.inventoryObj = JSON.parse(JSON.stringify(this.mappingInventoryToRInvItem(result)));
      else {
        this.alertDialogService.show('No stone found!');
        this.searchStoneId = '';
        this.inventoryObj = new RInvItem();
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong on get inventory data!');
    }
  }

  public mappingInventoryToRInvItem(inv: InventoryItems): RInvItem {
    let invObj: RInvItem = new RInvItem();
    invObj.stoneId = inv.stoneId;
    invObj.weight = inv.weight;
    invObj.clarity = inv.clarity;
    invObj.cut = inv.cut;
    invObj.polish = inv.polish;
    invObj.symmetry = inv.symmetry;
    invObj.fluorescence = inv.fluorescence;
    invObj.inclusion = inv.inclusion;
    invObj.measurement = inv.measurement;    

    return invObj;
  }

  public async onSubmit(form: NgForm) {
    this.alertDialogService.ConfirmYesNo(`Are you want to ${this.repairingObj.id ? 'Updated' : 'Added'} stone(s) for repairing`, "Repairing Stones").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (form.valid) {
            this.spinnerService.show();
            //Need to update repairedStone & InventoryItems.. 
            //Stone Insert in from Repairing collection from Lab Result Upload(labreconsiliation) Form.

            //if (this.repairingObj.id && this.repairingType === 'Receive')
            this.repairingObj.repairedStone = JSON.parse(JSON.stringify(this.inventoryObj));
            //else
            //this.repairingObj.defectedStone = JSON.parse(JSON.stringify(this.inventoryObj));

            this.repairingObj.isIssue = this.repairingType;

            let messageType = this.repairingObj.id ? 'Updated' : 'Added';
            let response!: string;
            if (this.repairingObj.id)
              response = await this._repairService.Update(this.repairingObj);
            //else
            //response = await this._repairService.Insert(this.repairingObj);

            if (response) {
              this.utilityService.showNotification(`Record ${messageType} successfully`);
              //if (messageType == 'Updated' && this.repairingType === 'Receive') {
              let inventoryItem: InventoryItems = new InventoryItems();
              inventoryItem = await this.mappingInvExcelToInvItems(this.repairingObj.repairedStone);
              await this.inventoryService.updateInventoryData(inventoryItem);
              //}
            }
            else
              this.utilityService.showNotification(`Something went wrong, Try again later!`);

            this.closeRepairingDialog();
            this.spinnerService.hide();
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    })
  }

  public async repairingTypeChange(value: string) {
    if (value == 'Receive') {
      if (!this.repairingObj.id) {
        let flag: boolean = await this._repairService.isExistStoneRepair(this.inventoryObj.stoneId, "Issue");
        if (!flag) {
          this.alertDialogService.show('Stone is not issued yet!');
          this.repairingType = "Issue";
          return;
        }
      }

      if (this.repairingObj.id && this.repairingObj.repairedStone.stoneId)
        this.inventoryObj = JSON.parse(JSON.stringify(this.repairingObj.repairedStone));

    }
    else {
      if (this.repairingObj.id)
        this.inventoryObj = JSON.parse(JSON.stringify(this.repairingObj.defectedStone));
    }

  }

  public closeRepairingDialog() {
    this.toggle.emit(false);
  }

  public async savePricingRequestDiamanto(invExcelItem: InventoryItems) {
    try {
      let invItems: InventoryItems[] = [];
      // invExcelItems = invExcelItems.filter(z => z.discount == null);
      if (invExcelItem != null) {
        invItems.push(invExcelItem)
        await this.commuteService.insertPricingRequest(invItems, "Save Repairing", "Repairing");
        this.utilityService.showNotification('Pricing request submitted!');
      }

    } catch (error: any) {
      this.alertDialogService.show('Pricing request not inserted!', 'error');
      console.error(error);
    }
  }

  public async mappingInvExcelToInvItems(invExcelItem: RInvItem): Promise<InventoryItems> {
    let item = await this.inclusionUploadService.getInventoryByStoneId(invExcelItem.stoneId);
    // let item: InventoryItems = new InventoryItems();
    item.stoneId = invExcelItem.stoneId;
    item.weight = invExcelItem.weight;
    item.clarity = invExcelItem.clarity;
    item.cut = invExcelItem.cut;
    item.polish = invExcelItem.polish;
    item.symmetry = invExcelItem.symmetry;
    item.fluorescence = invExcelItem.fluorescence;
    item.measurement = invExcelItem.measurement;
    item.inclusion = invExcelItem.inclusion;    
    return item;
  }
}
