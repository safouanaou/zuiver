import { createSmoothScroll } from './scroll.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => n * n * (3 - 2 * n);
const food = [
 ['To begin', [['Heirloom Tomato', '14'], ['Beef Tartare', '16'], ['Seared Scallops', '18'], ['Seasonal Soup', '12']]],
 ['From the kitchen', [['Grilled Sea Bass', '26'], ['Lamb Rack', '28'], ['Wild Mushroom Risotto', '24'], ['Roasted Cauliflower', '22']]],
 ['Something sweet', [['Dark Chocolate Délice', '12'], ['Vanilla Panna Cotta', '11'], ['Seasonal Sorbet', '10']]]
];
// The supplied assets contain no drinks list or prices. Present categories,
// without claiming specific bottles, recipes, or invented prices.
const drinks = [
 ['Before dinner', [['Aperitifs', 'A little something to begin.'], ['Cocktails', 'Discover the selection at the bar.']]],
 ['With your meal', [['Wine', 'Ask us for a glass to complement your plate.'], ['Without alcohol', 'Ask about our alcohol-free selection.']]],
 ['To linger over', [['Coffee & tea', 'A quiet finish to your evening.']]]
];
const motionObserver = new IntersectionObserver(entries => {
 for (const entry of entries) if (entry.isIntersecting) {
  entry.target.classList.add('is-visible');
  motionObserver.unobserve(entry.target);
 }
}, {threshold: .15});
function animateTitles(root = document) {
 root.querySelectorAll('h2:not(.title-animated), h3:not(.title-animated)').forEach(heading => {
  if (heading.id === 'heritage-title') return;
  const html = heading.innerHTML;
  heading.setAttribute('aria-label', heading.innerHTML.replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
  heading.innerHTML = html.split(/<br\s*\/?\s*>/i).map((line, i) => `<span class="title-mask" aria-hidden="true"><span class="title-rise" style="--line:${i}">${line}</span></span>`).join('');
  heading.classList.add('title-animated');
  if (!heading.closest('.evening-visit, dialog')) motionObserver.observe(heading);
 });
}
function animateLetters(root = document) {
 root.querySelectorAll('p:not(.letters-animated), .eyebrow:not(.letters-animated), .heritage-signature:not(.letters-animated), .nav-footer:not(.letters-animated), .menu-item > span:not(.letters-animated), .kitchen-caption > span:not(.letters-animated)').forEach(element => {
  if (element.closest('.letters-animated') || element.querySelector('button, a')) return;
  const accessible = document.createElement('span');
  accessible.className = 'sr-only';
  accessible.textContent = element.innerText || element.textContent;
  const visual = document.createElement('span');
  visual.className = 'letter-visual';
  visual.setAttribute('aria-hidden', 'true');
  while (element.firstChild) visual.append(element.firstChild);
  let index = 0;
  const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
   const fragment = document.createDocumentFragment();
   for (const word of node.textContent.split(/(\s+)/)) {
    if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); continue; }
    const span = document.createElement('span'); span.className = 'letter-word';
    for (const character of Array.from(word)) {
     const letter = document.createElement('span'); letter.className = 'letter-char';
     letter.style.setProperty('--letter', index++); letter.textContent = character; span.append(letter);
    }
    fragment.append(span);
   }
   node.replaceWith(fragment);
  }
  element.append(accessible, visual);
  element.classList.add('letters-animated');
  element.style.setProperty('--letter-step', `${Math.min(18, 1700 / Math.max(1,index))}ms`);
  const preceding = [...element.parentElement.children].indexOf(element);
  element.style.setProperty('--text-delay', `${Math.min(preceding * 90, 360)}ms`);
  if (!element.closest('.heritage-copy, .evening-visit, dialog')) motionObserver.observe(element);
 });
}
function revealWithin(root) {
 root.querySelectorAll('.title-animated, .letters-animated').forEach(el => el.classList.add('is-visible'));
}
animateTitles(); animateLetters();
let menuMode = 'food';
function renderMenu() {
 const content = $('#menu-content');
 content.classList.toggle('is-drinks', menuMode === 'drinks');
 content.innerHTML = (menuMode === 'food' ? food : drinks).map(([group, items]) => `<section class="menu-group"><h3>${group}</h3>${items.map(([name, detail]) => menuMode === 'food' ? `<div class="menu-item"><span>${name}</span><span class="price">€${detail}</span></div>` : `<div class="menu-item"><span>${name}</span></div><p class="drink-description">${detail}</p>`).join('')}</section>`).join('');
 $('#menu-kind').textContent = menuMode === 'food' ? 'Food' : 'Drinks';
 $('#menu-page-number').textContent = menuMode === 'food' ? '01 / 02' : '02 / 02';
 $('#menu-switch').textContent = menuMode === 'food' ? 'Discover the drinks' : 'Return to the food';
 $('#menu-switch').setAttribute('aria-label', menuMode === 'food' ? 'Show drinks menu' : 'Show food menu');
 animateTitles(content); animateLetters(content);
}
$('#menu-switch').addEventListener('click', () => { menuMode = menuMode === 'food' ? 'drinks' : 'food'; renderMenu(); });
renderMenu();
const navigation = $('#navigation');
$('.nav-toggle').addEventListener('click', () => {
 navigation.showModal(); document.body.classList.add('modal-open');
 $('.nav-toggle').setAttribute('aria-expanded','true');
 requestAnimationFrame(() => revealWithin(navigation));
});
$('.nav-close').addEventListener('click', () => navigation.close());
navigation.addEventListener('close', () => {
 document.body.classList.remove('modal-open'); $('.nav-toggle').setAttribute('aria-expanded','false');
});
const reservation = $('.reservation-dialog');
$('#reservation-open').addEventListener('click', () => {
 reservation.showModal(); document.body.classList.add('modal-open');
 requestAnimationFrame(() => revealWithin(reservation));
});
$('.dialog-close').addEventListener('click', () => reservation.close());
reservation.addEventListener('close', () => document.body.classList.remove('modal-open'));
reservation.addEventListener('click', e => {
 const r = reservation.getBoundingClientRect();
 if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) reservation.close();
});
const videos = $$('video');
function keepFilmsPlaying() {
 videos.forEach(video => { if (video.paused) video.play().catch(()=>{}); });
}
videos.forEach(video => {
 video.addEventListener('canplay', keepFilmsPlaying);
 video.addEventListener('pause', keepFilmsPlaying);
 video.addEventListener('ended', keepFilmsPlaying);
});
addEventListener('pageshow', keepFilmsPlaying);
document.addEventListener('visibilitychange', () => { if (!document.hidden) keepFilmsPlaying(); });
keepFilmsPlaying();
const heritage = $('.heritage'), central = $('.heritage-central'), heritageCopy = $('.heritage-copy');
const heritageTitle = $('#heritage-title'), heritageShade = $('.heritage-shade');
const photos = $$('.collage-photo');
const directions = [[-.3,-1],[-1,-.4],[1,-.5],[1,.4],[-.5,1],[.5,1]];
const header = $('#header'), brand = $('.brand'), navToggle = $('.nav-toggle'), reserveLink = $('.header-reserve');
const menu = $('#menu'), story = $('.evening-visit'), evening = $('.evening'), visit = $('.visit'), footer = $('.footer');
const parallax = $$('.parallax-frame');
let storySlide = 0;
function updateScroll() {
 const h = innerHeight, w = innerWidth, mobile = w <= 760;
 const menuRect = menu.getBoundingClientRect(), storyRect = story.getBoundingClientRect(), footerRect = footer.getBoundingClientRect();
 const sp = clamp(-storyRect.top / (storyRect.height - h));
 const expand = ease(clamp(sp / .31));
 storySlide = ease(clamp((sp - .51) / .28));
 const fp = ease(clamp((h - footerRect.top) / h));
 const settled = clamp(-footerRect.top / Math.max(1,footerRect.height-h));
 // Keep the footer on its espresso field until the logo has fully settled,
 // then use the remaining sticky distance for a slow photographic reveal.
 const footerFade = ease(clamp((settled - .06) / .78));
 const overMenu = menuRect.top < 65 && menuRect.bottom > 65;
 const overStory = storyRect.top <= 65 && storyRect.bottom > 65;
 const overFooter = footerRect.top < 65;
 let logoDark = overMenu || (overStory && storySlide > .5);
 if (reduced.matches) {
  const vr = visit.getBoundingClientRect();
  logoDark = overMenu || (vr.top < 65 && vr.bottom > 65);
  header.classList.toggle('logo-dark',logoDark);
  header.classList.toggle('links-dark',logoDark && (!overMenu || mobile));
  header.classList.toggle('footer-mode',overFooter);
  revealWithin(heritageCopy); revealWithin(story);
  visit.inert = false;
  return;
 }
 header.classList.toggle('logo-dark',logoDark);
 header.classList.toggle('links-dark',(mobile && overMenu) || (overStory && storySlide > .98));
 header.classList.toggle('footer-mode',overFooter);
 // Track each edge independently while the light invitation slides under the header.
 if(overStory && storySlide > 0 && storySlide < 1){navToggle.style.color = storySlide>.96 ? 'var(--black)' : 'var(--ivory)';reserveLink.style.color=storySlide>.08 ? 'var(--black)' : 'var(--ivory)';}
 else {navToggle.style.color='';reserveLink.style.color='';}
 const hr = $('.hero').getBoundingClientRect();
 if(hr.bottom>0) $('.hero-media').style.transform=`translateY(${Math.max(0,-hr.top)*.42}px)`;
 const r = heritage.getBoundingClientRect();
 if(r.top<h && r.bottom>0){
  const p=clamp(-r.top/(r.height-h)), grow=ease(clamp(p/.76));
  const b=mobile?{x:24,y:41,w:51,h:28}:{x:29,y:30,w:44,h:44};
  central.style.left=`${b.x*(1-grow)}%`; central.style.top=`${b.y*(1-grow)}%`;
  central.style.width=`${b.w+(100-b.w)*grow}%`;central.style.height=`${b.h+(100-b.h)*grow}%`;
  photos.forEach((photo,i)=>{const [x,y]=directions[i];photo.style.transform=`translate(${x*grow*w*.9}px,${y*grow*h*.8}px) scale(${1+grow*1.5})`;photo.style.opacity=1-clamp((grow-.6)*2.5);});
  const reveal=ease(clamp((p-.77)/.16));
  heritageCopy.style.opacity=reveal;heritageCopy.style.visibility=reveal>0?'visible':'hidden';
  heritageTitle.style.transform=`translateY(${(1-reveal)*65}%)`;heritageShade.style.opacity=.55*reveal;
  if(reveal>.12)revealWithin(heritageCopy);
  $('.collage-label').style.opacity=1-clamp(p*5);$('.collage-bottom').style.opacity=1-clamp(p*5);
 }
 if(menuRect.top<h && menuRect.bottom>0)parallax.forEach(frame=>{
  const r=frame.getBoundingClientRect();
  if(r.top<h && r.bottom>0){const shift=((h/2-(r.top+r.height/2))/(h+r.height))*r.height*.23;frame.firstElementChild.style.transform=`translateY(${shift}px)`;}
 });
 if(storyRect.top<h && storyRect.bottom>0){
  evening.style.clipPath=`inset(${58*(1-expand)}% ${29*(1-expand)}% ${3*(1-expand)}%)`;
  evening.style.transform=`translateX(${-100*storySlide}%)`;
  $('.evening-media').style.transform=`translateY(${(sp-.32)*h*.22}px)`;
  $('.evening-copy').style.transform=`translateY(${(sp-.32)*h*.13}px)`;
  visit.style.transform=`translateX(${100*(1-storySlide)}%)`;
  if(expand>.82)revealWithin(evening);
  if(storySlide>.45)revealWithin(visit);
 }
 visit.inert=storySlide<.98;
 // Move the original header logo into the center of the last scene.
 const bw=mobile?100:138, bh=mobile?70:92, baseTop=mobile?12:18;
 const scale=1+(Math.min(mobile?2.65:3.3,w*(mobile?.64:.31)/bw)-1)*fp;
 const dy=(h*.43-(baseTop+bh/2))*fp;
 brand.style.transform=`translate(-50%,${dy}px) scale(${scale})`;
 const linkY=((mobile?h*.565:h*.38)-(mobile?24:37))*fp;
 const linkX=w*(mobile?.02:.05)*fp;
 navToggle.style.transform=`translate(${linkX}px,${linkY}px)`;
 reserveLink.style.transform=`translate(${-linkX}px,${linkY}px)`;
 $('.footer-background').style.opacity=footerFade;
 $('.footer-shade').style.opacity=footerFade;
 const linksReveal=ease(clamp((fp-.65)/.35));
 $$('.footer-links').forEach(el=>{el.style.opacity=linksReveal;el.style.transform=`translateY(${(1-linksReveal)*35}px)`;});
}
let frame;
function scheduleScroll(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;updateScroll();});}
addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll);
reduced.addEventListener('change',()=>location.reload());
const smoothScroll = createSmoothScroll({ reducedMotion: reduced, onUpdate: scheduleScroll });
// The invitation lives inside a pinned horizontal scene, so anchors seek its
// fully revealed scroll position instead of the off-screen absolute element.
function anchorTop(hash){
 const target=$(hash);if(!target)return null;
 if(hash==='#visit'&&!reduced.matches)return scrollY+story.getBoundingClientRect().top+(story.offsetHeight-innerHeight)*.84;
 return scrollY+target.getBoundingClientRect().top;
}
$$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const hash=link.getAttribute('href');if(hash==='#')return;
 event.preventDefault();if(navigation.open)navigation.close();
 const top=anchorTop(hash);if(top===null)return;
 history.pushState(null,'',hash);
 smoothScroll.to(top);
}));
addEventListener('popstate',()=>{const top=anchorTop(location.hash||'#home');if(top!==null)smoothScroll.to(top, { immediate: true });});
if(location.hash==='#visit')requestAnimationFrame(()=>smoothScroll.to(anchorTop('#visit'), { immediate: true }));
$('#year').textContent=new Date().getFullYear();
updateScroll();
