  // Custom cursor
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .project-card, .skill-card, .achievement-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2)';
      ring.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });

  // ══════════════════════════════════════════════
  // ☢  EASTER EGG — NUCLEAR SEQUENCE  ☢
  // ══════════════════════════════════════════════
  (function() {
    const section    = document.getElementById('aboutImageSection');
    const keyOverlay = document.getElementById('keyboardOverlay');
    const keyClose   = document.getElementById('keyboardClose');
    const keysGrid   = document.getElementById('keyboardKeys');
    const typedDisp  = document.getElementById('typedDisplay');
    const nucBtn     = document.getElementById('nuclearBtn');
    const nucOverlay = document.getElementById('nuclearOverlay');
    const nucMsg     = document.getElementById('nuclearMessage');
    const expCanvas  = document.getElementById('explosionCanvas');

    const SECRET = 'MAL';
    let typed = '';
    let keyboardOpen = false;

    // Show keyboard on hover of about image section
    if (section) {
      section.addEventListener('mouseenter', () => {
        if (nucBtn && nucBtn.style.display !== 'none') return;
        setTimeout(() => { if (!keyboardOpen) { keyOverlay.classList.add('active'); keyboardOpen = true; } }, 300);
      });
    }

    if (keyClose) {
      keyClose.addEventListener('click', () => {
        keyOverlay.classList.remove('active');
        keyboardOpen = false;
      });
    }

    // Build alphabet keyboard
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (keysGrid) {
      keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = k;
        btn.addEventListener('click', () => handleKey(k, btn));
        keysGrid.appendChild(btn);
      });
      const back = document.createElement('button');
      back.className = 'key-btn backspace';
      back.textContent = '← DEL';
      back.addEventListener('click', () => { typed = typed.slice(0,-1); updateDisplay(); });
      keysGrid.appendChild(back);
    }

    function updateDisplay() {
      if (!typedDisp) return;
      typedDisp.textContent = typed.padEnd(3,'_').split('').join(' ');
    }

    function handleKey(k, btn) {
      if (typed.length >= 3) return;
      const expected = SECRET[typed.length];
      typed += k;
      updateDisplay();
      if (k === expected) {
        btn.classList.add('correct');
        setTimeout(() => btn.classList.remove('correct'), 500);
      } else {
        btn.classList.add('wrong');
        setTimeout(() => { btn.classList.remove('wrong'); typed = ''; updateDisplay(); }, 500);
        return;
      }
      if (typed === SECRET) {
        setTimeout(() => {
          keyOverlay.classList.remove('active');
          keyboardOpen = false;
          if (nucBtn) { nucBtn.style.display = 'flex'; }
          typed = ''; updateDisplay();
        }, 600);
      }
    }

    // Physical keyboard support
    document.addEventListener('keydown', e => {
      if (!keyOverlay.classList.contains('active')) return;
      const k = e.key.toUpperCase();
      if (k === 'BACKSPACE') { typed = typed.slice(0,-1); updateDisplay(); return; }
      if (k === 'ESCAPE') { keyOverlay.classList.remove('active'); keyboardOpen = false; return; }
      if (keys.includes(k) && typed.length < 3) {
        const btn = [...keysGrid.querySelectorAll('.key-btn')].find(b => b.textContent === k);
        if (btn) handleKey(k, btn);
      }
    });

    // Nuclear button click → explosion
    if (nucBtn) {
      nucBtn.addEventListener('click', () => {
        nucOverlay.classList.add('active');
        startExplosion();
      });
    }

    function startExplosion() {
      const ctx = expCanvas.getContext('2d');
      expCanvas.width  = window.innerWidth;
      expCanvas.height = window.innerHeight;
      const W = expCanvas.width, H = expCanvas.height;
      const DIAG = Math.sqrt(W*W+H*H);
      let t = 0;

      const T_BUILD = 120, T_CRIT = 210, T_FLASH = 212,
            T_BLAST = 380, T_FADE = 460, T_DONE  = 520;

      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);

      // ── Tech logo definitions ──
      const LOGOS = [
        {label:'ROS2',   col:'139,92,246' },{label:'PyTorch',col:'232,121,249'},
        {label:'TF',     col:'255,160,50' },{label:'OpenCV', col:'64,196,255' },
        {label:'Python', col:'125,211,252'},{label:'YOLO',   col:'105,240,174'},
        {label:'PCB',    col:'179,136,255'},{label:'C++',    col:'167,139,250'},
        {label:'Linux',  col:'255,200,80' },{label:'Git',    col:'240,98,146' },
        {label:'NumPy',  col:'77,171,247' },{label:'SK-L',   col:'232,121,249'},
      ];

      // ── 5 atoms spread on screen ──
      // ── 5 atoms — random spread with gentle drift motion ──
      function rnd(min,max){return min+Math.random()*(max-min);}
      // Keep atoms away from edges and from each other
      const atomSeeds=[
        {cx:.50,cy:.50,sc:1.0, spd:1.0, tb:0  },  // centre always large
        {cx:.15,cy:.22,sc:0.62,spd:1.2, tb:18 },
        {cx:.80,cy:.18,sc:0.60,spd:0.80,tb:-12},
        {cx:.18,cy:.78,sc:0.55,spd:1.3, tb:35 },
        {cx:.82,cy:.80,sc:0.52,spd:0.90,tb:-25},
      ];
      const atoms = atomSeeds.map(s=>({
        // Base position with small random jitter (except centre)
        x: s.cx===.5 ? W*.5 : W*(s.cx + rnd(-.06,.06)),
        y: s.cy===.5 ? H*.5 : H*(s.cy + rnd(-.05,.05)),
        sc:s.sc, spd:s.spd, tb:s.tb,
        // Smooth drift: each atom drifts in a unique slow arc
        driftAng: Math.random()*Math.PI*2,
        driftR:   s.sc===1.0 ? 8 : 18+Math.random()*14,
        driftSpd: (.004+Math.random()*.004)*(Math.random()<.5?1:-1),
        baseX:0, baseY:0,  // set after
      }));
      atoms.forEach(a=>{a.baseX=a.x; a.baseY=a.y;});

      const LOGO_ASSIGN = [[0,1,2,3,4,5],[6,7],[8,9],[10],[11]];
      const ORBS = [[1.0,0.32,0,1.0],[0.95,0.30,60,0.75],[0.98,0.31,120,0.88]];
      const BASE_RX = 130;

      atoms.forEach((atom,ai)=>{
        atom.els=[];
        const ls=LOGO_ASSIGN[ai]; let li=0;
        ORBS.forEach(([rxf,ryf,to,sm],oi)=>{
          const cnt=ai===0?2:(li<ls.length?1:0);
          for(let e=0;e<cnt&&li<ls.length;e++,li++)
            atom.els.push({oi,phase:(e/Math.max(cnt,1))*Math.PI*2,li:ls[li]});
        });
      });

      // ── Shockwaves ──
      const shocks=[
        {r:0,sp:22,max:DIAG*.62,col:'220,210,255',lw:5,  a:.90},
        {r:0,sp:14,max:DIAG*.56,col:'179,136,255',lw:3.5,a:.75},
        {r:0,sp: 9,max:DIAG*.48,col:'139,92,246', lw:2.5,a:.60},
        {r:0,sp: 5,max:DIAG*.38,col:'64,196,255', lw:1.5,a:.45},
        {r:0,sp: 3,max:DIAG*.28,col:'192,132,252',lw:1,  a:.30},
      ];

      // ── Blast: sparks only (no trail particles) ──
      const PCOLS=['179,136,255','139,92,246','192,132,252','64,196,255','125,211,252','232,121,249','167,139,250','255,255,255'];
      const sparks=[];
      for(let i=0;i<600;i++){
        const a=Math.random()*Math.PI*2, sp=3+Math.random()*18;
        sparks.push({
          x:W/2,y:H/2,
          vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
          r:.4+Math.random()*1.6, life:1,
          decay:.005+Math.random()*.010,
          col:PCOLS[i%8],
          g:.02+Math.random()*.06,
        });
      }

      // ── Draw logo electron ──
      function drawLogo(wx,wy,li,sc,alpha){
        const L=LOGOS[li]; if(!L) return;
        const rad=12*sc;
        const eg=ctx.createRadialGradient(wx,wy,0,wx,wy,rad*2.8);
        eg.addColorStop(0,`rgba(${L.col},${.5*alpha})`);
        eg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(wx,wy,rad*2.8,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
        ctx.beginPath();ctx.arc(wx,wy,rad,0,Math.PI*2);
        ctx.fillStyle=`rgba(${L.col},${.2*alpha})`;ctx.fill();
        ctx.strokeStyle=`rgba(${L.col},${.85*alpha})`;ctx.lineWidth=1.2;ctx.stroke();
        ctx.font=`bold ${Math.max(7,Math.round(9*sc))}px "Space Mono",monospace`;
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle=`rgba(255,255,255,${.95*alpha})`;
        ctx.shadowColor=`rgba(${L.col},.8)`;ctx.shadowBlur=5;
        ctx.fillText(L.label,wx,wy);
        ctx.shadowBlur=0;ctx.textAlign='left';
      }

      // ── Draw one atom ──
      function drawAtom(atom,sc,alpha,shk){
        const sx=shk?(Math.random()-.5)*shk:0,sy=shk?(Math.random()-.5)*shk:0;
        const ax=atom.x+sx,ay=atom.y+sy,rx=BASE_RX*sc;
        // Aura
        const au=ctx.createRadialGradient(ax,ay,0,ax,ay,82*sc);
        au.addColorStop(0,`rgba(70,30,170,${.20*alpha})`);
        au.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(ax,ay,82*sc,0,Math.PI*2);ctx.fillStyle=au;ctx.fill();
        // Nucleus glow
        const ng=ctx.createRadialGradient(ax,ay,0,ax,ay,27*sc);
        ng.addColorStop(0,  `rgba(230,215,255,${alpha})`);
        ng.addColorStop(.35,`rgba(179,136,255,${.75*alpha})`);
        ng.addColorStop(.7, `rgba(99,60,220,${.35*alpha})`);
        ng.addColorStop(1,  'rgba(0,0,0,0)');
        ctx.beginPath();ctx.arc(ax,ay,27*sc,0,Math.PI*2);ctx.fillStyle=ng;ctx.fill();
        // Lens flare 8 arms
        [[1,0],[0,1],[-1,0],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]].forEach(([dx,dy])=>{
          const len=(58+16*Math.sin(t*.06+atom.tb))*sc*alpha;
          const lg=ctx.createLinearGradient(ax-dx*len,ay-dy*len,ax+dx*len,ay+dy*len);
          lg.addColorStop(0,'rgba(0,0,0,0)');
          lg.addColorStop(.5,`rgba(179,136,255,${.30*alpha})`);
          lg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.moveTo(ax-dx*len,ay-dy*len);ctx.lineTo(ax+dx*len,ay+dy*len);
          ctx.strokeStyle=lg;ctx.lineWidth=1.1*sc;ctx.stroke();
        });
        // Orbits
        const oc=['139,92,246','64,196,255','192,132,252'];
        ORBS.forEach(([rxf,ryf,to],oi)=>{
          const rad=(to+atom.tb)*Math.PI/180;
          ctx.save();ctx.translate(ax,ay);ctx.rotate(rad);
          ctx.shadowColor=`rgba(${oc[oi]},.35)`;ctx.shadowBlur=6;
          ctx.beginPath();ctx.ellipse(0,0,rx*rxf,rx*ryf*.95,0,0,Math.PI*2);
          ctx.strokeStyle=`rgba(${oc[oi]},${.40*alpha})`;ctx.lineWidth=1.3;ctx.stroke();
          ctx.shadowBlur=0;ctx.restore();
        });
        // Electrons / logos
        atom.els.forEach(el=>{
          const [rxf,ryf,to,sm]=ORBS[el.oi];
          const ang=el.phase+t*atom.spd*sm*.018;
          const rad=(to+atom.tb)*Math.PI/180;
          const ex=Math.cos(ang)*rx*rxf,ey=Math.sin(ang)*rx*ryf*.95;
          const wx=ax+ex*Math.cos(rad)-ey*Math.sin(rad);
          const wy=ay+ex*Math.sin(rad)+ey*Math.cos(rad);
          drawLogo(wx,wy,el.li,sc,alpha);
        });
        // Nucleus dot
        ctx.beginPath();ctx.arc(ax,ay,4.5*sc,0,Math.PI*2);
        ctx.fillStyle=`rgba(215,205,255,${alpha})`;ctx.fill();
        ctx.beginPath();ctx.arc(ax,ay,2*sc,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fill();
      }

      function frame(){
        t++;

        // Update atom drift positions every frame (smooth sinusoidal arc)
        atoms.forEach(a=>{
          a.driftAng += a.driftSpd;
          a.x = a.baseX + Math.cos(a.driftAng)*a.driftR;
          a.y = a.baseY + Math.sin(a.driftAng*1.3)*a.driftR*.6;
        });

        if(t<T_BUILD){
          ctx.fillStyle='rgba(0,0,0,.13)';ctx.fillRect(0,0,W,H);
          atoms.forEach((atom,ai)=>{
            const la=Math.max(0,Math.min((t-ai*12)/60,1));
            if(la<=0) return;
            const nb=ctx.createRadialGradient(atom.x,atom.y,0,atom.x,atom.y,100*atom.sc);
            nb.addColorStop(0,`rgba(35,10,75,${la*.38})`);nb.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(atom.x,atom.y,100*atom.sc,0,Math.PI*2);ctx.fillStyle=nb;ctx.fill();
            drawAtom(atom,atom.sc*(.2+la*.8),la,0);
          });
        }
        else if(t<T_CRIT){
          ctx.fillStyle='rgba(0,0,0,.09)';ctx.fillRect(0,0,W,H);
          const cp=(t-T_BUILD)/(T_CRIT-T_BUILD),pulse=Math.sin(t*.28)*.5+.5;
          atoms.forEach((atom,ai)=>{
            const wg=ctx.createRadialGradient(atom.x,atom.y,0,atom.x,atom.y,(65+cp*130)*atom.sc);
            wg.addColorStop(0,`rgba(179,136,255,${(.18+pulse*.12)*cp})`);
            wg.addColorStop(.5,`rgba(99,60,220,${.08*cp})`);
            wg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(atom.x,atom.y,(65+cp*130)*atom.sc,0,Math.PI*2);ctx.fillStyle=wg;ctx.fill();
            drawAtom(atom,atom.sc*(1+cp*.3),1,cp*12*(ai===0?1.4:1));
          });
          if(pulse>.88){ctx.fillStyle=`rgba(50,15,110,${.05*cp})`;ctx.fillRect(0,0,W,H);}
          if(t%9===0) atoms.forEach(atom=>{
            ctx.beginPath();ctx.arc(atom.x,atom.y,(42+cp*72)*atom.sc,0,Math.PI*2);
            ctx.strokeStyle=`rgba(179,136,255,${.4*cp*pulse})`;ctx.lineWidth=1.3;ctx.stroke();
          });
        }
        else if(t<=T_CRIT+2){
          const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,DIAG*.72);
          g.addColorStop(0,'rgba(255,252,255,1)');g.addColorStop(.12,'rgba(220,200,255,.97)');
          g.addColorStop(.42,'rgba(139,92,246,.55)');g.addColorStop(.78,'rgba(20,5,50,.22)');
          g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
          atoms.forEach(atom=>{
            ctx.beginPath();ctx.arc(atom.x,atom.y,DIAG*.038*atom.sc,0,Math.PI*2);
            ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=4*atom.sc;ctx.stroke();
          });
        }
        else if(t<T_BLAST){
          const bp=(t-T_CRIT-2)/(T_BLAST-T_CRIT-2);
          ctx.fillStyle=bp<.4?'rgba(0,0,0,.04)':'rgba(0,0,0,.055)';ctx.fillRect(0,0,W,H);
          atoms.forEach(atom=>{
            const cr=(1-bp)*(1-bp)*175*atom.sc+12;
            const bl=ctx.createRadialGradient(atom.x,atom.y,0,atom.x,atom.y,cr);
            bl.addColorStop(0,`rgba(200,170,255,${.5*(1-bp)*(1-bp)*atom.sc})`);
            bl.addColorStop(.4,`rgba(139,92,246,${.22*(1-bp)*atom.sc})`);
            bl.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(atom.x,atom.y,cr,0,Math.PI*2);ctx.fillStyle=bl;ctx.fill();
          });
          shocks.forEach((sw,si)=>{
            if(t-(T_CRIT+2)<si*10) return;
            sw.r+=sw.sp*Math.max(1-sw.r/sw.max,.22);
            if(sw.r>=sw.max) return;
            const fade=sw.a*(1-sw.r/sw.max)*(1-bp*.35);
            ctx.beginPath();ctx.arc(W/2,H/2,sw.r+4,0,Math.PI*2);
            ctx.strokeStyle=`rgba(${sw.col},${fade*.22})`;ctx.lineWidth=sw.lw+6;ctx.stroke();
            ctx.beginPath();ctx.arc(W/2,H/2,sw.r,0,Math.PI*2);
            ctx.strokeStyle=`rgba(${sw.col},${fade})`;ctx.lineWidth=sw.lw;ctx.stroke();
          });
          sparks.forEach(p=>{
            p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.979;p.vy*=.979;p.life-=p.decay;
            if(p.life<=0)return;
            // Subtle glow around each spark
            const sg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.5);
            sg.addColorStop(0,`rgba(${p.col},${p.life*.35})`);sg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();ctx.arc(p.x,p.y,p.r*3.5,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();
            ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
            ctx.globalAlpha=p.life*.85;ctx.fillStyle=`rgba(${p.col},1)`;ctx.fill();ctx.globalAlpha=1;
          });
        }
        else if(t<T_FADE){
          const fp=(t-T_BLAST)/(T_FADE-T_BLAST);
          ctx.fillStyle=`rgba(0,0,0,${.04+fp*fp*.32})`;ctx.fillRect(0,0,W,H);
        }
        else if(t<T_DONE){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);}
        else{ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);setTimeout(showMessage,2000);return;}

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function showMessage(){
      if(!nucMsg) return;

      const lines=[
        {text:'BE GRATEFUL TO GOD  —  YOU ARE ALIVE', cls:'msg-title',  delay:0   },
        {text:'The universe is 13.8 billion years old.',cls:'msg-text',  delay:900 },
        {text:'Against all odds — you exist. Right here. Right now.',cls:'msg-text',delay:2500},
        {text:'Be helpful. Be kind. Live with purpose.',cls:'msg-text',  delay:4400},
        {text:'Spread joy wherever you go.',cls:'msg-text',              delay:5900},
        {text:'"Life is unpredictable  —  live happily."',cls:'msg-quote',delay:7600},
      ];

      nucMsg.innerHTML='<div class="msg-block" id="msgBlock"></div>';
      const block=document.getElementById('msgBlock');

      const divT=document.createElement('div');divT.className='msg-divider';block.appendChild(divT);
      setTimeout(()=>divT.classList.add('expand'),300);

      let lastEnd=0;
      lines.forEach(line=>{
        const el=document.createElement('div');el.className=line.cls;el.style.opacity='0';
        block.appendChild(el);
        setTimeout(()=>{
          el.style.opacity='1';el.classList.add('fade-in');
          const full=line.text;let ci=0;
          const spd=line.cls==='msg-title'?40:24;
          const iv=setInterval(()=>{el.textContent=full.slice(0,++ci);if(ci>=full.length)clearInterval(iv);},spd);
        },line.delay);
        lastEnd=Math.max(lastEnd,line.delay+line.text.length*(line.cls==='msg-title'?40:24)+400);
      });

      const divB=document.createElement('div');divB.className='msg-divider';block.appendChild(divB);
      setTimeout(()=>divB.classList.add('expand'),lastEnd-300);

      const socDelay=lastEnd+500;
      const soc=document.createElement('div');soc.className='msg-socials';soc.style.opacity='0';
      soc.innerHTML=`
        <a class="msg-social-btn" href="https://github.com/MilindLate" target="_blank">Follow on GitHub</a>
        <a class="msg-social-btn" href="https://www.linkedin.com/in/milind-late" target="_blank">Connect on LinkedIn</a>
      `;
      block.appendChild(soc);
      setTimeout(()=>{soc.classList.add('fade-in');soc.style.opacity='1';},socDelay);

      nucMsg.classList.add('visible');
      // Auto-reload after 5s from social buttons appearing
      setTimeout(()=>window.location.reload(), socDelay+5000);
    }

  })();

  // ── ATOM ANIMATION ──
  (function() {
    const canvas = document.getElementById('atomCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const SIZE = 360;
    canvas.width  = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width  = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    ctx.scale(DPR, DPR);
    const cx = SIZE / 2, cy = SIZE / 2;

    let t = 0;

    // Cosmic palette — muted, theme-matched
    const orbits = [
      { rx: 118, ry: 38, tilt:   0, speed: 0.55, electrons: 2, color: '#8b5cf6' }, // soft violet
      { rx: 114, ry: 36, tilt:  60, speed: 0.38, electrons: 2, color: '#38bdf8' }, // muted cyan
      { rx: 116, ry: 37, tilt: 120, speed: 0.48, electrons: 1, color: '#c084fc' }, // lilac
      { rx: 104, ry: 33, tilt:  35, speed: 0.30, electrons: 1, color: '#7dd3fc' }, // sky
    ];

    const electrons = [];
    orbits.forEach((orb, oi) => {
      for (let e = 0; e < orb.electrons; e++) {
        electrons.push({ orbitIdx: oi, phase: (e / orb.electrons) * Math.PI * 2 });
      }
    });

    function h(hex, a) {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return `rgba(${r},${g},${b},${a})`;
    }

    function drawOrbit(orb) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orb.tilt * Math.PI / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = h(orb.color, 0.12);
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.restore();
    }

    function drawElectron(orb, phase, time) {
      const angle = phase + time * orb.speed;
      const rad = orb.tilt * Math.PI / 180;
      const ex = Math.cos(angle) * orb.rx;
      const ey = Math.sin(angle) * orb.ry;
      const wx = cx + ex * Math.cos(rad) - ey * Math.sin(rad);
      const wy = cy + ex * Math.sin(rad) + ey * Math.cos(rad);

      // Soft trail
      const trailLen = 10;
      for (let i = trailLen; i >= 0; i--) {
        const ta = phase + (time - i * 0.045) * orb.speed;
        const tex = Math.cos(ta) * orb.rx;
        const tey = Math.sin(ta) * orb.ry;
        const twx = cx + tex * Math.cos(rad) - tey * Math.sin(rad);
        const twy = cy + tex * Math.sin(rad) + tey * Math.cos(rad);
        const a = (1 - i / trailLen) * 0.22;
        const r = (trailLen - i) / trailLen * 2;
        ctx.beginPath();
        ctx.arc(twx, twy, r, 0, Math.PI * 2);
        ctx.fillStyle = h(orb.color, a);
        ctx.fill();
      }

      // Subtle glow halo
      const glowR = 10 + Math.sin(time * 2.5 + phase) * 2;
      const grd = ctx.createRadialGradient(wx, wy, 0, wx, wy, glowR);
      grd.addColorStop(0, h(orb.color, 0.30));
      grd.addColorStop(1, h(orb.color, 0));
      ctx.beginPath();
      ctx.arc(wx, wy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Small core dot
      ctx.beginPath();
      ctx.arc(wx, wy, 2, 0, Math.PI * 2);
      ctx.fillStyle = h(orb.color, 0.85);
      ctx.fill();

      // Tiny bright center
      ctx.beginPath();
      ctx.arc(wx, wy, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    }

    function drawNucleus(t) {
      const pulse = 1 + 0.05 * Math.sin(t * 1.8);

      // Outermost faint nebula glow — purple tinted
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * pulse);
      g1.addColorStop(0,   'rgba(139,92,246,0.07)');
      g1.addColorStop(0.5, 'rgba(99,102,241,0.04)');
      g1.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 70 * pulse, 0, Math.PI*2);
      ctx.fillStyle = g1; ctx.fill();

      // Mid glow — cyan tint
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38 * pulse);
      g2.addColorStop(0,   'rgba(56,189,248,0.12)');
      g2.addColorStop(1,   'rgba(139,92,246,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 38 * pulse, 0, Math.PI*2);
      ctx.fillStyle = g2; ctx.fill();

      // Core — soft white-violet
      const g3 = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 14 * pulse);
      g3.addColorStop(0,   'rgba(220,210,255,0.75)');
      g3.addColorStop(0.5, 'rgba(139,92,246,0.35)');
      g3.addColorStop(1,   'rgba(59,28,120,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 14 * pulse, 0, Math.PI*2);
      ctx.fillStyle = g3; ctx.fill();

      // Tiny bright nucleus center
      ctx.beginPath(); ctx.arc(cx, cy, 4 * pulse, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(230,220,255,0.9)'; ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      t += 0.014;

      orbits.forEach(orb => drawOrbit(orb));

      // Behind nucleus
      electrons.forEach(el => {
        const orb = orbits[el.orbitIdx];
        const angle = el.phase + t * orb.speed;
        if (Math.sin(angle) < 0) drawElectron(orb, el.phase, t);
      });

      drawNucleus(t);

      // In front of nucleus
      electrons.forEach(el => {
        const orb = orbits[el.orbitIdx];
        const angle = el.phase + t * orb.speed;
        if (Math.sin(angle) >= 0) drawElectron(orb, el.phase, t);
      });

      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ── NEURAL NETWORK ANIMATION ──
  (function() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const wrap = canvas.parentElement;
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Node class
    const NODES = 42;
    const CONN_DIST = 160;

    class Node {
      constructor(w, h) {
        this.reset(w, h);
      }
      reset(w, h) {
        this.x  = Math.random() * w;
        this.y  = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 2.5 + 1.5;
        // pulse timing
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed  = 0.02 + Math.random() * 0.02;
        // activation signal
        this.activation = 0;
        this.activationDecay = 0.015 + Math.random() * 0.01;
      }
    }

    let nodes = [];
    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODES; i++) {
        nodes.push(new Node(canvas.width, canvas.height));
      }
    }
    initNodes();

    // Signal particles travelling along edges
    const signals = [];
    function fireSignal(fromNode, toNode) {
      if (signals.length > 80) return;
      signals.push({ from: fromNode, to: toNode, t: 0, speed: 0.012 + Math.random() * 0.015 });
    }

    // Occasionally fire random signals
    let sigTimer = 0;

    let frame = 0;
    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      frame++;
      sigTimer++;
      if (sigTimer > 40) {
        sigTimer = 0;
        // Pick a random node and fire signals to nearby neighbours
        const src = nodes[Math.floor(Math.random() * nodes.length)];
        src.activation = 1.0;
        nodes.forEach(n => {
          if (n !== src) {
            const dx = n.x - src.x, dy = n.y - src.y;
            if (Math.sqrt(dx*dx+dy*dy) < CONN_DIST * 0.8) {
              fireSignal(src, n);
            }
          }
        });
      }

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.activation = Math.max(0, n.activation - n.activationDecay);
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < CONN_DIST) {
            const alpha = (1 - dist / CONN_DIST) * 0.22;
            const activated = Math.max(a.activation, b.activation);
            const r = Math.round(91 + activated * 88);
            const g = Math.round(57 + activated * 139);
            const bl = Math.round(200 + activated * 55);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha + activated * 0.35})`;
            ctx.lineWidth = 0.5 + activated * 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i];
        s.t += s.speed;
        if (s.t >= 1) {
          s.to.activation = Math.min(1, s.to.activation + 0.7);
          signals.splice(i, 1);
          continue;
        }
        const sx = s.from.x + (s.to.x - s.from.x) * s.t;
        const sy = s.from.y + (s.to.y - s.from.y) * s.t;
        // glow — alternates purple / cyan
        const useBlue = (i % 2 === 0);
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
        grd.addColorStop(0, useBlue ? 'rgba(64,196,255,0.95)' : 'rgba(179,136,255,0.95)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((n, idx) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * n.pulseSpeed + n.pulseOffset);
        const act   = n.activation;
        const baseAlpha = 0.25 + pulse * 0.2;
        const alpha = baseAlpha + act * 0.6;
        const radius = n.r + act * 3;
        const useCyan = (idx % 3 === 0);

        if (act > 0.1) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 6);
          grd.addColorStop(0, useCyan ? `rgba(64,196,255,${act*0.4})` : `rgba(179,136,255,${act*0.4})`);
          grd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius * 6, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = useCyan
          ? `rgba(64,${Math.round(180+act*76)},255,${alpha})`
          : `rgba(${Math.round(130+act*49)},${Math.round(80+act*56)},255,${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = useCyan
          ? `rgba(64,196,255,${0.2 + act*0.5})`
          : `rgba(179,136,255,${0.2 + act*0.5})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      requestAnimationFrame(draw);
    }

    draw();

    // Re-init on resize
    window.addEventListener('resize', initNodes);
  })();
  const loader = document.getElementById('loader');
  const percentEl = document.getElementById('loaderPercent');

  // Animate percentage counter in sync with CSS bar animation
  let pct = 0;
  const targets = [35, 72, 90, 100];
  const delays  = [0, 480, 960, 1400]; // ms after start
  const start   = performance.now() + 400; // matches CSS delay

  function animatePct() {
    const now = performance.now();
    const elapsed = now - start;
    let target = 0;
    for (let i = 0; i < delays.length; i++) {
      if (elapsed >= delays[i]) target = targets[i];
    }
    if (pct < target) {
      pct = Math.min(pct + 2, target);
      percentEl.textContent = pct + '%';
    }
    if (pct < 100) {
      requestAnimationFrame(animatePct);
    } else {
      percentEl.textContent = '100%';
      // Dismiss loader after a short pause
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('loading');
      }, 320);
    }
  }
  requestAnimationFrame(animatePct);

  // Fallback: always dismiss after 3s no matter what
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
  }, 3000);
  const reveals = document.querySelectorAll('.reveal');

  // Add stagger delays
  document.querySelectorAll('.skills-grid, .projects-grid, .research-grid').forEach(grid => {
    grid.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  // Only animate if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    reveals.forEach(el => el.classList.add('hidden'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('hidden');
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ════════════════════════════════════════
  // 1. SCROLL PROGRESS BAR
  // ════════════════════════════════════════
  const scrollBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });

  // ════════════════════════════════════════
  // 2. TYPEWRITER HERO TITLE
  // ════════════════════════════════════════
  (function(){
    const el = document.getElementById('typewriterText');
    if (!el) return;
    const phrases = [
      'Dev-Artist · Roboticist · ML Engineer',
      'Building Autonomous Systems',
      'Designing Intelligent Machines',
      'ROS2 · Computer Vision · AI/ML',
      'ISRO AIR 4 · Research Author',
    ];
    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const phrase = phrases[pi];
      el.textContent = deleting ? phrase.slice(0,--ci) : phrase.slice(0,++ci);
      let delay = deleting ? 38 : 68;
      if (!deleting && ci === phrase.length) { delay = 2200; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi+1)%phrases.length; delay = 320; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 1800);
  })();

  // ════════════════════════════════════════
  // 3. 3D CARD TILT
  // ════════════════════════════════════════
  document.querySelectorAll('.project-card, .skill-card, .research-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x*10}deg) rotateX(${-y*8}deg) translateY(-4px) scale(1.02)`;
      card.style.boxShadow = `${-x*20}px ${-y*16}px 40px rgba(179,136,255,0.18), 0 0 30px rgba(64,196,255,0.08)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // ════════════════════════════════════════
  // 4. CURSOR TRAIL + CLICK ATOM SPAWN
  // ════════════════════════════════════════
  (function(){
    const bgCanvas = document.getElementById('bgCanvas');
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    function resizeBg() { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; }
    resizeBg(); window.addEventListener('resize', resizeBg);

    const TRAIL_COLS = ['179,136,255','64,196,255','192,132,252','125,211,252'];
    let mx = -999, my = -999;
    const trailDots = [], miniAtoms = [];

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (Math.random() > 0.42) return;
      const col = TRAIL_COLS[Math.floor(Math.random()*4)];
      trailDots.push({ x:mx+(Math.random()-.5)*6, y:my+(Math.random()-.5)*6,
        r:.5+Math.random()*1.3, life:1, decay:.04+Math.random()*.05, col,
        vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5-.25 });
    });

    window.addEventListener('click', e => {
      if (e.target.closest('a,button,input,nav,.project-card,.ai-chat-panel,.ai-chat-btn,.nuclear-overlay,.keyboard-overlay')) return;
      const orbCount = 2 + Math.floor(Math.random()*2);
      const orbs = [];
      for (let i=0;i<orbCount;i++) orbs.push({
        rx:20+Math.random()*16, ry:6+Math.random()*5,
        tilt:(i/orbCount)*180+Math.random()*25,
        speed:(.5+Math.random()*.8)*(Math.random()<.5?1:-1),
        col:TRAIL_COLS[Math.floor(Math.random()*4)],
      });
      miniAtoms.push({ x:e.clientX, y:e.clientY, life:1, decay:.005+Math.random()*.004,
        sc:.18+Math.random()*.16, orbs, vy:-.35-Math.random()*.45, vx:(Math.random()-.5)*.35, t:0 });
    });

    function drawMiniAtom(a) {
      const {x,y,sc,orbs,life,t} = a;
      const S = sc*28;
      const ng=ctx.createRadialGradient(x,y,0,x,y,S*1.1);
      ng.addColorStop(0,`rgba(215,200,255,${life*.85})`);
      ng.addColorStop(0.5,`rgba(139,92,246,${life*.35})`);
      ng.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(x,y,S*1.1,0,Math.PI*2); ctx.fillStyle=ng; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,S*.28,0,Math.PI*2);
      ctx.fillStyle=`rgba(230,220,255,${life})`; ctx.fill();
      orbs.forEach(orb=>{
        const rx=orb.rx*S*.055, ry=orb.ry*S*.055;
        const rad=orb.tilt*Math.PI/180;
        ctx.save(); ctx.translate(x,y); ctx.rotate(rad);
        ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${orb.col},${life*.30})`; ctx.lineWidth=.7; ctx.stroke();
        ctx.restore();
        [0, Math.PI].forEach(ph=>{
          const ang=ph+t*orb.speed*.022;
          const ex=Math.cos(ang)*rx, ey=Math.sin(ang)*ry;
          const wx=x+ex*Math.cos(rad)-ey*Math.sin(rad);
          const wy=y+ex*Math.sin(rad)+ey*Math.cos(rad);
          const eg=ctx.createRadialGradient(wx,wy,0,wx,wy,S*.22);
          eg.addColorStop(0,`rgba(${orb.col},${life*.5})`); eg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(wx,wy,S*.22,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill();
          ctx.beginPath(); ctx.arc(wx,wy,S*.08,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,255,255,${life*.75})`; ctx.fill();
        });
      });
    }

    function bgLoop() {
      ctx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
      for (let i=trailDots.length-1;i>=0;i--) {
        const d=trailDots[i];
        d.x+=d.vx; d.y+=d.vy; d.life-=d.decay;
        if(d.life<=0){trailDots.splice(i,1);continue;}
        const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r*2.8);
        g.addColorStop(0,`rgba(${d.col},${d.life*.45})`); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r*2.8,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r*d.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(${d.col},${d.life*.65})`; ctx.fill();
      }
      for (let i=miniAtoms.length-1;i>=0;i--) {
        const a=miniAtoms[i];
        a.x+=a.vx; a.y+=a.vy; a.vy*=.99; a.life-=a.decay; a.t++;
        if(a.life<=0){miniAtoms.splice(i,1);continue;}
        drawMiniAtom(a);
      }
      requestAnimationFrame(bgLoop);
    }
    bgLoop();
  })();

  // ════════════════════════════════════════
  // 5. AI CHAT — CLAUDE POWERED
  // ════════════════════════════════════════
  (function(){
    const btn   = document.getElementById('aiChatBtn');
    const panel = document.getElementById('aiChatPanel');
    const close = document.getElementById('aiChatClose');
    const msgs  = document.getElementById('aiChatMessages');
    const input = document.getElementById('aiChatInput');
    const send  = document.getElementById('aiChatSend');
    const suggs = document.getElementById('aiChatSuggestions');
    if (!btn) return;

    const SYS = `You are a concise AI assistant for Milind Late's portfolio. Answer only about Milind.
Profile: CSE (AIML) student, YCCE Nagpur (2027). Robotics Engineer, ML Engineer.
Achievement: ISRO AIR 4, Team Titans.
Projects: ANAV autonomous drone (ROS2,OpenCV,YOLO,PCB), WeatherEye NASA Space Apps (TypeScript), KrishiCobot IITB e-Yantra (ROS2), Waste Management App, Mobile Disk Analyzer, RC Robot, Games Code Collection.
Skills: ROS2, Python, C++, OpenCV, YOLO, PyTorch, TensorFlow, Scikit-learn, TypeScript, React, PCB Design, Fusion 360, Linux, Git.
Research: 4+ papers, Springer Nature publication.
GitHub: github.com/MilindLate  LinkedIn: linkedin.com/in/milind-late
Keep replies under 70 words. Be warm and professional.`;

    let history = [], open = false;

    btn.addEventListener('click', () => { open=!open; panel.classList.toggle('open',open); if(open) setTimeout(()=>input.focus(),400); });
    close.addEventListener('click', () => { open=false; panel.classList.remove('open'); });
    suggs.querySelectorAll('.ai-suggestion').forEach(s=>s.addEventListener('click',()=>sendMsg(s.textContent)));
    send.addEventListener('click', ()=>sendMsg(input.value.trim()));
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMsg(input.value.trim()); });

    function addMsg(text, role) {
      const d=document.createElement('div'); d.className=`ai-msg ${role}`; d.textContent=text;
      msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; return d;
    }

    async function sendMsg(text) {
      if(!text) return;
      input.value=''; suggs.style.display='none';
      addMsg(text,'user');
      history.push({role:'user',content:text});
      const el=addMsg('','ai typing');
      try {
        const res=await fetch('https://api.anthropic.com/v1/messages',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:180,system:SYS,messages:history})
        });
        const data=await res.json();
        const reply=data.content?.[0]?.text||'Sorry, try again.';
        el.classList.remove('typing'); el.textContent='';
        let ci=0; const iv=setInterval(()=>{ el.textContent=reply.slice(0,++ci); msgs.scrollTop=msgs.scrollHeight; if(ci>=reply.length)clearInterval(iv); },16);
        history.push({role:'assistant',content:reply});
      } catch(e) { el.classList.remove('typing'); el.textContent='Network error. Try again.'; }
    }
  })();

  // ════════════════════════════════════════
  // 6. LIVE GITHUB STATS
  // ════════════════════════════════════════
  (function(){
    const widget=document.getElementById('ghStatsWidget');
    const rEl=document.getElementById('ghRepos');
    const sEl=document.getElementById('ghStars');
    if(!widget) return;
    function countUp(el,n){ let v=0,step=n/50; const iv=setInterval(()=>{ v=Math.min(v+step,n); el.textContent=Math.round(v); if(v>=n)clearInterval(iv); },20); }
    fetch('https://api.github.com/users/MilindLate')
      .then(r=>r.json()).then(d=>{
        if(d.public_repos===undefined) return;
        countUp(rEl,d.public_repos);
        fetch('https://api.github.com/users/MilindLate/repos?per_page=100')
          .then(r=>r.json()).then(repos=>{ countUp(sEl,repos.reduce((s,r)=>s+r.stargazers_count,0)); widget.classList.add('loaded'); });
      }).catch(()=>{ widget.style.display='none'; });
  })();
