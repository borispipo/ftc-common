const path = require("path");
const fs = require("fs");
const cPdfMake  = path.resolve(__dirname,"..","src","pdf","pdfmake","native");
const pdfmakeBuildPath = path.resolve(process.cwd(),"node_modules","pdfmake","build");
const pdfmakePath = path.resolve(pdfmakeBuildPath,"pdfmake.min.js"),
pdfmakeVsFontsPath = path.resolve(pdfmakeBuildPath,"vfs_fonts.js");
const pdfmakeDistPath = fs.existsSync(pdfmakePath)? pdfmakePath : null;
if(pdfmakeDistPath && cPdfMake && fs.existsSync(cPdfMake)){
  const pdfmakePathHtml = path.resolve(cPdfMake,"pdfmake.html");
  const jsContent = fs.readFileSync(pdfmakeDistPath, 'utf8');
  const vfs_fonts = fs.existsSync(pdfmakeVsFontsPath) ? fs.readFileSync(pdfmakeVsFontsPath, 'utf8') : "";
  try {
    fs.writeFileSync(pdfmakePathHtml,`
<!DOCTYPE html>
  <html lang="en-US">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
          ${jsContent};
      </script>
      <script>
          /*********** pdfmake vsfonts content*********/
          ${vfs_fonts};
      </script>
  </head>
   <body></body>
  </html>
  `);
  } catch (e){
      console.log(e," updating pdfmake");
  }
  console.log("native pdfmake updated");
}