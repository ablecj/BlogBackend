import jwt, { decode } from 'jsonwebtoken';



function authTokenHandler(req, res, next){

    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;
    console.log("check auth token middleware is called!");

    if(!authToken || !refreshToken){
        return res.status(401).json({ message: 'Authentication failed: No authToken or refreshToken provided' , ok : false });
    }

    jwt.verify(authToken, process.env.JWT_SECRET_KEY, (err, decoded) =>{
        // expires
        if(err){
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, (refreshErr, refreshDecoded) =>{
                // refresh token and auth token both are expired
                if(refreshErr){
                    // Both tokens are expired show the error and ask him to login
                    return res.status(401).json({ message: 'Authentication failed: Both tokens are invalid', ok: false });
                }
                // refresh toen is not expired but auth token is expired 
                else{
                    const newAuthToken = jwt.sign({userId: refreshDecoded.userId}, process.env.JWT_SECRET_KEY, {expiresIn: '10m'});
                    const newRefreshToken = jwt.sign({userId: refreshDecoded.userId}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '1d'});

                    // sending the newAuthToken and newRefreshToken are sending with the cookies
                    res.cookies('authToken', newAuthToken, {httpOnly: true});
                    res.cookies('refreshToken', newRefreshToken, {httpOnly: true});
                   req.userId = refreshDecoded.userId;
                   next();
                }
            })
        }

        // not expired
        else{
            req.userId = decoded.userId;
            next();
        }
    })

}




export default authTokenHandler;




