import { Component, Input } from '@angular/core';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from "./comp.component";
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export class CompArrow extends Comp {
    name = "Arrow";
    data: { categories: { choices: string[] }[], reveal: string }

    constructor(data: { categories: { choices: string[] }[], reveal:string }) {
        super();
        this.data = data;
    }
}

@register("Arrow")
@Component({
    selector: 'sort',
    template: `
    <div class="arrow-container" fxFlex="1 1 100%" fxLayout="row">
        <mat-list>
            <mat-list-item touch-action="none" class="arrow-item-left touch-list-item" *ngFor="let item of userCats[0].choices; let ind = index" fxLayout="row" fxLayoutAlign="space-around center" >
                <mat-checkbox *ngIf="attempt" [checked]="getState(ind) == 1" [indeterminate]="getState(ind) == -1" disabled></mat-checkbox>
                <div *ngIf="attempt && data.data.reveals[getChoice(item)]" class="reveal" fittext [minFontSize]="10">{{ data.data.reveals[getChoice(item)] }}</div>
                <div class="arrow-item-text-left" fittext [minFontSize]="10">{{item}}</div>
            </mat-list-item>
        </mat-list>
        <!-- The first column has Arrow Graphics -->
        <!-- Trying it without Arrows
        <mat-list>
            <mat-list-item *ngFor="let item of userCats[0].choices" class="arrow-icon-list-item">
                <mat-icon class="material-icons arrow-icon">arrow_right_alt</mat-icon>
            </mat-list-item>
        </mat-list> -->
        <mat-list [dragula]="'DRAG1'" [(dragulaModel)]="userCats[1].choices" class="arrow-list">
            <mat-list-item style="cursor: pointer;" class="arrow-text-right touch-list-item" *ngFor="let item of userCats[1].choices; let ind = index" fxLayout="row" fxLayoutAlign="space-around center">
                <mat-icon class="material-icons" style="vertical-align:middle;">drag_indicator</mat-icon>
                <div class="arrow-item-text-right" fittext [minFontSize]="10">{{item}}</div>
            </mat-list-item>
        </mat-list>
    </div>
    `,
    styleUrls: ['../live.component.scss'],
    providers: [
        {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
    ]
})
export class ArrowComponent extends CompComponent {
    @Input() data: CompArrow;

    userCats: { choices: string[] }[];

    ngOnInit() {
        this.userCats = this.data.data.categories.map((cat) => { return { choices: shuffle(cat.choices.slice()) }});
        if(this.attempt) {
            this.userCats = [];
            this.attempt.answer[0].choice.forEach((choice, index) => {
                this.userCats.push({ choices: [] });
            })
            this.userCats = this.userCats.map((cat, index) => {
                return {
                    choices: this.attempt.answer.map((choice, i) => {
                        return this.data.data.categories[index].choices[choice.choice[index]];
                    })
                };
            })
        }
    }

    getAnswer() : { choice: number[] }[] {
        var choices: { choice: number[] }[] = [];
        this.userCats[0].choices.forEach((choice, index) => {
            choices.push({ choice: this.userCats.map((cat, i) => { return this.data.data.categories[i].choices.indexOf(cat.choices[index]) }) })
        });
        return choices;
    }

    getChoice(choice) {
        return this.data.data.categories[0].choices.indexOf(choice);
    }

    getState(index: number) : number {
        let corr = this.attempt.answer[index].choice.every((ch, ind) => {
            return ch == this.attempt.answer[index].choice[0];
        })
        if(corr) {
            return 1;
        } else {
            return -1;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        let markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = 0;
        console.log(attempt.answer);
        attempt.answer
            // Map every answer to its choice,
            .map(c => c.choice)
            // and for every answer...
            .forEach((c, i) => {
                // increase the maximum marks by 5,
                attempt.maxMarks += 5;
                // set 'corr' to true if every option is equal,
                let corr = c.every(opt => opt == c[0]);
                // and if the answer is correct...
                if(corr) {
                    // and the program is the live phase...
                    if(!prev) {
                        // increase the marks by 5.
                        attempt.marks += markIncrement;
                    }
                    // or if the answer given in the live phase is also correct...
                    else if(!prev.answer[i].choice.every(opt => opt == prev.answer[i].choice[0])) {
                        // increase the marks by 2.
                        attempt.marks += markIncrement;
                    }
                }
                // if not...
                else {
                    // the answer is not correct.
                    attempt.correct = false;
                }
            });
        // Then, if the attempt scored no marks and the program is in live phase, then give the student a mark.
        if(attempt.marks == 0 && !prev) attempt.marks = 1;
        return attempt;
    }
}
