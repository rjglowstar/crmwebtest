export class User {
    id!: string
    accessFailedCount!: number
    claims: any[] = []
    code!: string
    concurrencyStamp!: string
    createdOn!: Date
    email!: string
    emailConfirmed!: boolean
    ident!: string
    lockoutEnabled!: boolean
    lockoutEnd!: Date
    logins: any[] = []
    normalizedEmail!: string
    normalizedUserName!: string
    origin!: string
    passwordHash!: string
    phoneNumber!: string
    phoneNumberConfirmed!: boolean
    roles: any[] = []
    securityStamp!: string
    tokens: any[] = []
    twoFactorEnabled!: boolean
    userName!: string
    version!: number

    constructor() { }

}