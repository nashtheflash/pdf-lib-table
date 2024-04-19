import { Cell } from '../cells/cell';

export class Row {
    constructor(
        //page,
        data,
        height,
        columnIds,
        {
            // startingX = undefined,
            dividedXThickness = 1,
            dividedXColor = undefined,
            tableWidth = undefined,
            rowBackgroundColor = undefined, 
            alternateRowColor = false,
            alternateRowColorValue = undefined,
        } = {}
    ){  
        //this._page = page,
        this._data = data,
        this._columnIds = columnIds,
        // this._startingX = startingX,
        this._dividedXThickness = dividedXThickness,
        this._dividedXColor = dividedXColor,
        this._tableWidth = tableWidth,
        this._rowBackgroundColor = rowBackgroundColor,
        this._alternateRowColor = alternateRowColor,
        this._alternateRowColorValue = alternateRowColorValue
        this._height = height,
        // this._startingY = rowData[0].startingY,
        this._cells = Object.keys(data).map((cell) => new Cell(data[cell], height, cell))
    }

    addCell(cell) {
        this._cells.push(cell);
    }
    
    get cells() {
        return this._cells
    }

    get type() {
        return this._type;
    }


    drawRowBackground(index) {
        // console.log('drawRowBackground', this.startingX)

        this.page.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.height + this.cellLineHeight - 1.25,
            width: this.tableWidth,
            height: this.height,
            borderWidth: 0,
            color: index % 2 !== 0 && this.alternateRowColor ? this.alternateRowColorValue : this.rowBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX() {
        // console.log('drawDividerX', this.startingX, this.tableWidth)
        this.page.drawLine({
            start: { x: this.startingX, y: this.startingY - this.height + this.cellLineHeight - 1.25}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this.startingX + this.tableWidth, y: this.startingY - this.height + this.cellLineHeight - 1.25}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this.dividedXThickness,
            color: this.dividedXColor,
            opacity: 1,
        });
    }
}