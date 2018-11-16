// This is the representation of the data structures in the app.

import { DocumentReference, DocumentSnapshot, CollectionReference, AngularFirestoreDocument } from '@angular/fire/firestore';

export function toRefOnly(doc: DatabaseDoc, fieldsToKeep?: any) : any {
    // A firebase document
    var dataDoc : DatabaseDoc = doc;
    // Map each of the property names and look for _ref
    var proto = Object.getOwnPropertyNames(dataDoc).map((name) => {
        var prop = Object.getOwnPropertyDescriptor(dataDoc, name).value;
        if(prop != null) {
            // If there is a reference to another document then recurse and get that reference
            if(Object.keys(prop).includes('_ref')) {
                if(fieldsToKeep[name] != null) { dataDoc[name] = prop.toRefOnly(fieldsToKeep[name]); }
                else { dataDoc[name] = prop._ref; }
            // Else map the _ref to the database
            } else if (prop.constructor === Array) {
                prop.forEach((obj, index) => {
                    if(Object.keys(obj).includes('_ref')) {
                        if(fieldsToKeep[name] != null) { dataDoc[name][index] = obj.toRefOnly(fieldsToKeep[name]); }
                        else { dataDoc[name][index] = obj._ref; }
                    }
                });
            } else {
                console.log('There was no _ref or Array on the object returned from the database');
            }
        }
    });
    return dataDoc;
}

export class DatabaseDoc {
    _ref?: DocumentReference;
}

export class Comp {
    name: string;
    component: any;
    data: any;
}

export interface Question extends DatabaseDoc {
    components: Comp[];
    title: string;
}

export interface Brick extends DatabaseDoc {
    title: string;
    brief: string;
    prep: string;
    summary: string;
    subject: string;
    type: number;
    pallet: DocumentReference;
    creator: string;
    creationDate: Date;
    highScore: number;
    avgScore: number;
    totalUsers: number;
    questions: Question[];
    isPrepSafe: boolean;
}

export interface Pallet extends DatabaseDoc {
    name: string;
    bricks: DocumentReference[];
}

export interface ComponentAttempt {
    answer: any,
    correct: boolean,
    marks: number,
    maxMarks: number
}

export interface QuestionAttempt extends DatabaseDoc {
    question: DocumentReference;
    components: ComponentAttempt[];
    marks: number;
    maxMarks: number;
    correct: boolean;
}

export interface BrickAttempt extends DatabaseDoc {
    brick: DocumentReference;
    score: number;
    oldScore?: number;
    maxScore: number;
    student: DocumentReference;
    answers: QuestionAttempt[];
}

export interface StudentPallet extends DatabaseDoc {
    pallet: DocumentReference;
    student: DocumentReference;
    teacher: DocumentReference;
    bricks: BrickAttempt[];
}

export interface Student extends DatabaseDoc {
    uid: string;
    name: string;
    pallets: StudentPallet[];
}

export interface Class extends DatabaseDoc {
    teacher: DocumentReference;
    students: DocumentReference[];
    pallets: DocumentReference[];
}

export interface Teacher extends DatabaseDoc {
    uid: string;
    name: string;
    classes: DocumentReference[];
}
