import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Comp, ComponentAttempt } from '../../../schema';
import { register } from './comp_index';
import { CompComponent } from './comp.component';
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
            <mat-list-item class="arrow-item-left touch-list-item"
                           *ngFor="let item of userCats[0].choices; let ind = index"
                           fxLayout="row"
                           fxLayoutAlign="space-around center" >
                <ng-container *ngIf="attempt">
                    <span class="tick-icon tick-FilledDenimBlueRectCross" *ngIf="getState(ind) != 1; else tickElement">
                        <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span>
                    </span>
                    <ng-template #tickElement>
                       <span class="tick-icon tick-FilledDenimBlueRectTick">
                           <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                       </span>
                    </ng-template>
                    <div *ngIf="attempt && data.data.reveals[getChoice(item)]" class="reveal rounded" fittext [minFontSize]="10" [innerHTML]="data.data.reveals[getChoice(item)]"></div>
                </ng-container>
                <div class="arrow-item-text-left" fittext [minFontSize]="10" [innerHTML]="item"></div>
            </mat-list-item>
        </mat-list>
        <mat-list cdkDropList (cdkDropListDropped)="drop($event)" class="arrow-list">
            <ng-container *ngFor="let item of userCats[1].choices; let ind = index">
                <mat-list-item
                    cdkDrag
                    [id]="item"
                    style="cursor: pointer;"
                    class="arrow-text-right touch-list-item not-selectable-posterity"
                    fxLayout="row"
                    fxLayoutAlign="space-around center">

                    <mat-icon class="material-icons" style="vertical-align:middle;">drag_indicator</mat-icon>
                    <div class="arrow-item-text-right" fittext [minFontSize]="10" [innerHTML]="item"></div>
                </mat-list-item>
            </ng-container>
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
        this.userCats = [{ choices: []}, { choices: []}];
        this.userCats[0].choices = this.data.data.categories[0].choices.slice();
        this.userCats[1].choices = shuffle(this.data.data.categories[1].choices.slice());

        if (this.attempt) {
            this.userCats = [];
            this.attempt.answer[0].choice.forEach((choice, index) => {
                this.userCats.push({ choices: [] });
            });
            this.userCats = this.userCats.map((cat, index) => {
                return {
                    choices: this.attempt.answer.map((choice, i) => {
                        return this.data.data.categories[index].choices[choice.choice[index]];
                    })
                };
            });
        }
    }

    getAnswer(): { choice: number[] }[] {
        const choices: { choice: number[] }[] = [];

        this.userCats[0].choices.forEach((choice, index) => {
            choices.push({ choice: [
                index,
                this.data.data.categories[1].choices.indexOf(this.userCats[1].choices[index])
            ]});
        });
        return choices;
    }
    allowDrop(ev) {
        ev.preventDefault();
    }

    drag(ev, item) {
        ev.dataTransfer.setData('item', item);
    }

    drop(event: CdkDragDrop<{title: string, poster: string}[]>) {
        moveItemInArray(this.userCats[1].choices, event.previousIndex, event.currentIndex);
    }

    getChoice(choice) {
        return this.data.data.categories[0].choices.indexOf(choice);
    }

    getState(index: number): number {
        const corr = this.attempt.answer[index].choice.every((ch, ind) => {
            return ch == this.attempt.answer[index].choice[0];
        });
        if (corr) {
            return 1;
        } else {
            return -1;
        }
    }

    mark(attempt: ComponentAttempt, prev: ComponentAttempt) : ComponentAttempt {
        // If the question is answered in review phase, add 2 to the mark and not 5.
        const markIncrement = prev ? 2 : 5;
        attempt.correct = true;
        attempt.marks = 0;
        attempt.maxMarks = 0;
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
                } else {
                    // the answer is not correct.
                    attempt.correct = false;
                }
            });
        // Then, if the attempt scored no marks and the program is in live phase, then give the student a mark.
        if(attempt.marks == 0 && !prev) attempt.marks = 1;
        return attempt;
    }
}
