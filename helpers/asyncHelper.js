// async 내에서 err를 reject로 잡아서 crash되지 않도록
module.exports = {
    asyncErrorHandle: asyncFn => {
        return (async (req, res, next) => {
            try {
                return await asyncFn(req, res, next)
            } catch (error) {
                return next(error)
            }
        })
    }
};