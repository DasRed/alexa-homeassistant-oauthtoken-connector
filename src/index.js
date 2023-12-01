import https from 'https';

export const handler = (event) => {
    return new Promise((resolve, reject) => {
        console.log('Request', JSON.stringify(event));

        const request = https.request(
            {
                hostname:           process.env.AHC_HOMEASSISTANT_HOST,
                path:               '/auth/token',
                port:               process.env.AHC_HOMEASSISTANT_PORT ?? 443,
                method:             event.httpMethod,
                rejectUnauthorized: false,
                family:             6,
                headers:            (({Host, ['User-Agent']: nuff, ['accept-encoding']: narf, ...headers}) => headers)(event.headers),
            },
            (response) => {
                let body = '';
                response.setEncoding('utf8');
                response.on('data', (chunk) => body += chunk);
                response.on('end', () => {
                    const resultBody = {
                        isBase64Encoded: false,
                        statusCode:      response.statusCode || 500,
                        headers:         response.headers,
                        body,
                    };

                    console.log('Response', JSON.stringify(resultBody));
                    if (response.status >= 400) {
                        return reject(resultBody);
                    }

                    resolve(resultBody);
                });
            }
        );
        request.write(event.isBase64Encoded ? atob(event.body) : event.body);
        request.end();
    });
};
