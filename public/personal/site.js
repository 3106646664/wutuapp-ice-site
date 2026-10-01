const status=document.getElementById('scene-status');
const collections=document.querySelector('.collection-nav');
const signature=document.querySelector('.about-signature');
const closeButton=document.querySelector('.detail-close');
let previous='';
function refresh(){
 const stage=status.dataset.stage||'landscape',detail=status.dataset.detail||'';
 const key=stage+'/'+detail;if(key===previous)return;previous=key;
 document.body.dataset.detail=detail!==''?'true':'false';
 collections.hidden=stage!=='collections'||detail!=='';
 signature.hidden=detail!=='2';
 closeButton.hidden=detail==='';
 for(const button of document.querySelectorAll('[data-section]'))button.setAttribute('aria-current',String(button.dataset.section===stage));
 status.textContent=detail!==''?['记录详情','实践详情','关于详情'][Number(detail)]:{landscape:'雪境：滚动探索，观察冰屋的拆解与聚合',collections:'收藏：移动鼠标擦开冰霜，点击冰块进入内容',particles:'灵感：移动鼠标扰动粒子，点击文字切换形态'}[stage];
}
new MutationObserver(refresh).observe(status,{attributes:true});
for(const element of document.querySelectorAll('.identity,.scene-nav,.collection-nav,.detail-close,.blog-link'))for(const type of ['pointerdown','pointerup','pointermove','mousedown','mouseup','touchstart','touchend','click'])element.addEventListener(type,event=>event.stopPropagation());
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;const input=event.target;if(input instanceof HTMLInputElement||input instanceof HTMLTextAreaElement)return;if(event.key==='Escape'&&!closeButton.hidden){closeButton.click();return;}const index=['1','2','3'].indexOf(event.key);if(index>=0){event.preventDefault();document.querySelectorAll('[data-jump]')[index+1]?.click();}});
window.addEventListener('ice-ready',()=>{status.textContent='三维空间已加载';refresh();});
