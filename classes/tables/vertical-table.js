import { processData } from "../../functions/newLib/dataProcessing";

export class VerticalTable {
    constructor(
        //REQUIRED
        data,
        columns,
        page,
        isInitPage,
        options,
        //TABLE
        {
            startingX = 0,
            startingY = 0,
            appendedPageStartX = undefined,
            appendedPageStartY = undefined,
            dividedX = true,
            dividedY = true,
            dividedXColor = undefined,
            dividedYColor = undefined,
            dividedXThickness = 1,
            dividedYThickness = 1,
            maxTableWidth = undefined,
            // maxTableHeight = undefined,
            rowHeightSizing = 'auto',
            tableBoarder = true,
            tableBoarderThickness = 1,
            tableBoarderColor = undefined,
            continuationFillerHeight = 20
        } = {}
    ){
        //REQUIRED
        this._data = data,
        this._columns = columns,
        this._options = options,
        this._page = page,
        //TABLE
        this._startingX = isInitPage ? startingX : appendedPageStartX,
        this._startingY = isInitPage ? startingY : appendedPageStartY,
        this._dividedX = dividedX,
        this._dividedY = dividedY,
        this._dividedXColor = dividedXColor,
        this._dividedYColor = dividedYColor,
        this._dividedXThickness = dividedXThickness,
        this._dividedYThickness = dividedYThickness,
        this._maxTableWidth = maxTableWidth,
        this._maxTableHeight = page.height - (page.height - this._startingY) - continuationFillerHeight,
        this._tableBoarder = tableBoarder,
        this._tableBoarderThickness = tableBoarderThickness,
        this._tableBoarderColor = tableBoarderColor,
        this._continuationFillerHeight = continuationFillerHeight,
        this._columnDimensions,
        this._columnHeaderHeight,
        this._tableHeight,
        this._finalData,
        this._remainingData,
        this._header,
        this._rows = [],
        this._isInitPage;
        this.init()
    }
    
    init() {
        const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = processData(
            this._data, 
            this._columns,
            this._maxTableHeight,
            this._options
        );

        this._columnDimensions = finalColumnDimensions;
        this._tableHeight = tableHeight;
        this._finalData = wrappedTableData;
        this._remainingData = remainingData;
    }
    
    get width() {
        return this._maxTableWidth;
    }
    
    get startingX() {
        return this._startingX;
    }

    get rows() {
        return this._rows
    }

    get columnDimensions() {
        return this._columnDimensions;
    }

    get remainingData() {
        return this._remainingData
    }

    get data () {
        return this._finalData;
    }
    
    setPage(page) {
        this._page = page;
    }
    
    addRow(row) {
        this._rows.push(row)
    }

    addHeader(header) {
        this._header = header;
    }
    
    drawTable() {
        // Draw the header
        if(this._tableBoarder) this.drawBoarder();
        this._header.drawHeader()

        //Draw Rows
        let rowY = this._startingY - this._header.height;
        const numberOfRows = this._rows.length;

        this._rows.map((row, index) => {
            const isLast = numberOfRows === index + 1;
            const currentRow = row.drawRow(rowY, index, isLast);
            rowY -= currentRow.height
        })
    }
    
    drawBoarder() {
        this._page.page.drawRectangle({
            x: this._startingX - (this._tableBoarderThickness / 2),
            y: this._startingY - this._tableHeight - this._header.height + (this._tableBoarderThickness / 2),
            width: this._maxTableWidth + this._tableBoarderThickness,
            height: this._tableHeight + this._header.height,
            borderWidth: this._tableBoarderThickness,
            borderColor: this._tableBoarderColor,
            opacity: 0,
            borderOpacity: 1,
        })
    }
};
