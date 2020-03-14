import { InjectionToken } from '@angular/core';

export const componentSelector = 'show-form-control';

export interface WindowWidthProvider {
  innerWidth: number;
  innerHeight: number;
}
export interface WindowAnimationFrameProvider {
  requestAnimationFrame(cb: any): any;
}

export const Disable = new InjectionToken<boolean>('Are the form control visualizations disabled? On Prod for example -they should be.');