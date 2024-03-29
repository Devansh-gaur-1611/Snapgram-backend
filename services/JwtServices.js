const jwt = require('jsonwebtoken');

class JWTSERVICES {
    constructor() {
        this.jwt_secret = process.env.JWT_SECRET;
        this.refresh_secret = process.env.REFRESH_SECRET;
    }

    static sign(payload, expiry = 6000, secret) {
        const jwtService = new JWTSERVICES();
        
        return jwt.sign(payload, secret || jwtService.jwt_secret, { expiresIn: expiry });
    }

    static verify(refresh_token, secret) {
        const jwtService = new JWTSERVICES();
        return jwt.verify(refresh_token, secret || jwtService.jwt_secret);
    }
}

module.exports = JWTSERVICES;
