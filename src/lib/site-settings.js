const EMPTY_FAQ_ITEM = {
  questionAr: '',
  answerAr: '',
  questionEn: '',
  answerEn: '',
};

export const defaultFaqItems = [
  {
    questionAr: 'كم يستغرق تنفيذ الدعوة بعد الطلب؟',
    answerAr: 'غالبًا يتم تجهيز الدعوة خلال وقت قصير بعد استلام التفاصيل النهائية، ويختلف ذلك حسب القالب والتعديلات المطلوبة.',
    questionEn: 'How long does it take to deliver the invitation?',
    answerEn: 'Most invitations are prepared shortly after receiving the final details, depending on the template and requested edits.',
  },
  {
    questionAr: 'هل يمكن تعديل النصوص والصور بعد إنشاء الدعوة؟',
    answerAr: 'نعم، يمكن تعديل النصوص والصور والبيانات الأساسية من خلال لوحة التحكم أو أثناء مرحلة التجهيز حسب حالة الدعوة.',
    questionEn: 'Can I edit the text and images after creating the invitation?',
    answerEn: 'Yes. Text, images, and core details can be edited from the dashboard or during the preparation stage depending on the invitation status.',
  },
  {
    questionAr: 'هل تعمل الدعوة على الجوال والكمبيوتر؟',
    answerAr: 'نعم، القوالب مصممة لتعمل بشكل متجاوب على الجوال والأجهزة اللوحية والكمبيوتر.',
    questionEn: 'Do the invitations work on mobile and desktop?',
    answerEn: 'Yes. The templates are responsive and designed to work well on mobile, tablet, and desktop devices.',
  },
  {
    questionAr: 'هل يمكن مشاركة الدعوة عبر واتساب؟',
    answerAr: 'بالتأكيد، يمكن مشاركة رابط الدعوة بسهولة عبر واتساب أو أي وسيلة تواصل أخرى.',
    questionEn: 'Can I share the invitation on WhatsApp?',
    answerEn: 'Absolutely. You can easily share the invitation link through WhatsApp or any other messaging platform.',
  },
  {
    questionAr: 'هل يمكن إضافة موقع القاعة والموسيقى والصور؟',
    answerAr: 'نعم، معظم القوالب تدعم إضافة موقع القاعة، صور المناسبة، والموسيقى أو الوسائط حسب القالب المختار.',
    questionEn: 'Can I add the venue location, music, and images?',
    answerEn: 'Yes. Most templates support adding the venue location, event images, and music or media depending on the selected template.',
  },
];

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeFaqItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => ({
      questionAr: sanitizeText(item?.questionAr),
      answerAr: sanitizeText(item?.answerAr),
      questionEn: sanitizeText(item?.questionEn),
      answerEn: sanitizeText(item?.answerEn),
    }))
    .filter((item) => item.questionAr && item.answerAr);
}

export function extractFaqItems(settings) {
  const items = normalizeFaqItems(settings?.footerConfig?.faqItems);
  return items.length ? items : defaultFaqItems;
}

export function buildFooterConfig(settings, faqItems) {
  const currentFooterConfig =
    settings?.footerConfig && typeof settings.footerConfig === 'object' && !Array.isArray(settings.footerConfig)
      ? settings.footerConfig
      : {};

  return {
    ...currentFooterConfig,
    faqItems: normalizeFaqItems(faqItems),
  };
}

export function createEmptyFaqItem() {
  return { ...EMPTY_FAQ_ITEM };
}
