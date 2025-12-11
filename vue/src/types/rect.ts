export enum RectangleColorType{
    COMMITED= "#FFCC00",
    EDITING = "#99CCFF"
}

export enum RectangleType{
    COMMITED= 1,
    EDITING = 0
}

export interface Rectangle {
    x: float,
    y: float,
    width: float,
    height: float,
    left: float,
    top: float,
    right: float,
    bottom: float,
    color: string,
    type: RectangleType,
    page: number,
    text?: string,
    id?: string
}