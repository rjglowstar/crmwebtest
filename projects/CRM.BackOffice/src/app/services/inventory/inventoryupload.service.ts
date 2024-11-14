import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventoryExcelItems } from '../../businessobjects';
import { InventoryArrival } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class InventoryUploadService {

  constructor(private http: HttpClient) { }

  public async getInventoryArrivalData(): Promise<InventoryArrival[]> {
    const get$=this.http.get(keys.apiUrl + "InventoryUpload/GetAllArrival");

    var result=await lastValueFrom(get$) as InventoryArrival[];
    return result;
  }

  public async getStoneIdsExistOrNotAsync(ids: string[]): Promise<string[]> {
    const post$=this.http.post(keys.apiUrl + "InventoryUpload/GetStoneIdsExistOrNotAsync/", ids);

    var result=await lastValueFrom(post$) as string[];
    return result;
  }

  public async getStoneIdsExistOrNotForPurchase(ids: string[]): Promise<string[]> {
    const post$=this.http.post(keys.apiUrl + "InventoryUpload/GetStoneIdsExistOrNotForPurchase/", ids);

    var result=await lastValueFrom(post$) as string[];
    return result;
  }

  public async saveInventoryFile(inventoryExcelItems: InventoryExcelItems[], isPurchase = false): Promise<string[]> {
    const post$=this.http.post(keys.apiUrl + "InventoryUpload/UploadInventoryFile/" + isPurchase, inventoryExcelItems);

    var result=await lastValueFrom(post$) as string[];
    return result;
  }

  public async removeInventoryArrivalData(stoneIds: string[]): Promise<number> {
    const post$= this.http.post(keys.apiUrl + "InventoryUpload/RemoveArrivalStones", stoneIds);

    var result=await lastValueFrom(post$) as number;
    return result;
  }

}