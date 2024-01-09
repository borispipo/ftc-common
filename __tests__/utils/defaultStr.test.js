import {defaultStr} from "$utils";
test("test of defautStr",()=>{
    expect(defaultStr(undefined,"Lave","deux")).toBe("Lave");
});
