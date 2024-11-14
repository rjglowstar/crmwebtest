import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BrokerResponse, BrokerSearchCriteria } from '../../businessobjects';
import { Broker, BrokerDNrom } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class BrokerService {

  public controllerName: string = "Broker";

  constructor(private http: HttpClient) { }

  public async getBrokerById(id: string): Promise<Broker> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/Get/" + id);

    var result = await lastValueFrom(get$) as Broker;
    return result;
  }

  public async getAllBrokers(): Promise<Broker[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetAll");

    var result = await lastValueFrom(get$) as Broker[];
    return result;
  }

  public async getBrokerNames(SearchCriteria: BrokerSearchCriteria, skip: number, take: number): Promise<BrokerResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetPaginated/" + skip + "/" + take, SearchCriteria)

    var result = await lastValueFrom(post$) as BrokerResponse;
    return result;
  }

  public async Insert(Data: Broker): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/Insert", Data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async Update(Data: Broker): Promise<string> {
    Data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/Update", Data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async delete(Id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerName + "/Delete/" + Id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }


  public async getAllBrokerDNorms(): Promise<BrokerDNrom[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetBrokerDNorms");

    var result=await lastValueFrom(get$) as BrokerDNrom[];
    return result;
  }

}