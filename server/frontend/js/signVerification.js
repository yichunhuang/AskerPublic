let accessToken = localStorage.getItem('accessToken');
let accessExpired = localStorage.getItem('accessExpired');
(async () => {
    let result = await graph.query(`
        verifyUser(accessToken: "${accessToken}") {
            role
        }`
    )();
    return result;
})().then((result) => {
    if (result.verifyUser.role === 'teacher')
        window.location.replace("/answer.html"); 
    else if (result.verifyUser.role === 'student')
        window.location.replace("/ask.html");  
}).catch((err) => {
    // alert(err[0].message);
});
