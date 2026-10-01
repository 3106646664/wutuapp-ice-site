(() => {
  const source=window.__recordCanvas;
  if(!source)throw new Error('Website canvas not ready');
  const canvas=document.createElement('canvas');
  canvas.width=1920;canvas.height=1080;canvas.style.display='none';
  canvas.dataset.recording='true';document.body.append(canvas);
  const ctx=canvas.getContext('2d',{alpha:false});
  const state={canvas,source,ctx,overlay:null,overlayPending:false,running:false,chunks:0,frames:0,blobs:[]};
  state.updateOverlay=async()=>{
    if(state.overlayPending)return;
    state.overlayPending=true;
    try{state.overlay=await html2canvas(document.body,{
      width:1920,height:1080,windowWidth:1920,windowHeight:1080,
      scale:1,backgroundColor:null,logging:false,
      ignoreElements:element=>element.tagName==='CANVAS',
      onclone:doc=>{doc.body.style.background='transparent';doc.documentElement.style.background='transparent';for(const child of [...doc.body.children])if(!child.matches('.identity,.scene-nav,.collection-nav,.blog-link,.about-signature,.detail-close'))child.remove();},
    });}finally{state.overlayPending=false;}
  };
  state.start=async()=>{
    await state.updateOverlay();
    state.running=true;
    const draw=()=>{
      if(!state.running)return;
      ctx.drawImage(source,0,0,1920,1080);
      if(state.overlay)ctx.drawImage(state.overlay,0,0);for(const img of document.querySelectorAll('.identity img')){const box=img.getBoundingClientRect();if(img.complete&&box.width)ctx.drawImage(img,box.x,box.y,box.width,box.height);}
      state.frames++;
      state.raf=requestAnimationFrame(draw);
    };
    draw();
    state.interval=setInterval(state.updateOverlay,250);
    state.stream=canvas.captureStream(60);
    const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
    state.recorder=new MediaRecorder(state.stream,{mimeType:mime,videoBitsPerSecond:40000000});
    state.recorder.ondataavailable=event=>{if(event.data.size){state.blobs.push(event.data);state.chunks++;}};
    state.startedAt=Date.now();
    state.recorder.start(1000);
    return {mime,width:canvas.width,height:canvas.height};
  };
  state.stop=()=>new Promise(resolve=>{
    state.recorder.onstop=()=>{
      state.running=false;cancelAnimationFrame(state.raf);clearInterval(state.interval);
      state.stream.getTracks().forEach(track=>track.stop());
      canvas.remove();resolve({chunks:state.chunks,frames:state.frames});
    };
    state.recorder.stop();
  });
  window.__websiteRecorder=state;
})();
