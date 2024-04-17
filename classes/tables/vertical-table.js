export class VerticalTable {
    constructor(
        //REQUIRED
        page,
        data,
        columns,
        //TABLE
        {
            startingX = 0,
            startingY = page.getHeight(),
            dividedX = true,
            dividedY = true,
            dividedXColor = undefined,
            dividedYColor = undefined,
            dividedXThickness = 1,
            dividedYThickness = 1,
            maxTableWidth = page.getWidth() - startingX,
            maxTableHeight = page.getHeight() - startingY,
            rowHeightSizing = 'auto',
            tableBoarder = true,
            tableBoarderThickness = 1,
            tableBoarderColor = undefined
        } = {}
    ){
        //REQUIRED
        this._page = page,
        this._data = data,
        this._columns = columns,
        //TABLE
        this._startingX = startingX,
        this._startingY = startingY,
        this._dividedX = dividedX,
        this._dividedY = dividedY,
        this._dividedXColor = dividedXColor,
        this._dividedYColor = dividedYColor,
        this._dividedXThickness = dividedXThickness,
        this._dividedYThickness = dividedYThickness,
        this._maxTableWidth = maxTableWidth,
        this._maxTableHeight = maxTableHeight,
        this._rowHeightSizing = rowHeightSizing,
        this._tableBoarder = tableBoarder,
        this._tableBoarderThickness = tableBoarderThickness,
        this._tableBoarderColor = tableBoarderColor,
        this._rows = []
    }

    addRows(row) {
        this._rowHeightSizing.push(row)
    }

    get tableWidth() {
        //return this.maxTableWidth && this.maxTableWidth < (this.pageWidth - this.startingX) ? this.maxTableWidth : (this.pageWidth - this.startingX);
    }

    get tableHeight() {
        //return this.maxTableWidth && this.currentTableHeight + this.headerSectionHeight //- this.continuationFillerHeight;
    }

    get remainingTableSpace() {
        //return this.pageHeight - ( this.pageHeight - this.startingY) - (this.currentTableHeight + this.headerSectionHeight)
    }

    get rows() {
        return this._rows
    }
    
    drawBoarder() {
        this._page.drawRectangle({
            x: this.startingX,
            y: this.startingY - this.tableHeight,
            width: this.tableWidth,
            height: this.tableHeight + this.tableBoarderThickness,
            borderWidth: this.tableBoarderThickness,
            borderColor: this.tableBoarderColor,
            opacity: 1,
            borderOpacity: 1,
        })
    };
};