// using promise

const asyncHandler = (requestHandler) =>{
   return (req, res , next) => {
        Promise.resolve(requestHandler(req,res, next))
        .catch((error)=> next(error))

    }
}

export { asyncHandler}

//using try catch

// const asyncHandler = (fn) => async(req, res, next) => {

//     try {
        
//     } catch (error) {
//         res.status(err.code || 500)
//         .json({
//             success: false,
//             message: err.message        })
        
//     }

// }

