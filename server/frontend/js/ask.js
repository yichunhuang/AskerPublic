app.init=function(){
    let accessToken = localStorage.getItem('accessToken');
    let hasAnswering = graph.query(`
    posts(status: "Answering", accessToken: "${accessToken}") {
        id
    }`
    )();
    let hasUnanswer = graph.query(`
    posts(status: "Unanswer", accessToken: "${accessToken}") {
        id
    }`
    )(); 
    Promise.all([hasAnswering, hasUnanswer]).then((values) => {
        values.forEach((value) => {
            if (value.posts.length > 0) {
                window.location ="./studentSocket.html?postId="+value.posts[0].id;
                return; 
            }
        })
        app.getSubscription();
    });
};
window.addEventListener("DOMContentLoaded", app.init);
app.getSubscription =function(){
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
      let subject = document.getElementById('subject');
      let subjects = result.subjects;
      for (let i = 0; i < subjects.length; i++) {
        app.createElement("option", {atrs:{
            value: subjects[i].id, textContent: subjects[i].name
        }}, subject); 
      }
  }).catch((err) => {
      alert(err);
      console.log(err);
  });
};
app.newPost = () => {
    let title = document.getElementById('title').value;
    let subjectId = document.getElementById('subject').value;
    let content = document.getElementById('details').value;
    let files = document.getElementById('files').files;
    let accessToken = localStorage.getItem('accessToken');
    let images = [];
    if (!title) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Title is required';
        return;
    }
    if (!content) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Details are required.';
        return;
    }
    
    if (!files.length) {
        let err = document.getElementById('errorMsg');
        err.style.visibility = 'visible';
        let msg = document.getElementById('msg'); 
        msg.textContent='Please upload at least 1 file';
        return;
    }
    
    addPost = (async () => {
        let result =  await graph.mutate(`
            addPost(title: "${title}", subjectId: ${subjectId}, content: "${content}", images: [${images}], accessToken: "${accessToken}") {
                id
            }`
        )();
        return result;
    });
    
    let count = 0;
    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        let reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                let binaryData = e.target.result;
                //Converting Binary Data to base 64
                let base64String = window.btoa(binaryData);

                images[i] = '\"' + base64String + '\"';
                count ++;
                console.log(count);
                if (count == files.length) {
                    addPost().then((result) => {
                        console.log(result);
                        window.location="./studentSocket.html?postId=" + result.addPost.id;
                    }).catch((err) => {
                        console.log(err);
                        if (err[0].message === "Point Invalid") {
                            alert("Please buy point first");
                        }
                        else if (err[0].message === "Token Invalid") {
                            alert("Please log in again");
                            window.location="./signIn.html";
                        }
                    })
                }
            };
        })(f);
        // Read in the image file as a data URL.
        reader.readAsBinaryString(f); 
    }
}
