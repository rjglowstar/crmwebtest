import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { IncMeasureGradeLookup } from 'shared/businessobjects';
import { InclusionConfig } from 'shared/enitites';
import { InclusionExcelItems } from '../../businessobjects';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class InclusionuploadService {

  public controllerName: string = 'InclusionUpload';

  constructor(private http: HttpClient) { }

  public async getStoneIdsExistOrNotAsync(ids: string[]): Promise<string[]> {
    const post$=this.http.post(keys.apiUrl + this.controllerName + "/GetStoneIdsExistOrNotAsync/", ids);

    var result=await lastValueFrom(post$) as string[];
    return result;
  }

  public async getInventoryByStoneId(stoneId: string): Promise<InventoryItems> {
    const get$=this.http.get(keys.apiUrl + this.controllerName + "/GetByStoneId/" + stoneId);

    var result=await lastValueFrom(get$) as InventoryItems;
    return result;
  }

  public async getInventoriesByInclusionFilter(inclusionFilter: InclusionConfig, empId: string, isInclude: boolean): Promise<InventoryItems[]> {
    const post$=this.http.post(keys.apiUrl + this.controllerName + "/GetInventoriesByInclusionFilter/" + empId + "/" + isInclude, inclusionFilter);

    var result=await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async saveInclusionFile(inclusionExcelItems: InclusionExcelItems[]): Promise<InventoryItems[]> {
    const post$=this.http.post(keys.apiUrl + this.controllerName + "/UploadInclusionFile/", inclusionExcelItems);

    var result=await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async updateInventoryGrading(data: IncMeasureGradeLookup[]): Promise<string[]> {
    data.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$=this.http.put(keys.apiUrl + this.controllerName + "/UpdateInventoryGrading", data);

    var result=await lastValueFrom(put$) as string[];
    return result;
  }
}