import { getPublicClient } from "./supabase";
import type { Category, PortfolioItem, Product, Testimonial } from "./types";

/* ------------------------------------------------------------------ */
/* البيانات الافتراضية: الموقع بيشتغل بيها لما Supabase مش متصل،      */
/* وبتتطابق مع supabase/seed.sql                                     */
/* ------------------------------------------------------------------ */

export const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-systems", name: "أنظمة ومواقع جاهزة", slug: "أنظمة-ومواقع-جاهزة", sort_order: 1 },
  { id: "cat-marketing", name: "باقات تسويق", slug: "باقات-تسويق", sort_order: 2 },
  { id: "cat-design", name: "تصميم وموشن جرافيك", slug: "تصميم-وموشن-جرافيك", sort_order: 3 },
  { id: "cat-templates", name: "قوالب للتحميل", slug: "قوالب-للتحميل", sort_order: 4 },
  { id: "cat-subscriptions", name: "اشتراكات شهرية", slug: "اشتراكات-شهرية", sort_order: 5 },
];

function baseProduct(p: Partial<Product> & Pick<Product, "id" | "name" | "slug" | "category_id" | "delivery_type" | "price">): Product {
  return {
    category_name: null,
    short_description: "",
    description: "",
    features: [],
    old_price: null,
    demo_url: null,
    delivery_time: null,
    download_file_path: null,
    is_active: true,
    is_featured: false,
    sort_order: 1,
    created_at: "2026-11-26T00:00:00.000Z",
    images: [],
    packages: [],
    ...p,
  } as Product;
}

export const FALLBACK_PRODUCTS: Product[] = [
  baseProduct({
    id: "prod-store-whatsapp",
    images: [{ id: "img-prod-store-whatsapp", product_id: "prod-store-whatsapp", url: "/images/products/store-whatsapp.svg", sort_order: 1 }],
    name: "متجر إلكتروني بطلب على واتساب",
    slug: "متجر-إلكتروني-بطلب-على-واتساب",
    category_id: "cat-systems",
    category_name: "أنظمة ومواقع جاهزة",
    delivery_type: "service",
    price: 4500,
    old_price: 6000,
    delivery_time: "7 أيام",
    is_featured: true,
    sort_order: 1,
    short_description: "متجر إلكتروني كامل بمنتجاتك وأسعارك، والعميل يطلب بضغطة واحدة على واتساب.",
    description:
      "متجر إلكتروني جاهز ومناسب للمحلات والبراندات الصغيرة والمتوسطة. بنجهّز لك متجر يعرض منتجاتك بصور وأسعار واضحة، والعميل يختار اللي عايزه ويبعت الطلب مباشرة على واتساب من غير أي تعقيد أو بوابات دفع.\n\nالمتجر بيشتغل على الموبايل والكمبيوتر بنفس الجودة، وبيتظبط على ألوان وشعار علامتك التجارية، وبنسلمك معاه فيديو شرح بسيط عشان تقدر تضيف منتجات وتعدل الأسعار بنفسك في أي وقت.",
    features: [
      "تصميم متجاوب يشتغل على الموبايل والكمبيوتر",
      "إضافة حتى 50 منتج بصور وأسعار وأقسام",
      "زر طلب على واتساب لكل منتج وسلة طلبات",
      "ألوان وشعار علامتك التجارية",
      "ربط دومين خاص بك لو عندك",
      "فيديو شرح لإدارة المتجر بنفسك",
    ],
    packages: [
      {
        id: "pkg-store-basic",
        product_id: "prod-store-whatsapp",
        name: "أساسي",
        price: 4500,
        features: ["حتى 50 منتج", "طلب على واتساب", "تصميم جاهز بألوانك"],
        sort_order: 1,
      },
      {
        id: "pkg-store-pro",
        product_id: "prod-store-whatsapp",
        name: "احترافي",
        price: 6500,
        features: ["منتجات غير محدودة", "طلب على واتساب", "تصميم مخصص بالكامل", "صفحة عروض وخصومات", "ربط جوجل أناليتكس"],
        sort_order: 2,
      },
    ],
  }),
  baseProduct({
    id: "prod-menu-qr",
    images: [{ id: "img-prod-menu-qr", product_id: "prod-menu-qr", url: "/images/products/menu-qr.svg", sort_order: 1 }],
    name: "منيو ديجيتال QR للمطاعم والكافيهات",
    slug: "منيو-ديجيتال-qr-للمطاعم-والكافيهات",
    category_id: "cat-systems",
    category_name: "أنظمة ومواقع جاهزة",
    delivery_type: "service",
    price: 1200,
    old_price: 1800,
    delivery_time: "3 أيام",
    is_featured: true,
    sort_order: 2,
    short_description: "منيو إلكتروني شيك بكود QR على كل ترابيزة، يتحدث في ثواني من غير طباعة تاني.",
    description:
      "منيو ديجيتال أنيق لمطعمك أو الكافيه بتاعك. العميل يمسح كود الـ QR من على الترابيزة ويشوف المنيو كامل بالصور والأسعار على موبايله، من غير ما يستنى حد ومن غير منيو ورق يتبهدل.\n\nتقدر تغيّر الأسعار أو تضيف صنف جديد في أي وقت من لوحة تحكم بسيطة، والتعديل بيظهر فوراً لكل العملاء. وبنسلّمك ملف الـ QR جاهز للطباعة على الترابيزات والاستيكرات.",
    features: [
      "منيو بصور وأسعار وأقسام",
      "كود QR جاهز للطباعة",
      "تعديل الأسعار والأصناف في أي وقت",
      "تصميم بألوان وهوية مطعمك",
      "يعمل على أي موبايل من غير تطبيق",
      "زر طلب أو اتصال مباشر",
    ],
  }),
  baseProduct({
    id: "prod-booking-system",
    images: [{ id: "img-prod-booking-system", product_id: "prod-booking-system", url: "/images/products/booking-system.svg", sort_order: 1 }],
    name: "نظام حجز للعيادات والصالونات",
    slug: "نظام-حجز-للعيادات-والصالونات",
    category_id: "cat-systems",
    category_name: "أنظمة ومواقع جاهزة",
    delivery_type: "service",
    price: 3500,
    delivery_time: "7 أيام",
    is_featured: true,
    sort_order: 3,
    short_description: "صفحة حجز إلكترونية بمواعيدك المتاحة، والعميل يحجز بنفسه ويوصلك إشعار على واتساب.",
    description:
      "نظام حجز بسيط وعملي للعيادات وصالونات التجميل ومراكز العناية. بتحدد مواعيدك المتاحة والخدمات وأسعارها، والعميل يختار المعاد المناسب ويحجز بنفسه، ويوصلك إشعار فوري على واتساب بكل حجز جديد.\n\nالنظام بيقلل المكالمات واللخبطة في المواعيد، وبيخليك تشوف حجوزات اليوم كاملة في مكان واحد، مع إمكانية تأكيد أو إلغاء أي حجز من لوحة تحكم سهلة.",
    features: [
      "صفحة حجز بمواعيدك المتاحة",
      "إشعار واتساب فوري بكل حجز جديد",
      "جدول حجوزات اليوم والأسبوع",
      "تأكيد أو إلغاء الحجوزات من لوحة التحكم",
      "قائمة خدمات وأسعار",
      "صفحة تعريفية بعيادتك أو صالونك",
    ],
  }),
  baseProduct({
    id: "prod-logo-identity",
    images: [{ id: "img-prod-logo-identity", product_id: "prod-logo-identity", url: "/images/products/logo-identity.svg", sort_order: 1 }],
    name: "لوجو وهوية بصرية",
    slug: "لوجو-وهوية-بصرية",
    category_id: "cat-design",
    category_name: "تصميم وموشن جرافيك",
    delivery_type: "service",
    price: 1500,
    old_price: 2200,
    delivery_time: "3 أيام",
    is_featured: true,
    sort_order: 4,
    short_description: "لوجو احترافي وهوية بصرية كاملة تخلي علامتك التجارية مميزة من أول نظرة.",
    description:
      "لوجو مصمم خصيصاً لعلامتك التجارية، مش قالب جاهز. بنبدأ بفهم نشاطك وجمهورك، وبعدين نقدّم لك 3 أفكار مختلفة تختار منها، مع تعديلين مجاناً لحد ما توصل للنتيجة اللي تعجبك.\n\nبتستلم اللوجو بكل الصيغ اللي تحتاجها للسوشيال ميديا والمطبوعات، ولو اخترت باقة الهوية الكاملة بنسلّمك كمان الألوان والخطوط وتصاميم جاهزة للاستخدام على كل منصاتك.",
    features: [
      "3 أفكار لوجو مختلفة للاختيار",
      "تعديلان مجاناً بعد التسليم",
      "ملفات بكل الصيغ (PNG, SVG, PDF)",
      "نسخة ملونة ونسخة أبيض وأسود",
      "دليل ألوان وخطوط علامتك",
      "تسليم خلال 3 أيام عمل",
    ],
    packages: [
      {
        id: "pkg-logo-only",
        product_id: "prod-logo-identity",
        name: "لوجو فقط",
        price: 1500,
        features: ["3 أفكار للاختيار", "تعديلان مجاناً", "كل الصيغ"],
        sort_order: 1,
      },
      {
        id: "pkg-logo-full",
        product_id: "prod-logo-identity",
        name: "هوية كاملة",
        price: 3500,
        features: ["لوجو + دليل هوية", "كارت شخصي وليترهيد", "قوالب سوشيال ميديا", "غلاف فيسبوك وواتساب"],
        sort_order: 2,
      },
    ],
  }),
  baseProduct({
    id: "prod-motion-video",
    images: [{ id: "img-prod-motion-video", product_id: "prod-motion-video", url: "/images/products/motion-video.svg", sort_order: 1 }],
    name: "فيديو موشن جرافيك لافتتاح محل",
    slug: "فيديو-موشن-جرافيك-لافتتاح-محل",
    category_id: "cat-design",
    category_name: "تصميم وموشن جرافيك",
    delivery_type: "service",
    price: 2500,
    delivery_time: "5 أيام",
    is_featured: false,
    sort_order: 5,
    short_description: "فيديو موشن جرافيك قصير ومبهر يعلن عن افتتاح محلك ويوصل لآلاف الناس.",
    description:
      "فيديو موشن جرافيك احترافي مدته من 30 إلى 45 ثانية، مصمم خصيصاً للإعلان عن افتتاح محلك أو إطلاق منتج جديد. الفيديو بيجمع بين الحركة والألوان والكتابة الواضحة عشان يوصل رسالتك في ثواني ويخلي الناس تتفاعل وتشارك.\n\nبنشتغل على سيناريو بسيط ومؤثر، وبنسلّمك الفيديو بجودة عالية وبمقاسات مناسبة للفيسبوك والإنستجرام وواتساب، مع نسخة موسيقى ونسخة بدون موسيقى لو حبيت.",
    features: [
      "فيديو 30–45 ثانية بجودة عالية",
      "سيناريو ونص إعلاني مؤثر",
      "مقاسات جاهزة للفيسبوك والإنستجرام وواتساب",
      "نسخة بموسيقى ونسخة بدون",
      "تعديل واحد مجاني بعد المعاينة",
      "تسليم خلال 5 أيام عمل",
    ],
  }),
  baseProduct({
    id: "prod-marketing-basic",
    images: [{ id: "img-prod-marketing-basic", product_id: "prod-marketing-basic", url: "/images/products/marketing-basic.svg", sort_order: 1 }],
    name: "باقة تسويق Basic",
    slug: "باقة-تسويق-basic",
    category_id: "cat-marketing",
    category_name: "باقات تسويق",
    delivery_type: "subscription",
    price: 3500,
    delivery_time: "شهري",
    is_featured: true,
    sort_order: 6,
    short_description: "إدارة صفحاتك على السوشيال ميديا: 12 بوست شهرياً وتصاميم احترافية وتقرير أداء.",
    description:
      "باقة التسويق الأساسية للمشاريع اللي لسه بتبدأ وعايزة حضور ثابت على السوشيال ميديا. بندير صفحتك على فيسبوك وإنستجرام، بننشر محتوى منتظم بتصاميم احترافية، وبنرد على التعليقات والرسائل الأساسية.\n\nكل شهر بتستلم تقرير مبسط يوضح وصول المنشورات والتفاعل وعدد الرسائل، عشان تعرف بيزنسك بيكبر إزاي. الباقة بتتجدد شهرياً وتقدر توقفها أو تطوّرها في أي وقت.",
    features: [
      "12 بوست شهرياً بتصاميم احترافية",
      "إدارة فيسبوك وإنستجرام",
      "كتابة محتوى إعلاني جذاب",
      "رد على التعليقات والرسائل",
      "تقرير أداء شهري مبسط",
      "خطة محتوى شهرية",
    ],
  }),
  baseProduct({
    id: "prod-marketing-pro",
    images: [{ id: "img-prod-marketing-pro", product_id: "prod-marketing-pro", url: "/images/products/marketing-pro.svg", sort_order: 1 }],
    name: "باقة تسويق Professional",
    slug: "باقة-تسويق-professional",
    category_id: "cat-marketing",
    category_name: "باقات تسويق",
    delivery_type: "subscription",
    price: 5000,
    delivery_time: "شهري",
    is_featured: true,
    sort_order: 7,
    short_description: "كل مزايا Basic + إعلانات ممولة مدروسة و20 بوست شهرياً وفيديو ريلز.",
    description:
      "باقة التسويق الاحترافية للمشاريع اللي عايزة نمو أسرع ووصول أكبر. بالإضافة لكل مزايا باقة Basic، بنصمم ونُدير حملات إعلانية ممولة باستهداف دقيق لجمهورك، عشان كل جنيه إعلان يوصلك لعميل محتمل فعلاً.\n\nالباقة بتشمل 20 بوست شهرياً وفيديو ريلز واحد، ومتابعة أسبوعية لأداء الإعلانات مع تعديل الاستهداف والميزانية حسب النتائج. ميزانية الإعلانات نفسها بتدفعها أنت مباشرة لفيسبوك، وإحنا بنديرها بدون أي عمولة إضافية.",
    features: [
      "كل مزايا باقة Basic",
      "20 بوست شهرياً",
      "إدارة حملة إعلانية ممولة",
      "فيديو ريلز شهرياً",
      "استهداف دقيق لجمهورك",
      "متابعة أسبوعية وتقرير مفصل",
    ],
  }),
  baseProduct({
    id: "prod-marketing-premium",
    images: [{ id: "img-prod-marketing-premium", product_id: "prod-marketing-premium", url: "/images/products/marketing-premium.svg", sort_order: 1 }],
    name: "باقة تسويق Premium",
    slug: "باقة-تسويق-premium",
    category_id: "cat-marketing",
    category_name: "باقات تسويق",
    delivery_type: "subscription",
    price: 8000,
    delivery_time: "شهري",
    is_featured: false,
    sort_order: 8,
    short_description: "إدارة تسويقية كاملة: 30 بوست، 4 فيديوهات ريلز، حملات ممولة، ومدير حساب مخصص.",
    description:
      "باقة التسويق الشاملة للبراندات اللي عايزة فريق تسويق كامل من غير ما توظف حد. مدير حساب مخصص لبيزنسك، خطة محتوى وإعلانات شهرية كاملة، ومتابعة يومية لصفحاتك وحملاتك.\n\nالباقة بتشمل 30 بوست شهرياً و4 فيديوهات ريلز، وإدارة حملات ممولة متعددة، وتقرير أسبوعي مفصل، واجتماع شهري لمراجعة النتائج وتخطيط الشهر اللي بعده. دي الباقة المناسبة لو عايز التسويق يبقى شغال وانت مركز في شغلك.",
    features: [
      "كل مزايا باقة Professional",
      "30 بوست شهرياً",
      "4 فيديوهات ريلز شهرياً",
      "مدير حساب مخصص",
      "إدارة حملات ممولة متعددة",
      "تقرير أسبوعي + اجتماع شهري",
    ],
  }),
  baseProduct({
    id: "prod-templates-restaurants",
    images: [{ id: "img-prod-templates-restaurants", product_id: "prod-templates-restaurants", url: "/images/products/templates-restaurants.svg", sort_order: 1 }],
    name: "30 قالب بوست جاهز للمطاعم",
    slug: "30-قالب-بوست-جاهز-للمطاعم",
    category_id: "cat-templates",
    category_name: "قوالب للتحميل",
    delivery_type: "instant_download",
    price: 350,
    old_price: 550,
    delivery_time: "فوري بعد تأكيد الدفع",
    is_featured: true,
    sort_order: 9,
    short_description: "30 تصميم جاهز لبوستات المطاعم والكافيهات — عدّل النص والصورة وانشر في دقايق.",
    description:
      "حزمة من 30 قالب بوست احترافي مصمم خصيصاً للمطاعم والكافيهات: عروض، وجبات جديدة، خصومات، منيو اليوم، وتهاني المناسبات. كل قالب جاهز للتعديل — غيّر النص والصورة والأسعار وانشر في دقايق من غير ما تحتاج مصمم.\n\nالقوالب بصيغة Canva قابلة للتعديل أونلاين من الموبايل أو الكمبيوتر، وبمقاسات جاهزة للفيسبوك والإنستجرام. بتشتري مرة واحدة وتستخدمها على طول من غير أي اشتراك شهري.",
    features: [
      "30 قالب بوست بتصاميم متنوعة",
      "قابلة للتعديل على Canva مجاناً",
      "مقاسات فيسبوك وإنستجرام",
      "عروض ووجبات ومناسبات",
      "استخدام مدى الحياة بدون اشتراك",
      "تحميل فوري بعد تأكيد الدفع",
    ],
  }),
];

export const FALLBACK_PORTFOLIO: PortfolioItem[] = [
  { id: "work-ismailia-hub", title: "دليل خدمات الإسماعيلية", image_url: "/images/works/ismailia-hub.svg", link: "https://www.ismailiahub.com", category: "دليل خدمات — 341 خدمة موثقة", sort_order: 1, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-urbano", title: "أوربانو", image_url: "/images/works/urbano.svg", link: "https://urbano1.app", category: "دليل خدمات — 148 مكان موثق", sort_order: 2, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-telkebir", title: "خدمات التل الكبير", image_url: "/images/works/telkebir.svg", link: "https://www.telkebir.com", category: "دليل خدمات + مواعيد قطارات", sort_order: 3, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-ezz-gallery", title: "Ezz Gallery", image_url: "/images/works/ezz-gallery.svg", link: "https://ezzgallery.com", category: "متجر إلكتروني — ديكور وهدايا", sort_order: 4, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-el-fasl", title: "EL FASL — الفصل", image_url: "/images/works/el-fasl.svg", link: "https://el-fasl.vercel.app", category: "منصة تفاعلية للمعلمين", sort_order: 5, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-darsak-ar", title: "درسك AR", image_url: "/images/works/darsak-ar.svg", link: "https://www.drsak.online", category: "دروس واقع معزز للمعلمين", sort_order: 6, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-ebnely", title: "ابنيلي", image_url: "/images/works/ebnely.svg", link: "https://ebnely.vercel.app", category: "دليل أسعار التشطيب في مصر", sort_order: 7, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-nexora-bi", title: "NEXORA BI", image_url: "/images/works/nexora-bi.svg", link: "https://nexora-business-intelligence.vercel.app", category: "منصة ذكاء أعمال", sort_order: 8, created_at: "2026-11-26T00:00:00.000Z" },
  { id: "work-ims", title: "نظام الإدارة المتكامل", image_url: "/images/works/ims.svg", link: "https://integrated-management-system-flame.vercel.app", category: "نظام إدارة مؤسسة تعليمية", sort_order: 9, created_at: "2026-11-26T00:00:00.000Z" },
];

/* ------------------------------------------------------------------ */
/* دوال الجلب: Supabase أولاً، والبيانات الافتراضية عند عدم التوفر     */
/* ------------------------------------------------------------------ */

type DbProductRow = Record<string, unknown> & {
  product_images?: Array<Record<string, unknown>>;
  packages?: Array<Record<string, unknown>>;
  categories?: { name?: string } | null;
};

function mapProduct(row: DbProductRow): Product {
  const images = Array.isArray(row.product_images)
    ? row.product_images.map((im) => ({
        id: String(im.id),
        product_id: String(im.product_id),
        url: String(im.url),
        sort_order: Number(im.sort_order ?? 0),
      }))
    : [];
  const packages = Array.isArray(row.packages)
    ? row.packages.map((pk) => ({
        id: String(pk.id),
        product_id: String(pk.product_id),
        name: String(pk.name),
        price: Number(pk.price),
        features: Array.isArray(pk.features) ? (pk.features as string[]) : [],
        sort_order: Number(pk.sort_order ?? 0),
      }))
    : [];
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    category_id: row.category_id ? String(row.category_id) : null,
    category_name: row.categories?.name ?? null,
    delivery_type: row.delivery_type as Product["delivery_type"],
    short_description: String(row.short_description ?? ""),
    description: String(row.description ?? ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    price: Number(row.price),
    old_price: row.old_price != null ? Number(row.old_price) : null,
    demo_url: row.demo_url ? String(row.demo_url) : null,
    delivery_time: row.delivery_time ? String(row.delivery_time) : null,
    download_file_path: row.download_file_path ? String(row.download_file_path) : null,
    is_active: Boolean(row.is_active ?? true),
    is_featured: Boolean(row.is_featured ?? false),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    images,
    packages,
  };
}

const PRODUCT_SELECT = "*, product_images(*), packages(*), categories(name)";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return FALLBACK_CATEGORIES;
    const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_CATEGORIES;
    return data as Category[];
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function fetchProducts(onlyActive = true): Promise<Product[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return FALLBACK_PRODUCTS.filter((p) => !onlyActive || p.is_active);
    let q = supabase.from("products").select(PRODUCT_SELECT).order("sort_order", { ascending: true });
    if (onlyActive) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return FALLBACK_PRODUCTS.filter((p) => !onlyActive || p.is_active);
    return (data as DbProductRow[]).map(mapProduct);
  } catch {
    return FALLBACK_PRODUCTS.filter((p) => !onlyActive || p.is_active);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    return mapProduct(data as DbProductRow);
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return FALLBACK_PORTFOLIO;
    const { data, error } = await supabase.from("portfolio").select("*").order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_PORTFOLIO;
    return data as PortfolioItem[];
  } catch {
    return FALLBACK_PORTFOLIO;
  }
}

/** آراء العملاء: بتظهر على الموقع بس لو فيه آراء حقيقية في قاعدة البيانات */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}
