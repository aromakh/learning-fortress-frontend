import { Component, Input } from "@angular/core";
import { register } from "./comp_index";
import { Comp, ComponentAttempt } from "../../../schema";
import { CompComponent } from "./comp.component";

export class CompText extends Comp {
    data: { text: string }

    constructor(data: { text: string }) {
        super();
        this.data = data;
    }
}

@register("Poem")
@Component({
    selector: "poem",
    template: `
    <div class="comp-poem-container">
        <div class="comp-poem-content rounded" [innerHTML]="data.data.text" fittext [maxFontSize]="15"></div>
    </div>
    `,
    styleUrls: ["../live.component.scss"]
})
export class PoemComponent extends CompComponent {
    constructor() { super() }

    @Input() data: CompText;

    getAnswer() : null { return null; }
}