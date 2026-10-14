import{C as e,D as t,E as n,I as r,L as i,N as a,O as o,P as s,R as c,S as l,T as ee,_ as u,a as d,b as f,c as p,f as m,g as h,h as g,i as _,j as v,k as y,p as b,t as x,v as S,w as C,x as w}from"./index-DScJAI8Z.js";import{n as T,t as E}from"./defaultAssets-9UPTUkve.js";var D={class:`signature-pad-container`},O={class:`sig-tabs`},k={class:`canvas-wrapper`},te={class:`canvas-header`},ne=[`disabled`],re={class:`canvas-box`},ie={class:`type-wrapper`},ae={key:0,class:`type-styles-list`},A={class:`style-cards`},j=[`onClick`],M={class:`upload-wrapper`},N={key:0,class:`upload-placeholder`},P={key:1,class:`upload-preview-box`},F=[`src`],I=x({__name:`SignaturePad`,props:{initialName:{type:String,default:``}},emits:[`change`],setup(t,{emit:u}){let d=t,p=u,_=s(`draw`),x=s(!1),C=s(!1),T=s(d.initialName||``),E=s(0),I=s(!1),L=s(``),R=s(null),z=s(null),B=[{name:`Cursive Elegant`,family:`'Dancing Script', 'Brush Script MT', cursive`,style:`italic`},{name:`Casual Hand`,family:`'Caveat', cursive`,style:`normal`},{name:`Formal Script`,family:`'Great Vibes', cursive`,style:`normal`},{name:`Modern Signature`,family:`'Allura', cursive`,style:`italic`}];function V(e,t=_.value){p(`change`,{dataUrl:e||null,method:t})}function H(e){_.value=e,e===`draw`?(ee(()=>W()),x.value&&R.value?pe():V(null,`draw`)):e===`type`?G():e===`upload`&&V(L.value||null,`upload`)}let U=null;function W(){let e=R.value;if(!e)return;let t=e.getBoundingClientRect(),n=window.devicePixelRatio||1,r=t.width||560,i=t.height||160;e.width=r*n,e.height=i*n,U=e.getContext(`2d`),U.scale(n,n),U.strokeStyle=`#0f172a`,U.lineWidth=2.5,U.lineCap=`round`,U.lineJoin=`round`}function oe(e){let t=R.value.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}function se(e){C.value=!0,x.value=!0;let t=oe(e);U.beginPath(),U.moveTo(t.x,t.y)}function ce(e){if(!C.value)return;let t=oe(e);U.lineTo(t.x,t.y),U.stroke()}function le(){C.value&&(C.value=!1,U.closePath(),pe())}function ue(e){if(e.touches.length!==1)return;C.value=!0,x.value=!0;let t=R.value.getBoundingClientRect(),n=e.touches[0];U.beginPath(),U.moveTo(n.clientX-t.left,n.clientY-t.top)}function de(e){if(!C.value||e.touches.length!==1)return;let t=R.value.getBoundingClientRect(),n=e.touches[0];U.lineTo(n.clientX-t.left,n.clientY-t.top),U.stroke()}function fe(){let e=R.value;e&&U&&(U.save(),U.setTransform(1,0,0,1,0,0),U.clearRect(0,0,e.width,e.height),U.restore(),x.value=!1,V(null,`draw`))}function pe(){let e=R.value;e&&x.value&&V(e.toDataURL(`image/png`),`draw`)}function me(e){E.value=e,G()}function G(){if(!T.value.trim()){V(null,`type`);return}let e=document.createElement(`canvas`);e.width=600,e.height=160;let t=e.getContext(`2d`);t.clearRect(0,0,600,160);let n=B[E.value]||B[0];t.font=`${n.style||`normal`} 52px ${n.family}`,t.fillStyle=`#0f172a`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(T.value.trim(),300,80),V(e.toDataURL(`image/png`),`type`)}function he(){z.value?.click()}function ge(e){let t=e.target.files?.[0];t&&ve(t)}function _e(e){I.value=!1;let t=e.dataTransfer.files?.[0];t&&ve(t)}function ve(e){if(!e.type.startsWith(`image/`))return;let t=new FileReader;t.onload=e=>{L.value=e.target.result,V(L.value,`upload`)},t.readAsDataURL(e)}function ye(){L.value=``,z.value&&(z.value.value=``),V(null,`upload`)}return v(()=>d.initialName,e=>{e&&!T.value&&(T.value=e,_.value===`type`&&G())}),n(()=>{W(),window.addEventListener(`resize`,W),T.value&&_.value===`type`&&G()}),(t,n)=>(o(),w(`div`,D,[S(`div`,O,[S(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:_.value===`draw`}]),onClick:n[0]||=e=>H(`draw`)},[...n[6]||=[S(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[S(`path`,{d:`M12 20h9`}),S(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),e(` Draw `,-1)]],2),S(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:_.value===`type`}]),onClick:n[1]||=e=>H(`type`)},[...n[7]||=[S(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[S(`polyline`,{points:`4 7 4 4 20 4 20 7`}),S(`line`,{x1:`9`,y1:`20`,x2:`15`,y2:`20`}),S(`line`,{x1:`12`,y1:`4`,x2:`12`,y2:`20`})],-1),e(` Type `,-1)]],2),S(`button`,{type:`button`,class:r([`sig-tab-btn`,{active:_.value===`upload`}]),onClick:n[2]||=e=>H(`upload`)},[...n[8]||=[S(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[S(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),S(`polyline`,{points:`17 8 12 3 7 8`}),S(`line`,{x1:`12`,y1:`3`,x2:`12`,y2:`15`})],-1),e(` Upload `,-1)]],2)]),a(S(`div`,k,[S(`div`,te,[n[9]||=S(`span`,{class:`canvas-hint`},`Draw your signature with mouse, stylus, or finger`,-1),S(`button`,{type:`button`,class:`btn-clear`,onClick:fe,disabled:!x.value},` Clear `,8,ne)]),S(`div`,re,[S(`canvas`,{ref_key:`canvasRef`,ref:R,class:`drawing-canvas`,onMousedown:se,onMousemove:ce,onMouseup:le,onMouseleave:le,onTouchstart:g(ue,[`prevent`]),onTouchmove:g(de,[`prevent`]),onTouchend:g(le,[`prevent`])},null,544),n[10]||=S(`div`,{class:`signature-baseline`},[S(`span`,{class:`sig-x`},`✕`)],-1)])],512),[[b,_.value===`draw`]]),a(S(`div`,ie,[n[12]||=S(`label`,{class:`form-label`},`Type your full legal name:`,-1),a(S(`input`,{type:`text`,"onUpdate:modelValue":n[3]||=e=>T.value=e,class:`sig-text-input`,placeholder:`e.g. Jane Doe`,maxlength:`60`,onInput:G},null,544),[[m,T.value]]),T.value.trim()?(o(),w(`div`,ae,[n[11]||=S(`label`,{class:`form-label`,style:{"margin-top":`var(--space-4)`}},`Select signature style:`,-1),S(`div`,A,[(o(),w(h,null,y(B,(e,t)=>S(`div`,{key:t,class:r([`style-card`,{selected:E.value===t}]),onClick:e=>me(t)},[S(`span`,{style:i({fontFamily:e.family,fontStyle:e.style||`italic`,fontSize:`1.6rem`})},c(T.value),5)],10,j)),64))])])):f(``,!0)],512),[[b,_.value===`type`]]),a(S(`div`,M,[S(`div`,{class:r([`drop-zone`,{dragging:I.value}]),onDragover:n[4]||=g(e=>I.value=!0,[`prevent`]),onDragleave:n[5]||=g(e=>I.value=!1,[`prevent`]),onDrop:g(_e,[`prevent`]),onClick:he},[S(`input`,{type:`file`,ref_key:`fileInputRef`,ref:z,accept:`image/png, image/jpeg, image/webp`,style:{display:`none`},onChange:ge},null,544),L.value?(o(),w(`div`,P,[S(`img`,{src:L.value,alt:`Signature preview`,class:`uploaded-img`},null,8,F),S(`button`,{type:`button`,class:`btn-clear`,onClick:g(ye,[`stop`])},`Remove`)])):(o(),w(`div`,N,[...n[13]||=[l(`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-a139541d><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" data-v-a139541d></path><path d="M12 12v9" data-v-a139541d></path><path d="m16 16-4-4-4 4" data-v-a139541d></path></svg><p class="drop-text" data-v-a139541d>Click or drag an image of your signature here</p><span class="drop-hint" data-v-a139541d>PNG, JPG or WEBP (transparent background recommended)</span>`,3)]]))],34)],512),[[b,_.value===`upload`]])]))}},[[`__scopeId`,`data-v-a139541d`]]),L={class:`public-sign-portal`},R={class:`portal-header`},z={class:`portal-header-inner`},B={key:0,class:`portal-header-meta`},V={key:0,class:`expiry-pill`},H={class:`portal-main`},U={key:0,class:`portal-loading animate-fade-in`},W={key:1,class:`portal-state-view animate-fade-in`},oe={class:`glass-card status-card`},se={key:0},ce={key:1},le={key:2},ue={class:`status-head`},de={class:`status-text`},fe={key:2,class:`portal-completed-view animate-fade-in`},pe={class:`glass-card completion-card`},me={class:`completion-title`},G={class:`receipt-box`},he={class:`receipt-row`},ge={class:`receipt-val`},_e={key:0,class:`receipt-row`},ve={class:`receipt-val`},ye={key:1,class:`receipt-row`},be={class:`sha-code`},xe={key:3,class:`portal-active-view animate-fade-in`},Se={class:`contract-hero-banner`},Ce={class:`hero-left`},we={class:`hero-top-row`},Te={key:0,class:`mobile-client-pill`},Ee={class:`hero-title`},De={class:`hero-right`},Oe={class:`hero-client-card`},ke={class:`hero-card-v`},Ae={class:`hero-card-email`},je={key:0,class:`doc-nav-sticky-bar`},Me={class:`doc-nav-bar-inner`},Ne={class:`doc-nav-info`},Pe={class:`doc-nav-badge`},Fe={width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.2`,style:{"margin-right":`4px`}},Ie={class:`doc-nav-title`},Le={class:`doc-nav-actions`},Re={key:0,class:`mobile-view-toggle`},ze={key:1,class:`mobile-zoom-pill-group`},Be=[`innerHTML`],Ve={key:1,class:`document-paper`},He={class:`paper-header`},Ue={class:`header-branding-row`},We={class:`paper-type-badge`},Ge={class:`doc-main-heading`},Ke={class:`doc-meta-bar`},qe={class:`doc-meta-item`},Je={class:`doc-meta-v`},Ye={key:0,class:`doc-meta-item`},Xe={class:`doc-meta-v`},Ze={key:1,class:`doc-meta-item`},Qe={class:`doc-meta-v`},$e={key:2,class:`doc-meta-item`},et={class:`doc-meta-v`},tt={key:3,class:`doc-meta-item`},nt={class:`doc-meta-v`},rt={key:4,class:`doc-meta-item`},it={class:`doc-meta-v`},at={class:`paper-body`},ot={class:`bilingual-col bilingual-en`,dir:`ltr`},st={key:0,class:`clause-title`},ct=[`innerHTML`],lt={class:`bilingual-col bilingual-ar`,dir:`rtl`},ut={key:0,class:`clause-title font-arabic`},dt=[`innerHTML`],ft={key:0,class:`clause-title`},pt=[`innerHTML`],mt={key:2,class:`doc-block block-paragraph`},ht=[`innerHTML`],gt={key:3,class:`doc-block block-heading`},_t={class:`heading-content`},vt={key:4,class:`doc-block block-key-value`},yt={key:0,class:`table-block-title`},bt={class:`kv-grid`},xt={class:`kv-key`},St={class:`kv-val`},Ct={key:5,class:`doc-block block-team-table`},wt={class:`table-responsive`},Tt={class:`doc-table`},Et={key:6,class:`doc-block block-table`},Dt={key:0,class:`table-block-title`},Ot={class:`table-responsive`},kt={class:`doc-table`},At={key:0},jt={class:`sign-execution-section`},Mt={class:`glass-card execution-card`},Nt={class:`execution-body`},Pt={class:`form-group signer-name-group`},Ft={class:`sig-pad-container`},It={class:`consent-box`},Lt={class:`consent-label`},Rt={class:`execution-checklist`},zt={class:`check-dot`},Bt={class:`check-dot`},Vt={class:`check-dot`},Ht={key:0,class:`alert-banner alert-danger`,style:{"margin-top":`14px`}},Ut={class:`execution-foot`},Wt={key:0,class:`missing-req-hint`},Gt={key:0},Kt={key:1},qt={key:2},Jt=[`disabled`],Yt={key:0,class:`spinner-sm`},Xt={key:1,width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.2`},K=x({__name:`PublicSignView`,setup(ee){let g=d().params.token,v=`http://localhost:3001/api`,b=s(!1),x=s(`a4`),D=s(1),O=s(!1),k=s(1);function te(){if(typeof window>`u`)return;let e=window.innerWidth;if(b.value=e<840,e<840){let t=Math.max(260,e-16),n=Math.min(1,Math.round(t/794*100)/100);D.value=n,O.value||(k.value=n),x.value||=`a4`}else D.value=1,O.value||(k.value=1)}function ne(){O.value=!1,k.value=D.value}function re(e){O.value=!0;let t=Math.round((k.value+e)*100)/100;t>=.3&&t<=1.8&&(k.value=t)}let ie=u(()=>!b.value||x.value===`responsive`?{}:{zoom:k.value}),ae=s(!0),A=s(`sign`),j=s(``),M=s(``),N=s(null),P=s(`NORMAL`),F=s({name:``,email:``,phone:``,idNumber:``,nationality:``,address:``}),K=s([]),q=s(``),J=s(``),Zt=s(`draw`),Y=s(!1),X=s(!1),Z=s(``),Q=s(null),Qt=s(``),$t=u(()=>{let e=N.value?.state||``;return[`SIGNED`,`COMPLETED`,`SIGNED_PENDING_STORAGE`].includes(e)}),en=u(()=>!!(N.value?.rawHtml||N.value?.snapshot?.rawHtml)),tn=u(()=>{if(!en.value)return 1;let e=(N.value?.snapshot?.rawHtml||N.value?.rawHtml||``).match(/<(?:section|div)[^>]*class=["'][^"']*\bpage(?![\-_])\b[^"']*["']/gi);return e?e.length:12}),nn=u(()=>!!q.value.trim()&&!!J.value&&Y.value);function rn(e){if(e||=new Date,typeof e==`string`&&/^\d{4}-\d{2}-\d{2}$/.test(e.trim())){let[t,n,r]=e.trim().split(`-`).map(Number);return new Date(t,n-1,r).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`})}try{let t=new Date(e);return isNaN(t.getTime())?String(e):t.toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`})}catch{return String(e)}}function an(e){let t=String(e||``);return t=t.replace(/([\s\S]{1,300})(<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>)/gi,(e,t,n)=>{let r=Math.max(t.lastIndexOf(`Applicant`),t.lastIndexOf(`applicant`),t.lastIndexOf(`Client`),t.lastIndexOf(`client`),t.lastIndexOf(`المتقدم`),t.lastIndexOf(`العميل`),t.lastIndexOf(`المتعاقد`)),i=Math.max(t.lastIndexOf(`360GI`),t.lastIndexOf(`360 Global`),t.lastIndexOf(`شركة 360`)),a=``;return r!==-1&&i!==-1?a=r>i?`signature.client`:`signature.company`:r===-1?i!==-1&&(a=`signature.company`):a=`signature.client`,a?t+n.replace(/class=["']([^"']*)["']/,`class="$1" data-field="${a}"`):e}),t=t.replace(/(<section\b[^>]*class=["'][^"']*\bpage-11\b[^"']*["'][\s\S]*?<\/section>)/gi,e=>{let t=0;return e.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,e=>{t++;let n=t%2==1?`signature.client`:`signature.company`;return e.replace(/class=["']([^"']*)["']/,`class="$1" data-field="${n}"`)})}),t=t.replace(/(<section\b[^>]*class=["'][^"']*\bpage-12\b[^"']*["'][\s\S]*?<\/section>)/gi,e=>e.replace(/<div\b(?![^>]*\bdata-field=)[^>]*\bclass=["'][^"']*\bsignature-line\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,e=>e.replace(/class=["']([^"']*)["']/,`class="$1" data-field="signature.client"`))),t}let on=u(()=>{let e=N.value?.snapshot?.rawHtml||N.value?.rawHtml;if(!e)return``;let t=N.value?.snapshot?.customCss||N.value?.customCss||``,n=an(e),r=N.value?.formData||N.value?.snapshot?.formData||N.value?.formResponses||{},i=F.value||{},a=i.name||r.client_name||r.recipientName||`Valued Client`,o=i.idNumber||r.passport_number||r.passport_eid||`—`,s=i.nationality||r.nationality||`—`,c=i.phone||r.phone||r.mobile||`—`,l=i.address||r.address||`—`,ee=i.email||r.client_email||r.email||`—`,u=r.date_of_birth||r.dob||`—`,d=r.dependents||r.note||`Spouse & Kids under 18 are included.`,f=r.contract_value||`20,000 EUR`,p=r.discounted_amount||r.contract_value||`15,000 EUR`,m=r.currency||`THE GREAT BRITAIN POUND (GBP)`,h=r.payment_terms||`50% Upon Signing, 50% on Approval`,g=r.visa_type||r.additional_information||`Standard Legal & Immigration Advisory`,_=r.schedule_three_content||r.payment_breakup||r.commercial_terms||`50% Initial Deposit upon signing, 50% upon Visa Approval`,v=r.discounted_amount||r.initial_deposit||`15,000 EUR`,y=rn(r.contract_date||N.value?.created_at),S=r.jurisdiction||`Courts of the Dubai International Financial Centre (“the DIFC COURTS”)`,C={logo_url:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,company_logo:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,cover_image:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,cover_image_url:`https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png`,"applicant.full_name":a,"applicant.name":a,client_name:a,recipient_name:a,main_applicant:r.main_applicant||a,"applicant.passport_or_eid":o,"applicant.passport":o,passport_number:o,passport_eid:o,passport:o,idNumber:o,"applicant.nationality":s,nationality:s,"applicant.mobile":c,"applicant.phone":c,mobile:c,phone:c,contact_number:c,"applicant.address":l,address:l,"applicant.email":ee,client_email:ee,email:ee,"applicant.date_of_birth":u,"applicant.dob":u,date_of_birth:u,dob:u,"applicant.dependents":d,dependents:d,note:d,jurisdiction:S,total_fees:f,"fees.total_fees":f,discounted_total:p,total_after_discount:p,"fees.total_after_discount":p,contract_value:f,"fees.currency_text":m,currency:m,"fees.payment_mode":h,payment_mode:h,payment_terms:h,"fees.additional_information":g,additional_information:g,visa_type:g,"fees.payment_breakup":_,payment_breakup:_,schedule_three_content:_,schedule_three:_,commercial_terms:_,"fees.commercial_terms":_,"fees.schedule_three":_,milestones:_,"fees.milestones":_,"fees.initial_amount":v,initial_amount:v,discounted_amount:v,initial_deposit:v,"contract.date":y,contract_date:y,acceptance_date:y,declaration_date:y,date:y,today:y,today_date:y};for(let[e,t]of Object.entries(r))t!=null&&t!==``&&(C[e]=String(t));if(n=n.replace(/\{\{([^}]+)\}\}/g,(e,t)=>{let n=t.trim();if(C[n]!==void 0)return C[n];let r=n.toLowerCase();for(let[e,t]of Object.entries(C))if(e.toLowerCase()===r)return t;return`—`}),n=n.replace(/src=["'](?:assets\/)?logo-left\.png["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`).replace(/src=["'](?:assets\/)?logo-right\.png["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`).replace(/src=["']assets\/[^"']+["']/gi,`src="https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png"`),J.value){let e=`<img src="${J.value}" alt="Client Signature" style="max-height: 14mm; max-width: 90%; display: block; margin: auto;" />`;n=n.replace(/<div\b[^>]*\bdata-field=["']signature\.client["'][^>]*>[\s\S]*?<\/div>/gi,`<div class="signature-line signed" data-field="signature.client" style="display:flex;align-items:center;justify-content:center;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${e}</div>`)}let w=N.value?.companySignature||N.value?.snapshot?.companySignature||E,D=N.value?.companyStamp||N.value?.snapshot?.companyStamp||T;if(w||D){let e=``;w&&(e+=`<img src="${w}" alt="Company Signature" class="comp-sig-img" style="max-height: 13mm; max-width: 82%; display: block; position: relative; z-index: 2;" />`),D&&(e+=`<img src="${D}" alt="Company Seal" class="comp-stamp-img" style="max-height: 22mm; position: absolute; right: 2mm; top: -5mm; opacity: 0.88; transform: rotate(-5deg); z-index: 1; pointer-events: none;" />`),n=n.replace(/<div\b[^>]*\bdata-field=["']signature\.company["'][^>]*>[\s\S]*?<\/div>/gi,`<div class="signature-line signed" data-field="signature.company" style="display:flex;align-items:center;justify-content:center;position:relative;background:#fff;border-bottom:1.5px solid #0f172a;min-height:36px;">${e}</div>`)}if(n=n.replace(/<div class=["']page-official-stamp["'][^>]*>[\s\S]*?<\/div>/gi,``),D){let e=`<div class="page-official-stamp"><img src="${D}" alt="Company Stamp" /></div>`;n=n.replace(/(<section\b[^>]*class=["'][^"']*\bpage\b[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/gi,(t,n,r,i)=>/\bcover\b/i.test(n)?t:`${n}${r}${e}${i}`)}let O=``;n=n.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(e,t)=>(O+=`
`+t,``)),n=n.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi,``);let k=n.match(/<body[^>]*>([\s\S]*?)<\/body>/i);return n=k?k[1]:n.replace(/<!DOCTYPE[^>]*>/gi,``).replace(/<\/?html[^>]*>/gi,``).replace(/<head[^>]*>[\s\S]*?<\/head>/gi,``).replace(/<\/?body[^>]*>/gi,``),`<style>${(t+`
`+O).trim()}\n
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
  </style>\n<div class="${b.value&&x.value===`responsive`?`sign-html-canvas-pages mobile-reader-mode`:`sign-html-canvas-pages`}">${n}</div>`}),sn=u(()=>{let e=N.value?.snapshot?.activeBlocks||N.value?.snapshot?.documentSchema?.blocks||[];return Array.isArray(e)?e.map(e=>({...e,title:$(e.title),titleEn:$(e.titleEn),titleAr:$(e.titleAr),content:$(e.content),contentEn:$(e.contentEn),contentAr:$(e.contentAr)})):[]});function $(e){if(!e||typeof e!=`string`)return e||``;let t=e,n=N.value?.formData||{},r={client_name:F.value.name,"contact.name":F.value.name,"form.name":F.value.name,client_email:F.value.email,"contact.email":F.value.email,phone:F.value.phone,"contact.phone":F.value.phone,passport_number:F.value.idNumber||n.passport_number||``,"form.passport_number":F.value.idNumber||n.passport_number||``,nationality:F.value.nationality||n.nationality||``,address:F.value.address||n.address||``,...n};for(let[e,n]of Object.entries(r))if(n!=null&&n!==``){let r=RegExp(`\\{\\{${e}\\}\\}`,`g`);t=t.replace(r,String(n))}return t}function cn(e){return e?String(e).replace(/\n/g,`<br/>`):``}function ln(e){return e?new Date(e).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`—`}function un(e){if(!e)return`Active`;let t=new Date(e).getTime()-Date.now();if(t<=0)return`Expired`;let n=Math.floor(t/864e5),r=Math.floor(t%864e5/36e5);return b.value?n>0?`⏱️ ${n}d left`:`⏱️ ${r}h left`:n>0?`⏱️ Expires in ${n} day${n>1?`s`:``}`:`⏱️ Expires in ${r} hour${r>1?`s`:``}`}function dn(){let e=document.querySelector(`.sign-execution-section`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})}function fn(e){let t=document.querySelector(e);t&&t.scrollIntoView({behavior:`smooth`,block:`start`})}async function pn(){ae.value=!0,Z.value=``;try{let e=await _.get(`${v}/sign/${g}`);if(N.value=e.data,P.value=(e.data.formMode||`NORMAL`).toUpperCase(),e.data.alreadySigned||$t.value){A.value=`completed`,Q.value=e.data.signedAt||new Date().toISOString();return}e.data.recipient&&(F.value.name=e.data.recipient.name||``,F.value.email=e.data.recipient.email||``,F.value.phone=e.data.recipient.phone||``);let t=e.data.formData||{};t.client_name&&!F.value.name&&(F.value.name=t.client_name),t.client_email&&!F.value.email&&(F.value.email=t.client_email),t.phone&&!F.value.phone&&(F.value.phone=t.phone),t.passport_number&&(F.value.idNumber=t.passport_number),t.nationality&&(F.value.nationality=t.nationality),t.address&&(F.value.address=t.address),Array.isArray(t.teamMembers)&&(K.value=t.teamMembers),q.value=F.value.name||``,A.value=`sign`}catch(e){console.error(`Fetch contract error:`,e);let t=e.response?.status,n=e.response?.data||{};n.error===`REVOKED`?(A.value=`revoked`,j.value=`Contract Revoked`,M.value=`This contract has been revoked by the issuer and is no longer accessible.`):t===410||n.error===`EXPIRED`?(A.value=`expired`,j.value=`Signing Link Expired`,M.value=`This signing invitation has expired. Links are time-sensitive for security.`):t===409||n.error===`COMPLETED`||n.error===`SIGNED`?(A.value=`completed`,Q.value=new Date().toISOString()):(A.value=`error`,j.value=`Unable to Load Contract`,M.value=n.error||`Failed to load signing portal.`)}finally{ae.value=!1}}n(()=>{pn(),te(),window.addEventListener(`resize`,te)}),t(()=>{window.removeEventListener(`resize`,te)});function mn(e){if(!e){J.value=``;return}typeof e==`string`?(J.value=e,Zt.value=`draw`):typeof e==`object`&&(J.value=e.dataUrl||``,Zt.value=e.method||`draw`)}async function hn(){if(!nn.value){q.value.trim()?J.value?Y.value||(Z.value=`Please check the consent box to accept the agreement terms.`):Z.value=`Please draw, type, or upload your signature.`:Z.value=`Please enter your full legal name.`;return}X.value=!0,Z.value=``;try{let e={signerName:q.value.trim(),signerEmail:F.value.email||``,signatureMethod:Zt.value,signatureDataB64:J.value,signatureDataUrl:J.value,signature:J.value,acceptedTerms:!0,consentAccepted:!0},t=await _.post(`${v}/sign/${g}/submit`,e);Q.value=new Date().toISOString(),Qt.value=t.data.pdfSha256||``,A.value=`completed`}catch(e){console.error(`Signature submit error:`,e),Z.value=e.response?.data?.message||e.response?.data?.error||`Failed to submit signature. Please try again.`}finally{X.value=!1}}return(t,n)=>(o(),w(`div`,L,[S(`header`,R,[S(`div`,z,[n[9]||=l(`<div class="portal-brand" data-v-d91ac01e><div class="brand-shield-icon" data-v-d91ac01e><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" data-v-d91ac01e><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-d91ac01e></path><polyline points="9 12 11 14 15 10" data-v-d91ac01e></polyline></svg></div><div data-v-d91ac01e><span class="portal-brand-name" data-v-d91ac01e>ContractManager</span><span class="portal-brand-sub" data-v-d91ac01e>Client Review &amp; Secure Execution Portal</span></div></div>`,1),N.value&&!$t.value?(o(),w(`div`,B,[N.value.expiresAt?(o(),w(`span`,V,c(un(N.value.expiresAt)),1)):f(``,!0),n[8]||=S(`span`,{class:`badge badge-success badge-sm`},[S(`span`,{class:`badge-text-desktop`},`🔒 Encrypted & Verified`),S(`span`,{class:`badge-text-mobile`},`🔒 Verified`)],-1)])):f(``,!0)])]),S(`main`,H,[ae.value?(o(),w(`div`,U,[...n[10]||=[S(`div`,{class:`loading-card`},[S(`div`,{class:`spinner-lg`}),S(`h3`,null,`Loading Legal Agreement`),S(`p`,{class:`text-muted`},`Establishing secure session and retrieving contract document…`)],-1)]])):A.value!==`sign`&&A.value!==`completed`?(o(),w(`div`,W,[S(`div`,oe,[S(`div`,{class:r([`status-icon-ring`,A.value])},[A.value===`expired`?(o(),w(`span`,se,`⌛`)):A.value===`revoked`?(o(),w(`span`,ce,`🚫`)):(o(),w(`span`,le,`⚠️`))],2),S(`h2`,ue,c(j.value),1),S(`p`,de,c(M.value),1),n[11]||=S(`div`,{class:`status-help`},` Please contact the issuing representative if you have any questions or require an updated link. `,-1)])])):A.value===`completed`||$t.value?(o(),w(`div`,fe,[S(`div`,pe,[n[16]||=S(`div`,{class:`completion-icon-ring`},[S(`svg`,{width:`44`,height:`44`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[S(`path`,{d:`M20 6L9 17l-5-5`})])],-1),n[17]||=S(`span`,{class:`completion-tag`},`Contract Successfully Executed`,-1),S(`h2`,me,c(N.value?.snapshot?.documentTitle||N.value?.templateName),1),n[18]||=S(`p`,{class:`completion-sub`},` This agreement has been signed and legally finalized. An immutable audit certificate has been generated. `,-1),S(`div`,G,[S(`div`,he,[n[12]||=S(`span`,{class:`receipt-label`},`Signer Name:`,-1),S(`strong`,ge,c(q.value||N.value?.recipient?.name||N.value?.recipientName||`Verified Client`),1)]),n[15]||=S(`div`,{class:`receipt-row`},[S(`span`,{class:`receipt-label`},`Status:`),S(`span`,{class:`badge badge-success`},`COMPLETED`)],-1),Q.value?(o(),w(`div`,_e,[n[13]||=S(`span`,{class:`receipt-label`},`Signed At:`,-1),S(`span`,ve,c(ln(Q.value)),1)])):f(``,!0),Qt.value?(o(),w(`div`,ye,[n[14]||=S(`span`,{class:`receipt-label`},`Digital Fingerprint:`,-1),S(`code`,be,c(Qt.value.slice(0,24))+`…`,1)])):f(``,!0)]),n[19]||=l(`<div class="completion-actions" data-v-d91ac01e><div class="client-copy-notice" data-v-d91ac01e><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-d91ac01e><circle cx="12" cy="12" r="10" data-v-d91ac01e></circle><polyline points="12 6 12 12 14 14" data-v-d91ac01e></polyline></svg><div class="notice-text" data-v-d91ac01e><span class="notice-title" data-v-d91ac01e>Your signed copy is being processed</span><span class="notice-sub" data-v-d91ac01e>Your agent will share the executed contract with you shortly.</span></div></div></div>`,1)])])):(o(),w(`div`,xe,[S(`div`,Se,[S(`div`,Ce,[S(`div`,we,[n[20]||=S(`span`,{class:`badge badge-primary badge-sm`},`Legal Agreement`,-1),F.value.name?(o(),w(`span`,Te,`👤 `+c(F.value.name),1)):f(``,!0)]),S(`h1`,Ee,c(N.value?.snapshot?.documentTitle||N.value?.templateName),1),n[21]||=S(`p`,{class:`hero-desc`},` Please review all agreement clauses, commercial terms, and personal details below. When ready, provide your signature at the bottom to execute this contract. `,-1)]),S(`div`,De,[S(`div`,Oe,[n[22]||=S(`span`,{class:`hero-card-k`},`Prepared For:`,-1),S(`strong`,ke,c(F.value.name||`Valued Client`),1),S(`small`,Ae,c(F.value.email),1)])])]),en.value?(o(),w(`div`,je,[S(`div`,Me,[S(`div`,Ne,[S(`span`,Pe,[(o(),w(`svg`,Fe,[...n[23]||=[S(`path`,{d:`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z`},null,-1),S(`polyline`,{points:`14 2 14 8 20 8`},null,-1)]])),e(` `+c(tn.value)+` Pages Document `,1)]),S(`span`,Ie,c(N.value?.snapshot?.documentTitle||N.value?.templateName),1)]),S(`div`,Le,[b.value?(o(),w(`div`,Re,[S(`button`,{type:`button`,class:r([`doc-nav-btn`,{"doc-nav-btn-active":x.value===`a4`}]),onClick:n[0]||=e=>{x.value=`a4`,ne()}},` 📄 A4 Sheet `,2),S(`button`,{type:`button`,class:r([`doc-nav-btn`,{"doc-nav-btn-active":x.value===`responsive`}]),onClick:n[1]||=e=>x.value=`responsive`},` 📱 Mobile `,2)])):f(``,!0),b.value&&x.value===`a4`?(o(),w(`div`,ze,[S(`button`,{type:`button`,class:`doc-nav-btn btn-step`,onClick:n[2]||=e=>re(-.06),title:`Zoom Out`},`−`),S(`button`,{type:`button`,class:`doc-nav-btn btn-fit`,onClick:ne,title:`Fit A4 to Screen`},c(Math.round(k.value*100))+`%`,1),S(`button`,{type:`button`,class:`doc-nav-btn btn-step`,onClick:n[3]||=e=>re(.06),title:`Zoom In`},`+`)])):f(``,!0),b.value?f(``,!0):(o(),w(`button`,{key:2,type:`button`,class:`doc-nav-btn`,onClick:n[4]||=e=>fn(`.page-4, .page:nth-of-type(4)`),title:`Jump to Terms of Business`},` 📜 Terms `)),b.value?f(``,!0):(o(),w(`button`,{key:3,type:`button`,class:`doc-nav-btn`,onClick:n[5]||=e=>fn(`.page-7, .page:nth-of-type(7)`),title:`Jump to Schedules`},` 👤 Schedules `)),S(`button`,{type:`button`,class:`doc-nav-btn doc-nav-btn-highlight`,onClick:dn,title:`Jump down to Digital Signature`},` ✍️ Jump to Sign ↓ `)])])])):f(``,!0),S(`div`,{class:r([`doc-paper-wrap`,{"html-mode-paper-wrap":en.value}])},[en.value?(o(),w(`div`,{key:0,class:r([`html-contract-render-host`,{"mobile-reader-mode":b.value&&x.value===`responsive`}]),style:i(ie.value),innerHTML:on.value},null,14,Be)):(o(),w(`div`,Ve,[S(`div`,He,[S(`div`,Ue,[n[24]||=S(`span`,{class:`paper-brand`},`360 GLOBAL IMMIGRATION`,-1),S(`span`,We,c(P.value===`TEAM`?`Group / Team Agreement`:`Standard Agreement`),1)]),S(`h2`,Ge,c(N.value?.snapshot?.documentTitle||N.value?.templateName),1),S(`div`,Ke,[S(`div`,qe,[n[25]||=S(`span`,{class:`doc-meta-k`},`Primary Applicant:`,-1),S(`strong`,Je,c(F.value.name||`—`),1)]),F.value.email?(o(),w(`div`,Ye,[n[26]||=S(`span`,{class:`doc-meta-k`},`Email:`,-1),S(`span`,Xe,c(F.value.email),1)])):f(``,!0),F.value.phone?(o(),w(`div`,Ze,[n[27]||=S(`span`,{class:`doc-meta-k`},`Phone:`,-1),S(`span`,Qe,c(F.value.phone),1)])):f(``,!0),F.value.idNumber?(o(),w(`div`,$e,[n[28]||=S(`span`,{class:`doc-meta-k`},`Passport / ID:`,-1),S(`span`,et,c(F.value.idNumber),1)])):f(``,!0),F.value.nationality?(o(),w(`div`,tt,[n[29]||=S(`span`,{class:`doc-meta-k`},`Nationality:`,-1),S(`span`,nt,c(F.value.nationality),1)])):f(``,!0),P.value===`TEAM`&&K.value.length?(o(),w(`div`,rt,[n[30]||=S(`span`,{class:`doc-meta-k`},`Group Coverage:`,-1),S(`span`,it,c(K.value.length+1)+` Applicants`,1)])):f(``,!0)])]),n[34]||=S(`div`,{class:`paper-divider`},null,-1),S(`div`,at,[(o(!0),w(h,null,y(sn.value,(e,t)=>(o(),w(h,{key:t},[e.bilingual||e.contentEn&&e.contentAr?(o(),w(`div`,{key:0,class:r([`doc-block block-bilingual`,{"clause-emphasis":e.emphasis}])},[S(`div`,ot,[e.titleEn||e.title?(o(),w(`h4`,st,c(e.titleEn||e.title),1)):f(``,!0),S(`div`,{class:`clause-body`,innerHTML:cn(e.contentEn||e.content)},null,8,ct)]),n[31]||=S(`div`,{class:`bilingual-divider`},null,-1),S(`div`,lt,[e.titleAr?(o(),w(`h4`,ut,c(e.titleAr),1)):f(``,!0),S(`div`,{class:`clause-body font-arabic`,innerHTML:cn(e.contentAr)},null,8,dt)])],2)):e.type===`clause`?(o(),w(`div`,{key:1,class:r([`doc-block block-clause`,{"clause-emphasis":e.emphasis}])},[e.title?(o(),w(`h4`,ft,c(e.title),1)):f(``,!0),S(`div`,{class:`clause-body`,innerHTML:cn(e.content)},null,8,pt)],2)):e.type===`paragraph`?(o(),w(`div`,mt,[S(`p`,{innerHTML:cn(e.content)},null,8,ht)])):e.type===`heading`?(o(),w(`div`,gt,[S(`h3`,_t,c(e.content||e.title),1)])):e.type===`key_value`?(o(),w(`div`,vt,[e.title?(o(),w(`h4`,yt,c(e.title),1)):f(``,!0),S(`div`,bt,[(o(!0),w(h,null,y(e.data||{},(e,t)=>(o(),w(`div`,{key:t,class:`kv-row`},[S(`span`,xt,c(t),1),S(`span`,St,c(e),1)]))),128))])])):e.type===`team_summary`||t===1&&P.value===`TEAM`&&K.value.length?(o(),w(`div`,Ct,[n[33]||=S(`div`,{class:`bilingual-header-row`},[S(`h4`,{class:`table-block-title`},`Covered Team / Family Group Members`),S(`span`,{class:`table-block-title-ar font-arabic`,dir:`rtl`},`الأعضاء والمرافقون المشمولون بالعقد`)],-1),S(`div`,wt,[S(`table`,Tt,[n[32]||=S(`thead`,null,[S(`tr`,null,[S(`th`,null,`#`),S(`th`,null,`Full Legal Name`),S(`th`,null,`Relationship`),S(`th`,null,`Passport / ID`),S(`th`,null,`Nationality`),S(`th`,null,`Date of Birth`)])],-1),S(`tbody`,null,[(o(!0),w(h,null,y(e.members||K.value,(e,t)=>(o(),w(`tr`,{key:t},[S(`td`,null,c(t+1),1),S(`td`,null,[S(`strong`,null,c(e.fullName||e.name),1)]),S(`td`,null,c(e.relationship||`Member`),1),S(`td`,null,c(e.idNumber||`—`),1),S(`td`,null,c(e.nationality||`—`),1),S(`td`,null,c(e.dob||`—`),1)]))),128))])])])])):e.type===`table`?(o(),w(`div`,Et,[e.title?(o(),w(`h4`,Dt,c(e.title),1)):f(``,!0),S(`div`,Ot,[S(`table`,kt,[e.headers?(o(),w(`thead`,At,[S(`tr`,null,[(o(!0),w(h,null,y(e.headers,(e,t)=>(o(),w(`th`,{key:t},c(e),1))),128))])])):f(``,!0),S(`tbody`,null,[(o(!0),w(h,null,y(e.rows||[],(e,t)=>(o(),w(`tr`,{key:t},[(o(!0),w(h,null,y(e,(e,t)=>(o(),w(`td`,{key:t},c(e),1))),128))]))),128))])])])])):f(``,!0)],64))),128))]),n[35]||=S(`div`,{class:`paper-footer`},[S(`div`,{class:`footer-legal-text`},` This document is electronically drafted and authorized. Any alteration or unauthorized modification renders it void. `),S(`div`,{class:`footer-security-seal`},[S(`span`,null,`🔐 Authenticated Electronic Contract`)])],-1)]))],2),S(`div`,jt,[S(`div`,Mt,[n[43]||=S(`div`,{class:`execution-head`},[S(`div`,{class:`execution-icon-wrap`},`✍️`),S(`div`,null,[S(`h3`,{class:`execution-title`},`Sign & Finalize Agreement`),S(`p`,{class:`execution-sub`},` Verify your name and provide your digital signature below to legally execute this contract. `)])],-1),S(`div`,Nt,[S(`div`,Pt,[n[36]||=S(`label`,{class:`field-label`,for:`signer-name`},[e(` Signer Full Legal Name `),S(`span`,{class:`req`},`*`)],-1),a(S(`input`,{id:`signer-name`,type:`text`,"onUpdate:modelValue":n[6]||=e=>q.value=e,class:`form-control`,placeholder:`e.g. Ahmed Khan`,required:``,maxlength:`100`},null,512),[[m,q.value]])]),S(`div`,Ft,[n[37]||=S(`label`,{class:`field-label`},[e(`Digital Signature `),S(`span`,{class:`req`},`*`)],-1),C(I,{"initial-name":q.value,onChange:mn},null,8,[`initial-name`])]),S(`div`,It,[S(`label`,Lt,[a(S(`input`,{type:`checkbox`,"onUpdate:modelValue":n[7]||=e=>Y.value=e,class:`consent-checkbox`,required:``},null,512),[[p,Y.value]]),n[38]||=S(`span`,{class:`consent-text`},[S(`strong`,null,`I confirm that I have read, understood, and agreed to all terms and conditions of this Agreement`),e(`, and I consent to electronically signing this document pursuant to applicable Electronic Transactions regulations. `)],-1)])]),S(`div`,Rt,[S(`div`,{class:r([`check-item`,{done:!!q.value.trim()}])},[S(`span`,zt,c(q.value.trim()?`✓`:`1`),1),n[39]||=S(`span`,null,`Legal Name`,-1)],2),S(`div`,{class:r([`check-item`,{done:!!J.value}])},[S(`span`,Bt,c(J.value?`✓`:`2`),1),n[40]||=S(`span`,null,`Digital Signature`,-1)],2),S(`div`,{class:r([`check-item`,{done:Y.value}])},[S(`span`,Vt,c(Y.value?`✓`:`3`),1),n[41]||=S(`span`,null,`Agreement Consent`,-1)],2)]),Z.value?(o(),w(`div`,Ht,c(Z.value),1)):f(``,!0)]),S(`div`,Ut,[!nn.value&&!X.value?(o(),w(`div`,Wt,[q.value.trim()?J.value?Y.value?f(``,!0):(o(),w(`span`,qt,`☑️ Please check the agreement consent box above to proceed`)):(o(),w(`span`,Kt,`✍️ Please draw, type, or upload your signature above to enable completion`)):(o(),w(`span`,Gt,`⚠️ Please enter your full legal name above to proceed`))])):f(``,!0),S(`button`,{type:`button`,class:r([`btn-submit-sign`,{"can-submit":nn.value}]),disabled:X.value||!nn.value,onClick:hn},[X.value?(o(),w(`span`,Yt)):(o(),w(`svg`,Xt,[...n[42]||=[S(`path`,{d:`M22 11.08V12a10 10 0 1 1-5.93-9.14`},null,-1),S(`polyline`,{points:`22 4 12 14.01 9 11.01`},null,-1)]])),S(`span`,null,c(X.value?`Executing & Sealing Agreement…`:`✍️ Sign & Complete Agreement`),1)],10,Jt)])])])]))])]))}},[[`__scopeId`,`data-v-d91ac01e`]]);export{K as default};