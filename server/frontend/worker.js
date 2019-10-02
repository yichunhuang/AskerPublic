console.log("Service Worker Loaded...");
self.addEventListener('install', function (event) {
  self.skipWaiting();
});
self.addEventListener("push", e => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "http://image.ibb.co/frYOFd/tmlogo.png"
  });
});
