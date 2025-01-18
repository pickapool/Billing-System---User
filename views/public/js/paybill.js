window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("payment").style = "display:none;";
    
    //Login
    document
        .getElementById("paybill")
        .addEventListener("submit", (event) => {
            event.preventDefault();

            var amount = document.getElementById("amount").value;
            var previousreading = document.getElementById("previousreading").value;
            var presentreading = document.getElementById("presentreading").value;
            var consumed = document.getElementById("consumed").value;
            var arrears = document.getElementById("arrears").value;

            var totalAmount = amount * 100;
            var paymentUrl = "";
            document.getElementById("error").innerHTM = "";
            if(amount < 200)
            {
                document.getElementById("error").innerHTML = "Amount should be greater than P200.00.";
                return;
            }

            const options = {
                method: 'POST',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  authorization: 'Basic c2tfdGVzdF9KQU1EMlVNaEVhTDZNUHBQb2pzWXNETUM6VmluQDA4MjgyMDAy'
                },
                body: JSON.stringify({data: {attributes: {
                    amount: totalAmount, 
                    description: 'Payment for water bill'
                    }}})
              };
              fetch('https://api.paymongo.com/v1/links', options)
                .then(response => 
                {
                    response.json().then (function (result) {
                        var paymentId = result.data.id;
                        paymentUrl = result.data.attributes.checkout_url;
                        var link = document.getElementById("payment");
                        link.setAttribute("href", paymentUrl);
                        
                        fetch("/pay", {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                            },
                            body: JSON.stringify({
                                paymentId,
                                paymentUrl,
                                previousreading,
                                presentreading,
                                consumed,
                                arrears,
                            }),
                            }).then((response) => {
                            if (response.ok) {
                                response.json().then((data) => {
                                    window.location.href = data.paymentUrl; // Redirect to payment URL
                                });
                            } else {
                                console.error('Error with the payment request:', response);
                            }
                            }).catch((error) => {
                            console.error("Error in fetch request:", error);
                            });
                        
                        //link.click();
                    });
                })
                .catch(err => console.error(err))
        });
});