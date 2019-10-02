app.init=function(){
	app.allPosts();
};
window.addEventListener("DOMContentLoaded", app.init);

app.allPosts = () => {
    let accessToken = localStorage.getItem('accessToken');
    // let graph = graphql("http://localhost:3000/graphql", {
    //     alwaysAutodeclare: true,
    //     asJSON: true,
    //     debug: true
    // });
    let keyword = document.getElementById('search-txt').value;
    console.log(keyword);
    let query = (async () => {
        let result = await graph.query(`
            posts(status: "Answered", accessToken: "${accessToken}", keyword: "${keyword}") {
                id
                title
                subject {
                    name
                }
                teacher {
                    name
                }
                createdAt
                content
            }`
        )();
        return result;
    });
    query().then((data) => {
        let posts = data.posts;
        let carousel = document.getElementById('carousel');
        let child = carousel.lastElementChild;  
        while (child) { 
            carousel.removeChild(child); 
            child = carousel.lastElementChild; 
        } 
        for (let i = 0 ;i < posts.length; i++) {
            let order = "hideRight";
            if (i == 0) {
                order = "selected";
            }
            else if (i == 1) {
                order = "next";
            }
            else if (i == 2) {
                order = "prev";
            }
            else if (i == 3) {
                order = "nextRightSecond";
            }
            else if (i == 4) {
                order = " prevLeftSecond";
            }
            let outer = app.createElement("div", {atrs:{
                className: order
            }}, carousel); 
            let card = app.createElement("div", {atrs:{
                className: "card"
            }}, outer);  
            let naiyo = app.createElement("div", {atrs:{
                className: "naiyo"
            }}, card);  
            let top = app.createElement("h7", {atrs:{
                className: "top"
            }}, naiyo);   
            app.createElement("h7", {atrs:{
                className: "subject", textContent: posts[i].subject.name
            }}, top);  
            app.createElement("h1", {atrs:{
                className: "title", textContent: posts[i].title
            }}, top);  
            app.createElement("p", {atrs:{
                className: "teacher", textContent:'Teacher ' +posts[i].teacher.name
            }}, top); 
            app.createElement("p", {atrs:{
                className: "time", textContent:posts[i].createdAt
            }}, naiyo); 
            app.createElement("h7", {atrs:{
                className: "content", textContent:posts[i].content
            }}, naiyo);  
            app.setEventHandlers(card, {
                click:function(){
                    app.getChatRecord(posts[i].id);
                }
            })
        }
    });
}

app.getChatRecord = (id) => {
    console.log(id);
    let carousel = document.getElementById("carousel");
    let history = document.getElementById("history");
    carousel.setAttribute("style", "display: none");
    history.setAttribute("style", "display: flex");
    let box = document.getElementById("box");
    let child = box.lastElementChild;  
    while (child) { 
        box.removeChild(child); 
        child = box.lastElementChild; 
    } 
    // let graph = graphql("http://localhost:3000/graphql", {
    //     alwaysAutodeclare: true,
    //     asJSON: true,
    //     debug: true
    // });
    let query = (async () => {
        let result = await graph.query(`
            post(id: ${id}) {
                student {
                    id
                }
                chatRecords {
                    senderId
                    msgType
                    msg
                }
            }`
        )();
        return result;
    });
    query().then((data) => {
        let {chatRecords, student} = data.post;
        console.log(data.post);
        for (let i = 0; i < chatRecords.length; i++) {
            let role = 'other';
            if (chatRecords[i].senderId == student.id) 
                role = 'me';
            if (chatRecords[i].msgType === 'text') {
                app.createElement("div", {atrs:{
                    className: role, textContent:chatRecords[i].msg
                }}, box); 
            }
            else {
                app.createElement("img", {atrs:{
                    className: role, src: 'https://d1sxj9uxho820.cloudfront.net/' + chatRecords[i].msg,
                    height: 200, width: 200
                }}, box); 
            } 
        }
    }
)}

app.close = ()=> {
    console.log("hi");
    let carousel = document.getElementById("carousel");
    let history = document.getElementById("history");
    carousel.setAttribute("style", "display: block");
    history.setAttribute("style", "display: none"); 
}

function moveToSelected(element) {
    if (element == "next") {
      var selected = $(".selected").next();
    } else if (element == "prev") {
      var selected = $(".selected").prev();
    } else {
      var selected = element;
    }
  
    var next = $(selected).next();
    var prev = $(selected).prev();
    var prevSecond = $(prev).prev();
    var nextSecond = $(next).next();
  
    $(selected).removeClass().addClass("selected");
  
    $(prev).removeClass().addClass("prev");
    $(next).removeClass().addClass("next");
  
    $(nextSecond).removeClass().addClass("nextRightSecond");
    $(prevSecond).removeClass().addClass("prevLeftSecond");
  
    $(nextSecond).nextAll().removeClass().addClass('hideRight');
    $(prevSecond).prevAll().removeClass().addClass('hideLeft');
  
  }
  
  // Eventos teclado
  $(document).keydown(function(e) {
      switch(e.which) {
          case 37: // left
          moveToSelected('prev');
          break;
  
          case 39: // right
          moveToSelected('next');
          break;
  
          default: return;
      }
      e.preventDefault();
  });
 
  