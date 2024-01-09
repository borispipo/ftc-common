import {toCamelCase} from "$utils";
test("test of camel case",()=>{
    expect(toCamelCase('THIS_IS_DIFFICULT')).toBe("ThisIsDifficult");
});