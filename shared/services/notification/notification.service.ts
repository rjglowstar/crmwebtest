import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationResponse, NotificationSearchCriteria } from 'shared/businessobjects';
import { Notifications } from 'shared/enitites/notification/notification';
import { WebsocketService } from '../websocket/websocket.service';


@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    public messages: Subject<any>;
    public messageResponse: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public messageLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public notificationAction: BehaviorSubject<Notifications> = new BehaviorSubject<Notifications>(new Notifications());


    constructor(public wsService: WebsocketService,
        public http: HttpClient,
        private zone: NgZone,) {
        this.messages = new Subject<any>();
    }

    public getMessage() {
        this.messages.subscribe(msg => {
            return JSON.parse(msg);
        });
    }

    public MessageLoadSub() {
        this.messageLoad.next(true);
    }

    public WindowNotification(data: any) {
        let msg = JSON.parse(data) as Notifications;
        if (('Notification' in window)) {
            let that = this;
            Notification.requestPermission(function () {
                var notification = new Notification(msg.title, { body: msg.description, dir: 'auto' });
                that.zone.runOutsideAngular(() => {
                    notification.onclick = () => { that.zone.run(() => that.notificationClickAction(msg)) };
                    setTimeout(function () {
                        notification.close();
                    }, 5000);
                })
            });
        }
    }

    notificationClickAction(data: Notifications) {
        this.notificationAction.next(data);
    }

    public connectWebsocket(ident: string) {
        let Socket_URL = environment.notificationSocketUrl + "ws/" + ident;
        this.messages = <Subject<any>>this.wsService
            .connect(Socket_URL)
            .pipe(map((response: MessageEvent) => {
                let data = response.data;
                this.messageResponse.next(data);
                this.WindowNotification(data);
                return data;
            }));
    }

    public async getMessgeById(id: string): Promise<Notifications> {
        const get$ = this.http.get(environment.notificationBaseUrl + "GetById/" + id);

        var result = await lastValueFrom(get$) as Notifications;
        return result;
    }

    public async getMessgeByReceiver(id: string): Promise<NotificationResponse> {
        const get$ = this.http.get(environment.notificationBaseUrl + "GetReceiverMessage/" + id);

        var result = await lastValueFrom(get$) as NotificationResponse;
        return result;
    }

    public async insertNotification(notificationObj: Notifications): Promise<string> {
        const post$ = this.http.post(environment.notificationBaseUrl + "Insert", notificationObj, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async deleteMessage(id: string): Promise<any> {
        const delete$ = this.http.delete(environment.notificationBaseUrl + "DeleteMessage/" + id);

        var result = await lastValueFrom(delete$) as any;
        return result;
    }

    public async deleteConnectionSocket(id: string): Promise<boolean> {
        const delete$ = this.http.delete(environment.notificationBaseUrl + "DeleteWebSocket/" + id);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    public async getHistoryMessage(id: string): Promise<Notifications[]> {
        const get$ = this.http.get(environment.notificationBaseUrl + "GetHistoryMessage/" + id);

        var result = await lastValueFrom(get$) as Notifications[];
        return result;
    }

    public async getNotifications(notificationCriteria: NotificationSearchCriteria, skip: number, take: number): Promise<NotificationResponse> {
        const post$ = this.http.post(environment.notificationBaseUrl + "GetPaginated/" + skip + "/" + take, notificationCriteria);

        var result = await lastValueFrom(post$) as NotificationResponse;
        return result;
    }

    public async getExistsSalesCancelNotifications(leadNo: string): Promise<string> {
        const get$ = this.http.get(environment.notificationBaseUrl + "CheckSalesCancelNotification/" + leadNo, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(get$) as string;
        return result;
    }

    public async checkExistsOrdersCancelNotifications(leadNo: string): Promise<string> {
        const get$ = this.http.get(environment.notificationBaseUrl + "CheckOrdersCancelNotification/" + leadNo, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(get$) as string;
        return result;
    }

    public async getExistsOrderCancelNotifications(leadNo: string): Promise<Notifications[]> {
        const get$ = this.http.get(environment.notificationBaseUrl + "getOrderCancelNotification/" + leadNo);

        var result = await lastValueFrom(get$) as Notifications[];
        return result;
    }

    public async deleteMessagesByParamId(paramId: string): Promise<boolean> {
        const delete$ = this.http.delete(environment.notificationBaseUrl + "DeleteMessagesByParamId/" + paramId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    public async deleteMessagesByParamIds(paramIds: Array<string>): Promise<boolean> {
        const post$ = this.http.post(environment.notificationBaseUrl + "DeleteMessagesByParamIds", paramIds);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

}
