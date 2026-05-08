import { useState, useEffect, useRef } from "react";

/* ───────── YOUTUBE CONFIG ───────── */
const YT_API_KEY = "AIzaSyDeCJS_Ysga2z9c1CucEaukxCCzxxSGOeo";
const YT_HANDLE = "thegatheringnwi";
const YT_SERMONS_PLAYLIST = ""; // paste your Sermons playlist ID here e.g. PLxxxxxxxx

async function fetchLatestSermon(apiKey = YT_API_KEY, handle = YT_HANDLE) {
  if (!apiKey) return null;
  try {
    let playlistId = YT_SERMONS_PLAYLIST;

    if (!playlistId) {
      const chRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${handle}&key=${apiKey}`
      );
      const chData = await chRes.json();
      playlistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    }
    if (!playlistId) return null;

    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlistId}&key=${apiKey}`
    );
    const plData = await plRes.json();
    const item = plData.items?.[0]?.snippet;
    if (!item) return null;

    return {
      title: item.title,
      description: item.description?.slice(0, 220) + "…",
      videoId: item.resourceId.videoId,
      date: new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      thumb: item.thumbnails?.maxres?.url || item.thumbnails?.high?.url,
    };
  } catch { return null; }
}

/* ───────── DATA ───────── */
const BELIEFS = [
  { title: "God", text: "We believe in one God who eternally exists in three persons — Father, Son, and Holy Spirit — equal in power and glory, with the same attributes and perfections, living in complete unity while being distinct persons. This Triune God is all-knowing, all-powerful, and all-present." },
  { title: "Jesus Christ", text: "We affirm Jesus Christ as the Son of God, fully divine and fully human. He was conceived by the Holy Spirit, born of the Virgin Mary, and lived a sinless life. Through His life, death, and resurrection, He offers salvation to all who believe, promising eternal life and a restored relationship with God." },
  { title: "Humanity & Sin", text: "All humans are made in the image of God with dignity and worth. Yet through the fall of Adam, all are sinners unable to save themselves, standing under the threat of divine punishment without God's gracious intervention. Sin affects every aspect of our lives and world." },
  { title: "Salvation by Grace", text: "God the Father, out of His free grace, gave His one and only Son Jesus Christ as a sacrifice for mankind. It is by faith in Jesus Christ that we are saved and have the promise of eternal life — a gift of grace, not of works." },
  { title: "The Church", text: "The church is the body of Christ. All followers of Jesus are called to gather regularly for worship, discipleship, and making disciples. Jesus Christ rules in His church through the leadership of pastors, elders, deacons, and other leaders appointed to oversee and serve." },
  { title: "Scripture", text: "The Bible is the inspired, authoritative Word of God — our ultimate guide for faith, life, and practice. All Scripture is breathed out by God and profitable for teaching, reproof, correction, and training in righteousness." },
];

const EVENTS = [
  { date: "Apr 13", day: "Sun", title: "Sunday Worship", time: "10:30 AM", tag: "Weekly" },
  { date: "Apr 16", day: "Wed", title: "Men's Small Group", time: "7:00 PM", tag: "Groups" },
  { date: "Apr 17", day: "Thu", title: "Women's Bible Study", time: "6:30 PM", tag: "Groups" },
  { date: "Apr 20", day: "Sun", title: "Sunday Worship", time: "10:30 AM", tag: "Weekly" },
  { date: "Apr 27", day: "Sun", title: "Community Outreach Day", time: "12:00 PM", tag: "Outreach" },
];

const EXPECT = [
  { icon: "⏰", title: "Arrive by 10:20", desc: "Grab coffee, find a seat, and settle in before service starts at 10:30 AM." },
  { icon: "👕", title: "Come as You Are", desc: "Jeans, dress clothes, whatever — we care about you, not your outfit." },
  { icon: "🎵", title: "Worship & Teaching", desc: "Contemporary worship followed by Bible-centered, practical teaching." },
  { icon: "👶", title: "Kids Are Covered", desc: "Children are an important part of the family here at The Gathering! We offer Nursery (ages 0–3) for the full service and Kids' Praise (ages 4–9) after worship. Youth Group (10+) meets every other Sunday morning." },
  { icon: "☕", title: "Stay & Connect", desc: "Hang around after! We'd love to meet you and answer any questions." },
  { icon: "📱", title: "Church Center App", desc: "Download the Church Center app and search The Gathering NWI for events, groups, giving, and staying connected all week." },
];

/* ───────── HOOKS ───────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Fade({ children, delay = 0, className = "", style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} className={className} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)", transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s` }}>{children}</div>;
}

/* ───────── COMPONENTS ───────── */
function Accordion({ title, text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="acc" onClick={() => setOpen(!open)}>
      <div className="acc-h"><h4>{title}</h4><span className={`acc-icon ${open ? "open" : ""}`}>+</span></div>
      <div className={`acc-b ${open ? "open" : ""}`}><p>{text}</p></div>
    </div>
  );
}

function PrayerModal({ open, onClose }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  if (!open) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const form = e.target;
    await fetch("https://formspree.io/f/mbdwanyj", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    setSending(false);
    setSent(true);
    form.reset();
    setTimeout(() => { setSent(false); onClose(); }, 2500);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🙏</div>
        <h3>Submit a Prayer Request</h3>
        <p className="modal-sub">What's on your heart? Our prayer team will lift you up.</p>
        {sent ? <p style={{ color: "var(--sky)", fontWeight: 600, textAlign: "center", padding: "24px 0" }}>✓ Prayer request sent. We're praying for you.</p> : (
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value="🙏 Prayer Request" />
            <input type="text" name="name" placeholder="Your name (optional)" />
            <textarea rows={5} name="message" placeholder="Share your prayer request here..." required />
            <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "8px 0 16px" }}>
              <input type="checkbox" id="priv" name="private" style={{ width: "auto" }} /><label htmlFor="priv" style={{ fontSize: 13, color: "var(--muted)" }}>Keep this private to the prayer team</label>
            </div>
            <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={sending}>{sending ? "Sending..." : "Send Prayer Request"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ───────── MAIN ───────── */
export default function TheGatheringNWI() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [sermon, setSermon] = useState(null);
  const [sermonLoading, setSermonLoading] = useState(true);
  const [ytKey, setYtKey] = useState(YT_API_KEY);
  const [showConfig, setShowConfig] = useState(!YT_API_KEY);

  useEffect(() => {
    async function load() {
      setSermonLoading(true);
      const s = await fetchLatestSermon();
      setSermon(s);
      setSermonLoading(false);
    }
    load();
  }, []);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 60); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);

  const go = (id) => { setMenuOpen(false); if (id === "home") return window.scrollTo({ top: 0, behavior: "smooth" }); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const NAV = [
    { label: "Home", id: "home" }, { label: "About", id: "about" },
    { label: "Sermons", id: "sermons" }, { label: "Beliefs", id: "beliefs" },
    { label: "Groups", id: "groups" },
    { label: "Visit", id: "visit" }, { label: "Contact", id: "contact" },
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    await fetch("https://formspree.io/f/mbdwanyj", {
      method: "POST",
      body: new FormData(e.target),
      headers: { Accept: "application/json" },
    });
    btn.textContent = '✓ Sent!';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Submit'; btn.disabled = false; }, 3000);
  };

  return (
    <div className="root">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
:root{
  --charcoal:#1e1e2e;--charcoal-deep:#14141f;--charcoal-mid:#2a2a3a;
  --sky:#3b9fd9;--sky-light:#eef6fc;--sky-glow:rgba(59,159,217,.12);
  --bg:#f8f9fb;--card:#fff;
  --text:#2a2a2a;--text-lt:#6e7282;--muted:#9ca0ad;
  --border:#e2e4ea;--radius:10px;--radius-lg:16px;
  --head:'Fraunces',serif;--body:'Plus Jakarta Sans',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}body{margin:0}
.root{font-family:var(--body);color:var(--text);background:var(--bg);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;transition:all .35s}
.nav.scrolled{background:rgba(248,249,251,.97);backdrop-filter:blur(14px);box-shadow:0 1px 24px rgba(30,30,46,.06)}
.nav-in{max-width:1260px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:18px 40px;transition:padding .3s}
.nav.scrolled .nav-in{padding:12px 40px}
.logo{cursor:pointer;display:flex;align-items:center;transition:all .3s}
.logo img{height:36px;width:auto;filter:brightness(0) invert(1);transition:filter .3s}
.nav.scrolled .logo img{filter:none}
.logo em{display:none}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,.8);cursor:pointer;transition:color .3s;position:relative}
.nav.scrolled .nav-links a{color:var(--text-lt)}
.nav-links a:hover{color:var(--sky)}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:var(--sky);transition:width .3s}
.nav-links a:hover::after{width:100%}
.nav-cta{padding:9px 22px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;background:var(--sky);color:#fff;border:none;cursor:pointer;transition:all .3s;font-family:var(--body)}
.nav-cta:hover{background:#fff;color:var(--charcoal);box-shadow:0 4px 16px rgba(59,159,217,.25)}
.nav.scrolled .nav-cta{background:var(--charcoal);color:#fff}
.nav.scrolled .nav-cta:hover{background:var(--sky)}
.ham{display:none;background:none;border:none;cursor:pointer;width:32px;height:32px;position:relative;z-index:200}
.ham span{display:block;width:22px;height:2px;position:absolute;left:5px;transition:all .3s;background:#fff}
.nav.scrolled .ham span{background:var(--charcoal)}
.ham span:nth-child(1){top:8px}.ham span:nth-child(2){top:15px}.ham span:nth-child(3){top:22px}
.ham.open span:nth-child(1){top:15px;transform:rotate(45deg);background:var(--charcoal)}
.ham.open span:nth-child(2){opacity:0}
.ham.open span:nth-child(3){top:15px;transform:rotate(-45deg);background:var(--charcoal)}
.mob-menu{position:fixed;inset:0;background:rgba(248,249,251,.98);backdrop-filter:blur(20px);z-index:99;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;opacity:0;pointer-events:none;transition:opacity .35s}
.mob-menu.open{opacity:1;pointer-events:all}
.mob-menu a{font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:2px;text-decoration:none;color:var(--charcoal);cursor:pointer}
.hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--charcoal-deep)}
.hero-bg{position:absolute;inset:0;background:linear-gradient(160deg,#14141f 0%,#1e1e2e 30%,#2a2a3a 60%,#33334a 100%)}
.hero-grain{position:absolute;inset:0;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 80%,rgba(59,159,217,.1),transparent 55%),radial-gradient(ellipse at 75% 20%,rgba(59,159,217,.06),transparent 50%)}
.hero-lines{position:absolute;inset:0;opacity:.04;background-image:repeating-linear-gradient(90deg,transparent,transparent 119px,rgba(255,255,255,.5) 120px)}
.hero-content{position:relative;z-index:2;text-align:center;max-width:860px;padding:140px 36px 100px;color:#fff}
.hero-badge{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--sky);padding:8px 22px;border:1px solid rgba(59,159,217,.3);border-radius:100px;margin-bottom:26px}
.hero-badge .pulse{width:8px;height:8px;border-radius:50%;background:var(--sky);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
.hero h1{font-family:var(--head);font-size:clamp(38px,6.5vw,78px);font-weight:600;line-height:1.06;letter-spacing:-.5px;margin-bottom:24px}
.hero h1 em{font-style:italic;color:var(--sky)}
.hero>div>div>p{font-size:17px;line-height:1.8;color:rgba(255,255,255,.55);max-width:520px;margin:0 auto 40px;font-weight:300}
.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.hero-meta{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;gap:40px;z-index:2}
.hero-mi{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:rgba(255,255,255,.35);letter-spacing:.5px}
.hero-mi .dot{width:5px;height:5px;border-radius:50%;background:var(--sky)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 30px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:all .3s;border:none;font-family:var(--body)}
.btn-accent{background:var(--sky);color:#fff}
.btn-accent:hover{background:#2d8cc6;transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,159,217,.3)}
.btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.2)}
.btn-ghost:hover{border-color:var(--sky);color:var(--sky)}
.btn-outline{background:transparent;color:var(--charcoal);border:1.5px solid var(--border)}
.btn-outline:hover{border-color:var(--sky);color:var(--sky)}
.btn-dark{background:var(--charcoal);color:#fff}
.btn-dark:hover{background:var(--charcoal-deep);transform:translateY(-2px);box-shadow:0 6px 20px rgba(30,30,46,.2)}
.qbar{padding:0 36px;margin-top:-52px;position:relative;z-index:10}
.qbar-in{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);background:var(--card);border-radius:var(--radius-lg);box-shadow:0 8px 48px rgba(30,30,46,.07);overflow:hidden}
.qi{padding:32px 20px;text-align:center;cursor:pointer;transition:all .3s;border-right:1px solid var(--border)}
.qi:last-child{border-right:none}
.qi:hover{background:var(--sky-light)}
.qi:hover .qi-icon{background:var(--sky);color:#fff}
.qi-icon{width:48px;height:48px;border-radius:14px;background:var(--charcoal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 14px;transition:all .3s}
.qi h4{font-size:14px;font-weight:700;margin-bottom:3px;color:var(--charcoal)}
.qi p{font-size:12px;color:var(--muted)}
.sec{padding:100px 36px;max-width:1120px;margin:0 auto}
.sec-h{margin-bottom:56px}
.sec-h.c{text-align:center}
.sec-lab{font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--sky);margin-bottom:12px}
.sec-title{font-family:var(--head);font-size:clamp(30px,4.5vw,48px);font-weight:600;line-height:1.12;color:var(--charcoal);margin-bottom:14px}
.sec-desc{font-size:16px;line-height:1.75;color:var(--text-lt);max-width:560px;font-weight:300}
.sec-h.c .sec-desc{margin:0 auto}
.sermon{display:grid;grid-template-columns:1.1fr 1fr;background:var(--card);border-radius:var(--radius-lg);overflow:hidden;box-shadow:0 4px 36px rgba(30,30,46,.05)}
.sermon-thumb{background:linear-gradient(135deg,var(--charcoal-deep),#33334a);display:flex;align-items:center;justify-content:center;position:relative;min-height:320px;cursor:pointer}
.sermon-thumb:hover .play{transform:scale(1.1);background:var(--sky);border-color:var(--sky)}
.play{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;transition:all .35s;z-index:2}
.play svg{fill:#fff;margin-left:4px}
.sermon-badge{position:absolute;top:20px;left:20px;padding:6px 14px;border-radius:100px;background:var(--sky);color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.sermon-info{padding:48px 40px;display:flex;flex-direction:column;justify-content:center}
.sermon-info .sn{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--sky);margin-bottom:10px}
.sermon-info h3{font-family:var(--head);font-size:32px;font-weight:600;color:var(--charcoal);margin-bottom:10px;line-height:1.2}
.sermon-info .speaker{font-size:14px;color:var(--muted);margin-bottom:4px}
.sermon-info .date{font-size:13px;color:var(--muted);margin-bottom:24px}
.sermon-info .sd{font-size:14px;line-height:1.75;color:var(--text-lt);margin-bottom:28px;font-weight:300}
.sermon-btns{display:flex;gap:12px;flex-wrap:wrap}
.about-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:64px;align-items:center}
.about-text p{font-size:15px;line-height:1.85;color:var(--text-lt);margin-bottom:16px;font-weight:300}
.about-quote{font-family:var(--head);font-size:20px;font-style:italic;color:var(--charcoal);border-left:3px solid var(--sky);padding:16px 0 16px 24px;margin:28px 0;line-height:1.5}
.about-quote cite{display:block;font-family:var(--body);font-size:13px;font-style:normal;color:var(--muted);margin-top:8px}
.beliefs-bg{background:var(--charcoal);padding:100px 0}
.acc{border-bottom:1px solid rgba(255,255,255,.07);cursor:pointer;max-width:720px;margin:0 auto}
.acc-h{display:flex;justify-content:space-between;align-items:center;padding:22px 0}
.acc-h h4{font-family:var(--head);font-size:20px;font-weight:500;color:#fff}
.acc-icon{font-size:20px;color:var(--sky);transition:transform .3s;font-weight:300}
.acc-icon.open{transform:rotate(45deg)}
.acc-b{max-height:0;overflow:hidden;transition:max-height .45s ease,padding .35s}
.acc-b.open{max-height:300px;padding:0 0 22px}
.acc-b p{font-size:15px;line-height:1.8;color:rgba(255,255,255,.5);font-weight:300}
.exp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.exp-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:32px 24px;transition:all .3s}
.exp-card:hover{border-color:var(--sky);transform:translateY(-4px);box-shadow:0 12px 32px rgba(59,159,217,.08)}
.exp-card .ei{font-size:28px;margin-bottom:14px;display:block}
.exp-card h4{font-size:15px;font-weight:700;color:var(--charcoal);margin-bottom:6px}
.exp-card p{font-size:13px;line-height:1.7;color:var(--text-lt);font-weight:300}
.grp-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grp{padding:32px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);transition:all .3s}
.grp:hover{border-color:var(--sky);box-shadow:0 8px 28px rgba(59,159,217,.06)}
.grp .gi{width:44px;height:44px;border-radius:12px;background:var(--sky-light);color:var(--sky);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.grp h4{font-size:16px;font-weight:700;color:var(--charcoal);margin-bottom:8px}
.grp p{font-size:14px;line-height:1.7;color:var(--text-lt);font-weight:300;margin-bottom:14px}
.grp .tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--sky);padding:4px 12px;background:var(--sky-light);border-radius:100px}
.ev-bg{background:var(--sky-light)}
.ev-list{display:flex;flex-direction:column;gap:10px}
.ev{display:flex;align-items:center;gap:24px;padding:18px 24px;background:var(--card);border-radius:var(--radius);border:1px solid var(--border);transition:all .3s}
.ev:hover{border-color:var(--sky);box-shadow:0 4px 16px rgba(59,159,217,.06)}
.ev-date{text-align:center;min-width:52px}
.ev-date .num{font-family:var(--head);font-size:26px;font-weight:700;color:var(--charcoal);line-height:1}
.ev-date .dn{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
.ev-div{width:1px;height:40px;background:var(--border)}
.ev-info h4{font-size:15px;font-weight:600;color:var(--charcoal);margin-bottom:2px}
.ev-info p{font-size:13px;color:var(--muted);font-weight:300}
.ev-tag{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--sky);padding:4px 12px;background:var(--sky-light);border-radius:100px;white-space:nowrap}
.pray-banner{background:var(--charcoal);border-radius:var(--radius-lg);padding:56px 48px;display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap}
.pray-banner h3{font-family:var(--head);font-size:30px;font-weight:600;color:#fff}
.pray-banner p{font-size:15px;color:rgba(255,255,255,.5);font-weight:300;margin-top:8px;max-width:440px}
.serve-cta{text-align:center;background:linear-gradient(160deg,var(--charcoal-deep),var(--charcoal),var(--charcoal-mid));border-radius:var(--radius-lg);padding:80px 48px;color:#fff;position:relative;overflow:hidden}
.serve-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 130%,rgba(59,159,217,.12),transparent 55%)}
.serve-cta h3{font-family:var(--head);font-size:36px;font-weight:600;margin-bottom:14px;position:relative}
.serve-cta p{font-size:16px;color:rgba(255,255,255,.55);font-weight:300;max-width:500px;margin:0 auto 32px;position:relative;line-height:1.7}
.ct-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.ct-details{display:flex;flex-direction:column;gap:18px}
.ct-d{display:flex;gap:16px;align-items:flex-start}
.ct-d .ci{width:40px;height:40px;border-radius:12px;background:var(--sky-light);color:var(--sky);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.ct-d h5{font-size:14px;font-weight:600;color:var(--charcoal);margin-bottom:3px}
.ct-d p{font-size:13px;color:var(--muted);font-weight:300;line-height:1.5}
.ct-d a{color:var(--sky);text-decoration:none}
.ct-d a:hover{text-decoration:underline}
.ct-form{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px}
.ct-form h4{font-family:var(--head);font-size:24px;font-weight:600;color:var(--charcoal);margin-bottom:6px}
.ct-form .sub{font-size:13px;color:var(--muted);margin-bottom:24px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.ff{display:flex;flex-direction:column;gap:5px}
.ff.full{grid-column:1/-1}
.ff label{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
.ff input,.ff textarea{padding:12px 14px;border:1px solid var(--border);border-radius:6px;font-size:14px;font-family:var(--body);color:var(--text);background:var(--bg);transition:border-color .3s;outline:none;resize:vertical}
.ff input:focus,.ff textarea:focus{border-color:var(--sky)}
.foot{background:var(--charcoal-deep);color:#fff;padding:72px 36px 40px}
.foot-in{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:48px}
.f-logo{margin-bottom:12px}
.f-logo img{height:32px;width:auto;filter:brightness(0) invert(1)}
.f-logo em{display:none}
.foot-brand p{font-size:14px;line-height:1.7;color:rgba(255,255,255,.35);font-weight:300}
.foot-col h5{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:16px}
.foot-col a{display:block;font-size:14px;color:rgba(255,255,255,.5);text-decoration:none;margin-bottom:10px;font-weight:300;transition:color .3s;cursor:pointer}
.foot-col a:hover{color:var(--sky)}
.foot-bot{max-width:1120px;margin:40px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.foot-bot p{font-size:12px;color:rgba(255,255,255,.2)}
.foot-bot a{color:rgba(255,255,255,.25);text-decoration:none}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:var(--radius-lg);padding:40px;max-width:480px;width:100%;position:relative}
.modal-x{position:absolute;top:16px;right:16px;background:none;border:none;font-size:18px;color:var(--muted);cursor:pointer}
.modal h3{font-family:var(--head);font-size:26px;font-weight:600;color:var(--charcoal);margin-bottom:6px}
.modal-sub{font-size:14px;color:var(--muted);margin-bottom:20px;font-weight:300}
.modal input,.modal textarea{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:6px;font-size:14px;font-family:var(--body);color:var(--text);margin-bottom:12px;outline:none;resize:vertical;background:var(--bg)}
.modal input:focus,.modal textarea:focus{border-color:var(--sky)}
.fab{position:fixed;bottom:24px;right:24px;z-index:50;background:var(--sky);color:#fff;border:none;width:56px;height:56px;border-radius:50%;font-size:24px;cursor:pointer;box-shadow:0 4px 24px rgba(59,159,217,.35);transition:all .3s;display:flex;align-items:center;justify-content:center}
.fab:hover{transform:scale(1.1);box-shadow:0 6px 32px rgba(59,159,217,.5)}
@media(max-width:1000px){
  .nav-links,.nav-cta{display:none}.ham{display:block}
  .sermon{grid-template-columns:1fr}.about-grid,.ct-grid{grid-template-columns:1fr}
  .grp-grid{grid-template-columns:1fr}.exp-grid{grid-template-columns:1fr 1fr}
  .qbar-in{grid-template-columns:1fr 1fr}.foot-in{grid-template-columns:1fr 1fr}
  .pray-banner{flex-direction:column;text-align:center}.pray-banner p{margin:8px auto 0}
}
@media(max-width:600px){
  .sec{padding:72px 20px}.hero-content{padding:120px 20px 80px}
  .qbar-in{grid-template-columns:1fr}.qi{border-right:none;border-bottom:1px solid var(--border)}
  .exp-grid{grid-template-columns:1fr}.fr{grid-template-columns:1fr}
  .foot-in{grid-template-columns:1fr}.hero-meta{display:none}.ev-tag{display:none}
}
      `}</style>

      {showConfig && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "14px 36px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", position: "relative", zIndex: 99 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>⚙️ Connect YouTube:</span>
          <input placeholder="API Key" defaultValue={ytKey} onChange={e => setYtKey(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #fde68a", borderRadius: 6, fontSize: 12, width: 260, fontFamily: "monospace" }} />
          <button onClick={async () => { const s = await fetchLatestSermon(ytKey); setSermon(s); if (s) setShowConfig(false); }} style={{ padding: "7px 18px", background: "#d97706", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Connect</button>
          <button onClick={() => setShowConfig(false)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#92400e" }}>✕</button>
        </div>
      )}

      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-in">
          <a className="logo" onClick={() => go("home")}><img src="/the_gathering_logo.png" alt="The Gathering Church" /></a>
          <ul className="nav-links">{NAV.map(l => <li key={l.id}><a onClick={() => go(l.id)}>{l.label}</a></li>)}</ul>
          <button className="nav-cta" onClick={() => window.open("https://thegatheringnwi.churchcenter.com/giving", "_blank")}>Give</button>
          <button className={`ham ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>
      <div className={`mob-menu ${menuOpen ? "open" : ""}`}>
        {NAV.map(l => <a key={l.id} onClick={() => go(l.id)}>{l.label}</a>)}
        <a onClick={() => window.open("https://thegatheringnwi.churchcenter.com/giving", "_blank")} style={{ color: "var(--sky)" }}>Give Online</a>
      </div>

      <section className="hero" id="home">
        <div className="hero-bg" /><div className="hero-grain" /><div className="hero-glow" /><div className="hero-lines" />
        <div className="hero-content">
          <Fade><div className="hero-badge"><span className="pulse" /> Live Sundays at 10:30 AM</div></Fade>
          <Fade delay={.1}><h1>A Place to <em>Gather,</em> Grow &amp; Belong</h1></Fade>
          <Fade delay={.2}><p>We're a community on mission to lead people into a growing relationship with Jesus — where everyone is welcome, wherever you are on your journey.</p></Fade>
          <Fade delay={.3}><div className="hero-btns">
            <button className="btn btn-accent" onClick={() => go("visit")}>Plan Your Visit</button>
            <a className="btn btn-ghost" href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Watch Live →</a>
          </div></Fade>
        </div>
        <div className="hero-meta">
          <a href="https://www.google.com/maps?saddr=My+Location&daddr=360+East+Lincoln+Highway+Schererville+IN+46375" target="_blank" rel="noopener noreferrer" className="hero-mi" style={{ textDecoration: "none" }}><div className="dot" /> 360 E Lincoln Hwy, Schererville, IN 46375</a>
          <div className="hero-mi"><div className="dot" /> Sundays 10:30 AM</div>
          <div className="hero-mi"><div className="dot" /> Everyone Welcome</div>
        </div>
      </section>

      {/* INFO BAR */}
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "14px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "24px 48px", justifyContent: "center" }}>
          {[
            { icon: "⏰", label: "Services", value: "Every Sunday 10:30am" },
            { icon: "📍", label: "Find Us", value: "360 E Lincoln Hwy, Schererville, IN 46375", href: "https://www.google.com/maps?saddr=My+Location&daddr=360+East+Lincoln+Highway+Schererville+IN+46375" },
            { icon: "📞", label: "Call Us", value: "(219) 765-2124", href: "tel:2197652124" },
            { icon: "✉️", label: "Email Us", value: "gatheringchurchnwi@gmail.com", href: "mailto:gatheringchurchnwi@gmail.com" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>{item.label}</div>
                {item.href
                  ? <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--sky)", textDecoration: "none", fontWeight: 500 }}>{item.value}</a>
                  : <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{item.value}</div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK BAR */}
      <div className="qbar"><Fade><div className="qbar-in">
        {[
          { icon: "🗓", title: "Plan Your Visit", desc: "What to expect Sunday", id: "visit" },
          { icon: "📖", title: "Latest Sermon", desc: "Watch this week's message", id: "sermons" },
          { icon: "🤝", title: "Join a Group", desc: "Find your community", url: "https://thegatheringnwi.churchcenter.com/groups" },
          { icon: "💬", title: "Connect With Us", desc: "Follow us on Facebook", url: "https://www.facebook.com/thegatheringnwi" },
        ].map(q => (
          <div key={q.title} className="qi" onClick={() => q.url ? window.open(q.url, "_blank") : go(q.id)}>
            <div className="qi-icon">{q.icon}</div><h4>{q.title}</h4><p>{q.desc}</p>
          </div>
        ))}
      </div></Fade></div>

      <section className="sec" id="sermons">
        <Fade><div className="sec-h"><div className="sec-lab">This Week</div><h2 className="sec-title">Latest Sermon</h2></div></Fade>
        <Fade delay={.1}><div className="sermon">
          {sermon ? (
            <>
              <div className="sermon-thumb" onClick={() => window.open(`https://youtube.com/watch?v=${sermon.videoId}`, "_blank")}>
                {sermon.thumb && <img src={sermon.thumb} alt={sermon.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .7 }} />}
                <div className="sermon-badge">Latest Sermon</div>
                <div className="play"><svg width="28" height="28" viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19" /></svg></div>
              </div>
              <div className="sermon-info">
                <div className="sn">The Gathering NWI</div>
                <h3>{sermon.title}</h3>
                <div className="speaker">The Gathering NWI</div>
                <div className="date">{sermon.date}</div>
                <p className="sd">{sermon.description}</p>
                <div className="sermon-btns">
                  <a className="btn btn-accent" href={`https://youtube.com/watch?v=${sermon.videoId}`} target="_blank" rel="noopener noreferrer">Watch Now</a>
                  <a className="btn btn-outline" href={`https://youtube.com/@${YT_HANDLE}`} target="_blank" rel="noopener noreferrer">All Sermons →</a>
                </div>
              </div>
            </>
          ) : sermonLoading ? (
            <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "center", padding: 64, color: "var(--muted)", fontSize: 14 }}>Loading latest sermon…</div>
          ) : (
            <>
              <div className="sermon-thumb">
                <div className="sermon-badge">Current Series</div>
                <div className="play"><svg width="28" height="28" viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19" /></svg></div>
                <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}><button onClick={() => setShowConfig(true)} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", padding: "8px 18px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>⚙️ Connect YouTube</button></div>
              </div>
              <div className="sermon-info">
                <div className="sn">The Gathering NWI</div>
                <h3>Latest Sermon</h3>
                <div className="speaker">The Gathering NWI</div>
                <p className="sd">Connect your YouTube channel above to automatically display your latest sermon here every week.</p>
                <div className="sermon-btns">
                  <a className="btn btn-accent" href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Watch on Facebook</a>
                </div>
              </div>
            </>
          )}
        </div></Fade>
      </section>

      {/* ABOUT */}
      <section className="sec" id="about" style={{ background: "var(--sky-light)", maxWidth: "none", padding: "100px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade><div className="sec-h c">
            <div className="sec-lab">Our Story</div>
            <h2 className="sec-title">Welcome to The Gathering</h2>
            <p className="sec-desc">We are excited for your first visit and a chance to meet you! Visiting somewhere new can be intimidating. We hope you find we are a community of people that are welcoming, loving, and ready to serve you and your family. No matter where you've been or what you've been through, there's a place for you here.</p>
          </div></Fade>

          {/* Community blurb */}
          <Fade delay={.1}><div style={{ background: "var(--charcoal)", borderRadius: "var(--radius-lg)", padding: "48px", marginBottom: 64, textAlign: "center" }}>
            <h3 style={{ fontFamily: "var(--head)", fontSize: 26, fontWeight: 600, color: "#fff", marginBottom: 16 }}>A Little About Us</h3>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,.5)", fontWeight: 300, maxWidth: 680, margin: "0 auto 24px" }}>Don't miss the opportunity to be part of our vibrant community every Sunday at 10:30 AM CST for our live services. Experience the warmth and inspiration of our gatherings from wherever you are! And if you can't make it to our live broadcast, don't worry — we have a rich archive of past sessions available for you to explore at your convenience. Join us in celebrating faith, hope, and community!</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-accent" href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Watch Live</a>
              <a className="btn btn-ghost" href={`https://youtube.com/@${YT_HANDLE}`} target="_blank" rel="noopener noreferrer">Sermon Archive →</a>
            </div>
          </div></Fade>

          {/* Pastor cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* The Evers */}
            <Fade><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ height: 220, background: "linear-gradient(145deg,var(--charcoal-deep),#33334a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)" }}>
                  <div style={{ fontSize: 56 }}>👨‍👩‍</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>Photo Coming Soon</div>
                </div>
              </div>
              <div style={{ padding: "32px" }}>
                <div className="sec-lab">Founding Pastors</div>
                <h3 style={{ fontFamily: "var(--head)", fontSize: 28, fontWeight: 600, color: "var(--charcoal)", margin: "8px 0 16px" }}>Shawn &amp; Kelly Evers</h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text-lt)", fontWeight: 300 }}>In a world where everyone is "virtually connected," in-person connections seem to be harder than ever. Through their passion for people and Jesus, Shawn and Kelly Evers started The Gathering. The hope is to create a community focused around relationships with each other and with Jesus — a community where everyone is welcome wherever they are in life; imperfect people trying to follow what Jesus said.</p>
              </div>
            </div></Fade>

            {/* The Gibsons */}
            <Fade delay={.1}><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ height: 220, background: "linear-gradient(145deg,#2a2a3a,var(--charcoal-mid))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)" }}>
                  <div style={{ fontSize: 56 }}>👨‍👩‍👧‍👦</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>Photo Coming Soon</div>
                </div>
              </div>
              <div style={{ padding: "32px" }}>
                <div className="sec-lab">Pastor &amp; Family</div>
                <h3 style={{ fontFamily: "var(--head)", fontSize: 28, fontWeight: 600, color: "var(--charcoal)", margin: "8px 0 16px" }}>Jordan &amp; Kaitlin Gibson</h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text-lt)", fontWeight: 300 }}>The Gibsons are excited to help lead at The Gathering! Jordan completed his MDiv in 2018 through Fuller Theological Seminary and has been serving as one of the pastors of The Gathering for almost 9 years. He is passionate about helping those far from God connect to God and the community. Jordan and his wife Kaitlin are proud parents to their children, Birch and Marigold.</p>
              </div>
            </div></Fade>
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="sec" id="visit">
        <Fade><div className="sec-h c">
          <div className="sec-lab">Your First Visit</div>
          <h2 className="sec-title">What to Expect</h2>
          <p className="sec-desc">We know visiting a new church can feel nerve-wracking. Here's everything you need to know so you can walk in with confidence.</p>
        </div></Fade>
        <div className="exp-grid">
          {EXPECT.map((e, i) => <Fade key={e.title} delay={i * .05}><div className="exp-card"><span className="ei">{e.icon}</span><h4>{e.title}</h4><p>{e.desc}</p></div></Fade>)}
        </div>
      </section>

      {/* BELIEFS */}
      <div className="beliefs-bg" id="beliefs">
        <section className="sec" style={{ padding: "0 36px" }}>
          <Fade><div className="sec-h c">
            <div className="sec-lab" style={{ color: "var(--sky)" }}>What We Believe</div>
            <h2 className="sec-title" style={{ color: "#fff" }}>Rooted in Scripture,<br />Centered on Christ</h2>
            <p className="sec-desc" style={{ color: "rgba(255,255,255,.45)" }}>Our beliefs are centered on faith in Jesus Christ, the authority of the Bible, and living out God's love in community.</p>
          </div></Fade>
          <Fade delay={.1}><div>{BELIEFS.map(b => <Accordion key={b.title} title={b.title} text={b.text} />)}</div></Fade>
        </section>
      </div>

      <section className="sec" id="groups">
        <Fade><div className="sec-h c">
          <div className="sec-lab">Get Connected</div>
          <h2 className="sec-title">Find Your Community</h2>
          <p className="sec-desc">Every week we have options for men and women to gather in order to build relationships, learn about Jesus, and pray for each other.</p>
        </div></Fade>
        <div className="grp-grid">
          {[
            { icon: "📖", title: "Small Groups", desc: "Weekly gatherings to dive deeper into Scripture, share life, and pray for each other in a safe, authentic space.", tag: "Weekly", url: "https://thegatheringnwi.churchcenter.com/groups" },
            { icon: "👶", title: "Nursery", desc: "A loving, safe environment for children ages 0–3 for the entire service so you can worship with peace of mind.", tag: "Ages 0–3" },
            { icon: "🌟", title: "Kids' Praise", desc: "Children are an important part of the family here! After worship, kids ages 4–9 head to a fun class where they learn about Jesus through God's Word, worship, and prayer.", tag: "Ages 4–9" },
            { icon: "🙌", title: "Youth Group", desc: "A dedicated space for older kids to ask big questions, build real friendships, and grow in their faith together.", tag: "Ages 10+ · Every Other Sunday" },
            { icon: "🤝", title: "Serve Teams", desc: "From community outreach to helping with Sunday services, there are several teams available for you to make a difference.", tag: "Multiple Teams" },
          ].map((g, i) => <Fade key={g.title} delay={i * .06}><div className="grp" style={{ cursor: g.url ? "pointer" : "default" }} onClick={() => g.url && window.open(g.url, "_blank")}><div className="gi">{g.icon}</div><h4>{g.title}</h4><p>{g.desc}</p><span className="tag">{g.tag}</span></div></Fade>)}
        </div>
      </section>



      <section className="sec">
        <Fade><div className="pray-banner">
          <div><h3>🙏 Need Prayer?</h3><p>Whatever you're walking through, you don't have to carry it alone. Our prayer team would be honored to pray for you.</p></div>
          <button className="btn btn-accent" onClick={() => setPrayerOpen(true)}>Submit a Prayer Request</button>
        </div></Fade>
      </section>



      <section className="sec" id="contact" style={{ background: "var(--sky-light)", maxWidth: "none", padding: "100px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade><div className="sec-h"><div className="sec-lab">Reach Out</div><h2 className="sec-title">We'd Love to<br />Hear from You</h2></div></Fade>
          <div className="ct-grid">
            <Fade><div className="ct-details">
              {[
                { icon: "📍", h: "Location", p: "360 E Lincoln Hwy, Schererville, IN 46375" },
                { icon: "⏰", h: "Service Time", p: "Every Sunday at 10:30 AM" },
                { icon: "📞", h: "Phone", p: <a href="tel:2197652124">(219) 765-2124</a> },
                { icon: "✉️", h: "Email", p: <a href="mailto:gatheringchurchnwi@gmail.com">gatheringchurchnwi@gmail.com</a> },
                { icon: "📺", h: "Watch Online", p: <a href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Facebook Live every Sunday →</a> },
                { icon: "📱", h: "Church Center", p: <a href="https://thegatheringnwi.churchcenter.com/" target="_blank" rel="noopener noreferrer">Download the app for groups, events & giving →</a> },
              ].map(d => <div className="ct-d" key={d.h}><div className="ci">{d.icon}</div><div><h5>{d.h}</h5><p>{d.p}</p></div></div>)}
            </div></Fade>
            <Fade delay={.15}><div className="ct-form">
              <h4>Let Us Know You're Coming</h4><p className="sub">We can't wait to see you!</p>
              <form onSubmit={handleContactSubmit}>
                <input type="hidden" name="_subject" value="📋 Plan Your Visit" />
                <div className="fr"><div className="ff"><label>First Name</label><input type="text" name="firstName" placeholder="First" required /></div><div className="ff"><label>Last Name</label><input type="text" name="lastName" placeholder="Last" required /></div></div>
                <div className="fr"><div className="ff full"><label>Email</label><input type="email" name="email" placeholder="you@email.com" required /></div></div>
                <div className="fr"><div className="ff full"><label>Phone (optional)</label><input type="tel" name="phone" placeholder="(555) 123-4567" /></div></div>
                <div className="fr"><div className="ff full"><label>Questions / Comments</label><textarea rows={4} name="message" placeholder="Anything you'd like us to know?" /></div></div>
                <button className="btn btn-dark" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Submit</button>
              </form>
            </div></Fade>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="foot-in">
          <div className="foot-brand"><div className="f-logo"><img src="/the_gathering_logo.png" alt="The Gathering Church" /></div><p>A church on mission to lead people into a growing relationship with Jesus Christ. Schererville, Indiana.</p></div>
          <div className="foot-col"><h5>Navigate</h5>{NAV.map(l => <a key={l.id} onClick={() => go(l.id)}>{l.label}</a>)}</div>
          <div className="foot-col"><h5>Connect</h5>
            <a href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://thegatheringnwi.churchcenter.com/" target="_blank" rel="noopener noreferrer">Church Center</a>
            <a onClick={() => setPrayerOpen(true)}>Prayer Request</a>
            <a href="https://thegatheringnwi.churchcenter.com/giving" target="_blank" rel="noopener noreferrer">Give Online</a>
          </div>
          <div className="foot-col"><h5>Visit</h5>
            <a>360 E Lincoln Hwy</a>
            <a>Schererville, IN 46375</a>
            <a>Sundays at 10:30 AM</a>
            <a href="https://www.facebook.com/thegatheringnwi" target="_blank" rel="noopener noreferrer">Watch Live</a>
          </div>
        </div>
        <div className="foot-bot">
          <p>© {new Date().getFullYear()} The Gathering NWI · Schererville, Indiana</p>
          <p><a href="https://www.thegatheringnwi.com" target="_blank" rel="noopener noreferrer">thegatheringnwi.com</a></p>
        </div>
      </footer>

      <button className="fab" onClick={() => setPrayerOpen(true)} aria-label="Prayer Request">🙏</button>
      <PrayerModal open={prayerOpen} onClose={() => setPrayerOpen(false)} />
    </div>
  );
}
