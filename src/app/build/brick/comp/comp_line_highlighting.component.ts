import { Component, Input, Directive } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from './comp.component';

export class CompTextHighlighting extends Comp {
    name = 'Line Highlighting';
    data: { text: string, lines: number[], reveal: string };

    constructor(data: { text: string, lines: number[], reveal: string }) {
        super();
        this.data = data;
    }
}

@register('LineHighlighting')
@Component({
    selector: 'text-highlighting',
    template: `
    <div class="text-highlighting">
        <ng-container *ngFor="let line of lines; let i = index">
            <span *ngIf="attempt && getState(i) == -1" class="tick-icon tick-FilledDenimBlueRectCross">
                <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
            </span>
            <span *ngIf="attempt && getState(i) == 1" class="tick-icon tick-FilledDenimBlueRectTick">
                <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
            </span>
            <span
                [highlight]="line.highlight"
                [state]="getState(i)"
                (click)="toggleHighlight(i)"
                [innerHTML]="line.text"></span>
            <br/>
        </ng-container>
    </div>
    <div *ngIf="attempt && data.data.reveal" class="reveal rounded" fittext [innerHTML]="data.data.reveal"></div>
    `,
    styleUrls: ['../live.component.scss']
})
export class LineHighlightingComponent extends CompComponent {
    @Input() data: CompTextHighlighting;

    lines: { text: string, highlight: boolean }[];

    getAnswer(): number[] {
        return this.lines
            .map((line, index) => ({ w: line, i: index }))
            .filter((line) => line.w.highlight === true)
            .map((line) => line.i);
    }

    ngOnInit() {
        this.lines = this.data.data.text.split('/n').map(line => ({ text: line, highlight: false }));

        if (this.attempt) {
            this.lines.forEach((line, index) => {
                line.highlight = this.attempt.answer.indexOf(index) !== -1;
            });
        }
    }

    toggleHighlight(i: number) {
        this.lines[i].highlight = !this.lines[i].highlight;
    }

    getState(line: number): number {
        if (this.attempt) {
            if (this.attempt.answer.indexOf(line) !== -1) {
                if (this.data.data.lines.indexOf(line) !== -1) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        } else { return 0; }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        const markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = this.data.data.lines.length * 5;

        this.data.data.lines.forEach((word) => {
            // if the word at index is not highlighted...
            if (attempt.answer.indexOf(word) === -1) {
                // the answer is not correct.
                attempt.correct = false;
            } else {
                // and the program is in live phase...
                if (!prev) {
                    // increase the number of marks by 5.
                    attempt.marks += markIncrement;
                }
                // or if the answer wasn't correct in the live phase...
                else if (prev.answer.indexOf(word) === -1) {
                    // increase the number of marks by 2.
                    attempt.marks += markIncrement;
                }
            }
        });
        // Then, if the attempt scored no marks and the program is in live phase, then give the student a mark.
        if (attempt.marks === 0 && !prev) { attempt.marks = 1; }
        return attempt;
    }
}
