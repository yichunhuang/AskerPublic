// show all posts with status unanswer
// show post id / title / subject / content / images
app.init=function(){
    let accessToken = localStorage.getItem('accessToken');
    (async () => {
        let result = await graph.query(`
            posts(status: "Answering", accessToken: "${accessToken}") {
                id
            }`
        )();
        return result;
    })().then((result) => {
        if (result.posts.length > 0) {
            window.location ="./teacherSocket.html?postId="+result.posts[0].id;
            return;
        }
        app.allPosts();
        app.getSubjects();
    });
};
window.addEventListener("DOMContentLoaded", app.init);

app.allPosts = () => {
    let query = (async () => {
        let result = await graph.query(`
            posts(status: "Unanswer") {
                title
                id
                subject {
                    name
                }
            }`
        )();
        return result;
    });
    query().then((data) => {
        let posts = data.posts;
        let cardBox = document.getElementById("cardBox");
        for (let i = 0 ;i < posts.length; i++) {
            let card = app.createElement("div", {atrs:{
                className: "card"
            }}, cardBox); 
            let cardRight = app.createElement("div", {atrs:{
                className: "cardRight"
            }}, card); 
            let id = app.createElement("div", {atrs:{
                className: "postId", textContent: '#' + posts[i].id
            }}, cardRight); 
            app.createElement("div", {atrs:{
                className: "subject", textContent: posts[i].subject.name
            }}, cardRight); 
            app.createElement("div", {atrs:{
                className: "title", textContent: posts[i].title
            }}, card);  
            card.addEventListener("click", () => {
                app.getPost(posts[i].id);
            });
        }
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
    })
}

app.getPost = (id) => {
    let right = app.get('#right');
    let child = right.lastElementChild;  
    while (child) { 
        right.removeChild(child); 
        child = right.lastElementChild; 
    } 
    let query = (async () => {
        let result = await graph.query(`
            post(id: ${id}) {
                id
                title
                content
                images
                subject {
                    name
                }
                student {
                    name
                }
                createdAt
            }`
        )();
        return result;
    });
    query().then((data) => {
        let post = data.post;
        let top = app.createElement("div", {atrs:{
            className:"top"
        }}, right);
        let student = app.createElement("div", {atrs:{
            className:"student"
        }}, top);
        app.createElement("img", {atrs:{
            className:"studentImg", src: "/imgs/student.png"
        }}, student);
        app.createElement("div", {atrs:{
            className:"studentName", textContent:post.student.name
        }}, student);
        app.createElement("div", {atrs:{
            className:"go", textContent:'Go >>', id: "go"
        }}, top);
        app.createElement("div", {atrs:{
            className:"titleRight", textContent:post.title
        }}, right);
        let hashtag = app.createElement("div", {atrs:{
            className:"hashtag"
        }}, right);
        app.createElement("div", {atrs:{
            className:"idRight", textContent:'#'+post.id
        }}, hashtag);
        app.createElement("div", {atrs:{
            className:"subjectRight", textContent:post.subject.name
        }}, hashtag)
        app.createElement("div", {atrs:{
            className:"timeRight", textContent:post.createdAt
        }}, hashtag)
        app.createElement("div", {atrs:{
            className:"contentRight", textContent:post.content
        }}, right);
        let imgArr = post.images.split(",");

        for (let i = 0; i < imgArr.length; i++) {
            app.createElement("img", {atrs:{
                className:"images", src: 'https://d1sxj9uxho820.cloudfront.net/' + imgArr[i],
                height: 400, width: 600
            }}, right); 
        }
        let button = document.getElementById("go");
        button.addEventListener("click", () => {
            app.updatePost(id);
        });
    })
    
}

app.updatePost = (id) => {
    let accessToken = localStorage.getItem('accessToken');
    let query = (async () => {
        let result = await graph.mutate(`
            updatePost(id: ${id}, accessToken: "${accessToken}", status: "Answering") {
                status
            }`
        )();
        return result;
    });
    query().then((data) => {
        if (data.updatePost.status === "Answering") {
            window.location="./teacherSocket.html?postId=" + id;
        }
        return;
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
        return
    })
}
app.filter = () => {
    let subjects = document.getElementsByClassName("select7_content");
    let subjectIds = [];
    for (let i = 0; i < subjects.length; i++) {
        subjectIds.push(parseInt(subjects[i].dataset.optionValue));
    }
    let query = (async () => {
        let result = await graph.query(`
            posts(status: "Unanswer", subjectIds: [${subjectIds}]) {
                title
                id
                subject {
                    name
                }
            }`
        )();
        return result;
    });
    query().then((data) => {
        let posts = data.posts;
        let cardBox = document.getElementById("cardBox");
        let child = cardBox.lastElementChild;  
        while (child) { 
            if (child == cardBox.children[0])
                break;
            cardBox.removeChild(child); 
            child = cardBox.lastElementChild; 
        } 
        for (let i = 0 ;i < posts.length; i++) {
            let card = app.createElement("div", {atrs:{
                className: "card"
            }}, cardBox); 
            let cardRight = app.createElement("div", {atrs:{
                className: "cardRight"
            }}, card); 
            let id = app.createElement("div", {atrs:{
                className: "postId", textContent: '#' + posts[i].id
            }}, cardRight); 
            app.createElement("div", {atrs:{
                className: "subject", textContent: posts[i].subject.name
            }}, cardRight); 
            app.createElement("div", {atrs:{
                className: "title", textContent: posts[i].title
            }}, card);  
            card.addEventListener("click", () => {
                app.getPost(posts[i].id);
            });
        }
    }).catch((err) => {
        alert(err[0].message);
    })
}

app.getSubjects =function(){
  (async () => {
      let result =  await graph.query(`
          subjects {
            id
            name
          }
          `
      )();  
      return result;
  })().then((result) => {
      let subjects = result.subjects;
      let select7_select = document.getElementById('select7_select');
      for (let i = 0; i < subjects.length; i++) {
        let form = app.createElement("option", {atrs:{
            value: subjects[i].id, textContent: subjects[i].name
        }}, select7_select); 
      }
  }).catch((err) => {
      alert(err[0].message);
      console.log(err);
  });
};


const Select7 = {};

Select7.add = (elem, e) => {
    e.stopPropagation();
    var option_text =  elem[elem.selectedIndex].text;
    var option_value =  elem[elem.selectedIndex].value;
    var selected_items = elem.parentElement.querySelector(".select7_items");
    var placeholder = elem.parentElement.querySelector(".select7_placeholder");
    if (option_value === "filler" && option_text === "")
        return;

    placeholder.style.display = "none";

    selected_items.innerHTML += "<div class='select7_item'><div data-option-value='"+ option_value +"' class='select7_content'>"+ option_text +"</div><div class='select7_del' onclick='Select7.remove(this, event);'><div class='select7_x'></div><div class='select7_x'></div></div></div> ";

    elem[elem.selectedIndex].parentElement.removeChild(elem[elem.selectedIndex]);
    if (elem.length == 1)
        elem.style.display = "none";
};

Select7.remove = (elem, e) => {
    e.stopPropagation();
    var option_text = elem.parentElement.querySelector(".select7_content").innerHTML;
    var option_value = elem.parentElement.querySelector(".select7_content").dataset.optionValue;
    var selector = elem.parentElement.parentElement.parentElement.querySelector(".select7_select");
    
    selector.innerHTML += "<option value='"+ option_value +"'>"+ option_text +"</option>";
    
    if (selector.length > 1)
        selector.style.display = "block";
    
    var selected_items = elem.parentElement.parentElement.parentElement.querySelectorAll(".select7_item");
    if (selected_items.length == 1) {
        var placeholder = elem.parentElement.parentElement.parentElement.querySelector(".select7_placeholder");
        placeholder.style.display = "block";
    }

    elem.parentElement.parentElement.removeChild(elem.parentElement);
};

Select7.get = (select7_id, type = "both") => {
    var selected_items = document.getElementById(select7_id).querySelectorAll(".select7_content");

    if (selected_items.length > 0) {
        var selected_values = [];

        switch (type) {
            case "value": {
                for (let i = 0; i < selected_items.length; i++)
                    selected_values = [...selected_values, selected_items[i].dataset.optionValue];
                break;
            }
            case "text": {
                for (let i = 0; i < selected_items.length; i++)
                    selected_values = [...selected_values, selected_items[i].innerHTML];
                break;
            }
            case "both": {
                for (let i = 0; i < selected_items.length; i++)
                    selected_values = [...selected_values, {
                        "text": selected_items[i].innerHTML,
                        "value": selected_items[i].dataset.optionValue,
                    }];
                break;
            }
        }

        return selected_values;
    }
};