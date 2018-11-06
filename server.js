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

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/learning-fortress-frontend'));

function checkBrowserVersion(req) {
    var agent = useragent.parse(req.headers['user-agent']);
    console.log(agent);

    switch(agent.family) {
        case 'IE': if (agent.major < 13) return false;
        case 'Firefox': if (agent.major < 61) return false;
        case 'Chrome': if (agent.major < 67) return false;
    }
    return true;
}

app.get('*', (req, res) => {
    const isVersionGood = checkBrowserVersion(req);
    if (isVersionGood) {
        res.sendFile(path.join(__dirname, 'dist/learning-fortress-frontend/index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'dist/learning-fortress-frontend/assets/templates/badBrowserVersion.html'));
    }
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
console.log('Listening on port %s', process.env.PORT || 8080);