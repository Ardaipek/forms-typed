import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { PartyForm } from 'src/app/party-form/party-form.model';
import { eventDefault } from 'src/app/event-form/event-form.model';
import { PersonContact } from 'src/app/person-contact/person-contact.model';

/**
 * Type encapsulating the Angular Form options:
 * `emitEvent` - do we emit event;
 * `onlySelf` - do we bubble up to parent
 */
interface FormEventOptions {
  emitEvent?: boolean;
  onlySelf?: boolean;
}

/**
 * A type wrapper around the reset value. It could be partial of the type of the form. Or even describe which form fields are to be disabled
 */
type ResetValue<K> = Partial<{ [key in keyof K]: K[key] | { value: K[key]; disabled: boolean } }>;

/**
 * Typed form control is an `AbstractControl` with strong typed properties and methods. Can be created using `typedFormControl` function
 *
 * @example
 * const c = typedFormControl<string>(): TypedFormControl<string>;
 * c.valueChanges // Observable<string>
 * c.patchValue('s') // expects string
 * c.patchValue(1) //  COMPILE TIME! type error!
 */
interface TypedFormControl<K> extends FormControl, AbstractControl {
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: Partial<K>, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
  value: K;
  reset: (value?: ResetValue<K>, opts?: FormEventOptions) => void;
}
/**
 * A helper function to create a `TypedFormControl`. It only calls the constructor of FormControl, but **strongly types** the result.
 * @param v the value to initialize our `TypedFormControl` with - same as in `new FormControl(v, validators, asyncValidators)`
 * @param validators validators - same as in new `FormControl(v, validators, asyncValidators)`
 * @param asyncValidators async validators - same as in `new FormControl(v, validators, asyncValidators)`
 *
 * @example
 * const c = typedFormControl<string>(): TypedFormControl<string>;
 * c.valueChanges // Observable<string>
 * c.patchValue('s') // expects string
 * c.patchValue(1) //  COMPILE TIME! type error!
 */
function typedFormControl<T>(v?: T, validators?: ValidatorFn, asyncValidators?: AsyncValidatorFn): TypedFormControl<T> {
  return new FormControl(v, validators, asyncValidators);
}

/**
 * Typed form control is an `FormArray` with strong typed properties and methods. Can be created using `typedFormArray` function
 *
 * @example
 * const c = typedFormArray<string>([typedFormControl('of type string')]): TypedFormArray<string[], string>;
 * c.valueChanges // Observable<string[]>
 * c.patchValue(['s']) // expects string[]
 * c.patchValue(1) //  COMPILE TIME! type error!
 */
interface TypedFormArray<K extends Array<T> = any[], T = any, G extends KT = 'control'> extends FormArray {
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: K, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
  controls: Array<G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>>;
  push: (control: G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>) => void;
  insert: (index: number, control: G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>) => void;
  at: (index: number) => G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>;
  setControl: (index: number, control: G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>) => void;
  value: K;
}
/**
 * A helper function to create a `TypedFormArray`. It only calls the constructor of FormArray, but **strongly types** the result.
 * @param v the value to initialize our `TypedFormArray` with - same as in `new TypedFormArray(v, validators, asyncValidators)`
 * @param validators validators - same as in new `TypedFormArray(v, validators, asyncValidators)`
 * @param asyncValidators async validators - same as in `new TypedFormArray(v, validators, asyncValidators)`
 *
 * @example
 * const c = typedFormArray<string>([typedFormControl('of type string')]): TypedFormArray<string[], string>;
 * c.valueChanges // Observable<string[]>
 * c.patchValue(['s']) // expects string[]
 * c.patchValue(1) //  COMPILE TIME! type error!
 */
function typedFormArray<K extends Array<T> = any[], T = any, G extends KT = 'control'>(
  controls: Array<G extends 'group' ? TypedFormGroup<T> : TypedFormControl<T>>,
  validatorOrOptions?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null
): TypedFormArray<K, T, G> {
  return new FormArray(controls, validatorOrOptions, asyncValidators) as any;
}

type Controls<K> =
  | TypedControlsIn<K>
  | {
      [k in keyof K]: K[k] extends Array<infer T>
        ? TypedFormControl<K[k]> | TypedFormGroup<K[k]> | TypedFormArray<K[k], T>
        : TypedFormControl<K[k]> | TypedFormGroup<K[k]>;
    };

// tslint:disable-next-line:ban-types
type NonGroup = string | number | boolean | Function | null | undefined | never;
/**
 * This is a strongly typed thin wrapper type around `FormGroup`.
 * Can be created using the `typedFormGroup` function
 */
interface TypedFormGroup<K, C extends Controls<K> = TypedControlsIn<K>> extends FormGroup, TypedFormControl<K> {
  controls: K extends NonGroup ? never : C;
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: Partial<K>, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
  value: K;
  setControl: <T extends keyof C>(name: T extends string ? T : never, control: C[T]) => void;
  reset: (value?: ResetValue<K>, options?: FormEventOptions) => void;
}
function typedFormGroup<K, C extends Controls<K> = TypedControlsIn<K>>(
  controls: K extends NonGroup ? never : C,
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): TypedFormGroup<K, C> {
  return new FormGroup(controls, validatorOrOpts, asyncValidator) as any;
}

/**
 * Helper type for specifying what control we expect for each property from the model.
 */
type TypedControlsIn<K, groups extends keyof K = never, arrays extends keyof K = never, arraysOfGroups extends arrays = never> = {
  [key in keyof K]: key extends groups
    ? TypedFormGroup<K[key]>
    : key extends arrays
    ? K[key] extends Array<infer T>
      ? key extends arraysOfGroups ? TypedFormArray<T[], T, 'group'> : TypedFormArray<T[], T>
      : never
    : TypedFormControl<K[key]>;
};

/**
 * Shorthand for a model with `TypedFormControl`s and `TypedFormArray`s only (i.e. no `TypedFormGroup`s in)
 */
type TypedArraysIn<K, arrays extends keyof K, groups extends arrays> = TypedControlsIn<K, never, arrays, groups>;

/**
 * Shorthand for a model with `TypedFormControl`s and `TypedFormGroup`s only  (i.e. no `TypedFormArray`s in)
 */
type TypedGroupsIn<K, groups extends keyof K> = TypedControlsIn<K, groups, never>;

type KT = 'control' | 'group';

const invitee1 = typedFormGroup<PersonContact>({
  name: typedFormControl(),
  email: typedFormControl(),
});

const invitee2 = typedFormGroup<PersonContact>({
  name: typedFormControl(),
  email: typedFormControl(),
});

const formDN = typedFormGroup<PartyForm, TypedArraysIn<PartyForm, 'invitees', 'invitees'>>({
  event: typedFormControl(eventDefault()),
  invitees: typedFormArray<PersonContact[], PersonContact, 'group'>([
    invitee1,
    invitee2
  ])
});
console.log(invitee1.controls)
const t = typedFormArray<PersonContact[], PersonContact, 'group'>([
  typedFormGroup<PersonContact>({
    name: typedFormControl(),
    email: typedFormControl(),
  }),
]);

console.log(formDN.controls.invitees.controls);
