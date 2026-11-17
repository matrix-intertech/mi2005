import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';
(async()=>{
 const dir='public/images/matrix/optimized';await fs.mkdir(dir,{recursive:true});const manifest={};
 for(const name of ['hero-studio','projects-office','commercial','residential','process','contact']) {
  const input=`public/images/matrix/${name}.webp`;const meta=await sharp(input).metadata();const record={width:meta.width,height:meta.height,variants:[],mobile:[],mobileWide:[],tablet:[]};
  for(const format of ['avif','webp']){
   for(const width of [...new Set([480,768,1024,1440,meta.width].filter(w=>w<=meta.width))]) {
    const buffer=await sharp(input).resize({width}).toFormat(format,{quality:format==='avif'?65:82,effort:format==='avif'?6:5}).toBuffer();
    const hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,12);
    const file=`${name}-${width}-${hash}.${format}`;await fs.writeFile(path.join(dir,file),buffer);record.variants.push({width,format,src:`/images/matrix/optimized/${file}`,bytes:buffer.length});
   }
   if(name==='hero-studio') for(const group of [
    {key:'mobile',ratio:.75,position:.62,widths:[384,576]},
    {key:'mobileWide',ratio:1.25,position:.62,widths:[768,960]},
    {key:'tablet',ratio:1.25,position:.5,widths:[768,960]},
   ]) for(const width of group.widths){
    const cropWidth=Math.round(meta.height*group.ratio);const left=Math.round((meta.width-cropWidth)*group.position);
    const mobileAvif = group.key === "mobile" && format === "avif";
    const buffer=await sharp(input).extract({left,top:0,width:cropWidth,height:meta.height}).resize({width}).toFormat(format,{quality:mobileAvif?55:format==='avif'?65:82,effort:mobileAvif?7:format==='avif'?6:5}).toBuffer();
    const hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,12);const file=`${name}-${group.key.toLowerCase()}-${width}-${hash}.${format}`;
    await fs.writeFile(path.join(dir,file),buffer);record[group.key].push({width,format,src:`/images/matrix/optimized/${file}`,bytes:buffer.length});
   }
  }
  manifest[`/images/matrix/${name}.webp`]=record;console.log(name,record.variants.map(v=>`${v.format}${v.width}:${v.bytes}`).join(' '));
 }
 const logos=[];
 for(const width of [270,405]) {
  const buffer=await sharp('public/images/matrix/logo.png').resize({width}).webp({lossless:true}).toBuffer();
  const hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,12);
  const name=`logo-${width}-${hash}.webp`;
  await fs.writeFile(path.join(dir,name),buffer);
  logos.push({width,src:`/images/matrix/optimized/${name}`,bytes:buffer.length});
 }
 await fs.writeFile('lib/header-logo.json',JSON.stringify(logos,null,2)+'\n');
 await fs.writeFile('lib/responsive-images.json' ,JSON.stringify(manifest,null,2)+'\n');
})();
