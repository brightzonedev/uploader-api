const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) // originamName shouldn't be used in a real app and I used it here for brevity.
    }
});
const upload = multer({
    storage: storage,
    limits: {fileSize: 3000000}
});

const app = express();
app.use(cors());
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Ok');
});

app.post('/verify', upload.single('file'), (req, res) => {
    try {
        let fileCheched = req.body !== undefined && req.file.mimetype === 'text/plain' &&
            path.extname(req.file.originalname) === '.txt';
        if (fileCheched) {
            const filePath = path.join(__dirname, 'uploads', req.file.originalname);
            fs.appendFile(filePath, '\n Verified', 'utf8', (err) => {
                if (err) {
                  throw err;
                } else {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            throw err;
                        } else {
                            res.send({modifiedFile: data});
                        }
                    });
                }
            });
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        res.sendStatus(400);
    }
});

app.get('/file/:name', (req, res, next) => {
    
    const options = {
        root: __dirname + '/uploads/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    
    const fileName = req.params.name;
    res.sendFile(fileName, options, (err) => {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
    
});


app.listen(port, () => {
    console.log('server running...' + port);
});
