export class LoginResponse {
    access_token!: string
    refresh_token!: string
    expires_in!: number
    userName!: string
    ident!: string
    code!: string
    origin!: string
    token_type!: string
    client_id!: string
    issued!: Date
    expires!: Date
    forceChangePassword!: boolean

    constructor() { }

}