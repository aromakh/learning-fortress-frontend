//Install express server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var useragent = require('useragent');
var enforce = require('express-sslify');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(enforce.HTTPS({ trustProtoHeader: true }));

// serve logo for bad browser version page
app.use(express.static('static'));

/* Checking browser version */
function isBrowserVersionGood(req) {
    var agent = useragent.parse(req.headers['user-agent']);

    switch(agent.family) {
        case 'IE': if (agent.major < 11) return false;
        case 'Firefox': if (agent.major < 61) return false;
        case 'Chrome': if (agent.major < 67) return false;
    }
    return true;
}

function checkBrowserVersion(req, res, next) {
    const isVersionGood = isBrowserVersionGood(req);
    if (!isVersionGood) {
        res.sendFile(path.join(__dirname, 'dist/learning-fortress-frontend/assets/templates/badBrowserVersion.html'));
        return;
    }
    next();
}

app.use(checkBrowserVersion);
/* Checking browser version */

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/learning-fortress-frontend'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/learning-fortress-frontend/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
console.log('Listening on port %s', process.env.PORT || 8080);