const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const privateKey = fs.readFileSync(path.join(__dirname, "../../s4t", "private.key"), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, "../../s4t", "public.key"), 'utf8')
const versionService = require('../services/version.service')

const signOptions = {
    issuer: 'iBlurBlur',
    audience: 'https://iblurblur.com',
    algorithm: 'RS256'
}

const generateToken = (payload) => jwt.sign(payload, privateKey, { ...signOptions, expiresIn: '30d' })

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json()
    }
    const version = await versionService.findOne()
    jwt.verify(token, publicKey, signOptions, (err, decode) => {

        if (err) {
            return res.status(401).json()
        }
        if (decode.v_web !== version.v_web) {
            // console.log({ token, version })
            return res.status(401).json()
        }

        req.requester_id = decode.id
        req.requester_company_id = decode.company_id
        req.sub = decode.sub
        req.role = decode.role
        next()
    })

}

module.exports = {
    generateToken,
    verifyToken
}
