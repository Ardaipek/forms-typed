import {
  FormGroup,
  AbstractControl,
  Validators,
  FormControl,
  ValidatorFn,
  AsyncValidatorFn,
  FormArray,
  AbstractControlOptions
} from '@angular/forms';
import { Observable } from 'rxjs';

export type Methods = keyof Pick<
  AbstractControl,
  | 'markAsDirty'
  | 'markAsTouched'
  | 'updateValueAndValidity'
  | 'disable'
  | 'enable'
  | 'markAsUntouched'
  | 'markAsPristine'
  | 'markAsPending'
>;

// tslint:disable-next-line:interface-over-type-literal
type FormGroupLike = {
  controls: { [key: string]: AbstractControl };
};

export function forEachControlIn(form: FormGroup | FormArray | TypedFormGroup<any> | TypedFormArray<any>) {
  const controls: AbstractControl[] =
    form != null && form.controls != null
      ? Array.isArray(form.controls)
        ? form.controls
        : Object.getOwnPropertyNames(form.controls).map(name => (form as FormGroupLike).controls[name])
      : [];

  const composer = {
    call(...methods: Methods[]) {
      if (controls != null && Array.isArray(controls)) {
        controls.forEach(c => {
          methods.forEach(m => {
            if (c[m] && typeof c[m] === 'function') {
              (c[m] as any)();
            }
          });

          // catch the case where we have a control that is form array/group - so for each of the children call methods
          if ((c as any).controls != null) {
            forEachControlIn(c as FormArray | FormGroup | TypedFormGroup<any> | TypedFormArray<any>).call(...methods);
          }
        });
      }
      return composer;
    },
    markAsDirtySimultaneouslyWith(c: AbstractControl) {
      if (c != null) {
        const markAsDirtyOriginal = c.markAsDirty.bind(c);
        c.markAsDirty = () => {
          markAsDirtyOriginal();
          composer.call('markAsDirty');
        };
        const markAsPristineOriginal = c.markAsPristine.bind(c);
        c.markAsPristine = () => {
          markAsPristineOriginal();
          composer.call('markAsPristine');
        };
      }
      return composer;
    },
    markAsTouchedSimultaneouslyWith(c: AbstractControl, comingFromBelow?: () => boolean) {
      if (c != null) {
        const markAsTouchedOriginal = c.markAsTouched.bind(c);
        c.markAsTouched = () => {
          markAsTouchedOriginal();
          if (!comingFromBelow || !comingFromBelow()) {
            composer.call('markAsTouched');
          }
        };
        const markAsUntouchedOriginal = c.markAsUntouched.bind(c);
        c.markAsUntouched = () => {
          markAsUntouchedOriginal();
          composer.call('markAsUntouched');
        };
      }
      return composer;
    },
    addValidatorsTo(ctrl: AbstractControl) {
      if (ctrl != null) {
        ctrl.validator = Validators.compose([
          ctrl.validator,
          () => {
            // could overwrite some errors - but we only need it to know the "parent" form is valid or not
            const errors = controls.reduce((e, next) => ({ ...e, ...next.errors }), {});

            return controls.some(c => c.errors != null) ? errors : null;
          }
        ]);
      }
      return composer;
    }
  };

  return composer;
}

export interface FormEventOptions {
  emitEvent?: boolean;
  onlySelf?: boolean;
}

export interface TypedFormControl<K> extends FormControl {
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: Partial<K>, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
}
export function typedFormControl<T>(
  v?: T,
  validators?: ValidatorFn,
  asyncValidators?: AsyncValidatorFn
): TypedFormControl<T> {
  return new FormControl(v, validators, asyncValidators);
}

export interface OldTypedFormGroup<K> extends FormGroup, TypedFormControl<K> {
  controls: {
    [key in keyof K]: K[key] extends Array<infer T>
      ? TypedFormControl<K[key]> | TypedFormGroup<K[key]> | TypedFormArray<Array<T>>
      : TypedFormControl<K[key]> | TypedFormGroup<K[key]>
  };
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: Partial<K>, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
}
export function oldTypedFormGroup<K>(
  controls: {
    [key in keyof K]: K[key] extends Array<infer T>
      ? TypedFormControl<K[key]> | TypedFormGroup<K[key]> | TypedFormArray<Array<T>>
      : TypedFormControl<K[key]> | TypedFormGroup<K[key]>
  },
  validatorOrOptions?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null
): TypedFormGroup<K> {
  return new FormGroup(controls, validatorOrOptions, asyncValidators) as any;
}

export interface TypedFormArray<K extends Array<T> = any[], T = any> extends FormArray {
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: K, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
  controls: Array<TypedFormControl<T>>;
}
export function typedFormArray<K extends Array<T> = any[], T = any>(
  controls: Array<TypedFormControl<T>>,
  validatorOrOptions?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null
): TypedFormArray<K> {
  return new FormArray(controls, validatorOrOptions, asyncValidators) as any;
}

export type Controls<K> = {
  [k in keyof K]: K[k] extends Array<any>
    ? TypedFormControl<K[k]> | TypedFormGroup<K[k]> | TypedFormArray<K[k]>
    : TypedFormControl<K[k]> | TypedFormGroup<K[k]>
};

export interface TypedFormGroup<
  K,
  C extends Controls<K> = Controls<K>
> extends FormGroup, TypedFormControl<K> {
  controls: C;
  valueChanges: Observable<K>;
  statusChanges: Observable<'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'>;
  patchValue: (v: Partial<K>, options?: FormEventOptions) => void;
  setValue: (v: K, options?: FormEventOptions) => void;
}
export function typedFormGroup<
  K,
  C extends {
    [k in keyof K]: K[k] extends Array<any>
      ? TypedFormControl<K[k]> | TypedFormGroup<K[k]> | TypedFormArray<K[k]>
      : TypedFormControl<K[k]> | TypedFormGroup<K[k]>
  } = {
    [k in keyof K]: K[k] extends Array<any>
      ? TypedFormControl<K[k]> | TypedFormGroup<K[k]> | TypedFormArray<K[k]>
      : TypedFormControl<K[k]> | TypedFormGroup<K[k]>
  }
>(
  controls: C,
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): TypedFormGroup<K, C> {
  return new FormGroup(controls, validatorOrOpts, asyncValidator) as any;
}

// tests
// tslint:disable-next-line:interface-over-type-literal
export type Model = {
  name: string;
  email: string;
};
export interface Model1 {
  names: string[];
  email: string;
}

const f = typedFormGroup<Model>({ name: new FormControl(), email: new FormControl() });
f.valueChanges.subscribe(v => console.log(v));
console.log(f.controls.email);

const f2 = typedFormGroup<Model1>({
  names: typedFormArray([]),
  email: typedFormControl()
});
// f2.controls

const f1 = new FormGroup({ t: new FormControl() });
// console.log(f1.controls.any.value); // will break runtime
// f1.valueChanges.subscribe(v => console.log(v));
