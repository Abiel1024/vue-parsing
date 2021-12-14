import{_ as t,c as s,o as l,a as e,b as n}from"./app.671a210c.js";var o="/assets/todomvc.ac51cb05.png";const C='{"title":"\u51C6\u5907\u5DE5\u4F5C","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u51C6\u5907\u5DE5\u4F5C","slug":"\u51C6\u5907\u5DE5\u4F5C"},{"level":2,"title":"\u9879\u76EE\u7ED3\u6784","slug":"\u9879\u76EE\u7ED3\u6784"},{"level":3,"title":"pnpm-workspace","slug":"pnpm-workspace"},{"level":2,"title":"\u672C\u5730\u8C03\u8BD5","slug":"\u672C\u5730\u8C03\u8BD5"}],"relativePath":"getStart.md","lastUpdated":1638793315071}',a={},r=e("h2",{id:"\u51C6\u5907\u5DE5\u4F5C",tabindex:"-1"},[n("\u51C6\u5907\u5DE5\u4F5C "),e("a",{class:"header-anchor",href:"#\u51C6\u5907\u5DE5\u4F5C","aria-hidden":"true"},"#")],-1),c=e("ol",null,[e("li",null,[n("clone"),e("a",{href:"https://github.com/vuejs/vue-next.git",target:"_blank",rel:"noopener noreferrer"},"vue-next"),n(" \u4EE3\u7801\u5230\u672C\u5730")]),e("li",null,[n("\u5B89\u88C5pnpm "),e("code",null,"npm install -g pnpm"),n(" vue3\u9ED8\u8BA4\u4F7F\u7528pnpm\u8FDB\u884C\u4F9D\u8D56\u7684\u7BA1\u7406\uFF0C\u6240\u4EE5\u9700\u8981\u5B89\u88C5"),e("a",{href:"https://www.pnpm.cn/npmrc",target:"_blank",rel:"noopener noreferrer"},"pnpm")]),e("li",null,[n("\u8FD0\u884C "),e("code",null,"pnpm install"),n(" \u5C06\u9879\u76EE\u76F8\u5173\u7684\u4F9D\u8D56\u4E0B\u8F7D\u4E0B\u6765\uFF0C\u4E3A\u540E\u7EED\u7684\u8C03\u8BD5\u4F5C\u51C6\u5907")])],-1),p=e("h2",{id:"\u9879\u76EE\u7ED3\u6784",tabindex:"-1"},[n("\u9879\u76EE\u7ED3\u6784 "),e("a",{class:"header-anchor",href:"#\u9879\u76EE\u7ED3\u6784","aria-hidden":"true"},"#")],-1),d=e("div",{class:"language-"},[e("pre",null,[e("code",null,`.
\u251C\u2500\u2500 packages------------------------------- \u6838\u5FC3\u76EE\u5F55
\u2502\xA0\xA0 \u251C\u2500\u2500 compiler-core
\u2502\xA0\xA0 \u251C\u2500\u2500 compiler-dom
\u2502\xA0\xA0 \u251C\u2500\u2500 compiler-sfc
\u2502\xA0\xA0 \u251C\u2500\u2500 compiler-ssr
\u2502\xA0\xA0 \u251C\u2500\u2500 reactivity
\u2502\xA0\xA0 \u251C\u2500\u2500 ref-transform
\u2502\xA0\xA0 \u251C\u2500\u2500 runtime-core
\u2502\xA0\xA0 \u251C\u2500\u2500 runtime-dom
\u2502\xA0\xA0 \u251C\u2500\u2500 runtime-test
\u2502\xA0\xA0 \u251C\u2500\u2500 server-renderer
\u2502\xA0\xA0 \u251C\u2500\u2500 sfc-playground
\u2502\xA0\xA0 \u251C\u2500\u2500 shared
\u2502\xA0\xA0 \u251C\u2500\u2500 size-check
\u2502\xA0\xA0 \u251C\u2500\u2500 template-explorer
\u2502\xA0\xA0 \u251C\u2500\u2500 vue
\u2502\xA0\xA0 \u251C\u2500\u2500 vue-compat
\u2502\xA0\xA0 \u251C\u2500\u2500 global.d.ts------------------ \u5168\u5C40\u7C7B\u578B\u58F0\u660E
\u251C\u2500\u2500 scripts-------------------------------- \u6253\u5305\u76F8\u5173
\u2502\xA0\xA0 \u251C\u2500\u2500 bootstrap.js
\u2502\xA0\xA0 \u251C\u2500\u2500 build.js
\u2502\xA0\xA0 \u251C\u2500\u2500 dev.js
\u2502\xA0\xA0 \u251C\u2500\u2500 filter-e2e.js
\u2502\xA0\xA0 \u251C\u2500\u2500 filter-unit.js
\u2502\xA0\xA0 \u251C\u2500\u2500 preinstall.js
\u2502\xA0\xA0 \u251C\u2500\u2500 release.js
\u2502\xA0\xA0 \u251C\u2500\u2500 setupJestEnv.ts
\u2502\xA0\xA0 \u251C\u2500\u2500 utils.js
\u2502\xA0\xA0 \u2514\u2500\u2500 verifyCommit.js
\u251C\u2500\u2500 test-dts------------------------------- \u6D4B\u8BD5\u76F8\u5173
\u2502\xA0\xA0 \u251C\u2500\u2500 ...
\u251C\u2500\u2500 CHANGELOG.md--------------------------- \u66F4\u65B0\u65E5\u5FD7\u6587\u4EF6
\u251C\u2500\u2500 README.md------------------------------ readme
\u251C\u2500\u2500 package.json
\u251C\u2500\u2500 pnpm-workspace.yaml-------------------- \u544A\u8BC9pnpm\u4EE3\u7801\u8DEF\u5F84
\u251C\u2500\u2500 rollup.config.js----------------------- rollup\u914D\u7F6E
\u2514\u2500\u2500 tsconfig.json-------------------------- typescript\u914D\u7F6E

`)])],-1),i=e("h3",{id:"pnpm-workspace",tabindex:"-1"},[n("pnpm-workspace "),e("a",{class:"header-anchor",href:"#pnpm-workspace","aria-hidden":"true"},"#")],-1),u=e("p",null,[n("Vue3\u91C7\u7528 "),e("a",{href:"https://segmentfault.com/a/1190000039157365",target:"_blank",rel:"noopener noreferrer"},"monorepo"),n(" \u662F\u7BA1\u7406\u9879\u76EE\u4EE3\u7801\u7684\u65B9\u5F0F\u3002\u5728\u4E00\u4E2A repo \u4E2D\u7BA1\u7406\u591A\u4E2Apackage\uFF0C\u6BCF\u4E2A package \u90FD\u6709\u81EA\u5DF1\u7684\u7C7B\u578B\u58F0\u660E\u3001\u5355\u5143\u6D4B\u8BD5\u3002 \u6240\u4EE5\u76F8\u8F83vue2\u6765\u8BF4\uFF0Cvue3\u7684\u5404\u4E2A\u6A21\u5757\u5212\u5206\u7684\u66F4\u52A0\u6E05\u6670\uFF0C\u8BFB\u8D77\u6765\u4E5F\u66F4\u52A0\u5BB9\u6613\u3002")],-1),m=e("p",null,[n("\u901A\u8FC7"),e("code",null,"pnpm-workspace.yaml"),n(" \u5C06\u5305\u6A21\u5757\u4EE3\u7801\u653E\u7F6E\u5728\u4E86packages\u7684\u6587\u4EF6\u5939\u4E0B\uFF08install\u7684\u65F6\u5019\u4F1A\u53BB\u8BB2packages\u76EE\u5F55\u4E0B\u7684\u4F9D\u8D56\u4E5F\u5B89\u88C5\u4E0B\u6765\uFF09\u3002")],-1),h=e("h2",{id:"\u672C\u5730\u8C03\u8BD5",tabindex:"-1"},[n("\u672C\u5730\u8C03\u8BD5 "),e("a",{class:"header-anchor",href:"#\u672C\u5730\u8C03\u8BD5","aria-hidden":"true"},"#")],-1),_=e("p",null,[n("\u63A5\u4E0B\u6765\u6211\u4EEC\u770B\u5230"),e("code",null,"package.json"),n("\u4E2D\u5B58\u5728"),e("code",null,"dev"),n("\u9009\u9879\uFF0C\u53EF\u4EE5\u672C\u5730\u8FD0\u884C\u8D77\u6765\u3002 \u8FD0\u884C\u5B8C\u4E4B\u540E\u5C31\u80FD\u770B\u5230")],-1),g=e("div",{class:"language-"},[e("pre",null,[e("code",null,`created packages/vue/dist/vue.global.js in 1.2s
`)])],-1),v=e("p",null,[n("\u4E5F\u5C31\u662F\u8BF4\uFF0C\u672C\u5730\u7684"),e("code",null,"vue.js"),n("\u5DF2\u7ECF\u521B\u5EFA\u5B8C\u6210\uFF0C\u5728"),e("code",null,"vue/dist"),n("\u76EE\u5F55\u4E0B\u3002")],-1),f=e("p",null,[n("vue\u51C6\u5907\u4E86\u51E0\u4E2A"),e("code",null,"example"),n("\uFF0C\u6211\u4EEC\u53EF\u4EE5\u76F4\u63A5\u7528\u6765\u6D4B\u8BD5\u3002\u6211\u4EEC\u6311\u4E00\u4E2A\u6253\u5F00")],-1),k=e("div",{class:"language-"},[e("pre",null,[e("code",null,`/vue/examples/composition/todomvc.html

<script src="../../dist/vue.global.js"><\/script>
<link rel="stylesheet" href="../../../../node_modules/todomvc-app-css/index.css">

....
`)])],-1),j=e("p",null,[n("\u53EF\u4EE5\u770B\u5230\u5728todomvc\u4E2D\u5F15\u5165\u7684\u662F\u5F53\u524D"),e("code",null,"vue/dist/vue.global.js"),n(", \u4E5F\u5C31\u662F\u6211\u4EEC"),e("code",null,"run dev"),n("\u751F\u6210\u7684\u4EE3\u7801\u3002 \u6240\u4EE5\u6211\u4EEC\u53EF\u4EE5\u76F4\u63A5\u5728\u6D4F\u89C8\u5668\u4E2D\u8FDB\u884C\u8C03\u8BD5\u3002\u6211\u4EEC\u5C1D\u8BD5\u4E00\u4E0B\u5728"),e("code",null,"packages/runtime-dom/src/index.ts"),n("\u4E2D\u627E\u5230createApp\u65B9\u6CD5\uFF0C\u76F4\u63A5\u6253\u5370args\u53C2\u6570\u3002 \u6211\u4EEC\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\uFF0C\u53EF\u4EE5\u770B\u5230 "),e("img",{src:o,alt:"todomvc.png"})],-1),b=e("p",null,"\u901A\u8FC7\u8FD9\u6837\u8C03\u8BD5\uFF0C\u6211\u4EEC\u53EF\u4EE5\u5728\u9605\u8BFB\u6E90\u7801\u6709\u7591\u95EE\u7684\u65F6\u5019\u8FDB\u884C\u6253\u5370\uFF0C\u975E\u5E38\u7684\u65B9\u4FBF\u3002",-1),x=[r,c,p,d,i,u,m,h,_,g,v,f,k,j,b];function w(y,E,$,A,B,N){return l(),s("div",null,x)}var D=t(a,[["render",w]]);export{C as __pageData,D as default};
