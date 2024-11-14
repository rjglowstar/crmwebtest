export class VerifyAuthenticatorCodeModel {
    code!: string;
    returnUrl!: string;
    rememberBrowser!: boolean;
    rememberMe!: boolean

    constructor() { }

}