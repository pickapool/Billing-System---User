window.addEventListener("DOMContentLoaded", () => {
    //Login
    document
        .getElementById("complaint")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            document.getElementById("error").innerHTML = "";
            event.preventDefault();
            var message = document.getElementById("message").value;
            var aNumber = document.getElementById("aNumber").value;
            var aName = document.getElementById("aName").value;
            var phoneNumber = document.getElementById("pNumber").value;
            var email = document.getElementById("email").value;
            fetch("/saveComplaint", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ message, aName,aNumber,phoneNumber,email }),
            }).then(() => {
                document.getElementById("error").innerHTML = "Complaint successfully sent.";
            }).catch((error) => {
                document.getElementById("error").innerHTML = "Sorry there was a problem while sending your complaint";
            })
            document.getElementById("error").innerHTML = "Complaint successfully sent.";
        });
});