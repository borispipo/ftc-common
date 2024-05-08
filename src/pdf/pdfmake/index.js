const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
if(pdfFonts?.pdfMake?.vfs){
	pdfMake.vfs = pdfFonts.pdfMake.vfs;
}
const fonts = {
	Roboto: {
		normal: 'Roboto-Regular.ttf',
		bold: 'Roboto-Medium.ttf',
		italics: 'Roboto-Italic.ttf',
		bolditalics: 'Roboto-MediumItalic.ttf'
    },
};
pdfMake.fonts = fonts;

export {fonts,pdfMake};

export default pdfMake;

export const Provider = ()=>null;