import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { SpecialStoneCriteria } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class SpecialstonecriteriaService {
  private url = keys.apiUrl + 'SpecialStoneCriteria/';

  constructor(private http: HttpClient) { }

  public async criteriaInsert(specialStoneData: SpecialStoneCriteria): Promise<string> {
    const post$ = this.http.post(this.url + "Insert", specialStoneData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async criteriaUpdate(specialStoneData: SpecialStoneCriteria): Promise<boolean> {
    specialStoneData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.url + "Update", specialStoneData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getSpecialStoneCriteriaById(id: string): Promise<SpecialStoneCriteria[]> {
    const get$ = this.http.get(this.url + "Get/" + id);

    var result = await lastValueFrom(get$) as SpecialStoneCriteria[];
    return result;
  }

  public async getAllSpecialStoneCriteria(): Promise<SpecialStoneCriteria[]> {
    let specialStoneCriteria = JSON.parse(sessionStorage.getItem("SpecialStoneCriteria")!) as SpecialStoneCriteria[];
    if (!specialStoneCriteria) {
      const get$ = this.http.get(this.url + "GetAll");
      specialStoneCriteria = await lastValueFrom(get$) as SpecialStoneCriteria[];
      if (specialStoneCriteria)
        sessionStorage.setItem("SpecialStoneCriteria", JSON.stringify(specialStoneCriteria));
    }
    return specialStoneCriteria
  }

  public async deleteCriteria(id: string): Promise<boolean> {
    const delete$ = this.http.delete(this.url + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }
}

