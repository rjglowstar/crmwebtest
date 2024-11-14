import { fxCredential, Notifications } from "shared/enitites";

export function PriceRequestTemplate(fxCredentials: fxCredential, receiverId: string): Notifications {
    let notification = new Notifications();
    notification.icon = "icon-info";
    notification.title = "New Pricing Request";
    notification.categoryType = "information";
    notification.description = "You got new request for pricing stones from " + fxCredentials.fullName;
    notification.action = "/requestprice";
    notification.senderId = fxCredentials.id;
    notification.receiverId = receiverId;
    return notification;
}

export function ApplyPriceRequestTemplate(fxCredentials: fxCredential, receiverId: string, stoneIds: string[]): Notifications {
    let notification = new Notifications();
    notification.icon = "icon-info";
    notification.title = "Price Request Done";
    notification.categoryType = "information";
    notification.description = "Pricing for stone(s) " + stoneIds.join(", ") + " has been completed by " + fxCredentials.fullName;
    notification.senderId = fxCredentials.id;
    notification.receiverId = receiverId;
    return notification;
}

export function CustomerRegistrationTemplate(senderId: string, receiverId: string, customerEmail: string): Notifications {
    let notification = new Notifications();
    notification.icon = "icon-info";
    notification.title = "New Customer Register";
    notification.categoryType = "modal";
    notification.description = "New customer registered by " + customerEmail;
    notification.action = "customerverification";
    notification.senderId = senderId;
    notification.receiverId = receiverId;
    notification.param = senderId;
    return notification;
}

export function CustomerVerifyTemplate(senderId: string, receiverId: string, supportName: string, customerEmail: string, customerVerifyId: string): Notifications {
    let notification = new Notifications();
    notification.icon = "icon-info";
    notification.title = "Customer Verified";
    notification.categoryType = "modal";
    notification.description = "customer " + customerEmail + " verified by " + supportName;
    notification.action = "customerverification";
    notification.senderId = senderId;
    notification.receiverId = receiverId;
    notification.param = customerVerifyId;
    return notification;
}