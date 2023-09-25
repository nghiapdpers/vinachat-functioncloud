# vinachat-functioncloud

Server API for Mobile App Vinachat 

How to test server in local:

1. Install Firebase CLI: https://firebase.google.com/docs/cli
2. Create a Project in google console: https://console.firebase.google.com/, and make sure that you did:
    - Create Firestore
    - Create Realtime Database
    - Enable Authentication
3. Open CMD, and login to Firebase: https://firebase.google.com/docs/cli#sign-in-test-cli, Check your project by command:
````
    $ firebase projects:list
````
4. Go to root directiory of this repository and run:
````
    // go to functions and install dependencies:
    $ cd functions && npm install

    // after that, run firebase emulator:
    $ firebase emulators:start
````
5. Go to: https://localhost:5000 and enjoy it.

### Make sure that you is joint my project (itestcloudfunction) to run this repository.
Contact me if you want to joint my firebase project. 
