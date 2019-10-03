app.init=function(){
	
};
window.addEventListener("DOMContentLoaded", app.init);
app.signUp = () => {
    let username = document.getElementById('inputUser').value;
    let email = document.getElementById('inputEmail').value;
    let password =document.getElementById('inputPassword').value;

    
    if (!username) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Please enter username';
        return;
    }
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

    getRadioValue = () => { 
        let elements = document.getElementsByClassName('identityButton'); 
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked)
                return elements[i].value;
        }
    } 
    let role = getRadioValue();

    (async () => {
        let result =  await graph.mutate(`
            addUser(provider: "native", name: "${username}", email: "${email}", password: "${password}", role: "${role}") {
               accessToken 
               accessExpired
               role
            }`
        )();  
        return result;
    })().then((result) => {
        let user = result.addUser;
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
