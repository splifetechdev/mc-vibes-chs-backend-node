const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Library API',
            version: 'v1',
            description: 'A simple example NodeJS Web API',
            termsOfService: 'https://github.com/iblurblur',
            contact: {
                name: 'iBlurBlur',
                url: 'https://github.com/iblurblur',
                email: 'tanakorn.ngam@gmail.com'
            },
            license: {
                name: 'Use under MIT',
                url: 'https://github.com/iblurblur'
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
    },
    apis: ['./src/controllers/*.js'], // files containing annotations as above
};

module.exports = swaggerJsdoc(options)