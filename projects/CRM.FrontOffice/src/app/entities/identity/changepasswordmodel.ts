export class ChangePasswordModel {
    userId: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;

    constructor() {
        this.userId = "";
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
    }

}