"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authorization = Authorization;
const jwt = require("jsonwebtoken");
function Authorization(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({
            message: "No Authorization Header",
        });
    }
    try {
        const token = authorization.split("Bearer ")[1];
        console.log("token: ", token);
        if (!token) {
            return res.status(401).json({
                message: "Invalid Token Format",
            });
        }
        console.log("SECRET_KEY: ", process.env.SECRET_KEY);
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        req.data = decode;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Session Expired",
                error: error.message,
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid Token",
                error: error.message,
            });
        }
        res.status(500).json({
            message: "Internal server Error",
            error: error.message,
            stack: error.stack,
        });
    }
}
