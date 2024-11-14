import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataResult, GroupDescriptor, orderBy, process, SortDescriptor } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import * as xlsx from 'xlsx';
import { RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { GirdleDNorm, GradeSearchItems, GridDetailConfig, InclusionPrice, MeasItems } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { InventoryItemMeasurement, InventoryItems } from '../../entities';
import { ConfigService, MeasureGradeService, UtilityService } from 'shared/services';
import { CommuteService, GridPropertiesService, InclusionuploadService, MasterConfigService } from '../../services';
import { AlertdialogService } from 'shared/views';
import { InclusionExcelItems, InclusionFilter, InverntoryError, UpdateInclusionData } from '../../businessobjects';
import { keys } from 'shared/auth';

@Component({
  selector: 'app-inclusionupload',
  templateUrl: './inclusionupload.component.html',
  styleUrls: ['./inclusionupload.component.css']
})
export class InclusionuploadComponent implements OnInit {
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public sort!: SortDescriptor[];
  public errorMessagesByStoneId: InverntoryError[] = [];
  public existStoneIds: string[] = [];
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region List & Objects
  public inclusionUploadObj: InclusionExcelItems = new InclusionExcelItems();
  public inventoryObj: InventoryItems = new InventoryItems();
  public masterConfigList!: MasterConfig;
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public inventoryItems: InventoryItems[] = [];
  public inclusionExcelItems: InclusionExcelItems[] = [];
  public selectedInclusionExcelItems: InclusionExcelItems[] = [];
  public fxCredentials?: fxCredential;
  public totalPcs: number = 0;
  //#endregion

  public insertFlag: boolean = true;
  public isInclusionUpload: boolean = false;
  public isVisibleM: boolean = false;
  public isFilter = false;
  public searchStoneId: string = '';
  public isValidStone = false;
  public filterOption = '';
  public inclusionFilter: InclusionFilter = new InclusionFilter();
  public stoneId = '';
  public isViewButtons: boolean = false;
  @ViewChild("anchor") public anchor!: ElementRef;
  public brownList: MasterDNorm[] = [];
  public milkyList: MasterDNorm[] = [];

  constructor(private inclusionUploadService: InclusionuploadService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private commuteService: CommuteService,
    private measureGradeService: MeasureGradeService) { }

  async ngOnInit() {
    try {
      await this.defaultMethodsLoad();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong on get data!');
    }
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

    if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getMasterConfigData();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "InclusionUpload", "InclusionUploadGrid", this.gridPropertiesService.getInclusionUploadGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("InclusionUpload", "InclusionUploadGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInclusionUploadGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getMasterConfigData() {
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.measurementData = this.masterConfigList.measurements;
    this.measurementConfig = this.masterConfigList.measurementConfig;
    this.inclusionData = this.masterConfigList.inclusions;
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.brownList = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
    this.milkyList = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1);
  }

  public async getInventoryMeasurementData(isNewData: boolean = false) {
    try {
      let result = await this.inclusionUploadService.getInventoryByStoneId(this.inclusionUploadObj.stoneId);
      if (result) {
        this.inclusionUploadObj = this.mappingInventoryToInclusionData(result, isNewData);
        this.isValidStone = true;
      }
      else {
        this.alertDialogService.show('No stone found!');
        this.isValidStone = false;
        let typeStoneId = this.inclusionUploadObj.stoneId;
        this.inclusionUploadObj = new InclusionExcelItems();
        this.inclusionUploadObj.stoneId = typeStoneId;
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong on get inventory data!');
    }
  }

  public mappingInventoryToInclusionData(inv: InventoryItems, isNewData: boolean = false): InclusionExcelItems {
    let inclusionUploadObj: InclusionExcelItems = JSON.parse(JSON.stringify(this.inclusionUploadObj));
    if (isNewData) {
      inclusionUploadObj.brown = inv.inclusion.brown;
      inclusionUploadObj.green = inv.inclusion.green;
      inclusionUploadObj.milky = inv.inclusion.milky;
      inclusionUploadObj.shade = inv.inclusion.shade;
      inclusionUploadObj.centerBlack = inv.inclusion.centerBlack;
      inclusionUploadObj.sideBlack = inv.inclusion.sideBlack;
      inclusionUploadObj.openCrown = inv.inclusion.openCrown;
      inclusionUploadObj.openTable = inv.inclusion.openTable;
      inclusionUploadObj.openPavilion = inv.inclusion.openPavilion;
      inclusionUploadObj.openGirdle = inv.inclusion.openGirdle;
      inclusionUploadObj.girdleCondition = inv.inclusion.girdleCondition;
      inclusionUploadObj.efoc = inv.inclusion.efoc;
      inclusionUploadObj.efop = inv.inclusion.efop;
      inclusionUploadObj.culet = inv.inclusion.culet;
      inclusionUploadObj.hna = inv.inclusion.hna;
      inclusionUploadObj.eyeClean = inv.inclusion.eyeClean;
      inclusionUploadObj.naturalOnGirdle = inv.inclusion.naturalOnGirdle;
      inclusionUploadObj.naturalOnCrown = inv.inclusion.naturalOnCrown;
      inclusionUploadObj.naturalOnPavillion = inv.inclusion.naturalOnPavillion;
      inclusionUploadObj.bowtie = inv.inclusion.bowtie;
    }

    inclusionUploadObj.stoneId = inv.stoneId;
    inclusionUploadObj.shape = inv.shape;
    inclusionUploadObj.depth = inv.measurement.depth;
    inclusionUploadObj.table = inv.measurement.table;
    inclusionUploadObj.length = inv.measurement.length;
    inclusionUploadObj.width = inv.measurement.width;
    inclusionUploadObj.height = inv.measurement.height;
    inclusionUploadObj.crownHeight = inv.measurement.crownHeight;
    inclusionUploadObj.crownAngle = inv.measurement.crownAngle;
    inclusionUploadObj.pavilionDepth = inv.measurement.pavilionDepth;
    inclusionUploadObj.pavilionAngle = inv.measurement.pavilionAngle;
    inclusionUploadObj.girdlePer = inv.measurement.girdlePer;
    inclusionUploadObj.minGirdle = inv.measurement.minGirdle;
    inclusionUploadObj.maxGirdle = inv.measurement.maxGirdle;
    inclusionUploadObj.ratio = inv.measurement.ratio;
    inclusionUploadObj.comment = inv.comments;
    inclusionUploadObj.bgmComments = this.getBrownMilkyComment(inclusionUploadObj.brown, inclusionUploadObj.milky);

    return inclusionUploadObj;
  }

  public async onFilterSubmit(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        var isNonIncluded = false;
        if (this.filterOption == 'nonIncluded')
          isNonIncluded = true;

        this.inclusionFilter.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : []; 
        let result = await this.inclusionUploadService.getInventoriesByInclusionFilter(this.inclusionFilter, this.fxCredentials?.id ?? 'noEmpId', isNonIncluded);
        if (result) {
          this.inclusionExcelItems = [];
          result.forEach(z => {
            let newData = this.mappingInventoryToInclusionData(z, true);
            this.inclusionExcelItems.push(newData);
          });
          this.loadItems(this.inclusionExcelItems);
          this.spinnerService.hide();
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Add Edit Update
  public async addInclusionData(form: NgForm, action: boolean) {
    try {
      if (this.inclusionUploadObj && this.inclusionUploadObj.brown && this.inclusionUploadObj.milky)
        this.inclusionUploadObj.bgmComments = this.getBrownMilkyComment(this.inclusionUploadObj.brown, this.inclusionUploadObj.milky);

      if (form.valid) {
        if (this.inclusionExcelItems.length > 0) {
          let existsIndex = this.inclusionExcelItems.findIndex(z => z.stoneId.toLowerCase() == this.inclusionUploadObj.stoneId.toLowerCase());
          if (existsIndex != -1)
            this.inclusionExcelItems[existsIndex] = this.inclusionUploadObj;
          else
            this.inclusionExcelItems.push(this.inclusionUploadObj);
        }
        else
          this.inclusionExcelItems.push(this.inclusionUploadObj);

        this.clearFormData(form, action);
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong on save data, try again later!');
    }
  }

  public async editInclusionData() {
    let data = this.inclusionExcelItems.find(z => z.stoneId == this.mySelection[0]) ?? new InclusionExcelItems;
    this.inclusionUploadObj = { ...data };

    await this.getInventoryMeasurementData();
    this.isInclusionUpload = true;
    this.insertFlag = false;
  }

  public async uploadInclusionResultFile() {
    if (this.inclusionExcelItems.length > 0) {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to update?", "Update")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              let saveData = this.inclusionExcelItems.filter(z => this.mySelection.includes(z.stoneId) && (z.isDisabled == false || z.isDisabled == null));
              let stoneIds = new Array<string>();
              if (saveData.length > keys.batchWiseSaveLimit) {
                let batches = Math.ceil(saveData.length / keys.batchWiseSaveLimit);

                for (let index = 0; index < batches; index++) {
                  let startIndex = keys.batchWiseSaveLimit * index;
                  let batchInvs = saveData.slice(startIndex, startIndex + keys.batchWiseSaveLimit);
                  let res = await this.uploadInclusionResultFileByBatch(batchInvs);
                  stoneIds.push(...res);
                }
              }
              else
                stoneIds = await this.uploadInclusionResultFileByBatch(saveData);

              if (stoneIds && stoneIds.length > 0) {
                this.utilityService.showNotification(stoneIds.length + ` Inclusion data have been successfully updated!`);
                this.utilityService.showNotification(`${stoneIds.length} stone(s) grade updated!`);

                this.inclusionExcelItems = this.inclusionExcelItems.filter(z => !stoneIds.includes(z.stoneId) || z.isDisabled == true);
                this.loadItems(this.inclusionExcelItems);

                this.mySelection = [];
                this.spinnerService.hide();
              }
              else {
                this.utilityService.showNotification(`Inclusion have been successfully uploaded!`);
                this.mySelection = [];
                this.spinnerService.hide();
              }
            }
            catch (error: any) {
              console.error(error);
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong on upload data, try again later!');
            }
          }
        });
    }
    else {
      this.spinnerService.hide();
      this.utilityService.showNotification(`Something went wrong while adding new Inclusion`)
    }
  }

  public async uploadInclusionResultFileByBatch(data: InclusionExcelItems[]): Promise<string[]> {
    try {
      let result = await this.inclusionUploadService.saveInclusionFile(data);
      if (result && result.length > 0)
        return await this.UpdateInvGrade(result);
      return [];
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on upload data, try again later!');
      return [];
    }
  }

  public async UpdateInvGrade(invs: InventoryItems[]): Promise<string[]> {
    try {
      let req: GradeSearchItems[] = [];
      invs.forEach(z => {
        let obj: GradeSearchItems = new GradeSearchItems();
        obj.id = z.stoneId?.toUpperCase();
        obj.lab = "GIA"//z.lab?.toUpperCase() ?? 'GIA';
        obj.shape = z.shape?.toUpperCase();
        obj.size = Number(z.weight);
        obj.color = z.color?.toUpperCase();
        obj.clarity = z.clarity?.toUpperCase();
        obj.cut = z.cut?.toUpperCase();
        obj.polish = z.polish?.toUpperCase();
        obj.sym = z.symmetry?.toUpperCase();
        obj.fluo = z.fluorescence?.toUpperCase();

        let inclusionData: InclusionPrice = new InclusionPrice();

        inclusionData.brown = z.inclusion.brown?.toUpperCase();
        inclusionData.green = z.inclusion.green?.toUpperCase();
        inclusionData.milky = z.inclusion.milky?.toUpperCase();
        inclusionData.shade = z.inclusion.shade?.toUpperCase();
        inclusionData.sideBlack = z.inclusion.sideBlack?.toUpperCase();
        inclusionData.centerBlack = z.inclusion.centerBlack?.toUpperCase();
        inclusionData.sideWhite = z.inclusion.sideWhite?.toUpperCase();
        inclusionData.centerWhite = z.inclusion.centerWhite?.toUpperCase();
        inclusionData.openTable = z.inclusion.openTable?.toUpperCase();
        inclusionData.openCrown = z.inclusion.openCrown?.toUpperCase();
        inclusionData.openPavilion = z.inclusion.openPavilion?.toUpperCase();
        inclusionData.openGirdle = z.inclusion.openGirdle?.toUpperCase();
        if (z.inclusion.girdleCondition && z.inclusion.girdleCondition.length > 0)
          inclusionData.girdleCond.push(z.inclusion.girdleCondition?.toUpperCase());
        inclusionData.eFOC = z.inclusion.efoc?.toUpperCase();
        inclusionData.eFOP = z.inclusion.efop?.toUpperCase();
        inclusionData.culet = z.inclusion.culet?.toUpperCase();
        inclusionData.hNA = z.inclusion.hna?.toUpperCase();
        inclusionData.eyeClean = z.inclusion.eyeClean?.toUpperCase();
        inclusionData.naturalOnGirdle = z.inclusion.naturalOnGirdle?.toUpperCase();
        inclusionData.naturalOnCrown = z.inclusion.naturalOnCrown?.toUpperCase();
        inclusionData.naturalOnPavillion = z.inclusion.naturalOnPavillion?.toUpperCase();
        inclusionData.flColor = z.inclusion.flColor?.toUpperCase();
        inclusionData.luster = z.inclusion.luster?.toUpperCase();
        inclusionData.bowTie = z.inclusion.bowtie?.toUpperCase();
        inclusionData.certiComment = z.inclusion.certiComment?.toUpperCase();

        let ktos = z.inclusion.ktoS?.split(',');
        if (ktos && ktos.length > 0) {
          inclusionData.kToS = [];
          for (let index = 0; index < ktos.length; index++) {
            const element = ktos[index];
            inclusionData.kToS.push(element.trim());
            obj.ktoS.push(element.trim());
          }
        }

        obj.inclusion = inclusionData;
        obj.measurement = this.mappingMeasListForGrading(z.measurement);

        let girdleData: GirdleDNorm = new GirdleDNorm();
        girdleData.min = z.measurement.minGirdle?.toUpperCase();
        girdleData.max = z.measurement.maxGirdle?.toUpperCase();

        obj.girdle = girdleData;
        obj.certComment = [];

        req.push(obj);

      });

      let res = await this.measureGradeService.getPrice(req);
      if (res) {
        invs.forEach(z => {
          var grade = res.find(a => a.id == z.stoneId);
          if (grade != null) {
            z.inclusion.iGrade = grade.iGrade;
            z.measurement.mGrade = grade.mGrade;
          }
        });

        await this.updateInclusionDataInFrontOffice(invs);
        return await this.inclusionUploadService.updateInventoryGrading(res);
      }
      return [];
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong when get grade.');
      return [];
    }
  }

  private mappingMeasListForGrading(measurment: InventoryItemMeasurement): MeasItems[] {
    let list: MeasItems[] = [];

    let measurData: MeasItems = new MeasItems();
    if (measurment.depth) {
      measurData.type = 'Depth';
      measurData.value = Number(measurment.depth);
      list.push(measurData);
    }

    if (measurment.table) {
      measurData = new MeasItems();
      measurData.type = 'Table';
      measurData.value = Number(measurment.table);
      list.push(measurData);
    }

    if (measurment.length) {
      measurData = new MeasItems();
      measurData.type = 'Length';
      measurData.value = Number(measurment.length);
      list.push(measurData);
    }

    if (measurment.width) {
      measurData = new MeasItems();
      measurData.type = 'Width';
      measurData.value = Number(measurment.width);
      list.push(measurData);
    }

    if (measurment.height) {
      measurData = new MeasItems();
      measurData.type = 'Height';
      measurData.value = Number(measurment.height);
      list.push(measurData);
    }

    if (measurment.crownHeight) {
      measurData = new MeasItems();
      measurData.type = 'CrHeight';
      measurData.value = Number(measurment.crownHeight);
      list.push(measurData);
    }

    if (measurment.crownAngle) {
      measurData = new MeasItems();
      measurData.type = 'CrAngle';
      measurData.value = Number(measurment.crownAngle);
      list.push(measurData);
    }

    if (measurment.pavilionDepth) {
      measurData = new MeasItems();
      measurData.type = 'PavDepth';
      measurData.value = Number(measurment.pavilionDepth);
      list.push(measurData);
    }

    if (measurment.pavilionAngle) {
      measurData = new MeasItems();
      measurData.type = 'PavAngle';
      measurData.value = Number(measurment.pavilionAngle);
      list.push(measurData);
    }

    if (measurment.ratio) {
      measurData = new MeasItems();
      measurData.type = 'Ratio';
      measurData.value = Number(measurment.ratio);
      list.push(measurData);
    }

    if (measurment.girdlePer) {
      measurData = new MeasItems();
      measurData.type = 'GirdlePer';
      measurData.value = Number(measurment.girdlePer);
      list.push(measurData);
    }

    return list;
  }

  private async updateInclusionDataInFrontOffice(invs: InventoryItems[]) {
    try {
      let inclusionData: UpdateInclusionData[] = [];
      invs.forEach(z => {
        let obj: UpdateInclusionData = new UpdateInclusionData();
        obj.stoneId = z.stoneId;

        obj.depth = z.measurement.depth;
        obj.table = z.measurement.table;
        obj.length = z.measurement.length;
        obj.width = z.measurement.width;
        obj.height = z.measurement.height;
        obj.crownHeight = z.measurement.crownHeight;
        obj.crownAngle = z.measurement.crownAngle;
        obj.pavilionDepth = z.measurement.pavilionDepth;
        obj.pavilionAngle = z.measurement.pavilionAngle;
        obj.girdlePer = z.measurement.girdlePer;
        obj.minGirdle = z.measurement.minGirdle;
        obj.maxGirdle = z.measurement.maxGirdle;
        obj.ratio = z.measurement.ratio;

        obj.brown = z.inclusion.brown;
        obj.green = z.inclusion.green;
        obj.milky = z.inclusion.milky;
        obj.shade = z.inclusion.shade;
        obj.centerBlack = z.inclusion.centerBlack;
        obj.sideBlack = z.inclusion.sideBlack;
        obj.openCrown = z.inclusion.openCrown;
        obj.openTable = z.inclusion.openTable;
        obj.openPavilion = z.inclusion.openPavilion;
        obj.openGirdle = z.inclusion.openGirdle;
        obj.girdleCondition = z.inclusion.girdleCondition;
        obj.efoc = z.inclusion.efoc;
        obj.efop = z.inclusion.efop;
        obj.culet = z.inclusion.culet;
        obj.hna = z.inclusion.hna;
        obj.eyeClean = z.inclusion.eyeClean;
        obj.naturalOnGirdle = z.inclusion.naturalOnGirdle;
        obj.naturalOnCrown = z.inclusion.naturalOnCrown;
        obj.naturalOnPavillion = z.inclusion.naturalOnPavillion;
        obj.bowtie = z.inclusion.bowtie;
        obj.ktoS = z.inclusion.ktoS;
        obj.flColor = z.inclusion.flColor;

        obj.comment = z.comments;
        obj.bgmComments = z.bgmComments;

        obj.iGrade = z.inclusion.iGrade;
        obj.mGrade = z.measurement.mGrade;

        inclusionData.push(obj);
      });

      await this.commuteService.updateInclusion(inclusionData);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Inclusion not update in front office!', 'error');
    }
  }

  public async onSelectExcelFile(event: Event) {
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
        this.clearGrid();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          var inclusionFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

          if (inclusionFetchExcelItems && inclusionFetchExcelItems.length > 0) {
            this.inclusionExcelItems = new Array<any>();

            for (let j = 0; j < inclusionFetchExcelItems.length; j++) {
              Object.keys(inclusionFetchExcelItems[j]).map(key => {
                if (key.toLowerCase().trim() != key) {
                  inclusionFetchExcelItems[j][key.toLowerCase().trim()] = inclusionFetchExcelItems[j][key];
                  delete inclusionFetchExcelItems[j][key];
                }
              });

              let newItem = this.mappingExcelDataToInvExcelItems(inclusionFetchExcelItems, j);
              this.inclusionExcelItems.push(newItem);
            }

            if (this.inclusionExcelItems && this.inclusionExcelItems.length > 0)
              await this.checkValidationForAll(this.inclusionExcelItems);

            this.loadItems(this.inclusionExcelItems);
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

  public mappingExcelDataToInvExcelItems(excelData: any, excelIndex: number): InclusionExcelItems {
    let newItem: InclusionExcelItems = new InclusionExcelItems();

    newItem.stoneId = excelData[excelIndex]["LOATNO".toLowerCase()]?.toString().trim(),
      newItem.shape = null as any,
      newItem.depth = null as any,
      newItem.table = null as any,
      newItem.length = null as any,
      newItem.width = null as any,
      newItem.height = null as any,
      newItem.crownHeight = null as any,
      newItem.crownAngle = null as any,
      newItem.pavilionDepth = null as any,
      newItem.pavilionAngle = null as any,
      newItem.girdlePer = null as any,
      newItem.minGirdle = null as any,
      newItem.maxGirdle = null as any,
      newItem.ratio = null as any,
      newItem.brown = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["3"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1)),
      newItem.green = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["4"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1)),
      newItem.milky = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["2"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1)),
      newItem.shade = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["1"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('shade') !== -1)),
      newItem.centerBlack = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["5"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('centerblack') !== -1)),
      newItem.sideBlack = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["6"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('sideblack') !== -1)),
      newItem.openCrown = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["8"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('opencrown') !== -1)),
      newItem.openTable = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["7"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('opentable') !== -1)),
      newItem.openPavilion = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["10"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('openpavilion') !== -1)),
      newItem.openGirdle = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["9"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('opengirdle') !== -1)),
      newItem.naturalOnGirdle = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["12"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('naturalongirdle') !== -1)),
      newItem.naturalOnCrown = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["11"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('naturaloncrown') !== -1)),
      newItem.naturalOnPavillion = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["13"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('naturalonpavilion') !== -1)),
      newItem.efoc = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["14"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('efoc') !== -1)),
      newItem.efop = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["15"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('efop') !== -1)),
      newItem.culet = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["18"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1)),
      newItem.hna = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["17"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('hna') !== -1)),
      newItem.eyeClean = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["16"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('eyeclean') !== -1)),
      newItem.girdleCondition = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["19"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('girdlecondition') !== -1)),
      newItem.bowtie = this.getDisplayNameFromMasterDNormByPriority(excelData[excelIndex]["20"]?.toString().trim(), this.inclusionData.filter(item => item.type.toLowerCase().indexOf('bowtie') !== -1)),
      newItem.isDisabled = false,
      newItem.updatedBy = this.fxCredentials?.id;
    newItem.bgmComments = this.getBrownMilkyComment(newItem.brown, newItem.milky);

    return newItem;
  }

  public getDisplayNameFromMasterDNormByPriority(priority: string, list: MasterDNorm[]): string {
    let name = list.find(z => z.priority == priority)?.name;
    return name ?? null as any;
  }

  public async checkValidationForAll(existData: InclusionExcelItems[]) {
    try {
      let notValidRap: string[] = [];

      //#region validation for non exist stones
      let fetchExcelIds: string[] = existData.map((x: InclusionExcelItems) => x.stoneId);
      this.existStoneIds = await this.inclusionUploadService.getStoneIdsExistOrNotAsync(fetchExcelIds);
      if (this.existStoneIds) {
        let notExistsIds = existData.filter(z => !this.existStoneIds.includes(z.stoneId)).map(z => z.stoneId);
        this.validateValues(existData, notExistsIds, "StoneId not Exist");
        notValidRap = notValidRap.filter(z => notExistsIds.includes(z));
      }
      //#endregion

      //#region validation for exists data
      let fetchNotExistsData: string[] = existData.filter(z => this.checkDataExist(z)).map((x: InclusionExcelItems) => x.stoneId);
      // if (fetchNotExistsData.length > 0) {
      //   this.validateValues(existData, fetchNotExistsData, "Data missing", true);
      //   notValidRap = notValidRap.filter(z => fetchNotExistsData.includes(z));
      // }
      //#endregion

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public checkDataExist(data: InclusionExcelItems): boolean {
    return data.brown == null || data.green == null || data.milky == null || data.shade == null || data.centerBlack == null
      || data.sideBlack == null || data.openCrown == null || data.openTable == null || data.openPavilion == null || data.openGirdle == null
      || data.girdleCondition == null || data.efoc == null || data.efop == null || data.culet == null || data.hna == null
      || data.eyeClean == null || data.naturalOnGirdle == null || data.naturalOnCrown == null || data.naturalOnPavillion == null || data.bowtie == null;
  }

  public validateValues(data: any, ids: string[], message: string, isDataMissing: boolean = false) {
    ids.forEach(element => {
      let messageArray = [];
      messageArray.push(message)
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0) {
        let messageIndex = this.errorMessagesByStoneId[findErrorIndex].messageList.findIndex(x => x == message);
        if (messageIndex < 0)
          this.errorMessagesByStoneId[findErrorIndex].messageList.push(message)
      }
      else
        this.errorMessagesByStoneId.push({ stoneId: element, messageList: messageArray });
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = true;
        data[index].isDataMissing = isDataMissing;
      }
    });
  }

  public async updateData(data: InclusionExcelItems) {
    if (data.isDataMissing) {
      this.inclusionUploadObj = { ...data };

      await this.getInventoryMeasurementData();
      this.isInclusionUpload = true;
      this.insertFlag = false;
    }
  }
  //#endregion

  //#region OnChange Functions
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.inclusionFilter = new InclusionFilter();
    this.filterOption = '';
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public filterData() {
    if (this.searchStoneId.length > 0) {
      let filterInclusionItem: InclusionExcelItems[] = JSON.parse(JSON.stringify(this.inclusionExcelItems));
      filterInclusionItem = filterInclusionItem.filter(z => this.utilityService.ApplyStringFilter(z.stoneId, this.searchStoneId));
      this.loadItems(filterInclusionItem);
    }
    else
      this.loadItems(this.inclusionExcelItems);
    this.isFilter = false;
  }

  public clearFilterData() {
    this.searchStoneId = '';
    this.loadItems(this.inclusionExcelItems);
    this.isFilter = false;
  }

  public clearFormData(form?: NgForm, action: boolean = false) {
    this.inclusionUploadObj = new InclusionExcelItems();
    form?.reset();
    this.loadItems(this.inclusionExcelItems);
    this.isInclusionUpload = action;
  }

  public calculateDept(target: InclusionExcelItems): void {
    if (target.height && (target.length || target.width)) {
      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));
      if (target.shape?.toLowerCase() == 'rbc')
        target.depth = ((target.height ?? 0) / (target.length ?? 0)) * 100;
      else if (target.shape?.toLowerCase() == 'hb') {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) < (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      else {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) > (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      if (target.depth == Infinity || target.depth == 0)
        target.depth = null as any;
      else
        target.depth = this.utilityService.ConvertToFloatWithDecimal(target.depth ?? 0);
    }
    else
      target.depth = null as any;
  }

  public clearGrid(): void {
    this.isShowCheckBoxAll = true;
    this.inclusionExcelItems = [];
    this.inclusionUploadObj = new InclusionExcelItems();
    this.selectedInclusionExcelItems = [];
    this.errorMessagesByStoneId = [];
    this.mySelection = [];
    this.loadItems(this.inclusionExcelItems);
  }

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }

  public loadItems(grid_data: InclusionExcelItems[]) {
    this.gridView = {
      data: grid_data,
      total: grid_data.length
    }

    this.totalPcs = grid_data.length;
    this.spinnerService.hide();
  }

  public cellClickHandler(e: any) {
    this.mySelection = [];
    this.selectedInclusionExcelItems = [];
    if (!e.dataItem.isDisabled) {
      this.mySelection.push(e.dataItem.stoneId);
      this.selectedInclusionExcelItems.push(e.dataItem);
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    if (this.inclusionExcelItems && this.inclusionExcelItems.length > 0)
      this.groupInventoryExcel();
  }

  private groupInventoryExcel(): void {
    if (this.groups.length > 0)
      this.gridView = process(this.inclusionExcelItems, { group: this.groups });
    else
      this.loadItems(this.inclusionExcelItems);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    if (this.inclusionExcelItems && this.inclusionExcelItems.length > 0)
      this.sortInventoryExcel()
  }

  private sortInventoryExcel(): void {
    this.gridView = {
      data: orderBy(this.gridView.data, this.sort),
      total: this.inclusionExcelItems.length
    };
  }

  public isDisabled(args: RowClassArgs) {
    return {
      'k-state-disabled': args.dataItem.isDisabled === true
    };
  }

  public openInclusionUploadDialog(): void {
    this.inclusionUploadObj = new InclusionExcelItems();
    this.mySelection = [];
    this.isInclusionUpload = true;
  }

  public toggleMeasurement() {
    this.isVisibleM = !this.isVisibleM;
  }

  public closeInclusionUploadDialog(): void {
    this.isInclusionUpload = false;
  }

  public FilterToggle(): void {
    this.isFilter = !this.isFilter;
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  private getBrownMilkyComment(brown: string, milky: string): string {
    var comment = "";

    if (this.brownList.length > 0 && this.milkyList.length > 0) {
      if (this.brownList.length > 0 && brown != null && brown.length > 0)
        brown = this.getDisplayNameFromMasterDNorm(brown, this.brownList);

      if (this.milkyList.length > 0 && milky != null && milky.length > 0)
        milky = this.getDisplayNameFromMasterDNorm(milky, this.milkyList);

      comment = brown + " " + milky;
    }

    return comment;
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name != null) {
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName.toLowerCase() == name.toLowerCase() || c.optionalWords != null && c.optionalWords.map(u => u.toLowerCase()).includes(name.toLowerCase()));
      return obj?.displayName ?? null as any;
    }
    else
      return null as any;
  }
  //#endregion

}
