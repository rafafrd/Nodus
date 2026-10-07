import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc='./pdf-extraction-worker.mjs';
(window as unknown as {extractPdf(bytes:number[]):Promise<{page:number;text:string}[]>}).extractPdf=async bytes=>{
  const task=getDocument({data:new Uint8Array(bytes),disableFontFace:true,useSystemFonts:false,cMapUrl:'./pdf-assets/cmaps/',cMapPacked:true,standardFontDataUrl:'./pdf-assets/standard_fonts/'});
  let doc:Awaited<typeof task.promise>|null=null;
  try{doc=await task.promise;if(doc.numPages>1000)throw Error('O PDF excede1000páginas. Selecione uma apostila menor.');const pages=[];let size=0;for(let page=1;page<=doc.numPages;page++){const item=await doc.getPage(page),content=await item.getTextContent();const text=content.items.map(i=>'str' in i?i.str+(i.hasEOL?'\n':' '):'').join('');size+=text.length;if(size>2*1024*1024)throw Error('O texto extraído excede2MiB. Selecione um PDF menor.');pages.push({page,text});item.cleanup();}return pages;}finally{await task.destroy();}
};
