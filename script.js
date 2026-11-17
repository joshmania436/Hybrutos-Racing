(function(){
  var bar=document.getElementById('rev');
  if(!bar)return;
  function p(){var h=document.documentElement;var s=h.scrollHeight-h.clientHeight;bar.style.width=(s>0?h.scrollTop/s*100:0)+'%'}
  addEventListener('scroll',p,{passive:true});p();
})();

(function(){
  var names=['home','car','teams','goal','achievements','sponsors','contact'];
  if(!document.getElementById('p-home'))return;
  function show(h){
    if(!h)h=(location.hash||'').slice(1);
    if(names.indexOf(h)<0)h='home';
    names.forEach(function(n){document.getElementById('p-'+n).classList.toggle('on',n===h)});
    document.querySelectorAll('nav ul a').forEach(function(a){a.classList.toggle('cur',a.getAttribute('href')==='#'+h)});
    window.scrollTo(0,0);
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a)return;
    e.preventDefault();
    var h=a.getAttribute('href').slice(1);
    try{location.hash=h}catch(x){}
    show(h);
  });
  addEventListener('hashchange',function(){show()});
  show();
})();

(function(){
  var L='img/lineup.jpg';
  var ACH={
    2021:{img:'img/2021.jpg',a:[['Formula Hybrid','Podium finish']]},
    2020:{img:'img/2020.jpg',a:[['Formula Hybrid','Podium finish'],['Formula Hybrid','Best Engineering Design']]},
    2019:{img:'img/2019.jpg',a:[['Formula Imperial','2nd overall, Hybrid category'],['Formula Imperial','Best Hybrid Car, 1st in Static Events'],['Formula Imperial','Best B-Plan, Cost, Design and Endurance Runner-Up']]},
    2018:{img:'img/2018.jpg',a:[['Formula Hybrid','Promising performance by the team']]},
    2017:{img:L,pos:'72%',a:[['Formula Hybrid','Podium finish']]},
    2016:{img:L,pos:'100%',a:[['Formula Hybrid','1st, Hybrid in Progress']]}
  };
  var yb=document.getElementById('years'),im=document.getElementById('aimg'),ti=document.getElementById('atitle'),li=document.getElementById('alist'),box=document.getElementById('ach');
  if(yb){
    function pick(y){
      var d=ACH[y];
      Array.prototype.forEach.call(yb.children,function(b){b.setAttribute('aria-selected',b.textContent==y)});
      im.src=d.img;im.style.objectPosition=d.pos||'50% 50%';ti.textContent=y+' Awards';li.textContent='';
      if(!d.a.length){var p=document.createElement('p');p.className='none';p.textContent='Awards for this year are being added.';li.appendChild(p)}
      d.a.forEach(function(x){
        var r=document.createElement('div');r.className='aw';
        r.innerHTML='<i></i><div><b></b><span></span></div>';
        r.querySelector('b').textContent=x[0];r.querySelector('span').textContent=x[1];li.appendChild(r);
      });
      box.style.animation='none';void box.offsetWidth;box.style.animation='';
    }
    Object.keys(ACH).sort(function(a,b){return b-a}).forEach(function(y){
      var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=y;
      b.addEventListener('click',function(){pick(y)});yb.appendChild(b);
    });
    pick(2021);
  }
  var f=document.getElementById('cf');
  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=f.querySelector('button'),note=document.getElementById('cn'),d=new FormData(f);
    btn.disabled=true;note.textContent='Sending...';
    fetch('send.php',{method:'POST',body:d}).then(function(r){
      return r.json().then(function(j){return r.ok&&j.ok});
    }).then(function(ok){
      if(!ok)throw new Error('send failed');
      note.textContent='Thank you! Your message has been sent. We will reply soon.';f.reset();
    }).catch(function(){
      var to=document.querySelector('.cl a[href^="mailto:"]').textContent.trim();
      var s=encodeURIComponent('Hybrutos Racing: '+d.get('t'));
      var m=encodeURIComponent('Name: '+d.get('n')+'\nEmail: '+d.get('e')+'\n\n'+d.get('m'));
      note.textContent='We could not send it directly, so we opened your email app instead.';
      location.href='mailto:'+to+'?subject='+s+'&body='+m;
    }).then(function(){btn.disabled=false});
  });
  /* F1 tyre cursor */
  var w=document.getElementById('wheel'),g=document.getElementById('tyre');
  if(w&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.documentElement.classList.add('has-wheel');
    var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    var x=-100,y=-100,tx=-100,ty=-100,ang=0,seen=false;
    addEventListener('mousemove',function(e){
      tx=e.clientX;ty=e.clientY;
      if(!seen){x=tx;y=ty;seen=true}
      w.style.opacity=1;
      w.classList.toggle('hot',!!(e.target.closest&&e.target.closest('a,button,summary,input,select,textarea,label')));
    },{passive:true});
    addEventListener('mousedown',function(){w.classList.add('down')});
    addEventListener('mouseup',function(){w.classList.remove('down')});
    document.addEventListener('mouseleave',function(){w.style.opacity=0});
    var prev=performance.now();
    (function loop(t){
      var dt=Math.min((t-prev)/1000,.1);prev=t;
      x+=(tx-x)*.22;y+=(ty-y)*.22;
      if(!reduce)ang=(ang+36*dt)%360; /* constant, slow spin */
      g.setAttribute('transform','rotate('+ang.toFixed(1)+' 32 32)');
      w.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';
      requestAnimationFrame(loop);
    })(prev);
  }
})();

(function(){
  /* title: split into letters so the colour can pass from one to the next */
  var n=0;
  document.querySelectorAll('.hero h1 em').forEach(function(em){
    var t=em.textContent;em.textContent='';em.setAttribute('aria-hidden','true');
    t.split('').forEach(function(c){var s=document.createElement('span');s.className='l';s.style.setProperty('--i',n++);s.textContent=c;em.appendChild(s)});
  });
  /* cursor speedometer */
  var sp=document.getElementById('speedo');
  if(!sp||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var arc=document.getElementById('sarc'),nd=document.getElementById('sneedle'),num=document.getElementById('snum');
  var MAX=320,lx=null,ly=0,lt=0,last=0,target=0,v=0;
  addEventListener('mousemove',function(e){
    var now=performance.now();
    if(lx!==null){var dt=Math.max(now-lt,1);target=Math.min(MAX,Math.hypot(e.clientX-lx,e.clientY-ly)/dt*1000*.12)}
    lx=e.clientX;ly=e.clientY;lt=now;last=now;
  },{passive:true});
  (function loop(){
    if(performance.now()-last>80)target=0;
    v+=(target-v)*.2;if(v<.3&&target===0)v=0;
    var f=v/MAX;
    nd.setAttribute('transform','rotate('+(-90+180*f).toFixed(1)+' 60 64)');
    arc.setAttribute('stroke-dasharray',(f*100).toFixed(1)+' 100');
    num.textContent=Math.round(v);
    requestAnimationFrame(loop);
  })();
})();
