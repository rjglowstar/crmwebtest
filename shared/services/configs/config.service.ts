import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KapanPacketItem } from 'projects/CRM.FrontOffice/src/app/businessobjects/common/kapanpacketitem';
import { StoneNameChangeItem } from 'projects/CRM.FrontOffice/src/app/businessobjects/common/stonenamechangeitem';
import { StoneNameResultItem } from 'projects/CRM.FrontOffice/src/app/businessobjects/common/stonenameresultitem';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {
  controllerPath: string = 'Config/';

  constructor(private http: HttpClient) { }

  public async getMasterGridConfig(pageName: string, gridName: string): Promise<GridMasterConfig> {
    try {
      let gridMasterConfig!: GridMasterConfig;
      if (!gridMasterConfig) {
        const get$ = this.http.get(keys.apiUrl + "Config/GetMasterGridConfig/" + pageName + "/" + gridName);
        gridMasterConfig = await lastValueFrom(get$) as GridMasterConfig;
      }
      return gridMasterConfig;

    }
    catch (error) {
      throw error;
    }
  }

  public async getGridConfig(empId: string, pageName: string, gridName: string, gridDetailConfig: GridDetailConfig[] = []): Promise<GridConfig> {
    try {
      let gridConfig!: GridConfig;
      let gridConfigCollection = new Array<GridConfig>();

      let sesValue = sessionStorage.getItem("GridConfig");
      if (sesValue) {
        gridConfigCollection = JSON.parse(sesValue) as GridConfig[];
        if (gridConfigCollection && gridConfigCollection.length > 0) {
          let config = gridConfigCollection.find(c => c.empID == empId && c.pageName.toLowerCase() == pageName.toLowerCase() && c.gridName.toLowerCase() == gridName.toLowerCase());
          if (config && config.id)
            gridConfig = config;
        }
      }
      if (!gridConfig) {
        const get$ = this.http.get(keys.apiUrl + "Config/GetGridConfig/" + empId + "/" + pageName + "/" + gridName);

        let config = await lastValueFrom(get$) as GridConfig;

        if (config && config.id) {

          //Check if any new column added
          if (gridDetailConfig.length > 0) {
            gridDetailConfig.forEach(item => {
              let exists = config.gridDetail.find(z => z.title == item.title);
              if (exists == null)
                config.gridDetail.push(item);
              else
                exists.propertyName = item.propertyName;
            });
          }

          gridConfigCollection.push(config);
          sessionStorage.setItem("GridConfig", JSON.stringify(gridConfigCollection));
        }
      }

      if (gridConfigCollection && gridConfigCollection.length > 0)
        gridConfig = gridConfigCollection.find(c => c.empID == empId && c.pageName.toLowerCase() == pageName.toLowerCase() && c.gridName.toLowerCase() == gridName.toLowerCase()) || gridConfig;

      return gridConfig;

    }
    catch (error) {
      throw error;
    }
  }

  public async insertGridConfig(gridConfig: GridConfig): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertGridConfig", gridConfig, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async insertMasterGridConfig(gridMasterConfig: GridMasterConfig): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertMasterGridConfig", gridMasterConfig, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateGridConfig(gridConfig: GridConfig): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateGridConfig", gridConfig);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateMasterGridConfig(gridMasterConfig: GridMasterConfig): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateMasterGridConfig", gridMasterConfig);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async stoneNameChange(stoneNameChangeItems: StoneNameChangeItem[]): Promise<StoneNameResultItem[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerPath + "ChangeStoneName", stoneNameChangeItems);

    var result = await lastValueFrom(post$) as StoneNameResultItem[];
    return result;
  }

  public async changeWeeklySummaryKapan(kapans: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerPath + "ChangeWeeklySummaryKapan", kapans);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async changeKapanSoldStone(kapans: string[]): Promise<KapanPacketItem[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerPath + "ChangeKapanSoldStone", kapans);

    var result = await lastValueFrom(post$) as KapanPacketItem[];
    return result;
  }



}