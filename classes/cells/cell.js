export class Cell {
    constructor(
        data,
        rowHeight,
        columnId,
        {
            cellFont,
            cellTextColor,
            cellTextSize,
            cellLineHeight,
            dividedYThickness,
            dividedYColor,
            tableStartingX
        }={}
    ){
        this._data = data,
        this._columnId = columnId,
        this._rowHeight = rowHeight,
        this._cellFont = cellFont,
        this._cellTextColor = cellTextColor,
        this._cellTextSize = cellTextSize,
        this._cellLineHeight = cellLineHeight,
        this._dividedYThickness = dividedYThickness,
        this._dividedYColor = dividedYColor,
        this._tableStartingX = tableStartingX
    }

    drawCell(page, dividedY) {
        this.drawCellText(page);
        if(dividedY) this.drawDividerY(page);
    }

    drawCellText(page) {

        const {values, startingX, startingY} = this.data;
        // console.log('drawCellText', values, startingX, startingY)

        values.forEach((text, i) => {
            page.page.drawText(text, {
                x: startingX,
                y: startingY - (this.cellLineHeight * i),
                font: this.cellFont,
                size: this.cellTextSize,
                lineHeight: this.cellLineHeight,
                color: this.cellTextColor
            });
        })
    }

    drawDividerY(page) {
    
        const { startingX, startingY} = this.data;
        if(this.tableStartingX == startingX) return;
        
        page.page.drawLine({
            start: { x: startingX, y: startingY + this.cellLineHeight},
            end: { x: startingX, y: startingY - this.rowHeight + this.cellLineHeight},
            thickness: this.dividedYThickness,
            color: this.dividedYColor,
            opacity: 0.75,
        }); 
    }
}