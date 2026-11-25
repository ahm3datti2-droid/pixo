import { getPublicClient } from "./supabase";
import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  store_name: "Pixo",
  whatsapp_number: "01117543009",
  instapay_address: "pixo@instapay",
  vodafone_cash_number: "01117543009",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  hero_title: "حلول ديجيتال جاهزة.. لبيزنس أقوى",
  hero_subtitle:
    "متاجر إلكترونية، منيو ديجيتال، أنظمة حجز، تصميم وهوية بصرية، وباقات تسويق — كل اللي بيزنسك محتاجه في مكان واحد، بأسعار ثابتة وواضحة، وتسليم في معاد محدد.",
  announcement_text: "خصم لفترة محدودة على باقات التسويق — اطلب دلوقتي قبل ما العرض يخلص",
};

/** إعدادات المتجر: من قاعدة البيانات لو متاحة، وإلا الافتراضية */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return DEFAULT_SETTINGS;
    const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
