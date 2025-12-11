export enum RectangleColorType{
    COMMITED= "#FFCC00",
    EDITING = "#99CCFF"
}

export enum RectangleType{
    COMMITED= 1,
    EDITING = 0
}

export interface Rectangle {
    x: number,
    y: number,
    width: number,
    height: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
    color: string,
    type: RectangleType,
    page: number
}