function formats(){
    let i = 4;
    const formats = {};
    while(i>=0){
        const format = "A"+i;
        const size = {};
        formats[format] = {
            code : format,
            label : format,
            pageFormat : format,
            pageWidth : 0,
            pageHeight : 0,
            displayLogo : 1,
            pageOrientation : 'portrait',
            topMargin : 15,
            leftMargin : 15,
            rightMargin : 15,
            bottomMargin : 0,
            ...size
        }
        i-=1;
    }
    return formats;
}

export default formats();