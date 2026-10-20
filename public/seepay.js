/* SeePay shared logic — connected to Supabase via Next.js API routes */
(function(){
var FEE=.0195,FLAT=.2,SETUP=150,BONUS=50;
var NETS=['MTN','Vodafone','AirtelTigo'];
var CATS=['Food & drinks','Fashion','Hair & beauty','Repairs','Events & catering','Groceries','Electronics','Services','Other'];
var MARK='<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#FFC83D"/><path d="M5 8h22v6H5z" fill="#fff"/><path d="M5 8h7.33v6H5zM19.67 8H27v6h-7.33z" fill="#E4402F"/><circle cx="8.67" cy="14" r="3.67" fill="#E4402F"/><circle cx="16" cy="14" r="3.67" fill="#fff"/><circle cx="23.33" cy="14" r="3.67" fill="#E4402F"/><path d="M10.5 23l3.8 3.4 7.2-6.2" fill="none" stroke="#0E3B2C" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var SP={NETS:NETS,CATS:CATS,FEE:FEE,FLAT:FLAT,SETUP:SETUP,BONUS:BONUS,MARK:MARK};

SP.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]})};
SP.money=function(n){return 'GH₵ '+(+n).toFixed(2)};
SP.slugify=function(s){return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30)};
SP.phone=function(p){p=String(p).replace(/[\s-]/g,'');if(/^\+233\d{9}$/.test(p))p='0'+p.slice(4);return /^0\d{9}$/.test(p)?p:null};
SP.wa=function(p){var n=SP.phone(p);return n?'https://wa.me/233'+n.slice(1):''};
SP.initials=function(s){return String(s).split(/\s+/).slice(0,2).map(function(w){return w[0]||''}).join('').toUpperCase()};
SP.split=function(t){var pf=Math.round(t*FEE*100)/100,sf=Math.min(FLAT,t);return{pf:pf,sf:sf,net:Math.max(0,+(t-pf-sf).toFixed(2))}};
SP.toast=function(m){var t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},2400)};

/* Session helpers (simple localStorage for now) */
SP.session=function(){try{return JSON.parse(localStorage.getItem('seepay_session')||'null')}catch(e){return null}};
SP.login=function(role,id){localStorage.setItem('seepay_session',JSON.stringify({role:role,id:id}))};
SP.logout=function(){localStorage.removeItem('seepay_session')};

/* API calls */
SP.createShop=async function(f){
  var res=await fetch('/api/vendors/register',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      businessName:f.name,
      subdomain:f.slug,
      whatsappNumber:f.whatsapp||f.momo,
      ownerMomoNumber:f.momo,
      ownerMomoNetwork:f.network,
      referralCode:f.ref
    })
  });
  var data=await res.json();
  if(!res.ok) return {error:data.error||'Failed to create shop'};
  return {shop:{slug:f.slug}};
};

SP.nav=function(){
  var s=SP.session(),links='';
  if(s&&s.role==='shop')links='<a href="/shop-dashboard.html">Dashboard</a><a href="/store.html?shop='+SP.esc(s.id)+'">My store</a>';
  else if(s&&s.role==='agent')links='<a href="/agent-dashboard.html">Dashboard</a>';
  else links='<a href="/register-shop.html">Register shop</a><a href="/register-agent.html">Become an agent</a>';
  links+=s?'<button id="out">Sign out</button>':'<a href="/login.html">Sign in</a>';
  var b=document.createElement('header');b.className='bar';
  b.innerHTML='<div class="wrap"><a class="logo" href="/">'+MARK+'SeePay</a><nav>'+links+'</nav></div>';
  document.body.insertBefore(b,document.body.firstChild);
  var o=b.querySelector('#out');if(o)o.onclick=function(){SP.logout();location.href='/login.html'};
};

window.SP=SP;
})();
