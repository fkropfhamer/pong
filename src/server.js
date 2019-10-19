import http from 'http';
import fs from 'fs';
import url from 'url';
import  path from 'path';

const config = {
    root: '/../public',
}

const contentTypes =  {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
}

const server = http.createServer((req, res) => {
    let pathName = url.parse(req.url).pathname;
    if (pathName === '/') pathName = '/index.html';
    const fileExtension = path.extname(pathName);
    fs.readFile(__dirname + config.root + pathName, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type':'text/plain'});
            res.write('Page not found');
            res.end()
        } else {
            res.writeHead(200, {'Content-Type': contentTypes[fileExtension]});
            res.write(data);
            res.end();
        }
    })
})

export default server;

