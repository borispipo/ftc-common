export const isEquals = require("react-fast-compare");

export const areEquals = isEquals;

export const objectAreEquals = areEquals;

/**** détermine si les tableaux passés en paramètre sont égaux ou pas */
export const areArraysEquals = areEquals;

if(typeof(Object.areEquals) !='function'){
    Object.defineProperties(Object,{
        areEquals : {value : areEquals,override:false}
    })
} 
if(typeof(Object.compare) != 'function'){
    Object.defineProperties(Object,{
        compare : {value : areEquals}
    });
}

export default isEquals;

