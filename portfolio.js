const CONTENT = {
 en: {
  navWhat:"What I do",navWork:"Selected work",navAbout:"About",
  eyebrow:"DATA ANALYST · BUSINESS INTELLIGENCE",
  heroTitle:"I turn business data<br>into <em>clear direction.</em>",
  heroDescription:"I help make sense of sales, customers and market performance — so businesses can see what is happening, understand why, and decide what to do next.",
  location:"Mazandaran, Iran",viewWork:"Explore my work",viewGithub:"Visit GitHub",
  artLabel:"FROM DATA TO DECISIONS",artTitle:"A clearer view<br>of your business.",artCaption:"Finding the signal behind the numbers.",
  whatEyebrow:"WHAT I DO",whatTitle:"Good questions.<br><em>Useful answers.</em>",
  whatIntro:"I use data to help answer the business questions that matter — without making the numbers harder to understand.",
  service1Title:"Understand performance",service1Text:"See what is driving revenue, where margins are changing, and which products or channels deserve attention.",
  service2Title:"Know your customers",service2Text:"Understand customer groups, repeat purchases, retention and the signals behind churn.",
  service3Title:"See the market clearly",service3Text:"Compare sellers, products and prices to spot concentration, unusual patterns and opportunities.",
  workEyebrow:"SELECTED WORK",workTitle:"A few things I’ve<br><em>worked through.</em>",
  workIntro:"Four projects. Four different business questions. One consistent goal: turn information into something people can use.",
  toolkitEyebrow:"MY TOOLKIT",toolkitTitle:"The right tools<br>for <em>better questions.</em>",
  toolkitText:"I combine querying, analysis and visualization to move from raw information to a clear business story.",
  toolSql:"Finding, joining and organizing information",toolPython:"Exploring data and answering deeper questions",
  toolBi:"Making results clear through reports and dashboards",toolStatsTitle:"Statistics & business analysis",
  toolStats:"Testing assumptions and understanding business performance",
  aboutEyebrow:"A LITTLE ABOUT ME",aboutTitle:"I’m Sina.<br><em>I make data make sense.</em>",
  aboutText:"I’m Sina Naqdi, based in Mazandaran, Iran. I’m interested in how businesses work — how people buy, what makes customers stay, and where a market’s opportunities are hiding. Data analysis gives me a way to explore those questions and explain what I find.",
  contactEyebrow:"GET IN TOUCH",contactTitle:"Have a question<br>worth <em>exploring?</em>",contactButton:"Let’s connect on GitHub",
  viewCase:"Explore this project",projectQuestion:"THE BUSINESS QUESTION",projectApproach:"WHAT I LOOKED AT",projectFinding:"WHAT THE ANALYSIS SHOWED",projectSnapshot:"PROJECT SNAPSHOT",projectTools:"TOOLS USED",close:"Close",
  retailLabel:"ONLINE RETAIL · SALES & CUSTOMERS",retailTitle:"RetailSignal",retailDesc:"A closer look at online store performance — where revenue comes from, what affects profit, and which customers are most valuable.",
  retailMetric:"Net realized revenue",retailQuestion:"Which products and customer groups contribute most to revenue and profit — and where are discounts reducing margin?",
  retailApproach:"Reviewed 22,000 orders, 38,500 order items and 6,000 customers across an 8-table store dataset. Looked at sales, product margins, purchase patterns and repeat customer activity.",
  retailFinding:"The analysis calculated $3.76M in net realized revenue and a 43.45% gross margin. Customer groups were organized by value and buying behavior to support more focused retention decisions.",
  retailSnapshot:"22,000 orders · 6,000 customers · 8 data tables",
  marketLabel:"ONLINE MARKETPLACE · SELLERS & PRICING",marketTitle:"BaSalam Analytics",marketDesc:"A marketplace health check: how sales are distributed between sellers, how products are priced, and how to compare shops fairly.",
  marketMetric:"GMV from top 20% of sellers",marketQuestion:"Is marketplace activity concentrated among a small group of sellers? Which prices look unusual, and how can seller ratings be compared fairly?",
  marketApproach:"Examined 20,000 products, 1,200 sellers and 25,000 customer reviews. Compared seller sales concentration, product prices and review volumes.",
  marketFinding:"The top 20% of shops accounted for 65.09% of four-week marketplace GMV. The price review flagged 764 unusually expensive products, while rating comparisons accounted for differences in review counts.",
  marketSnapshot:"20,000 products · 1,200 sellers · 25,000 reviews",
  churnLabel:"SUBSCRIPTIONS · CUSTOMER RETENTION",churnTitle:"Customer Churn Investigation",churnDesc:"Understanding why subscribers leave, which customer groups are at greater risk, and where retention efforts may have the most value.",
  churnMetric:"Overall churn rate",churnQuestion:"Which subscription patterns are linked to customer churn, and which customer groups should a retention team look at first?",
  churnApproach:"Studied 12,000 subscribers, compared churn across contract types, tested differences in customer behavior and built a baseline model to estimate churn risk.",
  churnFinding:"Overall churn was 19.23%. Month-to-month customers showed a higher churn rate than one- and two-year contract groups. The analysis estimated $2.21M in annual revenue at risk.",
  churnSnapshot:"12,000 subscribers · 19.23% churn · $2.21M revenue at risk",
  sahminoLabel:"FOOD MARKETPLACE · BUSINESS MODEL",sahminoTitle:"Sahmino · سهمینو",sahminoDesc:"Exploring the business side of a food-rescue marketplace: matching surplus food with demand while keeping each order economically viable.",
  sahminoMetric:"Listings sold through",sahminoQuestion:"How much listed surplus food could be sold, what does each completed order contribute, and how many orders are needed to cover monthly fixed costs?",
  sahminoApproach:"Built a six-month operating and financial model with 15,000 listings, 22,500 orders and 180 merchants across Babolsar and Amol.",
  sahminoFinding:"The model showed a 62.52% sell-through rate. Estimated contribution was 19,468 Toman per order, equal to 80.8% of commission revenue, with break-even volume tested under different scenarios.",
  sahminoSnapshot:"15,000 listings · 22,500 orders · 180 merchants",
  dataScale:"DATA IN THE PROJECT",metricLabel:"KEY RESULT"
 },
 fa: {
  navWhat:"زمینه فعالیت",navWork:"پروژه‌های منتخب",navAbout:"درباره من",
  eyebrow:"تحلیلگر داده · هوش تجاری",
  heroTitle:"داده‌های کسب‌وکار را به<br><em>تصمیم‌های روشن</em> تبدیل می‌کنم.",
  heroDescription:"به کسب‌وکارها کمک می‌کنم از فروش، مشتریان و عملکرد بازار تصویر روشن‌تری داشته باشند؛ بفهمند چه اتفاقی می‌افتد، چرا اتفاق می‌افتد و قدم بعدی چیست.",
  location:"مازندران، ایران",viewWork:"دیدن پروژه‌ها",viewGithub:"مشاهده گیت‌هاب",
  artLabel:"از داده تا تصمیم",artTitle:"تصویری روشن‌تر<br>از کسب‌وکار.",artCaption:"پیدا کردن معنا در میان اعداد.",
  whatEyebrow:"کاری که انجام می‌دهم",whatTitle:"پرسش‌های درست،<br><em>پاسخ‌های کاربردی.</em>",
  whatIntro:"از داده برای پاسخ‌دادن به پرسش‌های مهم کسب‌وکار استفاده می‌کنم؛ بدون پیچیده‌تر کردن اعداد و نتایج.",
  service1Title:"شناخت عملکرد کسب‌وکار",service1Text:"بررسی عوامل درآمد، تغییر حاشیه سود و شناسایی محصولات یا کانال‌هایی که نیاز به توجه دارند.",
  service2Title:"شناخت بهتر مشتریان",service2Text:"درک گروه‌های مشتری، خرید تکراری، حفظ مشتری و نشانه‌های ریزش.",
  service3Title:"شناخت شفاف‌تر بازار",service3Text:"مقایسه فروشندگان، محصولات و قیمت‌ها برای یافتن تمرکز بازار، الگوهای غیرعادی و فرصت‌ها.",
  workEyebrow:"نمونه کارها",workTitle:"چند مسئله که<br><em>بررسی کرده‌ام.</em>",
  workIntro:"چهار پروژه و چهار پرسش متفاوت کسب‌وکاری؛ با یک هدف مشترک: تبدیل اطلاعات به چیزی که بتوان از آن استفاده کرد.",
  toolkitEyebrow:"ابزارهای من",toolkitTitle:"ابزارهای مناسب برای<br><em>پرسش‌های بهتر.</em>",
  toolkitText:"از ترکیب پرس‌وجو، تحلیل و تصویرسازی داده استفاده می‌کنم تا اطلاعات خام به یک روایت روشن از کسب‌وکار تبدیل شود.",
  toolSql:"پیدا کردن، اتصال و سازمان‌دهی اطلاعات",toolPython:"بررسی داده و پاسخ به پرسش‌های عمیق‌تر",
  toolBi:"ارائه شفاف نتایج با گزارش و داشبورد",toolStatsTitle:"آمار و تحلیل کسب‌وکار",
  toolStats:"آزمودن فرضیه‌ها و شناخت عملکرد کسب‌وکار",
  aboutEyebrow:"کمی درباره من",aboutTitle:"من سینا هستم؛<br><em>داده را قابل فهم می‌کنم.</em>",
  aboutText:"من سینا نقدی، ساکن مازندران ایران هستم. به سازوکار کسب‌وکارها علاقه دارم؛ اینکه مردم چطور خرید می‌کنند، چه چیزی باعث ماندگاری مشتری می‌شود و فرصت‌های یک بازار کجا پنهان شده‌اند. تحلیل داده برای من راهی است تا این پرسش‌ها را بررسی کنم و نتیجه را قابل فهم توضیح بدهم.",
  contactEyebrow:"ارتباط با من",contactTitle:"پرسشی برای<br><em>بررسی و کشف دارید؟</em>",contactButton:"ارتباط از طریق گیت‌هاب",
  viewCase:"مشاهده پروژه",projectQuestion:"پرسش کسب‌وکاری",projectApproach:"چه چیزی را بررسی کردم؟",projectFinding:"نتیجه تحلیل",projectSnapshot:"مشخصات پروژه",projectTools:"ابزارهای استفاده‌شده",close:"بستن",
  retailLabel:"فروشگاه اینترنتی · فروش و مشتریان",retailTitle:"RetailSignal",retailDesc:"نگاهی دقیق‌تر به عملکرد فروشگاه آنلاین؛ درآمد از کجا می‌آید، چه چیزی بر سود اثر می‌گذارد و کدام مشتریان ارزشمندترند.",
  retailMetric:"درآمد خالص فروش",retailQuestion:"کدام محصولات و گروه‌های مشتری بیشترین سهم را در درآمد و سود دارند و تخفیف‌ها کجا حاشیه سود را کاهش می‌دهند؟",
  retailApproach:"۲۲ هزار سفارش، ۳۸٬۵۰۰ ردیف سفارش و ۶ هزار مشتری در ساختار داده‌ای ۸ جدولی بررسی شد. تحلیل شامل فروش، حاشیه سود محصولات، الگوی خرید و فعالیت مشتریان تکراری بود.",
  retailFinding:"تحلیل به درآمد خالص ۳.۷۶ میلیون دلار و حاشیه سود ناخالص ۴۳.۴۵٪ رسید. مشتریان بر اساس ارزش و رفتار خرید دسته‌بندی شدند تا تصمیم‌های حفظ مشتری هدفمندتر شوند.",
  retailSnapshot:"۲۲ هزار سفارش · ۶ هزار مشتری · ۸ جدول داده",
  marketLabel:"بازارگاه اینترنتی · فروشندگان و قیمت‌گذاری",marketTitle:"BaSalam Analytics",marketDesc:"ارزیابی سلامت یک بازارگاه: فروش بین غرفه‌ها چگونه توزیع شده، قیمت محصولات چطور است و چگونه می‌توان فروشندگان را منصفانه مقایسه کرد؟",
  marketMetric:"سهم ۲۰٪ فروشنده برتر از GMV",marketQuestion:"آیا فعالیت بازارگاه در دست تعداد کمی از فروشندگان متمرکز است؟ کدام قیمت‌ها غیرعادی‌اند و رتبه‌بندی فروشندگان چطور منصفانه‌تر می‌شود؟",
  marketApproach:"۲۰ هزار محصول، ۱۲۰۰ فروشنده و ۲۵ هزار نظر مشتری بررسی شد. تمرکز فروش، قیمت محصولات و تعداد نظرات مقایسه شدند.",
  marketFinding:"۲۰٪ غرفه‌های برتر، ۶۵.۰۹٪ از GMV چهار هفته بازارگاه را ایجاد کردند. بررسی قیمت، ۷۶۴ محصول با قیمت غیرعادی بالا را مشخص کرد. در مقایسه امتیاز غرفه‌ها، تعداد نظرات نیز لحاظ شد.",
  marketSnapshot:"۲۰ هزار محصول · ۱۲۰۰ فروشنده · ۲۵ هزار نظر",
  churnLabel:"اشتراک · حفظ مشتری",churnTitle:"بررسی ریزش مشتریان",churnDesc:"شناخت دلایل ترک اشتراک، گروه‌های در معرض ریسک و بخش‌هایی که اقدامات حفظ مشتری می‌توانند بیشترین ارزش را داشته باشند.",
  churnMetric:"نرخ کلی ریزش",churnQuestion:"چه الگوهایی با ریزش مشتریان مرتبط‌اند و تیم حفظ مشتری بهتر است بررسی را از کدام گروه‌ها شروع کند؟",
  churnApproach:"۱۲ هزار مشترک بررسی شدند؛ نرخ ریزش بر اساس نوع قرارداد مقایسه شد، تفاوت‌های رفتاری آزموده شد و یک مدل پایه برای برآورد ریسک ریزش ساخته شد.",
  churnFinding:"نرخ کلی ریزش ۱۹.۲۳٪ بود. مشتریان دارای قرارداد ماهانه نرخ ریزش بیشتری نسبت به قراردادهای یک‌ساله و دوساله داشتند. درآمد سالانه در معرض ریسک ۲.۲۱ میلیون دلار برآورد شد.",
  churnSnapshot:"۱۲ هزار مشترک · ۱۹.۲۳٪ ریزش · ۲.۲۱ میلیون دلار درآمد در معرض ریسک",
  sahminoLabel:"بازارگاه غذا · مدل کسب‌وکار",sahminoTitle:"Sahmino · سهمینو",sahminoDesc:"بررسی جنبه اقتصادی یک بازارگاه نجات غذا؛ اتصال غذای مازاد به تقاضا، در حالی که هر سفارش از نظر اقتصادی توجیه‌پذیر باشد.",
  sahminoMetric:"نرخ فروش بسته‌های ثبت‌شده",sahminoQuestion:"چه مقدار از غذای مازاد ثبت‌شده به فروش می‌رسد، هر سفارش تکمیل‌شده چه میزان حاشیه مشارکت ایجاد می‌کند و برای پوشش هزینه ثابت ماهانه چند سفارش لازم است؟",
  sahminoApproach:"مدل عملیاتی و مالی شش‌ماهه با ۱۵ هزار آگهی، ۲۲٬۵۰۰ سفارش و ۱۸۰ فروشنده در بابلسر و آمل طراحی شد.",
  sahminoFinding:"مدل به نرخ فروش ۶۲.۵۲٪ رسید. حاشیه مشارکت هر سفارش ۱۹٬۴۶۸ تومان و معادل ۸۰.۸٪ درآمد کمیسیون محاسبه شد. نقطه سربه‌سر در سناریوهای مختلف بررسی شد.",
  sahminoSnapshot:"۱۵ هزار آگهی · ۲۲٬۵۰۰ سفارش · ۱۸۰ فروشنده",
  dataScale:"ابعاد داده در پروژه",metricLabel:"نتیجه کلیدی"
 }
};
const PROJECTS = [
 {id:"retail",key:"retail",theme:"retail",metric:"$3.76M",unit:"NET REVENUE",tools:["PostgreSQL","Python","Power BI"],art:["retail"]},
 {id:"market",key:"market",theme:"market",metric:"65.09%",unit:"GMV · TOP 20% SHOPS",tools:["SQL","Python","DAX"],art:["market"]},
 {id:"churn",key:"churn",theme:"churn",metric:"19.23%",unit:"CUSTOMER CHURN",tools:["Python","Statistics","Power BI"],art:["churn"]},
 {id:"sahmino",key:"sahmino",theme:"sahmino",metric:"62.52%",unit:"SELL-THROUGH RATE",tools:["Python","SQL","Excel","Power BI"],art:["sahmino"]}
];
let language = "en";
function el(id){return document.getElementById(id)}
function text(key){return CONTENT[language][key] || key}
function projectCopy(p,field){return CONTENT[language][p.key+field]}
function renderProjectArt(p){
 if(p.theme==="retail") return '<div class="project-art"><div class="mini-chart"><span style="--bar:38%"></span><span style="--bar:53%"></span><span style="--bar:46%"></span><span style="--bar:68%"></span><span style="--bar:77%"></span><span style="--bar:94%"></span></div><svg class="retail-line" viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true"><path d="M8 111 C59 106 65 74 119 82 S183 108 221 70 S289 81 324 49 S407 61 490 13"/><circle cx="490" cy="13" r="5"/></svg><div class="mini-chart-labels"><span>JAN</span><span>MAR</span><span>JUN</span><span>SEP</span><span>DEC</span></div></div>';
 if(p.theme==="market") return '<div class="project-art"><div class="market-bars"><div class="market-row"><span>TOP 10%</span><div class="market-track"><i style="--w:46.8%"></i></div><b>46.8%</b></div><div class="market-row"><span>TOP 20%</span><div class="market-track"><i style="--w:65.09%"></i></div><b>65.1%</b></div><div class="market-row"><span>TOP 30%</span><div class="market-track"><i style="--w:76.4%"></i></div><b>76.4%</b></div><div class="market-row"><span>TOP 50%</span><div class="market-track"><i style="--w:89.5%"></i></div><b>89.5%</b></div></div></div>';
 if(p.theme==="churn") return '<div class="project-art"><div class="churn-rows"><div class="churn-row"><span>MONTHLY</span><div class="churn-track"><i style="--w:100%"></i></div><b>28.4%</b></div><div class="churn-row"><span>1 YEAR</span><div class="churn-track"><i style="--w:39.4%"></i></div><b>11.2%</b></div><div class="churn-row"><span>2 YEARS</span><div class="churn-track"><i style="--w:17.3%"></i></div><b>4.9%</b></div></div></div>';
 return '<div class="project-art"><div class="sahmino-visual"><div class="sahmino-ring"></div><div class="sahmino-side"><span>LISTINGS SOLD</span><b>62.52%</b><span>ORDERS MODELLED</span><b>22.5K</b></div></div></div>';
}
function renderProjects(){
 const grid=el("projectGrid");
 grid.innerHTML=PROJECTS.map((p,i)=>'<article class="project-card theme-'+p.theme+'" data-project="'+p.id+'"><div class="project-visual"><div class="project-visual-head"><span>'+projectCopy(p,"Label").toUpperCase()+'</span><span>0'+(i+1)+' / 04</span></div>'+renderProjectArt(p)+'</div><div class="project-card-body"><div class="project-meta"><span>'+text("projectSnapshot")+'</span><span>'+p.tools.join(" · ")+'</span></div><h3>'+projectCopy(p,"Title")+'</h3><p>'+projectCopy(p,"Desc")+'</p><div class="project-result"><div class="result-main"><strong>'+p.metric+'</strong><span>'+text("metricLabel")+'</span></div><button class="project-open" type="button" data-open="'+p.id+'" aria-label="'+text("viewCase")+'">↗</button></div></div></article>').join("");
}
function renderDialog(id){
 const p=PROJECTS.find(item=>item.id===id);if(!p)return;
 const c=CONTENT[language];
 const metrics={
  retail:[["$3.76M",language==="en"?"Net revenue":"درآمد خالص"],["43.45%",language==="en"?"Gross margin":"حاشیه سود ناخالص"],["6,000",language==="en"?"Customers":"مشتری"]],
  market:[["65.09%",language==="en"?"GMV from top 20%":"سهم ۲۰٪ غرفه برتر"],["764",language==="en"?"Price outliers":"قیمت غیرعادی"],["1,200",language==="en"?"Sellers":"فروشنده"]],
  churn:[["19.23%",language==="en"?"Overall churn":"نرخ کلی ریزش"],["$2.21M",language==="en"?"Revenue at risk":"درآمد در معرض ریسک"],["0.728",language==="en"?"Model ROC-AUC":"ROC-AUC مدل"]],
  sahmino:[["62.52%",language==="en"?"Sell-through":"نرخ فروش"],["19,468",language==="en"?"Toman / order":"تومان / سفارش"],["80.8%",language==="en"?"Contribution margin":"حاشیه مشارکت"]]
 }[id];
 const tools={retail:["PostgreSQL","Python","Power BI"],market:["PostgreSQL","Python","DAX"],churn:["Python","SciPy","PostgreSQL","Power BI"],sahmino:["Python","SQL","Excel","Power BI"]}[id];
 el("dialogContent").innerHTML='<div class="dialog-content"><div class="dialog-kicker">'+projectCopy(p,"Label")+'</div><h2>'+projectCopy(p,"Title")+'</h2><p class="dialog-intro">'+projectCopy(p,"Desc")+'</p><div class="dialog-section"><h3>'+text("projectQuestion")+'</h3><p>'+projectCopy(p,"Question")+'</p></div><div class="dialog-section"><h3>'+text("projectApproach")+'</h3><p>'+projectCopy(p,"Approach")+'</p></div><div class="dialog-section"><h3>'+text("projectFinding")+'</h3><p>'+projectCopy(p,"Finding")+'</p></div><div class="dialog-section"><h3>'+text("dataScale")+'</h3><p>'+projectCopy(p,"Snapshot")+'</p></div><div class="dialog-metrics">'+metrics.map(m=>'<div class="dialog-metric"><strong>'+m[0]+'</strong><span>'+m[1]+'</span></div>').join("")+'</div><h3 style="font-size:10px;color:var(--green);margin:20px 0 8px">'+text("projectTools")+'</h3><div class="dialog-tools">'+tools.map(x=>'<span>'+x+'</span>').join("")+'</div></div>';
 el("projectDialog").showModal();
}
function renderLanguage(){
 const c=CONTENT[language];
 document.documentElement.lang=language==="fa"?"fa":"en";
 document.documentElement.dir=language==="fa"?"rtl":"ltr";
 el("languageToggle").textContent=language==="en"?"FA":"EN";
 document.querySelectorAll("[data-i18n]").forEach(node=>{const key=node.dataset.i18n;if(c[key])node.textContent=c[key]});
 document.querySelectorAll("[data-i18n-html]").forEach(node=>{const key=node.dataset.i18nHtml;if(c[key])node.innerHTML=c[key]});
 renderProjects();
}
el("projectGrid").addEventListener("click",event=>{const button=event.target.closest("[data-open]");if(button)renderDialog(button.dataset.open)});
el("languageToggle").addEventListener("click",()=>{language=language==="en"?"fa":"en";renderLanguage()});
el("dialogClose").addEventListener("click",()=>el("projectDialog").close());
el("projectDialog").addEventListener("click",event=>{if(event.target===el("projectDialog"))el("projectDialog").close()});
el("menuToggle").addEventListener("click",()=>el("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(link=>link.addEventListener("click",()=>el("mainNav").classList.remove("open")));
el("year").textContent=new Date().getFullYear();
renderLanguage();
