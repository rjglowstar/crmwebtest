import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { listCurrencyType, OriginValue, UtilityService, FileStoreService, listAnnounceType } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { StoneNameChangeItem } from '../../businessobjects/common/stonenamechangeitem';
import { StoneNameResultItem } from '../../businessobjects/common/stonenameresultitem';
import { Configurations, CurrencyType, RejectedOfferCriteria, SystemUser } from '../../entities';
import { CommuteService, ConfigurationService, MasterConfigService, SupplierService, SystemUserService } from '../../services';
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  @ViewChild('thumbnailImageGlowstar') thumbnailImageGlowstar!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailImageDiamanto') thumbnailImageDiamanto!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailImageDiamarthk') thumbnailImageDiamarthk!: ElementRef<HTMLInputElement>;
  public configurations: Configurations = new Configurations();
  public tempConfigurations: Configurations = new Configurations();
  public currencyTypeObj: CurrencyType = new CurrencyType();
  public currencyTypes: CurrencyType[] = [];
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public adminItems: SystemUser[] = Array<SystemUser>();
  public listAdmins: Array<{ text: string; value: string }> = [];
  public selectedAdmin!: { text: string; value: string };
  public selectedCustVeriUser!: { text: string; value: string };
  public selectedAddDiscUser!: { text: string; value: string };
  public selectedLeadPartyChangeUser!: { text: string; value: string };
  public selectedLeadRejUser!: { text: string; value: string };
  public selectedSalesOrderCancelUser!: { text: string; value: string };
  public selectedCustNameChangeUser!: { text: string; value: string };
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public masterConfigList!: MasterConfig;
  public ShapesList: MasterDNorm[] = [];
  public rejectedOfferCriteriaObj: RejectedOfferCriteria = new RejectedOfferCriteria();
  public rejectedOfferCriteriaes: RejectedOfferCriteria[] = [];
  public rejectedOfferIndex: number = -1;
  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public imagePreviewGlowstar: any;
  public imagePreviewDiamarthk: any;
  public imagePreviewDiamanto: any;
  public listAnnounceType = listAnnounceType;
  public isImgselectedGlowstar: boolean = false;
  public isImgselectedDiamanto: boolean = false;
  public isImgselectedDiamarthk: boolean = false;
  public imageTitles = ['announce_glowstar.jpg', 'announce_diamarthk.jpg', 'announce_diamanto.jpg'];
  private arrayBuffer: any;

  constructor(private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public configurationService: ConfigurationService,
    public commuteService: CommuteService,
    public systemUserService: SystemUserService,
    private masterConfigService: MasterConfigService,
    private supplierService: SupplierService,
    private fileStoreService: FileStoreService,) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    try {
      this.spinnerService.show();
      let res = await this.configurationService.getConfiguration();
      if (res) {
        this.tempConfigurations = JSON.parse(JSON.stringify(res));
        this.configurations = JSON.parse(JSON.stringify(res));
        this.currencyTypes = [...this.configurations.currencyTypes]
        this.rejectedOfferCriteriaes = [...this.configurations.rejectedOfferCriteriaes]
        this.selectedAdmin = { text: res.adminUser?.fullName, value: res.adminUser?.id };
        this.selectedCustVeriUser = { text: res.custVerificationUser?.fullName, value: res.custVerificationUser?.id };
        this.selectedAddDiscUser = { text: res.addDiscountUser?.fullName, value: res.addDiscountUser?.id };
        this.selectedLeadPartyChangeUser = { text: res.leadPartyChangeUser?.fullName, value: res.leadPartyChangeUser?.id };
        this.selectedLeadRejUser = { text: res.leadRejectedUser?.fullName, value: res.leadRejectedUser?.id };
        this.selectedSalesOrderCancelUser = { text: res.salesOrderCancelUser?.fullName, value: res.salesOrderCancelUser?.id };
        this.selectedCustNameChangeUser = { text: res.custNameChangeUser?.fullName, value: res.custNameChangeUser?.id };
        await this.getImagePath(this.imageTitles);
      }
      Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });

      this.adminItems = await this.systemUserService.getSystemUserByOrigin(OriginValue.Admin.toString());
      this.listAdmins = [];
      this.adminItems.forEach((z: SystemUser) => { this.listAdmins.push({ text: z.fullName, value: z.id }); });
      await this.getMasterConfigData();
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.ShapesList = this.masterConfigList.shape;
    let allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.name, isChecked: false }); });


  }
  //#endregion

  public async updateConfigurationData() {
    try {
      this.configurations.currencyTypes = this.currencyTypes;
      this.configurations.rejectedOfferCriteriaes = this.rejectedOfferCriteriaes;
      if (JSON.stringify(this.tempConfigurations) == JSON.stringify(this.configurations)) {
        this.utilityService.showNotification('Configuration updated successfully!');
        return;
      }
      this.spinnerService.show();
      var res = await this.configurationService.updateConfiguration(this.configurations);
      if (res) {
        this.utilityService.showNotification('Configuration updated successfully!');
        await this.defaultMethodsLoad();
        this.spinnerService.hide();
      } else {
        this.alertDialogService.show('Something went wrong on save data, Try again later!');
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onCurrencySubmit(form: NgForm) {
    if (form.valid) {
      let findIndex = this.currencyTypes.findIndex(
        x => x.fromCurrency.toLowerCase() == this.currencyTypeObj.fromCurrency.toString().toLowerCase() &&
          x.toCurrency.toLowerCase() == this.currencyTypeObj.toCurrency.toString().toLowerCase()
      );
      if (findIndex > -1) {
        this.currencyTypes.splice(findIndex, 1);
      }
      let Obj = { ...this.currencyTypeObj }
      this.currencyTypes.push(Obj);
      form?.reset();
      setTimeout(() => {
        this.currencyTypeObj = new CurrencyType();
      }, 0);
    }
    else {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
    }
  }

  public deleteCurrencyType(currencyType: CurrencyType, index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag)
          this.currencyTypes.splice(this.currencyTypes.indexOf(currencyType), 1);
      });
  }

  public editCurrencyType(currencyType: CurrencyType, index: number) {
    this.currencyTypeObj = JSON.parse(JSON.stringify(currencyType));
  }

  /* #region  Rejected Offer Criteria section */
  public onRejectedOfferSubmit(form: NgForm) {
    if (form.valid) {
      let Obj = { ...this.rejectedOfferCriteriaObj }
      if (this.rejectedOfferIndex >= 0)
        this.rejectedOfferCriteriaes[this.rejectedOfferIndex] = Obj;
      else {
        let findIndex = this.rejectedOfferCriteriaes.findIndex(
          x => x.shapes.join(",").toLowerCase() == this.rejectedOfferCriteriaObj.shapes.join(",").toLowerCase() && x.weightMin == this.rejectedOfferCriteriaObj.weightMin &&
            x.weightMax == this.rejectedOfferCriteriaObj.weightMax
        );
        if (findIndex > -1) {
          form?.reset();
          setTimeout(() => {
            this.rejectedOfferCriteriaObj = new RejectedOfferCriteria();
          }, 0);
          return this.alertDialogService.show(`Your criteria have been already exist!`)
        }
        this.rejectedOfferCriteriaes.push(Obj);
      }
      form?.reset();
      setTimeout(() => {
        this.rejectedOfferCriteriaObj = new RejectedOfferCriteria();
      }, 0);
    }
    else {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
    }
  }

  public deleteRejectedOffer(rejectedOfferCriteria: RejectedOfferCriteria, index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag)
          this.rejectedOfferCriteriaes.splice(this.rejectedOfferCriteriaes.indexOf(rejectedOfferCriteria), 1);
      });
  }

  public editRejectedOffer(rejectedOfferCriteria: RejectedOfferCriteria, index: number) {
    this.rejectedOfferCriteriaObj = JSON.parse(JSON.stringify(rejectedOfferCriteria));
    this.rejectedOfferIndex = index;
  }

  public clearRejectedOffer() {
    this.rejectedOfferCriteriaObj = new RejectedOfferCriteria();
    this.rejectedOfferIndex = -1;
  }
  /* #endregion */

  //#region Value Change Methods
  public adminChange() {
    let fetchAdmin = this.adminItems.find(x => x.id == this.selectedAdmin?.value);
    if (fetchAdmin)
      this.configurations.adminUser = fetchAdmin;
  }

  public custVeriUserChange() {
    let fetchCustVeriUser = this.adminItems.find(x => x.id == this.selectedCustVeriUser?.value);
    if (fetchCustVeriUser)
      this.configurations.custVerificationUser = fetchCustVeriUser;
  }

  public addDiscUserChange() {
    let fetchAddDiscUser = this.adminItems.find(x => x.id == this.selectedAddDiscUser?.value);
    if (fetchAddDiscUser)
      this.configurations.addDiscountUser = fetchAddDiscUser;
  }

  public leadPartyUserChange() {
    let fetchLeadPartyChangeUser = this.adminItems.find(x => x.id == this.selectedLeadPartyChangeUser?.value);
    if (fetchLeadPartyChangeUser)
      this.configurations.leadPartyChangeUser = fetchLeadPartyChangeUser;
  }

  public leadRejUserChange() {
    let fetchLeadRejUser = this.adminItems.find(x => x.id == this.selectedLeadRejUser?.value);
    if (fetchLeadRejUser)
      this.configurations.leadRejectedUser = fetchLeadRejUser;
  }

  public salesOrderCancelUserChange() {
    let fetchOrderCanUser = this.adminItems.find(x => x.id == this.selectedSalesOrderCancelUser?.value);
    if (fetchOrderCanUser)
      this.configurations.salesOrderCancelUser = fetchOrderCanUser;
  }

  public custNameUserChange() {
    let fetchCustNameChangeUser = this.adminItems.find(x => x.id == this.selectedCustNameChangeUser?.value);
    if (fetchCustNameChangeUser)
      this.configurations.custNameChangeUser = fetchCustNameChangeUser;
  }
  //#endregion

  public onSelectChangeStone(files: any): void {
    try {
      this.spinnerService.show();

      let file = files[0];
      let fileReader = new FileReader();

      fileReader.onload = async (e) => {
        this.arrayBuffer = fileReader.result;
        let data = new Uint8Array(this.arrayBuffer);
        let arr = new Array();

        for (let i = 0; i != data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);

        let workbook = xlsx.read(arr.join(""), { type: "binary" });
        let stoneChangeItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

        if (stoneChangeItems && stoneChangeItems.length > 0) {

          let stoneNameChangeitems = new Array<StoneNameChangeItem>();
          if (stoneChangeItems[0]["Old Name"]) {

            for (let i = 0; i < stoneChangeItems.length; i++) {
              let stoneChangeObj = new StoneNameChangeItem();

              stoneChangeObj.oldName = stoneChangeItems[i]["Old Name"].trim();
              stoneChangeObj.newName = stoneChangeItems[i]["New Name"].trim();
              stoneNameChangeitems.push(stoneChangeObj);
            }
          }

          var result = await this.configurationService.stoneNameChange(stoneNameChangeitems);
          if (result && result.length <= 0) {
            this.spinnerService.hide();
            this.alertDialogService.show("Successfully Change Names", "Configuration");
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show(result.map(c => c.stoneId).toString(), "Configuration");
          }
        }
      }

      fileReader.readAsArrayBuffer(file);
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onSelectChangeKapan(files: any): void {
    try {
      this.spinnerService.show();

      this.processStoneData(files)
        .then((results: any) => {
          if (results && results.length > 0)
            this.alertDialogService.show(results.map((c: any) => c.stoneId).toString(), "Problem Occure to this Stone.!");
          else
            this.alertDialogService.show("Successfully change the Name", "Configuration");
        })

    }
    catch (error) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async processStoneData(files: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let kapanNames = new Array<string>();
        var results = new Array<StoneNameResultItem>();

        let file = files[0];
        let fileReader = new FileReader();

        fileReader.onload = async (e) => {
          this.arrayBuffer = fileReader.result;
          let data = new Uint8Array(this.arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          let kapanItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

          if (kapanItems && kapanItems.length > 0) {


            if (kapanItems[0]["KapanName"]) {

              for (let i = 0; i < kapanItems.length; i++)
                kapanNames.push(kapanItems[i]["KapanName"].trim());
            }

            //update kapan in FO for sold stone 
            var invItems = await this.configurationService.changeKapanSoldStone(kapanNames);
            if (invItems && invItems.length > 0) {
              for (let i = 0; i < kapanNames.length; i++) {

                var stoneChangeItems = new Array<StoneNameChangeItem>();

                var invList = invItems.filter(c => c.kapan == kapanNames[i]);
                if (invList && invList.length > 0) {
                  invList.forEach(element => {
                    var obj = new StoneNameChangeItem();
                    obj.oldName = element.stoneId;
                    obj.newName = "CK" + element.stoneId;
                    stoneChangeItems.push(obj);
                  });

                  var result = await this.configurationService.stoneNameChange(stoneChangeItems);
                  if (result && result.length > 0) {
                    results = results.concat(result);
                    resolve(results);
                  }
                }
              }
            }

            // update kapan in all BO for sold stone
            let suplierItems = await this.supplierService.getAllSuppliers();

            for (const suplier of suplierItems) {
              const supplierApi = suplier.apiPath;

              const invItems = await this.commuteService.changeKapanSoldStone(kapanNames, supplierApi);

              if (invItems && invItems.length > 0) {
                var stoneChangeItems = new Array<StoneNameChangeItem>();

                for (const kapanName of kapanNames) {
                  const invList = invItems.filter(c => c.kapan === kapanName);

                  if (invList && invList.length > 0) {
                    invList.forEach(element => {
                      const obj = new StoneNameChangeItem();
                      obj.oldName = element.stoneId;
                      obj.newName = 'CK' + element.stoneId;
                      stoneChangeItems.push(obj);
                    });

                    const result = await this.commuteService.stoneNameChange(stoneChangeItems, supplierApi);
                    if (result && result.length > 0) {
                      results = results.concat(result);
                      resolve(results);
                    }
                  }
                }
              }
            }
          }
        }

        fileReader.onerror = (error) => {
          reject(error);
        };

        fileReader.readAsArrayBuffer(file);
        this.spinnerService.hide();
      }
      catch (error) {
        reject(error);
      }
    });
  }

  public async uploadFiles(form: NgForm, event: Event, imgeName: string) {
    try {
      const target = event.target as HTMLInputElement;
      const acceptedFiles: string[] = (target.accept || '').split(',').map(item => item.trim());

      if (!target.files || !target.files.length) {
        return;
      }

      const file = target.files[0];
      if (!acceptedFiles.includes(file.type)) {
        this.alertDialogService.show('Please select a valid file.');
        return;
      }

      const renamedFile = new File([file], imgeName, { type: file.type });
      if (renamedFile)
        await this.uploadFileOnServer(renamedFile, imgeName);
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong. Please try again later.');
    }
  }

  public async uploadFileOnServer(file: File, imgeName: string) {
    this.fileStoreService.uploadImageByName(file).subscribe(
      async (res: any) => {
        if (res.body?.success) {
          await this.getImagePath([imgeName]);
          this.utilityService.showNotification('Image uploaded successfully!');
        }
      },
      (err: any) => {
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error");
      }
    );
  }

  public async getImagePath(imageTitles: string[]) {
    for (const title of imageTitles) {
      const imageObj = await this.fileStoreService.getAzureFileByName(title);
      if (imageObj && imageObj.length > 0) {
        const firstImageSrc = imageObj[0]?.fileThumbnail;
        if (title === this.listAnnounceType.AnnounceGlowstar) {
          this.imagePreviewGlowstar = this.loadImage(firstImageSrc);
          this.isImgselectedGlowstar = true;
        } else if (title === this.listAnnounceType.AnnounceDiamarthk) {
          this.imagePreviewDiamarthk = this.loadImage(firstImageSrc);
          this.isImgselectedDiamarthk = true;
        } else if (title === this.listAnnounceType.AnnounceDiamanto) {
          this.imagePreviewDiamanto = this.loadImage(firstImageSrc);
          this.isImgselectedDiamanto = true;
        }
      }
    }
  }

  private loadImage(imageSrc: string): string | null {
    return (imageSrc && imageSrc.trim() !== "") ? `data:image/jpeg;base64,${imageSrc}` : null;
  }

  public async deleteEventImage(imgeName: string) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let flag = await this.fileStoreService.deletefileByName(imgeName);
          if (flag) {
            if (imgeName === this.listAnnounceType.AnnounceGlowstar) {
              this.imagePreviewGlowstar = "";
              this.thumbnailImageGlowstar!.nativeElement.value = '';
              this.isImgselectedGlowstar = false;
            } else if (imgeName === this.listAnnounceType.AnnounceDiamarthk) {
              this.imagePreviewDiamarthk = "";
              this.thumbnailImageDiamarthk!.nativeElement.value = '';
              this.isImgselectedDiamarthk = false;
            } else if (imgeName === this.listAnnounceType.AnnounceDiamanto) {
              this.imagePreviewDiamanto = "";
              this.thumbnailImageDiamanto!.nativeElement.value = '';
              this.isImgselectedDiamanto = false;
            }
            this.utilityService.showNotification(`Image deleted successfully!`);
          }
          else
            this.alertDialogService.show(`Something went wrong. Please try again!`, 'error');
        }
      });
  }
}