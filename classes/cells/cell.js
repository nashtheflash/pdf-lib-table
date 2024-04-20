export class Cell {
    constructor(
        page,
        data,
        height,
        columnId,
        columnDimension,
        {
            cellFont,
            cellTextColor,
            cellTextSize,
            cellLineHeight,
            dividedY,
            dividedYThickness,
            dividedYColor,
            tableStartingX
        }={}
    ){
        this._page = page,
        this._data = data,
        this._columnId = columnId,
        this._startingX = columnDimension[columnId].startingX,
        this._height = height,
        this._cellFont = cellFont,
        this._cellTextColor = cellTextColor,
        this._cellTextSize = cellTextSize,
        this._cellLineHeight = cellLineHeight,
        this._dividedY = dividedY,
        this._dividedYThickness = dividedYThickness,
        this._dividedYColor = dividedYColor,
        this._tableStartingX = tableStartingX
        // this._columnDimension = columnDimension
    }

    drawCell(startingY) {
        // this.drawCellText(page);
        if(this._dividedY) this.drawDividerY(startingY);
        this.drawCellText(startingY);
    }

    drawDividerY(startingY) {
        
        this._page.page.drawLine({
            start: { x: this._startingX, y: startingY},
            end: { x: this._startingX, y: startingY - this._height},
            thickness: this._dividedYThickness,
            color: this._dividedYColor,
            opacity: 0.75,
        }); 
    }

    drawCellText(startingY) {

        // const {values, startingX, startingY} = this.data;
        // console.log('drawCellText', values, startingX, startingY)

        this._data.forEach((text, i) => {
            this._page.page.drawText(text, {
                x: this._startingX,
                y: startingY - this._cellLineHeight - (this._cellLineHeight * i),
                font: this._cellFont,
                size: this._cellTextSize,
                lineHeight: this._cellLineHeight,
                color: this._cellTextColor
            });
        })
    }
}