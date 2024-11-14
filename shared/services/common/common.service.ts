import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { City, Country, State } from 'shared/businessobjects';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  constructor(private http: HttpClient) { }

  async getCountries(): Promise<Country[]> {
    const get$ = this.http.get(keys.apiUrl + "GeoLocation/GetCountries");

    var result = await lastValueFrom(get$) as Country[];
    return result;
  }

  async getStatesByCountryCode(country_code: string): Promise<State[]> {
    const get$ = this.http.get(keys.apiUrl + "GeoLocation/GetStates/" + country_code);

    var result = await lastValueFrom(get$) as State[];
    return result;
  }

  async getCitiesByCountryCodeandStateCode(country_code: string, state_code: string): Promise<City[]> {
    const get$ = this.http.get(keys.apiUrl + "GeoLocation/GetCities/" + state_code + "/" + country_code);

    var result = await lastValueFrom(get$) as City[];
    return result;
  }
}