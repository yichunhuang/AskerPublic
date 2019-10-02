// show all posts with status unanswer
// show post id / title / subject / content / images
app.init=function(){
	app.allOrders();
};
window.addEventListener("DOMContentLoaded", app.init);

app.allOrders = () => {
    let accessToken = localStorage.getItem('accessToken');
    // let graph = graphql("http://localhost:3000/graphql", {
    //     alwaysAutodeclare: true,
    //     asJSON: true,
    //     debug: true
    // });
    let query = (async () => {
        let result = await graph.query(`
            studentOrders(accessToken: "${accessToken}") {
                id
                total
                status
                recipientEmail
                createdAt
            }`
        )();
        return result;
    });
    query().then((data) => {
        let orders = data.studentOrders;
        let orderBox = document.getElementById('orderBox');
        for (let i = 0 ;i < orders.length; i++) {
            let statusImg = "/imgs/success.png";
            if (orders[i].status === "Unpaid")
                statusImg = "/imgs/fail.png";
            let orderCard = app.createElement("div", {atrs:{
                className: "orderCard"
            }}, orderBox); 
            app.createElement("img", {atrs:{
                className: "statusImg", src: statusImg
            }}, orderCard); 
            let words = app.createElement("div", {atrs:{
                className: "words"
            }}, orderCard);
            app.createElement("div", {atrs:{
                className: "number", textContent: '# ' + orders[i].id
            }}, words);
            app.createElement("div", {atrs:{
                className: "status", textContent: orders[i].status
            }}, words);
            let amount = app.createElement("div", {atrs:{
                className: "amount"
            }}, words); 
            app.createElement("div", {atrs:{
                className: "total", textContent: orders[i].total
            }}, amount);
            app.createElement("div", {atrs:{
                className: "time", textContent: orders[i].createdAt.split('GMT')[0]
            }}, amount);
            let help = app.createElement("div", {atrs:{
                className: "help", textContent: 'Details'
            }}, orderCard);
            app.setEventHandlers(help, {
                click:function(){
                    alert("Please check your email: " + orders[i].recipientEmail);
                }
            });
        }
    }).catch((err) => {
        alert(err[0].message);
        if (err[0].message === 'Token Invalid')
            window.location.replace("/signIn.html");
    })
} 
