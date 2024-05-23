window.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("registerButton")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            document.getElementById("errorRegister").innerHTML = "";
            var name = event.target.name.value;
            var phoneNumber = event.target.phoneNumber.value;
            var address = event.target.address.value;
            var email = event.target.email.value;
            var password = event.target.password.value;
            var cPassword = event.target.cPassword.value;
            var type = "firebase";
            if (password == cPassword) {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        firebase
                        .auth()
                        .signInWithEmailAndPassword(email, password)
                        .then(({ user }) => {
                            var userUID =  firebase.auth().currentUser.uid;
                            fetch("/saveUser", {
                                method: "POST",
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                                },
                                body: JSON.stringify({ name, phoneNumber, address, email, password,userUID, type}),
                            });
                        }).then( ()=> {
                            document.getElementById("errorRegister").style = "color:green";
                            document.getElementById("errorRegister").innerHTML = "Registered successfully, please close and login";
                        })
                    })
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        if (errorCode == 'auth/weak-password') {
                            document.getElementById("errorRegister").innerHTML = "The password is too weak";
                        } else {
                            document.getElementById("errorRegister").innerHTML = errorMessage;
                        }
                    });
            } else {
                document.getElementById("errorRegister").innerHTML = "Password did not match";
            }


        });
});

