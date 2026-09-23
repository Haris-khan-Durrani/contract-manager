/**
 * seed360Template.js
 * Seeds the exact 360 Global Immigration Legal Services Agreement (Bilingual English & Arabic)
 * matching the provided document.
 */
const db = require('../config/db');

async function seed360Agreement() {
  console.log('🌱 Seeding 360 Global Immigration Bilingual Template…');

  const locations = ['NJOPxsxylG8uIEPo9hX9', 'loc_default_001'];

  const formSchema = {
    fields: [
      {
        id: 'f_name',
        key: 'client_name',
        label: 'Client Full Name / اسم العميل',
        type: 'text',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.name',
        contractVariable: 'client_name',
        required: true,
        placeholder: 'e.g. John Doe / محمد علي',
      },
      {
        id: 'f_passport',
        key: 'passport_number',
        label: 'Passport or EID No. / رقم جواز السفر أو الهوية',
        type: 'text',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.customField_passport',
        contractVariable: 'passport_number',
        required: true,
        placeholder: 'e.g. P12345678',
      },
      {
        id: 'f_nationality',
        key: 'nationality',
        label: 'Nationality / الجنسية',
        type: 'text',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.customField_nationality',
        contractVariable: 'nationality',
        required: true,
        placeholder: 'e.g. Sudanese / إماراتي / بريطاني',
      },
      {
        id: 'f_phone',
        key: 'phone',
        label: 'Mobile Number / رقم المحمول',
        type: 'phone',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.phone',
        contractVariable: 'phone',
        required: true,
        placeholder: '+971 50 123 4567',
      },
      {
        id: 'f_email',
        key: 'client_email',
        label: 'Email Address / البريد الإلكتروني',
        type: 'email',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.email',
        contractVariable: 'client_email',
        required: true,
        placeholder: 'client@example.com',
      },
      {
        id: 'f_address',
        key: 'address',
        label: 'Physical Address / العنوان',
        type: 'text',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.address1',
        contractVariable: 'address',
        required: false,
        placeholder: 'Street, City, Country',
      },
      {
        id: 'f_dob',
        key: 'date_of_birth',
        label: 'Date of Birth / تاريخ الميلاد',
        type: 'date',
        source: 'GHL_CONTACT',
        ghlFieldId: 'contact.dateOfBirth',
        contractVariable: 'date_of_birth',
        required: false,
      },
      {
        id: 'f_dependents',
        key: 'dependents',
        label: 'Dependents (if any) / المعالون التابعون',
        type: 'text',
        source: 'USER_INPUT',
        ghlFieldId: '',
        contractVariable: 'dependents',
        required: false,
        placeholder: 'e.g. Spouse + 2 Children / لا يوجد',
      },
      {
        id: 'f_visa',
        key: 'visa_type',
        label: 'Visa Program / برنامج التأشيرة',
        type: 'text',
        source: 'USER_INPUT',
        ghlFieldId: '',
        contractVariable: 'visa_type',
        required: true,
        placeholder: 'Portugal D7 Residency Visa / تأشيرة الإقامة البرتغالية D7',
      },
      {
        id: 'f_fee',
        key: 'contract_value',
        label: 'Total Professional Fees / إجمالي الرسوم المهنية',
        type: 'currency',
        source: 'USER_INPUT',
        ghlFieldId: '',
        contractVariable: 'contract_value',
        required: true,
        placeholder: '€5,000',
      },
      {
        id: 'f_discount_fee',
        key: 'discounted_amount',
        label: 'Total Amount after Exclusive Discount / المبلغ بعد الخصم الحصري',
        type: 'currency',
        source: 'USER_INPUT',
        ghlFieldId: '',
        contractVariable: 'discounted_amount',
        required: true,
        placeholder: '€4,500',
      },
      {
        id: 'f_pay_mode',
        key: 'payment_terms',
        label: 'Payment Mode / طريقة وسداد الدفع',
        type: 'dropdown',
        source: 'USER_INPUT',
        ghlFieldId: '',
        contractVariable: 'payment_terms',
        required: true,
        options: [
          { label: 'Bank Wire Transfer / تحويل بنكي', value: 'Bank Wire Transfer' },
          { label: 'Credit Card / بطاقة ائتمان', value: 'Credit Card' },
          { label: '50% Deposit / 50% Post-Visa Approval / 50% دفعة أولى و50% بعد الموافقة', value: '50% Deposit / 50% Post-Visa' },
        ],
      },
    ],
  };

  const docSchema = {
    title: 'LEGAL SERVICES AGREEMENT / اتفاقية خدمات قانونية - 360 Global Immigration',
    blocks: [
      {
        id: 'b_cover',
        type: 'clause',
        bilingual: true,
        titleEn: 'LEGAL SERVICES AGREEMENT',
        titleAr: 'اتفاقية خدمات قانونية',
        contentEn: '<div style="text-align:center; padding: 25px 0;"><div style="background:#1e293b; color:#fff; display:inline-block; padding: 20px 40px; border-radius: 8px; font-size: 26px; font-weight: bold; letter-spacing: 4px;">3 6 0<br><span style="font-size:12px; font-weight:normal; letter-spacing:2px;">GLOBAL IMMIGRATION</span></div></div>',
        contentAr: '<div style="text-align:center; padding: 25px 0;"><div style="background:#1e293b; color:#fff; display:inline-block; padding: 20px 40px; border-radius: 8px; font-size: 26px; font-weight: bold; letter-spacing: 4px;">3 6 0<br><span style="font-size:12px; font-weight:normal; letter-spacing:2px;">العالمية للهجرة</span></div></div>',
      },
      {
        id: 'b_pagebreak_1',
        type: 'pagebreak',
      },
      {
        id: 'b_agreement_main',
        type: 'clause',
        bilingual: true,
        titleEn: 'AGREEMENT Between 360 Global Immigration LLC AND The client listed in Schedule One WHEREAS:',
        titleAr: 'اتفاقية بين شركة 360 العالمية ذ.م.م. للهجرة و العميل المدرج في الجدول الأول، حيث:',
        contentEn: '<strong>A.</strong> 360 Global Immigration LLC offers services to applicant to apply Visa to enter THE <strong>{{visa_type}}</strong>.<br>The term \'360GI\', is used as 360 Global Immigration LLC in this attached document.<br><br><strong>B.</strong> The client has requested 360 Global to provide such assistance for them. IT IS RECORDED:<br><br><strong>1.</strong> The client appoints 360 Global Immigration LLC to assist the client to apply for the Visa mentioned above.<br><br><strong>2.</strong> 360GI will act on client\'s instructions and will provide all the legal advice and services with best endeavours to obtain the Visa for the client and their dependent(s), if any, as per Schedule One.<br><br><strong>3.</strong> The client warrants that, to the best of their knowledge:<br>a. They have clean police and personal history.<br>b. They are not aware of anything adverse with regards to their application that has not been disclosed to 360GI.<br><br><strong>4.</strong> The advisory fee shall be as set out in Schedule three of this Agreement. Any balance amount as set out in Schedule Three of this Agreement must be paid within twenty-four hours after the visa is granted. The fees incorporate the cost of the immigration services provided by 360GI only and does not include any third-party fees.<br><br><strong>5.</strong> If the client revokes this Agreement or change his/her mind or found to a criminal record after signing this agreement, then 360GI shall nevertheless be deemed to have performed its services satisfactorily.<br><br><strong>6.</strong> If the application is refused due to any error by applicant -like but not limited to- any false/incorrect information provided by applicant OR any fake document provided by applicant for the application purpose OR if the immigration authorities make an enquiry to an authority on the applicant and the authority does not reply to satisfactory level OR if the applicant fails to give correct reply to the questions in the official interview related to visa application. In all these cases applicant will not be refunded any service charges paid to 360GI.<br><br><strong>7.</strong> 360GI will represent the applicant until the successful result of the application. In case the application remains unsuccessful without falling under clause no. 6 of this agreement, 80% of the payment received will be eligible for a refund within 30 working days.',
        contentAr: '<strong>أ.</strong> تقدم شركة 360 Global Immigration LLC خدمات للمتقدمين للحصول على تأشيرة لدخول <strong>{{visa_type}}</strong>.<br>ويستخدم مصطلح "شركة 360 العالمية للهجرة" للإشارة إلى شركة 360 العالمية للهجرة ذ.م.م. في هذه الوثيقة المرفقة.<br><br><strong>ب.</strong> طلب العميل من شركة 360 العالمية للهجرة تقديم هذه المساعدة له، وتم تسجيل ما يلي:<br><br><strong>١.</strong> يعين العميل شركة 360 العالمية للهجرة لمساعدته في التقدم بطلب للحصول على التأشيرة المذكورة أعلاه.<br><br><strong>٢.</strong> ستتصرف شركة 360 العالمية للهجرة وفقاً لتعليمات العميل وستقدم جميع الاستشارات القانونية والخدمات بأقصى جهد للحصول على التأشيرة للعميل والمعالين التابعين له، إن وجدوا، كما هو موضح في الجدول الأول.<br><br><strong>٣.</strong> يضمن العميل أنه على حد علمه:<br>أ. لديه سجل شخصي وشرطي نظيف.<br>ب. لا يعلم بأي شيء سلبي فيما يتعلق بطلبه لم يتم الإفصاح عنه لشركة 360 العالمية للهجرة.<br><br><strong>٤.</strong> يجب دفع الرسوم الاستشارية كما هو موضح في الجدول الثالث من هذه الاتفاقية. كما يتعين دفع أي مبلغ متبقي كما هو موضح في الجدول الثالث من هذه الاتفاقية خلال أربع وعشرين ساعة بعد منح التأشيرة. تشمل الرسوم تكلفة خدمات الهجرة التي تقدمها شركة 360 العالمية للهجرة فقط ولا تشمل أي رسوم للغير.<br><br><strong>٥.</strong> إذا ألغى العميل هذه الاتفاقية أو غير رأيه أو ثبت وجود سجل جنائي بعد توقيع هذه الاتفاقية، فستعتبر شركة 360 العالمية للهجرة على الرغم من ذلك أنها قد قدمت خدماتها بشكل مرضي.<br><br><strong>٦.</strong> إذا تم رفض الطلب بسبب أي خطأ من المتقدم - على سبيل المثال لا الحصر - أي معلومات خاطئة/غير صحيحة قدمها المتقدم أو أي مستند مزور قدمه المتقدم أو عدم رد السلطات أو الفشل في المقابلة الرسمية، فلن يتم رد أي رسوم خدمة دفعها المتقدم.<br><br><strong>٧.</strong> ستمثل شركة 360 العالمية للهجرة المتقدم حتى النتيجة الناجحة للطلب. في حال بقي الطلب غير ناجح دون الوقوع تحت البند رقم ٦، يكون ٨٠٪ من المبلغ المستلم مستحقاً للاسترداد خلال ٣٠ يوم عمل.',
      },
      {
        id: 'b_terms_of_business',
        type: 'clause',
        bilingual: true,
        titleEn: 'TERMS OF BUSINESS',
        titleAr: 'شروط العمل',
        contentEn: '<strong>1.</strong> You are automatically bound by the terms of this application process after you have paid an initial deposit of the total fees or have accepted by signing 360GI application form.<br><br><strong>2.</strong> 360GI will not be liable to client or to officials for misleading documents and information. 360GI will use and rely on information provided by client in the provision of service without independently verifying.<br><br><strong>3.</strong> 360GI is a private firm and do not hold the authority to grant you a visa of any kind. Final decision on all Visa applications rests with the immigration rules.<br><br><strong>4. Disputes & Jurisdiction:</strong> Any dispute, difference, controversy or claim arising out of or in connection with this contract shall be subject to the exclusive jurisdiction of the Courts of the Dubai International Financial Centre ("the DIFC COURTS") governed by UAE civil/commercial laws.<br><br><strong>5.</strong> We attempt to ensure that information on 360GI website is accurate.<br><br><strong>6.</strong> If a client fails to pay the sum due in full within the given time scale, we reserve the right to stop counselling.<br><br><strong>7.</strong> The client undertakes on instructing 360GI to apply for a visa to provide accurate and detailed information.<br><br><strong>8.</strong> The applicant agrees to create a new personal email address and give its access to 360GI.<br><br><strong>9.</strong> The visa application along with required documents will be ready to submit after it is checked by applicant.<br><br><strong>10.</strong> Applicant permits 360GI to communicate with any authority on applicant\'s behalf.<br><br><strong>11.</strong> 360GI shall not be liable for force majeure events.<br><br><strong>12.</strong> This agreement is written in English and Arabic. In case of discrepancies, the English version shall prevail.<br><br><strong>Complaints:</strong> All complaints should be sent to:<br>Telephone: +971-58-580-3412<br>E-mail: support@360globalimmigration.com',
        contentAr: '<strong>١.</strong> أنت ملزم تلقائياً بشروط عملية التقديم هذه بعد أن تدفع دفعة أولى من الرسوم أو موافقتك بالتوقيع على نموذج الطلب الخاص بشركة 360 العالمية للهجرة.<br><br><strong>٢.</strong> لن تكون شركة 360 العالمية للهجرة مسؤولة أمام العميل أو المسؤولين عن المستندات والمعلومات المضللة.<br><br><strong>٣.</strong> شركة 360 العالمية للهجرة هي شركة خاصة ولا تملك سلطة منح أي نوع من التأشيرات.<br><br><strong>٤. النزاعات والاختصاص القضائي:</strong> تخضع أي نزاعات للاختصاص القضائي الحصري لمحاكم مركز دبي المالي العالمي ("محاكم DIFC") وتفسر وفقاً للقوانين المدنية والتجارية لدولة الإمارات العربية المتحدة.<br><br><strong>٥.</strong> نحاول ضمان دقة المعلومات في جميع الأوقات.<br><br><strong>٦.</strong> في حال عدم سداد الرسوم المستحقة يحق للشركة إيقاف المعاملة ومتابعة الإجراءات القانونية.<br><br><strong>٧.</strong> يتعهد العميل بتقديم كافة المستندات والمعلومات الصحيحة والمفصلة.<br><br><strong>٨.</strong> يوافق المتقدم على تخصيص بريد إلكتروني خاص بالمعاملة ومشاركته مع الشركة.<br><br><strong>٩.</strong> مراجعة واعتماد ملف الطلب والموافقة الخطية قبل تقديمه رسمياً.<br><br><strong>١٠.</strong> تفويض الشركة بالتواصل مع الجهات والسلطات المختصة نيابة عن المتقدم.<br><br><strong>١١.</strong> إخلاء المسؤولية عن حالات القوة القاهرة والظروف الطارئة.<br><br><strong>١٢.</strong> تم تحرير هذه الاتفاقية باللغتين الإنجليزية والعربية وتسود النسخة الإنجليزية عند الاختلاف.<br><br><strong>الشكاوى:</strong> ترسل الشكاوى إلى:<br>هاتف: 3412-580-58-971+<br>البريد الإلكتروني: support@360globalimmigration.com',
      },
      {
        id: 'b_schedule_one',
        type: 'clause',
        bilingual: true,
        titleEn: 'COURSE OF ACTION & SCHEDULE ONE: Main Applicant Details',
        titleAr: 'خطة العمل والجدول الأول: بيانات المتقدم الرئيسي',
        contentEn: '<strong>Main Applicant:</strong><br><strong>Name:</strong> {{client_name}}<br><strong>Passport/EID No.:</strong> {{passport_number}}<br><strong>Nationality:</strong> {{nationality}}<br><strong>Mobile:</strong> {{phone}}<br><strong>Address:</strong> {{address}}<br><strong>Email Address:</strong> {{client_email}}<br><strong>Date of Birth:</strong> {{date_of_birth}}<br><strong>Dependents:</strong> {{dependents}}',
        contentAr: '<strong>المتقدم الرئيسي:</strong><br><strong>الاسم:</strong> {{client_name}}<br><strong>رقم جواز السفر / الهوية:</strong> {{passport_number}}<br><strong>الجنسية:</strong> {{nationality}}<br><strong>المحمول:</strong> {{phone}}<br><strong>العنوان:</strong> {{address}}<br><strong>عنوان البريد الإلكتروني:</strong> {{client_email}}<br><strong>تاريخ الميلاد:</strong> {{date_of_birth}}<br><strong>المعالون:</strong> {{dependents}}',
      },
      {
        id: 'b_schedule_two',
        type: 'clause',
        bilingual: true,
        titleEn: 'SCHEDULE TWO: Scope of Services',
        titleAr: 'الجدول الثاني: نطاق الخدمات',
        contentEn: '<strong>Services include before visa:</strong><br>• A detailed assessment of client\'s circumstances.<br>• Advising for exact documentation needed.<br>• Completing online application for applicant and dependents.<br>• Assisting with business plan/financial requirements.<br>• Ongoing application tracking.<br><br><strong>After Visa Services:</strong><br>• Complete visa requirements for visa holder.<br>• Assistance with registration at SEF / Immigration Authorities.<br>• Support with Tax Number (NIF) application.<br>• Assistance with opening personal bank account.<br>• Social Security (NISS) registration.<br>• Introduction to certified accountants & legal professionals.<br>• Property rental / accommodation setup guidance.<br>• Health insurance enrollment guidance.<br>• TRC and residency card processing.',
        contentAr: '<strong>تشمل خدمات ما قبل التأشيرة:</strong><br>• تقييم مفصل لظروف العميل وملفه.<br>• تقديم المشورة بشأن المستندات المطلوبة بدقة.<br>• استكمال الطلب عبر الإنترنت للمتقدم والمعالين.<br>• مساعدة المتقدم في موضوع خطة العمل.<br>• إبقاء المتقدم على اطلاع بحالة طلبه.<br>• الاستمرار في العمل حتى النتيجة الناجحة.<br><br><strong>خدمات ما بعد التأشيرة:</strong><br>• استكمال متطلبات إصدار بطاقة الإقامة.<br>• المساعدة في التسجيل لدى سلطة الهجرة والحدود (SEF).<br>• استخراج الرقم الضريبي البرتغالي (NIF).<br>• المساعدة في فتح الحساب البنكي.<br>• التسجيل في الضمان الاجتماعي (NISS).<br>• التعريف بالمحاسبين المعتمدين والمحامين.<br>• التوجيه بشأن استئجار السكن والمرافق.<br>• المشورة بشأن التأمين الصحي.<br>• استخراج بطاقة الإقامة (TRC) أو الجنسية.',
      },
      {
        id: 'b_schedule_three',
        type: 'clause',
        bilingual: true,
        titleEn: 'SCHEDULE THREE: Fees & Payment Terms',
        titleAr: 'الجدول الثالث: الرسوم وشروط الدفع',
        contentEn: '<strong>Total Fees payable as 360GI Professional charges:</strong> {{contract_value}}<br><strong>Total Amount after exclusive discount:</strong> {{discounted_amount}}<br><strong>Payment Mode:</strong> {{payment_terms}}<br><strong>Additional Information:</strong> N/A<br><br><em>All fees are payable in EURO or equivalent currency. Agreed fees are subject to 360GI Terms and Conditions.</em>',
        contentAr: '<strong>إجمالي الرسوم المستحقة كرسوم مهنية:</strong> {{contract_value}}<br><strong>المبلغ الإجمالي بعد الخصم الحصري:</strong> {{discounted_amount}}<br><strong>طريقة وسداد الدفع:</strong> {{payment_terms}}<br><strong>معلومات إضافية:</strong> لا يوجد<br><br><em>تستحق جميع الرسوم باليورو أو ما يعادلها بالعملات الأخرى وفقاً لشروط وأحكام 360GI.</em>',
      },
      {
        id: 'b_declaration',
        type: 'clause',
        bilingual: true,
        titleEn: 'DECLARATION & ACKNOWLEDGEMENT',
        titleAr: 'إقرار وتعهد',
        contentEn: 'I/we, <strong>{{client_name}}</strong> holding <strong>{{nationality}}</strong> Passport Number <strong>{{passport_number}}</strong> have hired 360 Global Immigration LLC by signing an agreement to assist me/us for my <strong>{{visa_type}}</strong>.<br><br>I/we declare that I/we have read and understand the declaration, terms of business, and agreement, and by signing below, I/we enter into a legal contract with 360GI.',
        contentAr: 'أنا/نحن، <strong>{{client_name}}</strong> حامل جواز سفر <strong>{{nationality}}</strong> رقم <strong>{{passport_number}}</strong> قمنا بتعيين شركة 360 Global Immigration LLC لمساعدتي/مساعدتنا للحصول على <strong>{{visa_type}}</strong>.<br><br>أقر بأنني قرأت وفهمت الإقرار وشروط العمل والاتفاقية، وبالتوقيع أدناه أبرم عقداً قانونياً ملزماً مع 360GI.',
      },
      {
        id: 'b_signature',
        type: 'signature',
        label: 'Contract Acceptance & Signatures / قبول العقد والتوقيعات',
      },
    ],
  };

  for (const loc of locations) {
    // 1. Create or update Form
    const [existingForm] = await db.execute(
      'SELECT id FROM contract_forms WHERE location_id = ? AND name LIKE ?',
      [loc, '%360 Global%']
    );

    let formId = existingForm[0]?.id;
    if (!formId) {
      const [fRes] = await db.execute(
        `INSERT INTO contract_forms (location_id, name, description, schema_json, created_by)
         VALUES (?, '360 Global Immigration Intake Form / استمارة الهجرة', 'Client details, passport, visa program, and fee structure.', ?, 'user_admin_001')`,
        [loc, JSON.stringify(formSchema)]
      );
      formId = fRes.insertId;
      console.log(`✅ Seeded Form ID #${formId} for location: ${loc}`);
    }

    // 2. Create or update Template
    const [existingTemp] = await db.execute(
      'SELECT id FROM contract_templates WHERE location_id = ? AND name LIKE ?',
      [loc, '%360 Global%']
    );

    if (!existingTemp.length) {
      const [tRes] = await db.execute(
        `INSERT INTO contract_templates
           (location_id, form_id, name, contract_type, current_version, is_active,
            validity_days, document_schema_json, conditional_rules_json,
            creation_rules_json, signing_parties_json)
         VALUES (?, ?, '360 Global Immigration - Legal Services Agreement (Bilingual EN/AR)', 'Legal Services Agreement', 1, 1, 14, ?, '[]', '{"enabled": false}', '[]')`,
        [loc, formId, JSON.stringify(docSchema)]
      );

      const templateId = tRes.insertId;
      await db.execute(
        `INSERT INTO contract_template_versions
           (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
         VALUES (?, 1, ?, '[]', 'Official 360GI Bilingual Legal Services Agreement', 'user_admin_001')`,
        [templateId, JSON.stringify(docSchema)]
      );
      console.log(`✅ Seeded Template ID #${templateId} for location: ${loc}`);
    }
  }

  console.log('🎉 360 Global Immigration Template & Form successfully created for all locations!');
}

seed360Agreement()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
