let validateUser = (accessToken) => User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false}); 
module.exports = validateUser;