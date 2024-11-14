import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { GradingMaster } from '../../entities/grading/gradingmaster';

@Injectable({
  providedIn: 'root'
})

export class GradingService {
  private controllerUrl = 'Lab/';

  constructor(private http: HttpClient) { }

  public async GetGradingFromStoneIds(ids: string[], orgApi: string): Promise<GradingMaster[]> {
    const post$ = this.http.post(orgApi + this.controllerUrl + "GetGradingFromStoneIds", ids);

    var result=await lastValueFrom(post$) as GradingMaster[];
    return result;
  }

}