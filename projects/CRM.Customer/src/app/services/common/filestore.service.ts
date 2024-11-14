import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { AzureFileStore } from 'shared/enitites';

@Injectable({
      providedIn: 'root'
})

export class FileStoreService {
      public api = environment.apiFileUploadUrl;

      constructor(private http: HttpClient) { }

      public async getAzureFileByName(filename: string): Promise<AzureFileStore[]> {
            const get$ = this.http.get(this.api + "fileUploadByName/GetFileByName/" + filename);

            var result=await lastValueFrom(get$) as AzureFileStore[];
            return result;
      }
}
