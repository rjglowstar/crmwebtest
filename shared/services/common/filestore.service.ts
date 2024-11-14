import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { InvExcel } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { Observable, lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { AzureFileStore, FileStore } from 'shared/enitites';

@Injectable({
      providedIn: 'root'
})

export class FileStoreService {
      public api = environment.apiFileUploadUrl;

      constructor(private http: HttpClient) { }

      public async getFileByIdent(ident: string): Promise<FileStore[]> {
            const get$ = this.http.get(this.api + "fileupload/FileStoreByIdent/" + ident)

            var result = await lastValueFrom(get$) as FileStore[];
            return result;
      }

      public async getAzureFileByIdent(ident: string): Promise<AzureFileStore[]> {
            const get$ = this.http.get(this.api + "fileupload/FileStoreByIdent/" + ident);

            var result = await lastValueFrom(get$) as AzureFileStore[];
            return result;
      }


      public async getPathToBase64(id: string, type: string): Promise<string> {
            const get$ = this.http.get(this.api + "fileupload/PathToBase64/" + id + "/" + type, {
                  observe: "body",
                  responseType: "text"
            });

            var result = await lastValueFrom(get$) as string;
            return result;
      }

      public async updateFileStore(file: FileStore): Promise<boolean> {
            const put$ = this.http.put(this.api + "fileupload/Update", file);

            var result = await lastValueFrom(put$) as boolean;
            return result;
      }

      public async updateAzureFileStore(file: AzureFileStore): Promise<boolean> {
            file.updatedBy = keys.loginUserIdent;
            const put$ = this.http.put(this.api + "fileupload/Update", file);

            var result = await lastValueFrom(put$) as boolean;
            return result;
      }

      public postUploadFileDocument(file: File, type: string, ident: string, identName: string): Observable<HttpEvent<any>> {
            const formData: FormData = new FormData();
            formData.append('files', file);
            formData.append('type', type);
            formData.append('ident', ident);
            formData.append('identName', identName);

            const req = new HttpRequest('POST', `${this.api}fileupload/uploadfile`, formData, {
                  reportProgress: true,
                  responseType: 'json'
            });
            return this.http.request(req);
      }

      public async postUploadFileDocument1(file: File, type: string, ident: string, identName: string): Promise<HttpEvent<any>> {
            const formData: FormData = new FormData();
            formData.append('files', file);
            formData.append('type', type);
            formData.append('ident', ident);
            formData.append('identName', identName);

            const post$ = this.http.post(this.api + "fileupload/uploadfile", formData);

            var result = await lastValueFrom(post$) as HttpEvent<any>;
            return result;
      }

      public async postMultipleUploadFileDocument(files: File[], type: string, ident: string, identName: string): Promise<boolean> {
            const formData: FormData = new FormData();
            for (let i = 0; i < files.length; i++) {
                  const element = files[i];
                  formData.append('files', files[i]);
            }

            formData.append('type', type);
            formData.append('ident', ident);
            formData.append('identName', identName);

            const post$ = this.http.post(this.api + "fileupload/uploadmultiplefile", formData);

            var result = await lastValueFrom(post$) as boolean;
            return result;
      }

      public async uploadDiamondImages(files: File[], folderName: string): Promise<HttpEvent<any>> {
            const formData: FormData = new FormData();
            for (let i = 0; i < files.length; i++) {
                  const element = files[i];
                  formData.append('files', files[i]);
            }
            formData.append('folderName', folderName);

            const post$ = this.http.post(this.api + "fileupload/uploaddiamondimgs", formData);

            var result = await lastValueFrom(post$) as HttpEvent<any>
            return result;
      }

      public async downloadFile(id: string): Promise<any> {
            const url = this.api + "fileupload/DownloadFile/" + id;
            const get$ = this.http.get(url, { responseType: 'text' });
            let res = await lastValueFrom(get$) as any;
            if (res)
                  this.openFile(url);
      }

      public async downloadFileFo(id: string): Promise<any> {
            const url = environment.apiFrontOfficeFileUploadUrl + "fileupload/DownloadFile/" + id;
            const get$ = this.http.get(url, { responseType: 'text' });

            let res = await lastValueFrom(get$) as any;
            if (res)
                  this.openFileNewTab(url);
      }

      public openFileNewTab(urlString: string) {
            let a = document.createElement('a');
            a.target = '_blank';
            a.href = urlString;
            a.click();
      }

      public async downloadBlobFile(id: string): Promise<any> {
            const url = this.api + "fileupload/DownloadFile/" + id;
            const get$ = this.http.get(url, { responseType: 'blob' });

            var result = await lastValueFrom(get$) as any;
            return result;
      }

      public openFile(urlString: string) {
            window.location.href = urlString;
      }

      public async deletefilestore(id: string): Promise<boolean> {
            const delete$ = this.http.delete(this.api + "fileupload/DeleteFileById/" + id);

            var result = await lastValueFrom(delete$) as boolean;
            return result;
      }

      public async downloadBOEmployeeExcel(invExcel: InvExcel): Promise<any> {
            const url = this.api + "fileupload/DownloadBOEmployeeExcel";
            const post$ = this.http.post(url, invExcel, { responseType: 'blob' });

            var result = await lastValueFrom(post$) as any;
            return result;
      }

      public uploadImageByName(file: File): Observable<HttpEvent<any>> {
            const formData: FormData = new FormData();
            formData.append('file', file);

            const req = new HttpRequest('POST', `${this.api}fileUploadByName/UploadFileByName`, formData, {
                  reportProgress: true
            });

            return this.http.request(req);
      }

      public async getAzureFileByName(filename: string): Promise<AzureFileStore[]> {
            const get$ = this.http.get(this.api + "fileUploadByName/GetFileByName/" + filename);

            var result = await lastValueFrom(get$) as AzureFileStore[];
            return result;
      }

      public async deletefileByName(filename: string): Promise<boolean> {
            const delete$ = this.http.delete(this.api + "fileUploadByName/DeleteFileByName/" + filename);

            var result = await lastValueFrom(delete$) as boolean;
            return result;
      }
}
