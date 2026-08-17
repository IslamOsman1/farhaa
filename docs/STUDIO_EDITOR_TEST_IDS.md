# Studio Editor Test IDs

هذا الملف يوثق خريطة `data-testid` الخاصة بمحرر الاستوديو الجديد حتى تبقى اختبارات `e2e` مستقرة وسهلة الصيانة، وحتى لا تعتمد على النصوص العربية الظاهرة أو ترتيب العناصر داخل الواجهة.

المرجع الحالي للاختبارات هو:
- [tests/e2e/studio-editor.spec.js](/D:/فرحه/tests/e2e/studio-editor.spec.js)

الهدف من التسمية:
- استخدام أسماء ثابتة تصف السلوك وليس النص المرئي.
- الفصل بين عناصر الصفحة الرئيسية وعناصر الـ `iframe`.
- دعم التحقق من النصوص الحرة والنصوص المرتبطة بالقالب بنفس النمط.

## Page-Level Test IDs

هذه العناصر موجودة في صفحة الاستوديو نفسها:

- `studio-refresh-preview`
- `studio-open-fullscreen-preview`
- `studio-save-invitation`
- `studio-publish-invitation`
- `studio-create-invitation`
- `studio-add-free-text`
- `studio-add-free-image`
- `studio-frame-host`

## Template Text Controls

هذه العناصر تظهر عند تحديد نص مرتبط بالقالب:

- `studio-template-text-input`
- `studio-template-text-color`
- `studio-template-text-font`
- `studio-template-text-reset`

ولكل عنصر نصي مرتبط بالقالب داخل القائمة الجانبية:

- `studio-template-text-item-${item.path}`

مثال:
- `studio-template-text-item-couple.groomName`

## Free Element Controls

هذه العناصر تظهر عند تحديد عنصر حر قابل للتحرير:

- `studio-free-text-input`
- `studio-free-text-color`
- `studio-free-text-font`
- `studio-free-text-size`
- `studio-delete-selected-element`

## Template Chooser Test IDs

هذه العناصر تخص صفحة اختيار القالب قبل إنشاء جلسة التعديل:

- `studio-template-card-${template.slug}`
- `studio-template-create-${template.slug}`

مثال:
- `studio-template-create-classic`

## Iframe Test IDs

هذه العناصر تُحقن داخل المعاينة نفسها حتى يمكن التحقق منها عبر `frameLocator(...)`:

- `iframe-template-text-${suffix}`
- `iframe-free-element-${suffix}`
- `iframe-free-text-${suffix}`
- `iframe-free-image-${suffix}`

حيث إن `suffix` هو نسخة آمنة ومبسطة من المفتاح أو المعرف الداخلي.

أمثلة استخدام:

```js
await page.getByTestId('studio-add-free-text').click();
await expect(frame.locator('[data-testid^="iframe-free-text-"]')).toHaveCount(1);
await expect(frame.locator('[data-testid^="iframe-template-text-"]')).toHaveCountGreaterThan(0);
```

## Naming Rules

عند إضافة `data-testid` جديد للمحرر:

- استخدم بادئة `studio-` لعناصر الصفحة الأساسية.
- استخدم بادئة `iframe-` للعناصر التي تُرسم داخل المعاينة.
- اجعل الاسم معبرًا عن الوظيفة وليس عن النص المعروض.
- حافظ على النمط الحالي بدل إدخال صيغ تسمية متعددة لنفس النوع.
- إذا كان العنصر ديناميكيًا، أضف لاحقة مستقرة مشتقة من `id` أو `path` بدل الفهرس البصري.

## Maintenance Notes

- يفضل في Playwright استخدام `getByTestId(...)` كلما أمكن.
- داخل الـ `iframe` يفضل استخدام `frameLocator('iframe')` ثم `locator('[data-testid=...]')`.
- إذا تغيّر النص المرئي في الواجهة، لا يجب أن تحتاج الاختبارات إلى تغيير ما دام `data-testid` ثابتًا.
- أي عنصر جديد قابل للتحرير أو الحذف أو التحريك يجب أن يحصل على `data-testid` واضح قبل إضافة اختبار له.
