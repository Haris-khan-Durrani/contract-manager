import{C as e,D as t,E as n,I as r,L as i,N as a,O as o,P as s,R as c,S as l,T as u,_ as d,a as f,b as p,c as ee,f as te,g as m,h,i as g,j as _,k as v,p as y,t as b,v as x,w as S,x as C}from"./index-CwxhwAtX.js";import{n as w,t as T}from"./defaultAssets-9UPTUkve.js";var E={class:`signature-pad-container`},D={class:`sig-tabs`},O={class:`canvas-wrapper`},k={class:`canvas-header`},A=[`disabled`],j={class:`canvas-box`},ne={class:`type-wrapper`},M={key:0,class:`type-styles-list`},N={class:`style-cards`},P=[`onClick`],F={class:`upload-wrapper`},I={key:0,class:`upload-placeholder`},L={key:1,class:`upload-preview-box`},R=[`src`],z=b({__name:`SignaturePad`,props:{initialName:{type:String,default:``}},emits:[`change`],setup(t,{emit:d}){let f=t,ee=d,g=s(`draw`),b=s(!1),S=s(!1),w=s(f.initialName||``),T=s(0),z=s(!1),B=s(``),V=s(null),H=s(null),re=[{name:`Cursive Elegant`,family:`'Dancing Script', 'Brush Script MT', cursive`,style:`italic`},{name:`Casual Hand`,family:`'Caveat', cursive`,style:`normal`},{name:`Formal Script`,family:`'Great Vibes', cursive`,style:`normal`},{name:`Modern Signature`,family:`'Allura', cursive`,style:`italic`}];function U(e,t=g.value){ee(`change`,{dataUrl:e||null,method:t})}function ie(e){g.value=e,e===`draw`?(u(()=>ae()),b.value&&V.value?pe():U(null,`draw`)):e===`type`?G():e===`upload`&&U(B.value||null,`upload`)}let W=null;function ae(){let e=V.value;if(!e)return;let t=e.getBoundingClientRect(),n=window.devicePixelRatio||1,r=t.width||560,i=t.height||160;e.width=r*n,e.height=i*n,W=e.getContext(`2d`),W.scale(n,n),W.strokeStyle=`#0f172a`,W.lineWidth=2.5,W.lineCap=`round`,W.lineJoin=`round`}function oe(e){let t=V.value.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}function se(e){S.value=!0,b.value=!0;let t=oe(e);W.beginPath(),W.moveTo(t.x,t.y)}function ce(e){if(!S.value)return;let t=oe(e);W.lineTo(t.x,t.y),W.stroke()}function le(){S.value&&(S.value=!1,W.closePath(),pe())}function ue(e){if(e.touches.length!==1)return;S.value=!0,b.value=!0;let t=V.value.getBoundingClientRect(),n=e.touches[0];W.beginPath(),W.moveTo(n.clientX-t.left,n.clientY-t.top)}function de(e){if(!S.value||e.touches.length!==1)return;let t=V.value.getBoundingClientRect(),n=e.touches[0];W.lineTo(n.clientX-t.left,n.clientY-t.top),W.stroke()}function fe(){let e=V.value;e&&W&&(W.save(),W.setTransform(1,0,0,1,0,0),W.clearRect(0,0,e.width,e.height),W.restore(),b.value=!1,U(null,`draw`))}function pe(){let e=V.value;e&&b.value&&U(e.toDataURL(`image/png`),`draw`)}function me(e){T.value=e,G()}function G(){if(!w.value.trim()){U(null,`type`);return}let e=document.createElement(`canvas`);e.width=600,e.height=160;let t=e.getContext(`2d`);t.clearRect(0,0,600,160);let n=re[T.value]||re[0];t.font=`${n.style||`normal`} 52px ${n.family}`,t.fillStyle=`#0f172a`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(w.value.trim(),300,80),U(e.toDataURL(`image/png`),`type`)}function he(){H.value?.click()}function ge(e){let t=e.target.files?.[0];t&&ve(t)}function _e(e){z.value=!1;let t=e.dataTransfer.files?.[0];t&&ve(t)}function ve(e){if(!e.type.startsWith(`image/`))return;let t=new FileReader;t.onload=e=>{B.value=e.target.result,U(B.value,`upload`)},t.readAsDataURL(e)}function ye(){B.value=``,H.value&&(H.value.value=``),U(null,`upload`)}return _(()=>f.initialName,e=>{e&&!w.value&&(w.value=e,g.value===`type`&&G())}),n(()=>{ae(),window.addEventListener(`resize`,ae),w.value&&g.value===`type`&&G()}),(t,n)=>(o(),C(`div`,E,[x(`div`,D,[x(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:g.value===`draw`}]),onClick:n[0]||=e=>ie(`draw`)},[...n[6]||=[x(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[x(`path`,{d:`M12 20h9`}),x(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),e(` Draw `,-1)]],2),x(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:g.value===`type`}]),onClick:n[1]||=e=>ie(`type`)},[...n[7]||=[x(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[x(`polyline`,{points:`4 7 4 4 20 4 20 7`}),x(`line`,{x1:`9`,y1:`20`,x2:`15`,y2:`20`}),x(`line`,{x1:`12`,y1:`4`,x2:`12`,y2:`20`})],-1),e(` Type `,-1)]],2),x(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:g.value===`upload`}]),onClick:n[2]||=e=>ie(`upload`)},[...n[8]||=[x(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[x(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),x(`polyline`,{points:`17 8 12 3 7 8`}),x(`line`,{x1:`12`,y1:`3`,x2:`12`,y2:`15`})],-1),e(` Upload `,-1)]],2)]),a(x(`div`,O,[x(`div`,k,[n[9]||=x(`span`,{class:`canvas-hint`},`Draw your signature with mouse, stylus, or finger`,-1),x(`button`,{type:`button`,class:`btn-clear`,onClick:fe,disabled:!b.value},` Clear `,8,A)]),x(`div`,j,[x(`canvas`,{ref_key:`canvasRef`,ref:V,class:`drawing-canvas`,onMousedown:se,onMousemove:ce,onMouseup:le,onMouseleave:le,onTouchstart:h(ue,[`prevent`]),onTouchmove:h(de,[`prevent`]),onTouchend:h(le,[`prevent`])},null,544),n[10]||=x(`div`,{class:`signature-baseline`},[x(`span`,{class:`sig-x`},`✕`)],-1)])],512),[[y,g.value===`draw`]]),a(x(`div`,ne,[n[12]||=x(`label`,{class:`form-label`},`Type your full legal name:`,-1),a(x(`input`,{type:`text`,"onUpdate:modelValue":n[3]||=e=>w.value=e,class:`sig-text-input`,placeholder:`e.g. Jane Doe`,maxlength:`60`,onInput:G},null,544),[[te,w.value]]),w.value.trim()?(o(),C(`div`,M,[n[11]||=x(`label`,{class:`form-label`,style:{"margin-top":`var(--space-4)`}},`Select signature style:`,-1),x(`div`,N,[(o(),C(m,null,v(re,(e,t)=>x(`div`,{key:t,class:r([`style-card`,{selected:T.value===t}]),onClick:e=>me(t)},[x(`span`,{style:i({fontFamily:e.family,fontStyle:e.style||`italic`,fontSize:`1.6rem`})},c(w.value),5)],10,P)),64))])])):p(``,!0)],512),[[y,g.value===`type`]]),a(x(`div`,F,[x(`div`,{class:r([`drop-zone`,{dragging:z.value}]),onDragover:n[4]||=h(e=>z.value=!0,[`prevent`]),onDragleave:n[5]||=h(e=>z.value=!1,[`prevent`]),onDrop:h(_e,[`prevent`]),onClick:he},[x(`input`,{type:`file`,ref_key:`fileInputRef`,ref:H,accept:`image/png, image/jpeg, image/webp`,style:{display:`none`},onChange:ge},null,544),B.value?(o(),C(`div`,L,[x(`img`,{src:B.value,alt:`Signature preview`,class:`uploaded-img`},null,8,R),x(`button`,{type:`button`,class:`btn-clear`,onClick:h(ye,[`stop`])},`Remove`)])):(o(),C(`div`,I,[...n[13]||=[l(`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-a139541d><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" data-v-a139541d></path><path d="M12 12v9" data-v-a139541d></path><path d="m16 16-4-4-4 4" data-v-a139541d></path></svg><p class="drop-text" data-v-a139541d>Click or drag an image of your signature here</p><span class="drop-hint" data-v-a139541d>PNG, JPG or WEBP (transparent background recommended)</span>`,3)]]))],34)],512),[[y,g.value===`upload`]])]))}},[[`__scopeId`,`data-v-a139541d`]]),B={class:`public-sign-portal`},V={class:`portal-header`},H={class:`portal-header-inner`},re={key:0,class:`portal-header-meta`},U={key:0,class:`expiry-pill`},ie={class:`portal-main`},W={key:0,class:`portal-loading animate-fade-in`},ae={key:1,class:`portal-state-view animate-fade-in`},oe={class:`glass-card status-card`},se={key:0},ce={key:1},le={key:2},ue={class:`status-head`},de={class:`status-text`},fe={key:2,class:`portal-completed-view animate-fade-in`},pe={class:`glass-card completion-card`},me={class:`completion-title`},G={class:`receipt-box`},he={class:`receipt-row`},ge={class:`receipt-val`},_e={key:0,class:`receipt-row`},ve={class:`receipt-val`},ye={key:1,class:`receipt-row`},be={class:`sha-code`},xe={key:3,class:`portal-active-view animate-fade-in`},Se={class:`contract-hero-banner`},Ce={class:`hero-left`},we={class:`hero-top-row`},Te={key:0,class:`mobile-client-pill`},Ee={class:`hero-title`},De={class:`hero-right`},Oe={class:`hero-client-card`},ke={class:`hero-card-v`},Ae={class:`hero-card-email`},je={key:0,class:`doc-nav-sticky-bar`},Me={class:`doc-nav-bar-inner`},Ne={class:`doc-nav-info`},Pe={class:`doc-nav-badge`},Fe={width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.2`,style:{"margin-right":`4px`}},Ie={class:`doc-nav-title`},Le={class:`doc-nav-actions`},Re={key:0,class:`mobile-view-toggle`},ze={key:1,class:`mobile-zoom-pill-group`},Be=[`innerHTML`],Ve={key:1,class:`document-paper`},He={class:`paper-header`},Ue={class:`header-branding-row`},We={class:`paper-type-badge`},Ge={class:`doc-main-heading`},Ke={class:`doc-meta-bar`},qe={class:`doc-meta-item`},Je={class:`doc-meta-v`},Ye={key:0,class:`doc-meta-item`},Xe={class:`doc-meta-v`},Ze={key:1,class:`doc-meta-item`},Qe={class:`doc-meta-v`},$e={key:2,class:`doc-meta-item`},et={class:`doc-meta-v`},tt={key:3,class:`doc-meta-item`},nt={class:`doc-meta-v`},rt={key:4,class:`doc-meta-item`},it={class:`doc-meta-v`},at={class:`paper-body`},ot={class:`bilingual-col bilingual-en`,dir:`ltr`},st={key:0,class:`clause-title`},ct=[`innerHTML`],lt={class:`bilingual-col bilingual-ar`,dir:`rtl`},ut={key:0,class:`clause-title font-arabic`},dt=[`innerHTML`],ft={key:0,class:`clause-title`},pt=[`innerHTML`],mt={key:2,class:`doc-block block-paragraph`},ht=[`innerHTML`],gt={key:3,class:`doc-block block-heading`},_t={class:`heading-content`},vt={key:4,class:`doc-block block-key-value`},yt={key:0,class:`table-block-title`},bt={class:`kv-grid`},xt={class:`kv-key`},St={class:`kv-val`},Ct={key:5,class:`doc-block block-team-table`},wt={class:`table-responsive`},Tt={class:`doc-table`},Et={key:6,class:`doc-block block-table`},Dt={key:0,class:`table-block-title`},Ot={class:`table-responsive`},kt={class:`doc-table`},At={key:0},jt={class:`sign-execution-section`},Mt={class:`glass-card execution-card`},Nt={class:`execution-body`},Pt={class:`form-group signer-name-group`},Ft={class:`sig-pad-container`},It={class:`consent-box`},Lt={class:`consent-label`},Rt={class:`execution-checklist`},zt={class:`check-dot`},Bt={class:`check-dot`},Vt={class:`check-dot`},Ht={key:0,class:`alert-banner alert-danger`,style:{"margin-top":`14px`}},Ut={class:`execution-foot`},Wt={key:0,class:`missing-req-hint`},Gt={key:0},Kt={key:1},qt={key:2},Jt=[`disabled`],Yt={key:0,class:`spinner-sm`},Xt={key:1,width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.2`},K=b({__name:`PublicSignView`,setup(u){let h=f().params.token,_=`http://localhost:3001/api`,y=s(!1),b=s(`a4`),E=s(1),D=s(!1),O=s(1);function k(){if(typeof window>`u`)return;let e=window.innerWidth;if(y.value=e<840,e<840){let t=Math.max(260,e-16),n=Math.min(1,Math.round(t/794*100)/100);E.value=n,D.value||(O.value=n),b.value||=`a4`}else E.value=1,D.value||(O.value=1)}function A(){D.value=!1,O.value=E.value}function j(e){D.value=!0;let t=Math.round((O.value+e)*100)/100;t>=.3&&t<=1.8&&(O.value=t)}let ne=d(()=>!y.value||b.value===`responsive`?{}:{zoom:O.value}),M=s(!0),N=s(`sign`),P=s(``),F=s(``),I=s(null),L=s(`NORMAL`),R=s({name:``,email:``,phone:``,idNumber:``,nationality:``,address:``}),K=s([]),q=s(``),J=s(``),Zt=s(`draw`),Y=s(!1),X=s(!1),Z=s(``),Q=s(null),Qt=s(``),$t=d(()=>{let e=I.value?.state||``;return[`SIGNED`,`COMPLETED`,`SIGNED_PENDING_STORAGE`].includes(e)}),en=d(()=>!!(I.value?.rawHtml||I.value?.snapshot?.rawHtml)),tn=d(()=>{if(!en.value)return 1;let e=(I.value?.snapshot?.rawHtml||I.value?.rawHtml||``).match(/<(?:section|div)[^>]*class=["'][^"']*\bpage(?![\-_])\b[^"']*["']/gi);return e?e.length:12}),nn=d(()=>!!q.value.trim()&&!!J.value&&Y.value);function rn(e){if(e||=new Date,typeof e==`string`&&/^\d{4}-\d{2}-\d{2}$/.test(e.trim())){let[t,n,r]=e.trim().split(`-`).map(Number);return new Date(t,n-1,r).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`})}try{let t=new Date(e);return isNaN(t.getTime())?String(e):t.toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`})}catch{return String(e)}}function an(e){let t=String(e||``);return t=t.replace(/([\s\S]{1,300})(<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>)/gi,(e,t,n)=>{let r=Math.max(t.lastIndexOf(`Applicant`),t.lastIndexOf(`applicant`),t.lastIndexOf(`Client`),t.lastIndexOf(`client`),t.lastIndexOf(`المتقدم`),t.lastIndexOf(`العميل`),t.lastIndexOf(`المتعاقد`)),i=Math.max(t.lastIndexOf(`360GI`),t.lastIndexOf(`360 Global`),t.lastIndexOf(`شركة 360`)),a=``;return r!==-1&&i!==-1?a=r>i?`signature.client`:`signature.company`:r===-1?i!==-1&&(a=`signature.company`):a=`signature.client`,a?t+n.replace(/class=["']([^"']*)["']/,`class="$1" data-field="${a}"`):e}),t=t.replace(/(<section\b[^>]*class=["'][^"']*\bpage-11\b[^"']*["'][\s\S]*?<\/section>)/gi,e=>{let t=0;return e.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,e=>{t++;let n=t%2==1?`signature.client`:`signature.company`;return e.replace(/class=["']([^"']*)["']/,`class="$1" data-field="${n}"`)})}),t=t.replace(/(<section\b[^>]*class=["'][^"']*\bpage-12\b[^"']*["'][\s\S]*?<\/section>)/gi,e=>e.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,e=>e.replace(/class=["']([^"']*)["']/,`class="$1" data-field="signature.client"`))),t}let on=d(()=>{let e=I.value?.snapshot?.rawHtml||I.value?.rawHtml;if(!e)return``;let t=I.value?.snapshot?.customCss||I.value?.customCss||``,n=an(e),r=I.value?.formData||I.value?.snapshot?.formData||I.value?.formResponses||{},i=R.value||{},a=i.name||r.client_name||r.recipientName||`Valued Client`,o=i.idNumber||r.passport_number||r.passport_eid||`—`,s=i.nationality||r.nationality||`—`,c=i.phone||r.phone||r.mobile||`—`,l=i.address||r.address||`—`,u=i.email||r.client_email||r.email||`—`,d=r.date_of_birth||r.dob||`—`,f=r.dependents||r.note||`Spouse & Kids under 18 are included.`,p=r.sectionsConfig||{},ee=p.commercialTerms===!1,te=ee||p.includeScheduleThreeRte===!1,m=ee||p.includeIndividualVars===!1,h=m?``:r.contract_value||`20,000 EUR`,g=m?``:r.discounted_amount||r.contract_value||`15,000 EUR`,_=r.currency||`THE GREAT BRITAIN POUND (GBP)`,v=m?``:r.payment_terms||`50% Upon Signing, 50% on Approval`,x=m?``:r.visa_type||r.additional_information||`Standard Legal & Immigration Advisory`,S=te?``:r.schedule_three_content||r.payment_breakup||r.commercial_terms||`50% Initial Deposit upon signing, 50% upon Visa Approval`,C=m?``:r.discounted_amount||r.initial_deposit||`15,000 EUR`,E=rn(r.contract_date||I.value?.created_at),D=r.jurisdiction||`Courts of the Dubai International Financial Centre (“the DIFC COURTS”)`,O={logo_url:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,company_logo:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,cover_image:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,cover_image_url:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,"applicant.full_name":a,"applicant.name":a,client_name:a,recipient_name:a,main_applicant:r.main_applicant||a,"applicant.passport_or_eid":o,"applicant.passport":o,passport_number:o,passport_eid:o,passport:o,idNumber:o,"applicant.nationality":s,nationality:s,"applicant.mobile":c,"applicant.phone":c,mobile:c,phone:c,contact_number:c,"applicant.address":l,address:l,"applicant.email":u,client_email:u,email:u,"applicant.date_of_birth":d,"applicant.dob":d,date_of_birth:d,dob:d,"applicant.dependents":f,dependents:f,note:f,jurisdiction:D,total_fees:h,"fees.total_fees":h,discounted_total:g,total_after_discount:g,"fees.total_after_discount":g,contract_value:h,"fees.currency_text":_,currency:_,"fees.payment_mode":v,payment_mode:v,payment_terms:v,"fees.additional_information":x,additional_information:x,visa_type:x,"fees.payment_breakup":S,payment_breakup:S,schedule_three_content:S,schedule_three:S,commercial_terms:S,"fees.commercial_terms":S,"fees.schedule_three":S,milestones:S,"fees.milestones":S,"fees.initial_amount":C,initial_amount:C,discounted_amount:C,initial_deposit:C,"contract.date":E,contract_date:E,acceptance_date:E,declaration_date:E,date:E,today:E,today_date:E};for(let[e,t]of Object.entries(r))t!=null&&t!==``&&(O[e]=String(t));if(n=n.replace(/\{\{([^}]+)\}\}/g,(e,t)=>{let n=t.trim();if(O[n]!==void 0)return O[n];let r=n.toLowerCase();for(let[e,t]of Object.entries(O))if(e.toLowerCase()===r)return t;return`—`}),n=n.replace(/src=["'](?:assets\/)?logo-left\.png["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`).replace(/src=["'](?:assets\/)?logo-right\.png["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`).replace(/src=["']assets\/[^"']+["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`),J.value){let e=`<img src="${J.value}" alt="Client Signature" style="max-height: 14mm; max-width: 90%; display: block; margin: auto;" />`;n=n.replace(/<div\b[^>]*\bdata-field=["']signature\.client["'][^>]*>[\s\S]*?<\/div>/gi,`<div class="signature-line signed" data-field="signature.client" style="display:flex;align-items:center;justify-content:center;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${e}</div>`)}let k=I.value?.companySignature||I.value?.snapshot?.companySignature||T,A=I.value?.companyStamp||I.value?.snapshot?.companyStamp||w;if(k||A){let e=``;k&&(e+=`<img src="${k}" alt="Company Signature" class="comp-sig-img" style="max-height: 13mm; max-width: 82%; display: block; position: relative; z-index: 2;" />`),A&&(e+=`<img src="${A}" alt="Company Seal" class="comp-stamp-img" style="max-height: 22mm; position: absolute; right: 2mm; top: -5mm; opacity: 0.88; transform: rotate(-5deg); z-index: 1; pointer-events: none;" />`),n=n.replace(/<div\b[^>]*\bdata-field=["']signature\.company["'][^>]*>[\s\S]*?<\/div>/gi,`<div class="signature-line signed" data-field="signature.company" style="display:flex;align-items:center;justify-content:center;position:relative;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${e}</div>`)}if(n=n.replace(/<div class=["']page-official-stamp["'][^>]*>[\s\S]*?<\/div>/gi,``),A){let e=`<div class="page-official-stamp"><img src="${A}" alt="Company Stamp" /></div>`;n=n.replace(/(<section\b[^>]*class=["'][^"']*\bpage\b[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/gi,(t,n,r,i)=>/\bcover\b/i.test(n)?t:`${n}${r}${e}${i}`)}let j=``;n=n.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(e,t)=>(j+=`
`+t,``)),n=n.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi,``);let ne=n.match(/<body[^>]*>([\s\S]*?)<\/body>/i);return n=ne?ne[1]:n.replace(/<!DOCTYPE[^>]*>/gi,``).replace(/<\/?html[^>]*>/gi,``).replace(/<head[^>]*>[\s\S]*?<\/head>/gi,``).replace(/<\/?body[^>]*>/gi,``),`<style>${(t+`
`+j).trim()}\n
    .sign-html-canvas-pages {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #202629 !important;
      --ink: #202629;
      --paper: #ffffff;
      --font-en: "Inter", "Segoe UI", Arial, Helvetica, sans-serif;
      --font-ar: "Cairo", "Noto Sans Arabic", Tahoma, Arial, sans-serif;
    }
    .sign-html-canvas-pages .document {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0 auto;
    }
    .sign-html-canvas-pages .page {
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      min-height: 297mm !important;
      height: auto !important;
      background: #ffffff !important;
      color: #202629 !important;
      margin: 0 auto 28px auto !important;
      box-shadow: 0 14px 40px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.08) !important;
      border: 1px solid #e2e8f0 !important;
      position: relative !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }
    .sign-html-canvas-pages .page:not(.cover) {
      padding-bottom: 20mm !important;
    }
    .sign-html-canvas-pages .page .page-official-stamp {
      display: block !important;
      position: absolute !important;
      right: 18mm !important;
      bottom: 2mm !important;
      z-index: 9 !important;
      pointer-events: none !important;
    }
    .sign-html-canvas-pages .page .page-official-stamp img {
      display: block !important;
      max-height: 17mm !important;
      max-width: 26mm !important;
      object-fit: contain !important;
      opacity: 0.9 !important;
      transform: rotate(-6deg) !important;
    }
    .sign-html-canvas-pages .cover .page-official-stamp {
      display: none !important;
    }
    .sign-html-canvas-pages td,
    .sign-html-canvas-pages th,
    .sign-html-canvas-pages p,
    .sign-html-canvas-pages li,
    .sign-html-canvas-pages .clause-text,
    .sign-html-canvas-pages .clause-body,
    .sign-html-canvas-pages .group-desc {
      color: #202629 !important;
    }
    .sign-html-canvas-pages .bilingual-table {
      width: calc(100% - 16mm) !important;
      margin: 8mm 8mm 10mm !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
    }
    .sign-html-canvas-pages .bilingual-table td {
      width: 50% !important;
      max-width: 50% !important;
      box-sizing: border-box !important;
      color: #202629 !important;
      padding: 1.35mm 5mm !important;
      vertical-align: top !important;
      overflow: hidden !important;
    }
    .sign-html-canvas-pages .bilingual-table td.en-cell {
      color: #202629 !important;
      direction: ltr !important;
      text-align: left !important;
      font-family: var(--font-en) !important;
      border-right: 0.28mm solid #7f8e93 !important;
      width: 50% !important;
      max-width: 50% !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    .sign-html-canvas-pages .bilingual-table td.ar-cell {
      color: #202629 !important;
      direction: rtl !important;
      text-align: right !important;
      font-family: var(--font-ar) !important;
      width: 50% !important;
      max-width: 50% !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    .sign-html-canvas-pages .data-wrap {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    .sign-html-canvas-pages .table-like {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }
    .sign-html-canvas-pages .table-like td {
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
      box-sizing: border-box !important;
      padding: 1.4mm 1.6mm !important;
      overflow: hidden !important;
    }
    .sign-html-canvas-pages .table-like td:first-child:not([colspan="2"]) {
      width: 38% !important;
      max-width: 38% !important;
      font-weight: 700 !important;
    }
    .sign-html-canvas-pages .table-like td:last-child:not([colspan="2"]) {
      width: 62% !important;
      max-width: 62% !important;
    }
    .sign-html-canvas-pages .table-subheading {
      background: #eef3f4 !important;
      font-weight: 800 !important;
      color: #20383e !important;
      padding: 1.6mm 2mm !important;
      border-bottom: 0.25mm solid #dbe3e5 !important;
    }
    .sign-html-canvas-pages .dynamic {
      display: inline-block !important;
      max-width: 100% !important;
      word-break: break-all !important;
      overflow-wrap: anywhere !important;
      white-space: normal !important;
      line-height: 1.25 !important;
      box-sizing: border-box !important;
      unicode-bidi: plaintext !important;
    }
    .sign-html-canvas-pages .table-like .dynamic {
      display: block !important;
      width: 100% !important;
    }
    .sign-html-canvas-pages h1,
    .sign-html-canvas-pages h2,
    .sign-html-canvas-pages h3 {
      color: #20383e !important;
    }
    .sign-html-canvas-pages .label {
      color: #20383e !important;
      font-weight: 800 !important;
    }
    .sign-html-canvas-pages .page-no {
      color: #29464d !important;
      background: #eef4f5 !important;
    }
    /* Fixed horizontal alignment for Cover Page title yellow underline across EN & AR */
    .sign-html-canvas-pages .cover-title {
      min-height: 38mm !important;
      height: 38mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      text-align: center !important;
      position: relative !important;
      padding-bottom: 8mm !important;
    }
    .sign-html-canvas-pages .cover-title::after {
      content: "" !important;
      position: absolute !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      bottom: 1.5mm !important;
      width: 30mm !important;
      height: 0.65mm !important;
      border-radius: 2mm !important;
      background: linear-gradient(90deg, #20383e, #b79b52) !important;
    }

    /* ── Mobile Responsive Reading Mode ── */
    @media (max-width: 840px) {
      .sign-html-canvas-pages.mobile-reader-mode {
        width: 100% !important;
        padding: 0 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .document {
        width: 100% !important;
        padding: 0 0 16px 0 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .page {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 0 16px 0 !important;
        padding: 16px 8px 40px 8px !important;
        overflow: visible !important;
        box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08) !important;
        border-radius: 12px !important;
        border: 1px solid #e2e8f0 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .page::before {
        height: 2.5px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .page::after {
        left: 8px !important;
        right: 8px !important;
        bottom: 24px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .bilingual-table {
        width: 100% !important;
        margin: 0 !important;
        table-layout: fixed !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .bilingual-table td {
        padding: 3px 5px !important;
        font-size: 11.5px !important;
        line-height: 1.45 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .clause-number {
        font-size: 11.5px !important;
        font-weight: 700 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .clause-text {
        font-size: 11.5px !important;
        line-height: 1.45 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .section-title {
        font-size: 13px !important;
        font-weight: 800 !important;
        margin-bottom: 4px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover {
        padding: 28px 16px 28px 16px !important;
        background: #ffffff !important;
        border-radius: 14px !important;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06) !important;
        border: 1px solid #e2e8f0 !important;
        border-top: 4px solid #15325b !important;
        margin-bottom: 20px !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover::before,
      .sign-html-canvas-pages.mobile-reader-mode .cover::after {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .page-official-stamp {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .page-no {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .bilingual-table {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        display: block !important;
        table-layout: auto !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .bilingual-table colgroup {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .bilingual-table tbody,
      .sign-html-canvas-pages.mobile-reader-mode .cover .bilingual-table tr {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 100% !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .bilingual-table td {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 100% !important;
        padding: 4px 8px !important;
        border: none !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .en-cell {
        border-right: none !important;
        order: 1 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .ar-cell {
        order: 2 !important;
        border-top: 1px dashed #cbd5e1 !important;
        margin-top: 16px !important;
        padding-top: 16px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .ar-cell .logo {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .en-cell .logo {
        display: block !important;
        max-height: 75px !important;
        width: auto !important;
        max-width: 180px !important;
        object-fit: contain !important;
        margin: 0 auto 16px auto !important;
        order: -1 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .en-cell .cover-title {
        min-height: auto !important;
        height: auto !important;
        padding-bottom: 14px !important;
        text-align: center !important;
        width: 100% !important;
        margin: 0 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .en-cell .cover-title h1 {
        font-size: 19px !important;
        font-weight: 800 !important;
        line-height: 1.25 !important;
        letter-spacing: 1.5px !important;
        color: #15325b !important;
        margin: 0 !important;
        text-transform: uppercase !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .cover-title::after {
        width: 44px !important;
        height: 2.5px !important;
        bottom: 0 !important;
        background: linear-gradient(90deg, #15325b, #b79b52) !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .ar-cell .cover-title.arabic {
        font-size: 19px !important;
        font-weight: 800 !important;
        line-height: 1.35 !important;
        color: #15325b !important;
        padding-bottom: 0 !important;
        margin: 0 !important;
        text-align: center !important;
        width: 100% !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .cover .ar-cell .cover-title.arabic::after {
        display: none !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .commercial-terms {
        font-size: 11px !important;
        line-height: 1.4 !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .commercial-terms table {
        width: 100% !important;
        font-size: 10.5px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .commercial-terms table th,
      .sign-html-canvas-pages.mobile-reader-mode .commercial-terms table td {
        padding: 3px 4px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .table-like {
        width: 100% !important;
        font-size: 11px !important;
      }
      .sign-html-canvas-pages.mobile-reader-mode .table-like td {
        padding: 3px 4px !important;
      }
    }
  </style>\n<div class="${y.value&&b.value===`responsive`?`sign-html-canvas-pages mobile-reader-mode`:`sign-html-canvas-pages`}">${n}</div>`}),sn=d(()=>{let e=I.value?.snapshot?.activeBlocks||I.value?.snapshot?.documentSchema?.blocks||[];return Array.isArray(e)?e.map(e=>({...e,title:$(e.title),titleEn:$(e.titleEn),titleAr:$(e.titleAr),content:$(e.content),contentEn:$(e.contentEn),contentAr:$(e.contentAr)})):[]});function $(e){if(!e||typeof e!=`string`)return e||``;let t=e,n=I.value?.formData||{},r={client_name:R.value.name,"contact.name":R.value.name,"form.name":R.value.name,client_email:R.value.email,"contact.email":R.value.email,phone:R.value.phone,"contact.phone":R.value.phone,passport_number:R.value.idNumber||n.passport_number||``,"form.passport_number":R.value.idNumber||n.passport_number||``,nationality:R.value.nationality||n.nationality||``,address:R.value.address||n.address||``,...n};for(let[e,n]of Object.entries(r))if(n!=null&&n!==``){let r=RegExp(`\\{\\{${e}\\}\\}`,`g`);t=t.replace(r,String(n))}return t}function cn(e){return e?String(e).replace(/\n/g,`<br/>`):``}function ln(e){return e?new Date(e).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`—`}function un(e){if(!e)return`Active`;let t=new Date(e).getTime()-Date.now();if(t<=0)return`Expired`;let n=Math.floor(t/864e5),r=Math.floor(t%864e5/36e5);return y.value?n>0?`⏱️ ${n}d left`:`⏱️ ${r}h left`:n>0?`⏱️ Expires in ${n} day${n>1?`s`:``}`:`⏱️ Expires in ${r} hour${r>1?`s`:``}`}function dn(){let e=document.querySelector(`.sign-execution-section`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})}function fn(e){let t=document.querySelector(e);t&&t.scrollIntoView({behavior:`smooth`,block:`start`})}async function pn(){M.value=!0,Z.value=``;try{let e=await g.get(`${_}/sign/${h}`);if(I.value=e.data,L.value=(e.data.formMode||`NORMAL`).toUpperCase(),e.data.alreadySigned||$t.value){N.value=`completed`,Q.value=e.data.signedAt||new Date().toISOString();return}e.data.recipient&&(R.value.name=e.data.recipient.name||``,R.value.email=e.data.recipient.email||``,R.value.phone=e.data.recipient.phone||``);let t=e.data.formData||{};t.client_name&&!R.value.name&&(R.value.name=t.client_name),t.client_email&&!R.value.email&&(R.value.email=t.client_email),t.phone&&!R.value.phone&&(R.value.phone=t.phone),t.passport_number&&(R.value.idNumber=t.passport_number),t.nationality&&(R.value.nationality=t.nationality),t.address&&(R.value.address=t.address),Array.isArray(t.teamMembers)&&(K.value=t.teamMembers),q.value=R.value.name||``,N.value=`sign`}catch(e){console.error(`Fetch contract error:`,e);let t=e.response?.status,n=e.response?.data||{};n.error===`REVOKED`?(N.value=`revoked`,P.value=`Contract Revoked`,F.value=`This contract has been revoked by the issuer and is no longer accessible.`):t===410||n.error===`EXPIRED`?(N.value=`expired`,P.value=`Signing Link Expired`,F.value=`This signing invitation has expired. Links are time-sensitive for security.`):t===409||n.error===`COMPLETED`||n.error===`SIGNED`?(N.value=`completed`,Q.value=new Date().toISOString()):(N.value=`error`,P.value=`Unable to Load Contract`,F.value=n.error||`Failed to load signing portal.`)}finally{M.value=!1}}n(()=>{pn(),k(),window.addEventListener(`resize`,k)}),t(()=>{window.removeEventListener(`resize`,k)});function mn(e){if(!e){J.value=``;return}typeof e==`string`?(J.value=e,Zt.value=`draw`):typeof e==`object`&&(J.value=e.dataUrl||``,Zt.value=e.method||`draw`)}async function hn(){if(!nn.value){q.value.trim()?J.value?Y.value||(Z.value=`Please check the consent box to accept the agreement terms.`):Z.value=`Please draw, type, or upload your signature.`:Z.value=`Please enter your full legal name.`;return}X.value=!0,Z.value=``;try{let e={signerName:q.value.trim(),signerEmail:R.value.email||``,signatureMethod:Zt.value,signatureDataB64:J.value,signatureDataUrl:J.value,signature:J.value,acceptedTerms:!0,consentAccepted:!0},t=await g.post(`${_}/sign/${h}/submit`,e);Q.value=new Date().toISOString(),Qt.value=t.data.pdfSha256||``,N.value=`completed`}catch(e){console.error(`Signature submit error:`,e),Z.value=e.response?.data?.message||e.response?.data?.error||`Failed to submit signature. Please try again.`}finally{X.value=!1}}return(t,n)=>(o(),C(`div`,B,[x(`header`,V,[x(`div`,H,[n[9]||=l(`<div class="portal-brand" data-v-68fb6495><div class="brand-shield-icon" data-v-68fb6495><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" data-v-68fb6495><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-68fb6495></path><polyline points="9 12 11 14 15 10" data-v-68fb6495></polyline></svg></div><div data-v-68fb6495><span class="portal-brand-name" data-v-68fb6495>ContractManager</span><span class="portal-brand-sub" data-v-68fb6495>Client Review &amp; Secure Execution Portal</span></div></div>`,1),I.value&&!$t.value?(o(),C(`div`,re,[I.value.expiresAt?(o(),C(`span`,U,c(un(I.value.expiresAt)),1)):p(``,!0),n[8]||=x(`span`,{class:`badge badge-success badge-sm`},[x(`span`,{class:`badge-text-desktop`},`🔒 Encrypted & Verified`),x(`span`,{class:`badge-text-mobile`},`🔒 Verified`)],-1)])):p(``,!0)])]),x(`main`,ie,[M.value?(o(),C(`div`,W,[...n[10]||=[x(`div`,{class:`loading-card`},[x(`div`,{class:`spinner-lg`}),x(`h3`,null,`Loading Legal Agreement`),x(`p`,{class:`text-muted`},`Establishing secure session and retrieving contract document…`)],-1)]])):N.value!==`sign`&&N.value!==`completed`?(o(),C(`div`,ae,[x(`div`,oe,[x(`div`,{class:r([`status-icon-ring`,N.value])},[N.value===`expired`?(o(),C(`span`,se,`⌛`)):N.value===`revoked`?(o(),C(`span`,ce,`🚫`)):(o(),C(`span`,le,`⚠️`))],2),x(`h2`,ue,c(P.value),1),x(`p`,de,c(F.value),1),n[11]||=x(`div`,{class:`status-help`},` Please contact the issuing representative if you have any questions or require an updated link. `,-1)])])):N.value===`completed`||$t.value?(o(),C(`div`,fe,[x(`div`,pe,[n[16]||=x(`div`,{class:`completion-icon-ring`},[x(`svg`,{width:`44`,height:`44`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[x(`path`,{d:`M20 6L9 17l-5-5`})])],-1),n[17]||=x(`span`,{class:`completion-tag`},`Contract Successfully Executed`,-1),x(`h2`,me,c(I.value?.snapshot?.documentTitle||I.value?.templateName),1),n[18]||=x(`p`,{class:`completion-sub`},` This agreement has been signed and legally finalized. An immutable audit certificate has been generated. `,-1),x(`div`,G,[x(`div`,he,[n[12]||=x(`span`,{class:`receipt-label`},`Signer Name:`,-1),x(`strong`,ge,c(q.value||I.value?.recipient?.name||I.value?.recipientName||`Verified Client`),1)]),n[15]||=x(`div`,{class:`receipt-row`},[x(`span`,{class:`receipt-label`},`Status:`),x(`span`,{class:`badge badge-success`},`COMPLETED`)],-1),Q.value?(o(),C(`div`,_e,[n[13]||=x(`span`,{class:`receipt-label`},`Signed At:`,-1),x(`span`,ve,c(ln(Q.value)),1)])):p(``,!0),Qt.value?(o(),C(`div`,ye,[n[14]||=x(`span`,{class:`receipt-label`},`Digital Fingerprint:`,-1),x(`code`,be,c(Qt.value.slice(0,24))+`…`,1)])):p(``,!0)]),n[19]||=l(`<div class="completion-actions" data-v-68fb6495><div class="client-copy-notice" data-v-68fb6495><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-68fb6495><circle cx="12" cy="12" r="10" data-v-68fb6495></circle><polyline points="12 6 12 12 14 14" data-v-68fb6495></polyline></svg><div class="notice-text" data-v-68fb6495><span class="notice-title" data-v-68fb6495>Your signed copy is being processed</span><span class="notice-sub" data-v-68fb6495>Your agent will share the executed contract with you shortly.</span></div></div></div>`,1)])])):(o(),C(`div`,xe,[x(`div`,Se,[x(`div`,Ce,[x(`div`,we,[n[20]||=x(`span`,{class:`badge badge-primary badge-sm`},`Legal Agreement`,-1),R.value.name?(o(),C(`span`,Te,`👤 `+c(R.value.name),1)):p(``,!0)]),x(`h1`,Ee,c(I.value?.snapshot?.documentTitle||I.value?.templateName),1),n[21]||=x(`p`,{class:`hero-desc`},` Please review all agreement clauses, commercial terms, and personal details below. When ready, provide your signature at the bottom to execute this contract. `,-1)]),x(`div`,De,[x(`div`,Oe,[n[22]||=x(`span`,{class:`hero-card-k`},`Prepared For:`,-1),x(`strong`,ke,c(R.value.name||`Valued Client`),1),x(`small`,Ae,c(R.value.email),1)])])]),en.value?(o(),C(`div`,je,[x(`div`,Me,[x(`div`,Ne,[x(`span`,Pe,[(o(),C(`svg`,Fe,[...n[23]||=[x(`path`,{d:`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z`},null,-1),x(`polyline`,{points:`14 2 14 8 20 8`},null,-1)]])),e(` `+c(tn.value)+` Pages Document `,1)]),x(`span`,Ie,c(I.value?.snapshot?.documentTitle||I.value?.templateName),1)]),x(`div`,Le,[y.value?(o(),C(`div`,Re,[x(`button`,{type:`button`,class:r([`doc-nav-btn`,{"doc-nav-btn-active":b.value===`a4`}]),onClick:n[0]||=e=>{b.value=`a4`,A()}},` 📄 A4 Sheet `,2),x(`button`,{type:`button`,class:r([`doc-nav-btn`,{"doc-nav-btn-active":b.value===`responsive`}]),onClick:n[1]||=e=>b.value=`responsive`},` 📱 Mobile `,2)])):p(``,!0),y.value&&b.value===`a4`?(o(),C(`div`,ze,[x(`button`,{type:`button`,class:`doc-nav-btn btn-step`,onClick:n[2]||=e=>j(-.06),title:`Zoom Out`},`−`),x(`button`,{type:`button`,class:`doc-nav-btn btn-fit`,onClick:A,title:`Fit A4 to Screen`},c(Math.round(O.value*100))+`%`,1),x(`button`,{type:`button`,class:`doc-nav-btn btn-step`,onClick:n[3]||=e=>j(.06),title:`Zoom In`},`+`)])):p(``,!0),y.value?p(``,!0):(o(),C(`button`,{key:2,type:`button`,class:`doc-nav-btn`,onClick:n[4]||=e=>fn(`.page-4, .page:nth-of-type(4)`),title:`Jump to Terms of Business`},` 📜 Terms `)),y.value?p(``,!0):(o(),C(`button`,{key:3,type:`button`,class:`doc-nav-btn`,onClick:n[5]||=e=>fn(`.page-7, .page:nth-of-type(7)`),title:`Jump to Schedules`},` 👤 Schedules `)),x(`button`,{type:`button`,class:`doc-nav-btn doc-nav-btn-highlight`,onClick:dn,title:`Jump down to Digital Signature`},` ✍️ Jump to Sign ↓ `)])])])):p(``,!0),x(`div`,{class:r([`doc-paper-wrap`,{"html-mode-paper-wrap":en.value}])},[en.value?(o(),C(`div`,{key:0,class:r([`html-contract-render-host`,{"mobile-reader-mode":y.value&&b.value===`responsive`}]),style:i(ne.value),innerHTML:on.value},null,14,Be)):(o(),C(`div`,Ve,[x(`div`,He,[x(`div`,Ue,[n[24]||=x(`span`,{class:`paper-brand`},`360 GLOBAL IMMIGRATION`,-1),x(`span`,We,c(L.value===`TEAM`?`Group / Team Agreement`:`Standard Agreement`),1)]),x(`h2`,Ge,c(I.value?.snapshot?.documentTitle||I.value?.templateName),1),x(`div`,Ke,[x(`div`,qe,[n[25]||=x(`span`,{class:`doc-meta-k`},`Primary Applicant:`,-1),x(`strong`,Je,c(R.value.name||`—`),1)]),R.value.email?(o(),C(`div`,Ye,[n[26]||=x(`span`,{class:`doc-meta-k`},`Email:`,-1),x(`span`,Xe,c(R.value.email),1)])):p(``,!0),R.value.phone?(o(),C(`div`,Ze,[n[27]||=x(`span`,{class:`doc-meta-k`},`Phone:`,-1),x(`span`,Qe,c(R.value.phone),1)])):p(``,!0),R.value.idNumber?(o(),C(`div`,$e,[n[28]||=x(`span`,{class:`doc-meta-k`},`Passport / ID:`,-1),x(`span`,et,c(R.value.idNumber),1)])):p(``,!0),R.value.nationality?(o(),C(`div`,tt,[n[29]||=x(`span`,{class:`doc-meta-k`},`Nationality:`,-1),x(`span`,nt,c(R.value.nationality),1)])):p(``,!0),L.value===`TEAM`&&K.value.length?(o(),C(`div`,rt,[n[30]||=x(`span`,{class:`doc-meta-k`},`Group Coverage:`,-1),x(`span`,it,c(K.value.length+1)+` Applicants`,1)])):p(``,!0)])]),n[34]||=x(`div`,{class:`paper-divider`},null,-1),x(`div`,at,[(o(!0),C(m,null,v(sn.value,(e,t)=>(o(),C(m,{key:t},[e.bilingual||e.contentEn&&e.contentAr?(o(),C(`div`,{key:0,class:r([`doc-block block-bilingual`,{"clause-emphasis":e.emphasis}])},[x(`div`,ot,[e.titleEn||e.title?(o(),C(`h4`,st,c(e.titleEn||e.title),1)):p(``,!0),x(`div`,{class:`clause-body`,innerHTML:cn(e.contentEn||e.content)},null,8,ct)]),n[31]||=x(`div`,{class:`bilingual-divider`},null,-1),x(`div`,lt,[e.titleAr?(o(),C(`h4`,ut,c(e.titleAr),1)):p(``,!0),x(`div`,{class:`clause-body font-arabic`,innerHTML:cn(e.contentAr)},null,8,dt)])],2)):e.type===`clause`?(o(),C(`div`,{key:1,class:r([`doc-block block-clause`,{"clause-emphasis":e.emphasis}])},[e.title?(o(),C(`h4`,ft,c(e.title),1)):p(``,!0),x(`div`,{class:`clause-body`,innerHTML:cn(e.content)},null,8,pt)],2)):e.type===`paragraph`?(o(),C(`div`,mt,[x(`p`,{innerHTML:cn(e.content)},null,8,ht)])):e.type===`heading`?(o(),C(`div`,gt,[x(`h3`,_t,c(e.content||e.title),1)])):e.type===`key_value`?(o(),C(`div`,vt,[e.title?(o(),C(`h4`,yt,c(e.title),1)):p(``,!0),x(`div`,bt,[(o(!0),C(m,null,v(e.data||{},(e,t)=>(o(),C(`div`,{key:t,class:`kv-row`},[x(`span`,xt,c(t),1),x(`span`,St,c(e),1)]))),128))])])):e.type===`team_summary`||t===1&&L.value===`TEAM`&&K.value.length?(o(),C(`div`,Ct,[n[33]||=x(`div`,{class:`bilingual-header-row`},[x(`h4`,{class:`table-block-title`},`Covered Team / Family Group Members`),x(`span`,{class:`table-block-title-ar font-arabic`,dir:`rtl`},`الأعضاء والمرافقون المشمولون بالعقد`)],-1),x(`div`,wt,[x(`table`,Tt,[n[32]||=x(`thead`,null,[x(`tr`,null,[x(`th`,null,`#`),x(`th`,null,`Full Legal Name`),x(`th`,null,`Relationship`),x(`th`,null,`Passport / ID`),x(`th`,null,`Nationality`),x(`th`,null,`Date of Birth`)])],-1),x(`tbody`,null,[(o(!0),C(m,null,v(e.members||K.value,(e,t)=>(o(),C(`tr`,{key:t},[x(`td`,null,c(t+1),1),x(`td`,null,[x(`strong`,null,c(e.fullName||e.name),1)]),x(`td`,null,c(e.relationship||`Member`),1),x(`td`,null,c(e.idNumber||`—`),1),x(`td`,null,c(e.nationality||`—`),1),x(`td`,null,c(e.dob||`—`),1)]))),128))])])])])):e.type===`table`?(o(),C(`div`,Et,[e.title?(o(),C(`h4`,Dt,c(e.title),1)):p(``,!0),x(`div`,Ot,[x(`table`,kt,[e.headers?(o(),C(`thead`,At,[x(`tr`,null,[(o(!0),C(m,null,v(e.headers,(e,t)=>(o(),C(`th`,{key:t},c(e),1))),128))])])):p(``,!0),x(`tbody`,null,[(o(!0),C(m,null,v(e.rows||[],(e,t)=>(o(),C(`tr`,{key:t},[(o(!0),C(m,null,v(e,(e,t)=>(o(),C(`td`,{key:t},c(e),1))),128))]))),128))])])])])):p(``,!0)],64))),128))]),n[35]||=x(`div`,{class:`paper-footer`},[x(`div`,{class:`footer-legal-text`},` This document is electronically drafted and authorized. Any alteration or unauthorized modification renders it void. `),x(`div`,{class:`footer-security-seal`},[x(`span`,null,`🔐 Authenticated Electronic Contract`)])],-1)]))],2),x(`div`,jt,[x(`div`,Mt,[n[43]||=x(`div`,{class:`execution-head`},[x(`div`,{class:`execution-icon-wrap`},`✍️`),x(`div`,null,[x(`h3`,{class:`execution-title`},`Sign & Finalize Agreement`),x(`p`,{class:`execution-sub`},` Verify your name and provide your digital signature below to legally execute this contract. `)])],-1),x(`div`,Nt,[x(`div`,Pt,[n[36]||=x(`label`,{class:`field-label`,for:`signer-name`},[e(` Signer Full Legal Name `),x(`span`,{class:`req`},`*`)],-1),a(x(`input`,{id:`signer-name`,type:`text`,"onUpdate:modelValue":n[6]||=e=>q.value=e,class:`form-control`,placeholder:`e.g. Ahmed Khan`,required:``,maxlength:`100`},null,512),[[te,q.value]])]),x(`div`,Ft,[n[37]||=x(`label`,{class:`field-label`},[e(`Digital Signature `),x(`span`,{class:`req`},`*`)],-1),S(z,{"initial-name":q.value,onChange:mn},null,8,[`initial-name`])]),x(`div`,It,[x(`label`,Lt,[a(x(`input`,{type:`checkbox`,"onUpdate:modelValue":n[7]||=e=>Y.value=e,class:`consent-checkbox`,required:``},null,512),[[ee,Y.value]]),n[38]||=x(`span`,{class:`consent-text`},[x(`strong`,null,`I confirm that I have read, understood, and agreed to all terms and conditions of this Agreement`),e(`, and I consent to electronically signing this document pursuant to applicable Electronic Transactions regulations. `)],-1)])]),x(`div`,Rt,[x(`div`,{class:r([`check-item`,{done:!!q.value.trim()}])},[x(`span`,zt,c(q.value.trim()?`✓`:`1`),1),n[39]||=x(`span`,null,`Legal Name`,-1)],2),x(`div`,{class:r([`check-item`,{done:!!J.value}])},[x(`span`,Bt,c(J.value?`✓`:`2`),1),n[40]||=x(`span`,null,`Digital Signature`,-1)],2),x(`div`,{class:r([`check-item`,{done:Y.value}])},[x(`span`,Vt,c(Y.value?`✓`:`3`),1),n[41]||=x(`span`,null,`Agreement Consent`,-1)],2)]),Z.value?(o(),C(`div`,Ht,c(Z.value),1)):p(``,!0)]),x(`div`,Ut,[!nn.value&&!X.value?(o(),C(`div`,Wt,[q.value.trim()?J.value?Y.value?p(``,!0):(o(),C(`span`,qt,`☑️ Please check the agreement consent box above to proceed`)):(o(),C(`span`,Kt,`✍️ Please draw, type, or upload your signature above to enable completion`)):(o(),C(`span`,Gt,`⚠️ Please enter your full legal name above to proceed`))])):p(``,!0),x(`button`,{type:`button`,class:r([`btn-submit-sign`,{"can-submit":nn.value}]),disabled:X.value||!nn.value,onClick:hn},[X.value?(o(),C(`span`,Yt)):(o(),C(`svg`,Xt,[...n[42]||=[x(`path`,{d:`M22 11.08V12a10 10 0 1 1-5.93-9.14`},null,-1),x(`polyline`,{points:`22 4 12 14.01 9 11.01`},null,-1)]])),x(`span`,null,c(X.value?`Executing & Sealing Agreement…`:`✍️ Sign & Complete Agreement`),1)],10,Jt)])])])]))])]))}},[[`__scopeId`,`data-v-68fb6495`]]);export{K as default};