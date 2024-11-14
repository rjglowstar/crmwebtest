import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { KapanPacketItem } from '../../businessobjects/common/kapanpacketitem';
import { StoneNameChangeItem } from '../../businessobjects/common/stonenamechangeitem';
import { StoneNameResultItem } from '../../businessobjects/common/stonenameresultitem';
import { Configurations, CurrencyType } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class ConfigurationService {
  private api = keys.apiUrl + 'Configuration/';

  constructor(private http: HttpClient) { }

  public async getConfiguration(): Promise<Configurations> {
    const get$ = this.http.get(this.api + "Get");

    var result = await lastValueFrom(get$) as Configurations;
    return result;
  }

  public async updateConfiguration(data: Configurations): Promise<boolean> {
    data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.api + "Update", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getCurrencyTypesList(): Promise<CurrencyType[]> {
    const get$ = this.http.get(this.api + "CurrencyType/GetAll");

    var result = await lastValueFrom(get$) as CurrencyType[];
    return result;
  }

  public getFromToCurrencyRate(fromCurrency: string, toCurrency: string, currencyConfigs: CurrencyType[]): { fromRate: number, toRate: number } {
    let rates: { fromRate: number, toRate: number } = { fromRate: 1, toRate: 1 };

    if (fromCurrency == toCurrency)
      return rates;

    let exists = currencyConfigs.find(z => z.fromCurrency == fromCurrency && z.toCurrency == toCurrency);
    if (exists != null) {
      rates.fromRate = exists.fromRate;
      rates.toRate = exists.toRate;
    }
    else {
      exists = currencyConfigs.find(z => z.fromCurrency == toCurrency && z.toCurrency == fromCurrency);
      if (exists != null) {
        rates.fromRate = exists.fromRate;
        rates.toRate = parseFloat((exists.fromRate / exists.toRate).toFixed(3));
      }
      else {
        rates.fromRate = (fromCurrency && fromCurrency.length > 0) ? 1 : 0.0;
        rates.toRate = 0;
      }
    }

    return rates;
  }

  public async stoneNameChange(stoneNameChangeItems: StoneNameChangeItem[]): Promise<StoneNameResultItem[]> {
    const post$ = this.http.post(this.api + "ChangeStoneName", stoneNameChangeItems);

    var result = await lastValueFrom(post$) as StoneNameResultItem[];
    return result;
  }

  public async changeKapanSoldStone(kapans: string[]): Promise<KapanPacketItem[]> {
    const post$ = this.http.post(this.api + "ChangeKapanSoldStone", kapans);

    var result=await lastValueFrom(post$) as KapanPacketItem[];
    return result;
  }



}