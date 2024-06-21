const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        let token = req.header("x-token");
        if (!token) {
            return res.status(400).json({ msg: "Token not found" });
        }
        let decoded = jwt.verify(token, "jwtpassword");
        req.user = decoded.user;
        next();
    }
    catch (error) {
        return res.status(400).json({ msg: "Error" + error });
    }
}