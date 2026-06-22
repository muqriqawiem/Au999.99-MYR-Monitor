"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Coins, 
  Languages, 
  Sun, 
  Moon, 
  HelpCircle, 
  Key, 
  RefreshCw, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Info,
  Layers,
  ChevronDown
} from "lucide-react";

/* ════════════════════════════════════════════════
   SHARED CONSTANTS
════════════════════════════════════════════════ */
const TROY = 31.1035;
const GOLD_API = "https://api.gold-api.com";
const FX_API = "https://open.er-api.com/v6/latest/USD";
const STORAGE_KEY = "au999_goldapi_key";
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GOLD_API_KEY ?? "";

function getNowTs(): number {
  return Math.floor(Date.now() / 1000);
}

function getNowMs(): number {
  return Date.now();
}

/* ════════════════════════════════════════════════
   TRANSLATION DICTIONARY
════════════════════════════════════════════════ */
const TRANSLATIONS: Record<string, Record<string, any>> = {
  en: {
    brand_title: "Au 999.9 Monitor",
    brand_sub: "Malaysian Ringgit · Per Gram",
    live: "Live",
    how_to_read: "How to read this",
    api_key: "API Key",
    refresh: "Refresh",
    theme_dark: "Dark Theme",
    theme_light: "Light Theme",
    hero_eyebrow: "Gold spot · 24K pure · MYR per gram",
    hero_unit: "MYR / gram",
    today_change: "today",
    m_oz_lbl: "Price per troy oz",
    m_fx_lbl: "USD / MYR rate",
    m_fx_sub: "Bank Negara ref",
    m_hi_lbl: "Intraday high",
    m_lo_lbl: "Intraday low",
    m_op_lbl: "Day open",
    per_gram: "per gram",
    alerts_title: "Price alerts",
    calculator_title: "Conversion calculator",
    calculator_sub: "Convert between MYR and grams using current MYR/g price",
    calculator_myr: "MYR",
    calculator_gram: "Gold grams",
    calculator_input_myr: "Enter MYR",
    calculator_input_gram: "Enter grams",
    calculator_note: "Based on current price",
    alert_placeholder: "MYR / gram",
    alert_above: "↑ Rises above",
    alert_below: "↓ Falls below",
    add_btn: "+ Add",
    no_alerts: "No alerts set. Enter a target price above.",
    badge_above: "↑ above",
    badge_below: "↓ below",
    badge_hit: "⚡ triggered",
    triggered_msg: (g: string, dir: string, p: string) => 
      `🏅 Alert: Au999.9 is RM ${g}/g — ${dir} RM ${p} triggered!`,
    alert_dir_above: "above",
    alert_dir_below: "below",
    toast_live: (v: string, t: string) => `Live · Au999.9 RM ${v}/g · ${t}`,
    toast_fetching: "Fetching…",
    toast_err: (m: string) => `⚠ Fetch error: ${m}`,
    invalid_price: "Enter a valid MYR price per gram.",
    waiting: "Waiting for live data…",
    footer_data: (a: string, b: string) => `Au spot: ${a} · USD/MYR: ${b} · Not financial advice.`,
    market_ts: (d: string, t: string) => `Market data: ${d} · Refreshed ${t}`,
    modal_title: "Connect live gold data",
    modal_sub: "Free API key · gold-api.com · 2 minutes setup",
    modal_step1: "Go to <a href='https://gold-api.com' target='_blank' rel='noopener noreferrer' class='text-[#E8B84B] hover:underline font-semibold'>gold-api.com</a> → click <strong>Sign Up</strong>. Completely free, no credit card.",
    modal_step2: "After signing in, your API key is displayed on the dashboard homepage. <strong>Copy the full key exactly.</strong>",
    modal_step3: "Paste it below and click <strong>Connect</strong>. Configured securely in your browser.",
    modal_placeholder: "Paste your API key here…",
    modal_connect: "Connect",
    modal_note: "Your key is stored only in this browser's localStorage — never sent anywhere except directly to api.gold-api.com. The key is only used for the OHLC endpoint. Live price data requires no authentication.",
    err_401: "❌ Key rejected (401/403). Copy the full key exactly from gold-api.com dashboard.",
    err_status: (s: number) => `❌ API returned status ${s}. Try again shortly.`,
    err_response: "❌ Unexpected response. Try again.",
    err_network: "❌ Network error. Check your connection.",
    err_ohlc: "⚠ API key rejected by OHLC endpoint. Re-enter your key.",
    verifying: "Verifying…",
    guide_title: "Dashboard Guide",
    guide_sub: "4 sections · tap any tab to jump",
    tab0: "Hero price",
    tab1: "Metrics strip",
    tab2: "Alerts",
    tab3: "The formula",
    prev: "Previous",
    next: "Next",
    s0_num: "Section 1 of 4",
    s0_title: "The hero price",
    s0_sub: "The biggest number on screen — everything else is context for this single figure.",
    c0_0_tag: "Big number",
    c0_0_txt: "Cost of 1 gram of pure Au 999.9 right now in Ringgit. Buying 10g today = RM 5,304.70.",
    c0_1_tag: "Red = fell today",
    c0_1_txt: "Difference from today's open. Red = price dropped since market opened. Green = price rose.",
    c0_2_tag: "Timestamp",
    c0_2_txt: "When data was last fetched. Always verify this before making a buy or sell decision.",
    c0_3_tag: "Au 999.9",
    c0_3_txt: "Investment-grade gold only — not 916 jewellery. Used by Maybank, CIMB gold accounts and bullion bars.",
    s0_formula: "<strong>Quick rule:</strong> If the pill is <span class='text-[#4CAF72]'>green</span>, gold is more expensive than this morning. If it's <span class='text-[#E05555]'>red</span>, it is cheaper. The % tells you by how much.",
    s1_num: "Section 2 of 4",
    s1_title: "The metrics strip",
    s1_sub: "Five numbers that give you the full picture of today's market in one glance.",
    s1_r0: "<strong>Price / troy oz</strong> — the global standard unit. 1 troy oz = 31.1035 grams. The USD figure is the raw international price before currency conversion.",
    s1_r1: "<strong>USD/MYR rate</strong> — why Malaysian gold prices move even when international gold is flat. If MYR weakens (rate rises 4.06 → 4.20), your RM price rises automatically.",
    s1_r2: "<strong>Intraday high / low</strong> — highest and lowest price today. Wide range = high volatility. Narrow range = quiet market.",
    s1_r3: "<strong>Day open</strong> — where price started this session. Current above open = green day. Current below open = red day.",
    s2_num: "Section 3 of 4",
    s2_title: "Price alerts",
    s2_sub: "How to set them, what they trigger, and three practical strategies.",
    strat_buy_tag: "Buy zone",
    strat_buy_title: "Set alert BELOW current price",
    strat_buy_body: "Gold is at RM 530. You think RM 500 is a good entry. Set 'falls below RM 500.' When gold dips there, you get notified.",
    strat_stop_tag: "Stop-loss",
    strat_stop_title: "Set alert BELOW your entry price",
    strat_stop_body: "You bought at RM 520. Set 'falls below RM 495.' If triggered, you're in an unrealised loss. Not a command to sell — a signal to re-examine your thesis.",
    strat_profit_tag: "Profit target",
    strat_profit_title: "Set alert ABOVE your entry price",
    strat_profit_body: "You bought at RM 510, target RM 560. Set 'rises above RM 560.' When triggered, your target is reached — take profit or let it run.",
    s2_formula: "Alerts fire as a <strong>browser toast notification</strong> and as a <strong>system notification</strong> if you allow it. The badge changes to <span class='text-[#E8B84B]'>⚡ Triggered</span> in the list.",
    s3_num: "Section 4 of 4",
    s3_title: "The formula",
    s3_sub: "The math behind every number — simple, but understanding it protects you from misreading the price.",
    s3_formula_main: "<strong>RM per gram</strong> = ( XAU/USD ÷ 31.1035 ) × USD/MYR<br/><br/>Example: ( <code>4,056.27</code> ÷ <code>31.1035</code> ) × <code>4.0645</code> = <strong class='text-[#E8B84B]'>RM 530.47 / gram</strong>",
    s3_r0: "<strong>XAU/USD spot</strong> — international gold price in USD per troy ounce. Set by LBMA (London) and COMEX (New York). The global reference every gold product is derived from.",
    s3_r1: "<strong>÷ 31.1035</strong> — converts troy ounces to grams. One troy ounce always equals 31.1035 grams. This constant never changes.",
    s3_r2: "<strong>× USD/MYR rate</strong> — converts USD to Ringgit. This is the variable that moves MYR gold prices even on quiet international gold days.",
    s3_sc_a_tag: "Scenario A — MYR weakens",
    s3_sc_a_txt: "Gold flat at $4,056. USD/MYR goes 4.06 → 4.20. Your RM price rises RM 530 → RM 548/g. A weak Ringgit makes gold more expensive.",
    s3_sc_b_tag: "Scenario B — MYR strengthens",
    s3_sc_b_txt: "Gold rises to $4,200 but USD/MYR drops to 3.90. Effects partially cancel. Your MYR gain is smaller than the USD gain suggests.",
    s3_formula_rule: "<strong>Practical rule:</strong> Always check both XAU/USD <em>and</em> USD/MYR rate. A 'rising' RM gold price could be entirely due to a weakening Ringgit — not gold demand.",
    ch_title: "30-Day Range · Daily High · Avg · Low · MYR/gram",
    ch_load_btn: "Load chart",
    ch_status_idle: "Click 'Load chart' to fetch 30 days of real data",
    ch_loading: "Fetching 30-day history (3 API calls)…",
    ch_ok: (n: number, r: string) => `${n} days loaded · USD/MYR ${r}`,
    ch_err: (m: string) => `⚠ ${m}`,
    ch_rate_limit: "Rate limit hit — free tier allows 10 history req/hr. Wait a few minutes.",
    ch_auth_fail: "Key rejected on history endpoint. Re-enter your API key.",
    ch_leg_hi: "Daily high",
    ch_leg_lo: "Daily low",
    ch_leg_avg: "Daily average · trend line",
    ch_leg_band: "Daily range (High–Low band)",
    ch_leg_today: "Most recent day",
    ch_zoom_hint: "Scroll to zoom · Drag to pan",
  },
  bm: {
    brand_title: "Monitor Au 999.9",
    brand_sub: "Ringgit Malaysia · Per Gram",
    live: "Masa Nyata",
    how_to_read: "Cara membaca ini",
    api_key: "Kunci API",
    refresh: "Muat Semula",
    theme_dark: "Tema Gelap",
    theme_light: "Tema Cerah",
    hero_eyebrow: "Harga spot emas · 24K tulen · RM per gram",
    hero_unit: "RM / gram",
    today_change: "hari ini",
    m_oz_lbl: "Harga per troy auns",
    m_fx_lbl: "Kadar USD / RM",
    m_fx_sub: "Rujukan Bank Negara",
    m_hi_lbl: "Tertinggi hari ini",
    m_lo_lbl: "Terendah hari ini",
    m_op_lbl: "Harga pembukaan",
    per_gram: "per gram",
    alerts_title: "Peringatan harga",
    calculator_title: "Kalkulator Emas",
    calculator_sub: "Tukar antara RM dan gram menggunakan harga semasa RM/g",
    calculator_myr: "Ringgit Malaysia",
    calculator_gram: "Gram emas",
    calculator_input_myr: "Masukkan RM",
    calculator_input_gram: "Masukkan gram",
    calculator_note: "Berdasarkan harga semasa",
    alert_placeholder: "RM / gram",
    alert_above: "↑ Naik melebihi",
    alert_below: "↓ Jatuh di bawah",
    add_btn: "+ Tambah",
    no_alerts: "Tiada amaran ditetapkan. Masukkan harga sasaran di atas.",
    badge_above: "↑ melebihi",
    badge_below: "↓ di bawah",
    badge_hit: "⚡ dicetuskan",
    triggered_msg: (g: string, dir: string, p: string) => 
      `🏅 Amaran: Au999.9 kini RM ${g}/g — ${dir} RM ${p} dicetuskan!`,
    alert_dir_above: "melebihi",
    alert_dir_below: "di bawah",
    toast_live: (v: string, t: string) => `Langsung · Au999.9 RM ${v}/g · ${t}`,
    toast_fetching: "Memuat…",
    toast_err: (m: string) => `⚠ Ralat data: ${m}`,
    invalid_price: "Masukkan harga RM yang sah per gram.",
    waiting: "Menunggu data langsung…",
    footer_data: (a: string, b: string) => `Spot Au: ${a} · USD/MYR: ${b} · Bukan nasihat kewangan.`,
    market_ts: (d: string, t: string) => `Data pasaran: ${d} · Dimuat semula ${t}`,
    modal_title: "Sambung data emas langsung",
    modal_sub: "Kunci API percuma · gold-api.com · 2 minit persediaan",
    modal_step1: "Pergi ke <a href='https://gold-api.com' target='_blank' rel='noopener noreferrer' class='text-[#7A5A10] dark:text-[#E8B84B] hover:underline font-semibold'>gold-api.com</a> → klik <strong>Daftar</strong>. Percuma sepenuhnya, tiada bayaran dikenakan.",
    modal_step2: "Selepas log masuk, kunci API anda dipaparkan di laman utama. <strong>Salin kunci API tersebut.</strong>",
    modal_step3: "Tampal di bawah dan klik <strong>Sambung</strong>. Disimpan dengan selamat di dalam pelayar.",
    modal_placeholder: "Tampal kunci API anda di sini…",
    modal_connect: "Sambung",
    modal_note: "Kunci anda disimpan hanya dalam localStorage pelayar ini — tidak dihantar ke mana-mana kecuali terus ke api.gold-api.com.",
    err_401: "❌ Kunci ditolak (401/403). Salin kunci penuh dari papan pemuka gold-api.com.",
    err_status: (s: number) => `❌ API mengembalikan status ${s}. Cuba lagi sebentar.`,
    err_response: "❌ Respons tidak dijangka. Cuba lagi.",
    err_network: "❌ Ralat rangkaian. Semak sambungan anda.",
    err_ohlc: "⚠ Kunci API ditolak oleh endpoint OHLC. Masukkan semula kunci anda.",
    verifying: "Mengesahkan…",
    guide_title: "Panduan Papan Pemuka",
    guide_sub: "4 bahagian · Klik mana-mana tab untuk melompat",
    tab0: "Harga utama",
    tab1: "Bar metrik",
    tab2: "Amaran",
    tab3: "Formula",
    prev: "Sebelumnya",
    next: "Seterusnya",
    s0_num: "Bahagian 1 daripada 4",
    s0_title: "Harga utama",
    s0_sub: "Nombor terbesar di skrin — semua yang lain adalah konteks untuk angka tunggal ini.",
    c0_0_tag: "Nombor besar",
    c0_0_txt: "Kos 1 gram Au 999.9 tulen sekarang dalam Ringgit. Beli 10g hari ini = RM 5,304.70.",
    c0_1_tag: "Merah = turun hari ini",
    c0_1_txt: "Perbezaan dari harga pembukaan hari ini. Merah = harga turun. Hijau = harga naik.",
    c0_2_tag: "Cap masa",
    c0_2_txt: "Bila data terakhir diambil. Sentiasa sahkan ini sebelum membuat keputusan beli atau jual.",
    c0_3_tag: "Au 999.9",
    c0_3_txt: "Emas pelaburan sahaja — bukan emas perhiasan 916. Digunakan oleh akaun emas Maybank, CIMB dan jongkong emas.",
    s0_formula: "<strong>Peraturan ringkas:</strong> Jika pil <span class='text-[#4CAF72]'>hijau</span>, emas lebih mahal dari pagi tadi. Jika <span class='text-[#E05555]'>merah</span>, ia lebih murah. % memberitahu anda berapa banyak.",
    s1_num: "Bahagian 2 daripada 4",
    s1_title: "Bar metrik",
    s1_sub: "Lima nombor yang memberikan gambaran penuh pasaran hari ini dalam satu pandangan.",
    s1_r0: "<strong>Harga / troy auns</strong> — unit piawai global. 1 troy auns = 31.1035 gram. Angka USD adalah harga antarabangsa mentah sebelum pertukaran mata wang.",
    s1_r1: "<strong>Kadar USD/MYR</strong> — sebab harga emas Malaysia bergerak walaupun emas antarabangsa mendatar. Jika MYR melemah (kadar naik 4.06 → 4.20), harga RM akan naik secara automatik.",
    s1_r2: "<strong>Tertinggi / terendah hari ini</strong> — harga tertinggi dan terendah hari ini. Julat tinggi = volatiliti tinggi. Julat rendah = pasaran tenang.",
    s1_r3: "<strong>Harga buka</strong> — di mana harga pembukaan pasaran bermula hari ini. Semasa melebihi buka = hari hijau. Semasa di bawah buka = hari merah.",
    s2_num: "Bahagian 3 daripada 4",
    s2_title: "Amaran harga",
    s2_sub: "Cara menetapkannya, apa yang dicetuskan, dan tiga strategi praktikal.",
    strat_buy_tag: "Zon beli",
    strat_buy_title: "Tetapkan amaran DI BAWAH harga semasa",
    strat_buy_body: "Emas di RM 530. Anda fikir RM 500 adalah titik masuk yang baik. Tetapkan 'jatuh di bawah RM 500.' Apabila emas jatuh ke paras tersebut, anda dimaklumkan.",
    strat_stop_tag: "Had rugi",
    strat_stop_title: "Tetapkan amaran DI BAWAH harga masuk anda",
    strat_stop_body: "Anda beli pada RM 520. Tetapkan 'jatuh di bawah RM 495.' Jika dicetuskan, anda mengalami kerugian belum direalisasi. Bukan arahan untuk jual — isyarat untuk menilai semula.",
    strat_profit_tag: "Sasaran untung",
    strat_profit_title: "Tetapkan amaran DI ATAS harga masuk anda",
    strat_profit_body: "Anda beli pada RM 510, sasaran RM 560. Tetapkan 'naik melebihi RM 560.' Apabila dicetuskan, sasaran anda tercapai — ambil untung atau biarkan ia berjalan.",
    s2_formula: "Amaran dihantar sebagai <strong>pemberitahuan toast pelayar</strong> dan <strong>pemberitahuan sistem</strong> jika anda membenarkannya. Lencana bertukar kepada <span class='text-[#E8B84B]'>⚡ Dicetuskan</span>.",
    s3_num: "Bahagian 4 daripada 4",
    s3_title: "Formula",
    s3_sub: "Matematik di sebalik setiap nombor — mudah, tetapi memahaminya melindungi anda daripada salah membaca harga.",
    s3_formula_main: "<strong>RM per gram</strong> = ( XAU/USD ÷ 31.1035 ) × USD/MYR<br/><br/>Contoh: ( <code>4,056.27</code> ÷ <code>31.1035</code> ) × <code>4.0645</code> = <strong class='text-[#E8B84B]'>RM 530.47 / gram</strong>",
    s3_r0: "<strong>Spot XAU/USD</strong> — harga emas antarabangsa dalam USD per troy auns. Ditetapkan oleh LBMA (London) dan COMEX (New York). Rujukan global untuk setiap produk emas.",
    s3_r1: "<strong>÷ 31.1035</strong> — menukarkan troy auns kepada gram. Satu troy auns sentiasa bersamaan 31.1035 gram. Pemalar ini tidak pernah berubah.",
    s3_r2: "<strong>× Kadar USD/MYR</strong> — menukarkan USD kepada Ringgit. Ini adalah pembolehubah yang menggerakkan harga emas MYR walaupun pada hari emas antarabangsa yang tenang.",
    s3_sc_a_tag: "Senario A — MYR melemah",
    s3_sc_a_txt: "Emas mendatar pada $4,056. USD/MYR naik 4.06 → 4.20. Harga RM anda naik RM 530 → RM 548/g. Ringgit yang lemah menjadikan emas lebih mahal.",
    s3_sc_b_tag: "Senario B — MYR menguat",
    s3_sc_b_txt: "Emas naik ke $4,200 tetapi USD/MYR turun ke 3.90. Kesan sebahagiannya terbatal. Keuntungan MYR anda lebih kecil daripada yang dicadangkan oleh keuntungan USD.",
    s3_formula_rule: "<strong>Peraturan praktikal:</strong> Sentiasa semak XAU/USD <em>dan</em> kadar USD/MYR. Harga emas MYR yang 'naik' mungkin sepenuhnya disebabkan oleh Ringgit yang lemah — bukan permintaan emas.",
    ch_title: "Julat 30 Hari · Tertinggi · Purata · Terendah Harian · RM/gram",
    ch_load_btn: "Muatkan carta",
    ch_status_idle: "Klik 'Muatkan carta' untuk mengambil 30 hari data sebenar",
    ch_loading: "Mengambil sejarah 30 hari (3 panggilan API)…",
    ch_ok: (n: number, r: string) => `${n} hari dimuatkan · USD/RM ${r}`,
    ch_err: (m: string) => `⚠ ${m}`,
    ch_rate_limit: "Had kadar terpukul — percuma hanya 10 amaran/jam. Tunggu beberapa minit.",
    ch_auth_fail: "Kunci ditolak pada endpoint history. Masukkan kunci API anda.",
    ch_leg_hi: "Tertinggi harian",
    ch_leg_lo: "Terendah harian",
    ch_leg_avg: "Purata harian · garis aliran",
    ch_leg_band: "Julat harian (Jalur Tinggi–Rendah)",
    ch_leg_today: "Hari ini",
    ch_zoom_hint: "Skrol untuk zum · Seret untuk menggerak",
  }
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function GoldMonitor() {
  // Locale States
  const [lang, setLang] = useState<"en" | "bm">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Notification Toast & Modals
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keyInputVal, setKeyInputVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sbCurTab, setSbCurTab] = useState(0);

  // Core Market Data
  const [market, setMarket] = useState({
    xau_usd: 0,
    usd_myr: 4.47,
    open_usd: 0,
    high_usd: 0,
    low_usd: 0,
    date: "—",
    goldUpdatedAt: null as string | null,
    fxUpdatedAt: null as string | null
  });

  const [pricesGram, setPricesGram] = useState({
    gram: 0,
    open_g: 0,
    high_g: 0,
    low_g: 0,
    chg: 0,
    chgPct: 0
  });

  const [loading, setLoading] = useState(false);

  // Price Alerts
  const [alerts, setAlerts] = useState<Array<{ id: number; price: number; dir: string; triggered: boolean }>>([]);
  const [alertPriceInput, setAlertPriceInput] = useState("");
  const [alertDirInput, setAlertDirInput] = useState("above");

  // Conversion Calculator
  const [calculator, setCalculator] = useState({ myr: "", gram: "" });

  // Chart States (Client side dynamically imported ChartJS)
  const [chartReady, setChartReady] = useState(false);
  const [chartLoading, setChLoading] = useState(false);
  const [chartStatus, setChStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [chartStatusText, setChStatusText] = useState("");
  const [chart30dStat, setCh30dStat] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  // Helper translations lookup
  const t = (key: string) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] || key);
  };

  // Toast triggers
  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
  };

  // Persist alerts to localStorage whenever they change
  const updateAlertsPersisted = (updatedAlerts: typeof alerts) => {
    setAlerts(updatedAlerts);
    localStorage.setItem("au999_alerts", JSON.stringify(updatedAlerts));
  };

  // Check alerts against current pricing
  function checkAlerts(currentGramVal: number) {
    evaluateSpecificAlerts(alerts, currentGramVal);
  }

  function evaluateSpecificAlerts(alertsArr: typeof alerts, currentGramVal: number) {
    if (currentGramVal <= 0) return;
    let changed = false;
    const updated = alertsArr.map(a => {
      const hit = (a.dir === "above" && currentGramVal >= a.price) || (a.dir === "below" && currentGramVal <= a.price);
      if (hit && !a.triggered) {
        changed = true;
        const dirString = a.dir === "above" ? t("alert_dir_above") : t("alert_dir_below");
        const msg = t("triggered_msg")(currentGramVal.toFixed(2), dirString, a.price.toFixed(2));
        triggerToast(msg);

        // System notification dispatch
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Au 999.9 Gold Monitor", { body: msg });
          } catch (err) {
            console.error(err);
          }
        }
        return { ...a, triggered: true };
      }
      return a;
    });

    if (changed) {
      updateAlertsPersisted(updated);
    }
  }

  // Real-time gold spot price, BN FX Rate, and OHLC calculations
  async function fetchLiveData() {
    const key = localStorage.getItem(STORAGE_KEY);
    if (!key) {
      setKeyModalOpen(true);
      return;
    }
    setLoading(true);

    try {
      const nowTs = getNowTs();
      const [priceRes, fxRes, ohlcRes] = await Promise.all([
        fetch(`${GOLD_API}/price/XAU`),
        fetch(FX_API),
        fetch(`${GOLD_API}/ohlc/XAU?startTimestamp=${nowTs - 86400}&endTimestamp=${nowTs}`, {
          headers: { "x-api-key": key }
        })
      ]);

      if (!priceRes.ok) throw new Error(`/price/XAU returns HTTP status ${priceRes.status}`);
      const priceData = await priceRes.json();
      const xauUsd = parseFloat(priceData.price);
      if (!xauUsd || isNaN(xauUsd)) throw new Error("Invalid price return");

      let usdMyr = 4.47;
      let fxUpdatedAt = null;
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData.result === "success" && typeof fxData.rates.MYR === "number") {
          usdMyr = fxData.rates.MYR;
          fxUpdatedAt = fxData.time_last_update_utc || null;
        }
      }

      let openUsd = xauUsd;
      let highUsd = xauUsd * 1.005;
      let lowUsd = xauUsd * 0.995;

      if (ohlcRes.ok) {
        const ohlc = await ohlcRes.json();
        if (typeof ohlc.open === "number") openUsd = ohlc.open;
        if (typeof ohlc.high === "number") highUsd = ohlc.high;
        if (typeof ohlc.low === "number") lowUsd = ohlc.low;
      } else if (ohlcRes.status === 401 || ohlcRes.status === 403) {
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
        setKeyModalOpen(true);
        setKeyError(t("err_ohlc"));
        return;
      }

      const m = {
        xau_usd: parseFloat(xauUsd.toFixed(2)),
        usd_myr: parseFloat(usdMyr.toFixed(4)),
        open_usd: parseFloat(openUsd.toFixed(2)),
        high_usd: parseFloat(highUsd.toFixed(2)),
        low_usd: parseFloat(lowUsd.toFixed(2)),
        date: new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
        goldUpdatedAt: priceData.updatedAt || null,
        fxUpdatedAt
      };

      setMarket(m);

      // Calculations per gram
      const r = m.usd_myr;
      const gram = (m.xau_usd * r) / TROY;
      const open_g = (m.open_usd * r) / TROY;
      const high_g = (m.high_usd * r) / TROY;
      const low_g = (m.low_usd * r) / TROY;
      const chg = gram - open_g;
      const chgPct = (chg / open_g) * 100;

      const calcState = {
        gram,
        open_g,
        high_g,
        low_g,
        chg,
        chgPct
      };

      setPricesGram(calcState);
      setLoading(false);
      triggerToast(t("toast_live")(gram.toFixed(2), new Date().toLocaleTimeString("en-MY")));

      // Evaluate alerts with the new prices state
      checkAlerts(gram);

    } catch (err: any) {
      setLoading(false);
      triggerToast(t("toast_err")(err.message));
      console.error(err);
    }
  }

  // Local persistence, alerts system & hydration safe settings loaded strictly on mount
  useEffect(() => {
    // Config loading deferred to prevent cascading renders warning
    setTimeout(() => {
      // 1. Theme Configuration
      const savedTheme = localStorage.getItem("au999_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        setTheme("light");
      }

      // 2. Language Configuration
      const savedLang = localStorage.getItem("au999_lang") as "en" | "bm" | null;
      if (savedLang) setLang(savedLang);

      // 3. Saved Alerts Load
      try {
        const savedAlerts = localStorage.getItem("au999_alerts");
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts));
        }
      } catch (e) {
        console.error(e);
      }

      // 4. Pre-seed default API key if none stored, then fetch
      if (!localStorage.getItem(STORAGE_KEY) && DEFAULT_API_KEY) {
        localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
      }
      const key = localStorage.getItem(STORAGE_KEY);
      if (!key) {
        setKeyModalOpen(true);
      } else {
        fetchLiveData();
      }
    }, 0);

    // 5. Request Notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Language & Theme Toggle Actions
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("au999_theme", nextTheme);
  };

  const changeLanguage = (langCode: "en" | "bm") => {
    setLang(langCode);
    localStorage.setItem("au999_lang", langCode);
  };

  // API Key Submission Action
  const submitApiKey = async () => {
    const key = keyInputVal.trim();
    if (!key) {
      setKeyError(t("invalid_price"));
      return;
    }
    setKeyError("");
    const submitBtn = document.getElementById("auth-connect-btn");
    if (submitBtn) submitBtn.textContent = t("verifying");

    const now = getNowTs();
    const url = `${GOLD_API}/ohlc/XAU?startTimestamp=${now - 86400}&endTimestamp=${now}`;

    try {
      const r = await fetch(url, { headers: { "x-api-key": key } });
      if (r.status === 401 || r.status === 403) {
        setKeyError(t("err_401"));
        if (submitBtn) submitBtn.textContent = t("modal_connect");
        return;
      }
      if (r.status === 429) {
        localStorage.setItem(STORAGE_KEY, key);
        setKeyModalOpen(false);
        setKeyInputVal("");
        fetchLiveData();
        return;
      }
      if (!r.ok) {
        setKeyError(t("err_status")(r.status));
        if (submitBtn) submitBtn.textContent = t("modal_connect");
        return;
      }
      const data = await r.json();
      if (typeof data.open !== "number" && typeof data.high !== "number") {
        setKeyError(t("err_response"));
        if (submitBtn) submitBtn.textContent = t("modal_connect");
        return;
      }

      localStorage.setItem(STORAGE_KEY, key);
      setKeyModalOpen(false);
      setKeyInputVal("");
      fetchLiveData();
    } catch (e) {
      setKeyError(t("err_network"));
      if (submitBtn) submitBtn.textContent = t("modal_connect");
    }
  };

  // Add Alert Trigger
  const handleAddAlert = () => {
    const p = parseFloat(alertPriceInput);
    if (isNaN(p) || p <= 0) {
      triggerToast(t("invalid_price"));
      return;
    }
    const newAlerts = [...alerts, { id: getNowMs(), price: p, dir: alertDirInput, triggered: false }];
    updateAlertsPersisted(newAlerts);
    setAlertPriceInput("");
    evaluateSpecificAlerts(newAlerts, pricesGram.gram);
  };

  const handleRemoveAlert = (id: number) => {
    const filtered = alerts.filter(a => a.id !== id);
    updateAlertsPersisted(filtered);
  };

  const handleCalculatorChange = (field: "myr" | "gram", rawValue: string) => {
    const pricePerGram = pricesGram.gram;
    const value = rawValue.replace(/,/g, "");
    const parsed = parseFloat(value);

    if (!value || isNaN(parsed) || pricePerGram <= 0) {
      setCalculator(prev => ({ ...prev, [field]: rawValue, [field === "myr" ? "gram" : "myr"]: "" }));
      return;
    }

    if (field === "myr") {
      const grams = parsed / pricePerGram;
      setCalculator({ myr: rawValue, gram: grams.toFixed(4) });
    } else {
      const myr = parsed * pricePerGram;
      setCalculator({ gram: rawValue, myr: myr.toFixed(2) });
    }
  };

  const resetCalculator = () => {
    setCalculator({ myr: "", gram: "" });
  };

  // Removed duplicate alert checking functions (repositioned to top under state definitions)

  /* ════════════════════════════════════════════════
     HISTORY CHART LOGIC
     Dynamically imports ChartJS directly inside browser
  ════════════════════════════════════════════════ */
  const chZoomIn = () => {
    if (chartInstanceRef.current) chartInstanceRef.current.zoom(1.25);
  };

  const chZoomOut = () => {
    if (chartInstanceRef.current) chartInstanceRef.current.zoom(0.8);
  };

  const chResetZoom = () => {
    if (chartInstanceRef.current) chartInstanceRef.current.resetZoom();
  };

  const loadChartData = async () => {
    const key = localStorage.getItem(STORAGE_KEY);
    if (!key) {
      setKeyModalOpen(true);
      setKeyError("API key is required to load interactive index chart.");
      return;
    }

    setChLoading(true);
    setChStatus("loading");
    setChStatusText(t("ch_loading"));

    let latestUsdMyr = market.usd_myr || 4.47;

    try {
      // 1. Fetch BN USD/MYR exchange rate if not loaded
      if (latestUsdMyr === 4.47) {
        const fxRes = await fetch(FX_API);
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          if (fxData.result === "success" && typeof fxData.rates.MYR === "number") {
            latestUsdMyr = fxData.rates.MYR;
          }
        }
      }

      // 2. Fetch Aggregated Daily History Bounds
      const nowTs = getNowTs();
      const startTs = nowTs - (30 * 86400);
      const baseApi = `${GOLD_API}/history?symbol=XAU&startTimestamp=${startTs}&endTimestamp=${nowTs}&groupBy=day`;
      const hdrs = { "x-api-key": key };

      const [maxRes, minRes, avgRes] = await Promise.all([
        fetch(baseApi + "&aggregation=max", { headers: hdrs }),
        fetch(baseApi + "&aggregation=min", { headers: hdrs }),
        fetch(baseApi + "&aggregation=avg", { headers: hdrs })
      ]);

      // Exception Validation checks
      for (const [lbl, res] of [["max", maxRes], ["min", minRes], ["avg", avgRes]] as const) {
        if (res.status === 401 || res.status === 403) {
          setChLoading(false);
          setChStatus("err");
          setChStatusText(t("ch_auth_fail"));
          setKeyModalOpen(true);
          setKeyError(t("ch_auth_fail"));
          return;
        }
        if (res.status === 429) {
          setChLoading(false);
          setChStatus("err");
          setChStatusText(t("ch_rate_limit"));
          triggerToast(t("ch_rate_limit"));
          return;
        }
        if (!res.ok) {
          throw new Error(`Data aggregator ${lbl} returned HTTP ${res.status}`);
        }
      }

      const maxArr = await maxRes.json();
      const minArr = await minRes.json();
      const avgArr = await avgRes.json();

      const normalizedDays = mergeParsedDays(maxArr, minArr, avgArr, latestUsdMyr);
      if (!normalizedDays.length) {
        throw new Error("No historical coordinates parsed. Check credentials.");
      }

      // Load Chart modules dynamically to support NextJS standalone build with code splitting
      await chInitializeAndPlot(normalizedDays, latestUsdMyr);

    } catch (err: any) {
      setChLoading(false);
      setChStatus("err");
      setChStatusText(t("ch_err")(err.message));
      console.error(err);
    }
  };

  const mergeParsedDays = (maxArr: any[], minArr: any[], avgArr: any[], usdMyr: number) => {
    const getKeys = (arr: any[], label: string) => {
      if (!Array.isArray(arr) || !arr.length) throw new Error(`Empty coordinate table on ${label}`);
      const head = arr[0];
      const dateKey = ["day", "date", "period", "month", "week", "year"].find(k => head[k] !== undefined);
      const priceKey = Object.keys(head).find(k => k.toLowerCase().includes("price"));
      if (!dateKey || !priceKey) {
        throw new Error(`Invalid table schema from ${label}.`);
      }
      return { dateKey, priceKey };
    };

    const toDateStr = (val: any) => {
      if (val == null) return null;
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
      const num = typeof val === "number" ? val : parseInt(val, 10);
      if (!isNaN(num) && num > 1000000000) {
        const d = new Date(num * 1000);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      }
      if (typeof val === "string") {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        }
      }
      return String(val);
    };

    const mk = getKeys(maxArr, "max");
    const nk = getKeys(minArr, "min");
    const ak = getKeys(avgArr, "avg");

    const maxMap: Record<string, number> = {};
    const minMap: Record<string, number> = {};
    const avgMap: Record<string, number> = {};

    maxArr.forEach(r => { const key = toDateStr(r[mk.dateKey]); if (key) maxMap[key] = parseFloat(r[mk.priceKey]); });
    minArr.forEach(r => { const key = toDateStr(r[nk.dateKey]); if (key) minMap[key] = parseFloat(r[nk.priceKey]); });
    avgArr.forEach(r => { const key = toDateStr(r[ak.dateKey]); if (key) avgMap[key] = parseFloat(r[ak.priceKey]); });

    const mergedDates = [...new Set([...Object.keys(maxMap), ...Object.keys(minMap), ...Object.keys(avgMap)])].sort();

    return mergedDates.map(date => ({
      date,
      hiMyr: maxMap[date] != null ? +((maxMap[date] * usdMyr) / TROY).toFixed(2) : null,
      loMyr: minMap[date] != null ? +((minMap[date] * usdMyr) / TROY).toFixed(2) : null,
      avgMyr: avgMap[date] != null ? +((avgMap[date] * usdMyr) / TROY).toFixed(2) : null
    })).filter(d => d.hiMyr || d.loMyr || d.avgMyr);
  };

  const chFmtShort = (str: string) => {
    try {
      return new Date(str + "T12:00:00Z").toLocaleDateString("en-MY", { day: "numeric", month: "short" });
    } catch (e) {
      return str;
    }
  };

  const chFmtFull = (str: string) => {
    try {
      return new Date(str + "T12:00:00Z").toLocaleDateString(lang === "bm" ? "ms-MY" : "en-MY", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return str;
    }
  };

  const chInitializeAndPlot = async (days: any[], usdMyr: number) => {
    // 1. Dynamic Chart.js Modules registration inside client-side thread
    const {
      Chart,
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Tooltip,
      Filler,
    } = await import("chart.js");
    
    const zoomPlugin = (await import("chartjs-plugin-zoom")).default;

    Chart.register(
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Tooltip,
      Filler,
      zoomPlugin
    );

    setChartReady(true);

    // 2. Compute first-to-last 30D percentage metrics
    const onlyAvg = days.filter(d => d.avgMyr != null);
    if (onlyAvg.length >= 2) {
      const first = onlyAvg[0].avgMyr;
      const last = onlyAvg[onlyAvg.length - 1].avgMyr;
      const pct = ((last - first) / first) * 100;
      const sgn = pct >= 0 ? "+" : "";
      setCh30dStat(`${sgn}${pct.toFixed(2)}% (30D)`);
    }

    const labels = days.map(d => chFmtShort(d.date));
    const lastIdx = days.length - 1;

    // Interactive vectors point arrays mapping
    const avgPointRadius = days.map((_, i) => (i === lastIdx ? 6 : 2));
    const avgPointBg = days.map((_, i) => (i === lastIdx ? "#E8B84B" : "#C9972A"));
    const avgPointBorder = days.map((_, i) => (i === lastIdx ? (theme === "dark" ? "#E8E4D8" : "#1A1814") : "#C9972A"));
    const avgPointBorderW = days.map((_, i) => (i === lastIdx ? 2 : 0));

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!canvasRef.current) return;

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t("ch_leg_hi"),
            data: days.map(d => d.hiMyr),
            borderColor: "rgba(201,151,42,0.25)",
            backgroundColor: "rgba(201,151,42,0.10)",
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0.3,
            fill: "+1", // Fill Area directly pointing down to low boundary index
            order: 3
          },
          {
            label: t("ch_leg_lo"),
            data: days.map(d => d.loMyr),
            borderColor: "rgba(201,151,42,0.25)",
            backgroundColor: "transparent",
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0.3,
            fill: false,
            order: 3
          },
          {
            label: t("ch_leg_avg"),
            data: days.map(d => d.avgMyr),
            borderColor: "#C9972A",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: avgPointRadius,
            pointBackgroundColor: avgPointBg,
            pointBorderColor: avgPointBorder,
            pointBorderWidth: avgPointBorderW,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme === "dark" ? "#1A1A16" : "#FFFFFF",
            borderColor: "rgba(201,151,42,0.3)",
            borderWidth: 1,
            titleColor: theme === "dark" ? "#7A7568" : "#6B6455",
            bodyColor: theme === "dark" ? "#E8E4D8" : "#1A1814",
            padding: 12,
            callbacks: {
              title: (ctx) => {
                const day = days[ctx[0].dataIndex];
                const active = ctx[0].dataIndex === lastIdx;
                return (day ? chFmtFull(day.date) : ctx[0].label) + (active ? "  ◀ today" : "");
              },
              label: (ctx) => {
                const d = days[ctx.dataIndex];
                if (!d) return "";
                if (ctx.datasetIndex === 0) return `  High : RM ${d.hiMyr?.toFixed(2) ?? "—"}/g`;
                if (ctx.datasetIndex === 1) return `  Low  : RM ${d.loMyr?.toFixed(2) ?? "—"}/g`;
                if (ctx.datasetIndex === 2) return `  Avg  : RM ${d.avgMyr?.toFixed(2) ?? "—"}/g`;
                return "";
              },
              afterBody: (ctx) => {
                const d = days[ctx[0].dataIndex];
                if (d?.hiMyr && d?.loMyr) {
                  const range = (d.hiMyr - d.loMyr).toFixed(2);
                  const rangePct = (((d.hiMyr - d.loMyr) / d.loMyr) * 100).toFixed(2);
                  return [`  Range: RM ${range}  (${rangePct}%)`];
                }
                return [];
              }
            }
          },
          zoom: {
            pan: { enabled: true, mode: "x" },
            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
            limits: { x: { minRange: 5 } }
          }
        },
        scales: {
          x: {
            ticks: {
              color: theme === "dark" ? "#7A7568" : "#6B6455",
              font: { size: 10 },
              maxTicksLimit: 14,
              autoSkip: true
            },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: theme === "dark" ? "#7A7568" : "#6B6455",
              font: { size: 10 },
              callback: (v: any) => "RM " + Number(v).toFixed(0)
            },
            grid: { color: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }
          }
        }
      }
    });

    setChStatus("ok");
    setChStatusText(t("ch_ok")(days.length, usdMyr.toFixed(4)));
    setChLoading(false);
  };

  // Guide sidebar tab navigations
  const handleSbTabSelect = (idx: number) => {
    setSbCurTab(idx);
  };

  const handleSbPrev = () => {
    if (sbCurTab > 0) handleSbTabSelect(sbCurTab - 1);
  };

  const handleSbNext = () => {
    if (sbCurTab < 3) handleSbTabSelect(sbCurTab + 1);
  };

  const openGuide = (idx: number) => {
    setSidebarOpen(true);
    setSbCurTab(idx);
  };

  const closeGuide = () => {
    setSidebarOpen(false);
  };

  // Safe color styles map corresponding back to native dark / light theme configuration
  const css = {
    bgVault: theme === "dark" ? "bg-[#0D0D0B]" : "bg-[#F5F2EB]",
    bgSurface: theme === "dark" ? "bg-[#131310]" : "bg-[#FFFFFF]",
    bgPanel: theme === "dark" ? "bg-[#1A1A16]" : "bg-[#F0EDE4]",
    borderMain: theme === "dark" ? "border-[rgba(201,151,42,0.12)]" : "border-[rgba(150,100,20,0.15)]",
    borderAlt: theme === "dark" ? "border-[rgba(201,151,42,0.22)]" : "border-[rgba(150,100,20,0.28)]",
    textPrimary: theme === "dark" ? "text-[#E8E4D8]" : "text-[#1A1814]",
    textMuted: theme === "dark" ? "text-[#7A7568]" : "text-[#6B6455]",
    textDim: theme === "dark" ? "text-[#3A3830]" : "text-[#C8C0B0]",
    borderDim: theme === "dark" ? "border-[#3A3830]" : "border-[#C8C0B0]",
    toastBg: theme === "dark" ? "bg-[#1A1A16]" : "bg-[#FEFCF6]",
    cardInputBg: theme === "dark" ? "bg-[#1D1D18]" : "bg-[#FEFCF6]",
    pillGreen: theme === "dark" ? "bg-[rgba(76,175,114,0.1)] text-[#4CAF72] border-[rgba(76,175,114,0.2)]" : "bg-[rgba(46,125,79,0.1)] text-[#2E7D4F] border-[rgba(46,125,79,0.2)]",
    pillRed: theme === "dark" ? "bg-[rgba(224,85,85,0.1)] text-[#E05555] border-[rgba(224,85,85,0.2)]" : "bg-[rgba(192,57,43,0.1)] text-[#C0392B] border-[rgba(192,57,43,0.2)]",
    textUp: theme === "dark" ? "text-[#4CAF72]" : "text-[#2E7D4F]",
    textDn: theme === "dark" ? "text-[#E05555]" : "text-[#C0392B]"
  };

  return (
    <div className={`min-height-screen w-full transition-colors duration-300 py-8 px-4 sm:px-6 md:px-8 ${css.bgVault} ${css.textPrimary}`}>
      <div className="max-w-[1100px] mx-auto min-h-screen flex flex-col justify-between" id="page">
        
        {/* HEADER PANEL */}
        <header className={`flex items-start justify-between pb-6 border-b-[0.5px] ${css.borderMain} flex-wrap gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className="w-[44px] h-[44px] rounded-lg bg-[#C9972A] flex items-center justify-center flex-shrink-0 shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-[22px] height-[22px]">
                <polygon points="12,2 3,7 12,12 21,7" fill="#3D2A00" stroke="#C9972A" strokeWidth="1" strokeLinejoin="round"/>
                <polygon points="3,7 3,17 12,22 12,12" fill="#1A1200" stroke="#C9972A" strokeWidth="1" strokeLinejoin="round"/>
                <polygon points="21,7 21,17 12,22 12,12" fill="#2A1C00" stroke="#C9972A" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-[family:var(--font-barlow)] text-2xl font-bold tracking-wide leading-none">{t("brand_title")}</h1>
              <p className={`text-[11px] font-medium tracking-widest uppercase mt-1 ${css.textMuted}`}>{t("brand_sub")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm">
            {/* Live Indicator Pill */}
            <div className={`flex items-center gap-2 px-3 py-1 border-[0.5px] rounded-full text-[11px] font-semibold tracking-wider uppercase text-[#C9972A] ${css.borderAlt}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF72] animate-pulse"></span>
              <span>{t("live")}</span>
            </div>

            {/* Language Switcher */}
            <div className={`flex items-center gap-1 border-[0.5px] rounded-lg p-1 ${css.bgPanel} ${css.borderDim}`}>
              <button 
                onClick={() => changeLanguage("en")} 
                className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide transition-all ${lang === "en" ? "bg-[#C9972A] text-[#0D0D0B]" : css.textMuted}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage("bm")} 
                className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide transition-all ${lang === "bm" ? "bg-[#C9972A] text-[#0D0D0B]" : css.textMuted}`}
              >
                BM
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className={`flex items-center gap-1.5 px-3 py-1.5 border-[0.5px] ${css.borderDim} rounded-md ${css.textMuted} hover:text-[#E8B84B] transition-colors`}
              aria-label="Toggle visual theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold whitespace-nowrap">{t("theme_light")}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold whitespace-nowrap">{t("theme_dark")}</span>
                </>
              )}
            </button>

            {/* Help/Guide Selector Button */}
            <button 
              onClick={() => openGuide(0)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 border-[0.5px] border-[rgba(201,151,42,0.35)] rounded-md text-[#C9972A] hover:bg-[rgba(201,151,42,0.08)] hover:text-[#E8B84B] transition-all`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold whitespace-nowrap">{t("how_to_read")}</span>
            </button>

            {/* API settings */}
            <button 
              onClick={() => { setKeyModalOpen(true); setKeyError(""); }} 
              className={`flex items-center gap-1.5 px-3 py-1.5 border-[0.5px] ${css.borderDim} rounded-md ${css.textMuted} hover:text-[#E8B84B] hover:border-[#C9972A] transition-colors`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold whitespace-nowrap">{t("api_key")}</span>
            </button>

            {/* Refresh live prices */}
            <button 
              onClick={fetchLiveData} 
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-[0.5px] ${css.borderDim} rounded-md ${css.textMuted} hover:text-[#E8B84B] hover:border-[#C9972A] transition-colors focus:outline-none`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="text-[11px] font-semibold whitespace-nowrap">{loading ? t("toast_fetching") : t("refresh")}</span>
            </button>
          </div>
        </header>

        {/* HERO DISPLAY INDEX SECTION */}
        <section className="text-center py-10 px-4">
          <p className={`text-[11px] tracking-[0.12em] uppercase font-semibold ${css.textMuted} mb-3.5`}>
            {t("hero_eyebrow")}
          </p>
          <div className="font-[family:var(--font-barlow)] font-bold tracking-tighter text-[72px] sm:text-[96px] md:text-[110px] lg:text-[120px] leading-none select-all relative inline-block">
            {/* Shimmer gradient metallic text effect */}
            <span className="bg-gradient-to-r from-[#8A6418] via-[#E8B84B] md:via-[#F1D28C] to-[#C9972A] bg-[length:300%_300%] bg-clip-text text-transparent animate-[shimmer_5s_ease_infinite]">
              {pricesGram.gram > 0 ? pricesGram.gram.toFixed(2) : "—"}
            </span>
          </div>
          <p className="font-[family:var(--font-barlow)] text-xl font-light text-[#C9972A] tracking-[0.08em] mt-1 select-none">
            {t("hero_unit")}
          </p>
          
          <div className="mt-4">
            {pricesGram.gram > 0 ? (
              <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border ${pricesGram.chg >= 0 ? css.pillGreen : css.pillRed}`}>
                {pricesGram.chg >= 0 ? "+" : ""}
                {pricesGram.chg.toFixed(2)} ({pricesGram.chgPct >= 0 ? "+" : ""}
                {pricesGram.chgPct.toFixed(2)}%) {t("today_change")}
              </span>
            ) : (
              <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border ${css.borderDim} ${css.textMuted}`}>
                —
              </span>
            )}
          </div>

          <p className={`text-[11px] ${css.textMuted} mt-3`}>
            {pricesGram.gram > 0 ? t("market_ts")(market.date, new Date().toLocaleTimeString("en-MY")) : "—"}
          </p>
        </section>

        {/* FIVE-KEY METRICS STRIP CARD-GRID */}
        <section className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px ${css.bgPanel} border-[0.5px] ${css.borderMain} rounded-xl overflow-hidden mb-6`}>
          {/* Price per troy oz */}
          <div className={`${css.bgSurface} p-4 flex flex-col justify-between`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${css.textMuted} mb-1.5`}>{t("m_oz_lbl")}</span>
            <div className="font-[family:var(--font-barlow)] text-2xl font-bold tracking-tight leading-none text-white dark:text-inherit">
              {market.xau_usd > 0 ? `RM ${(market.xau_usd * market.usd_myr).toLocaleString("en-MY", { maximumFractionDigits: 0 })}` : "—"}
            </div>
            <span className={`text-[11px] ${css.textMuted} mt-1`}>
              {market.xau_usd > 0 ? `USD ${market.xau_usd.toFixed(2)} / oz` : "—"}
            </span>
          </div>

          {/* USD/MYR rate */}
          <div className={`${css.bgSurface} p-4 flex flex-col justify-between`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${css.textMuted} mb-1.5`}>{t("m_fx_lbl")}</span>
            <div className="font-[family:var(--font-barlow)] text-2xl font-bold tracking-tight leading-none text-white dark:text-inherit">
              {market.usd_myr > 0 ? market.usd_myr.toFixed(4) : "—"}
            </div>
            <span className={`text-[11px] ${css.textMuted} mt-1`}>{t("m_fx_sub")}</span>
          </div>

          {/* Intraday High */}
          <div className={`${css.bgSurface} p-4 flex flex-col justify-between`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${css.textMuted} mb-1.5`}>{t("m_hi_lbl")}</span>
            <div className={`font-[family:var(--font-barlow)] text-2xl font-bold tracking-tight leading-none ${css.textUp}`}>
              {pricesGram.high_g > 0 ? `RM ${pricesGram.high_g.toFixed(2)}` : "—"}
            </div>
            <span className={`text-[11px] ${css.textMuted} mt-1`}>{t("per_gram")}</span>
          </div>

          {/* Intraday Low */}
          <div className={`${css.bgSurface} p-4 flex flex-col justify-between`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${css.textMuted} mb-1.5`}>{t("m_lo_lbl")}</span>
            <div className={`font-[family:var(--font-barlow)] text-2xl font-bold tracking-tight leading-none ${css.textDn}`}>
              {pricesGram.low_g > 0 ? `RM ${pricesGram.low_g.toFixed(2)}` : "—"}
            </div>
            <span className={`text-[11px] ${css.textMuted} mt-1`}>{t("per_gram")}</span>
          </div>

          {/* Day Open */}
          <div className={`${css.bgSurface} p-4 flex flex-col justify-between col-span-2 sm:col-span-1`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${css.textMuted} mb-1.5`}>{t("m_op_lbl")}</span>
            <div className="font-[family:var(--font-barlow)] text-2xl font-bold tracking-tight leading-none text-white dark:text-inherit">
              {pricesGram.open_g > 0 ? `RM ${pricesGram.open_g.toFixed(2)}` : "—"}
            </div>
            <span className={`text-[11px] ${css.textMuted} mt-1`}>{t("per_gram")}</span>
          </div>
        </section>

        {/* CONVERSION / COST CALCULATOR */}
        <section className={`border-[0.5px] ${css.borderMain} ${css.bgSurface} rounded-xl p-5 mb-6 shadow-md`}>
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(201,151,42,0.06)] flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#C9972A]" />
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${css.textMuted}`}>{t("calculator_title")}</p>
                <p className={`text-[11px] ${css.textMuted}`}>{t("calculator_sub")}</p>
              </div>
            </div>
            <span className={`text-[11px] ${css.textMuted}`}>{t("calculator_note")}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-5">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#6B6455]">{t("calculator_myr")}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={calculator.myr}
                onChange={(e) => handleCalculatorChange("myr", e.target.value)}
                placeholder={t("calculator_input_myr")}
                className={`w-full border ${css.borderDim} rounded-md px-3 py-2 text-sm ${css.cardInputBg} focus:outline-none focus:border-[#C9972A]`}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#6B6455]">{t("calculator_gram")}</span>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={calculator.gram}
                onChange={(e) => handleCalculatorChange("gram", e.target.value)}
                placeholder={t("calculator_input_gram")}
                className={`w-full border ${css.borderDim} rounded-md px-3 py-2 text-sm ${css.cardInputBg} focus:outline-none focus:border-[#C9972A]`}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-[11px] ${css.textMuted}`}>RM per gram: {pricesGram.gram > 0 ? pricesGram.gram.toFixed(2) : "—"}</p>
            <button
              onClick={resetCalculator}
              className="px-3 py-2 rounded-md border border-[rgba(201,151,42,0.18)] text-[11px] font-semibold text-[#C9972A] hover:bg-[rgba(201,151,42,0.08)] transition-colors"
            >
              Reset
            </button>
          </div>
        </section>

        {/* ════ HISTORICAL RANGE CHART PANEL ════ */}
        <section className={`border-[0.5px] ${css.borderMain} ${css.bgSurface} rounded-xl p-5 mb-6 shadow-md`}>
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(201,151,42,0.06)] flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C9972A]" />
              <span className={`text-[10px] uppercase font-bold tracking-widest ${css.textMuted}`}>
                {t("ch_title")}
              </span>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  chartStatus === "ok" ? "bg-[#4CAF72]" : 
                  chartStatus === "err" ? "bg-[#E05555]" : 
                  chartStatus === "loading" ? "bg-[#E8B84B] animate-pulse" : "bg-[#3A3830]"
                }`}></span>
                <span className={`text-xs ${css.textMuted}`}>
                  {chartStatus === "idle" ? t("ch_status_idle") : chartStatusText}
                </span>
              </div>

              {chartReady && chartStatus === "ok" && (
                <div className="flex items-center gap-1.5">
                  <button onClick={chZoomIn} className={`w-7 h-7 text-xs font-bold border ${css.borderDim} rounded flex items-center justify-center hover:text-[#E8B84B] hover:border-[#C9972A] transition-colors bg-transparent`} title="Zoom in">+</button>
                  <button onClick={chZoomOut} className={`w-7 h-7 text-xs font-bold border ${css.borderDim} rounded flex items-center justify-center hover:text-[#E8B84B] hover:border-[#C9972A] transition-colors bg-transparent`} title="Zoom out">−</button>
                  <button onClick={chResetZoom} className={`text-[10px] px-2 h-7 font-bold border ${css.borderDim} rounded flex items-center justify-center hover:text-[#E8B84B] hover:border-[#C9972A] transition-colors uppercase tracking-wider bg-transparent`}>Reset</button>
                </div>
              )}

              <button 
                onClick={loadChartData} 
                disabled={chartLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#C9972A] text-[#0D0D0B] font-bold text-xs rounded shadow-md hover:bg-[#E8B84B] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${chartLoading ? "animate-spin" : ""}`} />
                <span>{chartLoading ? "…" : t("ch_load_btn")}</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas Stage */}
          <div className="relative w-full h-[340px] pt-4">
            <canvas ref={canvasRef} role="img" aria-label="30-day index limits performance visualizer"></canvas>
          </div>

          {/* Legend strip info indicators */}
          <div className={`flex items-center justify-between flex-wrap gap-4 pt-4 mt-4 border-t border-[rgba(201,151,42,0.06)]`}>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-2.5 rounded border border-dashed border-[rgba(201,151,42,0.4)] bg-[rgba(201,151,42,0.15)]"></div>
                <span className={`text-[11px] ${css.textMuted}`}>{t("ch_leg_band")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9972A]"></span>
                <span className={`text-[11px] ${css.textMuted}`}>{t("ch_leg_avg")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-[#E8B84B] border-2 ${theme === "dark" ? "border-[#E8E4D8]" : "border-[#1A1814]"}`}></span>
                <span className={`text-[11px] ${css.textMuted}`}>{t("ch_leg_today")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {chart30dStat && (
                <span className="text-sm font-semibold tracking-wide font-[family:var(--font-barlow)]" style={{ color: chart30dStat.startsWith("-") ? "var(--dn)" : "var(--up)" }}>
                  {chart30dStat}
                </span>
              )}
              <div className={`flex items-center gap-1.5 text-[11px] ${css.textMuted}`}>
                <Info className="w-3.5 h-3.5 text-[#8A6418]" />
                <span>{t("ch_zoom_hint")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRICE ALERTS CRON CONTROL PANEL */}
        <section className={`border-[0.5px] ${css.borderMain} ${css.bgSurface} rounded-xl p-5 mb-10 shadow-md`}>
          <div className="flex items-center gap-2 pb-4 border-b border-[rgba(201,151,42,0.06)]">
            <Bell className="w-4 h-4 text-[#C9972A]" />
            <span className={`text-[10px] uppercase font-bold tracking-widest ${css.textMuted}`}>
              {t("alerts_title")}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap items-center mt-4">
            <input 
              type="number" 
              id="alert-price-input" 
              className={`flex-1 min-w-[130px] max-w-[200px] border ${css.borderDim} rounded-md px-3 py-2 text-sm text-[inherit] focus:outline-none focus:border-[#C9972A] ${css.cardInputBg}`}
              placeholder="e.g. 520.47"
              step="0.01"
              value={alertPriceInput}
              onChange={(e) => setAlertPriceInput(e.target.value)}
            />
            <div className="relative">
              <select 
                id="alert-dir-select" 
                className={`appearance-none pr-10 pl-3 py-2 border ${css.borderDim} rounded-md text-sm text-[inherit] focus:outline-none focus:border-[#C9972A] ${css.cardInputBg} cursor-pointer min-w-[140px]`}
                value={alertDirInput}
                onChange={(e) => setAlertDirInput(e.target.value)}
              >
                <option value="above">{t("alert_above")}</option>
                <option value="below">{t("alert_below")}</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3.5 top-3 ${css.textMuted} pointer-events-none`} />
            </div>
            <button 
              onClick={handleAddAlert}
              className="px-4 py-2 bg-[#C9972A] text-[#0D0D0B] font-bold text-sm rounded shadow hover:bg-[#E8B84B] transition-colors pointer shadow-sm"
            >
              {t("add_btn")}
            </button>
          </div>

          {/* Active Alerts List */}
          <div className="mt-5 space-y-2.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
            {alerts.length > 0 ? (
              alerts.map((a) => {
                const badgeLabel = a.triggered ? "badge_hit" : (a.dir === "above" ? "badge_above" : "badge_below");
                // Color badges config
                const badgeStyle = a.triggered 
                  ? "bg-[rgba(201,151,42,0.12)] text-[#E8B84B] border-[rgba(201,151,42,0.22)]" 
                  : (a.dir === "above" ? "bg-[rgba(76,175,114,0.1)] text-[#4CAF72] border-[rgba(76,175,114,0.2)]" : "bg-[rgba(224,85,85,0.1)] text-[#E05555] border-[rgba(224,85,85,0.2)]");

                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[rgba(201,151,42,0.06)] last:border-0">
                    <div className="font-[family:var(--font-barlow)] text-lg font-semibold select-none flex items-baseline gap-1.5">
                      <span>RM {a.price.toFixed(2)}</span>
                      <span className={`text-[11px] font-normal font-sans ${css.textMuted}`}>/ gram</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide border ${badgeStyle}`}>
                        {t(badgeLabel)}
                      </span>
                      <button 
                        onClick={() => handleRemoveAlert(a.id)}
                        className={`hover:text-[#E05555] transition-colors p-1 ${css.textMuted}`} 
                        aria-label="Delete alert rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={`text-xs ${css.textMuted} py-1`}>{t("no_alerts")}</p>
            )}
          </div>
        </section>

        {/* FOOTER METRICS INFO */}
        <footer className={`flex items-center justify-between flex-wrap gap-4 pt-4 border-t-[0.5px] ${css.borderMain} pb-4`}>
          <div className={`text-[11px] ${css.textMuted}`} id="footer-note">
            {pricesGram.gram > 0 
              ? t("footer_data")(
                  market.goldUpdatedAt ? new Date(market.goldUpdatedAt).toLocaleTimeString("en-MY") : "—", 
                  market.fxUpdatedAt ? new Date(market.fxUpdatedAt).toLocaleTimeString("en-MY") : "—"
                ) 
              : t("waiting")
            }
          </div>
          <div className={`text-[11px] ${css.textDim} font-mono select-all coding-rail`}>
            RM/g = (XAU_USD ÷ 31.1035) × USD/MYR
          </div>
        </footer>
      </div>

      {/* TOAST SYSTEM POPUP */}
      <div className={`fixed bottom-6 right-6 border border-[#C9972A] rounded-lg px-4 py-2.5 text-xs text-[#E8B84B] font-medium z-[1100] shadow-[0_4px_22px_rgba(0,0,0,0.35)] transition-all transform duration-300 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"} ${css.toastBg}`}>
        {toast.message}
      </div>

      {/* API CONNECTOR CONTROL MODAL */}
      {keyModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 flex items-center justify-center p-6 z-[2000] backdrop-blur-xs select-none">
          <div className={`border-[0.5px] ${css.borderAlt} rounded-2xl p-6 w-full max-w-[440px] shadow-2xl ${theme === "dark" ? "bg-[#111108]" : "bg-[#FEFCF6]"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[#C9972A]" />
                </div>
                <div>
                  <h3 className="font-[family:var(--font-barlow)] text-xl font-bold leading-normal">{t("modal_title")}</h3>
                  <p className={`text-xs ${css.textMuted} mt-0.5`}>{t("modal_sub")}</p>
                </div>
              </div>
              <button
                onClick={() => setKeyModalOpen(false)}
                className={`w-8 h-8 rounded-md border ${css.borderDim} bg-transparent text-lg leading-none cursor-pointer text-[inherit] hover:text-[#C9972A] transition-colors flex items-center justify-center`}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="space-y-3.5 mb-5">
              <div className="flex gap-2.5 items-start">
                <div className="w-[18px] h-[18px] rounded-full bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] text-[10px] font-bold text-[#C9972A] flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <p className={`text-xs leading-relaxed ${css.textMuted}`} dangerouslySetInnerHTML={{ __html: t("modal_step1") }} />
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-[18px] h-[18px] rounded-full bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] text-[10px] font-bold text-[#C9972A] flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <p className={`text-xs leading-relaxed ${css.textMuted}`} dangerouslySetInnerHTML={{ __html: t("modal_step2") }} />
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-[18px] h-[18px] rounded-full bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] text-[10px] font-bold text-[#C9972A] flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <p className={`text-xs leading-relaxed ${css.textMuted}`} dangerouslySetInnerHTML={{ __html: t("modal_step3") }} />
              </div>
            </div>

            {keyError && (
              <p className="text-xs text-[#E05555] min-h-[16px] mb-2 font-medium">{keyError}</p>
            )}

            <div className="flex gap-2 items-center mb-5">
              <input 
                type="text" 
                className={`flex-1 border ${css.borderDim} rounded-md px-3 py-2 text-sm text-[inherit] focus:outline-none focus:border-[#C9972A] ${css.bgVault}`}
                placeholder={t("modal_placeholder")}
                value={keyInputVal}
                onChange={(e) => setKeyInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitApiKey(); }}
                autoComplete="off"
                spellCheck={false}
              />
              <button 
                id="auth-connect-btn"
                onClick={submitApiKey}
                className="px-4 py-2 bg-[#C9972A] text-[#0D0D0B] font-bold text-sm rounded shadow hover:bg-[#E8B84B] transition-colors shadow-sm"
              >
                {t("modal_connect")}
              </button>
            </div>

            <p className={`text-[10px] leading-relaxed pt-3 border-t border-[rgba(201,151,42,0.06)] ${css.textMuted}`}>
              {t("modal_note")}
            </p>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION GUIDE DRAW */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[1900] transition-opacity cursor-pointer duration-300" onClick={closeGuide}></div>
          <div className={`fixed top-0 right-0 w-[420px] max-w-full h-full border-l ${css.borderAlt} z-[1950] flex flex-col justify-between overflow-hidden shadow-2xl transition-transform duration-300 translate-x-0 ${theme === "dark" ? "bg-[#111108]" : "bg-[#FEFCF6]"}`}>
            
            {/* Header Draw */}
            <div className={`flex items-center justify-between p-5 border-b ${css.borderMain} flex-shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-md bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#C9972A]" />
                </div>
                <div>
                  <h3 className="font-[family:var(--font-barlow)] text-lg font-bold leading-none">{t("guide_title")}</h3>
                  <p className={`text-[11px] ${css.textMuted} mt-1`}>{t("guide_sub")}</p>
                </div>
              </div>
              <button onClick={closeGuide} className={`w-8 h-8 rounded-md border ${css.borderDim} bg-transparent text-lg leading-none cursor-pointer text-[inherit] hover:text-[#C9972A] transition-colors`}>×</button>
            </div>

            {/* Tab navigation headers */}
            <div className={`flex overflow-x-auto border-b ${css.borderMain} flex-shrink-0 scrollbar-none`}>
              {["tab0", "tab1", "tab2", "tab3"].map((tabK, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSbTabSelect(idx)}
                  className={`flex-1 py-3 px-2 text-[11px] font-semibold tracking-wider text-center border-b-2 whitespace-nowrap bg-transparent cursor-pointer transition-colors ${sbCurTab === idx ? "text-[#E8B84B] border-b-[#C9972A]" : `text-[inherit] border-b-transparent hover:text-[#8A6418]`}`}
                >
                  {t(tabK)}
                </button>
              ))}
            </div>

            {/* Sliding bodies */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {sbCurTab === 0 && (
                <div className="space-y-5 animate-[slidein_0.2s_ease]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C9972A] uppercase font-bold tracking-widest leading-none">{t("s0_num")}</span>
                    <h4 className="font-[family:var(--font-barlow)] text-2xl font-bold leading-tight">{t("s0_title")}</h4>
                    <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("s0_sub")}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${css.borderAlt} ${css.bgPanel} text-center`}>
                    <span className={`text-[9px] uppercase tracking-wider block font-semibold ${css.textMuted} mb-1.5`}>{t("hero_eyebrow")}</span>
                    <span className="font-[family:var(--font-barlow)] text-[48px] font-bold leading-none text-[#C9972A]">530.47</span>
                    <span className={`text-xs block ${css.textMuted} mt-1`}>{t("hero_unit")}</span>
                    <span className={`mt-2 inline-flex text-[11px] px-2.5 py-0.5 rounded-full border border-[rgba(224,85,85,0.2)] bg-[rgba(224,85,85,0.1)] text-[#E05555] font-semibold`}>−8.23 (−1.53%) {t("today_change")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className={`p-3 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] font-semibold text-[#E8B84B] bg-[rgba(201,151,42,0.12)] px-2 py-0.5 rounded select-none">{t("c0_0_tag")}</span>
                      <div className="font-[family:var(--font-barlow)] text-xl font-bold mt-2">530.47</div>
                      <p className={`text-xs leading-relaxed mt-1 ${css.textMuted}`}>{t("c0_0_txt")}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] font-semibold text-[#E05555] bg-[rgba(224,85,85,0.1)] px-2 py-0.5 rounded select-none">{t("c0_1_tag")}</span>
                      <div className="font-[family:var(--font-barlow)] text-xl font-bold text-[#E05555] mt-2">−8.23</div>
                      <p className={`text-xs leading-relaxed mt-1 ${css.textMuted}`}>{t("c0_1_txt")}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] px-2 py-0.5 bg-[rgba(122,117,104,0.15)] rounded font-semibold text-[inherit] select-none">{t("c0_2_tag")}</span>
                      <div className={`font-semibold text-xs mt-2.5 ${css.textMuted}`}>Jun 18 2026</div>
                      <p className={`text-xs leading-relaxed mt-1.5 ${css.textMuted}`}>{t("c0_2_txt")}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] font-semibold text-[#E8B84B] bg-[rgba(201,151,42,0.12)] px-2 py-0.5 rounded select-none">{t("c0_3_tag")}</span>
                      <div className="text-xs font-semibold mt-2.5">99.99% pure</div>
                      <p className={`text-xs leading-relaxed mt-1.5 ${css.textMuted}`}>{t("c0_3_txt")}</p>
                    </div>
                  </div>

                  <div className={`p-4 border-l-2 border-[#8A6418] rounded-r-lg ${css.bgPanel} text-xs leading-relaxed`} dangerouslySetInnerHTML={{ __html: t("s0_formula") }} />
                </div>
              )}

              {sbCurTab === 1 && (
                <div className="space-y-5 animate-[slidein_0.2s_ease]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C9972A] uppercase font-bold tracking-widest leading-none">{t("m_fx_lbl") && t("s1_num")}</span>
                    <h4 className="font-[family:var(--font-barlow)] text-2xl font-bold leading-tight">{t("s1_title")}</h4>
                    <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("s1_sub")}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${css.borderAlt} ${css.bgPanel}`}>
                    <div className="grid grid-cols-2 gap-px bg-[rgba(201,151,42,0.12)] rounded overflow-hidden">
                      <div className={`${css.bgSurface} p-3`}>
                        <span className={`text-[8.5px] block uppercase font-bold tracking-widest ${css.textMuted} mb-1`}>{t("m_oz_lbl")}</span>
                        <span className="font-[family:var(--font-barlow)] text-lg font-bold leading-none">RM 16,490</span>
                      </div>
                      <div className={`${css.bgSurface} p-3`}>
                        <span className={`text-[8.5px] block uppercase font-bold tracking-widest ${css.textMuted} mb-1`}>{t("m_fx_lbl")}</span>
                        <span className="font-[family:var(--font-barlow)] text-lg font-bold leading-none">4.0645</span>
                      </div>
                      <div className={`${css.bgSurface} p-3`}>
                        <span className={`text-[8.5px] block uppercase font-bold tracking-widest ${css.textMuted} mb-1`}>{t("m_hi_lbl")}</span>
                        <span className={`font-[family:var(--font-barlow)] text-lg font-bold leading-none ${css.textUp}`}>RM 538.70</span>
                      </div>
                      <div className={`${css.bgSurface} p-3`}>
                        <span className={`text-[8.5px] block uppercase font-bold tracking-widest ${css.textMuted} mb-1`}>{t("m_lo_lbl")}</span>
                        <span className={`font-[family:var(--font-barlow)] text-lg font-bold leading-none ${css.textDn}`}>RM 514.84</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="w-4 h-4 text-[#C9972A]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s1_r0") }} />
                    </div>
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(100,160,255,0.1)] border border-[rgba(100,160,255,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Layers className="w-4 h-4 text-[#88BBFF]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s1_r1") }} />
                    </div>
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(76,175,114,0.1)] border border-[rgba(76,175,114,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4 text-[#4CAF72]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s1_r2") }} />
                    </div>
                  </div>
                </div>
              )}

              {sbCurTab === 2 && (
                <div className="space-y-5 animate-[slidein_0.2s_ease]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C9972A] uppercase font-bold tracking-widest leading-none">{t("s2_num")}</span>
                    <h4 className="font-[family:var(--font-barlow)] text-2xl font-bold leading-tight">{t("s2_title")}</h4>
                    <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("s2_sub")}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${css.borderAlt} ${css.bgPanel} space-y-3.5`}>
                    <div className="flex gap-2">
                      <div className={`w-[100px] border ${css.borderDim} rounded-md px-2.5 py-1 text-xs text-[inherit] ${css.bgSurface}`}>e.g. 520.00</div>
                      <div className={`flex-1 border ${css.borderDim} rounded-md px-2.5 py-1 text-xs text-[inherit] ${css.bgSurface}`}>{t("alert_above")}</div>
                      <div className="px-3 py-1 bg-[#C9972A] text-[#0D0D0B] font-bold text-xs rounded shadow-md">{t("add_btn")}</div>
                    </div>
                    <div className="border-t border-[rgba(201,151,42,0.1)] pt-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-[family:var(--font-barlow)] text-base font-semibold leading-none">RM 560.00</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[rgba(76,175,114,0.1)] text-[#4CAF72] font-bold uppercase tracking-wider rounded border border-[rgba(76,175,114,0.2)]">{t("badge_above")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[family:var(--font-barlow)] text-base font-semibold leading-none">RM 500.00</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[rgba(224,85,85,0.1)] text-[#E05555] font-bold uppercase tracking-wider rounded border border-[rgba(224,85,85,0.2)]">{t("badge_below")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[family:var(--font-barlow)] text-base font-semibold leading-none text-[#C9972A]">RM 530.00</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[rgba(201,151,42,0.12)] text-[#E8B84B] font-bold uppercase tracking-wider rounded border border-[rgba(201,151,42,0.22)]">{t("badge_hit")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className={`p-4 rounded-xl border ${css.borderMain} ${css.bgSurface}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-[#4CAF72]">{t("strat_buy_tag")}</span>
                        <span className="text-xs font-semibold select-all text-white dark:text-inherit">{t("strat_buy_title")}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("strat_buy_body")}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${css.borderMain} ${css.bgSurface}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-[#E05555]">{t("strat_stop_tag")}</span>
                        <span className="text-xs font-semibold select-all text-white dark:text-inherit">{t("strat_stop_title")}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("strat_stop_body")}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${css.borderMain} ${css.bgSurface}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-[#E8B84B]">{t("strat_profit_tag")}</span>
                        <span className="text-xs font-semibold select-all text-white dark:text-inherit">{t("strat_profit_title")}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("strat_profit_body")}</p>
                    </div>
                  </div>

                  <div className={`p-4 border-l-2 border-[#8A6418] rounded-r-lg ${css.bgPanel} text-xs leading-relaxed`} dangerouslySetInnerHTML={{ __html: t("s2_formula") }} />
                </div>
              )}

              {sbCurTab === 3 && (
                <div className="space-y-5 animate-[slidein_0.2s_ease]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#C9972A] uppercase font-bold tracking-widest leading-none">{t("s3_num")}</span>
                    <h4 className="font-[family:var(--font-barlow)] text-2xl font-bold leading-tight">{t("s3_title")}</h4>
                    <p className={`text-xs leading-relaxed ${css.textMuted}`}>{t("s3_sub")}</p>
                  </div>

                  <div className={`p-4 border-l-2 border-[#C9972A] rounded-r-lg ${css.bgPanel} text-xs leading-relaxed text-[inherit]`} dangerouslySetInnerHTML={{ __html: t("s3_formula_main") }} />

                  <div className="space-y-4">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(201,151,42,0.12)] border border-[rgba(201,151,42,0.22)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sun className="w-4 h-4 text-[#C9972A]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s3_r0") }} />
                    </div>
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(122,117,104,0.1)] border border-[rgba(122,117,104,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Layers className="w-4 h-4 text-[#7A7568]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s3_r1") }} />
                    </div>
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(100,160,255,0.08)] border border-[rgba(100,160,255,0.18)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Key className="w-4 h-4 text-[#88BBFF]" />
                      </div>
                      <p className="text-xs leading-relaxed text-[inherit]" dangerouslySetInnerHTML={{ __html: t("s3_r2") }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className={`p-3.5 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] font-semibold text-[#E25555] bg-[rgba(224,85,85,0.1)] px-2 py-0.5 rounded leading-none select-none">{t("s3_sc_a_tag")}</span>
                      <p className={`text-xs mt-2.5 leading-relaxed ${css.textMuted}`}>{t("s3_sc_a_txt")}</p>
                    </div>
                    <div className={`p-3.5 rounded-lg border ${css.borderMain} ${css.bgSurface}`}>
                      <span className="text-[10px] font-semibold text-[#4CAF72] bg-[rgba(76,175,114,0.1)] px-2 py-0.5 rounded leading-none select-none">{t("s3_sc_b_tag")}</span>
                      <p className={`text-xs mt-2.5 leading-relaxed ${css.textMuted}`}>{t("s3_sc_b_txt")}</p>
                    </div>
                  </div>

                  <div className={`p-4 border-l-2 border-[#8A6418] rounded-r-lg ${css.bgPanel} text-xs leading-relaxed`} dangerouslySetInnerHTML={{ __html: t("s3_formula_rule") }} />
                </div>
              )}
            </div>

            {/* Footer Draw */}
            <div className={`flex items-center justify-between p-4 border-t ${css.borderMain} flex-shrink-0`}>
              <button 
                onClick={handleSbPrev} 
                disabled={sbCurTab === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-[rgba(201,151,42,0.22)] rounded-md text-xs font-semibold hover:text-[#C9972A] hover:border-[#C9972A] disabled:opacity-30 disabled:pointer-events-none transition-all mr-2 cursor-pointer bg-transparent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t("prev")}</span>
              </button>
              
              <div className="flex gap-2 items-center">
                {[0, 1, 2, 3].map((v) => (
                  <div key={v} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${sbCurTab === v ? "bg-[#C9972A] scale-125" : "bg-[#3A3830]"}`}></div>
                ))}
              </div>

              <button 
                onClick={handleSbNext} 
                disabled={sbCurTab === 3}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-[rgba(201,151,42,0.22)] rounded-md text-xs font-semibold hover:text-[#C9972A] hover:border-[#C9972A] disabled:opacity-30 disabled:pointer-events-none transition-all ml-2 cursor-pointer bg-transparent"
              >
                <span>{t("next")}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
