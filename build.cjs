const fs=require('node:fs');
const files=['index.html','styles.css','config.js','core.js','app.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','team-number-sheet.jpg','original-39-pool.jpg','original-50-pool.jpg','.nojekyll'];
fs.mkdirSync('dist',{recursive:true});
for(const file of files){if(!fs.existsSync(file))throw Error('Missing '+file);fs.copyFileSync(file,'dist/'+file);}
console.log('Static app built: '+files.length+' assets.');
