import { Notifications } from "shared/enitites";

export class NotificationResponse {
      notifications: Notifications[];
      totalCount: number;

      constructor() {
            this.notifications = [];
            this.totalCount = 0;
      }
}