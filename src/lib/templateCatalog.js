export const templateCatalog = [
  { id: 'jathuandthanu', name: 'Jathu & Thanu', arabicName: 'جاثو وثانو', desc: 'دعوة زفاف هندية/آسيوية فاخرة', image: '/jathuandthanu/preview.png' },
  { id: 'royal', name: 'Royal', arabicName: 'الملكي', desc: 'تصميم فخم بمظروف متحرك', image: '/majestic/intro-poster-new.jpg' },
  { id: 'majestic', name: 'Majestic', arabicName: 'ماجستيك', desc: 'دعوة فيديو سينمائية بمظهر المظروف المتحرك', image: '/majestic/intro-poster-new.jpg' },
  { id: 'twilight', name: 'Twilight', arabicName: 'تويلايت', desc: 'دعوة غامضة وفخمة مستوحاة من الألوان الداكنة', image: '/twilight/preview.jpg' },
  { id: 'imperial', name: 'Imperial', arabicName: 'إمبريال', desc: 'دعوة زفاف إمبراطورية فاخرة بألوان عميقة', image: '/imperial/preview.jpg' },
  { id: 'toscana', name: 'Toscana', arabicName: 'توسكانا', desc: 'دعوة زفاف دافئة بألوان التيراكوتا والطبيعة', image: '/toscana/preview.jpg' },
  { id: 'sacredgarden', name: 'The Sacred Garden', arabicName: 'الحديقة المقدسة', desc: 'دعوة زفاف تتميز بالورود والحدائق', image: '/sacredgarden/preview.png' },
  { id: 'blossomoud', name: 'Blossom Oud', arabicName: 'بلوسوم عود', desc: 'دعوة زفاف أنيقة مستوحاة من العود والأزهار', image: '/blossomoud/preview.png' },
  { id: 'dolcevita', name: 'Dolce Vita', arabicName: 'دولتشي فيتا', desc: 'دعوة زفاف إيطالية الطابع', image: '/dolcevita/preview.png' },
  { id: 'destinationlove', name: 'Destination Love', arabicName: 'حب السفر', desc: 'دعوة زفاف بتصميم تذكرة سفر', image: '/destinationlove/preview.jpg' },
  { id: 'classic', name: 'Classic', arabicName: 'كلاسيك', desc: 'باب يُفتح + طيور', image: '/classic/assets/preloader-poster.jpg' },
  { id: 'bab', name: 'Bab', arabicName: 'باب الفرح', desc: 'دُقّوا ثلاثاً ويُفتح الباب', image: '/bab/assets/door-poster.jpg' },
  { id: 'reverie', name: 'Reverie', arabicName: 'حُلم وردي', desc: 'مظروف وردي يُفتح على بحيرة', image: '/reverie/assets/envelope-poster.jpg' },
  { id: 'ring', name: 'Ring', arabicName: 'الخاتم', desc: 'صندوق خاتم يُفتح', image: '/ring/assets/video-poster.jpg' },
  { id: 'letter', name: 'Letter', arabicName: 'رسالة', desc: 'مظروف يُفتح', image: '/letter/assets/letter-open.jpg' },
  { id: 'disney', name: 'Disney', arabicName: 'ديزني', desc: 'قصر وبوّابة سحرية', image: '/disney/assets/door-poster.jpg' },
  { id: 'rozana', name: 'Rozana', arabicName: 'روزنة', desc: 'ورقة تنشقّ عن مشهد حفلكم', image: '/rozana/assets/poster.jpg' },
  { id: 'hadeel', name: 'Hadeel', arabicName: 'هديل', desc: 'هديل يحلّق ويحطّ على النافورة', image: '/hadeel/assets/poster.jpg' },
  { id: 'wisal', name: 'Wisal', arabicName: 'وِصال', desc: 'يدان تلتقيان في ممرّ الضوء', image: '/wisal/assets/poster.jpg' },
  { id: 'vangogh', name: 'Vangogh', arabicName: 'ليلة النجوم', desc: 'سماء فان كوخ تُرسَم حيّاً', image: '/vangogh/assets/preloader-poster.jpg' },
  { id: 'blush', name: 'Blush', arabicName: 'وردة', desc: 'مظروف بفيونكة يُفتح على حديقة', image: '/blush/assets/share.jpg' },
];

export function findTemplateById(templateId) {
  return templateCatalog.find((template) => template.id === templateId) || null;
}
