window.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("forgotButton")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            var email  = event.target.email.value;

            firebase.auth().sendPasswordResetEmail(
                email)
                .then(function() {
                  console.log("sent")
                  document.getElementById("error").innerHTML = "Password reset sent successfully";
                  document.getElementById("error").styley = "color:green;";
                })
                .catch(function(error) {
                    var message = error.message;
                    if(message.includes("no user"))
                    {
                        console.log("Sorry we can't find your account");
                        document.getElementById("error").innerHTML = "Sorry we can't find your account";
                    }
                    
                });
            
        });
});