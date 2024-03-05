import { getTextWidth } from "../lib";

export const getColumnIds = (columns) => {
  const extractedColumnIds = columns.reduce((acc, curr) => {
    if (curr.columnId) {
      acc.push(curr.columnId);
    }
    return acc;
  }, []);

  return extractedColumnIds;
};

export const getColumnManualWidths = (columns) => {
  const extractedWidths = columns.reduce((acc, curr) => {
    if (curr.width) {
      acc = {...acc, [curr.columnId]: curr.width}
    }
    return acc;
  }, []);

  return extractedWidths;
};

const getLongestWord = (cellFont, cellTextSize, text) => {
  const brokenText = text.split(' ');
  var longest = brokenText.reduce(
    function (a, b) {
        return a.length > b.length ? a : b;
    }
  );

  return getTextWidth(cellFont, cellTextSize, longest);
};

//TODO: refactor
export const getLongestColumnItem = (rows, cellFont, cellTextSize) => {
  const columnItemLength = rows.map((obj) => {
    let newRow = {};
    
    Object.keys(obj).forEach(function(key, index) {
      newRow[key] = {...newRow[key], min: getLongestWord(cellFont, cellTextSize, obj[key]?.toString()) };
      newRow[key] = {...newRow[key], max: getTextWidth(cellFont, cellTextSize, obj[key]?.toString()) };
    });

    return newRow;
  });
  return columnItemLength[0];
};

export const getHeaderItemLengths = (headers, headerFont, headerTextSize) => {
  let headerLength = {};

  headers.forEach((header) => {
      headerLength = { ...headerLength, [header.columnId]: getTextWidth(headerFont, headerTextSize, header.header)}
  })
  
  return headerLength
};

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
  let totalAutoSize = 0;
  const totalManualSize = Object.values(manualColumnWidths).reduce((partialSum, a) => partialSum + a, 0);

  //sets initial clumn sizing. Can be changed later in the funciton
  columnIds.forEach((id) => {
    const headerLength = headerLengths[id];
    const longestRow = !longestRowItem[id] ? 0 : longestRowItem[id].max;
    const manualWidths = manualColumnWidths[id];

    if(manualWidths) { 
      columSizing = {...columSizing, [id]: manualWidths};
    };

    if(!manualWidths) { 
      totalAutoSize += Math.max(headerLength, longestRow);
      columSizing = {...columSizing, [id]: Math.max(headerLength, longestRow)};
    };
  })

  const totelExtraLength = (availableTableWidth - totalManualSize - totalAutoSize);
  const columnExtraLength = totelExtraLength / autoColumns.length;

  //checks to make sure the biggest word in the column fits in the columns and adjusts acordingly && adds or removes length as needed
  autoColumns.sort((a, b) => parseFloat(columSizing[a]) - parseFloat(columSizing[b]));
  let removeFromBiggerRow = 0;
  //console.log(columSizing);
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
    };
  });

  //TODO: cold remove this or change. This is just a dumb skew that I add to try to even out the columns should be at least refactored at some point
  const skewAmount = .3;
  const autoColumnSize = Math.max(...autoColumns.map((column) => columSizing[column])); //largestVal 
  const removeVal = autoColumnSize * skewAmount;//value to remove from lagre column
  const addVal = (autoColumnSize * skewAmount) / autoColumns.length;//value to add to smaller columns
  autoColumns.forEach(column => { //DUMB SKEW COULD CHANGE LATER
    console.log(columSizing[column] === autoColumnSize, columSizing[column] !== autoColumnSize)
    if(columSizing[column] === autoColumnSize)  columSizing = {...columSizing, [column]: columSizing[column] - removeVal}
    if(columSizing[column] !== autoColumnSize) columSizing =  {...columSizing, [column]: columSizing[column] + addVal}
  });

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