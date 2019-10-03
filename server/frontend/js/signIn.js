app.init=function(){
	
};
window.addEventListener("DOMContentLoaded", app.init);

app.signIn = () => {
    let email = document.getElementById('inputEmail').value;
    let password =document.getElementById('inputPassword').value;

    if (!email) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Please enter email';
        return;
    }
    if (!password) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Please enter password';
        return;
    }

    (async () => {
        let result =  await graph.query(`
            user(provider: "native", email: "${email}", password: "${password}") {
                accessToken
                accessExpired
                role
            }`
        )(); 
        return result;
    })().then((result) => {
        let user = result.user;
        localStorage.setItem("accessToken", user.accessToken);
        localStorage.setItem("accessExpired", user.accessExpired);
        if (user.role === 'student') {
            window.location="./ask.html";
            return;
        }
        else if (user.role === 'teacher') {
            window.location="./answer.html";
            return;
        }
    }).catch((err) => {
        console.log(err);
        let Error = document.getElementById('errorMsg');
        Error.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent=err[0].message;
        return;
    });
}
// FB
app.fbSignIn = (accessToken) => {
    (async () => {
        let result =  await graph.query(`
            user(provider: "facebook", accessToken: "${accessToken}") {
                accessToken
                accessExpired
                role
            }`
        )(); 
        return result;
    })().then((result) => {
        let user = result.user;
        localStorage.setItem("accessToken", user.accessToken);
        localStorage.setItem("accessExpired", user.accessExpired);
        if (user.role === 'student') {
            window.location="./ask.html";
            return;
        }
        else if (user.role === 'teacher') {
            window.location="./answer.html";
            return;
        }
    }).catch((err) => {
        console.log(err);
        let Error = document.getElementById('errorMsg');
        Error.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent=err[0].message;
        return;
    }); 
}
  
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            let accessToken = response.authResponse.accessToken;
            let fb_request_body = {
            provider: "facebook",
            access_token: accessToken
            };
            console.log(accessToken);
            app.fbSignIn(accessToken);
        }
        });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '2088123174829137',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v3.3' // The Graph API version to use for the call
    });

    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            let accessToken = response.authResponse.accessToken;
            let fb_request_body = {
            provider: "facebook",
            access_token: accessToken
            };
        } 
    });
};
  
// Load the SDK asynchronously
(function(d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));