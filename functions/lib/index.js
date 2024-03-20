export { tableColumnWidths } from "./getColumnWidth";
export { tableRows } from "./getRows";


//gets the width of the text that was passed
export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

//returns and array of thest to be printed in and cell
export const getWrapedText = (font, fontSize, textAreaSize, text) => {
  const words = text.toString().split(' ').map(word => (word.split('/'))).flat();//TODO: allow user to input there own charicters to split strings on for wraping

  let lineBreaks = [];
  let currentLineWidth = 0
  
  for (let loop = 0; loop < words.length; loop++) {
      const currentWordLength = words.length > 1 ? getTextWidth(font, fontSize, (words[loop] + ' ')) : getTextWidth(font, fontSize, words[loop]);

      if (currentWordLength + currentLineWidth >= textAreaSize && words.length !== 0) {
          // loop === 0 ? lineBreaks.push(loop - 1) : lineBreaks.push(loop - 1);
          lineBreaks.push(loop)
          currentLineWidth = 0;
      };
      
      if (currentWordLength + currentLineWidth < textAreaSize && words.length !== 0) {
          currentLineWidth += currentWordLength
      };
  }

  //build an array of text that is each line
  const lines = []

  //if there are no line breaks push the words
  if(lineBreaks.length === 0) lines.push(words.join(' '));
  lineBreaks.forEach((lb, i) => {
      //console.log(lb, i, lineBreaks, lineBreaks.length, words.length, textAreaSize, words);
      if(lb === 0 && lineBreaks.length === 2)                                 lines.push(words.slice(1).join(' '));
      if(lb === 0)                                                            lines.push(words[0]);
      if(lb !== 0 && i === 0)                                                 lines.push(words.slice(i, lb).join(' '));
      if(lb !== 0 && i !== 0 && lineBreaks[i-1] !==0)                         lines.push(words.slice(lineBreaks[i-1], lb).join(' '));
      if(lb !== 0 && i === lineBreaks.length - 1 && lineBreaks[i-1] !== 0)    lines.push(words.slice(lineBreaks[i]).join(' '));
  });

  return lines;
};

//returns an anrray of column ids
export const getColumnIds = (columns) => {
  const extractedColumnIds = columns.reduce((acc, curr) => {
    if (curr.columnId) {
      acc.push(curr.columnId);
    }
    return acc;
  }, []);

  return extractedColumnIds;
};
  
//gets the manual colemn wisths that are defined in the coleumn defininitions
export const getColumnManualWidths = (columns) => {
  const extractedWidths = columns.reduce((acc, curr) => {
    if (curr.width) {
      acc = {...acc, [curr.columnId]: curr.width}
    }
    return acc;
  }, []);

  return extractedWidths;
};

//this gets the smallest word in the columns
const getMinWordLength = (cellFont, cellTextSize, text) => {
  const brokenText = text.split(' ').map(word => (word.split('/'))).flat();
  var longest = brokenText.reduce((a, b) => {
        return a.length > b.length ? a : b;
    },
    0
  );

  const longestLength = getTextWidth(cellFont, cellTextSize, longest);
  return longestLength
};

//this gets the longest word in the column 
const getMaxWordLength = (cellFont, cellTextSize, text) => {
  const brokenText = text.split(' ').map(word => (word.split('/'))).flat();
  var longest = brokenText.reduce((a, b) => {
        return a.length > b.length ? a : b;
    },
    0
  );
  
  const longestLength = getTextWidth(cellFont, cellTextSize, longest);
  return longestLength
};
  
//returns an object with each column id as the key and a min and max value. min is the smallest word lenth and max is the langest item in the column. 
export const getLongestColumnItem = (rows, cellFont, cellTextSize) => {
  const minMax = {}
  
  rows.forEach((obj) => {
    let newRow = {};
    
    Object.keys(obj).forEach((key, index) => {
      const min = getMinWordLength(cellFont, cellTextSize, obj[key]?.toString());
      const max = getMaxWordLength(cellFont, cellTextSize, obj[key]?.toString());

      if(!minMax[key]?.min || minMax[key].min > min) minMax[key] = { ...minMax[key], min }
      if(!minMax[key]?.max || minMax[key].max < max) minMax[key] = { ...minMax[key], max }

    });
    return newRow;
  });
  return minMax;
};

//gets the length of each header item and returns the info in an object
export const getHeaderItemLengths = (headers, headerFont, headerTextSize) => {
  let headerLength = {};

  headers.forEach((header) => {
    headerLength = { ...headerLength, [header.columnId]: getTextWidth(headerFont, headerTextSize, header.header)}
  })
  
  return headerLength
};
  

//This function calcs the row width for the entire table. All innner row calcs involving the width of the column shoule use this.
export const getColumnWidths = ({
    page, 
    columnIds,
    pageHeight,
    pageWidth,
    maxTableWidth, 
    maxTableHeight,
    manualColumnWidths, 
    headerLengths, 
    longestRowItem,
    columnTextWrap,
    availableTableWidth
}) => { 
  let columSizing = {};
  let manualColumns = Object.keys(manualColumnWidths);
  let autoColumns = columnIds.filter(column => !manualColumns.includes(column));
  
  const totalManualSize = Object.values(manualColumnWidths).reduce((partialSum, a) => partialSum + a, 0);
  
  //sets initial clumn sizing. Can be changed later in the funciton
  columSizing = setMinumunColumnWidth({ columnIds, headerLengths, longestRowItem, manualColumnWidths, columSizing });
  let totalAutoSize = Object.values(columSizing).reduce((partialSum, a) => partialSum + a, 0);
  
  const totelExtraLength = (availableTableWidth - totalManualSize - totalAutoSize);
  const columnExtraLength = totelExtraLength / autoColumns.length;
  
  //checks to make sure the biggest word in the column fits in the columns and adjusts acordingly && adds or removes length as needed
  autoColumns.sort((a, b) => (parseFloat(columSizing[a]) < parseFloat(columSizing[b]) ? 1 : -1))
  

  let removeFromBiggerRow = 0;

  autoColumns.forEach(column => {
    //if there is extra length just add it evenly to all auto columns
    if(columnExtraLength > 0) {
      columSizing[column] += columnExtraLength
    } else {
      //if there is negative length. take away from the columns based on a precentage
      const currentPO = columSizing[column] / totalAutoSize;
      let cSize = (totelExtraLength * currentPO);
      
      columSizing[column] += cSize - removeFromBiggerRow;
      removeFromBiggerRow = 0;

      if(longestRowItem[column].min - columSizing[column] > 0) {
        removeFromBiggerRow = longestRowItem[column].min - columSizing[column]
        columSizing[column] = longestRowItem[column].min
      };

      if(longestRowItem[column].min < columSizing[column]) console.log('BAD')
    };
  });

  //TODO: cold remove this or change. This is just a dumb skew that I add to try to even out the columns should be at least refactored at some point
  // const skewAmount = .3;
  // const autoColumnSize = Math.max(...autoColumns.map((column) => columSizing[column])); //largestVal 
  // const removeVal = autoColumnSize * skewAmount;//value to remove from lagre column
  // const addVal = (autoColumnSize * skewAmount) / autoColumns.length;//value to add to smaller columns
  // autoColumns.forEach(column => { //DUMB SKEW COULD CHANGE LATER
  //   if(columSizing[column] === autoColumnSize)  columSizing = {...columSizing, [column]: columSizing[column] - removeVal}
  //   if(columSizing[column] !== autoColumnSize) columSizing =  {...columSizing, [column]: columSizing[column] + addVal}
  // });

  return columSizing;
};
  
export const getNumberOfRows = (data) => {
  const onlyRows = data.filter((item) => !item.subHeading)
  return onlyRows.length
};

export const getNumberOfSubHeadings =(data) => {
  const onlySubHeadings = data.filter((item) => item.subHeading)
  return onlySubHeadings.length
};

export const setMinumunColumnWidth = ({ columnIds, headerLengths, longestRowItem, manualColumnWidths }) => {
  let cs = {};
  
  columnIds.forEach((id) => {
    const headerLength = headerLengths[id];
    const longestRow = !longestRowItem[id] ? 0 : longestRowItem[id].max;
    const manualWidths = manualColumnWidths[id];

    if(manualWidths) { 
      cs = {...cs, [id]: manualWidths};
    };

    if(!manualWidths) { 
      cs = {...cs, [id]: Math.max(headerLength, longestRow)};
    };
  })

  return cs
};

export const getTotalPages = (page, pageHeight, availableTableHeight, startingY) => {
  const pageOneOverflow = (availableTableHeight - startingY);

  if(pageOneOverflow <= 0) return 1
  if(pageOneOverflow > 0) return Math.ceil(pageOneOverflow / page.getHeight()) + 1
};


export const createPages = (page, totalPages, pageDimensions, pdfDoc) => {
  //the first page of the doc that the table is going to print on must be passed
  let pages = [page];
  
  if(totalPages === 1) return pages;

  for (let p = 0; p < totalPages - 1; p++){
    let newPage = pdfDoc.addPage(pageDimensions);
    pages.push(newPage);
  };

  return pages;
};






export const getRowMeasurments = (data, startingY, cellFont, cellTextSize, columnWidths, rowSectionStartingY) => {
  let rowData = [];
  let currentRowHeight = 0; //measures the row height going down the page

  data.forEach((row, index) => {
    const rowLengths = Object.keys(row).map((key) =>  getWrapedText(cellFont, cellTextSize, columnWidths[key], row[key]).length);
    let rowStartingY = startingY - rowSectionStartingY; //TODO: minus the cuurentrowheight
    const rowRows = Math.max(...rowLengths); // this is the nummber of text rows in each row
    const rowHeight = rowRows * cellTextSize + 0;
    
    
    rowStartingY -= currentRowHeight;
    rowData.push({rowLengths, rowStartingY, rowRows, rowHeight});
    currentRowHeight += rowHeight;

  });

  return rowData;
};







export const getRowsByPage = () => {

}




















