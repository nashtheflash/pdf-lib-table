export function checkUserInputs(parameters) {
    

    if(!parameters[0]) {
        throw new Error('Data was not provided to the table.');
    }
    
    if(!parameters[1]) {
        throw new Error('An initioal page was not provided. You must provide an initial page.');
    }
    
    if(!parameters[2]) {
        throw new Error('An PFF Document was not provided. You must provide an PFF Document.');
    }
    
    if(!parameters[3]) {
        throw new Error('Column definitions were not provided. You must provide column definitions.');
    }
    
    if(!parameters[4]) {
        throw new Error('Fonts were not provided. You must provide the pdf lib standard fonts.');
    }
    
    if(!parameters[5]) {
        throw new Error('rgb was not provided. You must provide the pdf lib rgb function.');
    }

    const options = parameters[6]

    //FONTS
    if(!options.headerFont) {
        throw new Error('Header font not provided');
    }

    if(!options.continuationFont) {
        throw new Error('continuation font not provided');
    }

    if(!options.subHeadingFont) {
        throw new Error('Subheading font not provided');
    }

    if(!options.cellFont) {
        throw new Error('Cell font not provided');
    }

    
   return false;
}
