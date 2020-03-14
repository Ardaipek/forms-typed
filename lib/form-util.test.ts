
// tests

import { typedFormGroup, typedFormControl, TypedControlsIn, typedFormArray, TypedFormControl } from './forms-util';

import { FormControl, FormGroup } from '@angular/forms';

// tslint:disable-next-line:interface-over-type-literal
type Model = {
    name: string;
    email: string;
};
interface Model1 {
    names: string[];
    email: string;
}

const f = typedFormGroup<Model>({ name: new FormControl(), email: new FormControl() });
f.valueChanges.subscribe(v => console.log(v));
console.log(f.controls.email);
f.setControl('name', typedFormControl());

const f1 = new FormGroup({ t: new FormControl() });
console.log(f1.controls.NOT_PART_OF_CONTROLS__.value); // will break runtime
f1.valueChanges.subscribe(v => console.log(v));

const f2 = typedFormGroup<Model1, TypedControlsIn<Model1, never, 'names'>>({
    names: typedFormArray([]),
    email: typedFormControl()
});
console.log(f2.controls); // controls are loosely typed - one of form control or group

const f3 = typedFormGroup<Model, { name: TypedFormControl<string>; email: TypedFormControl<string> }>({
    name: typedFormControl(),
    email: typedFormControl()
});
console.log(f3.controls); // controls are strongly typed - know exactly what type of control for which key in your model
f3.setControl('email', typedFormControl());

const f4 = typedFormGroup<Model1, TypedControlsIn<Model1, never, 'names'>>({
    names: typedFormArray([]),
    email: typedFormControl()
});
f4.reset({ names: { value: [''], disabled: true }, email: '' });
f4.reset({ names: [''] }, { emitEvent: true });
