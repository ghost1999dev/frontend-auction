import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null; // Let required validator handle empty case
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isValidLength = value.length >= 6;
    const isAlphanumeric = /^[A-Za-z0-9]+$/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && isValidLength && isAlphanumeric;

    return !passwordValid ? { passwordStrength: {
      message: 'The password must have at least one uppercase letter, one lowercase letter, one number, and at least 6 alphanumeric characters.'
    }} : null;
  };
}