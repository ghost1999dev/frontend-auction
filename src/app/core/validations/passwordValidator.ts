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
      message: 'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y al menos 6 caracteres alfanuméricos.'
    }} : null;
  };
}