import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { SavedEmail } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class SavedEmailService {
  private api = keys.apiUrl + 'SavedEmail/';

  constructor(private http: HttpClient) { }

  public async searchMail(userId: string, search: string): Promise<string[]> {
    const get$ = this.http.get(this.api + "Search/" + userId + "/" + search);

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async insert(data: SavedEmail[]): Promise<boolean> {
    const post$ = this.http.post(this.api + "Insert", data);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }
}