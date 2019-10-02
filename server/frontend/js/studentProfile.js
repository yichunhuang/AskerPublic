app.init=function(){
    app.getProfile();
};
window.addEventListener("DOMContentLoaded", app.init);

app.getProfile = () => {
    let accessToken = localStorage.getItem('accessToken');
    // let graph = graphql("http://localhost:3000/graphql", {
    //     alwaysAutodeclare: true,
    //     asJSON: true,
    //     debug: true
    // });
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
        let card = document.getElementById('card');
        let src = "/imgs/bigprofile.png";
        if (profile.photo)
            src = profile.photo;
        app.createElement("img", {atrs: {
            className: "image", src: src
        }}, card);

        let time = new Date(parseInt(profile.createdAt, 10));
        time = time.toLocaleDateString();
        
        // let naiyo = document.getElementById('naiyo');
        let naiyo = app.createElement("div", {atrs: {
            className: "naiyo", src: src
        }}, card); 
        let profiles = app.createElement("div", {atrs: {
            className: "profiles"
        }}, naiyo)
        // let profiles = document.getElementById("profiles");
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
        app.createElement("div", {atrs:{
            className: "logout", textContent: 'Log Out'},
            evts:{
				click:app.signOut
			}
        }, naiyo); 
        // <div id="logout" class="logout" onclick="app.signOut()">Log Out</div>
    });
}

app.signOut = () => {  
    localStorage.removeItem("accessToken",);
    localStorage.removeItem("accessExpired",);
    window.location.replace("/signIn.html");
  }
