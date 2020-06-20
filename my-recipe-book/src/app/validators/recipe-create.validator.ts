import { AbstractControl } from '@angular/forms';

// Custom validator checks the length of chip/tag string length, as well as number of chip/tags entered

export function tagInputValidator(control: AbstractControl) {
    let tagLengthErr = false;
    control.value.forEach(tag => {
        // check that chip/tag string is less than 16 characters. If not, tagLengthErr variable is set to true to return error below
        if (tag.length > 15) {
            tagLengthErr = true;
        }
    })
    // if number of chips/tags is greater than 5, return error to the user
    if (control.value.length > 5) {
        return { tagArrLength: true }
    // if any of the chips/tags are longer than 15 characters, return error to the user
    } else if (tagLengthErr) {
        return { tagLength: true }
    } else {
    // if above checks pass, do not return error to the user
        return null
    }
}