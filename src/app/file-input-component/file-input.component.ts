import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-input',
  template: `
    <input type="file" (change)="onFileChange($event)" />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ],
  standalone: true,
  styles: []
})
export class FileInputComponent implements ControlValueAccessor {
  private onChange: (file: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.onChange(file);
  }

  writeValue(value: null): void {
    // Não é necessário atualizar o valor de um campo de arquivo.
  }

  registerOnChange(fn: (file: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Opcional: implementar lógica para desabilitar o campo, se necessário.
  }
}
