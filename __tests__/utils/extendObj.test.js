import { extendObj } from "$utils";
test("extendObj",()=>{
    expect(extendObj({},{a:10},{b:11})).toEqual({a:10,b:11});
});