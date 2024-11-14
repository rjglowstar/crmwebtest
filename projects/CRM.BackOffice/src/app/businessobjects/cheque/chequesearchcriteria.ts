export class ChequeSearchCriteria {
      chequeNo!: string
      transactionNo!: string
      fromLedgerId!: string
      toLedgerId!: string
      chequeFromDate!: Date | null
      chequeToDate!: Date | null

      constructor() {
            this.chequeFromDate = null;
            this.chequeToDate = null;           
      }
}