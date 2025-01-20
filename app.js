const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const hbs = require('express-handlebars');
const cookieParser = require('cookie-parser')
const admin = require("firebase-admin");
const csrf = require("csurf");
const date = require('date-and-time')
const sdk = require('api')('@paymongo/v2#1nbm6y23lozcngod');


//firebase
var serviceAccount = require("./serviceAccountKey.json");
const { Console } = require('console');
const { request } = require('http');
const { response } = require('express');
const cors = require('cors');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://billing-system-86a33-default-rtdb.firebaseio.com",
  storageBucket: "billing-system-86a33.appspot.com"
});

const app = express();
//Set View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers: {
    eq: (v1, v2) => v1 === v2,
    empty: (v1) => v1 === String.empty,
    null: (v1) => v1 === null,
    undefined: (v1) => v1 === undefined
  },
  extname: 'hbs',
  defaultLayout: 'mainLayout.hbs',
  layoutsDir: __dirname + '/views/layouts/'
}));

//End view engine

//Init
const database = admin.database();
const auth = admin.auth();
const csrfMiddleware = csrf({ cookie: true });

const payments = database.ref('/Payment_ID');
const complaints = database.ref('/Complaints');
const userAccount = database.ref('/UserAccounts');
const bills = database.ref('/Bills');

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(cors());

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});


app.get('/', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      //console.log("Logged in:", userData.email)
      response.render('HomePage', { isLogin: false });
    })
    .catch((error) => {
      response.render('HomePage', { isLogin: true });
    });
});
app.get('/services', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('Services', { isLogin: false });
    })
    .catch((error) => {
      response.render('Services', { isLogin: true });
    });
});
app.get('/home', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('HomePage', { isLogin: false });
    })
    .catch((error) => {
      response.render('HomePage', { isLogin: true });
    });
});
app.get('/login', (request, response) => {
  response.render('login', { isLogin: true , loginPage : true});
});
app.get('/aboutus', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('AboutUs', { isLogin: false });
    })
    .catch((error) => {
      response.render('AboutUs', { isLogin: true });
    });
});
app.get('/contactus', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('ContactUs', { isLogin: false });
    })
    .catch((error) => {
      response.render('ContactUs', { isLogin: true });
    });
});
app.get('/faqs', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('Faqs', { isLogin: false });
    })
    .catch((error) => {
      response.render('Login', { isLogin: true });
    });
});

app.get('/paybills', (request, response) => {
  var amount = request.query.amount;
  var from = request.query.previousreading;
  var to = request.query.presentreading;
  var con = request.query.consumed;
  var arrears = request.query.arrears;
  console.log(from)
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('PayBills', { isLogin: false, 
        amount : amount,
        previousreading : from,
        presentreading: to,
      consumed : con,
    arrears : arrears });
    })
    .catch((error) => {
      response.render('Login', { isLogin: true });
    });
});
app.get('/complaints', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      getUser(userData.user_id)
      .then((user) => {
        response.render('Complaints', { isLogin: false, user : user});
      })
      .catch((error) => {
        console.error(error);
      });
     
    })
    .catch((error) => {
      response.render('login', { isLogin: true , loginPage : true});
    });
});
let ids = (uid) => {
  let id = [];
  payments.child(uid).on('value', (snapshot) => {
    if (snapshot.hasChildren()) {
      snapshot.forEach((data) => {
        id.push(data.val());
      });
    }
  });
  return id;
}

app.get('/mybills', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      response.render('MyBills', { isLogin: false, MyBills :  myBills(userData.uid)});
    })
    .catch((error) => {
      response.render('login', { isLogin: true , loginPage : true});
    });
});

let myBills = (uid) => {
  let bill = [];
  bills.on('value', (snapshot) => {
    if (snapshot.hasChildren()) {
      snapshot.forEach((data) => {
        var value = data.val();
        if(value.clientUid == uid)
        {
          bill.push(value);
        }
      });
    }
  });
  return bill;
}

app.get('/transactions', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
        response.render('Transactions', { isLogin: false, paymentIds : JSON.stringify(ids(userData.uid)) });
    }).then( () => {
        
        
    })
    .catch((error) => {
      response.render('login', { isLogin: true , loginPage : true});
    });
});
app.get('/myComplaints', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      let listOfComplaints = [];
      complaints.orderByChild("userUid").equalTo(userData.uid).on('value', (snapshot) => {
        if (snapshot.hasChildren()) {
          snapshot.forEach((data) => {
            listOfComplaints.push(data.val());
           // console.log(data.val());
          });
        }
      })
      response.render('MyComplaints', { isLogin: false, listOfComplaints : listOfComplaints });
    }).then( () => {
        
        
    })
    .catch((error) => {
      response.render('login', { isLogin: true , loginPage : true});
    });
});
//Save complaint
app.post('/saveComplaint', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      };
      let date = new Date();
      let local = date.toLocaleDateString("en-PH", options);
      local = local.replace("at", "");
      var aNumber = request.body.aNumber;
      var aName = request.body.aName;
      var phone = request.body.phoneNumber;
      var email = request.body.email;
      var message = request.body.message;

      var key = complaints.push().key;
      var now = new Date();

      var complaintData = {
        userUid: userData.uid,
        phoneNumber: phone,
        message: message,
        key: key,
        dateTime: local,
        accountNumber: aNumber,
        accountName: aName,
        email: email
      }
      complaints.child(key).set(complaintData).then( ()=> {
        response.render("Complaints");
      })
    })
    .catch((error) => {
      response.render('Login', { isLogin: true });
    });
});
//Save user
app.post('/saveUser', (request, response) => {
  var name = request.body.name;
  var phoneNumber = request.body.phoneNumber;
  var address = request.body.address;
  var email = request.body.email;
  var password = request.body.password;
  var uid = request.body.userUID;
  var type = request.body.type;
  var user = {
    accountNumber : "None",
    address : address,
    email : email,
    loginType : type,
    name : name,
    phoneNumber : phoneNumber,
    profile : "None",
    uid : uid
  }
  userAccount.child(uid).set(user).then( () => {
    response.clearCookie("session");
  });

});
let getUser = (uid) => {
  return new Promise((resolve, reject) => {
    userAccount.orderByChild('uid').equalTo(uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        let user = Object.values(snapshot.val())[0]; // Get the first matching value
        resolve(user);
      } else {
        resolve(null); // No matching value found
      }
    }, (error) => {
      reject(error); // Handle errors
    });
  });
};
//Pay bill
app.post('/pay', (request, response) => {
  const sessionCookie = request.cookies.session || "";
  auth
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      var paymentID = request.body.paymentId;
      var paymentUrl = request.body.paymentUrl;
      //console.log(userData)
      //save first
      var key = payments.push().key;
      var paymentData = {
        key: key,
        paymentId: paymentID,
        previousreading : request.body.previousreading,
        presentreading : request.body.presentreading,
        consumed : request.body.consumed,
        arrears : request.body.arrears,
        clientUid : userData.uid
      }

      payments.child(userData.uid).child(key).set(paymentData)
        .then(() => {
          response.json({ paymentUrl:  paymentUrl});
          //window.open(paymentUrl, '_blank');
          //response.redirect(paymentUrl);
        })
    })
    .catch((error) => {
      response.render('Login', { isLogin: true });
    });

})

app.get('/logout', (request, response) => {
  response.clearCookie("session");
  response.render('login', { isLogin: true , loginPage : true});
});
app.post('/login', (request, response) => {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const idToken = request.body.idToken.toString();
  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        response.cookie("session", sessionCookie, options);
        response.render('HomePage', { isLogin: false });
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.listen(5000, () => {
  console.log("App running on 5000");
});


