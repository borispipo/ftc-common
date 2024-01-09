import {isPromise} from "$utils";
test("isPromise",()=>{
    expect(isPromise(new Promise(()=>{}))).toBe(true);
})