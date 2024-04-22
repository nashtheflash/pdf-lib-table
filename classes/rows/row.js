import { Cell } from '../cells/cell';

export class Row {
    constructor(
        page,
        data,
        height,
        columnIds,
        width,
        columnDimension,
        options,
        {
            startingX = undefined,
            dividedX = undefined,
            dividedXThickness = 1,
            dividedXColor = undefined,
            tableWidth = undefined,
            rowBackgroundColor = undefined, 
            alternateRowColor = false,
            alternateRowColorValue = undefined,
        } = {}
    ){  
        this._page = page,
        this._data = data,
        this._columnIds = columnIds,
        this._startingX = startingX,
        this._dividedX = dividedX,
        this._dividedXThickness = dividedXThickness,
        this._dividedXColor = dividedXColor,
        this._tableWidth = tableWidth,
        this._rowBackgroundColor = rowBackgroundColor,
        this._alternateRowColor = alternateRowColor,
        this._alternateRowColorValue = alternateRowColorValue
        this._height = height,
        this._width = width,
        this._columnDimension = columnDimension,
        // this._startingY = rowData[0].startingY,
        this._cells = Object.keys(data).map((cell) => new Cell(page, data[cell], height, cell, this._columnDimension, options))
    }

    get cells() {
        return this._cells
    }
    
    get height() {
        return this._height;
    }

    addCell(cell) {
        this._cells.push(cell);
    }

    drawRow(startingY, index, isLast) {
        this.drawRowBackground(startingY, index);
        if(this._dividedX) this.drawDividerX(startingY, isLast)

        this.cells.map((cell) => {
            cell.drawCell(startingY);
        })
        
        return this;
    }

    drawRowBackground(startingY, index) {
        this._page.page.drawRectangle({
            x: this._startingX,
            // y: startingY - this._height + this._cellLineHeight - 1.25,
            y: startingY - this._height,
            width: this._width,
            height: this._height,
            borderWidth: 0,
            color: index % 2 !== 0 && this._alternateRowColor ? this._alternateRowColorValue : this._rowBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX(startingY, isLast) {
        if(isLast) return;
        this._page.page.drawLine({
            start: { x: this._startingX, y: startingY - this._height}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + this._width, y: startingY - this._height}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._dividedXThickness,
            color: this._dividedXColor,
            opacity: 1,
        });
    }
}
