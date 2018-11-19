import { Component, Input, Directive } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from "./comp.component";

export class CompTextHighlighting extends Comp {
    name = "Text Highlighting";
    data: { text: string, words: number[], reveal:string }

    constructor(data: { text: string, words: number[], reveal:string }) {
        super();
        this.data = data;
    }
}

@register("TextHighlighting")
@Component({
    selector: 'text-highlighting',
    template: `
    <p *ngIf="attempt">{{ data.data.reveal }}</p>
    <p class="text-highlighting">
        <span *ngFor="let word of words; let i = index" [highlight]="word.highlight" [state]="getState(i)" (click)="toggleHighlight(i)"> {{ word.word }} </span>
    </p>
    `,
    styleUrls: ['../live.component.scss']
})
export class TextHighlightingComponent extends CompComponent {
    @Input() data: CompTextHighlighting;

    words: { word: string, highlight: boolean }[];

    getAnswer() : number[] {
        return this.words
            .map((word, index) => { return { w: word, i: index } })
            .filter((word) => word.w.highlight == true)
            .map((word) => word.i);
    }

    ngOnInit() {
        this.words = this.data.data.text.split(" ").map((word) => { return { word: word, highlight: false } });
        if(this.attempt) {
            this.words.forEach((word, index) => {
                word.highlight = this.attempt.answer.indexOf(index) != -1;
            });
        }
    }

    toggleHighlight(i: number) {
        this.words[i].highlight = !this.words[i].highlight;
    }

    getState(word: number) : number {
        if(this.attempt) {
            if(this.attempt.answer.indexOf(word) != -1) {
                if(this.data.data.words.indexOf(word) != -1) {
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
        let markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        // Then, the maximum number of marks is equal to the number of words needed * 5.
        attempt.maxMarks = this.data.data.words.length * 5;
        // Then, for every word that should be highlighted...
        this.data.data.words.forEach((word) => {
            // if the word is not highlighted...
            if(attempt.answer.indexOf(word) == -1) {
                // the answer is not correct.
                attempt.correct = false;
            }
            // if not...
            else {
                // and the program is in live phase...
                if(!prev) {
                    // increase the number of marks by 5.
                    attempt.marks += markIncrement;
                }
                // or if the answer wasn't correct in the live phase...
                else if (prev.answer.indexOf(word) == -1) {
                    // increase the number of marks by 2.
                    attempt.marks += markIncrement;
                }
            }
        })
        // Then, if the attempt scored no marks and the program is in live phase, then give the student a mark.
        if(attempt.marks == 0 && attempt.answer.length != 0 && !prev) attempt.marks = 1;
        return attempt;
    }
}
