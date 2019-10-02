app.getSubscription =function(){
	// let graph = graphql("http://localhost:3000/graphql", {
  //       alwaysAutodeclare: true,
  //       asJSON: true,
  //       debug: true
  // });
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
      let p = document.getElementById('form');
      let formCount = Math.ceil(result.subjects.length/2);
      let eleCount = 0;
      for (let i = 0; i < formCount; i++) {
        let form = app.createElement("div", {atrs:{
            className: "form"
        }}, p); 
        let box = app.createElement("div", {atrs:{
          className: "box"
        }}, form); 
        app.createElement("div", {atrs:{
          textContent:result.subjects[eleCount].name
        }}, box)
        let switchy = app.createElement("label", {atrs:{
          className: "switchy"
        }}, box);  
        app.createElement("input", {atrs:{
          type: "checkbox", name: "subject", value: result.subjects[eleCount].id 
        }}, switchy);  
        app.createElement("span", {atrs:{
          className: "slider round"
        }}, switchy);   
        eleCount ++;
        if (eleCount < result.subjects.length) {
          let box = app.createElement("div", {atrs:{
            className: "box"
          }}, form); 
          app.createElement("div", {atrs:{
            textContent:result.subjects[eleCount].name
          }}, box)
          let switchy = app.createElement("label", {atrs:{
            className: "switchy"
          }}, box);  
          app.createElement("input", {atrs:{
            type: "checkbox", name: "subject", value: result.subjects[eleCount].id 
          }}, switchy);  
          app.createElement("span", {atrs:{
            className: "slider round"
          }}, switchy);   
          eleCount ++;
        }
      }
      app.createElement("input", {atrs:{
        className: "submit", type: "submit", value: "SAVE"
      }}, p); 

  }).catch((err) => {
      alert(err[0].message);
      if (err[0].message === 'Token Invalid')
          window.location.replace("/signIn.html");
  });
};
window.addEventListener("DOMContentLoaded", app.init)

const publicVapidKey =
    "BM2ztETnZLvv7HW9BbJomsq7HLDM9WTdosjts9iwy0W61AY8ZJij8cHPyrHSUzp0M8gIHCoaWZxTKjBazO_zbJA";

function sw() {
  console.log("sw function");
  // Check for service worker
  if ("serviceWorker" in navigator) {
    console.log('service Worker here');
    send().catch(err => console.error(err));
  }
}

// Register SW, Register Push, Send Push
async function send() {
  console.log("send function");
  let accessToken = localStorage.getItem('accessToken');
  let checkedBoxes = document.querySelectorAll('input[name=subject]:checked');
  let subjectIds = [];
  for (let i = 0; i < checkedBoxes.length; i++) {
    subjectIds.push(checkedBoxes[i].value);
  }
  console.log(subjectIds);
  // Register Service Worker
  const register = await navigator.serviceWorker.register("worker.js", {scope: "/"});
  register.update();

  // Register Push｀
  let subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  
  // let graph = graphql("http://localhost:3000/graphql", {
  //       alwaysAutodeclare: true,
  //       asJSON: true,
  //       debug: true
  // });
  let {endpoint, expirationTime, keys} = JSON.parse(JSON.stringify(subscription));
  let {p256dh, auth} = keys;
  (async () => {
      let result =  await graph.mutate(`
          addTeacherSubscription(accessToken: "${accessToken}", endpoint: "${endpoint}", expirationTime: "${expirationTime}", p256dh: "${p256dh}", auth: "${auth}", subjectIds: [${subjectIds}]) 
          `
      )();  
      return result;
  })().then((result) => {
      let updateMsg = document.getElementById('updateMsg');
      updateMsg.style.visibility = 'visible';
      let msg = document.getElementById('msg'); 
      msg.textContent='Subscription Updated Now!';
  }).catch((err) => {
      alert(err[0].message);
      console.log(err);
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
