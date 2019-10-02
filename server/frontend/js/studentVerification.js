let accessToken = localStorage.getItem('accessToken');
let accessExpired = localStorage.getItem('accessExpired');
if (!accessToken || !accessExpired || accessExpired < Date.now()) 
    window.location.replace("/signIn.html");
// let graph = graphql("http://localhost:3000/graphql", {
//     alwaysAutodeclare: true,
//     asJSON: true,
//     debug: true
// });
(async () => {
    let result = await graph.query(`
        verifyUser(accessToken: "${accessToken}") {
            role
        }`
    )();
    return result;
})().then((result) => {
    if (!result.verifyUser || result.verifyUser.role !== 'student')
        window.location.replace("/signIn.html");  
}).catch((err) => {
    alert(err[0].message);
    window.location.replace("/signIn.html"); 
});
