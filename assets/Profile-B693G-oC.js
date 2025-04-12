import{s as W}from"./index-B1O_roLE.js";import{s as X}from"./index-BOXa9Jy8.js";import{s as Y}from"./index-BWWt08Hc.js";import{s as q}from"./index-i9P0ePp1.js";import{B as Q,R as Z,s as ee,m as h,a7 as V,ar as te,an as F,n as P,A as ne,V as ae,c as m,o as d,a,G as C,J as ie,F as y,X as se,f as B,K as O,L as S,I as g,aD as oe,r as N,b6 as le,aS as A,Y as E,b7 as re,d as r,g as k,aT as c}from"./index-B9WMAgPp.js";import{s as de}from"./index-BKNI2Ift.js";import{s as ue}from"./index-BAUH0ml_.js";import{s as K}from"./index-B_KtAYLU.js";import{_ as ce}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-uurWoLOS.js";import"./index-DsYEzwOE.js";import"./index-DWLvmoye.js";var me={name:"InputSwitch",extends:q,mounted:function(){console.warn("Deprecated since v4. Use ToggleSwitch component instead.")}},pe=({dt:e})=>`
.p-tabmenu {
    overflow-x: auto;
}

.p-tabmenu-tablist {
    display: flex;
    margin: 0;
    padding: 0;
    list-style-type: none;
    background: ${e("tabmenu.tablist.background")};
    border-style: solid;
    border-color: ${e("tabmenu.tablist.border.color")};
    border-width: ${e("tabmenu.tablist.border.width")};
    position: relative;
}

.p-tabmenu-item-link {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    background: ${e("tabmenu.item.background")};
    border-style: solid;
    border-width: ${e("tabmenu.item.border.width")};
    border-color: ${e("tabmenu.item.border.color")};
    color: ${e("tabmenu.item.color")};
    padding: ${e("tabmenu.item.padding")};
    font-weight: ${e("tabmenu.item.font.weight")};
    transition: background ${e("tabmenu.transition.duration")}, border-color ${e("tabmenu.transition.duration")}, color ${e("tabmenu.transition.duration")}, outline-color ${e("tabmenu.transition.duration")}, box-shadow ${e("tabmenu.transition.duration")};
    margin: ${e("tabmenu.item.margin")};
    outline-color: transparent;
    gap: ${e("tabmenu.item.gap")};
}

.p-tabmenu-item-link:focus-visible {
    z-index: 1;
    box-shadow: ${e("tabmenu.item.focus.ring.shadow")};
    outline: ${e("tabmenu.item.focus.ring.width")} ${e("tabmenu.item.focus.ring.style")} ${e("tabmenu.item.focus.ring.color")};
    outline-offset: ${e("tabmenu.item.focus.ring.offset")};
}

.p-tabmenu-item-icon {
    color: ${e("tabmenu.item.icon.color")};
    transition: background ${e("tabmenu.transition.duration")}, border-color ${e("tabmenu.transition.duration")}, color ${e("tabmenu.transition.duration")}, outline-color ${e("tabmenu.transition.duration")}, box-shadow ${e("tabmenu.transition.duration")};
}

.p-tabmenu-item-label {
    line-height: 1;
}

.p-tabmenu-item:not(.p-tabmenu-item-active):not(.p-disabled):hover .p-tabmenu-item-link {
    background: ${e("tabmenu.item.hover.background")};
    border-color: ${e("tabmenu.item.hover.border.color")};
    color: ${e("tabmenu.item.hover.color")};
}

.p-tabmenu-item:not(.p-tabmenu-item-active):not(.p-disabled):hover .p-tabmenu-item-icon {
    color: ${e("tabmenu.item.icon.hover.color")};
}

.p-tabmenu-item-active .p-tabmenu-item-link {
    background: ${e("tabmenu.item.active.background")};
    border-color: ${e("tabmenu.item.active.border.color")};
    color: ${e("tabmenu.item.active.color")};
}

.p-tabmenu-item-active .p-tabmenu-item-icon {
    color: ${e("tabmenu.item.icon.active.color")};
}

.p-tabmenu-active-bar {
    z-index: 1;
    display: block;
    position: absolute;
    bottom: ${e("tabmenu.active.bar.bottom")};
    height: ${e("tabmenu.active.bar.height")};
    background: ${e("tabmenu.active.bar.background")};
    transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
}

.p-tabmenu::-webkit-scrollbar {
    display: none;
}
`,be={root:"p-tabmenu p-component",tablist:"p-tabmenu-tablist",item:function(t){var n=t.instance,o=t.index,b=t.item;return["p-tabmenu-item",{"p-tabmenu-item-active":n.d_activeIndex===o,"p-disabled":n.disabled(b)}]},itemLink:"p-tabmenu-item-link",itemIcon:"p-tabmenu-item-icon",itemLabel:"p-tabmenu-item-label",activeBar:"p-tabmenu-active-bar"},fe=Q.extend({name:"tabmenu",style:pe,classes:be}),ve={name:"BaseTabMenu",extends:ee,props:{model:{type:Array,default:null},activeIndex:{type:Number,default:0},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:fe,provide:function(){return{$pcTabMenu:this,$parentInstance:this}}},U={name:"TabMenu",extends:ve,inheritAttrs:!1,emits:["update:activeIndex","tab-change"],data:function(){return{d_activeIndex:this.activeIndex}},watch:{activeIndex:{flush:"post",handler:function(t){this.d_activeIndex=t,this.updateInkBar()}}},mounted:function(){var t=this;this.$nextTick(function(){t.updateInkBar()});var n=this.findActiveItem();n&&(n.tabIndex="0")},updated:function(){this.updateInkBar()},methods:{getPTOptions:function(t,n,o){return this.ptm(t,{context:{item:n,index:o}})},onItemClick:function(t,n,o){if(this.disabled(n)){t.preventDefault();return}n.command&&n.command({originalEvent:t,item:n}),o!==this.d_activeIndex&&(this.d_activeIndex=o,this.$emit("update:activeIndex",this.d_activeIndex)),this.$emit("tab-change",{originalEvent:t,index:o})},onKeydownItem:function(t,n,o){switch(t.code){case"ArrowRight":{this.navigateToNextItem(t.target),t.preventDefault();break}case"ArrowLeft":{this.navigateToPrevItem(t.target),t.preventDefault();break}case"Home":{this.navigateToFirstItem(t.target),t.preventDefault();break}case"End":{this.navigateToLastItem(t.target),t.preventDefault();break}case"Space":case"NumpadEnter":case"Enter":{this.onItemClick(t,n,o),t.preventDefault();break}case"Tab":{this.onTabKey();break}}},navigateToNextItem:function(t){var n=this.findNextItem(t);n&&this.setFocusToMenuitem(t,n)},navigateToPrevItem:function(t){var n=this.findPrevItem(t);n&&this.setFocusToMenuitem(t,n)},navigateToFirstItem:function(t){var n=this.findFirstItem(t);n&&this.setFocusToMenuitem(t,n)},navigateToLastItem:function(t){var n=this.findLastItem(t);n&&this.setFocusToMenuitem(t,n)},findNextItem:function(t){var n=t.parentElement.nextElementSibling;return n?V(n,"data-p-disabled")===!0?this.findNextItem(n.children[0]):n.children[0]:null},findPrevItem:function(t){var n=t.parentElement.previousElementSibling;return n?V(n,"data-p-disabled")===!0?this.findPrevItem(n.children[0]):n.children[0]:null},findFirstItem:function(){var t=P(this.$refs.nav,'[data-pc-section="item"][data-p-disabled="false"]');return t?t.children[0]:null},findLastItem:function(){var t=ne(this.$refs.nav,'[data-pc-section="item"][data-p-disabled="false"]');return t?t[t.length-1].children[0]:null},findActiveItem:function(){var t=P(this.$refs.nav,'[data-pc-section="item"][data-p-disabled="false"][data-p-active="true"]');return t?t.children[0]:null},setFocusToMenuitem:function(t,n){t.tabIndex="-1",n.tabIndex="0",n.focus()},onTabKey:function(){var t=P(this.$refs.nav,'[data-pc-section="item"][data-p-disabled="false"][data-p-active="true"]'),n=P(this.$refs.nav,'[data-pc-section="itemlink"][tabindex="0"]');n!==t.children[0]&&(t&&(t.children[0].tabIndex="0"),n.tabIndex="-1")},visible:function(t){return typeof t.visible=="function"?t.visible():t.visible!==!1},disabled:function(t){return typeof t.disabled=="function"?t.disabled():t.disabled===!0},label:function(t){return typeof t.label=="function"?t.label():t.label},updateInkBar:function(){for(var t=this.$refs.nav.children,n=!1,o=0;o<t.length;o++){var b=t[o];V(b,"data-p-active")&&(this.$refs.inkbar.style.width=te(b)+"px",this.$refs.inkbar.style.left=F(b).left-F(this.$refs.nav).left+"px",n=!0)}n||(this.$refs.inkbar.style.width="0px",this.$refs.inkbar.style.left="0px")},getMenuItemProps:function(t,n){var o=this;return{action:h({class:this.cx("itemLink"),tabindex:-1,onClick:function(l){return o.onItemClick(l,t,n)},onKeyDown:function(l){return o.onKeydownItem(l,t,n)}},this.getPTOptions("itemLink",t,n)),icon:h({class:[this.cx("itemIcon"),t.icon]},this.getPTOptions("itemIcon",t,n)),label:h({class:this.cx("itemLabel")},this.getPTOptions("itemLabel",t,n))}}},directives:{ripple:Z}},he=["aria-labelledby","aria-label"],ge=["onClick","onKeydown","data-p-active","data-p-disabled"],Ie=["href","target","aria-label","aria-disabled"];function xe(e,t,n,o,b,l){var I=ae("ripple");return d(),m("div",h({class:e.cx("root")},e.ptmi("root")),[a("ul",h({ref:"nav",class:e.cx("tablist"),role:"menubar","aria-labelledby":e.ariaLabelledby,"aria-label":e.ariaLabel},e.ptm("tablist")),[(d(!0),m(C,null,ie(e.model,function(s,p){return d(),m(C,{key:l.label(s)+"_"+p.toString()},[l.visible(s)?(d(),m("li",h({key:0,ref_for:!0,ref:"tab",class:[e.cx("item",{item:s,index:p}),s.class],role:"presentation",onClick:function(x){return l.onItemClick(x,s,p)},onKeydown:function(x){return l.onKeydownItem(x,s,p)}},l.getPTOptions("item",s,p),{"data-p-active":b.d_activeIndex===p,"data-p-disabled":l.disabled(s)}),[e.$slots.item?(d(),B(S(e.$slots.item),{key:1,item:s,index:p,active:p===b.d_activeIndex,label:l.label(s),props:l.getMenuItemProps(s,p)},null,8,["item","index","active","label","props"])):se((d(),m("a",h({key:0,ref_for:!0,ref:"tabLink",role:"menuitem",href:s.url,class:e.cx("itemLink"),target:s.target,"aria-label":l.label(s),"aria-disabled":l.disabled(s),tabindex:-1},l.getPTOptions("itemLink",s,p)),[e.$slots.itemicon?(d(),B(S(e.$slots.itemicon),{key:0,item:s,class:O(e.cx("itemIcon"))},null,8,["item","class"])):s.icon?(d(),m("span",h({key:1,class:[e.cx("itemIcon"),s.icon],ref_for:!0},l.getPTOptions("itemIcon",s,p)),null,16)):y("",!0),a("span",h({class:e.cx("itemLabel"),ref_for:!0},l.getPTOptions("itemLabel",s,p)),g(l.label(s)),17)],16,Ie)),[[I]])],16,ge)):y("",!0)],64)}),128)),a("li",h({ref:"inkbar",role:"none",class:e.cx("activeBar")},e.ptm("activeBar")),null,16)],16,he)],16)}U.render=xe;const ke={class:"profile-page"},ye={class:"flex flex-col gap-y-4"},$e={key:0,class:"p-4 text-center"},we={key:1,class:"p-4 text-center"},_e={class:"profile-name mt-3 mb-1"},Te={class:"profile-role mb-3"},Pe={key:0,class:"profile-stats grid"},Le={class:"profile-contact"},Ve={class:"flex items-center mb-3"},Ne={class:"flex items-center mb-3"},Ce={class:"flex items-center mb-3"},Me={key:1,class:"profile-actions mt-4 flex justify-content-center"},De={key:0,class:"mt-4"},Fe={class:"field mt-3"},Be={class:"flex items-center gap-x-8 mb-4"},Se={class:"flex items-center gap-x-8 mb-4"},Ae={key:0,class:"flex justify-content-center p-4"},Ee={key:1,class:"grid p-fluid"},Ke={class:"col-12 flex justify-content-center mb-3"},Oe={class:"col-12 mb-3"},Ue={class:"flex items-center gap-x-2"},je={class:"col-12 mb-3"},ze={class:"flex items-center gap-x-2"},Re={class:"col-12 mb-3"},He={class:"flex items-center gap-x-2"},Ge={class:"col-12 mb-3"},Je={class:"flex items-center gap-x-2"},We={__name:"Profile",setup(e){const t=oe(),n=N(!1),o=N(0),b=N([{label:"Настройки",icon:"pi pi-cog",command:()=>o.value=2}]),{data:l,isLoading:I,error:s,refetch:p}=le(),f=A(()=>(l==null?void 0:l.value)||{firstName:"Загрузка...",lastName:"",avatarId:"string",profileType:"",accountId:"",phone:"",city:"",status:""}),x=A(()=>({admin:"Администратор",moderator:"Модератор"})[f.value.profileType]||f.value.profileType||"Неизвестная роль"),v=E({});function j(){Object.assign(v,f.value),n.value=!0}const $=E({emailNotifications:!0,twoFactorAuth:!1}),{mutate:z,isPending:w}=re({onSuccess:()=>{n.value=!1,t.add({severity:"success",summary:"Успех",detail:"Профиль успешно обновлен",life:3e3})},onError:L=>{t.add({severity:"error",summary:"Ошибка",detail:`Не удалось обновить профиль: ${L.message}`,life:3e3})}});function R(){z(v)}return(L,i)=>{const _=ue,M=de,H=U,D=me,G=Y,T=X,J=W;return d(),m("div",ke,[a("div",ye,[a("div",null,[r(M,{class:"profile-card"},{header:k(()=>[a("div",{class:O(["profile-header flex flex-column items-center",{"justify-center":c(I)||c(s)}])},[c(I)?(d(),m("div",$e,[r(c(K),{style:{width:"50px",height:"50px"}}),i[9]||(i[9]=a("p",null,"Загрузка данных...",-1))])):c(s)?(d(),m("div",we,[i[10]||(i[10]=a("i",{class:"pi pi-exclamation-triangle text-xl text-red-500 mb-2"},null,-1)),a("p",null,"Ошибка загрузки профиля: "+g(c(s).message),1),r(_,{label:"Повторить",icon:"pi pi-refresh",onClick:c(p),class:"mt-2"},null,8,["onClick"])])):(d(),m(C,{key:2},[a("h2",_e,g(f.value.firstName+" "+f.value.lastName),1),a("p",Te,g(x.value),1)],64))],2)]),content:k(()=>[!c(I)&&!c(s)?(d(),m("div",Pe,[a("div",Le,[a("div",Ve,[i[11]||(i[11]=a("i",{class:"pi pi-user mr-2"},null,-1)),a("span",null,"Account ID: "+g(f.value.accountId),1)]),a("div",Ne,[i[12]||(i[12]=a("i",{class:"pi pi-phone mr-2"},null,-1)),a("span",null,g(f.value.phone),1)]),a("div",Ce,[i[13]||(i[13]=a("i",{class:"pi pi-map-marker mr-2"},null,-1)),a("span",null,g(f.value.city),1)])])])):y("",!0),!c(I)&&!c(s)?(d(),m("div",Me,[r(_,{label:"Редактировать профиль",icon:"pi pi-user-edit",class:"p-button-rounded p-button-outlined",onClick:j})])):y("",!0)]),_:1})]),a("div",null,[r(M,null,{content:k(()=>[r(H,{modelValue:o.value,"onUpdate:modelValue":i[0]||(i[0]=u=>o.value=u),model:b.value},null,8,["modelValue","model"]),o.value===0?(d(),m("div",De,[i[16]||(i[16]=a("h3",null,"Настройки",-1)),a("div",Fe,[a("div",Be,[i[14]||(i[14]=a("label",null,"Допуск Уведомления",-1)),r(D,{modelValue:$.emailNotifications,"onUpdate:modelValue":i[1]||(i[1]=u=>$.emailNotifications=u)},null,8,["modelValue"])]),a("div",Se,[i[15]||(i[15]=a("label",null,"Двухфакторная аутентификация",-1)),r(D,{modelValue:$.twoFactorAuth,"onUpdate:modelValue":i[2]||(i[2]=u=>$.twoFactorAuth=u)},null,8,["modelValue"])])])])):y("",!0)]),_:1})])]),r(J,{visible:n.value,"onUpdate:visible":i[8]||(i[8]=u=>n.value=u),header:"Редактировать профиль",style:{width:"500px"},modal:!0},{footer:k(()=>[r(_,{label:"Отмена",icon:"pi pi-times",class:"p-button-text",onClick:i[7]||(i[7]=u=>n.value=!1),disabled:c(w)},null,8,["disabled"]),r(_,{label:"Сохранить",icon:"pi pi-check",onClick:R,disabled:c(w),loading:c(w)},null,8,["disabled","loading"])]),default:k(()=>[c(w)?(d(),m("div",Ae,[r(c(K),{style:{width:"50px",height:"50px"}}),i[17]||(i[17]=a("p",{class:"ml-3"},"Сохранение изменений...",-1))])):(d(),m("div",Ee,[a("div",Ke,[r(G,{image:f.value.avatarId||"/layout/images/avatar-placeholder.png",size:"xlarge",shape:"circle"},null,8,["image"])]),a("div",Oe,[a("div",Ue,[i[18]||(i[18]=a("span",null,[a("i",{class:"pi pi-user"})],-1)),r(T,{class:"w-full",modelValue:v.firstName,"onUpdate:modelValue":i[3]||(i[3]=u=>v.firstName=u),placeholder:"Имя"},null,8,["modelValue"])])]),a("div",je,[a("div",ze,[i[19]||(i[19]=a("span",null,[a("i",{class:"pi pi-user"})],-1)),r(T,{class:"w-full",modelValue:v.lastName,"onUpdate:modelValue":i[4]||(i[4]=u=>v.lastName=u),placeholder:"Фамилия"},null,8,["modelValue"])])]),a("div",Re,[a("div",He,[i[20]||(i[20]=a("span",null,[a("i",{class:"pi pi-phone"})],-1)),r(T,{class:"w-full",modelValue:v.phone,"onUpdate:modelValue":i[5]||(i[5]=u=>v.phone=u),placeholder:"Телефон"},null,8,["modelValue"])])]),a("div",Ge,[a("div",Je,[i[21]||(i[21]=a("span",null,[a("i",{class:"pi pi-map-marker"})],-1)),r(T,{class:"w-full",modelValue:v.city,"onUpdate:modelValue":i[6]||(i[6]=u=>v.city=u),placeholder:"Город"},null,8,["modelValue"])])])]))]),_:1},8,["visible"])])}}},lt=ce(We,[["__scopeId","data-v-cef7a8fe"]]);export{lt as default};
