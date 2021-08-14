const express = require('express')
const P = require('path');

const app = express()
const port = 3000
const fs = require('fs');
console.log(process.argv)

const folder = process.argv[2] ?? P.dirname(__dirname + ".fake");
console.log('use static folder:' + folder);
app.use(express.static(folder))

const sendDirList = (req, res) => {
  const queryPath =  req.query.path || '';
  let path = folder + '\\' + queryPath;
  if (!fs.statSync(path).isDirectory()) {
    res.send(`Not support this file`);
    return;
  }

  const data = fs.readdirSync(path)
  .sort((a,b) => a > b ? 1 : 0)
  .map(x => [fs.statSync(path + "/" + x), x])
  .sort((a,b) => a[0].isFile() ? 1 : 0);


  let dataGallery = fs.readdirSync(path)
  .filter(x => x.toUpperCase().endsWith('.JPG'));

  dataGallery.shift();
  dataGallery.shift();

  const size = Math.ceil(dataGallery.length / 30);
  const gallerypage =  new Array(size).fill(0)


  res.send(`
  <html>

  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
  body {
    font-family: 'Roboto', sans-serif;
  }
  button {
    margin:3px;
    text-align: left!important;
  }
  a {
    text-decoration: none!important;
    
  }
  .btn-primary a {
    color: white!important;
  }
</style>
  <title>app</title>
  </head>

  <body>
  <div class="container">
  <h4>Dir: ${path.replace(folder, '.')}</h4>
  Total JPG files = ${dataGallery.length}
  ${gallerypage.map((x, index) => `<button type="button" class="btn btn-warning"><a href='/gallery?pageIndex=${index}&path=${queryPath}'>Gallery #${index+1}</a></button>`)}
  
  ${data.filter(x => x[0].isDirectory())
    .map(([stats, fileName]) => {
    return `
    <div class="row">
    <div class="col-12">
      <button type="button" class="btn btn-primary"><a href='/?path=${queryPath}\\${fileName}'>${fileName}</a></button>
    </div>
    </div>`
  }).join('')}

  ${data.filter(x => x[0].isFile())
    .map(([stats, fileName]) => {
    return `
    <div class="row">
    <div class="col-12">
      <button type="button" class="btn btn-light"><a href='${queryPath}\\${fileName}'>${fileName}</a></button>
    </div>
    </div>`
  }).join('')}

  </div>
  </body>
  </html>

  `)
}

app.get('/', (req, res) => {
  sendDirList(req, res)
})

app.get('/gallery', (req, res) => {
  const queryPath = req.query.path || ''
  let path = folder + '\\' + queryPath;
  const pageIndex = req.query.pageIndex || 0;
  if (!fs.statSync(path).isDirectory()) {
    res.send(`Not support`);
    return;
  }

  let data = fs.readdirSync(path)
  .filter(x => x.toUpperCase().endsWith('.JPG'));

  data.shift();
  data.shift();

  const pageSize = 30;

  data = data.slice(pageIndex * pageSize, (pageIndex * 1 + 1) * pageSize);

  res.send(`
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=0.5">
  <title>app</title>
  </head>

  <body>
${data.map((fileName, index) => `    <img id="index-${index}" src="${queryPath}\\${fileName}">`).join('\r\n')}
  </body>
  </html>
  `)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})