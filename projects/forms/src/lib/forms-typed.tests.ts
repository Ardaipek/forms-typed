// tests

import { FormControl, FormGroup } from '@angular/forms';
import {
  TypedControlsIn,
  typedFormArray,
  typedFormControl,
  TypedFormControl,
  typedFormGroup,
  TypedFormGroup,
  TypedArraysIn,
} from './forms-typed';
import { forEachControlIn } from './forms-util';
import { PartyForm } from 'src/app/party-form/party-form.model';
import { eventDefault } from 'src/app/event-form/event-form.model';
import { PersonContact } from 'src/app/person-contact/person-contact.model';

export interface Model {
  name: string;
  email: string;
}

const form = typedFormGroup({
  email: new FormControl(),
  name: new FormControl(),
}) as TypedFormGroup<Model>;
console.log(form.controls.email);
form.valueChanges.subscribe((v) => console.log(v));
form.statusChanges.subscribe((s) => console.log(s));

export interface Model1 {
  names: string[];
  email: string;
}

const f = typedFormGroup<Model>({
  name: new FormControl(),
  email: new FormControl(),
});
f.valueChanges.subscribe((v) => console.log(v));
console.log(f.controls.email);
f.setControl('name', typedFormControl());

const f1 = new FormGroup({ t: new FormControl() });
console.log(f1.controls.any.value); // will break runtime
f1.valueChanges.subscribe((v) => console.log(v)); // v is not strongly typed

const f2 = typedFormGroup<Model1, TypedControlsIn<Model1, never, 'names'>>({
  names: typedFormArray([]),
  email: typedFormControl(),
});
console.log(f2.controls); // controls are loosely typed - one of form control or group

const f3 = typedFormGroup<Model, { name: TypedFormControl<string>; email: TypedFormControl<string> }>({
  name: typedFormControl(),
  email: typedFormControl(),
});
console.log(f3.controls); // controls are strongly typed - know exactly what type of control for which key in your model
f3.setControl('email', typedFormControl());

const f4 = typedFormGroup<Model1, TypedControlsIn<Model1, never, 'names'>>({
  names: typedFormArray([]),
  email: typedFormGroup<string>('test'), // we disallow form group for simple types and null
});
f4.reset({ names: { value: [''], disabled: true }, email: '' });
f4.reset({ names: [''] }, { emitEvent: true });

interface Person {
  name: string;
  address: Address;
}
interface Address {
  postCode: string;
  line: string;
}

const person = typedFormGroup<Person>({
  name: typedFormControl(),
  address: typedFormControl(),
});
const address = typedFormGroup<Address>({
  postCode: typedFormControl(),
  line: typedFormControl(),
});

forEachControlIn(address).addValidatorsTo(person).markAsTouchedSimultaneouslyWith(person);

const array1 = typedFormArray<Address[], Address>([typedFormControl()]);
// type is form Control array1.controls //

const array2 = typedFormArray<Address[], Address, TypedFormGroup<Address>>([
  typedFormGroup<Address>({
    postCode: typedFormControl(),
    line: typedFormControl(),
  }),
]);

console.log(array2.controls);

const formDN = typedFormGroup<PartyForm, TypedArraysIn<PartyForm, 'invitees'>>({
  event: typedFormControl(eventDefault()),
  invitees: typedFormArray<PersonContact[], PersonContact>([
    typedFormGroup<PersonContact>({
      name: typedFormControl(),
      email: typedFormControl(),
    }),
  ]),
});

console.log(formDN.controls.invitees.controls);
