let accessToken = localStorage.getItem('accessToken');
let accessExpired = localStorage.getItem('accessExpired');
if (!accessToken || !accessExpired || accessExpired < Date.now()) 
    window.location.replace("/signIn.html");
(async () => {
    let result = await graph.query(`
        verifyUser(accessToken: "${accessToken}") {
            role
        }`
    )();
    return result;
})().then((result) => {
    if (!result.verifyUser || result.verifyUser.role !== 'teacher')
        window.location.replace("/signIn.html");  
}).catch((err) => {
    alert(err[0].message);
    window.location.replace("/signIn.html"); 
});
