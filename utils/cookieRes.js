exports.cookieRes = (res, content) => {
    res.cookie('jwt', content, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 86400000),
        httpOnly: true,
        secure: true,
    })
}