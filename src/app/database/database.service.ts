import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpHeaders } from '@angular/common/http';
import { AngularFirestore, DocumentSnapshot, QuerySnapshot, DocumentReference, AngularFirestoreDocument, DocumentChangeAction, Action, AngularFirestoreCollection, QueryDocumentSnapshot } from '@angular/fire/firestore';

const headers = new HttpHeaders({
    'Content-Type':  'application/json'
})

import { environment } from '../../environments/environment';

import { Observable, BehaviorSubject, combineLatest, zip, observable } from 'rxjs';
import { map, tap, concatMap } from 'rxjs/operators';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';

import { Brick, BrickAttempt, Question, Pallet, QuestionAttempt, toRefOnly, StudentPallet } from '../schema';

import { getComponent } from '../play/brick/comp/comp_index';
import { Observer } from 'firebase';
import { BrickComponent } from '../play/brick/brick.component';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    constructor(public afs: AngularFirestore) { }

    getBrick(id: string) : BehaviorSubject<Brick> {
        let brickRef : AngularFirestoreDocument<Brick> = this.afs.collection('bricks').doc<Brick>(id);
        let bs : BehaviorSubject<Brick> = new BehaviorSubject<Brick>(null);
        const brick$ = brickRef.valueChanges();
        const questions$ = brickRef.collection<Question>('questions', ref => ref.orderBy('number')).snapshotChanges()
            .pipe(
                map((actions: DocumentChangeAction<Question>[]) => actions.map(action => action.payload.doc)),
                map((qs: DocumentSnapshot<Question>[]) => {
                    return qs.map((q: DocumentSnapshot<Question>) => {
                        let qstn = q.data();
                        qstn._ref = q.ref;
                        qstn.components.forEach((comp) => {
                            comp.component = getComponent(comp.name);
                        })
                        return qstn;
                    })
                })
            );

        combineLatest(brick$, questions$)
            .pipe(
                map((data: [Brick, Question[]]) => {
                    let brick = data[0];
                    brick._ref = brickRef.ref;
                    brick.questions = data[1];
                    return brick;
                })
            )
            .subscribe(bs);

        return bs;
    }

    createBrickAttempt(brickAttempt: BrickAttempt) : Observable<AngularFirestoreDocument<BrickAttempt>> {
        return Observable.fromPromise(
            this.afs.collection('brickattempts').add(brickAttempt)
                .then((ba: DocumentReference) => {
                    brickAttempt.answers.map(ans => ba.collection('questions').add(ans));
                    return new AngularFirestoreDocument<BrickAttempt>(ba, this.afs);
                })
        );
    }
    
    getStudentPallets(uid: string) : Observable<StudentPallet[]> {
        let palletsRef: AngularFirestoreCollection<StudentPallet> = this.afs.collection('students').doc(uid).collection<StudentPallet>('pallets');
        const pallets$ = palletsRef.snapshotChanges()
            .pipe(
                map((actions: DocumentChangeAction<StudentPallet>[]) => actions.map(action => action.payload.doc)),
                map((pallets) => {
                    return pallets.map((pallet) => {
                        let plt = pallet.data();
                        if (plt)
                            plt._ref = pallet.ref;
                        return plt;
                    })
                })
            );

        return pallets$;
    }

    getPallets(studentPallets: StudentPallet[]) : Observable<Pallet[]> {
        let palletRefs: AngularFirestoreDocument<Pallet>[] = studentPallets.map(studentPallet => this.afs.doc(studentPallet.pallet));
        const pallets$ = combineLatest(palletRefs.map(ref => ref.snapshotChanges()))
            .pipe(
                map((actions: Action<DocumentSnapshot<Pallet>>[]) => actions.map(action => {
                    let plt = action.payload.data();
                    if (plt)
                        plt._ref = action.payload.ref;
                    return plt;
                }))
            )
        return pallets$;
    }

    getPallet(id: string) : Observable<Pallet> {
        let palletRef: AngularFirestoreDocument<Pallet> = this.afs.collection('pallets').doc(id);
        const pallet$ = palletRef.snapshotChanges()
            .pipe(
                map((action: Action<DocumentSnapshot<Pallet>>) => {
                    let plt = action.payload.data();
                    if (plt)
                        plt._ref = action.payload.ref;
                    return plt;
                })
            )
        return pallet$;
    }

    getBricksInPallet(pallet: Pallet) : Observable<Brick[]> {
        // Get all the brick references in the pallet
        let brickRefs: AngularFirestoreCollection<{brick: DocumentReference}> = this.afs.doc<{brick: DocumentReference}>(pallet._ref).collection('bricks');
        // Track when things chane
        const bricks = brickRefs.snapshotChanges()
            .pipe(
                map((actions: DocumentChangeAction<{brick: DocumentReference}>[]) => actions.map((action) => {
                    // Every time the pallet changes get the new brick and get the bricks collection
                    let brick = action.payload.doc.data();
                    return brick;
                })),
                concatMap((brRefs) => combineLatest(brRefs.map((brRef) => {
                    //  rxmarbles.com combine the latest version of all the different bricks
                    return this.afs.doc<Brick>(brRef.brick).snapshotChanges();
                }))),
                map((actions: Action<DocumentSnapshot<Brick>>[]) => actions.map((action) => {
                    // Map each reference to the Brick type
                    let brck = action.payload.data();
                    brck._ref = action.payload.ref;
                    return brck;
                })),
                // Order the bricks by 'type'
                map((bricks: Brick[]) => bricks.sort((a: Brick, b: Brick) => a.type - b.type))
            );
        return bricks
    }

    getBricks() : Observable<Brick[]> {
        // Get the bricks collection from firebase as a collection of DocumentReference
        let brickCollection: AngularFirestoreCollection<Brick> = this.afs.collection('bricks');
        // https://github.com/angular/angularfire2/blob/master/docs/firestore/documents.md#snapshotchanges
        // Get snapshotChanges as opposed to valueChanges
        const bricks$ = brickCollection.snapshotChanges()
            .pipe(
                // Map the document references 
                map((actions: DocumentChangeAction<Brick>[]) => actions.map((action) => {
                    // https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md
                    // payload.doc is a DocumentSnapshot
                    const brick = action.payload.doc.data();
                    brick._ref = action.payload.doc.ref;
                    return brick;
                })),
                map((bricks: Brick[]) => bricks.sort((a: Brick, b: Brick) => a.type - b.type))
            );
        return bricks$;
    }
}