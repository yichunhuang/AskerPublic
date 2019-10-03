app.init=function(){
};
window.addEventListener("DOMContentLoaded", app.init);

document.addEventListener("DOMContentLoaded", () => {
    let status = document.getElementById("status");
    let sendForm = document.getElementById("sendForm");
    let content = document.getElementById("content");
    let userId;

    let uploader = new SocketIOFileUpload(socket);
    uploader.listenOnInput(document.getElementById("siofu_input"));
    uploader.addEventListener("start", (e) => {
        document.getElementById('loading1').style.visibility = 'visible';
        document.getElementById('loading2').style.visibility = 'visible';
    })

    socket.emit("init");
    
    socket.on("userId", (data) => {
        userId = data;
    });

    socket.on("chatRecord", (msgs) => {
        for (let i = 0; i < msgs.length; i++) {
            addMsgToBox(msgs[i]);
            setTimeout(scrollTo(document.getElementById('content'), 0), 10);
        }
        
    });

    socket.on("msg", (msg) => {
        addMsgToBox(msg);
        scrollTo(document.getElementById('content'), 300);
    });

    socket.on("online", (onlineCount) => {
        let icon = document.getElementById('icon');
        let text = document.getElementById('text');
        if (onlineCount > 1) {
            icon.className = "onlineIcon";
            text.className = "onlineText";
            text.textContent = "online";
        }
        else {
            icon.className = "offlineIcon";
            text.className = "offlineText"; 
            text.textContent = "offline";
        }
    });

    socket.on("studentLeave", () => {
        alert("Thanks for your help, you got 10 points! You will be redirected in 10 seconds.");
        setTimeout(function(){  window.location="./answer.html"; }, 10000);
    })
    socket.on("teacherLeave", () => {
        alert("Teacher just left, please wait for new teacher.");
    })
    sendForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let formData = {};
        let msg = document.getElementById("msg").value;
        if (!msg.replace(/\s/g, ''))
            return;
        socket.emit("send", {msgType: 'text', msg: msg});
        document.getElementById("msg").value = "";
    });

    addMsgToBox = (msg) => {
        let role;
        if (msg.senderId === userId) {
            role = 'me';
        }
        else {
            role = 'other';
        }
        if (msg.msgType === 'text') {
            app.createElement("div", {atrs:{
                className: role, textContent:msg.msg
            }}, content); 
        }
        else {
            document.getElementById('loading1').style.visibility = 'hidden';
            document.getElementById('loading2').style.visibility = 'hidden';
            let img = app.createElement("img", {atrs:{
                className: role, src: 'https://d1sxj9uxho820.cloudfront.net/' + msg.msg,
                height: 200, width: 200
            }}, content); 
            app.setEventHandlers(img, {
                click:browseImage
            });
        } 
    }
});

studentLeave = () => {
    let confirmMsg = confirm("Are you sure you want to end this chat?");
    if (!confirmMsg) {
        return;
    }
    let accessToken = localStorage.getItem('accessToken');
    let url = window.location.href;
    url = new URL(url);
    let id = url.searchParams.get("postId");
    let query = (async () => {
        let result = await graph.mutate(`
            updatePost(id: ${id}, accessToken: "${accessToken}", status: "Answered") {
                status
            }`
        )();
        return result;
    });
    query().then((data) => {
        if (data.updatePost.status === "Answered") {
            socket.emit("studentLeave"); 
            alert("10 points transferred to teacher, you will be redirected to ask page.");
            window.location="./ask.html";
        }
        else if (data.updatePost.status === "Discard") {
            alert("You just discard this question and will be redirected to ask page");
            window.location="./ask.html";
        }
        else {
            alert("Cannot leave now");
        }
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
    });
}
teacherLeave = () => {
    let confirmMsg = confirm("Are you sure you want to leave? (You won't get any points.)");
    if (!confirmMsg) {
        return;
    }
    let accessToken = localStorage.getItem('accessToken');
    let url = window.location.href;
    url = new URL(url);
    let id = url.searchParams.get("postId");
    let query = (async () => {
        let result = await graph.mutate(`
            updatePost(id: ${id}, accessToken: "${accessToken}", status: "Unanswer") {
                status
            }`
        )();
        return result;
    });
    query().then((data) => {
        if (data.updatePost.status === "Unanswer") {
            socket.emit("teacherLeave"); 
            alert("You just give up this question and will be redirected.");
            window.location="./answer.html";
        }
        else {
            alert("Cannot leave now");
        }
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
    });
}
function browseImage(e) {
    let url = e.target.src;
    let main = document.getElementById('main');
    let history = document.getElementById("history");
    main.setAttribute("style", "display: none");
    history.setAttribute("style", "display: flex");
    let box = document.getElementById("box");
    let child = box.lastElementChild;  
    while (child) { 
        box.removeChild(child); 
        child = box.lastElementChild; 
    } 
    app.createElement("img", {atrs:{
        className: 'browse', src: url
    }}, box);
}
app.close = ()=> {
    let main = document.getElementById('main');
    main.setAttribute("style", "display: grid");
    let history = document.getElementById("history");
    history.setAttribute("style", "display: none"); 
}

function scrollTo(element, duration) {
    if (!element) {
        return
    }
    var target = element.scrollHeight
    target = Math.round(target)
    duration = Math.round(duration)
    if (duration < 0) {
        return false
    }
    if (duration === 0) {
        element.scrollTop = target
        return true
    }
    var start_time = Date.now()
    var end_time = start_time + duration
    var start_top = element.scrollTop
    var distance = target - start_top
    var smooth_step = function (start, end, point) {
        if (point <= start) { return 0 }
        if (point >= end) { return 1 }
        var x = (point - start) / (end - start) // interpolation
        return x * x * (3 - 2 * x)
    }
    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    var previous_top = element.scrollTop
    // This is like a think function from a game loop
    var scroll_frame = function () {
        if (element.scrollTop !== previous_top) {
            return false
        }
        // set the scrollTop for this frame
        var now = Date.now()
        var point = smooth_step(start_time, end_time, now)
        var frameTop = Math.round(start_top + (distance * point))
        element.scrollTop = frameTop
        // check if we're done!
        if (now >= end_time) {
            return true
        }
        // If we were supposed to scroll but didn't, then we
        // probably hit the limit, so consider it done; not
        // interrupted.
        if (element.scrollTop === previous_top && element.scrollTop !== frameTop) {
            return true
        }
        previous_top = element.scrollTop
        // schedule next frame for execution
        setTimeout(scroll_frame, 20)
    }
    // boostrap the animation process
    setTimeout(scroll_frame, 20)
}

