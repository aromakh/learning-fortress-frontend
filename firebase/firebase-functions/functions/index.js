const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
admin.initializeApp();

exports.blockSignup = functions.auth.user().onCreate(event => {
  // console.log(event);
  //if (!event.emailVerified)
    return admin.auth().updateUser(event.uid, { disabled: true })
        .then(userRecord => console.log("Auto blocked user", userRecord.toJSON()))
        .catch(error => console.log("Error auto blocking:", error))
        .then(() => {
            let rf = admin.firestore().collection('students').doc(event.uid)
            return rf.set({}).then(() => {
                return rf.collection('pallets').add({
                    pallet: admin.firestore().doc("pallets/bsjsJllNgYkos0w3Wrtv")
                });
            });
        });
});
