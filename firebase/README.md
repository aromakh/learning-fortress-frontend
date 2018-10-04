
## Setting up a separate Dev Firestore
You do not have access to the web console of the dummy firebase project (although you can interact with it using the connection details stored in this repo). It also might be corrupted or restored at anypoint. 

If you just need a separate dummy backend for dev then:

1. get a free account at https://firebase.google.com/   
2. Create a new Cloud Firebase project, and click on 'Database' on left menu then 'Create database' under Cloud Firestore. generate a private key (Database>Project Settings>Service Accounts>Generate new private key). 
3. Move this new key to /firebase/key.json in this directory.   
4. Install the firebase backup-restore npm package globally, and run a restore of this dummy database (see below)
```bash
$ npm install -g firestore-backup-restore
$ firestore-backup-restore --backupPath firebase/backup --restoreAccountCredentials firebase/key.json
```
https://www.npmjs.com/package/firestore-backup-restore
5. Finally folow the instructions in [environment/environment.ts](./environment/environment.ts) to setup the connection details from app.


## Security
As we are using the Firestore db we need to set some security rules in the backend

https://firebase.google.com/docs/firestore/security/get-started

```bash
// Allow read/write access on all documents to any user signed in to the application
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

We also have a cloud script if we want to lock down new users from accessing the site. We have opened this up for the moment.

## Firebase User blocking signup
This is apparently the only way to block new users with firebase UI at the moment
https://github.com/firebase/firebaseui-web/issues/99
The user can still signup but they cannot access the app until their account has been enabled in the firebase console.

You need to create a new directory locally, then use the code below and the cloud functions starter guide to implement this from the local machine. https://firebase.google.com/docs/functions/get-started?authuser=0
Make sure to uncomment the relevant function in firebase/firebase-functions/functions/index.js

```bash
$ cd firebase/firebase-functions/functions
$ npm install -g firebase-tools
$ npm install
$ firebase login
$ firebase deploy --only functions
```

We also need to redirect new users so they don't auto login after signup
```javascript
signInSuccess(event: FirebaseUISignInSuccessWithAuthResult) {
        if (event.authResult.additionalUserInfo.isNewUser) {
          this.afAuth.auth.signOut();
          return true;
        }
        console.log(`signed in as ${event.authResult.user.displayName} who is${event.authResult.additionalUserInfo.isNewUser?"":" not"} a new user.`);
        return true;
    }
```
