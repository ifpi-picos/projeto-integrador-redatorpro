const logger = (req, res, next) => {
    console.log('${new Date()} - URL: ${req.url, método: $(req.method)}')
    next()
}

export default logger;