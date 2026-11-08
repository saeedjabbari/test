// ============================================================================
// 🔒 [DATA LOCKED - READ ONLY]
// پایگاه داده رسمی مراکز درمانی تکمیلی آنلاین.
// این دیتا کاملاً قفل و تثبیت شده است و هیچ تغییری در آن بدون درخواست صریح کاربر اعمال نمی‌شود.
// ============================================================================
export interface MedicalCenter {
  k: number;
  name: string;
  id: string;
  address: string;
  phone: string;
  ownership: string;
  type: string;
  phoneWarn: string;
  streets: string[];
  pid: string;
  alt?: string[];
  isNightShift?: boolean;
  specialty?: string;
  lat?: number;
  lng?: number;
  neshanUrl?: string;
  baladUrl?: string;
  googleMapUrl?: string;
}

export const MEDICAL_CENTERS: MedicalCenter[] = [
  {
    "k": 1,
    "name": "تصویربرداری ماکان",
    "id": "",
    "address": "ارومیه خیابان حسنی - جنب ساختمان لقمان حکیم۲ - طبقه زیر زمین - واحد یک پلاک ۱",
    "phone": "04433490013",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJV2W49QRTBUARMg2vz7-gky0",
    "isNightShift": false
  },
  {
    "k": 2,
    "name": "پزشکی هسته ای رادیوتراپی پرتو",
    "id": "10220160350",
    "address": "ارومیه - خیابان مولوی ۲، خیابان فردوسی ۲، ساختمان پرتو",
    "phone": "04433677809",
    "ownership": "",
    "type": "پزشکی هسته‌ای",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJWw8NvpBTBUAR2wZY_s-S2DA",
    "isNightShift": false
  },
  {
    "k": 3,
    "name": "بیمارستان دکتر صولتی",
    "id": "10220004600",
    "address": "ارومیه - خیابان امام، پلاک ۶۰۲",
    "phone": "04432222525",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "امام"
    ],
    "pid": "ChIJF4bevnJTBUARLSyYl6snXcQ",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 4,
    "name": "بیمارستان شفا",
    "id": "10220009017",
    "address": "ارومیه - خیابان امام، جنب مخابرات",
    "phone": "04432225588",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "امام"
    ],
    "pid": "ChIJpWbmEm1TBUARKj15bl6gS-8",
    "alt": [
      "04432222324"
    ],
    "isNightShift": false
  },
  {
    "k": 5,
    "name": "بیمارستان آذربایجان",
    "id": "10220007018",
    "address": "ارومیه - خیابان شهید بهشتی، نبش چهارراه شورا",
    "phone": "04433463300",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "بهشتی",
      "شورا"
    ],
    "pid": "ChIJP0R0TL9TBUARhwMDnArWVf4",
    "alt": [
      "04433463301"
    ],
    "isNightShift": false
  },
  {
    "k": 6,
    "name": "بیمارستان امید",
    "id": "10220007966",
    "address": "ارومیه - شهرک کوثر، بلوار فرهنگیان، نبش خیابان امید",
    "phone": "04433873450",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "ChIJn3F8cXlUBUAR-4xsK_4Z7V8",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 7,
    "name": "بیمارستان میلاد ارومیه",
    "id": "10220163766",
    "address": "ارومیه - خیابان مولوی ۲، بلوار فردوسی ۲",
    "phone": "04433673520",
    "ownership": "",
    "type": "مرکز جراحی محدود",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJ6-Ua5zlSBUAR5mx4K-z1dHU",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 8,
    "name": "بیمارستان تخصصی و فوق تخصصی شمس",
    "id": "10220117127",
    "address": "ارومیه - خیابان شهید بهشتی (دانشکده)، بالاتر از کوی منصور افشار",
    "phone": "04433434490",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "بهشتی"
    ],
    "pid": "ChIJF-fFg7tTBUAR4Yj0jrM4meY",
    "alt": [
      "04433434494",
      "04433434495"
    ],
    "isNightShift": false
  },
  {
    "k": 9,
    "name": "آزمایشگاه نوین",
    "id": "",
    "address": "ارومیه - خیابان حسنی، نرسیده به بیمارستان کوثر، ساختمان اسپیناس",
    "phone": "04433224304",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJWVVdewBTBUARKcTFn2pqbYE",
    "alt": [
      "04433224305"
    ],
    "isNightShift": false
  },
  {
    "k": 10,
    "name": "دندانپزشکی آراد",
    "id": "",
    "address": "خیابان سرداران ۱ روبروی مسجد لطفعلی خان طبقه فوقانی بانک پارسیان",
    "phone": "04432254191",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "سرداران"
    ],
    "pid": "ChIJMbIPKWxTBUAROgy01rCV5J0",
    "alt": [
      "04432224215"
    ],
    "isNightShift": false
  },
  {
    "k": 11,
    "name": "مطب دکتر علیرضا مهرشاد",
    "id": "160567",
    "address": "ارومیه، خیابان استادان، روبروی حج و اوقاف، درمانگاه لبخند سپید",
    "phone": "04433433434",
    "ownership": "خصوصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "استادان"
    ],
    "pid": "",
    "lat": 37.53556697732836,
    "lng": 45.05043388179621,
    "neshanUrl": "https://nshn.ir/?lat=37.53556697732836&lng=45.05043388179621",
    "baladUrl": "https://balad.ir/location?latitude=37.53556697732836&longitude=45.05043388179621",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53556697732836,45.05043388179621",
    "alt": [
      "دکتر علیرضا مهرشاد",
      "دکتر مهرشاد دندانپزشک",
      "درمانگاه لبخند سپید",
      "لبخند سپید استادان"
    ],
    "isNightShift": false,
    "specialty": "دندانپزشکی عمومی / دکترای حرفه‌ای دندانپزشکی"
  },
  {
    "k": 12,
    "name": "مطب دکتر آیدین جباری",
    "id": "",
    "address": "ارومیه، خیابان استادان، روبروی اداره اوقاف، ساختمان ۳۸، درمانگاه دندانپزشکی لبخند سپید (طبقه ۴، واحد ۱۲)",
    "phone": "04433433434",
    "ownership": "خصوصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "استادان"
    ],
    "pid": "",
    "lat": 37.53556697732836,
    "lng": 45.05043388179621,
    "neshanUrl": "https://nshn.ir/?lat=37.53556697732836&lng=45.05043388179621",
    "baladUrl": "https://balad.ir/location?latitude=37.53556697732836&longitude=45.05043388179621",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53556697732836,45.05043388179621",
    "alt": [
      "دکتر آیدن جباری بهروز",
      "دکتر آیدین جباری",
      "درمانگاه دندانپزشکی لبخند سپید",
      "ساختمان ۳۸ استادان"
    ],
    "isNightShift": false,
    "specialty": "جراح و دندانپزشک"
  },
  {
    "k": 13,
    "name": "درمانگاه فارابی",
    "id": "10220109105",
    "address": "ارومیه - خیابان برق (سربازان گمنام)، بین میدان خیرین و چهارراه عمار",
    "phone": "04433442583",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "برق"
    ],
    "pid": "ChIJaeQZJ51TBUARuCK8aMAKCYI",
    "alt": [
      "04433480706",
      "04433442679"
    ],
    "isNightShift": false
  },
  {
    "k": 14,
    "name": "فیزیوتراپی امین ابدالی",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب بانک تجارت، ساختمان صدر",
    "phone": "04433483766",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJnV67rFxTBUARP6MdgzHAtag",
    "alt": [
      "04433483765"
    ],
    "isNightShift": false
  },
  {
    "k": 15,
    "name": "آزمایشگاه دکتر حسین زاده",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان کالین، طبقه ۱",
    "phone": "04433224325",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ3S6gQ71TBUARFeLQiwmRZrY",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 16,
    "name": "دندانپزشکی لبخند سپید ارومیه",
    "id": "",
    "address": "ارومیه - خیابان استادان - روبروی اداره اوقاف - ساختمان ۳۸",
    "phone": "04433333433",
    "ownership": "خصوصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "استادان"
    ],
    "pid": "ChIJpyWo6qJTBUAROK4Fpv2RdAs",
    "isNightShift": false
  },
  {
    "k": 17,
    "name": "آزمایشگاه دکتر یوسفی",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان پزشکان سیتاک، طبقه ۱",
    "phone": "04433462030",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJATLpGQBTBUARZ1PB8XDrj3Q",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 18,
    "name": "فیزیوتراپی طاووسی",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان کالین",
    "phone": "04433224548",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJdaMEMvBTBUAR_XM36MEmcS4",
    "alt": [
      "04433436895"
    ],
    "isNightShift": false
  },
  {
    "k": 19,
    "name": "دندانپزشکی نعیمه ترکمان زاد قدیمی",
    "id": "",
    "address": "میدان امام حسین - جنب بانک صادرات - ساختمان پزشکان زکریا - طبقه اول - واحد۲",
    "phone": "04432296410",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJ26JcyT5TBUARWwKOjsWXAnY",
    "isNightShift": false
  },
  {
    "k": 20,
    "name": "دندانپزشکی دکتر سارا حسینی",
    "id": "",
    "address": "خیابان سرداران ساختمان شیخ الرییس طبقه ۲ واحد ۶",
    "phone": "04432123052",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "سرداران"
    ],
    "pid": "ChIJERy2SGxTBUAR3RZ0KCYpOFg",
    "isNightShift": false
  },
  {
    "k": 21,
    "name": "دندانپزشکی غزاله مناف وند",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان اورشاد ۱، طبقه ۳، واحد ۱۱",
    "phone": "04433224815",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535261766240225,
    "lng": 45.042993134196564,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535261766240225,45.042993134196564",
    "neshanUrl": "https://nshn.ir/?lat=37.535261766240225&lng=45.042993134196564",
    "baladUrl": "https://balad.ir/location?latitude=37.535261766240225&longitude=45.042993134196564"
  },
  {
    "k": 22,
    "name": "آزمایشگاه دکتر نعمتی",
    "id": "",
    "address": "ارومیه - پنجراه، خیابان شهید امینی، ساختمان پزشکان کسری، طبقه زیرزمین",
    "phone": "04433456607",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJH7P4PgBTBUARR1I9fg2dg3g",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 23,
    "name": "آزمایشگاه دکتر غیبی",
    "id": "",
    "address": "ارومیه - خیابان شورا، برج پزشکی شورا",
    "phone": "04433468604",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "شورا"
    ],
    "pid": "ChIJxy2ThsNTBUAR5PjnlpCfYmk",
    "alt": [
      "04433468605"
    ],
    "isNightShift": false
  },
  {
    "k": 24,
    "name": "آزمایشگاه مهر",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوچه خان‌باباخان، بن‌بست اول، ساختمان مهر",
    "phone": "04432250769",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.54754971820047,
    "lng": 45.0669550999645,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54754971820047,45.0669550999645",
    "neshanUrl": "https://nshn.ir/?lat=37.54754971820047&lng=45.0669550999645",
    "baladUrl": "https://balad.ir/location?latitude=37.54754971820047&longitude=45.0669550999645"
  },
  {
    "k": 25,
    "name": "مرکز پزشکی هسته ای نعمتی آذر",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان لقمان حکیم ۳، طبقه همکف",
    "phone": "04432224392",
    "ownership": "",
    "type": "پزشکی هسته‌ای",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.535824871189575,
    "lng": 45.0483682083956,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535824871189575,45.0483682083956",
    "neshanUrl": "https://nshn.ir/?lat=37.535824871189575&lng=45.0483682083956",
    "baladUrl": "https://balad.ir/location?latitude=37.535824871189575&longitude=45.0483682083956"
  },
  {
    "k": 26,
    "name": "آزمایشگاه نیکان",
    "id": "",
    "address": "ارومیه خیابان حسنی ساختمان کوثر ساختمان تهران زیر زمین",
    "phone": "04432224791",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ799TJABTBUARUElEjSFu1Jo",
    "isNightShift": false
  },
  {
    "k": 27,
    "name": "دندانپزشکی دکتر مجید مددی",
    "id": "",
    "address": "ارومیه - فلکه بهداری، طبقه فوقانی بانک ملت",
    "phone": "04433487306",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJl7TGP0lSBUARUH944eA40x0",
    "isNightShift": false
  },
  {
    "k": 28,
    "name": "آزمایشگاه آلفا",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب بانک مسکن، ساختمان پزشکان رازی، طبقه زیرزمین",
    "phone": "04433435821",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJO71pajZTBUAREzR9UE9VByU",
    "alt": [],
    "isNightShift": false,
    "lat": 37.53787141458287,
    "lng": 45.051746702704236,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53787141458287,45.051746702704236",
    "neshanUrl": "https://nshn.ir/?lat=37.53787141458287&lng=45.051746702704236",
    "baladUrl": "https://balad.ir/location?latitude=37.53787141458287&longitude=45.051746702704236"
  },
  {
    "k": 29,
    "name": "دندانپزشکی مهردوست",
    "id": "",
    "address": "خیابان حسنی ساختمان اورشاد ۲ واحد ۳۱",
    "phone": "04433224826",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ7f18GXVTBUARKc7K0wfto94",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535261766240225,
    "lng": 45.042993134196564,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535261766240225,45.042993134196564",
    "neshanUrl": "https://nshn.ir/?lat=37.535261766240225&lng=45.042993134196564",
    "baladUrl": "https://balad.ir/location?latitude=37.535261766240225&longitude=45.042993134196564"
  },
  {
    "k": 30,
    "name": "آزمایشگاه پژمان",
    "id": "",
    "address": "ارومیه - خیابان ورزش، روبروی استخر ۷ تیر",
    "phone": "04433489316",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "ورزش"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.53884843025186,
    "lng": 45.043932672597066,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53884843025186,45.043932672597066",
    "neshanUrl": "https://nshn.ir/?lat=37.53884843025186&lng=45.043932672597066",
    "baladUrl": "https://balad.ir/location?latitude=37.53884843025186&longitude=45.043932672597066"
  },
  {
    "k": 31,
    "name": "آزمایشگاه شهریار",
    "id": "",
    "address": "ارومیه - خیابان حسنی، چهارراه شورا، ساختمان اورشاد، طبقه زیرزمین",
    "phone": "04433224018",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی",
      "شورا"
    ],
    "pid": "ChIJ23yOeABTBUARZ2umgGee--g",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535261766240225,
    "lng": 45.042993134196564,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535261766240225,45.042993134196564",
    "neshanUrl": "https://nshn.ir/?lat=37.535261766240225&lng=45.042993134196564",
    "baladUrl": "https://balad.ir/location?latitude=37.535261766240225&longitude=45.042993134196564"
  },
  {
    "k": 32,
    "name": "آزمایشگاه راد",
    "id": "",
    "address": "ارومیه - خیابان مولوی ۲، نبش کوی ۴، کلینیک بهبود",
    "phone": "04433444660",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "",
    "alt": [
      "04433444977"
    ],
    "isNightShift": false,
    "lat": 37.51767678298728,
    "lng": 45.06509537176996,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.51767678298728,45.06509537176996",
    "neshanUrl": "https://nshn.ir/?lat=37.51767678298728&lng=45.06509537176996",
    "baladUrl": "https://balad.ir/location?latitude=37.51767678298728&longitude=45.06509537176996"
  },
  {
    "k": 33,
    "name": "فیزیوتراپی نورامید",
    "id": "",
    "address": "ارومیه - خیابان حسنی، مجتمع پزشکی رازی، طبقه ۲، واحد ۲۰۱ و ۲۰۲",
    "phone": "04433435835",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "alt": [
      "04433435836"
    ],
    "isNightShift": false,
    "lat": 37.53787141458287,
    "lng": 45.051746702704236,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53787141458287,45.051746702704236",
    "neshanUrl": "https://nshn.ir/?lat=37.53787141458287&lng=45.051746702704236",
    "baladUrl": "https://balad.ir/location?latitude=37.53787141458287&longitude=45.051746702704236"
  },
  {
    "k": 34,
    "name": "مطب دندانپزشکی دکتر بهار بابازاده",
    "id": "",
    "address": "ارومیه - بلوار والفجر ۱، خیابان فرهنگ، جنب فروشگاه کوروش، پلاک ۵۳",
    "phone": "04433369144",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "والفجر"
    ],
    "pid": "ChIJ1STOawBTBUARRzPvEOrqQfI",
    "isNightShift": false
  },
  {
    "k": 35,
    "name": "آزمایشگاه دکتر مجید میلانی",
    "id": "",
    "address": "ارومیه - تقاطع مدنی و خیام شمالی",
    "phone": "04432230117",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی"
    ],
    "pid": "ChIJV8bt4m1TBUARtszddh50NqY",
    "alt": [
      "04432230240"
    ],
    "isNightShift": false
  },
  {
    "k": 36,
    "name": "دندانپزشکی آتیه",
    "id": "14000813989",
    "address": "ارومیه - سه‌راه کاشانی، نبش کوی کیوان، پلاک ۴۲",
    "phone": "04432234030",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "ChIJgSnIGQ5TBUARScHtMhmMtKI",
    "alt": [
      "04432259533"
    ],
    "isNightShift": false
  },
  {
    "k": 37,
    "name": "آزمایشگاه رویان",
    "id": "",
    "address": "ارومیه - خیابان کاشانی، جنب مهمانسرای جهانگردی، کوچه ۱۲، ساختمان میلاد",
    "phone": "04432241638",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "ChIJWS-2uwhTBUAR3WPGrfiekao",
    "isNightShift": false
  },
  {
    "k": 38,
    "name": "مرکز جراحی محدود میلاد نور",
    "id": "",
    "address": "ارومیه - بلوار مولوی ۲، بالاتر از تقاطع فردوسی، کوی شهید رخشا، پلاک ۲",
    "phone": "04431010915",
    "ownership": "",
    "type": "مرکز جراحی محدود",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJyZvT4jlSBUAR0Y-EShL_G6E",
    "alt": [
      "04431011990"
    ],
    "isNightShift": false
  },
  {
    "k": 39,
    "name": "دندانپزشکی آراز",
    "id": "",
    "address": "ارومیه - خیابان رودکی، خیابان خردمند",
    "phone": "04433654077",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "رودکی"
    ],
    "pid": "ChIJM_vqKwZTBUARaVcimFyqAZc",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 40,
    "name": "آزمایشگاه ژنوا",
    "id": "",
    "address": "ارومیه - خیابان حسنی، مجتمع پزشکی پارس",
    "phone": "04433444829",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJQx1jA8xTBUARMhbFI-5R0qg",
    "alt": [
      "04433444840"
    ],
    "isNightShift": false
  },
  {
    "k": 41,
    "name": "آزمایشگاه دنا",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان پزشکان صدر",
    "phone": "04433224284",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ42jVEalTBUARtpj5HGeL00Y",
    "alt": [
      "04433224285"
    ],
    "isNightShift": false
  },
  {
    "k": 42,
    "name": "آزمایشگاه نانو",
    "id": "",
    "address": "ارومیه - خیابان حسنی، مجتمع پزشکی هاشمی، طبقه اول",
    "phone": "04433457993",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJj5vSKQBTBUARPluI5QWhKjc",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 43,
    "name": "فیزیوتراپی گفتار درمانی و توانبخشی رویش",
    "id": "",
    "address": "ارومیه - خیابان حسنی - ساختمان لقمان حکیم ۲ - طبقه ۶ - واحد ۶۰۱",
    "phone": "04433433173",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJLbxNlXVTBUARTUToxKDykq0",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 44,
    "name": "آزمایشگاه آریان",
    "id": "",
    "address": "ارومیه - خیابان کاشانی، مقابل اداره کل دارایی",
    "phone": "04433450044",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "ChIJDYfcjwxTBUARVufta515x_o",
    "alt": [
      "04433481216"
    ],
    "isNightShift": false
  },
  {
    "k": 45,
    "name": "آزمایشگاه دکتر اصغری",
    "id": "",
    "address": "ارومیه - خیابان مولوی ۱، ساختمان پزشکان آتیه، طبقه منفی یک",
    "phone": "04433485840",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJiUA8rytTBUARSL6CL3l63Xc",
    "alt": [
      "04433485800"
    ],
    "isNightShift": false,
    "lat": 37.5235914363673,
    "lng": 45.064301928836926,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5235914363673,45.064301928836926",
    "neshanUrl": "https://nshn.ir/?lat=37.5235914363673&lng=45.064301928836926",
    "baladUrl": "https://balad.ir/location?latitude=37.5235914363673&longitude=45.064301928836926"
  },
  {
    "k": 46,
    "name": "فیزیوتراپی پاستور",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان ماندگار، طبقه ۶، واحد ۶۰۴",
    "phone": "04433439684",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ-bLXzHtTBUAR51c3E07Sz9k",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 47,
    "name": "درمانگاه آدینه",
    "id": "",
    "address": "ارومیه - خیابان رسالت، جنب مصلی امام خمینی",
    "phone": "04432388860",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJPXArtHBTBUARJRn0jxf0Edc",
    "isNightShift": false
  },
  {
    "k": 48,
    "name": "مطب دکتر شهرزاد سیوانی",
    "id": "",
    "address": "ارومیه - بلوار استادان، بین کوی وزرا و پنجم",
    "phone": "09375867374",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "استادان"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.53653411540644,
    "lng": 45.05304431540918,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53653411540644,45.05304431540918",
    "neshanUrl": "https://nshn.ir/?lat=37.53653411540644&lng=45.05304431540918",
    "baladUrl": "https://balad.ir/location?latitude=37.53653411540644&longitude=45.05304431540918"
  },
  {
    "k": 49,
    "name": "تصویربرداری دکتر سالار پیاهو",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان لقمان حکیم ۳، طبقه زیرزمین",
    "phone": "04433224396",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJaxPWAQBTBUARXSheMzTy2wE",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535824871189575,
    "lng": 45.0483682083956,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535824871189575,45.0483682083956",
    "neshanUrl": "https://nshn.ir/?lat=37.535824871189575&lng=45.0483682083956",
    "baladUrl": "https://balad.ir/location?latitude=37.535824871189575&longitude=45.0483682083956"
  },
  {
    "k": 50,
    "name": "آزمایشگاه دکتر قوام",
    "id": "",
    "address": "ارومیه - خیابان امام، نبش خیابان طرزی، پلاک ۶۶۶",
    "phone": "04432223675",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "امام"
    ],
    "pid": "",
    "alt": [
      "04432233235"
    ],
    "isNightShift": false,
    "lat": 37.54488814717553,
    "lng": 45.06612484700895,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54488814717553,45.06612484700895",
    "neshanUrl": "https://nshn.ir/?lat=37.54488814717553&lng=45.06612484700895",
    "baladUrl": "https://balad.ir/location?latitude=37.54488814717553&longitude=45.06612484700895"
  },
  {
    "k": 51,
    "name": "آزمایشگاه پیوند",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان لقمان حکیم ۳",
    "phone": "04433227711",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJCVBAaABTBUAR95P3YQ6z-rQ",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535824871189575,
    "lng": 45.0483682083956,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535824871189575,45.0483682083956",
    "neshanUrl": "https://nshn.ir/?lat=37.535824871189575&lng=45.0483682083956",
    "baladUrl": "https://balad.ir/location?latitude=37.535824871189575&longitude=45.0483682083956"
  },
  {
    "k": 52,
    "name": "فیزیوتراپی کارا",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب بانک سپه، ساختمان آیجان، پلاک ۲۸۴",
    "phone": "04433224357",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.53774114069131,
    "lng": 45.05044545919674,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53774114069131,45.05044545919674",
    "neshanUrl": "https://nshn.ir/?lat=37.53774114069131&lng=45.05044545919674",
    "baladUrl": "https://balad.ir/location?latitude=37.53774114069131&longitude=45.05044545919674"
  },
  {
    "k": 53,
    "name": "فیزیوتراپی آشب",
    "id": "",
    "address": "ارومیه خیابان حسنی جنب بانک مهر ساختمان حدیدی طبقه زیرزمین",
    "phone": "09911899504",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.53741615148954,
    "lng": 45.05102759310921,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53741615148954,45.05102759310921",
    "neshanUrl": "https://nshn.ir/?lat=37.53741615148954&lng=45.05102759310921",
    "baladUrl": "https://balad.ir/location?latitude=37.53741615148954&longitude=45.05102759310921"
  },
  {
    "k": 54,
    "name": "آزمایشگاه آنالیز",
    "id": "",
    "address": "ارومیه - خیابان حسنی ساختمان باریش",
    "phone": "04432224867",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJ66c2dABTBUARzeG8yTg96LE",
    "isNightShift": false
  },
  {
    "k": 55,
    "name": "درمانگاه عمومی علیاری",
    "id": "",
    "address": "ارومیه - خیابان سربازان گمنام مابین میدان خیرین و چهار راه عمار",
    "phone": "04433477026",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJSwug1IJTBUARZR4HNP3TXkc",
    "isNightShift": false
  },
  {
    "k": 56,
    "name": "درمانگاه عمومی بزرگ نژادیان",
    "id": "",
    "address": "ارومیه - خیابان شورا، نرسیده به خیابان حسنی",
    "phone": "04433482173",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی",
      "شورا"
    ],
    "pid": "ChIJDSgoZABTBUARf1MoVRJJ2J0",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 57,
    "name": "آزمایشگاه دکتر حضرتی",
    "id": "14011311040",
    "address": "ارومیه - خیابان حسنی،مجتمع پزشکی مرادی طبقه همکف",
    "phone": "04432224960",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJmwbULwBTBUAR8RuKxCE-u5Q",
    "isNightShift": false
  },
  {
    "k": 58,
    "name": "کلینیک دندانپزشکی جم ارومیه",
    "id": "",
    "address": "ارومیه - بلوار آزادگان، خیابان رودکی",
    "phone": "04433679877",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "رودکی"
    ],
    "pid": "ChIJ17OCwDNSBUARfuBcBpBMmoo",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 59,
    "name": "کلینیک تخصصی سونوگرافی دکتر سیاوش نوری ارومیه",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوچه خان‌باباخان، ساختمان صدف",
    "phone": "04432254297",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "",
    "alt": [
      "04432322057"
    ],
    "isNightShift": false,
    "lat": 37.54775073637303,
    "lng": 45.065277945077185,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54775073637303,45.065277945077185",
    "neshanUrl": "https://nshn.ir/?lat=37.54775073637303&lng=45.065277945077185",
    "baladUrl": "https://balad.ir/location?latitude=37.54775073637303&longitude=45.065277945077185"
  },
  {
    "k": 60,
    "name": "رادیولوژی دهان فک و صورت دکتر احمدپور",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان بهار، پلاک ۵۰",
    "phone": "04433480539",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJS_AjhzNTBUAR439nz0EhuZE",
    "isNightShift": false
  },
  {
    "k": 61,
    "name": "تصویربرداری راد ارومیه",
    "id": "",
    "address": "ارومیه - خیابان خان‌باباخان، ساختمان سهند",
    "phone": "04432257170",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.5475531,
    "lng": 45.0665783,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5475531,45.0665783",
    "neshanUrl": "https://nshn.ir/?lat=37.5475531&lng=45.0665783",
    "baladUrl": "https://balad.ir/p/6mmMaZ2KeqLsp1"
  },
  {
    "k": 62,
    "name": "آزمایشگاه و پاتوبیولوژی بنیان",
    "id": "",
    "address": "ارومیه میدان خیرین بلوار ورزش ساختمان پزشکان سلامت",
    "phone": "04433436913",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "ورزش"
    ],
    "pid": "ChIJu6wdjotTBUARVPAIeZMkzQw",
    "isNightShift": false
  },
  {
    "k": 63,
    "name": "دندانپزشکی رویان",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب بانک مسکن، ساختمان بهار، پلاک ۵۰، طبقه همکف",
    "phone": "04433438998",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJY9rq5P5TBUARaGXLhujVkdk",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 64,
    "name": "رادیولوژی دهان فک و صورت حکیم ارومیه",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان شمس، طبقه اول",
    "phone": "04433459146",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJeYOx3DVTBUARCs2eSpup09k",
    "alt": [
      "04432248095"
    ],
    "isNightShift": false
  },
  {
    "k": 65,
    "name": "درمانگاه خواجه نصیر",
    "id": "",
    "address": "ارومیه - بلوار بهداری، نرسیده به فردوسی، جنب داروخانه بافنده، پلاک ۷۱",
    "phone": "04433431583",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJJ4-LjUhSBUAR74xHHFlhEQk",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 66,
    "name": "درمانگاه شبانه روزی پیمان",
    "id": "14011335388",
    "address": "ارومیه،سه راه ایثار،ساختمان دکتر پیمان",
    "phone": "04433805807",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJYfGlKABVBUARdb-wlQQ9Hbk",
    "isNightShift": true
  },
  {
    "k": 67,
    "name": "درمانگاه دکتر میر جعفری ارومیه",
    "id": "",
    "address": "ارومیه - خیابان رودکی، خیابان خردمند",
    "phone": "04433686572",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "رودکی"
    ],
    "pid": "ChIJ_7IgLQBTBUAR3YxU1pyBO24",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 68,
    "name": "درمانگاه شبانه روزی افرا",
    "id": "",
    "address": "ارومیه - شهرک فرهنگیان، روبروی خیابان سبحان، جنب داروخانه دکتر شقاقی",
    "phone": "04433823872",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "ChIJ4UHiaQBVBUARLMjSjyv_TYk",
    "alt": [],
    "isNightShift": true
  },
  {
    "k": 69,
    "name": "مرکز پزشکی میلاد",
    "id": "",
    "address": "ارومیه - انتهای بلوار ۱۷ شهریور - مرکز پزشکی میلاد",
    "phone": "04432377670",
    "ownership": "خصوصی",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJwRnwUABTBUARGBGNEi92Pxk",
    "isNightShift": false
  },
  {
    "k": 70,
    "name": "پزشکی هسته ای مهدی فاضلی",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوی خان‌باباخان، ساختمان ایرانمهر",
    "phone": "04432242433",
    "ownership": "خصوصی",
    "type": "پزشکی هسته‌ای",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "ChIJr3FAO-pTBUARrZJPio_Lt44",
    "alt": [
      "04432250983"
    ],
    "isNightShift": false,
    "lat": 37.54755841860343,
    "lng": 45.0669054082943,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54755841860343,45.0669054082943",
    "neshanUrl": "https://nshn.ir/?lat=37.54755841860343&lng=45.0669054082943",
    "baladUrl": "https://balad.ir/location?latitude=37.54755841860343&longitude=45.0669054082943"
  },
  {
    "k": 71,
    "name": "آزمایشگاه پاتوبیولوژی دکتر جلوند",
    "id": "",
    "address": "ارومیه - تقاطع خیام شمالی و مدنی ۲، ساختمان بوعلی",
    "phone": "04432245825",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.54800514159314,
    "lng": 45.065708552579196,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54800514159314,45.065708552579196",
    "neshanUrl": "https://nshn.ir/?lat=37.54800514159314&lng=45.065708552579196",
    "baladUrl": "https://balad.ir/location?latitude=37.54800514159314&longitude=45.065708552579196"
  },
  {
    "k": 72,
    "name": "درمانگاه شبانه روزی دکتر نعمتی آذر",
    "id": "",
    "address": "ارومیه - میدان ولیعصر، ساختمان دی",
    "phone": "04432755136",
    "ownership": "خصوصی",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJSYlPSudTBUARQ3yq1FuIY3w",
    "alt": [],
    "isNightShift": true
  },
  {
    "k": 73,
    "name": "آزمایشگاه پاتوبیولوژی و ژنتیک پزشکی پروفسور عبدی راد",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب پمپ بنزین، مجتمع پزشکی نیل",
    "phone": "04433480049",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJxYJ5Qx9TBUARq1PTQOXH2d8",
    "alt": [
      "04433475879"
    ],
    "isNightShift": false,
    "lat": 37.534952750399455,
    "lng": 45.04512543852894,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.534952750399455,45.04512543852894",
    "neshanUrl": "https://nshn.ir/?lat=37.534952750399455&lng=45.04512543852894",
    "baladUrl": "https://balad.ir/location?latitude=37.534952750399455&longitude=45.04512543852894"
  },
  {
    "k": 74,
    "name": "درمانگاه مهرشفا ارومیه",
    "id": "10100322196",
    "address": "ارومیه - نه پله - اول خیابان مفتح - نبش کوی ۷",
    "phone": "04432207122",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJgeGmP0pSBUARxKwWyVVrXig",
    "isNightShift": false
  },
  {
    "k": 75,
    "name": "آزمایشگاه پاتوبیولوژی عطا",
    "id": "",
    "address": "ارومیه - خیابان فردوسی ۲، بالاتر از بیمارستان میلاد",
    "phone": "04433227284",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJWzJEOgBTBUARkmB1qX2nCIQ",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 76,
    "name": "کلینیک دندانپزشکی برلیان",
    "id": "",
    "address": "خیابان مولوی - ۲ نرسیده به میدان فردوسی - جنب پیتزا ۲۴",
    "phone": "09011991116",
    "ownership": "خصوصی",
    "type": "کلینیک",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJ3VINRgBTBUARJcDq_peoey8",
    "isNightShift": false
  },
  {
    "k": 77,
    "name": "مرکز آموزشی درمانی شهید مطهری ارومیه",
    "id": "14001217477",
    "address": "ارومیه - خیابان کاشانی",
    "phone": "04432237077",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "ChIJU_2Mpw5TBUARfLWHIcALAuk",
    "alt": [
      "04432225777"
    ],
    "isNightShift": false
  },
  {
    "k": 78,
    "name": "بیمارستان سازمان تامین اجتماعی",
    "id": "14000261660",
    "address": "ارومیه - خیابان البرز",
    "phone": "04433459986",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "ChIJX5S3vbRTBUARDp4kamyl9HY",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 79,
    "name": "بیمارستان امام خمینی ارومیه",
    "id": "14000269273",
    "address": "ارومیه - بلوار آیت‌الله مدرس، خیابان ارشاد",
    "phone": "04433469931",
    "ownership": "دولتی",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJsVmgEHtTBUARPatFQI4KiFo",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 80,
    "name": "آزمایشگاه آبان",
    "id": "",
    "address": "ارومیه - میدان امام حسین، خیابان مدنی ۲، جنب داروخانه دکتر فرازجو",
    "phone": "04432245098",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJl52Dh1RTBUARKnaeElz11YM",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 81,
    "name": "آزمایشگاه شرکت ماهان ژن اروم طب",
    "id": "14010120229",
    "address": "ارومیه، میدان انقلاب (سومون آباد)، خیابان آیت الله سیدابوالقاسم کاشانی، طبقه ۲",
    "phone": "04433487322",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "ChIJ5fDBFcRTBUARr4MTHT346N0",
    "isNightShift": false
  },
  {
    "k": 82,
    "name": "آزمایشگاه عرفان",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان اورشاد ۲، طبقه اول",
    "phone": "04433224007",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJeZdCHQBTBUARDeJk7AOs_tM",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535261766240225,
    "lng": 45.042993134196564,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535261766240225,45.042993134196564",
    "neshanUrl": "https://nshn.ir/?lat=37.535261766240225&lng=45.042993134196564",
    "baladUrl": "https://balad.ir/location?latitude=37.535261766240225&longitude=45.042993134196564"
  },
  {
    "k": 83,
    "name": "دندانپزشکی سعید بهلولی حیدرلو",
    "id": "",
    "address": "میدان امام حسین ساختمان سبحان ۱ طبقه ۲ واحد ۴",
    "phone": "04432247069",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.54899412729716,
    "lng": 45.066391602521975,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54899412729716,45.066391602521975",
    "neshanUrl": "https://nshn.ir/?lat=37.54899412729716&lng=45.066391602521975",
    "baladUrl": "https://balad.ir/location?latitude=37.54899412729716&longitude=45.066391602521975"
  },
  {
    "k": 84,
    "name": "آزمایشگاه دکتر اسمعیل زاده",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوچه خان‌باباخان، ساختمان ایرانمهر",
    "phone": "04432234737",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "ChIJM1mNvm1TBUAR4xWB435722o",
    "isNightShift": false,
    "lat": 37.54755841860343,
    "lng": 45.0669054082943,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54755841860343,45.0669054082943",
    "neshanUrl": "https://nshn.ir/?lat=37.54755841860343&lng=45.0669054082943",
    "baladUrl": "https://balad.ir/location?latitude=37.54755841860343&longitude=45.0669054082943"
  },
  {
    "k": 85,
    "name": "داروخانه دکتر عالی زاده",
    "id": "",
    "address": "ارومیه - خیابان ارشاد، خیابان شفا، روبروی درمانگاه بیمارستان امام خمینی",
    "phone": "04433452479",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJEb5gewBTBUARtdGJmvI0y1M",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 86,
    "name": "مطب دکتر لیدا اکبری قصور",
    "id": "",
    "address": "خیابان حسنی ساختمان نیل طبقه۲ واحد ۱",
    "phone": "04433486549",
    "ownership": "مطب شخصی",
    "type": "زنان و زایمان",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "alt": [],
    "specialty": "متخصص زنان و زایمان",
    "isNightShift": false,
    "lat": 37.534952750399455,
    "lng": 45.04512543852894,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.534952750399455,45.04512543852894",
    "neshanUrl": "https://nshn.ir/?lat=37.534952750399455&lng=45.04512543852894",
    "baladUrl": "https://balad.ir/location?latitude=37.534952750399455&longitude=45.04512543852894"
  },
  {
    "k": 87,
    "name": "مرکز رادیولوژی دکتر آیسان غزنوی",
    "id": "",
    "address": "ارومیه، خیابان سرداران، کوچه خانباباخان، جنب داروخانه دکتر صدقیانی، ساختمان آذر مهر، طبقه زیرزمین",
    "phone": "04432241403",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "سرداران"
    ],
    "pid": "ChIJnxg45XFTBUARxvt-6_BQMjA",
    "isNightShift": false,
    "lat": 37.5488261,
    "lng": 45.0667329,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5488261,45.0667329",
    "neshanUrl": "https://nshn.ir/?lat=37.5488261&lng=45.0667329",
    "baladUrl": "https://balad.ir/p/35FqA1QqTnONwv",
    "alt": [
      "مرکز رادیولوژی تخصصی دهان فک و صورت دکتر آیسان غزنوی",
      "ساختمان آذرمهر خانباباخان"
    ]
  },
  {
    "k": 88,
    "name": "مرکز آموزشی درمانی شهید آیت الله طالقانی",
    "id": "14001017001",
    "address": "ارومیه - خیابان کاشانی، روبروی ورزشگاه تختی",
    "phone": "04433444591",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "ورزش",
      "کاشانی"
    ],
    "pid": "ChIJ_RNJqgdTBUARBuE2v1SKE_Q",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 89,
    "name": "بیمارستان سید الشهداء ارومیه",
    "id": "14000227111",
    "address": "ارومیه - بلوار ۱۷ شهریور، روبروی خیابان شهید صمدزاده",
    "phone": "04432375908",
    "ownership": "",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJkVnAd05TBUARyv_F0ZNCnKU",
    "alt": [
      "04432375909"
    ],
    "isNightShift": false
  },
  {
    "k": 90,
    "name": "درمانگاه شبانه روزی سلامت",
    "id": "",
    "address": "ارومیه - خیابان شهید بهشتی، نرسیده به استادان، سمت راست، جنب داروخانه",
    "phone": "04433460591",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "استادان",
      "بهشتی"
    ],
    "pid": "ChIJJW92DbxTBUAR7HJohEvvEx0",
    "alt": [
      "04433444633"
    ],
    "isNightShift": true
  },
  {
    "k": 91,
    "name": "داروخانه دکتر بهاره رحمتی",
    "id": "",
    "address": "ارومیه - خیابان شورا / خیابان کاشانی، بیمارستان طالقانی",
    "phone": "04433438477",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "شورا",
      "کاشانی"
    ],
    "pid": "ChIJp-H6OZ9VBUARxJ3tJ_tqVV4",
    "isNightShift": false
  },
  {
    "k": 92,
    "name": "داروخانه دکتر شجاع الدین شقاقی",
    "id": "",
    "address": "ارومیه - تقاطع مادر، ۳۲ متری شهرک فرهنگیان، جنب بیمارستان امید",
    "phone": "04433848952",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "ChIJlelo1ntUBUART2zTn9jRcd0",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 93,
    "name": "مطب دکتر مجید ابری (درمانگاه بوعلی)",
    "id": "43731",
    "address": "ارومیه، شهرک فرهنگیان، نرسیده به چهارراه شمالی، درمانگاه بوعلی",
    "phone": "04433837000",
    "ownership": "",
    "type": "کودکان و اطفال",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "",
    "alt": [
      "دکتر مجید ابری",
      "درمانگاه بوعلی فرهنگیان",
      "متخصص اطفال",
      "متخصص کودکان",
      "43731"
    ],
    "isNightShift": false,
    "lat": 37.54978292426674,
    "lng": 45.02530973404532,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54978292426674,45.02530973404532",
    "neshanUrl": "https://nshn.ir/?lat=37.54978292426674&lng=45.02530973404532",
    "baladUrl": "https://balad.ir/location?latitude=37.54978292426674&longitude=45.02530973404532",
    "specialty": "متخصص بیماری‌های کودکان و اطفال"
  },
  {
    "k": 94,
    "name": "رادیولوژی شیوا غیبی",
    "id": "",
    "address": "ارومیه - چهارراه شورا، ابتدای بلوار ورزش، ساختمان پزشکان ابن‌سینا",
    "phone": "04433224506",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "شورا",
      "ورزش"
    ],
    "pid": "ChIJKYQe5YFTBUARyGfMH9_iqAs",
    "alt": [
      "04433224147",
      "رادیولوژی دکتر شیوا غیبی",
      "ساختمان ابن سینا بلوار ورزش"
    ],
    "isNightShift": false,
    "lat": 37.536996,
    "lng": 45.04274,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.536996,45.04274",
    "neshanUrl": "https://nshn.ir/?lat=37.536996&lng=45.04274",
    "baladUrl": "https://balad.ir/p/6ATodyL93unhQr"
  },
  {
    "k": 95,
    "name": "مطب دکتر حمیدرضا افشارجو",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان هاشمی، طبقه ۴",
    "phone": "04432243467",
    "ownership": "مطب شخصی",
    "type": "عفونی و گرمسیری",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJc7_Ch21TBUARVDofsdmAW0c",
    "alt": [],
    "specialty": "متخصص بیماری‌های عفونی و گرمسیری",
    "isNightShift": false
  },
  {
    "k": 96,
    "name": "فیزیوتراپی میلاد ارومیه",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوچه خان‌باباخان، ساختمان میلاد نور",
    "phone": "04432245552",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.54725376242756,
    "lng": 45.06736607486954,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54725376242756,45.06736607486954",
    "neshanUrl": "https://nshn.ir/?lat=37.54725376242756&lng=45.06736607486954",
    "baladUrl": "https://balad.ir/location?latitude=37.54725376242756&longitude=45.06736607486954"
  },
  {
    "k": 97,
    "name": "مرکز فیزیوتراپی اردیبهشت",
    "id": "",
    "address": "ارومیه - خیابان عمار، روبروی کلینیک تدبیر",
    "phone": "04433434553",
    "ownership": "",
    "type": "فیزیوتراپی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJm5szKctTBUARTdY7xubRH4s",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 98,
    "name": "مطب دکتر محمد علی محمدی آغچه قلعه",
    "id": "",
    "address": "ارومیه، خیابان مولوی، خیابان امین، ساختمان کیا، طبقه ۴",
    "phone": "04433430237",
    "ownership": "مطب شخصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "مولوی",
      "امین"
    ],
    "pid": "",
    "alt": [],
    "specialty": "دکترای دندانپزشکی",
    "isNightShift": false,
    "lat": 37.52606987738177,
    "lng": 45.06361934696034,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.52606987738177,45.06361934696034",
    "neshanUrl": "https://nshn.ir/?lat=37.52606987738177&lng=45.06361934696034",
    "baladUrl": "https://balad.ir/location?latitude=37.52606987738177&longitude=45.06361934696034"
  },
  {
    "k": 99,
    "name": "مطب دکتر آغداشی",
    "id": "",
    "address": "ارومیه خیابان ورزش - اول خ سلطانی - ساختمان نیکان - طبقه۴",
    "phone": "04433454636",
    "ownership": "مطب شخصی",
    "type": "روماتولوژی و داخلی",
    "phoneWarn": "",
    "streets": [
      "ورزش"
    ],
    "pid": "",
    "alt": [],
    "specialty": "فوق تخصص روماتولوژی و متخصص بیماری‌های داخلی",
    "isNightShift": false,
    "lat": 37.53831369628685,
    "lng": 45.04255747336251,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53831369628685,45.04255747336251",
    "neshanUrl": "https://nshn.ir/?lat=37.53831369628685&lng=45.04255747336251",
    "baladUrl": "https://balad.ir/location?latitude=37.53831369628685&longitude=45.04255747336251"
  },
  {
    "k": 100,
    "name": "مطب دکتر نیما اسماعیل نسب",
    "id": "",
    "address": "ارومیه خیابان دانشکده نرسیده به پل قویون نبش کوی ۴۷ ساختمان پزشکان دانشکده",
    "phone": "04433491887",
    "ownership": "مطب شخصی",
    "type": "چشم پزشکی",
    "phoneWarn": "",
    "streets": [
      "دانشکده",
      "بهشتی"
    ],
    "pid": "ChIJFZKd6c1TBUAR9_YJQU4-MOs",
    "alt": [],
    "specialty": "متخصص چشم پزشکی",
    "isNightShift": false
  },
  {
    "k": 101,
    "name": "آزمایشگاه غلامرضا عباس زاده",
    "id": "",
    "address": "ارومیه - خیابان برق، روبروی برج جواهر، مرکز جراحی دکتر تیزرو، طبقه منفی یک",
    "phone": "04432234113",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "برق"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.540218,
    "lng": 45.05157,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.540218,45.05157",
    "neshanUrl": "https://nshn.ir/?lat=37.540218&lng=45.05157",
    "baladUrl": "https://balad.ir/p/P5bMhLOWmfN0Xt"
  },
  {
    "k": 102,
    "name": "دندانپزشکی محمود نجف قدیمی",
    "id": "",
    "address": "بلوار حسنی - ساختمان ماندگار - طبقه ۲ - واحد ۲۰۳",
    "phone": "04433401016",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJbb41BBpTBUARVDP1RmUfNHU",
    "isNightShift": false
  },
  {
    "k": 103,
    "name": "دندانپزشکی پردیس انصاری",
    "id": "",
    "address": "ارومیه خیابان خیام شمالی کوچه خانباباخان ۳ کلینیک دندانپزشکی خیام",
    "phone": "04432238280",
    "ownership": "خصوصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی",
      "خان‌باباخان"
    ],
    "pid": "ChIJDS5V-qxTBUAR8I365zB97M8",
    "isNightShift": false
  },
  {
    "k": 104,
    "name": "پزشکی هسته ای دکتر حجت شفیع پور",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان اورشاد، ورودی ۲، طبقه همکف",
    "phone": "04433224065",
    "ownership": "",
    "type": "پزشکی هسته‌ای",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.535261766240225,
    "lng": 45.042993134196564,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.535261766240225,45.042993134196564",
    "neshanUrl": "https://nshn.ir/?lat=37.535261766240225&lng=45.042993134196564",
    "baladUrl": "https://balad.ir/location?latitude=37.535261766240225&longitude=45.042993134196564"
  },
  {
    "k": 105,
    "name": "مطب دندانپزشکی حامد رنجبری",
    "id": "",
    "address": "ارومیه - خیابان حسنی - جنب مجتمع رازی",
    "phone": "04433486908",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJT1qCCQBTBUARKoo6cqHHf7o",
    "isNightShift": false,
    "lat": 37.53787141458287,
    "lng": 45.051746702704236,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53787141458287,45.051746702704236",
    "neshanUrl": "https://nshn.ir/?lat=37.53787141458287&lng=45.051746702704236",
    "baladUrl": "https://balad.ir/location?latitude=37.53787141458287&longitude=45.051746702704236"
  },
  {
    "k": 106,
    "name": "داروخانه دکتر خانه شناس",
    "id": "",
    "address": "ارومیه - خیابان حسنی، جنب بانک سپه، ساختمان آیجان",
    "phone": "04433486908",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.53774114069131,
    "lng": 45.05044545919674,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53774114069131,45.05044545919674",
    "neshanUrl": "https://nshn.ir/?lat=37.53774114069131&lng=45.05044545919674",
    "baladUrl": "https://balad.ir/location?latitude=37.53774114069131&longitude=45.05044545919674"
  },
  {
    "k": 107,
    "name": "آزمایشگاه دکتر ندا سلیمانی",
    "id": "",
    "address": "ارومیه - خیابان حسنی - ساختمان افق - آزمایشگاه دکتر ندا سلیمانی",
    "phone": "04433472597",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "",
    "isNightShift": false,
    "googleMapUrl": "",
    "neshanUrl": "",
    "baladUrl": ""
  },
  {
    "k": 108,
    "name": "تصویربرداری دکتر سلطان احمدی",
    "id": "",
    "address": "ارومیه - خیابان خیام شمالی، کوچه خان‌باباخان، پلاک ۲۴",
    "phone": "04432258595",
    "ownership": "",
    "type": "تصویربرداری",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام شمالی"
    ],
    "pid": "ChIJkd83o21TBUARPqCxDtR2j3Q",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 109,
    "name": "آزمایشگاه مندل",
    "id": "",
    "address": "ارومیه - خیابان حسنی، روبروی بیمارستان کوثر، ساختمان نوبل",
    "phone": "04433434445",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJa264TZlTBUAR9pDAcFMHBdY",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 110,
    "name": "مطب دندانپزشکی دکتر پسانیده",
    "id": "",
    "address": "ارومیه - خیابان امام - روبروی اداره کل تبلیغات اسلامی",
    "phone": "04432209742",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "امام"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.54666477588488,
    "lng": 45.06817815290023,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.54666477588488,45.06817815290023",
    "neshanUrl": "https://nshn.ir/?lat=37.54666477588488&lng=45.06817815290023",
    "baladUrl": "https://balad.ir/location?latitude=37.54666477588488&longitude=45.06817815290023"
  },
  {
    "k": 111,
    "name": "مطب دندانپزشکی داود کریمی",
    "id": "",
    "address": "ارومیه - خیابان سرداران یک - طبقه فوقانی بانک اقتصاد نوین",
    "phone": "04432241744",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "سرداران"
    ],
    "pid": "ChIJGTM1GgBTBUARV9imqMob4To",
    "isNightShift": false
  },
  {
    "k": 112,
    "name": "داروخانه دکتر عزیزی",
    "id": "",
    "address": "ارومیه - خیابان رودکی - روبروی آپارتمانهای قائم",
    "phone": "04433686620",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "رودکی"
    ],
    "pid": "ChIJXU5wgihSBUARZXnN1SkTtc0",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 113,
    "name": "درمانگاه شبانه روزی مریم مقدس",
    "id": "",
    "address": "ارومیه - انتهای خیابان هشت شهریور - خیابان ابوالفتحی - روبروی مدرسه امیرکبیر - درمانگاه شبانه روزی مریم مقدس",
    "phone": "04433783447",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJH53ddetVBUAR1tImmhgHdiI",
    "isNightShift": true
  },
  {
    "k": 114,
    "name": "مطب دندان پزشکی سایه همدانچی",
    "id": "",
    "address": "خیابان خیام شمالی - روبروی خانباباخان - ساختمان ۱۴ - طبقه ۳",
    "phone": "04432208717",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی",
      "خان‌باباخان"
    ],
    "pid": "ChIJZ85SeT1TBUARS8D-D9cKheM",
    "isNightShift": false
  },
  {
    "k": 115,
    "name": "مطب دندانپزشکی دکتر کارگر نژاد",
    "id": "",
    "address": "ارومیه - خیابان ورزش - ساختمان ابن سینا - طبقه ۷ - واحد ۲۷",
    "phone": "04432241819",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "ورزش"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.536996,
    "lng": 45.04274,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.536996,45.04274",
    "neshanUrl": "https://nshn.ir/?lat=37.536996&lng=45.04274",
    "baladUrl": "https://balad.ir/p/6ATodyL93unhQr"
  },
  {
    "k": 116,
    "name": "مطب دندانپزشکی دکتر پویا حقیقت",
    "id": "",
    "address": "ارومیه - خیابان مولوی ۱ - جنب رستوران لقیانوس - ساختمان پزشکان آتیه - طبقه ۵ - واحد ۱۵",
    "phone": "04433500135",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.5235914363673,
    "lng": 45.064301928836926,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5235914363673,45.064301928836926",
    "neshanUrl": "https://nshn.ir/?lat=37.5235914363673&lng=45.064301928836926",
    "baladUrl": "https://balad.ir/location?latitude=37.5235914363673&longitude=45.064301928836926"
  },
  {
    "k": 117,
    "name": "درمانگاه شهریار",
    "id": "",
    "address": "ارومیه - خیابان باکری، روبروی کوی ۲۲",
    "phone": "04433351666",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJM2wTavZTBUARFQUSQTa7cQw",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 118,
    "name": "مطب دندانپزشکی دکتر هادی فرهادی",
    "id": "",
    "address": "ارومیه - خیابان برق، ساختمان پزشکان تیزرو، طبقه ۳",
    "phone": "04433484212",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "برق"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.540218,
    "lng": 45.05157,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.540218,45.05157",
    "neshanUrl": "https://nshn.ir/?lat=37.540218&lng=45.05157",
    "baladUrl": "https://balad.ir/p/P5bMhLOWmfN0Xt"
  },
  {
    "k": 119,
    "name": "مطب دندانپزشکی دکتر ستارزاده",
    "id": "",
    "address": "ارومیه فلکه میثم - به سمت خیابان میثم - جنب کبابی وحید",
    "phone": "04433361669",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJ34gwt5RTBUARKsD1tbSpa50",
    "isNightShift": false
  },
  {
    "k": 120,
    "name": "داروخانه دکتر امیر حسن زاده",
    "id": "",
    "address": "ارومیه - خیابان سربازان گمنام / خیابان ورزش، جنب استخر ۷ تیر، ساختمان هورتاش",
    "phone": "04433443847",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "برق",
      "ورزش"
    ],
    "pid": "ChIJY8cjFjpTBUARoK_RwDVSZvE",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 121,
    "name": "مطب دندانپزشکی دکتر فرشادفر",
    "id": "",
    "address": "ارومیه - خیابان مدنی - خیابان خیام شمالی - ساختمان کیمیا - طبقه ۴",
    "phone": "04432223924",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.547709207722036,
    "lng": 45.06545604541262,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.547709207722036,45.06545604541262",
    "neshanUrl": "https://nshn.ir/?lat=37.547709207722036&lng=45.06545604541262",
    "baladUrl": "https://balad.ir/location?latitude=37.547709207722036&longitude=45.06545604541262"
  },
  {
    "k": 122,
    "name": "مطب دندانپزشکی سهند غنی طبع",
    "id": "",
    "address": "خیابان حسنی - روبروی بیمارستان زنان کوثر - ساختمان تهران - طبقه ۷ - واحد ۱۶",
    "phone": "09370033962",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJxcafLABTBUAR563r_qyj0oQ",
    "isNightShift": false,
    "lat": 37.53553716722921,
    "lng": 45.047502911046024,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53553716722921,45.047502911046024",
    "neshanUrl": "https://nshn.ir/?lat=37.53553716722921&lng=45.047502911046024",
    "baladUrl": "https://balad.ir/location?latitude=37.53553716722921&longitude=45.047502911046024",
    "alt": [
      "دکتر سهند غنی طبع",
      "دندانپزشک غنی طبع",
      "ساختمان تهران حسنی"
    ]
  },
  {
    "k": 123,
    "name": "مطب دندانپزشکی بیژن امیرفلاح",
    "id": "",
    "address": "ارومیه - خیابان امام - جنب بانک ملت شعبه مرکزی - مجتمع پزشکی - حقوقی - طبقه اول - واحد یک",
    "phone": "04432222422",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "امام"
    ],
    "pid": "ChIJWxUw9WxTBUARse6pbJ2KaJc",
    "isNightShift": false
  },
  {
    "k": 124,
    "name": "درمانگاه امام علی",
    "id": "",
    "address": "ارومیه - خیابان کاشانی، خیابان پاسداران (ساحلی)، جنب بیمارستان طالقانی",
    "phone": "04433438632",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "کاشانی"
    ],
    "pid": "",
    "alt": [],
    "isNightShift": false,
    "lat": 37.53488133949868,
    "lng": 45.071388278387616,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53488133949868,45.071388278387616",
    "neshanUrl": "https://nshn.ir/?lat=37.53488133949868&lng=45.071388278387616",
    "baladUrl": "https://balad.ir/location?latitude=37.53488133949868&longitude=45.071388278387616"
  },
  {
    "k": 125,
    "name": "داروخانه دکتر صالح جو",
    "id": "",
    "address": "ارومیه - خیابان حسنی، ساختمان پزشکان دی",
    "phone": "04433225300",
    "ownership": "",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "ChIJtw6I9fIBEEARZ8RuWcc7GGg",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 126,
    "name": "درمانگاه شبانه روزی رادور",
    "id": "",
    "address": "ارومیه، بلوار هفت تیر، ابتدای خیابان موسوی (روبروی راهنمایی)",
    "phone": "04432351184",
    "ownership": "",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "هفت تیر",
      "موسوی"
    ],
    "pid": "",
    "alt": [
      "درمانگاه رادور",
      "درمانگاه شبانه روزی رادور هفت تیر",
      "بلوار هفت تیر خیابان موسوی"
    ],
    "isNightShift": true,
    "lat": 37.562315783605726,
    "lng": 45.09868135878057,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.562315783605726,45.09868135878057",
    "neshanUrl": "https://nshn.ir/?lat=37.562315783605726&lng=45.09868135878057",
    "baladUrl": "https://balad.ir/location?latitude=37.562315783605726&longitude=45.09868135878057"
  },
  {
    "k": 127,
    "name": "مطب دندانپزشکی (نام ثبت نشده)",
    "id": "",
    "address": "ارومیه - خیابان مولوی ۲ - نبش کوی ۴ - ساختمان پزشکان بهبود - طبقه یک - واحد ۲",
    "phone": "04433445870",
    "ownership": "",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.51767678298728,
    "lng": 45.06509537176996,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.51767678298728,45.06509537176996",
    "neshanUrl": "https://nshn.ir/?lat=37.51767678298728&lng=45.06509537176996",
    "baladUrl": "https://balad.ir/location?latitude=37.51767678298728&longitude=45.06509537176996"
  },
  {
    "k": 128,
    "name": "آزمایشگاه حیات",
    "id": "",
    "address": "ارومیه - خیابان ورزش - خیابان سلطانی - ساختمان نیکان - طبقه سوم",
    "phone": "04433222506",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "ورزش"
    ],
    "pid": "",
    "isNightShift": false,
    "lat": 37.53831369628685,
    "lng": 45.04255747336251,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.53831369628685,45.04255747336251",
    "neshanUrl": "https://nshn.ir/?lat=37.53831369628685&lng=45.04255747336251",
    "baladUrl": "https://balad.ir/location?latitude=37.53831369628685&longitude=45.04255747336251"
  },
  {
    "k": 129,
    "name": "آزمایشگاه پلاسمای ارومیه",
    "id": "",
    "address": "ارومیه پل قویون",
    "phone": "04433486562",
    "ownership": "",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [],
    "pid": "ChIJF65hVwBTBUAReohWn3wWmBc",
    "alt": [],
    "isNightShift": false
  },
  {
    "k": 130,
    "name": "آزمایشگاه پارس",
    "id": "",
    "address": "ارومیه - شهرک فرهنگیان، بالاتر از بیمارستان امید، ساختمان پزشکان طبیب",
    "phone": "04433870680",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "ChIJCVOfMgBVBUARqJot1pHZ5F8",
    "alt": [
      "آزمایشگاه پارس فرهنگیان",
      "ساختمان طبیب فرهنگیان"
    ],
    "isNightShift": false,
    "lat": 37.5496695,
    "lng": 45.0255404,
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5496695,45.0255404",
    "neshanUrl": "https://nshn.ir/?lat=37.5496695&lng=45.0255404",
    "baladUrl": "https://balad.ir/p/153wSgk545cjGQ"
  },
  {
    "k": 131,
    "name": "آزمایشگاه شمس",
    "id": "",
    "address": "ارومیه - خیابان سرداران، کوچه خان‌باباخان ۲، پلاک ۱۶",
    "phone": "04432240180",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "سرداران"
    ],
    "pid": "ChIJH4BfM-ZTBUARt7-5ozXzdEc",
    "alt": [
      "04432234444"
    ],
    "isNightShift": false
  },
  {
    "k": 132,
    "name": "آزمایشگاه پاستور",
    "id": "",
    "address": "ارومیه - خیابان مدنی ۲، نرسیده به سه‌راهی خیام شمالی، ساختمان سینا",
    "phone": "04432233715",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی"
    ],
    "pid": "ChIJyagt-pdTBUARePdBo3xOXSw",
    "alt": [
      "04433233715"
    ],
    "isNightShift": false
  },
  {
    "k": 133,
    "name": "آزمایشگاه ژنوم",
    "id": "",
    "address": "ارومیه، خیابان حسنی، مجتمع پزشکی پارس",
    "phone": "04433444829",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "حسنی"
    ],
    "pid": "0x400553cc03631d43:0xa8d251ee23c51632",
    "lat": 37.5371423441005,
    "lng": 45.04976799759771,
    "neshanUrl": "https://nshn.ir/?lat=37.5371423441005&lng=45.04976799759771",
    "baladUrl": "https://balad.ir/location?latitude=37.5371423441005&longitude=45.04976799759771",
    "googleMapUrl": "https://maps.app.goo.gl/Exeit61FAh4aEbB76",
    "alt": [
      "04433444829",
      "آزمایشگاه ژنوم ارومیه",
      "آزمایشگاه ژنوم حسنی",
      "آزمایشگاه پاتوبیولوژی ژنوم"
    ],
    "isNightShift": false,
    "specialty": "آزمایشگاه تشخیص طبی و ژنتیک"
  },
  {
    "k": 134,
    "name": "آزمایشگاه نیرا",
    "id": "",
    "address": "ارومیه، خیابان مولوی، نبش رستوران اقیانوس، مجتمع آتیه، طبقه ۶",
    "phone": "04433225889",
    "ownership": "خصوصی",
    "type": "آزمایشگاه",
    "phoneWarn": "",
    "streets": [
      "مولوی"
    ],
    "pid": "",
    "lat": 37.5235914363673,
    "lng": 45.064301928836926,
    "neshanUrl": "https://nshn.ir/?lat=37.5235914363673&lng=45.064301928836926",
    "baladUrl": "https://balad.ir/location?latitude=37.5235914363673&longitude=45.064301928836926",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5235914363673,45.064301928836926",
    "alt": [
      "04433225889",
      "آزمایشگاه نیرا ارومیه",
      "آزمایشگاه نیرا مولوی",
      "آزمایشگاه پاتوبیولوژی نیرا"
    ],
    "isNightShift": false,
    "specialty": "آزمایشگاه پاتوبیولوژی و تشخیص پزشکی"
  },
  {
    "k": 135,
    "name": "دندانپزشکی دکتر نورپناه",
    "id": "",
    "address": "ارومیه، خیابان فرهنگیان، نرسیده به چهارراه شمالی، روبروی خیابان سبحان، ساختمان طبیب",
    "phone": "09025923898",
    "ownership": "خصوصی",
    "type": "دندانپزشکی",
    "phoneWarn": "",
    "streets": [
      "فرهنگیان"
    ],
    "pid": "",
    "lat": 37.5496695,
    "lng": 45.0255404,
    "neshanUrl": "https://nshn.ir/?lat=37.5496695&lng=45.0255404",
    "baladUrl": "https://balad.ir/p/153wSgk545cjGQ",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5496695,45.0255404",
    "alt": [
      "09025923898",
      "دندانپزشک نورپناه",
      "مطب دندانپزشکی دکتر نورپناه",
      "دکتر نورپناه فرهنگیان",
      "ساختمان طبیب"
    ],
    "isNightShift": false,
    "specialty": "دندانپزشکی عمومی و تخصصی"
  },
  {
    "k": 136,
    "name": "عینک‌سازی نورا",
    "id": "",
    "address": "ارومیه، خان‌باباخان، ساختمان لقمان حکیم، طبقه اول، واحد ۱۶",
    "phone": "04432252719",
    "ownership": "خصوصی",
    "type": "عینک‌سازی / اپتومتری",
    "phoneWarn": "",
    "streets": [
      "خان‌باباخان",
      "خیام",
      "سرداران"
    ],
    "pid": "",
    "lat": 37.5482,
    "lng": 45.0712,
    "neshanUrl": "https://nshn.ir/?lat=37.5482&lng=45.0712",
    "baladUrl": "https://balad.ir/location?latitude=37.5482&longitude=45.0712",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5482,45.0712",
    "alt": [
      "04432252719",
      "بینایی سنجی نورا",
      "اپتومتری نورا",
      "عینک نورا",
      "عینک نورا لقمان حکیم"
    ],
    "isNightShift": false,
    "specialty": "عینک‌سازی طبی و بینایی‌سنجی (اپتومتری)"
  },
  {
    "k": 137,
    "name": "عینک‌سازی اردوخانی",
    "id": "",
    "address": "ارومیه، خیابان امام خمینی، خیابان خیام شمالی، روبروی کوی خان‌باباخان، کوچه عادل نجفی، ساختمان آذربایجان ۱، طبقه ۴، واحد ۱۴",
    "phone": "04432245395",
    "ownership": "خصوصی",
    "type": "عینک‌سازی / اپتومتری",
    "phoneWarn": "",
    "streets": [
      "خیام شمالی",
      "امام"
    ],
    "pid": "",
    "lat": 37.5492,
    "lng": 45.0725,
    "neshanUrl": "https://nshn.ir/?lat=37.5492&lng=45.0725",
    "baladUrl": "https://balad.ir/location?latitude=37.5492&longitude=45.0725",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5492,45.0725",
    "alt": [
      "04432245395",
      "عینک اردوخانی",
      "بینایی سنجی اردوخانی",
      "اپتومتری اردوخانی",
      "عینک سازی اردوخانی خیام"
    ],
    "isNightShift": false,
    "specialty": "عینک‌سازی طبی و بینایی‌سنجی (اپتومتری)"
  },
  {
    "k": 138,
    "name": "داروخانه دکتر جوانبخت",
    "id": "",
    "address": "ارومیه، خیابان شهید بهشتی، نرسیده به استادان، جنب درمانگاه استادان",
    "phone": "04433430301",
    "ownership": "خصوصی",
    "type": "داروخانه",
    "phoneWarn": "",
    "streets": [
      "بهشتی",
      "استادان"
    ],
    "pid": "",
    "lat": 37.5348,
    "lng": 45.0682,
    "neshanUrl": "https://nshn.ir/?lat=37.5348&lng=45.0682",
    "baladUrl": "https://balad.ir/location?latitude=37.5348&longitude=45.0682",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5348,45.0682",
    "alt": [
      "04433430301",
      "داروخانه جوانبخت دانشکده",
      "داروخانه جوانبخت بهشتی"
    ],
    "isNightShift": false,
    "specialty": "داروخانه و خدمات دارویی"
  },
  {
    "k": 139,
    "name": "بیمارستان روانپزشکی ارومیه (رازی)",
    "id": "",
    "address": "ارومیه، جاده سلماس، سه‌راهی ناحیه انتظامی",
    "phone": "04432722935",
    "ownership": "دولتی",
    "type": "بیمارستان",
    "phoneWarn": "",
    "streets": [
      "جاده سلماس"
    ],
    "pid": "",
    "lat": 37.6025,
    "lng": 45.0345,
    "neshanUrl": "https://nshn.ir/?lat=37.6025&lng=45.0345",
    "baladUrl": "https://balad.ir/location?latitude=37.6025&longitude=45.0345",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.6025,45.0345",
    "alt": [
      "04432722935",
      "بیمارستان رازی",
      "بیمارستان اعصاب و روان رازی",
      "روانپزشکی رازی"
    ],
    "isNightShift": true,
    "specialty": "بیمارستان اعصاب و روان (روانپزشکی)"
  },
  {
    "k": 140,
    "name": "درمانگاه شهر",
    "id": "",
    "address": "ارومیه، خیابان باکری، بالاتر از چهارراه بعثت، روبروی کوی نارون",
    "phone": "04433351666",
    "ownership": "خصوصی",
    "type": "درمانگاه",
    "phoneWarn": "",
    "streets": [
      "باکری"
    ],
    "pid": "",
    "lat": 37.5456,
    "lng": 45.0792,
    "neshanUrl": "https://nshn.ir/?lat=37.5456&lng=45.0792",
    "baladUrl": "https://balad.ir/location?latitude=37.5456&longitude=45.0792",
    "googleMapUrl": "https://www.google.com/maps/search/?api=1&query=37.5456,45.0792",
    "alt": [
      "04433351666",
      "درمانگاه شهر باکری",
      "پلی کلینیک شهر"
    ],
    "isNightShift": false,
    "specialty": "درمانگاه عمومی و خدمات درمانی سرپایی"
  }
];
