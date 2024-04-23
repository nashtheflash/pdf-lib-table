import { getParentColumnId } from "../../functions/newLib/headerData";
import { SubheadingCell } from "../cells/subheadingCell";

export class SubHeading {
    constructor(
        page,
        data,
        height,
        columns,
        width,
        columnDimension,
        options,
        {
            subHeadingColumns,
            startingX = undefined,
            tableWidth = undefined,
            subHeadingBackgroundColor = undefined,
            subHeadingDividedX = undefined,
            subHeadingDividedXThickness = undefined,
            subHeadingDividedXColor = undefined,
        } = {}
    ){  
        this._page = page,
        this._data = data,
        this._columnIds = columns,
        this._startingX = startingX,
        this._subHeadingDividedX = subHeadingDividedX,
        this._subHeadingDividedXThickness = subHeadingDividedXThickness,
        this._subHeadingDividedXColor = subHeadingDividedXColor,
        this._tableWidth = tableWidth,
        this._subHeadingBackgroundColor = subHeadingBackgroundColor,
        this._height = height,
        this._width = width,
        this._columnDimension = columnDimension,
        // this._startingY = rowData[0].startingY,
        this._cells = Object.keys(data).map((cell) => new SubheadingCell(page, data[getParentColumnId(cell, subHeadingColumns)], height, cell, columns, this._columnDimension, options))
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
        if(this._subHeadingDividedX) this.drawDividerX(startingY, isLast)

        this.cells.map((cell) => {
            cell.drawCell(startingY);
        })

        return this;
    }

    drawRowBackground(startingY, index) {
        // console.log('drawing subheader')
        this._page.page.drawRectangle({
            x: this._startingX,
            y: startingY - this._height,
            width: this._width,
            height: this._height,
            borderWidth: 0,
            color: this._subHeadingBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX(startingY, isLast) {
        console.log(this._height, startingY)
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
