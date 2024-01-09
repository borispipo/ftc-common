
import {isNonNullString} from "$cutils";

test("isNonNullString",()=>{
    expect(isNonNullString(undefined)).toBe(false);
    expect(isNonNullString("yes")).toBe(true);
});