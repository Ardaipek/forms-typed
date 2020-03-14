import { Component, OnInit, Self, Optional } from '@angular/core';
import { typedFormGroup, typedFormControl } from '@lib/forms-util';
import { PersonContact } from './person-contact.model';
import { NgControl, ControlValueAccessor } from '@angular/forms';
import { ControlValueAccessorConnector } from '@lib/control-value-accessor-connector';

@Component({
  selector: 'fty-person-contact',
  templateUrl: './person-contact.component.html',
  styleUrls: ['./person-contact.component.css']
})
export class PersonContactComponent extends ControlValueAccessorConnector<PersonContact> implements OnInit {
  constructor(@Self() @Optional() controlDirective: NgControl) {
    super(
      controlDirective,
      typedFormGroup<PersonContact>({
        name: typedFormControl<string>(),
        email: typedFormControl<string>()
      })
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  onNameInputBlur() {
    this.onTouch();
  }
  onEmailInputBlur() {
    this.onTouch();
  }
}
