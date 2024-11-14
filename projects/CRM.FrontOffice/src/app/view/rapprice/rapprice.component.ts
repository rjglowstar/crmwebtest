import { Component, OnInit } from '@angular/core';
import { fxCredential, MasterConfig, MasterDNorm, RapPrice, SystemUserPermission } from 'shared/enitites';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { AlertdialogService } from 'shared/views';
import { InvHistoryAction, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import * as xlsx from 'xlsx';
import { NgForm } from '@angular/forms';
import { RapPriceExcelItems, RapPriceFilter, RapUploadData, UpdateRap } from '../../businessobjects';
import { InvHistoryService, InventoryService, MasterConfigService, RapPriceService, SupplierService } from '../../services';
import { InvHistory, Supplier } from '../../entities';
import { CommuteService } from '../../services/commute/commute.service';
import { keys } from 'shared/auth';

@Component({
  selector: 'app-rapprice',
  templateUrl: './rapprice.component.html',
  styles: [
  ]
})
export class RappriceComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public gridData!: DataResult;
  public filterFlag = true;
  public masterConfigList!: MasterConfig;
  public inclusionData: MasterDNorm[] = [];
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public listShape: Array<{ name: string; isChecked: boolean }> = [];
  public listColor: Array<{ name: string; isChecked: boolean }> = [];
  public listClarity: Array<{ name: string; isChecked: boolean }> = [];
  public RapPriceData: RapPrice[] = [];
  public listRapPrice: RapPriceExcelItems[] = [];
  public fxCredentials?: fxCredential;
  public filterObj: RapPriceFilter = new RapPriceFilter();
  public errWeight: string = '';
  public isCanApplyRapUpload: boolean = false;

  public applyData: { success: boolean, fail: boolean, supplier: string, count: number, errorStoneIds: string[] }[] = [];

  public batchLimit = 500;

  constructor(private rapPriceService: RapPriceService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private supplierService: SupplierService,
    private invHistoryService: InvHistoryService,
    private inventoryService: InventoryService,
    private commuteService: CommuteService) { }

  public async ngOnInit() {
    try {
      this.spinnerService.show();
      await this.defaultMethodsLoad();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on get data!');
    }
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    await this.getMasterConfigData();
    //await this.getRapPriceData();
    await this.setUserRights();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanApplyRapUpload = userPermissions.actions.find(z => z.name == "CanApplyRapUpload");
      if (CanApplyRapUpload != null)
        this.isCanApplyRapUpload = true;
    }
  }

  public async getMasterConfigData() {
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.allTheShapes = this.masterConfigList.shape;
    this.allTheShapes.forEach(z => { this.listShape.push({ name: z.name, isChecked: false }); });

    this.allColors = this.masterConfigList.colors;
    this.allColors.forEach(z => { this.listColor.push({ name: z.name, isChecked: false }); });

    this.allClarities = this.masterConfigList.clarities;
    this.allClarities.forEach(z => { this.listClarity.push({ name: z.name, isChecked: false }); });

    this.spinnerService.hide();
  }

  public async getRapPriceData() {
    this.spinnerService.show();
    let result = await this.rapPriceService.getAllData();
    if (result) {
      this.RapPriceData = result;
      this.loadItems([...this.RapPriceData]);
    }
  }
  //#endregion

  //#region OnChange Functions
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadItems([...this.RapPriceData]);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public loadItems(grid_data: RapPrice[]) {
    this.gridData = process(grid_data, { group: this.groups });
    this.gridData.total = grid_data.length;
    this.spinnerService.hide();
  }

  public onFilterSubmit(form: NgForm) {
    this.spinnerService.show();
    let allData = [...this.RapPriceData];

    let filterData = allData.filter(a => this.ApplyArrayStringFilter(a.shape, this.filterObj.shape) &&
      this.ApplyArrayStringFilter(a.color, this.filterObj.color) &&
      this.ApplyArrayStringFilter(a.clarity, this.filterObj.clarity) &&
      ((this.filterObj.price != null && this.filterObj.price?.toString() != '') ? (a.price == this.filterObj.price) : true) &&
      ((this.filterObj.minSize != null && this.filterObj.minSize?.toString() != '') ? (a.minSize >= this.filterObj.minSize) : true) &&
      ((this.filterObj.maxSize != null && this.filterObj.maxSize?.toString() != '') ? (a.maxSize <= this.filterObj.maxSize) : true));

    this.loadItems(filterData);
  }

  public ApplyArrayStringFilter(a: string, z: string[]): boolean {
    let filter = true;
    if ((a == null || a == undefined || a?.length == 0) && (z == null || z == undefined || z?.length == 0))
      filter = true;
    else
      if (a == null || a == undefined || a?.length == 0)
        filter = false;
      else
        if ((a && a.length > 0) && (z && z.length > 0))
          filter = z.map(b => b.toLowerCase()).includes(a.toLowerCase());
    return filter;
  }

  public clearFilter(form: NgForm) {
    this.spinnerService.show();
    setTimeout(() => {
      form.reset();
      this.filterObj = new RapPriceFilter();
      this.listShape.forEach(z => { z.isChecked = false });
      this.listColor.forEach(z => { z.isChecked = false });
      this.listClarity.forEach(z => { z.isChecked = false });
      this.loadItems([...this.RapPriceData]);
    }, 100);
  }

  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
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

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (min && !max)
      return "min value required!";

    return '';
  }
  //#endregion

  //#region Update Data
  public onSelectExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = []
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        let fileReader = new FileReader();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          let Heading = ["shape", "clarity", "color", "minsize", "maxsize", "price", "date"];
          var rapPriceFetchItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: Heading, }) as any;

          if (rapPriceFetchItems && rapPriceFetchItems.length > 0) {
            this.listRapPrice = new Array<any>();

            for (let j = 0; j < rapPriceFetchItems.length; j++) {

              let newItem = await this.mappingExcelDataToRapPrice(rapPriceFetchItems, j);
              this.listRapPrice.push(newItem);
            }

            this.RapPriceData = this.convertToRapPrice(this.listRapPrice);
            this.loadItems([...this.RapPriceData]);
            this.spinnerService.hide();
          }
        }
        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public mappingExcelDataToRapPrice(excelData: any, excelIndex: number): RapPriceExcelItems {
    let newItem: RapPriceExcelItems = new RapPriceExcelItems();
    let obj = excelData[excelIndex];

    newItem.shape = this.getDisplayNameFromMasterDNorm(obj["shape".toLowerCase()]?.toString().trim(), this.allTheShapes);
    newItem.clarity = this.getDisplayNameFromMasterDNorm(obj["clarity".toLowerCase()]?.toString().trim(), this.allClarities);
    newItem.color = this.getDisplayNameFromMasterDNorm(obj["color".toLowerCase()]?.toString().trim(), this.allColors);
    newItem.minSize = obj["minsize".toLowerCase()]?.toString().trim();
    newItem.maxSize = obj["maxsize".toLowerCase()]?.toString().trim();
    newItem.price = obj["price".toLowerCase()]?.toString().trim();

    return newItem;
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName.toLowerCase() == name.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase()));

    return obj?.name ?? null as any;
  }

  public convertToRapPrice(data: RapPriceExcelItems[]): RapPrice[] {
    let rapPrices: RapPrice[] = [];
    data.forEach(z => {
      let rapPrice: RapPrice = new RapPrice();
      rapPrice.shape = z.shape;
      rapPrice.minSize = z.minSize;
      rapPrice.maxSize = z.maxSize;
      rapPrice.color = z.color;
      rapPrice.clarity = z.clarity;
      rapPrice.price = z.price;
      rapPrice.createdBy = this.fxCredentials?.id ?? '';
      rapPrices.push(rapPrice);
    });
    return rapPrices;
  }

  public async uploadInclusionResultFile() {
    try {
      this.spinnerService.show();
      let data = this.updateCriteriaChanges();
      if (data.length > 0) {
        let result = await this.rapPriceService.saveRapPriceFile(data);
        if (result) {
          this.utilityService.showNotification(`Rap Price updated successfully!`);
          this.listRapPrice = [];
          await this.getRapPriceData();
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Something went wrong on update data, Try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on update data, Try again later!');
    }
  }

  public updateCriteriaChanges(): RapPrice[] {
    let insertData = [...this.RapPriceData];
    //FL Data Criteria
    let existsFLData = insertData.find(z => z.clarity.toLowerCase() == 'fl');
    if (existsFLData == null) {
      let IFData = insertData.filter(z => z.clarity.toLowerCase() == 'if');
      if (IFData.length > 0) {
        IFData.forEach(z => {
          let rapPrice: RapPrice = new RapPrice();
          rapPrice.shape = z.shape;
          rapPrice.minSize = z.minSize;
          rapPrice.maxSize = z.maxSize;
          rapPrice.color = z.color;
          rapPrice.clarity = 'FL';
          rapPrice.price = z.price;
          rapPrice.createdBy = this.fxCredentials?.id ?? '';
          insertData.push(rapPrice);
        });
      }
    }

    //Max Size Changes
    insertData.forEach(z => {
      if (z.maxSize == 5.99)
        z.maxSize = 9.99;
      if (z.maxSize == 10.99)
        z.maxSize = 99.99;
    });

    return insertData;
  }
  //#endregion

  //#region Apply Rap Updation
  public async applyRapUpdate() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to apply latest rap price?", "Update")
      .subscribe(async (confirm: any) => {
        if (confirm.flag) {
          try {
            this.spinnerService.show();
            this.applyData = [];

            if (this.RapPriceData.length == 0) {
              let result = await this.rapPriceService.getAllData();
              if (result)
                this.RapPriceData = result;
            }

            //Update Pricing Request
            await this.UpdatePriceReq();

            //Update Pending Pricing
            await this.UpdatePendingPricing();

            //Update Temp Pricing
            await this.UpdateTempPricing();

            //Update Inventory Item Price in FO & BO
            var updateStoneIds = await this.rapPriceService.getInvStoneIds();
            if (updateStoneIds.length > 0) {
              let res: RapUploadData[] = [];
              if (updateStoneIds.length > this.batchLimit) {
                let batches = Math.ceil(updateStoneIds.length / this.batchLimit);

                for (let index = 0; index < batches; index++) {
                  let startIndex = this.batchLimit * index;
                  let batchData = updateStoneIds.slice(startIndex, startIndex + this.batchLimit);
                  let result = await this.applyRapUpdateByBatch(batchData);
                  if (result && result.length > 0) {
                    res.push(...result);
                    this.utilityService.showNotification('Batch ' + (index + 1) + ' Updated Successfully..!');
                  }
                  else
                    this.setExistsMsg({ success: false, fail: true, supplier: 'Diamanto (FO)', count: batchData.length, errorStoneIds: batchData });

                }
              }
              else
                res = await this.applyRapUpdateByBatch(updateStoneIds);

              if (res && res.length > 0) {
                this.setExistsMsg({ success: true, fail: false, supplier: 'Diamanto (FO)', count: res.length, errorStoneIds: [] });
                this.spinnerService.hide();
              } else {
                this.spinnerService.hide();
                this.setExistsMsg({ success: false, fail: true, supplier: 'Diamanto (FO)', count: 0, errorStoneIds: [] });
              }
              this.showApplyMessage();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('No Rap Update Found, Please contact administrator!');
            }

          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.setExistsMsg({ success: false, fail: true, supplier: 'Diamanto (FO)', count: 0, errorStoneIds: [] });
            this.alertDialogService.show('Rap price not apply, Please contact administrator!');
          }
        }
      });
  }

  public async applyRapUpdateByBatch(stoneIds: string[]): Promise<RapUploadData[]> {
    let res: RapUploadData[] = [];
    try {

      let updateData: UpdateRap = new UpdateRap();
      updateData.stoneIds = stoneIds;
      updateData.rapPrice = this.RapPriceData;

      res = await this.rapPriceService.applyRapPrice(updateData);
      if (res && res.length > 0) {
        this.insertInvItemHistoryList(updateData.stoneIds, InvHistoryAction.RapChanged, `Updated the Rap Price Mark from the Rap Price for stone`);
        await this.updateSupplierRapPrice(res);
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Rap price not apply, Please contact administrator!');
    }

    return res;
  }

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invList = await this.inventoryService.getInventoryByStoneIds(invIds);
      var invHistorys: InvHistory[] = [];
      invList?.map((item) => {
        if (invIds.includes(item.stoneId)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.id;
          invHistory.action = action;
          invHistory.userName = this.fxCredentials?.fullName ?? '';
          invHistory.price = item.price;
          invHistory.supplier = item.supplier;
          invHistory.description = desc + " " + item.stoneId;
          invHistorys.push(invHistory);
        }
      })
      this.invHistoryService.InsertInvHistoryList(invHistorys);

    }
    catch (error: any) {
      this.alertDialogService.show(`Something went wrong, Try again later!`);
    }
  }

  private async updateSupplierRapPrice(data: RapUploadData[]) {
    try {
      var suppliers = await this.supplierService.getAllSuppliers();
      if (suppliers && suppliers.length > 0) {
        for (let i = 0; i < suppliers.length; i++) {
          var supplier = suppliers[i];
          var supplierRapUploadData = data.filter(z => z.supplierCode == supplier.code);
          if (supplierRapUploadData.length > 0)
            await this.applySupplierRapUpdate(supplierRapUploadData, supplier);
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Supplier(s) Rap price not apply, Please contact administrator!');
    }
  }

  private async applySupplierRapUpdate(data: RapUploadData[], supplier: Supplier) {
    try {
      if (supplier && supplier.apiPath) {
        var res = await this.commuteService.applyRapPrice(data, supplier.apiPath);
        if (res && res.success)
          this.setExistsMsg({ success: true, fail: false, supplier: supplier.name, count: data.length, errorStoneIds: res.notFoundStoneIds });
        else
          this.setExistsMsg({ success: false, fail: true, supplier: supplier.name, count: data.length, errorStoneIds: data.map(z => z.stoneId) });

      } else {
        this.setExistsMsg({ success: false, fail: true, supplier: supplier.name, count: data.length, errorStoneIds: data.map(z => z.stoneId) });
        console.error(supplier.name + ' supplier api path not found!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.setExistsMsg({ success: false, fail: true, supplier: supplier.name, count: data.length, errorStoneIds: data.map(z => z.stoneId) });
    }
  }

  private setExistsMsg(data: { success: boolean, fail: boolean, supplier: string, count: number, errorStoneIds: string[] }) {
    if (data.success) {
      let existsIndex = this.applyData.findIndex(z => z.supplier == data.supplier && z.success == data.success);
      if (existsIndex != -1) {
        this.applyData[existsIndex].count += data.count;
        this.applyData[existsIndex].errorStoneIds.push(...data.errorStoneIds);
      }
      else
        this.applyData.push(data);
    }
    else {
      let existsIndex = this.applyData.findIndex(z => z.supplier == data.supplier && z.fail == data.fail);
      if (existsIndex != -1) {
        this.applyData[existsIndex].count += data.count;
        this.applyData[existsIndex].errorStoneIds.push(...data.errorStoneIds);
      }
      else
        this.applyData.push(data);
    }
  }

  private showApplyMessage() {
    let success = this.applyData.filter(z => z.success);
    let fail = this.applyData.filter(z => z.fail);
    let errorStones = this.applyData.filter(z => z.errorStoneIds.length > 0 && z.success);

    let msg = '';
    msg += this.applyData.length + ' <b>Total Portal Update</b><br />';
    msg += success.length + ' <b>Success</b><br />';
    msg += fail.length + ' <b>Fail</b><br /><br />';

    if (success.length > 0) {
      msg += "<b>Success Data:</b><br />";
      for (let index = 0; index < success.length; index++) {
        const element = success[index];
        msg += '<b>Total:</b> ' + element.count + ' <b>' + element.supplier + ' | Not Found : </b>' + element.errorStoneIds.length + '<br />';
      }
    }

    if (fail.length > 0) {
      if (success.length > 0)
        msg += "<br />";

      msg += "<b>Fail Data:</b><br />";
      for (let index = 0; index < fail.length; index++) {
        const element = fail[index];
        msg += element.count + ' <b>' + element.supplier + '</b> | Error StoneIds' + element.errorStoneIds.join(', ') + '<br />';
      }
    }

    if (errorStones.length > 0) {
      msg += "<br />";
      msg += "<b>Not Found Stone(s):</b><br />";
      for (let index = 0; index < errorStones.length; index++) {
        const element = errorStones[index];
        msg += '<b>' + element.supplier + ':</b> ' + element.errorStoneIds.join(', ') + '<br />';
      }
    }

    this.alertDialogService.show(msg);
  }

  private async UpdatePriceReq() {
    try {
      var updateStoneIds = await this.rapPriceService.getPricingRequestRapStoneIds();
      if (updateStoneIds.length > 0) {
        if (updateStoneIds.length > keys.batchWiseSaveLimit) {
          let batches = Math.ceil(updateStoneIds.length / keys.batchWiseSaveLimit);

          for (let index = 0; index < batches; index++) {
            let startIndex = keys.batchWiseSaveLimit * index;
            let batchData = updateStoneIds.slice(startIndex, startIndex + keys.batchWiseSaveLimit);

            let updateData: UpdateRap = new UpdateRap();
            updateData.stoneIds = batchData;
            updateData.rapPrice = this.RapPriceData;

            let result = await this.rapPriceService.updatePricingRequestRap(updateData);
            if (result)
              this.setExistsMsg({ success: true, fail: false, supplier: 'Price Request', count: batchData.length, errorStoneIds: [] });
            else
              this.setExistsMsg({ success: false, fail: true, supplier: 'Price Request', count: batchData.length, errorStoneIds: batchData });

          }
          this.utilityService.showNotification('Price Request Updated');
        }
        else {
          let updateData: UpdateRap = new UpdateRap();
          updateData.stoneIds = updateStoneIds;
          updateData.rapPrice = this.RapPriceData;

          let result = await this.rapPriceService.updatePricingRequestRap(updateData);
          if (result)
            this.setExistsMsg({ success: true, fail: false, supplier: 'Price Request', count: updateStoneIds.length, errorStoneIds: [] });
          else
            this.setExistsMsg({ success: false, fail: true, supplier: 'Price Request', count: updateStoneIds.length, errorStoneIds: updateStoneIds });
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.setExistsMsg({ success: false, fail: true, supplier: 'Price Request', count: 0, errorStoneIds: [] });
    }
  }

  private async UpdatePendingPricing() {
    try {
      var updateStoneIds = await this.rapPriceService.getPendingPricingRapStoneIds();
      if (updateStoneIds.length > 0) {
        if (updateStoneIds.length > keys.batchWiseSaveLimit) {
          let batches = Math.ceil(updateStoneIds.length / keys.batchWiseSaveLimit);

          for (let index = 0; index < batches; index++) {
            let startIndex = keys.batchWiseSaveLimit * index;
            let batchData = updateStoneIds.slice(startIndex, startIndex + keys.batchWiseSaveLimit);

            let updateData: UpdateRap = new UpdateRap();
            updateData.stoneIds = batchData;
            updateData.rapPrice = this.RapPriceData;

            let result = await this.rapPriceService.updatePendingPricingRap(updateData);
            if (result)
              this.setExistsMsg({ success: true, fail: false, supplier: 'Pending Pricing', count: batchData.length, errorStoneIds: [] });
            else
              this.setExistsMsg({ success: false, fail: true, supplier: 'Pending Pricing', count: batchData.length, errorStoneIds: batchData });

          }
          this.utilityService.showNotification('Pending Pricing Updated');
        }
        else {
          let updateData: UpdateRap = new UpdateRap();
          updateData.stoneIds = updateStoneIds;
          updateData.rapPrice = this.RapPriceData;

          let result = await this.rapPriceService.updatePendingPricingRap(updateData);
          if (result)
            this.setExistsMsg({ success: true, fail: false, supplier: 'Pending Pricing', count: updateStoneIds.length, errorStoneIds: [] });
          else
            this.setExistsMsg({ success: false, fail: true, supplier: 'Pending Pricing', count: updateStoneIds.length, errorStoneIds: updateStoneIds });
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.setExistsMsg({ success: false, fail: true, supplier: 'Price Request', count: 0, errorStoneIds: [] });
    }
  }

  private async UpdateTempPricing() {
    try {
      var updateStoneIds = await this.rapPriceService.getTempPricingRapStoneIds();
      if (updateStoneIds.length > 0) {
        if (updateStoneIds.length > keys.batchWiseSaveLimit) {
          let batches = Math.ceil(updateStoneIds.length / keys.batchWiseSaveLimit);

          for (let index = 0; index < batches; index++) {
            let startIndex = keys.batchWiseSaveLimit * index;
            let batchData = updateStoneIds.slice(startIndex, startIndex + keys.batchWiseSaveLimit);

            let updateData: UpdateRap = new UpdateRap();
            updateData.stoneIds = batchData;
            updateData.rapPrice = this.RapPriceData;

            let result = await this.rapPriceService.updateTempPricingRap(updateData);
            if (result)
              this.setExistsMsg({ success: true, fail: false, supplier: 'Temp Pricing', count: batchData.length, errorStoneIds: [] });
            else
              this.setExistsMsg({ success: false, fail: true, supplier: 'Temp Pricing', count: batchData.length, errorStoneIds: batchData });

          }
          this.utilityService.showNotification('Temp Pricing Updated');
        }
        else {
          let updateData: UpdateRap = new UpdateRap();
          updateData.stoneIds = updateStoneIds;
          updateData.rapPrice = this.RapPriceData;

          let result = await this.rapPriceService.updateTempPricingRap(updateData);
          if (result)
            this.setExistsMsg({ success: true, fail: false, supplier: 'Temp Pricing', count: updateStoneIds.length, errorStoneIds: [] });
          else
            this.setExistsMsg({ success: false, fail: true, supplier: 'Temp Pricing', count: updateStoneIds.length, errorStoneIds: updateStoneIds });
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.setExistsMsg({ success: false, fail: true, supplier: 'Price Request', count: 0, errorStoneIds: [] });
    }
  }
  //#endregion

}
