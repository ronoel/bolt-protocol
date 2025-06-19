import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'tokenAmount',
  standalone: true
})
export class TokenDecimalsPipe implements PipeTransform {
  transform(value: number | bigint | undefined, assetSymbol: keyof typeof environment.supportedAsset): string {
    if (value === undefined || value === 0) return '0';
    
    const decimals = environment.supportedAsset[assetSymbol].decimals;
    let stringValue = value.toString();
    
    // Add leading zeros if necessary
    while (stringValue.length <= decimals) {
      stringValue = '0' + stringValue;
    }
    
    // Insert decimal point at the correct position
    const insertPosition = stringValue.length - decimals;
    const result = stringValue.slice(0, insertPosition) + '.' + stringValue.slice(insertPosition);
    
    // Remove trailing zeros and decimal point if no decimals
    return result.replace(/\.?0+$/, '');
  }
}
