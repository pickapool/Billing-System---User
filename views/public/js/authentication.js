window.addEventListener("DOMContentLoaded", () => {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
  const users = firebase.database().ref('/UserAccounts');
  //Login
  try {
  document
    .getElementById("login")
    .addEventListener("submit", (event) => {

      event.preventDefault();
      const login = event.target.email.value;
      const password = event.target.password.value;
      firebase
        .auth()
        .signInWithEmailAndPassword(login, password)
        .then(({ user }) => {
          var userUID = firebase.auth().currentUser.uid;
          return user.getIdToken().then((idToken) => {
            return fetch("/login", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
              },
              body: JSON.stringify({ idToken, userUID, login }),
            });
          });
        })
        .then(() => {
          return firebase.auth().signOut();
        })
        .then(() => {
          window.location.assign("/home");
        }).catch((error) => {
          var mess = error.message.toString();
          if (mess.includes("no user"))
            document.getElementById("error-message").innerHTML = "Sorry we can't find your account!";
          else
            document.getElementById("error-message").innerHTML = error.message;
        })
      return false;
    });
  } catch(ee) {
    
  }
  //Google signin
  try {
  document
    .getElementById("googleButton")
    .addEventListener("click", (event) => {
      event.preventDefault();
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      firebase.auth()
        .signInWithPopup(provider)
        .then(({ user }) => {
          var credential = user.credential;
          //var idToken = credential.accessToken;
          var userUID = firebase.auth().currentUser.uid;
          var email = firebase.auth().currentUser.email
          GoogleSignIn(userUID,email,user);
        })
        .catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log("code error" + errorCode)
          alert(errorMessage);
          console.log("email error" + email)
          console.log("credential error" + credential)
          // ...
        });
    });
  } catch(ee) {
    
  }
  function GoogleSignIn(userUID,email,user) {
    users.child(userUID).once("value")
      .then(function (snapshot) {
        var exist = snapshot.exists();
        var data = snapshot.val();
        var name = "None";
        var phoneNumber = "None";
        var address = "None";
        var password = "None";
        var type = "google";

        if (exist) {
          if (data.loginType == type) {
            return user.getIdToken().then((idToken) => {
              return fetch("/login", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken, userUID }),
              });
            }).then(() => {
                return firebase.auth().signOut();
              })
              .then(() => {
                window.location.assign("/home");
              });
          } else {
            document.getElementById("error-message").innerHTML = "Email was used and associated in different provider";
          }
        } else {
          //save
          return fetch("/saveUser", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({ name, phoneNumber, address, email, password, userUID, type}),
          }).then( ()=> {
            return user.getIdToken().then((idToken) => {
              return fetch("/login", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken, userUID }),
              });
            })
              .then(() => {
                window.location.assign("/home");
              });
          });
        }
      });
  }
  //ENd google signin
  //Start faceboook LOgin
  try {
  document
    .getElementById("facebookButton")
    .addEventListener("click", (event) => {
      event.preventDefault();
      var provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth()
        .signInWithPopup(provider)
        .then(({ user }) => {
          var credential = user.credential;
          //var idToken = credential.accessToken;
          var userUID = firebase.auth().currentUser.uid;
          var email = firebase.auth().currentUser.email
          FacebookSignIn(userUID,email,user);
        })
        .catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log("code error" + errorCode)
          alert(errorMessage);
          console.log("email error" + email)
          console.log("credential error" + credential)
          // ...
        });
    });
  } catch(ee) {
    
  }
  function FacebookSignIn(userUID,email,user) {
    users.child(userUID).once("value")
      .then(function (snapshot) {
        var exist = snapshot.exists();
        var data = snapshot.val();
        var name = "None";
        var phoneNumber = "None";
        var address = "None";
        var password = "None";
        var type = "facebook";

        if (exist) {
          if (data.loginType == type) {
            return user.getIdToken().then((idToken) => {
              return fetch("/login", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken, userUID }),
              });
            }).then(() => {
                return firebase.auth().signOut();
              })
              .then(() => {
                window.location.assign("/home");
              });
          } else {
            document.getElementById("error-message").innerHTML = "Email was used and associated in different provider";
          }
        } else {
          //save
          return fetch("/saveUser", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({ name, phoneNumber, address, email, password, userUID, type}),
          }).then( ()=> {
            return user.getIdToken().then((idToken) => {
              return fetch("/login", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken, userUID }),
              });
            })
              .then(() => {
                window.location.assign("/home");
              });
          });
        }
      });
  }

  //End faecbook login
});