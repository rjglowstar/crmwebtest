export class GridDetailConfig {
    propertyName!: string
    title!: string
    width!: number
    sortOrder!: number
    isSelected?: boolean
    filterable?: boolean
    locked?: boolean
    editor?: "boolean" | "text" | "numeric" | "date"
    sortFieldName?:string

    constructor() {
        this.filterable = false;
        this.editor = 'text'
        this.locked = false;
        this.sortFieldName = ""
    }

}