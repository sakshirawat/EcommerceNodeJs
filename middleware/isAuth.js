const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')
    if(!authHeader) {
        const error = new Error('Not authenticated')
        throw error
    }
    const token = authHeader.split(' ')[1] //split eliminates the white spaces ; 1-> is the token
    //console.log(token, 'token')
    let decodedToken
    try{
        decodedToken = jwt.verify(token, 'secretkey')
        console.log(decodedToken, 'decoded token')
    } catch (err) {
        throw err
    }
    if(!decodedToken) {
        const error = new Error('Not authenticated')
        throw error
    }
    req.userId = decodedToken.userId
    req.userName = decodedToken.name
    next()
}