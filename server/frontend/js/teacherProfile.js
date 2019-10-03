app.init=function(){
    app.showSubscription();
    app.getProfile();
    app.getSubscription();
};
window.addEventListener("DOMContentLoaded", app.init);

app.getProfile = () => {
    let accessToken = localStorage.getItem('accessToken');
    let query = (async () => {
        let result = await graph.query(`
            userProfile(accessToken: "${accessToken}") {
                name
                email 
                point
                createdAt
                photo
            }`
        )();
        return result;
    });
    query().then((data) => {
        let profile = data.userProfile;
        let time = new Date(parseInt(profile.createdAt, 10));
        time = time.toLocaleDateString();
        
        let profiles = document.getElementById("profiles");
        let child = profiles.lastElementChild;  
        while (child) { 
            profiles.removeChild(child); 
            child = profiles.lastElementChild; 
        } 
        if (!profile.point) profile.point = 0;
        app.createElement("div", {atrs:{
            className: "profile name", textContent: 'Name: '+profile.name
        }}, profiles); 
        app.createElement("div", {atrs:{
            className: "profile email", textContent: 'Email: '+profile.email
        }}, profiles); 
        app.createElement("div", {atrs:{
            className: "profile point", textContent: 'Points: '+profile.point
        }}, profiles); 
        app.createElement("div", {atrs:{
            className: "profile time", textContent: 'Start From: '+time
        }}, profiles); 
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
    });
}

app.showProfile = () => {
    let profiles = document.getElementById("profiles");
    profiles.setAttribute("style", "display: block");
    let logout = document.getElementById("logout");
    logout.setAttribute("style", "display: block");
    let subscription = document.getElementById("subscription");
    subscription.setAttribute("style", "display: none"); 
}

app.showSubscription = () => {
    let profiles = document.getElementById("profiles");
    profiles.setAttribute("style", "display: none");
    let logout = document.getElementById("logout");
    logout.setAttribute("style", "display: none");
    let subscription = document.getElementById("subscription");
    subscription.setAttribute("style", "display: block"); 
}

app.signOut = () => {  
    localStorage.removeItem("accessToken",);
    localStorage.removeItem("accessExpired",);
    window.location.replace("/signIn.html");
  }
