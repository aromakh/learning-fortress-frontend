import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brickTime' })
export class BrickTimePipe implements PipeTransform {
    transform(value: number, type: string): number {
        switch(type) {
            case "intro": switch(value) {
                case 1:  return 300000;
                case 2:  return 600000;
                case 3:  return 900000;
                default: return 0;
            }
            case "live": switch(value) {
                case 1:  return 500000;
                case 2:  return 1000000;
                case 3:  return 1500000;
                default: return 0;
            }
            case "provisionalScore": switch(value) {
                case 1:  return 200000;
                case 2:  return 400000;
                case 3:  return 600000;
                default: return 0;
            }
            case "summary": switch(value) {
                case 1:  return 200000;
                case 2:  return 400000;
                case 3:  return 600000;
                default: return 0;
            }
            case "review": switch(value) {
                case 1:  return 200000;
                case 2:  return 400000;
                case 3:  return 600000;
                default: return 0;
            } default: switch(value) {
                case 1:  return 1200000;
                case 2:  return 2400000;
                case 3:  return 3600000;
                default: return 0;
            }
        }
    }
}
