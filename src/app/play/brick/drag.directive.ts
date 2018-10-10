
// Fix attempt on IOS11
// https://github.com/bevacqua/dragula/issues/289#issuecomment-277143172
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: '[delayDragLift]' })
export class DelayDragLiftDirective {

    dragDelay: number = 200; // milliseconds
    draggable: boolean = false;
    touchTimeout: NodeJS.Timer;

    @HostListener('touchmove', ['$event'])
    // @HostListener('mousemove', ['$event'])
    onMove(e: Event) {
        if (!this.draggable) {
            e.stopPropagation();
            clearTimeout(this.touchTimeout);
        }
    }

    @HostListener('touchstart', ['$event'])
    // @HostListener('mousedown', ['$event'])
    onDown(e: Event) {
        this.touchTimeout = setTimeout(() => {
            this.draggable = true;
        }, this.dragDelay);
    }

    @HostListener('touchend', ['$event'])
    // @HostListener('mouseup', ['$event'])
    onUp(e: Event) {
        clearTimeout(this.touchTimeout);
        this.draggable = false;
    }

    constructor(private el: ElementRef) {
    }
}