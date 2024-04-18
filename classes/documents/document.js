import {Page} from './page'

export class Document {
    constructor
    (
        initialPage,
        pdfDoc,
        fonts,
        colors
    ){
        this._initialPage = initialPage,
        this._pdfDoc = pdfDoc,
        this._fonts = fonts,
        this._colors = colors
        this._pages = [new Page(initialPage)],
        this._tables = []
    }

    get pages() {
        return this._pages;
    }

    addPage(dimensions) {
        const page = this._pdfDoc.addPage(dimensions);
        this._pages.push(new Page(page));

        return this._pages;
    }
    
    addTable(table) {
        this._tables.push(table);
        return this._tables;
    }

    drawVerticalTables() {
        //console.log('Drawing tables')

    }

    drawHorizontalTables() {
        
    }
}