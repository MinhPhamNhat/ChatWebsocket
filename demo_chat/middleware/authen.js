module.exports = {
    loginAuthen :(req, res, next) => {
        if (req.user){
            next()
        }else{
            res.redirect('/login')
        }
    }
}