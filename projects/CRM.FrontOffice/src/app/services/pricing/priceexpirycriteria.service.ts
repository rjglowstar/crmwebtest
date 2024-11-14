import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { PriceExpiryCriteria } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class PriceExpiryCriteriaService {
  private url = keys.apiUrl + 'PriceExpiryCriteria/';

  constructor(private http: HttpClient) { }

  public async criteriaInsert(specialStoneData: PriceExpiryCriteria): Promise<string> {
    const post$ = this.http.post(this.url + "Insert", specialStoneData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async criteriaUpdate(specialStoneData: PriceExpiryCriteria): Promise<boolean> {
    specialStoneData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.url + "Update", specialStoneData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getPriceExpiryCriteriaById(id: string): Promise<PriceExpiryCriteria[]> {
    const get$ = this.http.get(this.url + "Get/" + id);

    var result = await lastValueFrom(get$) as PriceExpiryCriteria[];
    return result;
  }

  public async getAllPriceExpiryCriteria(): Promise<PriceExpiryCriteria[]> {
    let priceExpiryCriteria = JSON.parse(sessionStorage.getItem("PriceExpiryCriteria")!) as PriceExpiryCriteria[];
    if (!priceExpiryCriteria) {
      const get$ = this.http.get(this.url + "GetAll");
      priceExpiryCriteria = await lastValueFrom(get$) as PriceExpiryCriteria[];
      if (priceExpiryCriteria)
        sessionStorage.setItem("PriceExpiryCriteria", JSON.stringify(priceExpiryCriteria));
    }
    return priceExpiryCriteria
  }

  public async deleteCriteria(id: string): Promise<boolean> {
    const delete$ = this.http.delete(this.url + "Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }
}

