import{s as _}from"./index-BuQ7RLbE.js";import{s as y}from"./index-BZCwrXA6.js";import{B as $,c as u,o as g,G as z,J as w,m as v,a as n,h as f,F as b,s as T,U as C,_ as O,r as h,d as m,g as r,H as p,I as c,W as B,K as S}from"./index-BYh_6mq5.js";import"./index-CnWAXhz9.js";var A=({dt:e})=>`
.p-timeline {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    direction: ltr;
}

.p-timeline-left .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-left .p-timeline-event-content {
    text-align: left;
}

.p-timeline-right .p-timeline-event {
    flex-direction: row-reverse;
}

.p-timeline-right .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-right .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: row-reverse;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-opposite {
    text-align: right;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-content {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-opposite {
    text-align: left;
}

.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(even) .p-timeline-event-content {
    text-align: right;
}

.p-timeline-vertical .p-timeline-event-opposite,
.p-timeline-vertical .p-timeline-event-content {
    padding: ${e("timeline.vertical.event.content.padding")};
}

.p-timeline-vertical .p-timeline-event-connector {
    width: ${e("timeline.event.connector.size")};
}

.p-timeline-event {
    display: flex;
    position: relative;
    min-height: ${e("timeline.event.min.height")};
}

.p-timeline-event:last-child {
    min-height: 0;
}

.p-timeline-event-opposite {
    flex: 1;
}

.p-timeline-event-content {
    flex: 1;
}

.p-timeline-event-separator {
    flex: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.p-timeline-event-marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    align-self: baseline;
    border-width: ${e("timeline.event.marker.border.width")};
    border-style: solid;
    border-color: ${e("timeline.event.marker.border.color")};
    border-radius: ${e("timeline.event.marker.border.radius")};
    width: ${e("timeline.event.marker.size")};
    height: ${e("timeline.event.marker.size")};
    background: ${e("timeline.event.marker.background")};
}

.p-timeline-event-marker::before {
    content: " ";
    border-radius: ${e("timeline.event.marker.content.border.radius")};
    width: ${e("timeline.event.marker.content.size")};
    height:${e("timeline.event.marker.content.size")};
    background: ${e("timeline.event.marker.content.background")};
}

.p-timeline-event-marker::after {
    content: " ";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${e("timeline.event.marker.border.radius")};
    box-shadow: ${e("timeline.event.marker.content.inset.shadow")};
}

.p-timeline-event-connector {
    flex-grow: 1;
    background: ${e("timeline.event.connector.color")};
}

.p-timeline-horizontal {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event {
    flex-direction: column;
    flex: 1;
}

.p-timeline-horizontal .p-timeline-event:last-child {
    flex: 0;
}

.p-timeline-horizontal .p-timeline-event-separator {
    flex-direction: row;
}

.p-timeline-horizontal .p-timeline-event-connector {
    width: 100%;
    height: ${e("timeline.event.connector.size")};
}

.p-timeline-horizontal .p-timeline-event-opposite,
.p-timeline-horizontal .p-timeline-event-content {
    padding: ${e("timeline.horizontal.event.content.padding")};
}

.p-timeline-horizontal.p-timeline-alternate .p-timeline-event:nth-child(even) {
    flex-direction: column-reverse;
}

.p-timeline-bottom .p-timeline-event {
    flex-direction: column-reverse;
}
`,q={root:function(a){var s=a.props;return["p-timeline p-component","p-timeline-"+s.align,"p-timeline-"+s.layout]},event:"p-timeline-event",eventOpposite:"p-timeline-event-opposite",eventSeparator:"p-timeline-event-separator",eventMarker:"p-timeline-event-marker",eventConnector:"p-timeline-event-connector",eventContent:"p-timeline-event-content"},K=$.extend({name:"timeline",style:A,classes:q}),D={name:"BaseTimeline",extends:T,props:{value:null,align:{mode:String,default:"left"},layout:{mode:String,default:"vertical"},dataKey:null},style:K,provide:function(){return{$pcTimeline:this,$parentInstance:this}}},x={name:"Timeline",extends:D,inheritAttrs:!1,methods:{getKey:function(a,s){return this.dataKey?C(a,this.dataKey):s},getPTOptions:function(a,s){return this.ptm(a,{context:{index:s,count:this.value.length}})}}};function F(e,a,s,k,i,l){return g(),u("div",v({class:e.cx("root")},e.ptmi("root")),[(g(!0),u(z,null,w(e.value,function(d,o){return g(),u("div",v({key:l.getKey(d,o),class:e.cx("event"),ref_for:!0},l.getPTOptions("event",o)),[n("div",v({class:e.cx("eventOpposite",{index:o}),ref_for:!0},l.getPTOptions("eventOpposite",o)),[f(e.$slots,"opposite",{item:d,index:o})],16),n("div",v({class:e.cx("eventSeparator"),ref_for:!0},l.getPTOptions("eventSeparator",o)),[f(e.$slots,"marker",{item:d,index:o},function(){return[n("div",v({class:e.cx("eventMarker"),ref_for:!0},l.getPTOptions("eventMarker",o)),null,16)]}),o!==e.value.length-1?f(e.$slots,"connector",{key:0,item:d,index:o},function(){return[n("div",v({class:e.cx("eventConnector"),ref_for:!0},l.getPTOptions("eventConnector",o)),null,16)]}):b("",!0)],16),n("div",v({class:e.cx("eventContent"),ref_for:!0},l.getPTOptions("eventContent",o)),[f(e.$slots,"content",{item:d,index:o})],16)],16)}),128))],16)}x.render=F;const P={class:"grid grid-cols-12 gap-8"},I={class:"col-span-6"},N={class:"card"},V={class:"col-span-6"},j={class:"card"},L={class:"col-span-6"},M={class:"card"},E={class:"col-span-6"},H={class:"card"},R={class:"text-muted-color"},G={class:"col-span-full"},J={class:"card"},U=["src","alt"],W={class:"col-span-full"},Q={class:"card"},X={__name:"TimelineDoc",setup(e){const a=h([{status:"Ordered",date:"15/10/2020 10:30",icon:"pi pi-shopping-cart",color:"#9C27B0",image:"game-controller.jpg"},{status:"Processing",date:"15/10/2020 14:00",icon:"pi pi-cog",color:"#673AB7"},{status:"Shipped",date:"15/10/2020 16:15",icon:"pi pi-envelope",color:"#FF9800"},{status:"Delivered",date:"16/10/2020 10:00",icon:"pi pi-check",color:"#607D8B"}]),s=h(["2020","2021","2022","2023"]);return(k,i)=>{const l=x,d=y,o=_;return g(),u("div",P,[n("div",I,[n("div",N,[i[0]||(i[0]=n("div",{class:"font-semibold text-xl mb-4"},"Left Align",-1)),m(l,{value:a.value},{content:r(t=>[p(c(t.item.status),1)]),_:1},8,["value"])])]),n("div",V,[n("div",j,[i[1]||(i[1]=n("div",{class:"font-semibold text-xl mb-4"},"Right Align",-1)),m(l,{value:a.value,align:"right"},{content:r(t=>[p(c(t.item.status),1)]),_:1},8,["value"])])]),n("div",L,[n("div",M,[i[2]||(i[2]=n("div",{class:"font-semibold text-xl mb-4"},"Alternate Align",-1)),m(l,{value:a.value,align:"alternate"},{content:r(t=>[p(c(t.item.status),1)]),_:1},8,["value"])])]),n("div",E,[n("div",H,[i[3]||(i[3]=n("div",{class:"font-semibold text-xl mb-4"},"Opposite Content",-1)),m(l,{value:a.value},{opposite:r(t=>[n("small",R,c(t.item.date),1)]),content:r(t=>[p(c(t.item.status),1)]),_:1},8,["value"])])]),n("div",G,[n("div",J,[i[5]||(i[5]=n("div",{class:"font-semibold text-xl mb-4"},"Templating",-1)),m(l,{value:a.value,align:"alternate",class:"customized-timeline"},{marker:r(t=>[n("span",{class:"flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm",style:B({backgroundColor:t.item.color})},[n("i",{class:S(t.item.icon)},null,2)],4)]),content:r(t=>[m(o,{class:"mt-4"},{title:r(()=>[p(c(t.item.status),1)]),subtitle:r(()=>[p(c(t.item.date),1)]),content:r(()=>[t.item.image?(g(),u("img",{key:0,src:`https://primefaces.org/cdn/primevue/images/product/${t.item.image}`,alt:t.item.name,width:"200",class:"shadow-sm"},null,8,U)):b("",!0),i[4]||(i[4]=n("p",null," Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas! ",-1)),m(d,{label:"Read more",text:""})]),_:2},1024)]),_:1},8,["value"])])]),n("div",W,[n("div",Q,[i[7]||(i[7]=n("div",{class:"font-semibold text-xl mb-4"},"Horizontal",-1)),i[8]||(i[8]=n("div",{class:"font-semibold mb-2"},"Top Align",-1)),m(l,{value:s.value,layout:"horizontal",align:"top"},{content:r(t=>[p(c(t.item),1)]),_:1},8,["value"]),i[9]||(i[9]=n("div",{class:"font-semibold mt-4 mb-2"},"Bottom Align",-1)),m(l,{value:s.value,layout:"horizontal",align:"bottom"},{content:r(t=>[p(c(t.item),1)]),_:1},8,["value"]),i[10]||(i[10]=n("div",{class:"font-semibold mt-4 mb-2"},"Alternate Align",-1)),m(l,{value:s.value,layout:"horizontal",align:"alternate"},{opposite:r(()=>i[6]||(i[6]=[p("   ")])),content:r(t=>[p(c(t.item),1)]),_:1},8,["value"])])])])}}},te=O(X,[["__scopeId","data-v-f565df02"]]);export{te as default};
