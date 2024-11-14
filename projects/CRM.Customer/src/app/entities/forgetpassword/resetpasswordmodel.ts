export class ResetPasswordModel {
    email: string;
    password!: string;
    confirmPassword!: string;
    code: string;

    constructor() {
        this.email = "";
        this.code = "";
    }

}