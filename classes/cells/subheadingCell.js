export class SubheadingCell {
    constructor(
        page,
        data,
        height,
        columnId,
        columns,
        columnDimension,
        {
            startingX,
            cellFont,
            cellTextColor,
            cellTextSize = 10,
            cellLineHeight,
            dividedY,
            dividedYThickness,
            dividedYColor,
        }={}
    ){
        this._page = page,
        this._data = data,
        this._columns = columns,
        this._columnId = columnId,
        this._columnDimensions = columnDimension,
        this._startingX = columnDimension[columnId].startingX,
        this._tableStartingX = startingX,
        this._height = height,
        this._cellFont = cellFont,
        this._cellTextColor = cellTextColor,
        this._cellTextSize = cellTextSize,
        this._cellLineHeight = cellLineHeight,
        this._dividedY = dividedY,
        this._dividedYThickness = dividedYThickness,
        this._dividedYColor = dividedYColor
    }

    drawCell(startingY) {
        if(this._dividedY && this._startingX && this._startingX !== this._tableStartingX) this.drawDividerY(startingY);
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
        if(!this._data) return;

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
