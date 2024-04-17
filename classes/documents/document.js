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
    
    get document() {
        return this._pages;
    }

    addPage(page) {
        const pg = new Page(page)
        
        this.pages.push(pg);
        
        return pg;
    }

    drawVerticalTables() {
        //console.log('Drawing tables')

    }

    drawHorizontalTables() {
        
    }
}