import { wrapHeader, getTextWidth } from "../../functions/newLib/dataProcessing";

export class Header {
    constructor(
        page, 
        columns,
        columnWidths,
        tableWidth,
        options,
        {
            startingX = undefined,
            startingY = undefined,
            headerBackgroundColor = undefined,
            headerWrapText = true,
            headerFont = undefined,
            headerTextSize = 12,
            headerLineHeight = 12,
            headerTextColor = undefined,
            headerTextAlignment = 'left',
            headerTextJustification = 'center',
            headerDividedX = true,
            headerDividedY = true,
            headerDividedXColor = undefined,
            headerDividedYColor = undefined,
            headerDividedXThickness = 1,
            headerDividedYThickness = 1
        } ={}
    ){
        this._page = page,
        this._columns = columns,
        this._columnWidths = columnWidths,
        this._tableWidth = tableWidth,
        this._options = options,
        // this._headers = headers,
        this._startingX = startingX,
        this._startingY = startingY,
        this._headerBackgroundColor = headerBackgroundColor,
        this._headerWrapText = headerWrapText,
        this._headerFont = headerFont,
        this._headerTextSize = headerTextSize,
        this._headerLineHeight = headerLineHeight,
        this._headerTextColor = headerTextColor,
        this._headerTextAlignment = headerTextAlignment,
        this._headerTextJustification = headerTextJustification,
        this._headerDividedX = headerDividedX,
        this._headerDividedY = headerDividedY,
        this._headerDividedXColor = headerDividedXColor,
        this._headerDividedYColor = headerDividedYColor,
        this._headerDividedXThickness = headerDividedXThickness,
        this._headerDividedYThickness = headerDividedYThickness,
        this._headerHeight,
        this._wrappedHeaders
    }

    getHeight() {
        const { additionalWrapCharacters } = this._options;
        
        this._wrappedHeaders = wrapHeader({ columns: this._columns, columnDimensions: this._columnWidths, headerLineHeight: this._headerLineHeight, headerTextSize: this._headerTextSize, headerFont: this._headerFont, additionalWrapCharacters });        
        this._headerHeight = Math.max(...this._wrappedHeaders.map(({ height }) => height));

        return this._headerHeight;
    }

    drawHeader(tableWidth) {
        this.drawFill(tableWidth);
        if(this._headerDividedX) this.drawDividerX(tableWidth);
        if(this._headerDividedY) this.drawDividerY();
        this.drawHeadings();
    };

    drawFill() {
        this._page.page.drawRectangle({
            x: this._startingX,
            y: this._startingY - this.getHeight(), //Math.max(headerHeight, headerFullTextHeight),
            width: this._tableWidth,
            height: this._headerHeight, //Math.max(headerHeight, headerFullTextHeight),
            borderWidth: 0,
            color: this._headerBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX() {
        this._page.page.drawLine({
            start: { x: this._startingX, y: this._startingY - this._headerHeight}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + this._tableWidth, y: this._startingY - this._headerHeight}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._headerDividedXThickness,
            color: this._headerDividedXColor,
            opacity: 1,
        });
    }

    drawDividerY() {
        let counter = 0
        const numberOfColumns = Object.keys(this._columnWidths).length;
        Object.keys(this._columnWidths).forEach((col, i) => {
            if(numberOfColumns - 1 == i) return;

            const dividerX = i == 0 ? this._columnWidths[col].actualWidth : this._columnWidths[col].actualWidth + counter;
            this._page.page.drawLine({
                start: { x: this._startingX + dividerX, y: this._startingY },
                end: { x: this._startingX + dividerX, y: this._startingY - this._headerHeight}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this._headerDividedYThickness,
                color: this._headerDividedYColor,
                opacity: 0.75,
            });

            counter += this._columnWidths[col].actualWidth;
        })
    }

    drawHeadings() {
        let horizontalCursor = 0;
        this._wrappedHeaders.forEach(({ columnId, data, height }) => {
            const textHeight = data.length * this._headerLineHeight;
            
            const justification = this._headerTextJustification === 'center' ? 
            (this._headerHeight - textHeight) / 2 :
            this._headerTextJustification === 'bottom' ? 
            this._headerHeight - textHeight :
            0;

            data.forEach((textLines, i) => {
                
                const alignment = this._headerTextAlignment === 'center' ? 
                (this._columnWidths[columnId].actualWidth - getTextWidth(this._headerFont, this._headerTextSize, textLines)) / 2 : 
                this._headerTextAlignment === 'right' ?  this._columnWidths[columnId].actualWidth - getTextWidth(this._headerFont, this._headerTextSize, textLines) : 
                0

                this._page.page.drawText(textLines, {
                    x: this._startingX + alignment + horizontalCursor,
                    y: this._startingY - justification - this._headerLineHeight - (this._headerLineHeight * i),
                    size: this._headerTextSize,
                    font: this._headerFont,
                    color: this._headerTextColor,
                    lineHeight: this._headerLineHeight
                });
            })
            horizontalCursor += this._columnWidths[columnId].actualWidth;
        });
    }
};