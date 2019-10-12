const axios = require('axios');
let getFacebookProfile = async function (accessToken) {
    try {
        let url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken;
        const response = await axios.get(url);
        console.log(response);
        return response.data;
    }
    catch (error) {
        return error;
    }
};
module.exports = getFacebookProfile; 