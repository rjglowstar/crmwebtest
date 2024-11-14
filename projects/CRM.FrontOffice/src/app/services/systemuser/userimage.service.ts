import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { UserImage } from '../../entities/organization/userImage';


@Injectable({
    providedIn: 'root'
})

export class UserImageService {
    controllerPath: string = 'UserProfileImage/';

    constructor(private http: HttpClient) { }

    public async inserUserImage(UserImageData: UserImage): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "Insert", UserImageData, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async getUserImageByIdent(id: string): Promise<UserImage> {
        const get$ = this.http.get(keys.apiUrl + this.controllerPath + "GetByident/" + id);

        var result = await lastValueFrom(get$) as UserImage;
        return result;
    }

    public async updateUserImage(UserImageData: UserImage): Promise<string> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "Update", UserImageData);

        var result = await lastValueFrom(put$) as string;
        return result;
    }

}