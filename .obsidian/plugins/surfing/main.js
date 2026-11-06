"use strict";var fr=Object.defineProperty;var mr=(r,n,e)=>n in r?fr(r,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[n]=e;var y=(r,n,e)=>mr(r,typeof n!="symbol"?n+"":n,e);const A=require("obsidian"),ne=require("electron"),br=require("node:fs"),vr=require("node:path"),wr=require("@codemirror/view"),yr=require("node:os"),ft=require("node:crypto"),kr=require("node:zlib"),Er=require("node:util"),xr=require("node:https"),Sr=require("node:http");function et(r){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const e in r)if(e!=="default"){const t=Object.getOwnPropertyDescriptor(r,e);Object.defineProperty(n,e,t.get?t:{enumerable:!0,get:()=>r[e]})}}return n.default=r,Object.freeze(n)}const j=et(br),H=et(vr),es=et(yr),Ce=et(ft),Cr=et(kr),Tr=et(xr),Ir={},Ar={},Lr={},Or={},xi={"Search with":" Search with ","or enter address":" or enter address","Default Search Engine":"Default Search Engine","Set Custom Search Engine Url":"Set Custom Search Engine Url","Set custom search engine url for yourself. 'Duckduckgo' By default":"Set custom search engine url for yourself. 'Duckduckgo' By default","Custom Link to Highlight Format":"Custom Link to Highlight Format","Copy Link to Highlight Format":"Copy Link to Highlight Format","Set copy link to text fragment format. [{CONTENT}]({URL}) By default. You can also set {TIME:YYYY-MM-DD HH:mm:ss} to get the current date.":"Set copy link to text fragment format. [{CONTENT}]({URL}) By default. You can also set {TIME:YYYY-MM-DD HH:mm:ss} to get the current date.","Open URL In Same Tab":"Open In Same Tab",Baidu:"Baidu",Yahoo:"Yahoo",Bing:"Bing",Google:"Google",DuckDuckGo:"DuckDuckGo","Toggle Same Tab In Web Browser":"Toggle Same Tab In Web Browser","Clear Current Page History":"Clear Current Page History","Open Current URL In External Browser":"Open Current URL In External Browser","Search Text":"Search Text","Copy Plain Text":"Copy Plain Text","Copy Link to Highlight":"Copy Link to Highlight","Copy Video Timestamp":"Copy Video Time","Open URL In Obsidian Web From Other Software":"Open URL In Obsidian Web From Other Software","(Reload to take effect)":"(Reload to take effect)","Copy BookmarkLets Success":"Copy BookmarkLets Success","Refresh Current Page":"Refresh Current Page","Show Search Bar In Empty Page":"Show Search Bar In Empty Page","You enabled obsidian-web-browser plugin, please disable it/disable surfing to avoid conflict.":"You enabled obsidian-web-browser plugin, please disable it/disable Surfing to avoid conflict.","You didn't enable show tab title bar in apperance settings, please enable it to use surfing happily.":"You didn't enable show tab header in apperance settings, please enable it to use Surfing happily.","Get Current Timestamp from Web Browser":"Get Current Timestamp from Web Browser","Search In Current Page Title Bar":"Search In Current Page Title Bar","   <- Drag or click on me":"   <- Drag or click on me",Name:"Name",Url:"Url","Custom Search":"Custom Search","Delete Custom Search":"Delete Custom Search","Add new custom search engine":"Add new custom search engine","Search all settings":"Search all settings",General:"General",Search:"Search",Bookmark:"Bookmark",Theme:"Theme","Always Show Custom Engines":"Always Show Custom Engines","Save Current Page As Markdown":"Save Current Page As Markdown","Save As Markdown Path":"Save As Markdown Path","Path like /_Tempcard":"Path like /_Tempcard","Search Engine":"Search Engine",settings:"settings","Using ":"Using "," to search":" to search","Surfing Iframe":"Surfing Iframe","Surfing is using iframe to prevent crashed when loading some websites.":"Surfing is using iframe to prevent crashed when loading some websites.","Open With External Browser":"Open With External Browser","Open With Surfing":"Open With Surfing","When click on the URL from same domain name in the note, jump to the same surfing view rather than opening a new Surfing view.":"When click on the URL from same domain name in the note, jump to the same surfing view rather than opening a new Surfing view.","Jump to Opened Page":"Jump to Opened Page","Open Quick Switcher":"Open Quick Switcher | Ctrl/CMD+O","Close Current Leaf":"Close Current Leaf | Ctrl/CMD+W","Create A New Note":"Create A New Note | Ctrl/CMD+N","Show Other Search Engines When Searching":"Show Other Search Engines When Searching","Random Icons From Default Art":"Random Icons From Default Art","Working On, Not Available Now":"Working On, Not Available Now","Toggle Dark Mode":"Toggle Dark Mode","[Experimental] Replace Iframe In Canvas":"[Experimental] Replace Iframe In Canvas","Use icon list to replace defult text actions in empty view":"Use icon list to replace defult text actions in empty view","Open BookmarkBar & Bookmark Manager":"Open BookmarkBar & Bookmark Manager","Bookmark Folder":"Bookmark Folder","Vault folder where bookmark files are stored.":"Vault folder where bookmark files are stored.","Default Category":"Default Category","Show Refresh Button Near Search Bar":"Show Refresh Button Near Search Bar","Focus On Current Search Bar":"Focus On Current Search Bar","Save Bookmark When Open URI":"Save Bookmark When Open URI","Copy Current Viewport As Image":"Copy Current Viewport As Image",Back:"Back",Forward:"Forward",star:"star","Copy failed, you may focus on surfing view, click the title bar, and try again.":"Copy failed, you may focus on surfing view, click the title bar, and try again.","Send to ReadWise":"Send to ReadWise","Add a action in page header to Send to ReadWise.":"Add a action in page header to Send to ReadWise.","Disable / to search when on these sites":"Disable / to search when on these sites","Focus search bar via keyboard":"Focus search bar via keyboard","Hover Popover":"Hover Popover","Show a popover when hover on the link.":"Show a popover when hover on the link.","Enable HTML Preview":"Enable HTML Preview","Enable HTML Preview in Surfing":"Enable HTML Preview in Surfing","Show original url":"Show original url","Enable Inline Preview":"Enable Inline Preview","Enable inline preview with surfing. Currently only support Live preview":"Enable inline preview with surfing. Currently only support Live preview","Enable Tree View in Surfing":"Enable Tree View in Surfing","Enable Tree View":"Enable Tree View","Ad Block":"Ad Block","Enable Ad Blocking":"Enable Ad Blocking","Filter Lists":"Filter Lists","Add Filter List":"Add Filter List","Reload Filter Lists":"Reload Filter Lists","Delete Filter List":"Delete Filter List","Enable Element Hiding":"Enable Element Hiding","Pick Element to Block":"Pick Element to Block","Element blocked: ":"Element blocked: ","Filter list load failed: ":"Filter list load failed: ","Block requests to domains in your filter lists.":"Block requests to domains in your filter lists.","Allow picking and hiding page elements.":"Allow picking and hiding page elements.","Manage filter lists for ad blocking.":"Manage filter lists for ad blocking.","Filter lists reloaded.":"Filter lists reloaded.","Manage Cookies":"Manage Cookies","Manage Cookies for Current Site":"Manage Cookies for Current Site","Cookies for ":"Cookies for ","Delete All":"Delete All","Delete all cookies for this site":"Delete all cookies for this site","No cookies found for this site.":"No cookies found for this site.","Cookie deleted: ":"Cookie deleted: ","All cookies deleted for ":"All cookies deleted for ","Toggle Reader Mode":"Toggle Reader Mode","Webview is not ready.":"Webview is not ready.","Action type is required.":"Action type is required.","Missing url in navigate action.":"Missing url in navigate action.","Missing url in open_new_tab action.":"Missing url in open_new_tab action.",Opened:"Opened","Opened in new tab":"Opened in new tab","Moved back in history.":"Moved back in history.","Moved forward in history.":"Moved forward in history.","Reloaded current page.":"Reloaded current page.","Missing selector in click action.":"Missing selector in click action.","Missing selector in type action.":"Missing selector in type action.","Missing script in evaluate action.":"Missing script in evaluate action.","Unsupported action type":"Unsupported action type","Independent Sessions Per Tab":"Independent Sessions Per Tab","Each browser tab gets its own session with separate cookies. Requires reload.":"Each browser tab gets its own session with separate cookies. Requires reload.","Open Link In New Tab":"Open Link In New Tab","Open Link In External Browser":"Open Link In External Browser","Copy Link Address":"Copy Link Address","Copy Image":"Copy Image","Copy Image Address":"Copy Image Address",Cut:"Cut",Copy:"Copy",Paste:"Paste","Select All":"Select All",Extensions:"Extensions","Links, previews, highlights and saving pages.":"Links, previews, highlights and saving pages.","The search bar, search engines and shortcuts.":"The search bar, search engines and shortcuts.","How Surfing views look.":"How Surfing views look.","The bookmark bar and the bookmark manager.":"The bookmark bar and the bookmark manager.","Block ads and hide elements on web pages.":"Block ads and hide elements on web pages.","Install and manage Chrome extensions.":"Install and manage Chrome extensions.","Highlights and saving":"Highlights and saving",Integrations:"Integrations","Search bar":"Search bar","Search engines":"Search engines","Custom search engines":"Custom search engines","No custom search engines.":"No custom search engines.","No filter lists.":"No filter lists.","Add filter list":"Add filter list","Obsidian bookmarklets code":"Obsidian bookmarklets code","Show last opened files":"Show last opened files","Random Background":"Random Background",MCP:"MCP","Let AI agents see and control the web pages open in Obsidian.":"Let AI agents see and control the web pages open in Obsidian.","Enable MCP server":"Enable MCP server","Lets AI agents such as Claude Code and Codex CLI read and control the web pages open in Obsidian. Only programs on this computer that have the access token can connect.":"Lets AI agents such as Claude Code and Codex CLI read and control the web pages open in Obsidian. Only programs on this computer that have the access token can connect.",Status:"Status",Port:"Port","The server listens on this port of 127.0.0.1 only.":"The server listens on this port of 127.0.0.1 only.","Enter a port between 1024 and 65535.":"Enter a port between 1024 and 65535.","Access token":"Access token","Generated when the server is first enabled.":"Generated when the server is first enabled.","Copied.":"Copied.",Regenerate:"Regenerate","New token generated. Update the clients you connected.":"New token generated. Update the clients you connected.","Connect a client":"Connect a client","Other clients (JSON)":"Other clients (JSON)",Permissions:"Permissions","Site access":"Site access","Ask the first time an agent uses a site, or let agents use every site that is not blocked.":"Ask the first time an agent uses a site, or let agents use every site that is not blocked.",Ask:"Ask","Allow all sites":"Allow all sites","Allow running JavaScript in pages":"Allow running JavaScript in pages","Warning: lets agents run any code in the pages they control, with access to your logged-in sessions on those sites. Leave off unless you need it.":"Warning: lets agents run any code in the pages they control, with access to your logged-in sessions on those sites. Leave off unless you need it.","Approved sites":"Approved sites","No approved sites. Sites you choose to always allow appear here.":"No approved sites. Sites you choose to always allow appear here.","Blocked sites":"Blocked sites","No blocked sites. Agents cannot read or act on blocked sites. Use example.com or *.example.com.":"No blocked sites. Agents cannot read or act on blocked sites. Use example.com or *.example.com.","Block a site":"Block a site","New blocked site":"New blocked site","Listening on {url}":"Listening on {url}","Port in use":"Port in use","Error: {error}":"Error: {error}",Off:"Off","Revoked {host} for this session.":"Revoked {host} for this session.","Surfing MCP: port {port} is already in use.":"Surfing MCP: port {port} is already in use.","Surfing MCP server could not start: {error}":"Surfing MCP server could not start: {error}","An AI agent wants to use a site":"An AI agent wants to use a site","{client} wants to read and control {host} in Surfing.":"{client} wants to read and control {host} in Surfing.","Allow this time":"Allow this time","Always allow {host}":"Always allow {host}",Deny:"Deny","Controlled by an MCP client":"Controlled by an MCP client",Agent:"Agent","Stop: revoke this site for this session":"Stop: revoke this site for this session"},Mr={},Nr={},Pr={},_r={},Rr={},Br={},Dr={},Ur={},Wr={},Fr={},$r={},jr={},qr={},Hr={},Vr={},zr={},Gr={"Search with":"使用 ","or enter address":" 搜索，或输入地址","Default Search Engine":"默认搜索引擎","Set Custom Search Engine Url":"设置自定义搜索引擎网址","Set custom search engine url for yourself. 'Duckduckgo' By default":"设置自定义搜索引擎网址。默认为'Duckduckgo'","Custom Link to Highlight Format":"自定义指向突出显示的链接的格式","Copy Link to Highlight Format":"复制指向突出显示的链接的格式","Set copy link to text fragment format. [{CONTENT}]({URL}) By default. You can also set {TIME:YYYY-MM-DD HH:mm:ss} to get the current date.":"设置复制文本片段的链接的格式。默认为[{CONTENT}]({URL})。你也可以设置{TIME:YYYY-MM-DD HH:mm:ss}来获取当前日期时间。","Open URL In Same Tab":"在固定且唯一标签页中打开网页",Custom:"自定义",Baidu:"百度",Yahoo:"雅虎",Bing:"必应",Google:"谷歌",DuckDuckGo:"DuckDuckGo","Toggle Same Tab In Web Browser":"切换是否在固定且唯一标签页访问网址","Clear Current Page History":"清除当前页面的历史记录","Open Current URL In External Browser":"在外部浏览器中打开当前网址","Search Text":"搜索文本","Copy Plain Text":"复制纯文本","Copy Link to Highlight":"复制指向突出显示的链接","Copy Video Timestamp":"复制视频时间戳","Open URL In Obsidian Web From Other Software":"从别的软件在 Obsidian Web 中打开网址","(Reload to take effect)":"（重启 Ob 以生效）","Copy BookmarkLets Success":"复制 BookmarkLets 成功","Refresh Current Page":"刷新当前页面","Show Search Bar In Empty Page":"在空白页面中显示搜索栏","You enabled obsidian-web-browser plugin, please disable it/disable surfing to avoid conflict.":"你启用了 obsidian-web-browser 插件，请禁用它或禁用 surfing 插件以避免冲突。","You didn't enable show tab title bar in apperance settings, please enable it to use surfing happily.":"你没有在外观设置中启用显示标签页标题，请启用它以便使用 surfing。","Get Current Timestamp from Web Browser":"从浏览器获取当前时间戳","Search In Current Page Title Bar":"在当前页面标题栏中搜索","   <- Drag or click on me":"   <- 拖动或点击",Name:"名称",Url:"链接","Custom Search":"自定义搜索","Delete Custom Search":"删除自定义","Add new custom search engine":"添加新的自定义搜索引擎","Search all settings":"搜索设置",General:"常规选项",Search:"搜索选项",Theme:"主题选项",Bookmark:"书签选项","Always Show Custom Engines":"始终显示自定义引擎","Save Current Page As Markdown":"保存当前网页为 Markdown","Save As Markdown Path":"保存为 Markdown 路径","Path like /_Tempcard":"路径例如 /_Tempcard","Search Engine":"搜索引擎",settings:"设置","Using ":"使用"," to search":"来检索","Surfing Iframe":"Surfing Iframe","Surfing is using iframe to prevent crashed when loading some websites.":"Surfing 使用 iframe 来防止加载某些网站时崩溃。","Open With External Browser":"在外部浏览器中打开","Open With Surfing":"在 Surfing 中打开","When click on the URL from same domain name in the note, jump to the same surfing view rather than opening a new Surfing view.":"当在笔记中点击相同域名的 URL 时，跳转到相同的 Surfing 视图而不是打开新的 Surfing 视图。","Jump to Opened Page":"跳转到已打开的页面","Open Quick Switcher":"打开快速切换 | Ctrl/CMD+O","Close Current Leaf":"关闭当前的页面 | Ctrl/CMD+W","Create A New Note":"新建笔记 | Ctrl/CMD+N","Show Other Search Engines When Searching":"搜索时显示其它搜索引擎","Random Icons From Default Art":"从默认的 Art 中挑选随机 Icon","Working On, Not Available Now":"正在建设中，当前不可用","Toggle Dark Mode":"切换夜间模式","[Experimental] Replace Iframe In Canvas":"【实验性功能】在 Canvas 中替换网页节点","Use icon list to replace defult text actions in empty view":"使用图标列替换空页面中的默认文本操作","Open BookmarkBar & Bookmark Manager":"打开书签栏和书签管理器",Pagination:"分页书签数",Category:"分类","Default Column List":"默认的列","Show Refresh Button Near Search Bar":"在搜索栏旁边显示刷新按钮","Focus On Current Search Bar":"聚焦到当前的搜索栏","Default Category Filter Type":"默认目录过滤形式",Tree:"树状",Menu:"菜单",Description:"描述",Tags:"标签",Created:"创建时间",Modified:"修改时间",Action:"操作","Search from ":"从"," bookmarks":"个书签中搜索","Save Bookmark When Open URI":"打开 URI 时保存书签","Copy Current Viewport As Image":"复制当前页面为图片",Back:"返回",Forward:"前进",star:"星标","Copy failed, you may focus on surfing view, click the title bar, and try again.":"复制失败，你可能聚焦到了 Surfing 视图，点击标题栏，然后再试一次。","Default Category (Use , to split)":"默认分类 (用,分层)","Send to ReadWise":"发送到 ReadWise","Add a action in page header to Send to ReadWise.":"在页面标题栏中添加一个动作来发送到 ReadWise。","Disable / to search when on these sites":"当在这些网站中禁止按 / 来搜索的功能","Focus search bar via keyboard":"通过键盘聚焦到搜索栏","Show a popover when hover on the link.":"当鼠标悬停在链接上时显示一个弹出窗口。","Hover Popover":"悬停弹出窗口","Show original url":"显示原始链接","Enable Inline Preview":"启用内联预览","Enable inline preview with surfing. Currently only support Live preview":"启用 Surfing 的内联预览。目前仅支持实时预览","Enable HTML Preview":"启用 HTML 预览","Enable HTML Preview in Surfing":"在 Surfing 中启用 HTML 预览","Open Link In New Tab":"在新标签页中打开链接","Open Link In External Browser":"在外部浏览器中打开链接","Copy Link Address":"复制链接地址","Copy Image":"复制图片","Copy Image Address":"复制图片地址",Cut:"剪切",Copy:"复制",Paste:"粘贴","Select All":"全选",Extensions:"扩展","Links, previews, highlights and saving pages.":"链接、预览、高亮与保存网页。","The search bar, search engines and shortcuts.":"搜索栏、搜索引擎与快捷键。","How Surfing views look.":"Surfing 视图的外观。","The bookmark bar and the bookmark manager.":"书签栏与书签管理器。","Block ads and hide elements on web pages.":"拦截广告并隐藏网页元素。","Install and manage Chrome extensions.":"安装和管理 Chrome 扩展。","Highlights and saving":"高亮与保存",Integrations:"集成","Search bar":"搜索栏","Search engines":"搜索引擎","Custom search engines":"自定义搜索引擎","No custom search engines.":"没有自定义搜索引擎。","No filter lists.":"没有过滤列表。","Add filter list":"添加过滤列表","Enable Tree View":"启用标签树视图","Enable Tree View in Surfing":"在 Surfing 中启用标签树视图","Bookmark Folder":"书签文件夹","Vault folder where bookmark files are stored.":"库中存放书签文件的文件夹。","Default Category":"默认分类","Ad Block":"广告拦截","Enable Ad Blocking":"启用广告拦截","Block requests to domains in your filter lists.":"拦截过滤列表中域名的请求。","Enable Element Hiding":"启用元素隐藏","Allow picking and hiding page elements.":"允许选取并隐藏网页元素。","Filter Lists":"过滤列表","Manage filter lists for ad blocking.":"管理用于广告拦截的过滤列表。","Independent Sessions Per Tab":"每个标签页使用独立会话","Each browser tab gets its own session with separate cookies. Requires reload.":"每个浏览器标签页使用独立的会话和 Cookie。需要重新加载。","Obsidian bookmarklets code":"Obsidian 书签小工具代码","Show last opened files":"显示最近打开的文件","Random Background":"随机背景",MCP:"MCP","Let AI agents see and control the web pages open in Obsidian.":"让 AI 智能体查看并控制 Obsidian 中打开的网页。","Enable MCP server":"启用 MCP 服务器","Lets AI agents such as Claude Code and Codex CLI read and control the web pages open in Obsidian. Only programs on this computer that have the access token can connect.":"允许 Claude Code、Codex CLI 等 AI 智能体读取并控制 Obsidian 中打开的网页。只有本机上持有访问令牌的程序才能连接。",Status:"状态",Port:"端口","The server listens on this port of 127.0.0.1 only.":"服务器只在 127.0.0.1 的此端口上监听。","Enter a port between 1024 and 65535.":"请输入 1024 到 65535 之间的端口。","Access token":"访问令牌","Generated when the server is first enabled.":"首次启用服务器时生成。","Copied.":"已复制。",Regenerate:"重新生成","New token generated. Update the clients you connected.":"已生成新令牌。请更新已连接的客户端。","Connect a client":"连接客户端","Other clients (JSON)":"其他客户端 (JSON)",Permissions:"权限","Site access":"站点访问","Ask the first time an agent uses a site, or let agents use every site that is not blocked.":"智能体首次使用某个站点时询问，或允许其使用所有未被屏蔽的站点。",Ask:"询问","Allow all sites":"允许所有站点","Allow running JavaScript in pages":"允许在页面中运行 JavaScript","Warning: lets agents run any code in the pages they control, with access to your logged-in sessions on those sites. Leave off unless you need it.":"警告：允许智能体在其控制的页面中运行任意代码，并可访问你在这些站点的登录状态。除非需要，请保持关闭。","Approved sites":"已批准的站点","No approved sites. Sites you choose to always allow appear here.":"没有已批准的站点。你选择“始终允许”的站点会显示在这里。","Blocked sites":"已屏蔽的站点","No blocked sites. Agents cannot read or act on blocked sites. Use example.com or *.example.com.":"没有已屏蔽的站点。智能体无法读取或操作被屏蔽的站点。可使用 example.com 或 *.example.com。","Block a site":"屏蔽站点","New blocked site":"新的屏蔽站点","Listening on {url}":"正在监听 {url}","Port in use":"端口已被占用","Error: {error}":"错误：{error}",Off:"已关闭","Revoked {host} for this session.":"已在本次会话中撤销对 {host} 的授权。","Surfing MCP: port {port} is already in use.":"Surfing MCP：端口 {port} 已被占用。","Surfing MCP server could not start: {error}":"Surfing MCP 服务器无法启动：{error}","An AI agent wants to use a site":"AI 智能体请求使用某个站点","{client} wants to read and control {host} in Surfing.":"{client} 想要在 Surfing 中读取并控制 {host}。","Allow this time":"本次允许","Always allow {host}":"始终允许 {host}",Deny:"拒绝","Controlled by an MCP client":"正在被 MCP 客户端控制",Agent:"智能体","Stop: revoke this site for this session":"停止：在本次会话中撤销此站点的授权"},Jr={},Yr={ar:Ir,cs:Ar,da:Lr,de:Or,en:xi,"en-gb":Mr,es:Nr,fr:Pr,hi:_r,id:Rr,it:Br,ja:Dr,ko:Ur,nl:Wr,nn:Fr,pl:$r,pt:jr,"pt-br":qr,ro:Hr,ru:Vr,tr:zr,"zh-cn":Gr,"zh-tw":Jr},ts=Yr[A.moment.locale()];function E(r){return ts&&ts[r]||xi[r]}var ge="top",ke="bottom",Ee="right",fe="left",An="auto",wt=[ge,ke,Ee,fe],Je="start",mt="end",Xr="clippingParents",Si="viewport",nt="popper",Kr="reference",ns=wt.reduce(function(r,n){return r.concat([n+"-"+Je,n+"-"+mt])},[]),Ci=[].concat(wt,[An]).reduce(function(r,n){return r.concat([n,n+"-"+Je,n+"-"+mt])},[]),Zr="beforeRead",Qr="read",eo="afterRead",to="beforeMain",no="main",so="afterMain",io="beforeWrite",ro="write",oo="afterWrite",ao=[Zr,Qr,eo,to,no,so,io,ro,oo];function Ie(r){return r?(r.nodeName||"").toLowerCase():null}function be(r){if(r==null)return window;if(r.toString()!=="[object Window]"){var n=r.ownerDocument;return n&&n.defaultView||window}return r}function Fe(r){var n=be(r).Element;return r instanceof n||r instanceof Element}function ye(r){var n=be(r).HTMLElement;return r instanceof n||r instanceof HTMLElement}function Ln(r){if(typeof ShadowRoot>"u")return!1;var n=be(r).ShadowRoot;return r instanceof n||r instanceof ShadowRoot}function co(r){var n=r.state;Object.keys(n.elements).forEach(function(e){var t=n.styles[e]||{},s=n.attributes[e]||{},i=n.elements[e];!ye(i)||!Ie(i)||(Object.assign(i.style,t),Object.keys(s).forEach(function(o){var a=s[o];a===!1?i.removeAttribute(o):i.setAttribute(o,a===!0?"":a)}))})}function lo(r){var n=r.state,e={popper:{position:n.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(n.elements.popper.style,e.popper),n.styles=e,n.elements.arrow&&Object.assign(n.elements.arrow.style,e.arrow),function(){Object.keys(n.elements).forEach(function(t){var s=n.elements[t],i=n.attributes[t]||{},o=Object.keys(n.styles.hasOwnProperty(t)?n.styles[t]:e[t]),a=o.reduce(function(c,l){return c[l]="",c},{});!ye(s)||!Ie(s)||(Object.assign(s.style,a),Object.keys(i).forEach(function(c){s.removeAttribute(c)}))})}}const uo={name:"applyStyles",enabled:!0,phase:"write",fn:co,effect:lo,requires:["computeStyles"]};function Te(r){return r.split("-")[0]}var Ue=Math.max,Rt=Math.min,Ye=Math.round;function an(){var r=navigator.userAgentData;return r!=null&&r.brands&&Array.isArray(r.brands)?r.brands.map(function(n){return n.brand+"/"+n.version}).join(" "):navigator.userAgent}function Ti(){return!/^((?!chrome|android).)*safari/i.test(an())}function Xe(r,n,e){n===void 0&&(n=!1),e===void 0&&(e=!1);var t=r.getBoundingClientRect(),s=1,i=1;n&&ye(r)&&(s=r.offsetWidth>0&&Ye(t.width)/r.offsetWidth||1,i=r.offsetHeight>0&&Ye(t.height)/r.offsetHeight||1);var o=Fe(r)?be(r):window,a=o.visualViewport,c=!Ti()&&e,l=(t.left+(c&&a?a.offsetLeft:0))/s,d=(t.top+(c&&a?a.offsetTop:0))/i,p=t.width/s,u=t.height/i;return{width:p,height:u,top:d,right:l+p,bottom:d+u,left:l,x:l,y:d}}function On(r){var n=Xe(r),e=r.offsetWidth,t=r.offsetHeight;return Math.abs(n.width-e)<=1&&(e=n.width),Math.abs(n.height-t)<=1&&(t=n.height),{x:r.offsetLeft,y:r.offsetTop,width:e,height:t}}function Ii(r,n){var e=n.getRootNode&&n.getRootNode();if(r.contains(n))return!0;if(e&&Ln(e)){var t=n;do{if(t&&r.isSameNode(t))return!0;t=t.parentNode||t.host}while(t)}return!1}function Le(r){return be(r).getComputedStyle(r)}function ho(r){return["table","td","th"].indexOf(Ie(r))>=0}function _e(r){return((Fe(r)?r.ownerDocument:r.document)||window.document).documentElement}function Wt(r){return Ie(r)==="html"?r:r.assignedSlot||r.parentNode||(Ln(r)?r.host:null)||_e(r)}function ss(r){return!ye(r)||Le(r).position==="fixed"?null:r.offsetParent}function po(r){var n=/firefox/i.test(an()),e=/Trident/i.test(an());if(e&&ye(r)){var t=Le(r);if(t.position==="fixed")return null}var s=Wt(r);for(Ln(s)&&(s=s.host);ye(s)&&["html","body"].indexOf(Ie(s))<0;){var i=Le(s);if(i.transform!=="none"||i.perspective!=="none"||i.contain==="paint"||["transform","perspective"].indexOf(i.willChange)!==-1||n&&i.willChange==="filter"||n&&i.filter&&i.filter!=="none")return s;s=s.parentNode}return null}function yt(r){for(var n=be(r),e=ss(r);e&&ho(e)&&Le(e).position==="static";)e=ss(e);return e&&(Ie(e)==="html"||Ie(e)==="body"&&Le(e).position==="static")?n:e||po(r)||n}function Mn(r){return["top","bottom"].indexOf(r)>=0?"x":"y"}function dt(r,n,e){return Ue(r,Rt(n,e))}function go(r,n,e){var t=dt(r,n,e);return t>e?e:t}function Ai(){return{top:0,right:0,bottom:0,left:0}}function Li(r){return Object.assign({},Ai(),r)}function Oi(r,n){return n.reduce(function(e,t){return e[t]=r,e},{})}var fo=function(n,e){return n=typeof n=="function"?n(Object.assign({},e.rects,{placement:e.placement})):n,Li(typeof n!="number"?n:Oi(n,wt))};function mo(r){var n,e=r.state,t=r.name,s=r.options,i=e.elements.arrow,o=e.modifiersData.popperOffsets,a=Te(e.placement),c=Mn(a),l=[fe,Ee].indexOf(a)>=0,d=l?"height":"width";if(!(!i||!o)){var p=fo(s.padding,e),u=On(i),g=c==="y"?ge:fe,m=c==="y"?ke:Ee,h=e.rects.reference[d]+e.rects.reference[c]-o[c]-e.rects.popper[d],b=o[c]-e.rects.reference[c],f=yt(i),v=f?c==="y"?f.clientHeight||0:f.clientWidth||0:0,S=h/2-b/2,k=p[g],C=v-u[d]-p[m],O=v/2-u[d]/2+S,I=dt(k,O,C),N=c;e.modifiersData[t]=(n={},n[N]=I,n.centerOffset=I-O,n)}}function bo(r){var n=r.state,e=r.options,t=e.element,s=t===void 0?"[data-popper-arrow]":t;s!=null&&(typeof s=="string"&&(s=n.elements.popper.querySelector(s),!s)||Ii(n.elements.popper,s)&&(n.elements.arrow=s))}const vo={name:"arrow",enabled:!0,phase:"main",fn:mo,effect:bo,requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function Ke(r){return r.split("-")[1]}var wo={top:"auto",right:"auto",bottom:"auto",left:"auto"};function yo(r,n){var e=r.x,t=r.y,s=n.devicePixelRatio||1;return{x:Ye(e*s)/s||0,y:Ye(t*s)/s||0}}function is(r){var n,e=r.popper,t=r.popperRect,s=r.placement,i=r.variation,o=r.offsets,a=r.position,c=r.gpuAcceleration,l=r.adaptive,d=r.roundOffsets,p=r.isFixed,u=o.x,g=u===void 0?0:u,m=o.y,h=m===void 0?0:m,b=typeof d=="function"?d({x:g,y:h}):{x:g,y:h};g=b.x,h=b.y;var f=o.hasOwnProperty("x"),v=o.hasOwnProperty("y"),S=fe,k=ge,C=window;if(l){var O=yt(e),I="clientHeight",N="clientWidth";if(O===be(e)&&(O=_e(e),Le(O).position!=="static"&&a==="absolute"&&(I="scrollHeight",N="scrollWidth")),s===ge||(s===fe||s===Ee)&&i===mt){k=ke;var M=p&&O===C&&C.visualViewport?C.visualViewport.height:O[I];h-=M-t.height,h*=c?1:-1}if(s===fe||(s===ge||s===ke)&&i===mt){S=Ee;var R=p&&O===C&&C.visualViewport?C.visualViewport.width:O[N];g-=R-t.width,g*=c?1:-1}}var B=Object.assign({position:a},l&&wo),F=d===!0?yo({x:g,y:h},be(e)):{x:g,y:h};if(g=F.x,h=F.y,c){var z;return Object.assign({},B,(z={},z[k]=v?"0":"",z[S]=f?"0":"",z.transform=(C.devicePixelRatio||1)<=1?"translate("+g+"px, "+h+"px)":"translate3d("+g+"px, "+h+"px, 0)",z))}return Object.assign({},B,(n={},n[k]=v?h+"px":"",n[S]=f?g+"px":"",n.transform="",n))}function ko(r){var n=r.state,e=r.options,t=e.gpuAcceleration,s=t===void 0?!0:t,i=e.adaptive,o=i===void 0?!0:i,a=e.roundOffsets,c=a===void 0?!0:a,l={placement:Te(n.placement),variation:Ke(n.placement),popper:n.elements.popper,popperRect:n.rects.popper,gpuAcceleration:s,isFixed:n.options.strategy==="fixed"};n.modifiersData.popperOffsets!=null&&(n.styles.popper=Object.assign({},n.styles.popper,is(Object.assign({},l,{offsets:n.modifiersData.popperOffsets,position:n.options.strategy,adaptive:o,roundOffsets:c})))),n.modifiersData.arrow!=null&&(n.styles.arrow=Object.assign({},n.styles.arrow,is(Object.assign({},l,{offsets:n.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:c})))),n.attributes.popper=Object.assign({},n.attributes.popper,{"data-popper-placement":n.placement})}const Eo={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:ko,data:{}};var xt={passive:!0};function xo(r){var n=r.state,e=r.instance,t=r.options,s=t.scroll,i=s===void 0?!0:s,o=t.resize,a=o===void 0?!0:o,c=be(n.elements.popper),l=[].concat(n.scrollParents.reference,n.scrollParents.popper);return i&&l.forEach(function(d){d.addEventListener("scroll",e.update,xt)}),a&&c.addEventListener("resize",e.update,xt),function(){i&&l.forEach(function(d){d.removeEventListener("scroll",e.update,xt)}),a&&c.removeEventListener("resize",e.update,xt)}}const So={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:xo,data:{}};var Co={left:"right",right:"left",bottom:"top",top:"bottom"};function Mt(r){return r.replace(/left|right|bottom|top/g,function(n){return Co[n]})}var To={start:"end",end:"start"};function rs(r){return r.replace(/start|end/g,function(n){return To[n]})}function Nn(r){var n=be(r),e=n.pageXOffset,t=n.pageYOffset;return{scrollLeft:e,scrollTop:t}}function Pn(r){return Xe(_e(r)).left+Nn(r).scrollLeft}function Io(r,n){var e=be(r),t=_e(r),s=e.visualViewport,i=t.clientWidth,o=t.clientHeight,a=0,c=0;if(s){i=s.width,o=s.height;var l=Ti();(l||!l&&n==="fixed")&&(a=s.offsetLeft,c=s.offsetTop)}return{width:i,height:o,x:a+Pn(r),y:c}}function Ao(r){var n,e=_e(r),t=Nn(r),s=(n=r.ownerDocument)==null?void 0:n.body,i=Ue(e.scrollWidth,e.clientWidth,s?s.scrollWidth:0,s?s.clientWidth:0),o=Ue(e.scrollHeight,e.clientHeight,s?s.scrollHeight:0,s?s.clientHeight:0),a=-t.scrollLeft+Pn(r),c=-t.scrollTop;return Le(s||e).direction==="rtl"&&(a+=Ue(e.clientWidth,s?s.clientWidth:0)-i),{width:i,height:o,x:a,y:c}}function _n(r){var n=Le(r),e=n.overflow,t=n.overflowX,s=n.overflowY;return/auto|scroll|overlay|hidden/.test(e+s+t)}function Mi(r){return["html","body","#document"].indexOf(Ie(r))>=0?r.ownerDocument.body:ye(r)&&_n(r)?r:Mi(Wt(r))}function ut(r,n){var e;n===void 0&&(n=[]);var t=Mi(r),s=t===((e=r.ownerDocument)==null?void 0:e.body),i=be(t),o=s?[i].concat(i.visualViewport||[],_n(t)?t:[]):t,a=n.concat(o);return s?a:a.concat(ut(Wt(o)))}function cn(r){return Object.assign({},r,{left:r.x,top:r.y,right:r.x+r.width,bottom:r.y+r.height})}function Lo(r,n){var e=Xe(r,!1,n==="fixed");return e.top=e.top+r.clientTop,e.left=e.left+r.clientLeft,e.bottom=e.top+r.clientHeight,e.right=e.left+r.clientWidth,e.width=r.clientWidth,e.height=r.clientHeight,e.x=e.left,e.y=e.top,e}function os(r,n,e){return n===Si?cn(Io(r,e)):Fe(n)?Lo(n,e):cn(Ao(_e(r)))}function Oo(r){var n=ut(Wt(r)),e=["absolute","fixed"].indexOf(Le(r).position)>=0,t=e&&ye(r)?yt(r):r;return Fe(t)?n.filter(function(s){return Fe(s)&&Ii(s,t)&&Ie(s)!=="body"}):[]}function Mo(r,n,e,t){var s=n==="clippingParents"?Oo(r):[].concat(n),i=[].concat(s,[e]),o=i[0],a=i.reduce(function(c,l){var d=os(r,l,t);return c.top=Ue(d.top,c.top),c.right=Rt(d.right,c.right),c.bottom=Rt(d.bottom,c.bottom),c.left=Ue(d.left,c.left),c},os(r,o,t));return a.width=a.right-a.left,a.height=a.bottom-a.top,a.x=a.left,a.y=a.top,a}function Ni(r){var n=r.reference,e=r.element,t=r.placement,s=t?Te(t):null,i=t?Ke(t):null,o=n.x+n.width/2-e.width/2,a=n.y+n.height/2-e.height/2,c;switch(s){case ge:c={x:o,y:n.y-e.height};break;case ke:c={x:o,y:n.y+n.height};break;case Ee:c={x:n.x+n.width,y:a};break;case fe:c={x:n.x-e.width,y:a};break;default:c={x:n.x,y:n.y}}var l=s?Mn(s):null;if(l!=null){var d=l==="y"?"height":"width";switch(i){case Je:c[l]=c[l]-(n[d]/2-e[d]/2);break;case mt:c[l]=c[l]+(n[d]/2-e[d]/2);break}}return c}function bt(r,n){n===void 0&&(n={});var e=n,t=e.placement,s=t===void 0?r.placement:t,i=e.strategy,o=i===void 0?r.strategy:i,a=e.boundary,c=a===void 0?Xr:a,l=e.rootBoundary,d=l===void 0?Si:l,p=e.elementContext,u=p===void 0?nt:p,g=e.altBoundary,m=g===void 0?!1:g,h=e.padding,b=h===void 0?0:h,f=Li(typeof b!="number"?b:Oi(b,wt)),v=u===nt?Kr:nt,S=r.rects.popper,k=r.elements[m?v:u],C=Mo(Fe(k)?k:k.contextElement||_e(r.elements.popper),c,d,o),O=Xe(r.elements.reference),I=Ni({reference:O,element:S,placement:s}),N=cn(Object.assign({},S,I)),M=u===nt?N:O,R={top:C.top-M.top+f.top,bottom:M.bottom-C.bottom+f.bottom,left:C.left-M.left+f.left,right:M.right-C.right+f.right},B=r.modifiersData.offset;if(u===nt&&B){var F=B[s];Object.keys(R).forEach(function(z){var V=[Ee,ke].indexOf(z)>=0?1:-1,J=[ge,ke].indexOf(z)>=0?"y":"x";R[z]+=F[J]*V})}return R}function No(r,n){n===void 0&&(n={});var e=n,t=e.placement,s=e.boundary,i=e.rootBoundary,o=e.padding,a=e.flipVariations,c=e.allowedAutoPlacements,l=c===void 0?Ci:c,d=Ke(t),p=d?a?ns:ns.filter(function(m){return Ke(m)===d}):wt,u=p.filter(function(m){return l.indexOf(m)>=0});u.length===0&&(u=p);var g=u.reduce(function(m,h){return m[h]=bt(r,{placement:h,boundary:s,rootBoundary:i,padding:o})[Te(h)],m},{});return Object.keys(g).sort(function(m,h){return g[m]-g[h]})}function Po(r){if(Te(r)===An)return[];var n=Mt(r);return[rs(r),n,rs(n)]}function _o(r){var n=r.state,e=r.options,t=r.name;if(!n.modifiersData[t]._skip){for(var s=e.mainAxis,i=s===void 0?!0:s,o=e.altAxis,a=o===void 0?!0:o,c=e.fallbackPlacements,l=e.padding,d=e.boundary,p=e.rootBoundary,u=e.altBoundary,g=e.flipVariations,m=g===void 0?!0:g,h=e.allowedAutoPlacements,b=n.options.placement,f=Te(b),v=f===b,S=c||(v||!m?[Mt(b)]:Po(b)),k=[b].concat(S).reduce(function(D,U){return D.concat(Te(U)===An?No(n,{placement:U,boundary:d,rootBoundary:p,padding:l,flipVariations:m,allowedAutoPlacements:h}):U)},[]),C=n.rects.reference,O=n.rects.popper,I=new Map,N=!0,M=k[0],R=0;R<k.length;R++){var B=k[R],F=Te(B),z=Ke(B)===Je,V=[ge,ke].indexOf(F)>=0,J=V?"width":"height",q=bt(n,{placement:B,boundary:d,rootBoundary:p,altBoundary:u,padding:l}),P=V?z?Ee:fe:z?ke:ge;C[J]>O[J]&&(P=Mt(P));var w=Mt(P),T=[];if(i&&T.push(q[F]<=0),a&&T.push(q[P]<=0,q[w]<=0),T.every(function(D){return D})){M=B,N=!1;break}I.set(B,T)}if(N)for(var L=m?3:1,_=function(U){var G=k.find(function(Q){var Y=I.get(Q);if(Y)return Y.slice(0,U).every(function(X){return X})});if(G)return M=G,"break"},W=L;W>0;W--){var $=_(W);if($==="break")break}n.placement!==M&&(n.modifiersData[t]._skip=!0,n.placement=M,n.reset=!0)}}const Ro={name:"flip",enabled:!0,phase:"main",fn:_o,requiresIfExists:["offset"],data:{_skip:!1}};function as(r,n,e){return e===void 0&&(e={x:0,y:0}),{top:r.top-n.height-e.y,right:r.right-n.width+e.x,bottom:r.bottom-n.height+e.y,left:r.left-n.width-e.x}}function cs(r){return[ge,Ee,ke,fe].some(function(n){return r[n]>=0})}function Bo(r){var n=r.state,e=r.name,t=n.rects.reference,s=n.rects.popper,i=n.modifiersData.preventOverflow,o=bt(n,{elementContext:"reference"}),a=bt(n,{altBoundary:!0}),c=as(o,t),l=as(a,s,i),d=cs(c),p=cs(l);n.modifiersData[e]={referenceClippingOffsets:c,popperEscapeOffsets:l,isReferenceHidden:d,hasPopperEscaped:p},n.attributes.popper=Object.assign({},n.attributes.popper,{"data-popper-reference-hidden":d,"data-popper-escaped":p})}const Do={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:Bo};function Uo(r,n,e){var t=Te(r),s=[fe,ge].indexOf(t)>=0?-1:1,i=typeof e=="function"?e(Object.assign({},n,{placement:r})):e,o=i[0],a=i[1];return o=o||0,a=(a||0)*s,[fe,Ee].indexOf(t)>=0?{x:a,y:o}:{x:o,y:a}}function Wo(r){var n=r.state,e=r.options,t=r.name,s=e.offset,i=s===void 0?[0,0]:s,o=Ci.reduce(function(d,p){return d[p]=Uo(p,n.rects,i),d},{}),a=o[n.placement],c=a.x,l=a.y;n.modifiersData.popperOffsets!=null&&(n.modifiersData.popperOffsets.x+=c,n.modifiersData.popperOffsets.y+=l),n.modifiersData[t]=o}const Fo={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:Wo};function $o(r){var n=r.state,e=r.name;n.modifiersData[e]=Ni({reference:n.rects.reference,element:n.rects.popper,placement:n.placement})}const jo={name:"popperOffsets",enabled:!0,phase:"read",fn:$o,data:{}};function qo(r){return r==="x"?"y":"x"}function Ho(r){var n=r.state,e=r.options,t=r.name,s=e.mainAxis,i=s===void 0?!0:s,o=e.altAxis,a=o===void 0?!1:o,c=e.boundary,l=e.rootBoundary,d=e.altBoundary,p=e.padding,u=e.tether,g=u===void 0?!0:u,m=e.tetherOffset,h=m===void 0?0:m,b=bt(n,{boundary:c,rootBoundary:l,padding:p,altBoundary:d}),f=Te(n.placement),v=Ke(n.placement),S=!v,k=Mn(f),C=qo(k),O=n.modifiersData.popperOffsets,I=n.rects.reference,N=n.rects.popper,M=typeof h=="function"?h(Object.assign({},n.rects,{placement:n.placement})):h,R=typeof M=="number"?{mainAxis:M,altAxis:M}:Object.assign({mainAxis:0,altAxis:0},M),B=n.modifiersData.offset?n.modifiersData.offset[n.placement]:null,F={x:0,y:0};if(O){if(i){var z,V=k==="y"?ge:fe,J=k==="y"?ke:Ee,q=k==="y"?"height":"width",P=O[k],w=P+b[V],T=P-b[J],L=g?-N[q]/2:0,_=v===Je?I[q]:N[q],W=v===Je?-N[q]:-I[q],$=n.elements.arrow,D=g&&$?On($):{width:0,height:0},U=n.modifiersData["arrow#persistent"]?n.modifiersData["arrow#persistent"].padding:Ai(),G=U[V],Q=U[J],Y=dt(0,I[q],D[q]),X=S?I[q]/2-L-Y-G-R.mainAxis:_-Y-G-R.mainAxis,te=S?-I[q]/2+L+Y+Q+R.mainAxis:W+Y+Q+R.mainAxis,ee=n.elements.arrow&&yt(n.elements.arrow),re=ee?k==="y"?ee.clientTop||0:ee.clientLeft||0:0,$e=(z=B==null?void 0:B[k])!=null?z:0,tt=P+X-$e-re,kt=P+te-$e,zn=dt(g?Rt(w,tt):w,P,g?Ue(T,kt):T);O[k]=zn,F[k]=zn-P}if(a){var Gn,pr=k==="x"?ge:fe,gr=k==="x"?ke:Ee,Re=O[C],Et=C==="y"?"height":"width",Jn=Re+b[pr],Yn=Re-b[gr],zt=[ge,fe].indexOf(f)!==-1,Xn=(Gn=B==null?void 0:B[C])!=null?Gn:0,Kn=zt?Jn:Re-I[Et]-N[Et]-Xn+R.altAxis,Zn=zt?Re+I[Et]+N[Et]-Xn-R.altAxis:Yn,Qn=g&&zt?go(Kn,Re,Zn):dt(g?Kn:Jn,Re,g?Zn:Yn);O[C]=Qn,F[C]=Qn-Re}n.modifiersData[t]=F}}const Vo={name:"preventOverflow",enabled:!0,phase:"main",fn:Ho,requiresIfExists:["offset"]};function zo(r){return{scrollLeft:r.scrollLeft,scrollTop:r.scrollTop}}function Go(r){return r===be(r)||!ye(r)?Nn(r):zo(r)}function Jo(r){var n=r.getBoundingClientRect(),e=Ye(n.width)/r.offsetWidth||1,t=Ye(n.height)/r.offsetHeight||1;return e!==1||t!==1}function Yo(r,n,e){e===void 0&&(e=!1);var t=ye(n),s=ye(n)&&Jo(n),i=_e(n),o=Xe(r,s,e),a={scrollLeft:0,scrollTop:0},c={x:0,y:0};return(t||!t&&!e)&&((Ie(n)!=="body"||_n(i))&&(a=Go(n)),ye(n)?(c=Xe(n,!0),c.x+=n.clientLeft,c.y+=n.clientTop):i&&(c.x=Pn(i))),{x:o.left+a.scrollLeft-c.x,y:o.top+a.scrollTop-c.y,width:o.width,height:o.height}}function Xo(r){var n=new Map,e=new Set,t=[];r.forEach(function(i){n.set(i.name,i)});function s(i){e.add(i.name);var o=[].concat(i.requires||[],i.requiresIfExists||[]);o.forEach(function(a){if(!e.has(a)){var c=n.get(a);c&&s(c)}}),t.push(i)}return r.forEach(function(i){e.has(i.name)||s(i)}),t}function Ko(r){var n=Xo(r);return ao.reduce(function(e,t){return e.concat(n.filter(function(s){return s.phase===t}))},[])}function Zo(r){var n;return function(){return n||(n=new Promise(function(e){Promise.resolve().then(function(){n=void 0,e(r())})})),n}}function Qo(r){var n=r.reduce(function(e,t){var s=e[t.name];return e[t.name]=s?Object.assign({},s,t,{options:Object.assign({},s.options,t.options),data:Object.assign({},s.data,t.data)}):t,e},{});return Object.keys(n).map(function(e){return n[e]})}var ls={placement:"bottom",modifiers:[],strategy:"absolute"};function ds(){for(var r=arguments.length,n=new Array(r),e=0;e<r;e++)n[e]=arguments[e];return!n.some(function(t){return!(t&&typeof t.getBoundingClientRect=="function")})}function ea(r){r===void 0&&(r={});var n=r,e=n.defaultModifiers,t=e===void 0?[]:e,s=n.defaultOptions,i=s===void 0?ls:s;return function(a,c,l){l===void 0&&(l=i);var d={placement:"bottom",orderedModifiers:[],options:Object.assign({},ls,i),modifiersData:{},elements:{reference:a,popper:c},attributes:{},styles:{}},p=[],u=!1,g={state:d,setOptions:function(f){var v=typeof f=="function"?f(d.options):f;h(),d.options=Object.assign({},i,d.options,v),d.scrollParents={reference:Fe(a)?ut(a):a.contextElement?ut(a.contextElement):[],popper:ut(c)};var S=Ko(Qo([].concat(t,d.options.modifiers)));return d.orderedModifiers=S.filter(function(k){return k.enabled}),m(),g.update()},forceUpdate:function(){if(!u){var f=d.elements,v=f.reference,S=f.popper;if(ds(v,S)){d.rects={reference:Yo(v,yt(S),d.options.strategy==="fixed"),popper:On(S)},d.reset=!1,d.placement=d.options.placement,d.orderedModifiers.forEach(function(R){return d.modifiersData[R.name]=Object.assign({},R.data)});for(var k=0;k<d.orderedModifiers.length;k++){if(d.reset===!0){d.reset=!1,k=-1;continue}var C=d.orderedModifiers[k],O=C.fn,I=C.options,N=I===void 0?{}:I,M=C.name;typeof O=="function"&&(d=O({state:d,options:N,name:M,instance:g})||d)}}}},update:Zo(function(){return new Promise(function(b){g.forceUpdate(),b(d)})}),destroy:function(){h(),u=!0}};if(!ds(a,c))return g;g.setOptions(l).then(function(b){!u&&l.onFirstUpdate&&l.onFirstUpdate(b)});function m(){d.orderedModifiers.forEach(function(b){var f=b.name,v=b.options,S=v===void 0?{}:v,k=b.effect;if(typeof k=="function"){var C=k({state:d,name:f,instance:g,options:S}),O=function(){};p.push(C||O)}})}function h(){p.forEach(function(b){return b()}),p=[]}return g}}var ta=[So,jo,Eo,uo,Fo,Ro,Vo,vo,Do],na=ea({defaultModifiers:ta});const Pe=[{name:"Google",url:"https://www.google.com/search?q="},{name:"Bing",url:"https://www.bing.com/search?q="},{name:"Duckduckgo",url:"https://duckduckgo.com/?q="},{name:"Yahoo",url:"https://search.yahoo.com/search?p="},{name:"Baidu",url:"https://www.baidu.com/s?wd="},{name:"Yandex",url:"https://yandex.com/search/?text="},{name:"Wikipedia",url:"https://en.wikipedia.org/w/index.php?search="}],sa=(r,n)=>(r%n+n)%n;class ia{constructor(n,e,t,s,i=!0){y(this,"owner");y(this,"values",[]);y(this,"suggestions",[]);y(this,"selectedItem",0);y(this,"containerEl");y(this,"app");y(this,"showShortcuts");if(this.owner=n,this.containerEl=e,this.app=s,this.showShortcuts=i,e.on("click",".suggestion-item",(o,a)=>this.onSuggestionClick(o,a)),e.on("mousemove",".suggestion-item",(o,a)=>this.onSuggestionMouseover(o,a)),t.register([],"ArrowUp",o=>{if(!o.isComposing)return this.setSelectedItem(this.selectedItem-1,!0),!1}),t.register([],"ArrowDown",o=>{if(!o.isComposing)return this.setSelectedItem(this.selectedItem+1,!0),!1}),t.register([],"Enter",o=>{if(!o.isComposing)return this.useSelectedItem(o),!1}),i){const o=this.app.plugins.getPlugin("surfing"),a=[...Pe,...(o==null?void 0:o.settings.customSearchEngine)??[]];for(let c=0;c<a.length;c++){if(c===9){t.register(["Mod"],"0",l=>{if(!l.isComposing)return this.setSelectedItem(c,!1),this.useSelectedItem(l),!1});break}t.register(["Mod"],`${c+1}`,l=>{if(!l.isComposing)return this.setSelectedItem(c,!1),this.useSelectedItem(l),!1})}}}onSuggestionClick(n,e){n.preventDefault();const t=this.suggestions.findIndex(s=>s===e);this.setSelectedItem(t,!1),this.useSelectedItem(n)}onSuggestionMouseover(n,e){const t=this.suggestions.findIndex(s=>s===e);this.setSelectedItem(t,!1)}setSuggestions(n){this.containerEl.empty();const e=[];n.forEach((t,s)=>{const i=this.containerEl.createDiv("suggestion-item");this.owner.renderSuggestion(t,i),this.showShortcuts&&s<10&&i.createDiv({text:`${A.Platform.isMacOS?"CMD + ":"Ctrl + "}${s!=9?s+1:0}`,cls:"wb-search-suggestion-index"}),e.push(i)}),this.values=n,this.suggestions=e,this.setSelectedItem(0,!1)}useSelectedItem(n){const e=this.values[this.selectedItem];e&&this.owner.selectSuggestion(e,n)}setSelectedItem(n,e){const t=sa(n,this.suggestions.length),s=this.suggestions[this.selectedItem],i=this.suggestions[t];s==null||s.removeClass("is-selected"),i==null||i.addClass("is-selected"),this.selectedItem=t,e&&i.scrollIntoView(!1)}}class Ft{constructor(n,e,t=!0){y(this,"app");y(this,"inputEl");y(this,"popper");y(this,"scope");y(this,"suggestEl");y(this,"suggest");this.app=n,this.inputEl=e,this.scope=new A.Scope,this.suggestEl=createDiv("wb-search-suggestion-container");const s=this.suggestEl.createDiv("wb-search-suggestion");this.suggest=new ia(this,s,this.scope,this.app,t),this.scope.register([],"Escape",()=>this.close()),this.inputEl.addEventListener("input",()=>this.onInputChanged()),this.inputEl.addEventListener("focus",()=>this.onInputChanged()),this.inputEl.addEventListener("blur",()=>this.close()),this.suggestEl.on("mousedown",".wb-search-suggestion-container",i=>{i.preventDefault()})}onInputChanged(){const n=this.inputEl.value,e=this.getSuggestions(n);if(!e||/^\s{0,}$/.test(n)){this.close();return}if(e.length>0){this.suggest.setSuggestions(e);const t=this.inputEl.ownerDocument,s=t===document?this.app.dom.appContainerEl:t.body;this.open(s,this.inputEl)}else this.close()}open(n,e){this.app.keymap.pushScope(this.scope),n.appendChild(this.suggestEl),this.popper=na(e,this.suggestEl,{placement:"bottom-start",modifiers:[{name:"sameWidth",enabled:!0,fn:({state:t,instance:s})=>{const i=`${t.rects.reference.width}px`;t.styles.popper.width!==i&&(t.styles.popper.width=i,s.update())},phase:"beforeWrite",requires:["computeStyles"]},{name:"offset",options:{offset:[0,5]}}]})}close(){this.app.keymap.popScope(this.scope),this.suggest.setSuggestions([]),this.popper&&this.popper.destroy(),this.suggestEl.detach()}}var ra=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function oa(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var Pi={exports:{}};(function(r,n){(function(e,t){r.exports=t()})(typeof self<"u"?self:ra,()=>(()=>{var e={0:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.mathRules=a.createCleanMathEl=void 0;const l=c(282);a.createCleanMathEl=(d,p,u,g)=>{const m=d.createElement("math");if(m.setAttribute("xmlns","http://www.w3.org/1998/Math/MathML"),m.setAttribute("display",g?"block":"inline"),m.setAttribute("data-latex",u||""),p==null?void 0:p.mathml){const h=d.createElement("div");h.innerHTML=p.mathml;const b=h.querySelector("math");b&&(m.innerHTML=b.innerHTML)}else u&&(m.textContent=u);return m},a.mathRules=[{selector:l.mathSelectors,element:"math",transform:(d,p)=>{if(!function(b){return"classList"in b&&"getAttribute"in b&&"querySelector"in b}(d))return d;const u=(0,l.getMathMLFromElement)(d),g=(0,l.getBasicLatexFromElement)(d),m=(0,l.isBlockDisplay)(d),h=(0,a.createCleanMathEl)(p,u,g,m);return d.parentElement&&d.parentElement.querySelectorAll(`
					/* MathJax scripts and previews */
					script[type^="math/"],
					.MathJax_Preview,

					/* External math library scripts */
					script[type="text/javascript"][src*="mathjax"],
					script[type="text/javascript"][src*="katex"]
				`).forEach(b=>b.remove()),h}}]},20:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.GrokExtractor=void 0;const l=c(181);class d extends l.ConversationExtractor{constructor(u,g){super(u,g),this.messageContainerSelector=".relative.group.flex.flex-col.justify-center.w-full",this.messageBubbles=u.querySelectorAll(this.messageContainerSelector),this.footnotes=[],this.footnoteCounter=0}canExtract(){return!!this.messageBubbles&&this.messageBubbles.length>0}extractMessages(){const u=[];return this.footnotes=[],this.footnoteCounter=0,this.messageBubbles&&this.messageBubbles.length!==0&&this.messageBubbles.forEach(g=>{var m;const h=g.classList.contains("items-end"),b=g.classList.contains("items-start");if(!h&&!b)return;const f=g.querySelector(".message-bubble");if(!f)return;let v="",S="",k="";if(h)v=f.textContent||"",S="user",k="You";else if(b){S="assistant",k="Grok";const C=f.cloneNode(!0);(m=C.querySelector(".relative.border.border-border-l1.bg-surface-base"))===null||m===void 0||m.remove(),v=C.innerHTML,v=this.processFootnotes(v)}v.trim()&&u.push({author:k,content:v.trim(),metadata:{role:S}})}),u}getFootnotes(){return this.footnotes}getMetadata(){var u;const g=this.getTitle(),m=((u=this.messageBubbles)===null||u===void 0?void 0:u.length)||0;return{title:g,site:"Grok",url:this.url,messageCount:m,description:`Grok conversation with ${m} messages`}}getTitle(){var u,g;const m=(u=this.document.title)===null||u===void 0?void 0:u.trim();if(m&&m!=="Grok"&&!m.startsWith("Grok by "))return m.replace(/\s-\s*Grok$/,"").trim();const h=this.document.querySelector(`${this.messageContainerSelector}.items-end`);if(h){const b=h.querySelector(".message-bubble");if(b){const f=((g=b.textContent)===null||g===void 0?void 0:g.trim())||"";return f.length>50?f.slice(0,50)+"...":f}}return"Grok Conversation"}processFootnotes(u){return u.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi,(g,m,h)=>{if(!m||m.startsWith("#")||!m.match(/^https?:\/\//i))return g;let b;if(this.footnotes.find(f=>f.url===m))b=this.footnotes.findIndex(f=>f.url===m)+1;else{this.footnoteCounter++,b=this.footnoteCounter;let f=m;try{const v=new URL(m).hostname.replace(/^www\./,"");f=`<a href="${m}" target="_blank" rel="noopener noreferrer">${v}</a>`}catch{f=`<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`}this.footnotes.push({url:m,text:f})}return`${h}<sup id="fnref:${b}" class="footnote-ref"><a href="#fn:${b}" class="footnote-link">${b}</a></sup>`})}}a.GrokExtractor=d},181:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ConversationExtractor=void 0;const l=c(279),d=c(628);class p extends l.BaseExtractor{getFootnotes(){return[]}extract(){var g;const m=this.extractMessages(),h=this.getMetadata(),b=this.getFootnotes(),f=this.createContentHtml(m,b),v=document.implementation.createHTMLDocument(),S=v.createElement("article");S.innerHTML=f,v.body.appendChild(S);const k=new d.Defuddle(v).parse(),C=k.content;return{content:C,contentHtml:C,extractedContent:{messageCount:m.length.toString()},variables:{title:h.title||"Conversation",site:h.site,description:h.description||`${h.site} conversation with ${m.length} messages`,wordCount:((g=k.wordCount)===null||g===void 0?void 0:g.toString())||""}}}createContentHtml(g,m){return`${g.map((h,b)=>{const f=h.timestamp?`<div class="message-timestamp">${h.timestamp}</div>`:"",v=/<p[^>]*>[\s\S]*?<\/p>/i.test(h.content)?h.content:`<p>${h.content}</p>`,S=h.metadata?Object.entries(h.metadata).map(([k,C])=>`data-${k}="${C}"`).join(" "):"";return`
			<div class="message message-${h.author.toLowerCase()}" ${S}>
				<div class="message-header">
					<p class="message-author"><strong>${h.author}</strong></p>
					${f}
				</div>
				<div class="message-content">
					${v}
				</div>
			</div>${b<g.length-1?`
<hr>`:""}`}).join(`
`).trim()}
${m.length>0?`
			<div id="footnotes">
				<ol>
					${m.map((h,b)=>`
						<li class="footnote" id="fn:${b+1}">
							<p>
								<a href="${h.url}" target="_blank">${h.text}</a>&nbsp;<a href="#fnref:${b+1}" class="footnote-backref">↩</a>
							</p>
						</li>
					`).join("")}
				</ol>
			</div>`:""}`.trim()}}a.ConversationExtractor=p},248:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.TwitterExtractor=void 0;const l=c(279);class d extends l.BaseExtractor{constructor(u,g){var m;super(u,g),this.mainTweet=null,this.threadTweets=[];const h=u.querySelector('[aria-label="Timeline: Conversation"]');if(!h){const v=u.querySelector('article[data-testid="tweet"]');return void(v&&(this.mainTweet=v))}const b=Array.from(h.querySelectorAll('article[data-testid="tweet"]')),f=(m=h.querySelector("section, h2"))===null||m===void 0?void 0:m.parentElement;f&&b.forEach((v,S)=>{if(f.compareDocumentPosition(v)&Node.DOCUMENT_POSITION_FOLLOWING)return b.splice(S),!1}),this.mainTweet=b[0]||null,this.threadTweets=b.slice(1)}canExtract(){return!!this.mainTweet}extract(){const u=this.extractTweet(this.mainTweet),g=this.threadTweets.map(f=>this.extractTweet(f)).join(`
<hr>
`),m=`
			<div class="tweet-thread">
				<div class="main-tweet">
					${u}
				</div>
				${g?`
					<hr>
					<div class="thread-tweets">
						${g}
					</div>
				`:""}
			</div>
		`.trim(),h=this.getTweetId(),b=this.getTweetAuthor();return{content:m,contentHtml:m,extractedContent:{tweetId:h,tweetAuthor:b},variables:{title:`Thread by ${b}`,author:b,site:"X (Twitter)",description:this.createDescription(this.mainTweet)}}}formatTweetText(u){if(!u)return"";const g=this.document.createElement("div");return g.innerHTML=u,g.querySelectorAll("a").forEach(m=>{var h;const b=((h=m.textContent)===null||h===void 0?void 0:h.trim())||"";m.replaceWith(b)}),g.querySelectorAll("span, div").forEach(m=>{m.replaceWith(...Array.from(m.childNodes))}),g.innerHTML.split(`
`).map(m=>m.trim()).filter(m=>m).map(m=>`<p>${m}</p>`).join(`
`)}extractTweet(u){var g,m,h;if(!u)return"";const b=u.cloneNode(!0);b.querySelectorAll('img[src*="/emoji/"]').forEach(I=>{if(I.tagName.toLowerCase()==="img"&&I.getAttribute("alt")){const N=I.getAttribute("alt");N&&I.replaceWith(N)}});const f=((g=b.querySelector('[data-testid="tweetText"]'))===null||g===void 0?void 0:g.innerHTML)||"",v=this.formatTweetText(f),S=this.extractImages(u),k=this.extractUserInfo(u),C=(h=(m=u.querySelector('[aria-labelledby*="id__"]'))===null||m===void 0?void 0:m.querySelector('[data-testid="User-Name"]'))===null||h===void 0?void 0:h.closest('[aria-labelledby*="id__"]'),O=C?this.extractTweet(C):"";return`
			<div class="tweet">
				<div class="tweet-header">
					<span class="tweet-author"><strong>${k.fullName}</strong> <span class="tweet-handle">${k.handle}</span></span>
					${k.date?`<a href="${k.permalink}" class="tweet-date">${k.date}</a>`:""}
				</div>
				${v?`<div class="tweet-text">${v}</div>`:""}
				${S.length?`
					<div class="tweet-media">
						${S.join(`
`)}
					</div>
				`:""}
				${O?`
					<blockquote class="quoted-tweet">
						${O}
					</blockquote>
				`:""}
			</div>
		`.trim()}extractUserInfo(u){var g,m,h,b,f,v,S,k,C;const O=u.querySelector('[data-testid="User-Name"]');if(!O)return{fullName:"",handle:"",date:"",permalink:""};const I=O.querySelectorAll("a");let N=((m=(g=I==null?void 0:I[0])===null||g===void 0?void 0:g.textContent)===null||m===void 0?void 0:m.trim())||"",M=((b=(h=I==null?void 0:I[1])===null||h===void 0?void 0:h.textContent)===null||b===void 0?void 0:b.trim())||"";N&&M||(N=((v=(f=O.querySelector('span[style*="color: rgb(15, 20, 25)"] span'))===null||f===void 0?void 0:f.textContent)===null||v===void 0?void 0:v.trim())||"",M=((k=(S=O.querySelector('span[style*="color: rgb(83, 100, 113)"]'))===null||S===void 0?void 0:S.textContent)===null||k===void 0?void 0:k.trim())||"");const R=u.querySelector("time"),B=(R==null?void 0:R.getAttribute("datetime"))||"";return{fullName:N,handle:M,date:B?new Date(B).toISOString().split("T")[0]:"",permalink:((C=R==null?void 0:R.closest("a"))===null||C===void 0?void 0:C.href)||""}}extractImages(u){var g,m;const h=['[data-testid="tweetPhoto"]','[data-testid="tweet-image"]','img[src*="media"]'],b=[],f=(m=(g=u.querySelector('[aria-labelledby*="id__"]'))===null||g===void 0?void 0:g.querySelector('[data-testid="User-Name"]'))===null||m===void 0?void 0:m.closest('[aria-labelledby*="id__"]');for(const v of h)u.querySelectorAll(v).forEach(S=>{var k,C;if(!(f!=null&&f.contains(S))&&S.tagName.toLowerCase()==="img"&&S.getAttribute("alt")){const O=((k=S.getAttribute("src"))===null||k===void 0?void 0:k.replace(/&name=\w+$/,"&name=large"))||"",I=((C=S.getAttribute("alt"))===null||C===void 0?void 0:C.replace(/\s+/g," ").trim())||"";b.push(`<img src="${O}" alt="${I}" />`)}});return b}getTweetId(){const u=this.url.match(/status\/(\d+)/);return(u==null?void 0:u[1])||""}getTweetAuthor(){var u,g,m;const h=(u=this.mainTweet)===null||u===void 0?void 0:u.querySelector('[data-testid="User-Name"]'),b=h==null?void 0:h.querySelectorAll("a"),f=((m=(g=b==null?void 0:b[1])===null||g===void 0?void 0:g.textContent)===null||m===void 0?void 0:m.trim())||"";return f.startsWith("@")?f:`@${f}`}createDescription(u){var g;return u?(((g=u.querySelector('[data-testid="tweetText"]'))===null||g===void 0?void 0:g.textContent)||"").trim().slice(0,140).replace(/\s+/g," "):""}}a.TwitterExtractor=d},258:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.YoutubeExtractor=void 0;const l=c(279);class d extends l.BaseExtractor{constructor(u,g,m){super(u,g,m),this.videoElement=u.querySelector("video"),this.schemaOrgData=m}canExtract(){return!0}extract(){const u=this.getVideoData(),g=u.description||"",m=this.formatDescription(g),h=`<iframe width="560" height="315" src="https://www.youtube.com/embed/${this.getVideoId()}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><br>${m}`;return{content:h,contentHtml:h,extractedContent:{videoId:this.getVideoId(),author:u.author||""},variables:{title:u.name||"",author:u.author||"",site:"YouTube",image:Array.isArray(u.thumbnailUrl)&&u.thumbnailUrl[0]||"",published:u.uploadDate,description:g.slice(0,200).trim()}}}formatDescription(u){return`<p>${u.replace(/\n/g,"<br>")}</p>`}getVideoData(){return this.schemaOrgData?(Array.isArray(this.schemaOrgData)?this.schemaOrgData.find(u=>u["@type"]==="VideoObject"):this.schemaOrgData["@type"]==="VideoObject"?this.schemaOrgData:null)||{}:{}}getVideoId(){const u=new URL(this.url);return u.hostname==="youtu.be"?u.pathname.slice(1):new URLSearchParams(u.search).get("v")||""}}a.YoutubeExtractor=d},279:(o,a)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.BaseExtractor=void 0,a.BaseExtractor=class{constructor(c,l,d){this.document=c,this.url=l,this.schemaOrgData=d}}},282:(o,a)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.mathSelectors=a.isBlockDisplay=a.getBasicLatexFromElement=a.getMathMLFromElement=void 0,a.getMathMLFromElement=c=>{if(c.tagName.toLowerCase()==="math"){const u=c.getAttribute("display")==="block";return{mathml:c.outerHTML,latex:c.getAttribute("alttext")||null,isBlock:u}}const l=c.getAttribute("data-mathml");if(l){const u=document.createElement("div");u.innerHTML=l;const g=u.querySelector("math");if(g){const m=g.getAttribute("display")==="block";return{mathml:g.outerHTML,latex:g.getAttribute("alttext")||null,isBlock:m}}}const d=c.querySelector(".MJX_Assistive_MathML, mjx-assistive-mml");if(d){const u=d.querySelector("math");if(u){const g=u.getAttribute("display"),m=d.getAttribute("display"),h=g==="block"||m==="block";return{mathml:u.outerHTML,latex:u.getAttribute("alttext")||null,isBlock:h}}}const p=c.querySelector(".katex-mathml math");return p?{mathml:p.outerHTML,latex:null,isBlock:!1}:null},a.getBasicLatexFromElement=c=>{var l,d,p;const u=c.getAttribute("data-latex");if(u)return u;if(c.tagName.toLowerCase()==="img"&&c.classList.contains("latex")){const m=c.getAttribute("alt");if(m)return m;const h=c.getAttribute("src");if(h){const b=h.match(/latex\.php\?latex=([^&]+)/);if(b)return decodeURIComponent(b[1]).replace(/\+/g," ").replace(/%5C/g,"\\")}}const g=c.querySelector('annotation[encoding="application/x-tex"]');if(g!=null&&g.textContent)return g.textContent.trim();if(c.matches(".katex")){const m=c.querySelector('.katex-mathml annotation[encoding="application/x-tex"]');if(m!=null&&m.textContent)return m.textContent.trim()}if(c.matches('script[type="math/tex"]')||c.matches('script[type="math/tex; mode=display"]'))return((l=c.textContent)===null||l===void 0?void 0:l.trim())||null;if(c.parentElement){const m=c.parentElement.querySelector('script[type="math/tex"], script[type="math/tex; mode=display"]');if(m)return((d=m.textContent)===null||d===void 0?void 0:d.trim())||null}return c.getAttribute("alt")||((p=c.textContent)===null||p===void 0?void 0:p.trim())||null},a.isBlockDisplay=c=>{if(c.getAttribute("display")==="block")return!0;const l=c.className.toLowerCase();if(l.includes("display")||l.includes("block")||c.closest('.katex-display, .MathJax_Display, [data-display="block"]'))return!0;const d=c.previousElementSibling;if((d==null?void 0:d.tagName.toLowerCase())==="p"||c.matches(".mwe-math-fallback-image-display"))return!0;if(c.matches(".katex"))return c.closest(".katex-display")!==null;if(c.hasAttribute("display"))return c.getAttribute("display")==="true";if(c.matches('script[type="math/tex; mode=display"]'))return!0;if(c.hasAttribute("display"))return c.getAttribute("display")==="true";const p=c.closest("[display]");return!!p&&p.getAttribute("display")==="true"},a.mathSelectors=['img.latex[src*="latex.php"]',"span.MathJax","mjx-container",'script[type="math/tex"]','script[type="math/tex; mode=display"]','.MathJax_Preview + script[type="math/tex"]',".MathJax_Display",".MathJax_SVG",".MathJax_MathML",".mwe-math-element",".mwe-math-fallback-image-inline",".mwe-math-fallback-image-display",".mwe-math-mathml-inline",".mwe-math-mathml-display",".katex",".katex-display",".katex-mathml",".katex-html","[data-katex]",'script[type="math/katex"]',"math","[data-math]","[data-latex]","[data-tex]",'script[type^="math/"]','annotation[encoding="application/x-tex"]'].join(",")},397:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ClaudeExtractor=void 0;const l=c(181);class d extends l.ConversationExtractor{constructor(u,g){super(u,g),this.articles=u.querySelectorAll('div[data-testid="user-message"], div[data-testid="assistant-message"], div.font-claude-message')}canExtract(){return!!this.articles&&this.articles.length>0}extractMessages(){const u=[];return this.articles&&this.articles.forEach(g=>{let m,h;if(g.hasAttribute("data-testid")){if(g.getAttribute("data-testid")!=="user-message")return;m="you",h=g.innerHTML}else{if(!g.classList.contains("font-claude-message"))return;m="assistant",h=g.innerHTML}h&&u.push({author:m==="you"?"You":"Claude",content:h.trim(),metadata:{role:m}})}),u}getMetadata(){const u=this.getTitle(),g=this.extractMessages();return{title:u,site:"Claude",url:this.url,messageCount:g.length,description:`Claude conversation with ${g.length} messages`}}getTitle(){var u,g,m,h,b;const f=(u=this.document.title)===null||u===void 0?void 0:u.trim();if(f&&f!=="Claude")return f.replace(/ - Claude$/,"");const v=(m=(g=this.document.querySelector("header .font-tiempos"))===null||g===void 0?void 0:g.textContent)===null||m===void 0?void 0:m.trim();if(v)return v;const S=(b=(h=this.articles)===null||h===void 0?void 0:h.item(0))===null||b===void 0?void 0:b.querySelector('[data-testid="user-message"]');if(S){const k=S.textContent||"";return k.length>50?k.slice(0,50)+"...":k}return"Claude Conversation"}}a.ClaudeExtractor=d},458:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.HackerNewsExtractor=void 0;const l=c(279);class d extends l.BaseExtractor{constructor(u,g){super(u,g),this.mainPost=u.querySelector(".fatitem"),this.isCommentPage=this.detectCommentPage(),this.mainComment=this.isCommentPage?this.findMainComment():null}detectCommentPage(){var u;return!!(!((u=this.mainPost)===null||u===void 0)&&u.querySelector('.navs a[href*="parent"]'))}findMainComment(){var u;return((u=this.mainPost)===null||u===void 0?void 0:u.querySelector(".comment"))||null}canExtract(){return!!this.mainPost}extract(){const u=this.getPostContent(),g=this.extractComments(),m=this.createContentHtml(u,g),h=this.getPostTitle(),b=this.getPostAuthor(),f=this.createDescription(),v=this.getPostDate();return{content:m,contentHtml:m,extractedContent:{postId:this.getPostId(),postAuthor:b},variables:{title:h,author:b,site:"Hacker News",description:f,published:v}}}createContentHtml(u,g){return`
			<div class="hackernews-post">
				<div class="post-content">
					${u}
				</div>
				${g?`
					<hr>
					<h2>Comments</h2>
					<div class="hackernews-comments">
						${g}
					</div>
				`:""}
			</div>
		`.trim()}getPostContent(){var u,g,m,h,b,f;if(!this.mainPost)return"";if(this.isCommentPage&&this.mainComment){const O=((u=this.mainComment.querySelector(".hnuser"))===null||u===void 0?void 0:u.textContent)||"[deleted]",I=((g=this.mainComment.querySelector(".commtext"))===null||g===void 0?void 0:g.innerHTML)||"",N=this.mainComment.querySelector(".age"),M=((N==null?void 0:N.getAttribute("title"))||"").split("T")[0]||"",R=((h=(m=this.mainComment.querySelector(".score"))===null||m===void 0?void 0:m.textContent)===null||h===void 0?void 0:h.trim())||"",B=((b=this.mainPost.querySelector('.navs a[href*="parent"]'))===null||b===void 0?void 0:b.getAttribute("href"))||"";return`
				<div class="comment main-comment">
					<div class="comment-metadata">
						<span class="comment-author"><strong>${O}</strong></span> •
						<span class="comment-date">${M}</span>
						${R?` • <span class="comment-points">${R}</span>`:""}
						${B?` • <a href="https://news.ycombinator.com/${B}" class="parent-link">parent</a>`:""}
					</div>
					<div class="comment-content">${I}</div>
				</div>
			`.trim()}const v=this.mainPost.querySelector("tr.athing"),S=(v==null||v.nextElementSibling,((f=v==null?void 0:v.querySelector(".titleline a"))===null||f===void 0?void 0:f.getAttribute("href"))||"");let k="";S&&(k+=`<p><a href="${S}" target="_blank">${S}</a></p>`);const C=this.mainPost.querySelector(".toptext");return C&&(k+=`<div class="post-text">${C.innerHTML}</div>`),k}extractComments(){const u=Array.from(this.document.querySelectorAll("tr.comtr"));return this.processComments(u)}processComments(u){var g,m,h,b;let f="";const v=new Set;let S=-1,k=[];for(const C of u){const O=C.getAttribute("id");if(!O||v.has(O))continue;v.add(O);const I=((g=C.querySelector(".ind img"))===null||g===void 0?void 0:g.getAttribute("width"))||"0",N=parseInt(I)/40,M=C.querySelector(".commtext"),R=((m=C.querySelector(".hnuser"))===null||m===void 0?void 0:m.textContent)||"[deleted]",B=C.querySelector(".age"),F=((b=(h=C.querySelector(".score"))===null||h===void 0?void 0:h.textContent)===null||b===void 0?void 0:b.trim())||"";if(!M)continue;const z=`https://news.ycombinator.com/item?id=${O}`,V=((B==null?void 0:B.getAttribute("title"))||"").split("T")[0]||"";if(N===0){for(;k.length>0;)f+="</blockquote>",k.pop();f+="<blockquote>",k=[0],S=0}else if(N<S)for(;k.length>0&&k[k.length-1]>=N;)f+="</blockquote>",k.pop();else N>S&&(f+="<blockquote>",k.push(N));f+=`<div class="comment">
	<div class="comment-metadata">
		<span class="comment-author"><strong>${R}</strong></span> •
		<a href="${z}" class="comment-link">${V}</a>
		${F?` • <span class="comment-points">${F}</span>`:""}
	</div>
	<div class="comment-content">${M.innerHTML}</div>
</div>`,S=N}for(;k.length>0;)f+="</blockquote>",k.pop();return f}getPostId(){const u=this.url.match(/id=(\d+)/);return(u==null?void 0:u[1])||""}getPostTitle(){var u,g,m,h,b;if(this.isCommentPage&&this.mainComment){const f=((u=this.mainComment.querySelector(".hnuser"))===null||u===void 0?void 0:u.textContent)||"[deleted]",v=((g=this.mainComment.querySelector(".commtext"))===null||g===void 0?void 0:g.textContent)||"";return`Comment by ${f}: ${v.trim().slice(0,50)+(v.length>50?"...":"")}`}return((b=(h=(m=this.mainPost)===null||m===void 0?void 0:m.querySelector(".titleline"))===null||h===void 0?void 0:h.textContent)===null||b===void 0?void 0:b.trim())||""}getPostAuthor(){var u,g,m;return((m=(g=(u=this.mainPost)===null||u===void 0?void 0:u.querySelector(".hnuser"))===null||g===void 0?void 0:g.textContent)===null||m===void 0?void 0:m.trim())||""}createDescription(){const u=this.getPostTitle(),g=this.getPostAuthor();return this.isCommentPage?`Comment by ${g} on Hacker News`:`${u} - by ${g} on Hacker News`}getPostDate(){if(!this.mainPost)return"";const u=this.mainPost.querySelector(".age");return((u==null?void 0:u.getAttribute("title"))||"").split("T")[0]||""}}a.HackerNewsExtractor=d},552:(o,a)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.isElement=function(d){return d.nodeType===c.ELEMENT_NODE},a.isTextNode=function(d){return d.nodeType===c.TEXT_NODE},a.isCommentNode=function(d){return d.nodeType===c.COMMENT_NODE},a.getComputedStyle=function(d){const p=l(d.ownerDocument);return p?p.getComputedStyle(d):null},a.getWindow=l,a.logDebug=function(d,...p){typeof window<"u"&&window.defuddleDebug};const c={ELEMENT_NODE:1,TEXT_NODE:3,COMMENT_NODE:8};function l(d){return d.defaultView?d.defaultView:d.ownerWindow?d.ownerWindow:d.window?d.window:null}},588:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.GitHubExtractor=void 0;const l=c(279);class d extends l.BaseExtractor{canExtract(){return['meta[name="expected-hostname"][content="github.com"]','meta[name="octolytics-url"]','meta[name="github-keyboard-shortcuts"]',".js-header-wrapper","#js-repo-pjax-container"].some(u=>this.document.querySelector(u)!==null)&&Object.values({issue:['[data-testid="issue-metadata-sticky"]','[data-testid="issue-title"]']}).some(u=>u.some(g=>this.document.querySelector(g)!==null))}extract(){return this.extractIssue()}extractIssue(){const u=this.extractRepoInfo(),g=this.extractIssueNumber();let m="";const h=this.document.querySelector('[data-testid="issue-viewer-issue-container"]');if(h){const v=this.extractAuthor(h,['a[data-testid="issue-body-header-author"]',".IssueBodyHeaderAuthor-module__authorLoginLink--_S7aT",".ActivityHeader-module__AuthorLink--iofTU",'a[href*="/users/"][data-hovercard-url*="/users/"]','a[aria-label*="profile"]']),S=h.querySelector("relative-time"),k=(S==null?void 0:S.getAttribute("datetime"))||"",C=h.querySelector('[data-testid="issue-body-viewer"] .markdown-body');if(C){const O=this.cleanBodyContent(C);if(m+=`<div class="issue-author"><strong>${v}</strong>`,k){const I=new Date(k);m+=` opened this issue on ${I.toLocaleDateString()}`}m+=`</div>

`,m+=`<div class="issue-body">${O}</div>

`}}const b=Array.from(this.document.querySelectorAll("[data-wrapper-timeline-id]")),f=new Set;return b.forEach(v=>{const S=v.querySelector(".react-issue-comment");if(!S)return;const k=v.getAttribute("data-wrapper-timeline-id");if(!k||f.has(k))return;f.add(k);const C=this.extractAuthor(S,[".ActivityHeader-module__AuthorLink--iofTU",'a[data-testid="avatar-link"]','a[href^="/"][data-hovercard-url*="/users/"]']),O=S.querySelector("relative-time"),I=(O==null?void 0:O.getAttribute("datetime"))||"",N=S.querySelector(".markdown-body");if(N){const M=this.cleanBodyContent(N);if(M){if(m+=`<div class="comment">
`,m+=`<div class="comment-header"><strong>${C}</strong>`,I){const R=new Date(I);m+=` commented on ${R.toLocaleDateString()}`}m+=`</div>
`,m+=`<div class="comment-body">${M}</div>
`,m+=`</div>

`}}}),{content:m,contentHtml:m,extractedContent:{type:"issue",issueNumber:g,repository:u.repo,owner:u.owner},variables:{title:this.document.title,author:"",site:`GitHub - ${u.owner}/${u.repo}`,description:this.createDescription(m)}}}extractAuthor(u,g){for(const m of g){const h=u.querySelector(m);if(h){const b=h.getAttribute("href");if(b){if(b.startsWith("/"))return b.substring(1);if(b.includes("github.com/")){const f=b.match(/github\.com\/([^\/\?#]+)/);if(f&&f[1])return f[1]}}}}return"Unknown"}cleanBodyContent(u){const g=u.cloneNode(!0);return g.querySelectorAll('button, [data-testid*="button"], [data-testid*="menu"]').forEach(m=>m.remove()),g.querySelectorAll(".js-clipboard-copy, .zeroclipboard-container").forEach(m=>m.remove()),g.innerHTML.trim()}extractIssueNumber(){var u;const g=this.url.match(/\/(issues|pull)\/(\d+)/);if(g)return g[2];const m=this.document.querySelector("h1"),h=(u=m==null?void 0:m.textContent)===null||u===void 0?void 0:u.match(/#(\d+)/);return h?h[1]:""}extractRepoInfo(){const u=this.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);if(u)return{owner:u[1],repo:u[2]};const g=this.document.title.match(/([^\/\s]+)\/([^\/\s]+)/);return g?{owner:g[1],repo:g[2]}:{owner:"",repo:""}}createDescription(u){var g;if(!u)return"";const m=this.document.createElement("div");return m.innerHTML=u,((g=m.textContent)===null||g===void 0?void 0:g.trim().slice(0,140).replace(/\s+/g," "))||""}}a.GitHubExtractor=d},608:(o,a)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.MetadataExtractor=void 0,a.MetadataExtractor=class{static extract(c,l,d){var p,u;let g="",m="";try{if(m=((p=c.location)===null||p===void 0?void 0:p.href)||"",m||(m=this.getMetaContent(d,"property","og:url")||this.getMetaContent(d,"property","twitter:url")||this.getSchemaProperty(l,"url")||this.getSchemaProperty(l,"mainEntityOfPage.url")||this.getSchemaProperty(l,"mainEntity.url")||this.getSchemaProperty(l,"WebSite.url")||((u=c.querySelector('link[rel="canonical"]'))===null||u===void 0?void 0:u.getAttribute("href"))||""),m)try{g=new URL(m).hostname.replace(/^www\./,"")}catch{}}catch{const b=c.querySelector("base[href]");if(b)try{m=b.getAttribute("href")||"",g=new URL(m).hostname.replace(/^www\./,"")}catch{}}return{title:this.getTitle(c,l,d),description:this.getDescription(c,l,d),domain:g,favicon:this.getFavicon(c,m,d),image:this.getImage(c,l,d),published:this.getPublished(c,l,d),author:this.getAuthor(c,l,d),site:this.getSite(c,l,d),schemaOrgData:l,wordCount:0,parseTime:0}}static getAuthor(c,l,d){let p;if(p=this.getMetaContent(d,"name","sailthru.author")||this.getMetaContent(d,"property","author")||this.getMetaContent(d,"name","author")||this.getMetaContent(d,"name","byl")||this.getMetaContent(d,"name","authorList"),p)return p;let u=this.getSchemaProperty(l,"author.name")||this.getSchemaProperty(l,"author.[].name");if(u){const m=u.split(",").map(h=>h.trim().replace(/,$/,"").trim()).filter(Boolean);if(m.length>0){let h=[...new Set(m)];return h.length>10&&(h=h.slice(0,10)),h.join(", ")}}const g=[];if(['[itemprop="author"]',".author",'[href*="author"]',".authors a"].forEach(m=>{c.querySelectorAll(m).forEach(h=>{var b;(b=h.textContent)&&b.split(",").forEach(f=>{const v=f.trim().replace(/,$/,"").trim(),S=v.toLowerCase();v&&S!=="author"&&S!=="authors"&&g.push(v)})})}),g.length>0){let m=[...new Set(g.map(h=>h.trim()).filter(Boolean))];if(m.length>0)return m.length>10&&(m=m.slice(0,10)),m.join(", ")}return p=this.getMetaContent(d,"name","copyright")||this.getSchemaProperty(l,"copyrightHolder.name")||this.getMetaContent(d,"property","og:site_name")||this.getSchemaProperty(l,"publisher.name")||this.getSchemaProperty(l,"sourceOrganization.name")||this.getSchemaProperty(l,"isPartOf.name")||this.getMetaContent(d,"name","twitter:creator")||this.getMetaContent(d,"name","application-name"),p||""}static getSite(c,l,d){return this.getSchemaProperty(l,"publisher.name")||this.getMetaContent(d,"property","og:site_name")||this.getSchemaProperty(l,"WebSite.name")||this.getSchemaProperty(l,"sourceOrganization.name")||this.getMetaContent(d,"name","copyright")||this.getSchemaProperty(l,"copyrightHolder.name")||this.getSchemaProperty(l,"isPartOf.name")||this.getMetaContent(d,"name","application-name")||this.getAuthor(c,l,d)||""}static getTitle(c,l,d){var p,u;const g=this.getMetaContent(d,"property","og:title")||this.getMetaContent(d,"name","twitter:title")||this.getSchemaProperty(l,"headline")||this.getMetaContent(d,"name","title")||this.getMetaContent(d,"name","sailthru.title")||((u=(p=c.querySelector("title"))===null||p===void 0?void 0:p.textContent)===null||u===void 0?void 0:u.trim())||"";return this.cleanTitle(g,this.getSite(c,l,d))}static cleanTitle(c,l){if(!c||!l)return c;const d=l.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),p=[`\\s*[\\|\\-–—]\\s*${d}\\s*$`,`^\\s*${d}\\s*[\\|\\-–—]\\s*`];for(const u of p){const g=new RegExp(u,"i");if(g.test(c)){c=c.replace(g,"");break}}return c.trim()}static getDescription(c,l,d){return this.getMetaContent(d,"name","description")||this.getMetaContent(d,"property","description")||this.getMetaContent(d,"property","og:description")||this.getSchemaProperty(l,"description")||this.getMetaContent(d,"name","twitter:description")||this.getMetaContent(d,"name","sailthru.description")||""}static getImage(c,l,d){return this.getMetaContent(d,"property","og:image")||this.getMetaContent(d,"name","twitter:image")||this.getSchemaProperty(l,"image.url")||this.getMetaContent(d,"name","sailthru.image.full")||""}static getFavicon(c,l,d){var p,u;const g=this.getMetaContent(d,"property","og:image:favicon");if(g)return g;const m=(p=c.querySelector("link[rel='icon']"))===null||p===void 0?void 0:p.getAttribute("href");if(m)return m;const h=(u=c.querySelector("link[rel='shortcut icon']"))===null||u===void 0?void 0:u.getAttribute("href");if(h)return h;if(l)try{return new URL("/favicon.ico",l).href}catch{}return""}static getPublished(c,l,d){var p,u;return this.getSchemaProperty(l,"datePublished")||this.getMetaContent(d,"name","publishDate")||this.getMetaContent(d,"property","article:published_time")||((u=(p=c.querySelector('abbr[itemprop="datePublished"]'))===null||p===void 0?void 0:p.title)===null||u===void 0?void 0:u.trim())||this.getTimeElement(c)||this.getMetaContent(d,"name","sailthru.date")||""}static getMetaContent(c,l,d){var p,u;const g=c.find(m=>{const h=l==="name"?m.name:m.property;return(h==null?void 0:h.toLowerCase())===d.toLowerCase()});return g&&(u=(p=g.content)===null||p===void 0?void 0:p.trim())!==null&&u!==void 0?u:""}static getTimeElement(c){var l,d,p,u;const g=Array.from(c.querySelectorAll("time"))[0];return g&&(u=(d=(l=g.getAttribute("datetime"))===null||l===void 0?void 0:l.trim())!==null&&d!==void 0?d:(p=g.textContent)===null||p===void 0?void 0:p.trim())!==null&&u!==void 0?u:""}static getSchemaProperty(c,l,d=""){if(!c)return d;const p=(u,g,m,h=!0)=>{if(typeof u=="string")return g.length===0?[u]:[];if(!u||typeof u!="object")return[];if(Array.isArray(u)){const v=g[0];if(/^\\[\\d+\\]$/.test(v)){const S=parseInt(v.slice(1,-1));return u[S]?p(u[S],g.slice(1),m,h):[]}return g.length===0&&u.every(S=>typeof S=="string"||typeof S=="number")?u.map(String):u.flatMap(S=>p(S,g,m,h))}const[b,...f]=g;if(!b)return typeof u=="string"?[u]:typeof u=="object"&&u.name?[u.name]:[];if(u.hasOwnProperty(b))return p(u[b],f,m?`${m}.${b}`:b,!0);if(!h){const v=[];for(const S in u)if(typeof u[S]=="object"){const k=p(u[S],g,m?`${m}.${S}`:S,!1);v.push(...k)}if(v.length>0)return v}return[]};try{let u=p(c,l.split("."),"",!0);return u.length===0&&(u=p(c,l.split("."),"",!1)),u.length>0?u.filter(Boolean).join(", "):d}catch{return d}}}},610:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.standardizeFootnotes=function(p){const u=p.ownerDocument;u&&new d(u).standardizeFootnotes(p)};const l=c(640);class d{constructor(u){this.doc=u}createFootnoteItem(u,g,m){const h=typeof g=="string"?this.doc:g.ownerDocument,b=h.createElement("li");if(b.className="footnote",b.id=`fn:${u}`,typeof g=="string"){const v=h.createElement("p");v.innerHTML=g,b.appendChild(v)}else{const v=Array.from(g.querySelectorAll("p"));if(v.length===0){const S=h.createElement("p");S.innerHTML=g.innerHTML,b.appendChild(S)}else v.forEach(S=>{const k=h.createElement("p");k.innerHTML=S.innerHTML,b.appendChild(k)})}const f=b.querySelector("p:last-of-type")||b;return m.forEach((v,S)=>{const k=h.createElement("a");k.href=`#${v}`,k.title="return to article",k.className="footnote-backref",k.innerHTML="↩",S<m.length-1&&(k.innerHTML+=" "),f.appendChild(k)}),b}collectFootnotes(u){const g={};let m=1;const h=new Set;return u.querySelectorAll(l.FOOTNOTE_LIST_SELECTORS).forEach(b=>{if(b.matches('div.footnote[data-component-name="FootnoteToDOM"]')){const f=b.querySelector("a.footnote-number"),v=b.querySelector(".footnote-content");if(f&&v){const S=f.id.replace("footnote-","").toLowerCase();S&&!h.has(S)&&(g[m]={content:v,originalId:S,refs:[]},h.add(S),m++)}return}b.querySelectorAll('li, div[role="listitem"]').forEach(f=>{var v,S,k,C;let O="",I=null;const N=f.querySelector(".citations");if(!((v=N==null?void 0:N.id)===null||v===void 0)&&v.toLowerCase().startsWith("r")){O=N.id.toLowerCase();const M=N.querySelector(".citation-content");M&&(I=M)}else{if(f.id.toLowerCase().startsWith("bib.bib"))O=f.id.replace("bib.bib","").toLowerCase();else if(f.id.toLowerCase().startsWith("fn:"))O=f.id.replace("fn:","").toLowerCase();else if(f.id.toLowerCase().startsWith("fn"))O=f.id.replace("fn","").toLowerCase();else if(f.hasAttribute("data-counter"))O=((k=(S=f.getAttribute("data-counter"))===null||S===void 0?void 0:S.replace(/\.$/,""))===null||k===void 0?void 0:k.toLowerCase())||"";else{const M=(C=f.id.split("/").pop())===null||C===void 0?void 0:C.match(/cite_note-(.+)/);O=M?M[1].toLowerCase():f.id.toLowerCase()}I=f}O&&!h.has(O)&&(g[m]={content:I||f,originalId:O,refs:[]},h.add(O),m++)})}),g}findOuterFootnoteContainer(u){let g=u,m=u.parentElement;for(;m&&(m.tagName.toLowerCase()==="span"||m.tagName.toLowerCase()==="sup");)g=m,m=m.parentElement;return g}createFootnoteReference(u,g){const m=this.doc.createElement("sup");m.id=g;const h=this.doc.createElement("a");return h.href=`#fn:${u}`,h.textContent=u,m.appendChild(h),m}standardizeFootnotes(u){const g=this.collectFootnotes(u),m=u.querySelectorAll(l.FOOTNOTE_INLINE_REFERENCES),h=new Map;m.forEach(v=>{var S,k,C,O;if(!v)return;let I="";if(v.matches('a[id^="ref-link"]'))I=((S=v.textContent)===null||S===void 0?void 0:S.trim())||"";else if(v.matches('a[role="doc-biblioref"]')){const N=v.getAttribute("data-xml-rid");if(N)I=N;else{const M=v.getAttribute("href");M!=null&&M.startsWith("#core-R")&&(I=M.replace("#core-",""))}}else if(v.matches("a.footnote-anchor, span.footnote-hovercard-target a")){const N=((k=v.id)===null||k===void 0?void 0:k.replace("footnote-anchor-",""))||"";N&&(I=N.toLowerCase())}else if(v.matches("cite.ltx_cite")){const N=v.querySelector("a");if(N){const M=N.getAttribute("href");if(M){const R=(C=M.split("/").pop())===null||C===void 0?void 0:C.match(/bib\.bib(\d+)/);R&&(I=R[1].toLowerCase())}}}else if(v.matches("sup.reference")){const N=v.querySelectorAll("a");Array.from(N).forEach(M=>{var R;const B=M.getAttribute("href");if(B){const F=(R=B.split("/").pop())===null||R===void 0?void 0:R.match(/(?:cite_note|cite_ref)-(.+)/);F&&(I=F[1].toLowerCase())}})}else if(v.matches('sup[id^="fnref:"]'))I=v.id.replace("fnref:","").toLowerCase();else if(v.matches('sup[id^="fnr"]'))I=v.id.replace("fnr","").toLowerCase();else if(v.matches("span.footnote-reference"))I=v.getAttribute("data-footnote-id")||"";else if(v.matches("span.footnote-link"))I=v.getAttribute("data-footnote-id")||"",v.getAttribute("data-footnote-content");else if(v.matches("a.citation"))I=((O=v.textContent)===null||O===void 0?void 0:O.trim())||"",v.getAttribute("href");else if(v.matches('a[id^="fnref"]'))I=v.id.replace("fnref","").toLowerCase();else{const N=v.getAttribute("href");N&&(I=N.replace(/^[#]/,"").toLowerCase())}if(I){const N=Object.entries(g).find(([M,R])=>R.originalId===I.toLowerCase());if(N){const[M,R]=N,B=R.refs.length>0?`fnref:${M}-${R.refs.length+1}`:`fnref:${M}`;R.refs.push(B);const F=this.findOuterFootnoteContainer(v);F.tagName.toLowerCase()==="sup"?(h.has(F)||h.set(F,[]),h.get(F).push(this.createFootnoteReference(M,B))):F.replaceWith(this.createFootnoteReference(M,B))}}}),h.forEach((v,S)=>{if(v.length>0){const k=this.doc.createDocumentFragment();v.forEach(C=>{const O=C.querySelector("a");if(O){const I=this.doc.createElement("sup");I.id=C.id,I.appendChild(O.cloneNode(!0)),k.appendChild(I)}}),S.replaceWith(k)}});const b=this.doc.createElement("div");b.id="footnotes";const f=this.doc.createElement("ol");Object.entries(g).forEach(([v,S])=>{const k=this.createFootnoteItem(parseInt(v),S.content,S.refs);f.appendChild(k)}),u.querySelectorAll(l.FOOTNOTE_LIST_SELECTORS).forEach(v=>v.remove()),f.children.length>0&&(b.appendChild(f),u.appendChild(b))}}},628:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.Defuddle=void 0;const l=c(608),d=c(917),p=c(640),u=c(840),g=c(968),m=c(552);a.Defuddle=class{constructor(h,b={}){this.doc=h,this.options=b,this.debug=b.debug||!1}parse(){const h=this.parseInternal();if(h.wordCount<200){const b=this.parseInternal({removePartialSelectors:!1});if(b.wordCount>h.wordCount)return this._log("Retry produced more content"),b}return h}parseInternal(h={}){var b,f,v;const S=Date.now(),k=Object.assign(Object.assign({removeExactSelectors:!0,removePartialSelectors:!0},this.options),h),C=this._extractSchemaOrgData(this.doc),O=[];this.doc.querySelectorAll("meta").forEach(N=>{const M=N.getAttribute("name"),R=N.getAttribute("property");let B=N.getAttribute("content");B&&O.push({name:M,property:R,content:this._decodeHTMLEntities(B)})});const I=l.MetadataExtractor.extract(this.doc,C,O);k.removeImages&&this.removeImages(this.doc);try{const N=k.url||this.doc.URL,M=d.ExtractorRegistry.findExtractor(this.doc,N,C);if(M&&M.canExtract()){const q=M.extract(),P=Date.now();return{content:q.contentHtml,title:((b=q.variables)===null||b===void 0?void 0:b.title)||I.title,description:I.description,domain:I.domain,favicon:I.favicon,image:I.image,published:((f=q.variables)===null||f===void 0?void 0:f.published)||I.published,author:((v=q.variables)===null||v===void 0?void 0:v.author)||I.author,site:I.site,schemaOrgData:I.schemaOrgData,wordCount:this.countWords(q.contentHtml),parseTime:Math.round(P-S),extractorType:M.constructor.name.replace("Extractor","").toLowerCase(),metaTags:O}}const R=this._evaluateMediaQueries(this.doc),B=this.findSmallImages(this.doc),F=this.doc.cloneNode(!0);this.applyMobileStyles(F,R);const z=this.findMainContent(F);if(!z){const q=Date.now();return Object.assign(Object.assign({content:this.doc.body.innerHTML},I),{wordCount:this.countWords(this.doc.body.innerHTML),parseTime:Math.round(q-S),metaTags:O})}this.removeSmallImages(F,B),this.removeHiddenElements(F),g.ContentScorer.scoreAndRemove(F,this.debug),(k.removeExactSelectors||k.removePartialSelectors)&&this.removeBySelector(F,k.removeExactSelectors,k.removePartialSelectors),(0,u.standardizeContent)(z,I,this.doc,this.debug);const V=z.outerHTML,J=Date.now();return Object.assign(Object.assign({content:V},I),{wordCount:this.countWords(V),parseTime:Math.round(J-S),metaTags:O})}catch{const M=Date.now();return Object.assign(Object.assign({content:this.doc.body.innerHTML},I),{wordCount:this.countWords(this.doc.body.innerHTML),parseTime:Math.round(M-S),metaTags:O})}}countWords(h){const b=this.doc.createElement("div");return b.innerHTML=h,(b.textContent||"").trim().replace(/\s+/g," ").split(" ").filter(f=>f.length>0).length}_log(...h){this.debug}_evaluateMediaQueries(h){const b=[],f=/max-width[^:]*:\s*(\d+)/;try{Array.from(h.styleSheets).filter(S=>{try{return S.cssRules,!0}catch(k){return k instanceof DOMException&&k.name,!1}}).flatMap(S=>{try{return typeof CSSMediaRule>"u"?[]:Array.from(S.cssRules).filter(k=>k instanceof CSSMediaRule&&k.conditionText.includes("max-width"))}catch{return this.debug,[]}}).forEach(S=>{const k=S.conditionText.match(f);if(k){const C=parseInt(k[1]);p.MOBILE_WIDTH<=C&&Array.from(S.cssRules).filter(O=>O instanceof CSSStyleRule).forEach(O=>{try{b.push({selector:O.selectorText,styles:O.style.cssText})}catch{this.debug}})}})}catch{}return b}applyMobileStyles(h,b){b.forEach(({selector:f,styles:v})=>{try{h.querySelectorAll(f).forEach(S=>{S.setAttribute("style",(S.getAttribute("style")||"")+v)})}catch{}})}removeImages(h){const b=h.getElementsByTagName("img");Array.from(b).forEach(f=>{f.remove()})}removeHiddenElements(h){let b=0;const f=new Set,v=Array.from(h.getElementsByTagName("*"));for(let S=0;S<v.length;S+=100){const k=v.slice(S,S+100),C=k.map(O=>{var I,N;try{return(I=O.ownerDocument.defaultView)===null||I===void 0?void 0:I.getComputedStyle(O)}catch{const R=O.getAttribute("style");if(!R)return null;const B=h.createElement("style");B.textContent=`* { ${R} }`,h.head.appendChild(B);const F=(N=O.ownerDocument.defaultView)===null||N===void 0?void 0:N.getComputedStyle(O);return h.head.removeChild(B),F}});k.forEach((O,I)=>{const N=C[I];!N||N.display!=="none"&&N.visibility!=="hidden"&&N.opacity!=="0"||(f.add(O),b++)})}this._log("Removed hidden elements:",b)}removeBySelector(h,b=!0,f=!0){const v=Date.now();let S=0,k=0;const C=new Set;if(b&&h.querySelectorAll(p.EXACT_SELECTORS.join(",")).forEach(I=>{I!=null&&I.parentNode&&(C.add(I),S++)}),f){const I=p.PARTIAL_SELECTORS.join("|"),N=new RegExp(I,"i"),M=p.TEST_ATTRIBUTES.map(R=>`[${R}]`).join(",");h.querySelectorAll(M).forEach(R=>{if(C.has(R))return;const B=p.TEST_ATTRIBUTES.map(F=>F==="class"?R.className&&typeof R.className=="string"?R.className:"":F==="id"?R.id||"":R.getAttribute(F)||"").join(" ").toLowerCase();B.trim()&&N.test(B)&&(C.add(R),k++)})}C.forEach(I=>I.remove());const O=Date.now();this._log("Removed clutter elements:",{exactSelectors:S,partialSelectors:k,total:C.size,processingTime:`${(O-v).toFixed(2)}ms`})}findSmallImages(h){const b=new Set,f=/scale\(([\d.]+)\)/,v=Date.now();let S=0;const k=[...Array.from(h.getElementsByTagName("img")),...Array.from(h.getElementsByTagName("svg"))];if(k.length===0)return b;const C=k.map(I=>({element:I,naturalWidth:I.tagName.toLowerCase()==="img"&&parseInt(I.getAttribute("width")||"0")||0,naturalHeight:I.tagName.toLowerCase()==="img"&&parseInt(I.getAttribute("height")||"0")||0,attrWidth:parseInt(I.getAttribute("width")||"0"),attrHeight:parseInt(I.getAttribute("height")||"0")}));for(let I=0;I<C.length;I+=50){const N=C.slice(I,I+50);try{const M=N.map(({element:B})=>{var F;try{return(F=B.ownerDocument.defaultView)===null||F===void 0?void 0:F.getComputedStyle(B)}catch{return null}}),R=N.map(({element:B})=>{try{return B.getBoundingClientRect()}catch{return null}});N.forEach((B,F)=>{var z;try{const V=M[F],J=R[F];if(!V)return;const q=V.transform,P=q?parseFloat(((z=q.match(f))===null||z===void 0?void 0:z[1])||"1"):1,w=[B.naturalWidth,B.attrWidth,parseInt(V.width)||0,J?J.width*P:0].filter(L=>typeof L=="number"&&L>0),T=[B.naturalHeight,B.attrHeight,parseInt(V.height)||0,J?J.height*P:0].filter(L=>typeof L=="number"&&L>0);if(w.length>0&&T.length>0){const L=Math.min(...w),_=Math.min(...T);if(L<33||_<33){const W=this.getElementIdentifier(B.element);W&&(b.add(W),S++)}}}catch{this.debug}})}catch{this.debug}}const O=Date.now();return this._log("Found small elements:",{count:S,processingTime:`${(O-v).toFixed(2)}ms`}),b}removeSmallImages(h,b){let f=0;["img","svg"].forEach(v=>{const S=h.getElementsByTagName(v);Array.from(S).forEach(k=>{const C=this.getElementIdentifier(k);C&&b.has(C)&&(k.remove(),f++)})}),this._log("Removed small elements:",f)}getElementIdentifier(h){if(h.tagName.toLowerCase()==="img"){const S=h.getAttribute("data-src");if(S)return`src:${S}`;const k=h.getAttribute("src")||"",C=h.getAttribute("srcset")||"",O=h.getAttribute("data-srcset");if(k)return`src:${k}`;if(C)return`srcset:${C}`;if(O)return`srcset:${O}`}const b=h.id||"",f=h.className||"",v=h.tagName.toLowerCase()==="svg"&&h.getAttribute("viewBox")||"";return b?`id:${b}`:v?`viewBox:${v}`:f?`class:${f}`:null}findMainContent(h){const b=[];if(p.ENTRY_POINT_ELEMENTS.forEach((f,v)=>{h.querySelectorAll(f).forEach(S=>{let k=40*(p.ENTRY_POINT_ELEMENTS.length-v);k+=g.ContentScorer.scoreElement(S),b.push({element:S,score:k})})}),b.length===0)return this.findContentByScoring(h);if(b.sort((f,v)=>v.score-f.score),this.debug&&this._log("Content candidates:",b.map(f=>({element:f.element.tagName,selector:this.getElementSelector(f.element),score:f.score}))),b.length===1&&b[0].element.tagName.toLowerCase()==="body"){const f=this.findTableBasedContent(h);if(f)return f}return b[0].element}findTableBasedContent(h){if(!Array.from(h.getElementsByTagName("table")).some(f=>{const v=parseInt(f.getAttribute("width")||"0"),S=this.getComputedStyle(f);return v>400||(S==null?void 0:S.width.includes("px"))&&parseInt(S.width)>400||f.getAttribute("align")==="center"||f.className.toLowerCase().includes("content")||f.className.toLowerCase().includes("article")}))return null;const b=Array.from(h.getElementsByTagName("td"));return g.ContentScorer.findBestElement(b)}findContentByScoring(h){const b=[];return p.BLOCK_ELEMENTS.forEach(f=>{Array.from(h.getElementsByTagName(f)).forEach(v=>{const S=g.ContentScorer.scoreElement(v);S>0&&b.push({score:S,element:v})})}),b.length>0?b.sort((f,v)=>v.score-f.score)[0].element:null}getElementSelector(h){const b=[];let f=h;for(;f&&f!==this.doc.documentElement;){let v=f.tagName.toLowerCase();f.id?v+="#"+f.id:f.className&&typeof f.className=="string"&&(v+="."+f.className.trim().split(/\s+/).join(".")),b.unshift(v),f=f.parentElement}return b.join(" > ")}getComputedStyle(h){return(0,m.getComputedStyle)(h)}_extractSchemaOrgData(h){const b=h.querySelectorAll('script[type="application/ld+json"]'),f=[];b.forEach(S=>{let k=S.textContent||"";try{k=k.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm,"").replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/,"$1").replace(/^\s*(\*\/|\/\*)\s*|\s*(\*\/|\/\*)\s*$/g,"").trim();const C=JSON.parse(k);C["@graph"]&&Array.isArray(C["@graph"])?f.push(...C["@graph"]):f.push(C)}catch{this.debug}});const v=S=>{if(typeof S=="string")return this._decodeHTMLEntities(S);if(Array.isArray(S))return S.map(v);if(typeof S=="object"&&S!==null){const k={};for(const C in S)Object.prototype.hasOwnProperty.call(S,C)&&(k[C]=v(S[C]));return k}return S};return f.map(v)}_decodeHTMLEntities(h){const b=this.doc.createElement("textarea");return b.innerHTML=h,b.value}}},632:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ChatGPTExtractor=void 0;const l=c(181);class d extends l.ConversationExtractor{constructor(u,g){super(u,g),this.articles=u.querySelectorAll('article[data-testid^="conversation-turn-"]'),this.footnotes=[],this.footnoteCounter=0}canExtract(){return!!this.articles&&this.articles.length>0}extractMessages(){const u=[];return this.footnotes=[],this.footnoteCounter=0,this.articles&&this.articles.forEach(g=>{var m,h;const b=g.querySelector("h5.sr-only, h6.sr-only"),f=((h=(m=b==null?void 0:b.textContent)===null||m===void 0?void 0:m.trim())===null||h===void 0?void 0:h.replace(/:\s*$/,""))||"";let v="";const S=g.getAttribute("data-message-author-role");S&&(v=S);let k=g.innerHTML||"";k=k.replace(/\u200B/g,"");const C=document.createElement("div");C.innerHTML=k,C.querySelectorAll('h5.sr-only, h6.sr-only, span[data-state="closed"]').forEach(O=>O.remove()),k=C.innerHTML,k=k.replace(/(&ZeroWidthSpace;)?(<span[^>]*?>\s*<a(?=[^>]*?href="([^"]+)")(?=[^>]*?target="_blank")(?=[^>]*?rel="noopener")[^>]*?>[\s\S]*?<\/a>\s*<\/span>)/gi,(O,I,N,M)=>{let R="",B="";try{R=new URL(M).hostname.replace(/^www\./,"");const V=M.split("#:~:text=");if(V.length>1){B=decodeURIComponent(V[1]),B=B.replace(/%2C/g,",");const J=B.split(",");B=J.length>1&&J[0].trim()?` — ${J[0].trim()}...`:J[0].trim()?` — ${B.trim()}`:""}}catch{R=M}let F,z=this.footnotes.findIndex(V=>V.url===M);return z===-1?(this.footnoteCounter++,F=this.footnoteCounter,this.footnotes.push({url:M,text:`<a href="${M}">${R}</a>${B}`})):F=z+1,`<sup id="fnref:${F}"><a href="#fn:${F}">${F}</a></sup>`}),k=k.replace(/<p[^>]*>\s*<\/p>/g,""),u.push({author:f,content:k.trim(),metadata:{role:v||"unknown"}})}),u}getFootnotes(){return this.footnotes}getMetadata(){const u=this.getTitle(),g=this.extractMessages();return{title:u,site:"ChatGPT",url:this.url,messageCount:g.length,description:`ChatGPT conversation with ${g.length} messages`}}getTitle(){var u,g,m;const h=(u=this.document.title)===null||u===void 0?void 0:u.trim();if(h&&h!=="ChatGPT")return h;const b=(m=(g=this.articles)===null||g===void 0?void 0:g.item(0))===null||m===void 0?void 0:m.querySelector(".text-message");if(b){const f=b.textContent||"";return f.length>50?f.slice(0,50)+"...":f}return"ChatGPT Conversation"}}a.ChatGPTExtractor=d},640:(o,a)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ALLOWED_ATTRIBUTES_DEBUG=a.ALLOWED_ATTRIBUTES=a.ALLOWED_EMPTY_ELEMENTS=a.FOOTNOTE_LIST_SELECTORS=a.FOOTNOTE_INLINE_REFERENCES=a.PARTIAL_SELECTORS=a.TEST_ATTRIBUTES=a.EXACT_SELECTORS=a.INLINE_ELEMENTS=a.PRESERVE_ELEMENTS=a.BLOCK_ELEMENTS=a.MOBILE_WIDTH=a.ENTRY_POINT_ELEMENTS=void 0,a.ENTRY_POINT_ELEMENTS=["#post",".post-content",".article-content","#article-content",".article_post",".article-wrapper",".entry-content",".content-article",".post",".markdown-body","article",'[role="article"]',"main",'[role="main"]',"body"],a.MOBILE_WIDTH=600,a.BLOCK_ELEMENTS=["div","section","article","main","aside","header","footer","nav","content"],a.PRESERVE_ELEMENTS=new Set(["pre","code","table","thead","tbody","tr","td","th","ul","ol","li","dl","dt","dd","figure","figcaption","picture","details","summary","blockquote","form","fieldset"]),a.INLINE_ELEMENTS=new Set(["a","span","strong","em","i","b","u","code","br","small","sub","sup","mark","date","del","ins","q","abbr","cite","relative-time","time","font"]),a.EXACT_SELECTORS=["noscript",'script:not([type^="math/"])',"style","meta","link",'.ad:not([class*="gradient"])','[class^="ad-" i]','[class$="-ad" i]','[id^="ad-" i]','[id$="-ad" i]','[role="banner" i]','[alt*="advert" i]',".promo",".Promo","#barrier-page",".alert",'[id="comments" i]','[id="comment" i]',"header",".header:not(.banner)","#header","#Header","#banner","#Banner","nav",".navigation","#navigation",".hero",'[role="navigation" i]','[role="dialog" i]','[role*="complementary" i]','[class*="pagination" i]',".menu","#menu","#siteSub",".previous",".author",".Author",'[class$="_bio"]',"#categories",".contributor",".date","#date","[data-date]",".entry-meta",".meta",".tags","#tags",".toc",".Toc","#toc",".headline","#headline","#title","#Title","#articleTag",'[href*="/category"]','[href*="/categories"]','[href*="/tag/"]','[href*="/tags/"]','[href*="/topics"]','[href*="author"]','[href*="#toc"]','[href="#top"]','[href="#Top"]','[href="#page-header"]','[href="#content"]','[href="#site-content"]','[href="#main-content"]','[href^="#main"]','[src*="author"]',"footer",".aside","aside","button","canvas","date","dialog","fieldset","form",'input:not([type="checkbox"])',"label","option","select","textarea","time","relative-time","[hidden]",'[aria-hidden="true"]:not([class*="math"])','[style*="display: none"]:not([class*="math"])','[style*="display:none"]:not([class*="math"])','[style*="visibility: hidden"]','[style*="visibility:hidden"]',".hidden",".invisible","instaread-player",'iframe:not([src*="youtube"]):not([src*="youtu.be"]):not([src*="vimeo"]):not([src*="twitter"]):not([src*="x.com"]):not([src*="datawrapper"])','[class="logo" i]',"#logo","#Logo","#newsletter","#Newsletter",".subscribe",".noprint",'[data-print-layout="hide" i]','[data-block="donotprint" i]','[class*="clickable-icon" i]','li span[class*="ltx_tag" i][class*="ltx_tag_item" i]','a[href^="#"][class*="anchor" i]','a[href^="#"][class*="ref" i]','[data-container*="most-viewed" i]',".sidebar",".Sidebar","#sidebar","#Sidebar","#sitesub",'[data-link-name*="skip" i]','[aria-label*="skip" i]',".copyright","#copyright","#rss","#feed",".gutter","#primaryaudio","#NYT_ABOVE_MAIN_CONTENT_REGION",'[data-testid="photoviewer-children-figure"] > span',"table.infobox",".pencraft:not(.pc-display-contents)",'[data-optimizely="related-articles-section" i]','[data-orientation="vertical"]',".gh-header-sticky",'[data-testid="issue-metadata-sticky"]'],a.TEST_ATTRIBUTES=["class","id","data-test","data-testid","data-test-id","data-qa","data-cy"],a.PARTIAL_SELECTORS=["a-statement","access-wall","activitypub","actioncall","addcomment","advert","adlayout","ad-tldr","ad-placement","ads-container","_ad_","after_content","after_main_article","afterpost","allterms","-alert-","alert-box","appendix","_archive","around-the-web","aroundpages","article-author","article-badges","article-banner","article-bottom-section","article-bottom","article-category","article-card","article-citation","article__copy","article_date","article-date","article-end ","article_header","article-header","article__header","article__hero","article__info","article-info","article-meta","article_meta","article__meta","articlename","article-subject","article_subject","article-snippet","article-separator","article--share","article--topics","articletags","article-tags","article_tags","articletitle","article-title","article_title","articletopics","article-topics","article--lede","articlewell","associated-people","audio-card","author-bio","author-box","author-info","author_info","authorm","author-mini-bio","author-name","author-publish-info","authored-by","avatar","back-to-top","backlink_container","backlinks-section","bio-block","biobox","blog-pager","bookmark-","-bookmark","bottominfo","bottomnav","bottom-of-article","bottom-wrapper","brand-bar","breadcrumb","brdcrumb","button-wrapper","buttons-container","btn-","-btn","byline","captcha","card-text","card-media","card-post","carouselcontainer","carousel-container","cat_header","catlinks","_categories","card-author","card-content","chapter-list","collections","comments","commentbox","comment-button","commentcomp","comment-content","comment-count","comment-form","comment-number","comment-respond","comment-thread","comment-wrap","complementary","consent","contact-","content-card","content-topics","contentpromo","context-bar","context-widget","core-collateral","cover-","created-date","creative-commons_","c-subscribe","_cta","-cta","cta-","cta_","current-issue","custom-list-number","dateline","dateheader","date-header","date-pub","disclaimer","disclosure","discussion","discuss_","disqus","donate","donation","dropdown","eletters","emailsignup","engagement-widget","enhancement","entry-author-info","entry-categories","entry-date","entry-title","entry-utility","-error","error-","eyebrow","expand-reduce","external-anchor","externallinkembedwrapper","extra-services","extra-title","facebook","fancy-box","favorite","featured-content","feature_feed","feedback","feed-links","field-site-sections","fixheader","floating-vid","follower","footer","footnote-back","footnoteback","form-group","for-you","frontmatter","further-reading","fullbleedheader","gated-","gh-feed","gist-meta","goog-","graph-view","hamburger","header_logo","header-logo","header-pattern","hero-list","hide-for-print","hide-print","hide-when-no-script","hidden-print","hidden-sidenote","hidden-accessibility","infoline","instacartIntegration","interlude","interaction","itemendrow","invisible","jumplink","jump-to-","js-skip-to-content","keepreading","keep-reading","keep_reading","keyword_wrap","kicker","labstab","-labels","language-name","lastupdated","latest-content","-ledes-","-license","license-","lightbox-popup","like-button","link-box","links-grid","links-title","listing-dynamic-terms","list-tags","listinks","loading","loa-info","logo_container","ltx_role_refnum","ltx_tag_bibitem","ltx_error","masthead","marketing","media-inquiry","-menu","menu-","metadata","might-like","minibio","more-about","_modal","-modal","more-","morenews","morestories","more_wrapper","most-read","move-helper","mw-editsection","mw-cite-backlink","mw-indicators","mw-jump-link","nav-","nav_","navigation-post","next-","newsgallery","news-story-title","newsletter_","newsletterbanner","newslettercontainer","newsletter-form","newsletter-signup","newslettersignup","newsletterwidget","newsletterwrapper","not-found","notessection","nomobile","noprint","open-slideshow","originally-published","other-blogs","outline-view","pagehead","page-header","page-title","paywall_message","-partners","permission-","plea","popular","popup_links","pop_stories","pop-up","post-author","post-bottom","post__category","postcomment","postdate","post-date","post_date","post-details","post-feeds","postinfo","post-info","post_info","post-inline-date","post-links","postlist","post_list","post_meta","post-meta","postmeta","post_more","postnavi","post-navigation","postpath","post-preview","postsnippet","post_snippet","post-snippet","post-subject","posttax","post-tax","post_tax","posttag","post_tag","post-tag","post_time","posttitle","post-title","post_title","post__title","post-ufi-button","prev-post","prevnext","prev_next","prev-next","previousnext","press-inquiries","print-none","print-header","print:hidden","privacy-notice","privacy-settings","profile","promo_article","promo-bar","promo-box","pubdate","pub_date","pub-date","publish_date","publish-date","publication-date","publicationName","qr-code","qr_code","quick_up","_rail","ratingssection","read_also","readmore","read-next","read_next","read_time","read-time","reading_time","reading-time","reading-list","recent-","recent-articles","recentpost","recent_post","recent-post","recommend","redirectedfrom","recirc","register","related","relevant","reversefootnote","_rss","rss-link","screen-reader-text","scroll_to","scroll-to","_search","-search","section-nav","series-banner","share-box","sharedaddy","share-icons","sharelinks","share-post","share-print","share-section","show-for-print","sidebartitle","sidebar-content","sidebar-wrapper","sideitems","sidebar-author","sidebar-item","side-box","side-logo","sign-in-gate","similar-","similar_","similars-","site-index","site-header","siteheader","site-logo","site-name","site-wordpress","skip-content","skip-to-content","skip-link","c-skip-link","_skip-link","-slider","slug-wrap","social-author","social-shar","social-date","speechify-ignore","speedbump","sponsor","springercitation","sr-only","_stats","story-date","story-navigation","storyreadtime","storysmall","storypublishdate","subject-label","subhead","submenu","-subscribe-","subscriber-drive","subscription-","_tags","tags__item","tag_list","taxonomy","table-of-contents","tabs-","terminaltout","time-rubric","timestamp","time-read","time-to-read","tip_off","tiptout","-tout-","toc-container","toggle-caption","tooltip","topbar","topic-list","topic-subnav","top-wrapper","tree-item","trending","trust-feat","trust-badge","trust-project","twitter","u-hide","upsell","viewbottom","visually-hidden","welcomebox","widget_pages"],a.FOOTNOTE_INLINE_REFERENCES=["sup.reference","cite.ltx_cite",'sup[id^="fnr"]','span[id^="fnr"]','span[class*="footnote_ref"]',"span.footnote-link","a.citation",'a[id^="ref-link"]','a[href^="#fn"]','a[href^="#cite"]','a[href^="#reference"]','a[href^="#footnote"]','a[href^="#r"]','a[href^="#b"]','a[href*="cite_note"]','a[href*="cite_ref"]',"a.footnote-anchor","span.footnote-hovercard-target a",'a[role="doc-biblioref"]','a[id^="fnref"]','a[id^="ref-link"]'].join(","),a.FOOTNOTE_LIST_SELECTORS=["div.footnote ol","div.footnotes ol",'div[role="doc-endnotes"]','div[role="doc-footnotes"]',"ol.footnotes-list","ol.footnotes","ol.references",'ol[class*="article-references"]',"section.footnotes ol",'section[role="doc-endnotes"]','section[role="doc-footnotes"]','section[role="doc-bibliography"]',"ul.footnotes-list","ul.ltx_biblist",'div.footnote[data-component-name="FootnoteToDOM"]'].join(","),a.ALLOWED_EMPTY_ELEMENTS=new Set(["area","audio","base","br","circle","col","defs","ellipse","embed","figure","g","hr","iframe","img","input","line","link","mask","meta","object","param","path","pattern","picture","polygon","polyline","rect","source","stop","svg","td","th","track","use","video","wbr"]),a.ALLOWED_ATTRIBUTES=new Set(["alt","allow","allowfullscreen","aria-label","checked","colspan","controls","data-latex","data-src","data-srcset","data-lang","dir","display","frameborder","headers","height","href","lang","role","rowspan","src","srcset","title","type","width","accent","accentunder","align","columnalign","columnlines","columnspacing","columnspan","data-mjx-texclass","depth","displaystyle","fence","frame","framespacing","linethickness","lspace","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","rowalign","rowlines","rowspacing","rowspan","rspace","scriptlevel","separator","stretchy","symmetric","voffset","xmlns"]),a.ALLOWED_ATTRIBUTES_DEBUG=new Set(["class","id"])},649:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.imageRules=void 0;const l=c(552),d=/^data:image\/([^;]+);base64,/,p=/\.(jpg|jpeg|png|webp)\s+\d/,u=/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/,g=/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i,m=/\s(\d+)w/,h=/dpr=(\d+(?:\.\d+)?)/,b=/^([^\s]+)/,f=/^[\w\-\.\/\\]+\.(jpg|jpeg|png|gif|webp|svg)$/i,v=/^\d{4}-\d{2}-\d{2}$/;function S(w,T,L){const _=L.createElement("figure");_.appendChild(w.cloneNode(!0));const W=L.createElement("figcaption"),$=function(D){const U=[],G=new Set,Q=X=>{var te;if((0,l.isTextNode)(X)){const ee=((te=X.textContent)===null||te===void 0?void 0:te.trim())||"";ee&&!G.has(ee)&&(U.push(ee),G.add(ee))}else if((0,l.isElement)(X)){const ee=X.childNodes;for(let re=0;re<ee.length;re++)Q(ee[re])}},Y=D.childNodes;for(let X=0;X<Y.length;X++)Q(Y[X]);return U.length>0?U.join(" "):D.innerHTML}(T);return W.innerHTML=$,_.appendChild(W),_}function k(w,T){T.setAttribute("srcset",w);const L=q(w);L&&N(L)&&T.setAttribute("src",L)}function C(w,T,L){for(let _=0;_<w.attributes.length;_++){const W=w.attributes[_];L.includes(W.name)||T.setAttribute(W.name,W.value)}}function O(w){const T=w.match(d);if(!T||T[1]==="svg+xml")return!1;const L=T[0].length;return w.length-L<133}function I(w){return w.startsWith("data:image/svg+xml")}function N(w){return!w.startsWith("data:")&&!(!w||w.trim()==="")&&(g.test(w)||w.includes("image")||w.includes("img")||w.includes("photo"))}function M(w){return R(w)?!0:w.querySelectorAll("img, video, picture, source").length>0}function R(w){const T=w.tagName.toLowerCase();return T==="img"||T==="video"||T==="picture"||T==="source"}function B(w){if(R(w))return w;const T=w.querySelectorAll("picture");if(T.length>0)return T[0];const L=w.querySelectorAll("img"),_=[];for(let U=0;U<L.length;U++){const G=L[U],Q=G.getAttribute("src")||"",Y=G.getAttribute("alt")||"";Q.includes("data:image/svg+xml")||O(Q)||!Y.trim()&&L.length>1||_.push(G)}if(_.length>0)return _[0];const W=w.querySelectorAll("video");if(W.length>0)return W[0];const $=w.querySelectorAll("source");if($.length>0)return $[0];const D=w.querySelectorAll("img, picture, source, video");return D.length>0?D[0]:null}function F(w){var T,L,_,W;const $=w.querySelector("figcaption");if($)return $;const D=new Set,U=['[class*="caption"]','[class*="description"]','[class*="alt"]','[class*="title"]','[class*="credit"]','[class*="text"]','[class*="post-thumbnail-text"]','[class*="image-caption"]','[class*="photo-caption"]',"[aria-label]","[title]"].join(", "),G=w.querySelectorAll(U);for(let X=0;X<G.length;X++){const te=G[X];if(R(te))continue;const ee=(T=te.textContent)===null||T===void 0?void 0:T.trim();if(ee&&ee.length>0&&!D.has(ee))return D.add(ee),te}const Q=w.querySelector("img");if(Q&&Q.hasAttribute("alt")){const X=Q.getAttribute("alt");if(X&&X.trim().length>0){const te=w.ownerDocument.createElement("div");return te.textContent=X,te}}if(w.parentElement){const X=w.parentElement.children;for(let te=0;te<X.length;te++){const ee=X[te];if(ee!==w&&Array.from(ee.classList).some(re=>re.includes("caption")||re.includes("credit")||re.includes("text")||re.includes("description"))){const re=(L=ee.textContent)===null||L===void 0?void 0:L.trim();if(re&&re.length>0)return ee}}}const Y=w.querySelectorAll("img");for(let X=0;X<Y.length;X++){const te=Y[X];if(!te.parentElement)continue;let ee=te.nextElementSibling;for(;ee;){if(["EM","STRONG","SPAN","I","B","SMALL","CITE"].includes(ee.tagName)){const re=(_=ee.textContent)===null||_===void 0?void 0:_.trim();if(re&&re.length>0)return ee}ee=ee.nextElementSibling}}for(let X=0;X<Y.length;X++){const te=Y[X],ee=te.parentElement;if(!ee)continue;const re=ee.querySelectorAll("em, strong, span, i, b, small, cite");for(let $e=0;$e<re.length;$e++){const tt=re[$e];if(tt===te)continue;const kt=(W=tt.textContent)===null||W===void 0?void 0:W.trim();if(kt&&kt.length>0)return tt}}return null}function z(w){var T;const L=((T=w.textContent)===null||T===void 0?void 0:T.trim())||"";return!(L.length<10||L.startsWith("http://")||L.startsWith("https://"))&&!f.test(L)&&!L.match(/^\d+$/)&&!v.test(L)}function V(w,T){const L=w.tagName.toLowerCase();if(L==="img")return J(w,T);if(L==="picture"){const _=w.querySelector("img");return _?J(_,T):w.cloneNode(!0)}return L==="source"?function(_,W){const $=W.createElement("img"),D=_.getAttribute("srcset");D&&k(D,$);const U=_.parentElement;if(U){const G=U.querySelectorAll("img"),Q=[];for(let Y=0;Y<G.length;Y++){const X=G[Y],te=X.getAttribute("src")||"";O(te)||I(te)||te===""||Q.push(X)}if(Q.length>0){if(C(Q[0],$,["src","srcset"]),!$.hasAttribute("src")||!N($.getAttribute("src")||"")){const Y=Q[0].getAttribute("src");Y&&N(Y)&&$.setAttribute("src",Y)}}else{const Y=U.querySelector("img[data-src]");if(Y&&(C(Y,$,["src","srcset"]),!$.hasAttribute("src")||!N($.getAttribute("src")||""))){const X=Y.getAttribute("data-src");X&&N(X)&&$.setAttribute("src",X)}}}return $}(w,T):w.cloneNode(!0)}function J(w,T){const L=w.getAttribute("src")||"";if(O(L)||I(L)){const _=w.parentElement;if(_){const W=_.querySelectorAll("source"),$=[];for(let D=0;D<W.length;D++){const U=W[D];U.hasAttribute("data-srcset")&&U.getAttribute("data-srcset")!==""&&$.push(U)}if($.length>0){const D=T.createElement("img"),U=w.getAttribute("data-src");return U&&!I(U)&&D.setAttribute("src",U),C(w,D,["src"]),D}}}return w.cloneNode(!0)}function q(w){const T=w.split(",");if(T.length===0)return null;const L=T[0].trim().match(b);if(L&&L[1]){const _=L[1];if(I(_)){for(let W=1;W<T.length;W++){const $=T[W].trim().match(b);if($&&$[1]&&!I($[1]))return $[1]}return null}return _}return null}function P(w){if(w.length===0)return null;if(w.length===1)return w[0];for(let _=0;_<w.length;_++)if(!w[_].hasAttribute("media"))return w[_];let T=null,L=0;for(let _=0;_<w.length;_++){const W=w[_],$=W.getAttribute("srcset");if(!$)continue;const D=$.match(m),U=$.match(h);if(D&&D[1]){const G=parseInt(D[1],10)*(U?parseFloat(U[1]):1);G>L&&(L=G,T=W)}}return T||w[0]}a.imageRules=[{selector:"picture",element:"picture",transform:(w,T)=>{const L=w.querySelectorAll("source"),_=w.querySelector("img");if(!_){const D=P(L);if(D){const U=D.getAttribute("srcset");if(U){const G=T.createElement("img");return k(U,G),w.innerHTML="",w.appendChild(G),w}}return w}let W=null,$=null;if(L.length>0){const D=P(L);D&&(W=D.getAttribute("srcset"),W&&($=q(W)))}if(W&&_.setAttribute("srcset",W),$&&N($))_.setAttribute("src",$);else if(!_.hasAttribute("src")||!N(_.getAttribute("src")||"")){const D=q(_.getAttribute("srcset")||W||"");D&&N(D)&&_.setAttribute("src",D)}return L.forEach(D=>D.remove()),w}},{selector:"uni-image-full-width",element:"figure",transform:(w,T)=>{var L;const _=T.createElement("figure"),W=T.createElement("img"),$=w.querySelector("img");if(!$)return _;let D=$.getAttribute("src");const U=$.getAttribute("data-loading");if(U)try{const Y=JSON.parse(U);Y.desktop&&N(Y.desktop)&&(D=Y.desktop)}catch{}if(!D||!N(D))return _;W.setAttribute("src",D);let G=$.getAttribute("alt");G||(G=w.getAttribute("alt-text")),G&&W.setAttribute("alt",G),_.appendChild(W);const Q=w.querySelector("figcaption");if(Q){const Y=(L=Q.textContent)===null||L===void 0?void 0:L.trim();if(Y&&Y.length>5){const X=T.createElement("figcaption"),te=Q.querySelector(".rich-text p");te?X.innerHTML=te.innerHTML:X.textContent=Y,_.appendChild(X)}}return _}},{selector:'img[data-src], img[data-srcset], img[loading="lazy"], img.lazy, img.lazyload',element:"img",transform:(w,T)=>{const L=w.getAttribute("src")||"",_=function(D){if(D.hasAttribute("data-src")||D.hasAttribute("data-srcset"))return!0;for(let U=0;U<D.attributes.length;U++){const G=D.attributes[U];if(G.name!=="src"&&(G.name.startsWith("data-")&&/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(G.value)||/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(G.value)))return!0}return!1}(w);O(L)&&_&&w.removeAttribute("src");const W=w.getAttribute("data-src");W&&!w.getAttribute("src")&&w.setAttribute("src",W);const $=w.getAttribute("data-srcset");$&&!w.getAttribute("srcset")&&w.setAttribute("srcset",$);for(let D=0;D<w.attributes.length;D++){const U=w.attributes[D];U.name!=="src"&&U.name!=="srcset"&&U.name!=="alt"&&(p.test(U.value)?w.setAttribute("srcset",U.value):u.test(U.value)&&w.setAttribute("src",U.value))}return w.classList.remove("lazy","lazyload"),w.removeAttribute("data-ll-status"),w.removeAttribute("data-src"),w.removeAttribute("data-srcset"),w.removeAttribute("loading"),w}},{selector:"span:has(img)",element:"span",transform:(w,T)=>{try{if(!M(w))return w;const L=B(w);if(!L)return w;const _=F(w),W=V(L,T);if(_&&z(_)){const $=S(W,_,T);return _.parentNode&&_.parentNode.removeChild(_),$}return W}catch{return w}}},{selector:'figure, p:has([class*="caption"])',element:"figure",transform:(w,T)=>{try{if(!M(w))return w;const L=B(w);if(!L)return w;const _=F(w);if(_&&z(_)){const W=B(w);let $;return W?$=W:$=V(L,T),S($,_,T)}return w}catch{return w}}}]},732:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.GeminiExtractor=void 0;const l=c(181);class d extends l.ConversationExtractor{constructor(u,g){super(u,g),this.messageCount=null,this.conversationContainers=u.querySelectorAll("div.conversation-container"),this.footnotes=[]}canExtract(){return!!this.conversationContainers&&this.conversationContainers.length>0}extractMessages(){this.messageCount=0;const u=[];return this.conversationContainers&&(this.extractSources(),this.conversationContainers.forEach(g=>{const m=g.querySelector("user-query");if(m){const b=m.querySelector(".query-text");if(b){const f=b.innerHTML||"";u.push({author:"You",content:f.trim(),metadata:{role:"user"}})}}const h=g.querySelector("model-response");if(h){const b=h.querySelector(".model-response-text .markdown"),f=h.querySelector("#extended-response-markdown-content")||b;if(f){let v=f.innerHTML||"";const S=document.createElement("div");S.innerHTML=v,S.querySelectorAll(".table-content").forEach(k=>{k.classList.remove("table-content")}),v=S.innerHTML,u.push({author:"Gemini",content:v.trim(),metadata:{role:"assistant"}})}}}),this.messageCount=u.length),u}extractSources(){const u=this.document.querySelectorAll("browse-item");u&&u.length>0&&u.forEach(g=>{var m,h,b,f;const v=g.querySelector("a");if(v instanceof HTMLAnchorElement){const S=v.href,k=((h=(m=v.querySelector(".domain"))===null||m===void 0?void 0:m.textContent)===null||h===void 0?void 0:h.trim())||"",C=((f=(b=v.querySelector(".title"))===null||b===void 0?void 0:b.textContent)===null||f===void 0?void 0:f.trim())||"";S&&(k||C)&&this.footnotes.push({url:S,text:C?`${k}: ${C}`:k})}})}getFootnotes(){return this.footnotes}getMetadata(){var u;const g=this.getTitle(),m=(u=this.messageCount)!==null&&u!==void 0?u:this.extractMessages().length;return{title:g,site:"Gemini",url:this.url,messageCount:m,description:`Gemini conversation with ${m} messages`}}getTitle(){var u,g,m,h,b;const f=(u=this.document.title)===null||u===void 0?void 0:u.trim();if(f&&f!=="Gemini"&&!f.includes("Gemini"))return f;const v=(m=(g=this.document.querySelector(".title-text"))===null||g===void 0?void 0:g.textContent)===null||m===void 0?void 0:m.trim();if(v)return v;const S=(b=(h=this.conversationContainers)===null||h===void 0?void 0:h.item(0))===null||b===void 0?void 0:b.querySelector(".query-text");if(S){const k=S.textContent||"";return k.length>50?k.slice(0,50)+"...":k}return"Gemini Conversation"}}a.GeminiExtractor=d},754:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.codeBlockRules=void 0;const l=c(552),d=[/^language-(\w+)$/,/^lang-(\w+)$/,/^(\w+)-code$/,/^code-(\w+)$/,/^syntax-(\w+)$/,/^code-snippet__(\w+)$/,/^highlight-(\w+)$/,/^(\w+)-snippet$/,/(?:^|\s)(?:language|lang|brush|syntax)-(\w+)(?:\s|$)/i],p=new Set(["abap","actionscript","ada","adoc","agda","antlr4","applescript","arduino","armasm","asciidoc","aspnet","atom","bash","batch","c","clojure","cmake","cobol","coffeescript","cpp","c++","crystal","csharp","cs","dart","django","dockerfile","dotnet","elixir","elm","erlang","fortran","fsharp","gdscript","gitignore","glsl","golang","gradle","graphql","groovy","haskell","hs","haxe","hlsl","html","idris","java","javascript","js","jsx","jsdoc","json","jsonp","julia","kotlin","latex","lisp","elisp","livescript","lua","makefile","markdown","md","markup","masm","mathml","matlab","mongodb","mysql","nasm","nginx","nim","nix","objc","ocaml","pascal","perl","php","postgresql","powershell","prolog","puppet","python","regex","rss","ruby","rb","rust","scala","scheme","shell","sh","solidity","sparql","sql","ssml","svg","swift","tcl","terraform","tex","toml","typescript","ts","tsx","unrealscript","verilog","vhdl","webassembly","wasm","xml","yaml","yml","zig"]);a.codeBlockRules=[{selector:["pre",'div[class*="prismjs"]',".syntaxhighlighter",".highlight",".highlight-source",".wp-block-syntaxhighlighter-code",".wp-block-code",'div[class*="language-"]'].join(", "),element:"pre",transform:(u,g)=>{if(!(C=>"classList"in C&&"getAttribute"in C&&"querySelector"in C)(u))return u;const m=C=>{var O;const I=C.getAttribute("data-lang")||C.getAttribute("data-language");if(I)return I.toLowerCase();const N=Array.from(C.classList||[]);if(!((O=C.classList)===null||O===void 0)&&O.contains("syntaxhighlighter")){const M=N.find(R=>!["syntaxhighlighter","nogutter"].includes(R));if(M&&p.has(M.toLowerCase()))return M.toLowerCase()}for(const M of N)for(const R of d){const B=M.toLowerCase().match(R);if(B&&B[1]&&p.has(B[1].toLowerCase()))return B[1].toLowerCase()}for(const M of N)if(p.has(M.toLowerCase()))return M.toLowerCase();return""};let h="",b=u;for(;b&&!h;){h=m(b);const C=b.querySelector("code");!h&&C&&(h=m(C)),b=b.parentElement}const f=C=>{if((0,l.isTextNode)(C))return C.textContent||"";let O="";if((0,l.isElement)(C)){if(C.tagName==="BR")return`
`;if(C.matches('div[class*="line"], span[class*="line"], .ec-line, [data-line-number], [data-line]')){const I=C.querySelector('.code, .content, [class*="code-"], [class*="content-"]');if(I)return(I.textContent||"")+`
`;const N=C.querySelector('.line-number, .gutter, [class*="line-number"], [class*="gutter"]');return N?Array.from(C.childNodes).filter(M=>!N.contains(M)).map(M=>f(M)).join("")+`
`:C.textContent+`
`}C.childNodes.forEach(I=>{O+=f(I)})}return O};let v="";u.matches(".syntaxhighlighter, .wp-block-syntaxhighlighter-code")&&(v=(C=>{const O=C.querySelector(".syntaxhighlighter table .code .container");if(O)return Array.from(O.children).map(N=>Array.from(N.querySelectorAll("code")).map(R=>{var B;let F=R.textContent||"";return!((B=R.classList)===null||B===void 0)&&B.contains("spaces")&&(F=" ".repeat(F.length)),F}).join("")||N.textContent||"").join(`
`);const I=C.querySelectorAll(".code .line");return I.length>0?Array.from(I).map(N=>Array.from(N.querySelectorAll("code")).map(R=>R.textContent||"").join("")||N.textContent||"").join(`
`):""})(u)),v||(v=f(u)),v=v.replace(/^\s+|\s+$/g,"").replace(/\t/g,"    ").replace(/\n{3,}/g,`

`).replace(/\u00a0/g," ").replace(/^\n+/,"").replace(/\n+$/,"");const S=g.createElement("pre"),k=g.createElement("code");return h&&(k.setAttribute("data-lang",h),k.setAttribute("class",`language-${h}`)),k.textContent=v,S.appendChild(k),S}}]},840:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.standardizeContent=function(C,O,I,N=!1){(function(M){const R=B=>{if((0,h.isElement)(B)){const F=B.tagName.toLowerCase();if(F==="pre"||F==="code")return}if((0,h.isTextNode)(B)){const F=B.textContent||"",z=F.replace(/\xA0+/g,V=>{var J,q,P,w;if(V.length===1){const T=(q=(J=B.previousSibling)===null||J===void 0?void 0:J.textContent)===null||q===void 0?void 0:q.slice(-1),L=(w=(P=B.nextSibling)===null||P===void 0?void 0:P.textContent)===null||w===void 0?void 0:w.charAt(0);if(T!=null&&T.match(/\w/)&&(L!=null&&L.match(/\w/)))return" "}return" ".repeat(V.length)});z!==F&&(B.textContent=z)}B.hasChildNodes()&&Array.from(B.childNodes).forEach(R)};R(M)})(C),function(M){let R=0;Array.from(M.getElementsByTagName("*")).forEach(B=>{Array.from(B.childNodes).forEach(F=>{(0,h.isCommentNode)(F)&&(F.remove(),R++)})}),(0,h.logDebug)("Removed HTML comments:",R)}(C),function(M,R,B){const F=J=>J.replace(/\u00A0/g," ").replace(/\s+/g," ").trim().toLowerCase(),z=M.getElementsByTagName("h1");Array.from(z).forEach(J=>{var q;const P=B.createElement("h2");P.innerHTML=J.innerHTML,Array.from(J.attributes).forEach(w=>{l.ALLOWED_ATTRIBUTES.has(w.name)&&P.setAttribute(w.name,w.value)}),(q=J.parentNode)===null||q===void 0||q.replaceChild(P,J)});const V=M.getElementsByTagName("h2");if(V.length>0){const J=V[0],q=F(J.textContent||""),P=F(R);P&&P===q&&J.remove()}}(C,O.title,I),(0,u.standardizeFootnotes)(C),function(M,R){let B=0;b.forEach(F=>{M.querySelectorAll(F.selector).forEach(z=>{if(F.transform){const V=F.transform(z,R);z.replaceWith(V),B++}})}),M.querySelectorAll("lite-youtube").forEach(F=>{const z=F.getAttribute("videoid");if(!z)return;const V=R.createElement("iframe");V.width="560",V.height="315",V.src=`https://www.youtube.com/embed/${z}`,V.title=F.getAttribute("videotitle")||"YouTube video player",V.frameBorder="0",V.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",V.setAttribute("allowfullscreen",""),F.replaceWith(V),B++}),(0,h.logDebug)("Converted embedded elements:",B)}(C,I),N?(v(C,N),f(C),S(C),(0,h.logDebug)("Debug mode: Skipping div flattening to preserve structure")):(k(C,I),v(C,N),function(M){let R=0,B=0,F=!0;for(;F;){B++,F=!1;const z=Array.from(M.getElementsByTagName("*")).filter(V=>{if(l.ALLOWED_EMPTY_ELEMENTS.has(V.tagName.toLowerCase()))return!1;const J=V.textContent||"",q=J.trim().length===0,P=J.includes(" "),w=!V.hasChildNodes()||Array.from(V.childNodes).every(T=>{if((0,h.isTextNode)(T)){const L=T.textContent||"";return L.trim().length===0&&!L.includes(" ")}return!1});if(V.tagName.toLowerCase()==="div"){const T=Array.from(V.children);if(T.length>0&&T.every(L=>{var _;if(L.tagName.toLowerCase()!=="span")return!1;const W=((_=L.textContent)===null||_===void 0?void 0:_.trim())||"";return W===","||W===""||W===" "}))return!0}return q&&!P&&w});z.length>0&&(z.forEach(V=>{V.remove(),R++}),F=!0)}(0,h.logDebug)("Removed empty elements:",R,"iterations:",B)}(C),f(C),k(C,I),S(C),function(M,R){let B=0;const F=Date.now(),z=q=>{var P;if((0,h.isElement)(q)){const w=q.tagName.toLowerCase();if(w==="pre"||w==="code")return}if(Array.from(q.childNodes).forEach(z),(0,h.isTextNode)(q)){const w=q.textContent||"";if(!w||w.match(/^[\u200C\u200B\u200D\u200E\u200F\uFEFF\xA0\s]*$/))(P=q.parentNode)===null||P===void 0||P.removeChild(q),B++;else{const T=w.replace(/\n{3,}/g,`

`).replace(/^[\n\r\t]+/,"").replace(/[\n\r\t]+$/,"").replace(/[ \t]*\n[ \t]*/g,`
`).replace(/[ \t]{3,}/g," ").replace(/^[ ]+$/," ").replace(/\s+([,.!?:;])/g,"$1").replace(/[\u200C\u200B\u200D\u200E\u200F\uFEFF]+/g,"").replace(/(?:\xA0){2,}/g," ");T!==w&&(q.textContent=T,B+=w.length-T.length)}}},V=q=>{var P;if(!(0,h.isElement)(q))return;const w=q.tagName.toLowerCase();if(w==="pre"||w==="code")return;Array.from(q.childNodes).filter(h.isElement).forEach(V),q.normalize();const T=((P=(0,h.getComputedStyle)(q))===null||P===void 0?void 0:P.display)==="block",L=T?/^[\n\r\t \u200C\u200B\u200D\u200E\u200F\uFEFF\xA0]*$/:/^[\n\r\t\u200C\u200B\u200D\u200E\u200F\uFEFF]*$/,_=T?/^[\n\r\t \u200C\u200B\u200D\u200E\u200F\uFEFF\xA0]*$/:/^[\n\r\t\u200C\u200B\u200D\u200E\u200F\uFEFF]*$/;for(;q.firstChild&&(0,h.isTextNode)(q.firstChild)&&(q.firstChild.textContent||"").match(L);)q.removeChild(q.firstChild),B++;for(;q.lastChild&&(0,h.isTextNode)(q.lastChild)&&(q.lastChild.textContent||"").match(_);)q.removeChild(q.lastChild),B++;if(!T){const W=Array.from(q.childNodes);for(let $=0;$<W.length-1;$++){const D=W[$],U=W[$+1];if((0,h.isElement)(D)||(0,h.isElement)(U)){const G=U.textContent||"",Q=D.textContent||"",Y=G.match(/^[,.!?:;)\]]/),X=Q.match(/[,.!?:;(\[]\s*$/),te=(0,h.isTextNode)(D)&&(D.textContent||"").endsWith(" ")||(0,h.isTextNode)(U)&&(U.textContent||"").startsWith(" ");if(!Y&&!X&&!te){const ee=R.createTextNode(" ");q.insertBefore(ee,U)}}}}};z(M),V(M);const J=Date.now();(0,h.logDebug)("Removed empty lines:",{charactersRemoved:B,processingTime:`${(J-F).toFixed(2)}ms`})}(C,I))};const l=c(640),d=c(0),p=c(754),u=c(610),g=c(864),m=c(649),h=c(552),b=[...d.mathRules,...p.codeBlockRules,...g.headingRules,...m.imageRules,{selector:'div[data-testid^="paragraph"], div[role="paragraph"]',element:"p",transform:(C,O)=>{const I=O.createElement("p");return I.innerHTML=C.innerHTML,Array.from(C.attributes).forEach(N=>{l.ALLOWED_ATTRIBUTES.has(N.name)&&I.setAttribute(N.name,N.value)}),I}},{selector:'div[role="list"]',element:"ul",transform:(C,O)=>{var I;const N=C.querySelector('div[role="listitem"] .label'),M=(((I=N==null?void 0:N.textContent)===null||I===void 0?void 0:I.trim())||"").match(/^\d+\)/),R=O.createElement(M?"ol":"ul");return C.querySelectorAll('div[role="listitem"]').forEach(B=>{const F=O.createElement("li"),z=B.querySelector(".content");z&&(z.querySelectorAll('div[role="paragraph"]').forEach(V=>{const J=O.createElement("p");J.innerHTML=V.innerHTML,V.replaceWith(J)}),z.querySelectorAll('div[role="list"]').forEach(V=>{var J;const q=V.querySelector('div[role="listitem"] .label'),P=(((J=q==null?void 0:q.textContent)===null||J===void 0?void 0:J.trim())||"").match(/^\d+\)/),w=O.createElement(P?"ol":"ul");V.querySelectorAll('div[role="listitem"]').forEach(T=>{const L=O.createElement("li"),_=T.querySelector(".content");_&&(_.querySelectorAll('div[role="paragraph"]').forEach(W=>{const $=O.createElement("p");$.innerHTML=W.innerHTML,W.replaceWith($)}),L.innerHTML=_.innerHTML),w.appendChild(L)}),V.replaceWith(w)}),F.innerHTML=z.innerHTML),R.appendChild(F)}),R}},{selector:'div[role="listitem"]',element:"li",transform:(C,O)=>{const I=C.querySelector(".content");return I?(I.querySelectorAll('div[role="paragraph"]').forEach(N=>{const M=O.createElement("p");M.innerHTML=N.innerHTML,N.replaceWith(M)}),I):C}}];function f(C){let O=0;const I=N=>{let M="",R=N.nextSibling;for(;R;)((0,h.isTextNode)(R)||(0,h.isElement)(R))&&(M+=R.textContent||""),R=R.nextSibling;if(M.trim())return!0;const B=N.parentElement;return!(!B||B===C)&&I(B)};Array.from(C.querySelectorAll("h1, h2, h3, h4, h5, h6")).reverse().forEach(N=>{I(N)||(N.remove(),O++)}),O>0&&(0,h.logDebug)("Removed trailing headings:",O)}function v(C,O){let I=0;const N=M=>{if(M.tagName.toLowerCase()==="svg"||M.namespaceURI==="http://www.w3.org/2000/svg")return;const R=Array.from(M.attributes),B=M.tagName.toLowerCase();R.forEach(F=>{const z=F.name.toLowerCase(),V=F.value;z==="id"&&(V.startsWith("fnref:")||V.startsWith("fn:")||V==="footnotes")||z==="class"&&(B==="code"&&V.startsWith("language-")||V==="footnote-backref")||(O?l.ALLOWED_ATTRIBUTES.has(z)||l.ALLOWED_ATTRIBUTES_DEBUG.has(z)||z.startsWith("data-")||(M.removeAttribute(F.name),I++):l.ALLOWED_ATTRIBUTES.has(z)||(M.removeAttribute(F.name),I++))})};N(C),C.querySelectorAll("*").forEach(N),(0,h.logDebug)("Stripped attributes:",I)}function S(C){let O=0;const I=Date.now(),N=Array.from(C.getElementsByTagName("br"));let M=[];const R=()=>{if(M.length>2)for(let F=2;F<M.length;F++)M[F].remove(),O++;M=[]};N.forEach(F=>{var z;let V=!1;if(M.length>0){const J=M[M.length-1];let q=F.previousSibling;for(;q&&(0,h.isTextNode)(q)&&!(!((z=q.textContent)===null||z===void 0)&&z.trim());)q=q.previousSibling;q===J&&(V=!0)}V?M.push(F):(R(),M=[F])}),R();const B=Date.now();(0,h.logDebug)("Standardized br elements:",{removed:O,processingTime:`${(B-I).toFixed(2)}ms`})}function k(C,O){let I=0;const N=Date.now();let M=!0;function R(w){var T;for(const L of w.childNodes)if((0,h.isTextNode)(L)&&(!((T=L.textContent)===null||T===void 0)&&T.trim())||(0,h.isElement)(L)&&l.INLINE_ELEMENTS.has(L.nodeName.toLowerCase()))return!0;return!1}const B=w=>{const T=w.tagName.toLowerCase();if(l.PRESERVE_ELEMENTS.has(T))return!0;const L=w.getAttribute("role");if(L&&["article","main","navigation","banner","contentinfo"].includes(L))return!0;const _=w.className;return typeof _=="string"&&_.toLowerCase().match(/(?:article|main|content|footnote|reference|bibliography)/)?!0:!!Array.from(w.children).some(W=>l.PRESERVE_ELEMENTS.has(W.tagName.toLowerCase())||W.getAttribute("role")==="article"||W.className&&typeof W.className=="string"&&W.className.toLowerCase().match(/(?:article|main|content|footnote|reference|bibliography)/))},F=w=>{var T;if(R(w))return!1;if(!(!((T=w.textContent)===null||T===void 0)&&T.trim()))return!0;const L=Array.from(w.children);if(L.length===0||L.every($=>{const D=$.tagName.toLowerCase();return l.BLOCK_ELEMENTS.includes(D)||D==="p"||D==="h1"||D==="h2"||D==="h3"||D==="h4"||D==="h5"||D==="h6"||D==="ul"||D==="ol"||D==="pre"||D==="blockquote"||D==="figure"}))return!0;const _=w.className.toLowerCase();return/(?:wrapper|container|layout|row|col|grid|flex|outer|inner|content-area)/i.test(_)||Array.from(w.childNodes).filter($=>{var D;return(0,h.isTextNode)($)&&((D=$.textContent)===null||D===void 0?void 0:D.trim())}).length===0?!0:!(!(L.length>0)||L.some($=>{const D=$.tagName.toLowerCase();return l.INLINE_ELEMENTS.has(D)}))},z=w=>{var T,L;if(!w.isConnected||B(w))return!1;const _=w.tagName.toLowerCase();if(!l.ALLOWED_EMPTY_ELEMENTS.has(_)&&!w.children.length&&!(!((T=w.textContent)===null||T===void 0)&&T.trim()))return w.remove(),I++,!0;if(w.parentElement===C){const U=Array.from(w.children);if(U.length>0&&!U.some(G=>{const Q=G.tagName.toLowerCase();return l.INLINE_ELEMENTS.has(Q)})){const G=O.createDocumentFragment();for(;w.firstChild;)G.appendChild(w.firstChild);return w.replaceWith(G),I++,!0}}if(F(w)){if(!Array.from(w.children).some(G=>{const Q=G.tagName.toLowerCase();return l.INLINE_ELEMENTS.has(Q)})){const G=O.createDocumentFragment();for(;w.firstChild;)G.appendChild(w.firstChild);return w.replaceWith(G),I++,!0}const U=O.createDocumentFragment();for(;w.firstChild;)U.appendChild(w.firstChild);return w.replaceWith(U),I++,!0}const W=Array.from(w.childNodes);if(W.length>0&&W.every(U=>(0,h.isTextNode)(U)||(0,h.isElement)(U)&&l.INLINE_ELEMENTS.has(U.nodeName.toLowerCase()))&&(!((L=w.textContent)===null||L===void 0)&&L.trim())){const U=O.createElement("p");for(;w.firstChild;)U.appendChild(w.firstChild);return w.replaceWith(U),I++,!0}if(w.children.length===1){const U=w.firstElementChild,G=U.tagName.toLowerCase();if(l.BLOCK_ELEMENTS.includes(G)&&!B(U))return w.replaceWith(U),I++,!0}let $=0,D=w.parentElement;for(;D;){const U=D.tagName.toLowerCase();l.BLOCK_ELEMENTS.includes(U)&&$++,D=D.parentElement}if($>0&&!R(w)){const U=O.createDocumentFragment();for(;w.firstChild;)U.appendChild(w.firstChild);return w.replaceWith(U),I++,!0}return!1},V=()=>{const w=Array.from(C.children).filter(L=>l.BLOCK_ELEMENTS.includes(L.tagName.toLowerCase()));let T=!1;return w.forEach(L=>{z(L)&&(T=!0)}),T},J=()=>{const w=Array.from(C.querySelectorAll(l.BLOCK_ELEMENTS.join(","))).sort((L,_)=>{const W=$=>{let D=0,U=$.parentElement;for(;U;){const G=U.tagName.toLowerCase();l.BLOCK_ELEMENTS.includes(G)&&D++,U=U.parentElement}return D};return W(_)-W(L)});let T=!1;return w.forEach(L=>{z(L)&&(T=!0)}),T},q=()=>{const w=Array.from(C.querySelectorAll(l.BLOCK_ELEMENTS.join(",")));let T=!1;return w.forEach(L=>{const _=Array.from(L.children);if(_.length>0&&_.every(W=>W.tagName.toLowerCase()==="p")||!B(L)&&F(L)){const W=O.createDocumentFragment();for(;L.firstChild;)W.appendChild(L.firstChild);L.replaceWith(W),I++,T=!0}}),T};do M=!1,V()&&(M=!0),J()&&(M=!0),q()&&(M=!0);while(M);const P=Date.now();(0,h.logDebug)("Flattened wrapper elements:",{count:I,processingTime:`${(P-N).toFixed(2)}ms`})}},864:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.headingRules=void 0;const l=c(640);a.headingRules=[{selector:"h1, h2, h3, h4, h5, h6",element:"keep",transform:d=>{var p;const u=d.ownerDocument;if(!u)return d;const g=u.createElement(d.tagName);Array.from(d.attributes).forEach(f=>{l.ALLOWED_ATTRIBUTES.has(f.name)&&g.setAttribute(f.name,f.value)});const m=d.cloneNode(!0),h=new Map;Array.from(m.querySelectorAll("*")).forEach(f=>{var v,S,k,C,O,I;let N=!1;if(f.tagName.toLowerCase()==="a"){const M=f.getAttribute("href");(M!=null&&M.includes("#")||M!=null&&M.startsWith("#"))&&(h.set(f,((v=f.textContent)===null||v===void 0?void 0:v.trim())||""),N=!0)}if(f.classList.contains("anchor")&&(h.set(f,((S=f.textContent)===null||S===void 0?void 0:S.trim())||""),N=!0),f.tagName.toLowerCase()==="button"&&(N=!0),(f.tagName.toLowerCase()==="span"||f.tagName.toLowerCase()==="div")&&f.querySelector('a[href^="#"]')){const M=f.querySelector('a[href^="#"]');M&&h.set(f,((k=M.textContent)===null||k===void 0?void 0:k.trim())||""),N=!0}if(N){const M=f.parentElement;M&&M!==m&&((C=M.textContent)===null||C===void 0?void 0:C.trim())===((O=f.textContent)===null||O===void 0?void 0:O.trim())&&h.set(M,((I=f.textContent)===null||I===void 0?void 0:I.trim())||"")}}),Array.from(m.querySelectorAll("*")).filter(f=>{if(f.tagName.toLowerCase()==="a"){const v=f.getAttribute("href");return(v==null?void 0:v.includes("#"))||(v==null?void 0:v.startsWith("#"))}return!!f.classList.contains("anchor")||f.tagName.toLowerCase()==="button"||!(f.tagName.toLowerCase()!=="span"&&f.tagName.toLowerCase()!=="div"||!f.querySelector('a[href^="#"]'))}).forEach(f=>f.remove());let b=((p=m.textContent)===null||p===void 0?void 0:p.trim())||"";return!b&&h.size>0&&(b=Array.from(h.values())[0]),g.textContent=b,g}}]},917:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ExtractorRegistry=void 0;const l=c(959),d=c(248),p=c(258),u=c(458),g=c(632),m=c(397),h=c(20),b=c(732),f=c(588);class v{static initialize(){this.register({patterns:["twitter.com",/\/x\.com\/.*/],extractor:d.TwitterExtractor}),this.register({patterns:["reddit.com","old.reddit.com","new.reddit.com",/^https:\/\/[^\/]+\.reddit\.com/],extractor:l.RedditExtractor}),this.register({patterns:["youtube.com","youtu.be",/youtube\.com\/watch\?v=.*/,/youtu\.be\/.*/],extractor:p.YoutubeExtractor}),this.register({patterns:[/news\.ycombinator\.com\/item\?id=.*/],extractor:u.HackerNewsExtractor}),this.register({patterns:[/^https?:\/\/chatgpt\.com\/(c|share)\/.*/],extractor:g.ChatGPTExtractor}),this.register({patterns:[/^https?:\/\/claude\.ai\/(chat|share)\/.*/],extractor:m.ClaudeExtractor}),this.register({patterns:[/^https?:\/\/grok\.com\/(chat|share)(\/.*)?$/],extractor:h.GrokExtractor}),this.register({patterns:[/^https?:\/\/gemini\.google\.com\/app\/.*/],extractor:b.GeminiExtractor}),this.register({patterns:["github.com",/^https?:\/\/github\.com\/.*/],extractor:f.GitHubExtractor})}static register(k){this.mappings.push(k)}static findExtractor(k,C,O){try{const I=new URL(C).hostname;if(this.domainCache.has(I)){const N=this.domainCache.get(I);return N?new N(k,C,O):null}for(const{patterns:N,extractor:M}of this.mappings)if(N.some(R=>R instanceof RegExp?R.test(C):I.includes(R)))return this.domainCache.set(I,M),new M(k,C,O);return this.domainCache.set(I,null),null}catch{return null}}static clearCache(){this.domainCache.clear()}}a.ExtractorRegistry=v,v.mappings=[],v.domainCache=new Map,v.initialize()},959:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.RedditExtractor=void 0;const l=c(279);class d extends l.BaseExtractor{constructor(u,g){super(u,g),this.shredditPost=u.querySelector("shreddit-post")}canExtract(){return!!this.shredditPost}extract(){var u,g;const m=this.getPostContent(),h=this.extractComments(),b=this.createContentHtml(m,h),f=((g=(u=this.document.querySelector("h1"))===null||u===void 0?void 0:u.textContent)===null||g===void 0?void 0:g.trim())||"",v=this.getSubreddit(),S=this.getPostAuthor(),k=this.createDescription(m);return{content:b,contentHtml:b,extractedContent:{postId:this.getPostId(),subreddit:v,postAuthor:S},variables:{title:f,author:S,site:`r/${v}`,description:k}}}getPostContent(){var u,g,m,h;return(((g=(u=this.shredditPost)===null||u===void 0?void 0:u.querySelector('[slot="text-body"]'))===null||g===void 0?void 0:g.innerHTML)||"")+(((h=(m=this.shredditPost)===null||m===void 0?void 0:m.querySelector("#post-image"))===null||h===void 0?void 0:h.outerHTML)||"")}createContentHtml(u,g){return`
			<div class="reddit-post">
				<div class="post-content">
					${u}
				</div>
			</div>
			${g?`
				<hr>
				<h2>Comments</h2>
				<div class="reddit-comments">
					${g}
				</div>
			`:""}
		`.trim()}extractComments(){const u=Array.from(this.document.querySelectorAll("shreddit-comment"));return this.processComments(u)}getPostId(){const u=this.url.match(/comments\/([a-zA-Z0-9]+)/);return(u==null?void 0:u[1])||""}getSubreddit(){const u=this.url.match(/\/r\/([^/]+)/);return(u==null?void 0:u[1])||""}getPostAuthor(){var u;return((u=this.shredditPost)===null||u===void 0?void 0:u.getAttribute("author"))||""}createDescription(u){var g;if(!u)return"";const m=document.createElement("div");return m.innerHTML=u,((g=m.textContent)===null||g===void 0?void 0:g.trim().slice(0,140).replace(/\s+/g," "))||""}processComments(u){var g;let m="",h=-1,b=[];for(const f of u){const v=parseInt(f.getAttribute("depth")||"0"),S=f.getAttribute("author")||"",k=f.getAttribute("score")||"0",C=f.getAttribute("permalink")||"",O=((g=f.querySelector('[slot="comment"]'))===null||g===void 0?void 0:g.innerHTML)||"",I=f.querySelector("faceplate-timeago"),N=(I==null?void 0:I.getAttribute("ts"))||"",M=N?new Date(N).toISOString().split("T")[0]:"";if(v===0){for(;b.length>0;)m+="</blockquote>",b.pop();m+="<blockquote>",b=[0],h=0}else if(v<h)for(;b.length>0&&b[b.length-1]>=v;)m+="</blockquote>",b.pop();else v>h&&(m+="<blockquote>",b.push(v));m+=`<div class="comment">
	<div class="comment-metadata">
		<span class="comment-author"><strong>${S}</strong></span> •
		<a href="https://reddit.com${C}" class="comment-link">${k} points</a> •
		<span class="comment-date">${M}</span>
	</div>
	<div class="comment-content">${O}</div>
</div>`,h=v}for(;b.length>0;)m+="</blockquote>",b.pop();return m}}a.RedditExtractor=d},968:(o,a,c)=>{Object.defineProperty(a,"__esModule",{value:!0}),a.ContentScorer=void 0;const l=c(640),d=["admonition","article","content","entry","image","img","font","figure","figcaption","pre","main","post","story","table"],p=["advertisement","all rights reserved","banner","cookie","comments","copyright","follow me","follow us","footer","header","homepage","login","menu","more articles","more like this","most read","nav","navigation","newsletter","newsletter","popular","privacy","recommended","register","related","responses","share","sidebar","sign in","sign up","signup","social","sponsored","subscribe","subscribe","terms","trending"],u=["ad","banner","cookie","copyright","footer","header","homepage","menu","nav","newsletter","popular","privacy","recommended","related","rights","share","sidebar","social","sponsored","subscribe","terms","trending","widget"];class g{constructor(h,b=!1){this.doc=h,this.debug=b}static scoreElement(h){let b=0;const f=h.textContent||"",v=f.split(/\s+/).length;b+=v,b+=10*h.getElementsByTagName("p").length,b-=5*(h.getElementsByTagName("a").length/(v||1)),b-=3*(h.getElementsByTagName("img").length/(v||1));try{const k=h.getAttribute("style")||"",C=h.getAttribute("align")||"";(k.includes("float: right")||k.includes("text-align: right")||C==="right")&&(b+=5)}catch{}/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i.test(f)&&(b+=10),/\b(?:by|written by|author:)\s+[A-Za-z\s]+\b/i.test(f)&&(b+=10);const S=h.className.toLowerCase();if((S.includes("content")||S.includes("article")||S.includes("post"))&&(b+=15),h.querySelector(l.FOOTNOTE_INLINE_REFERENCES)&&(b+=10),h.querySelector(l.FOOTNOTE_LIST_SELECTORS)&&(b+=10),b-=5*h.getElementsByTagName("table").length,h.tagName.toLowerCase()==="td"){const k=h.closest("table");if(k){const C=parseInt(k.getAttribute("width")||"0"),O=k.getAttribute("align")||"",I=k.className.toLowerCase();if(C>400||O==="center"||I.includes("content")||I.includes("article")){const N=Array.from(k.getElementsByTagName("td")),M=N.indexOf(h);M>0&&M<N.length-1&&(b+=10)}}}return b}static findBestElement(h,b=50){let f=null,v=0;return h.forEach(S=>{const k=this.scoreElement(S);k>v&&(v=k,f=S)}),v>b?f:null}static scoreAndRemove(h,b=!1){const f=Date.now();let v=0;const S=new Set;Array.from(h.querySelectorAll(l.BLOCK_ELEMENTS.join(","))).forEach(C=>{S.has(C)||g.isLikelyContent(C)||g.scoreNonContentBlock(C)<0&&(S.add(C),v++)}),S.forEach(C=>C.remove());const k=Date.now()}static isLikelyContent(h){const b=h.getAttribute("role");if(b&&["article","main","contentinfo"].includes(b))return!0;const f=h.className.toLowerCase(),v=h.id.toLowerCase();for(const C of d)if(f.includes(C)||v.includes(C))return!0;const S=(h.textContent||"").split(/\s+/).length,k=h.getElementsByTagName("p").length;return S>50&&k>1||S>100||S>30&&k>0}static scoreNonContentBlock(h){if(h.querySelector(l.FOOTNOTE_LIST_SELECTORS))return 0;let b=0;const f=h.textContent||"",v=f.split(/\s+/).length;if(v<3)return 0;for(const I of p)f.toLowerCase().includes(I)&&(b-=10);const S=h.getElementsByTagName("a").length;S/(v||1)>.5&&(b-=15);const k=h.getElementsByTagName("ul").length+h.getElementsByTagName("ol").length;k>0&&S>3*k&&(b-=10);const C=h.className.toLowerCase(),O=h.id.toLowerCase();for(const I of u)(C.includes(I)||O.includes(I))&&(b-=8);return b}}a.ContentScorer=g}},t={};function s(o){var a=t[o];if(a!==void 0)return a.exports;var c=t[o]={exports:{}};return e[o](c,c.exports,s),c.exports}var i={};return(()=>{var o=i;const a=s(628);o.default=a.Defuddle})(),i=i.default})())})(Pi);var aa=Pi.exports;const Rn=oa(aa);class ca{constructor(n,e,t,s){y(this,"plugin");y(this,"leaf");y(this,"webContents");y(this,"closeButtonEl");y(this,"backwardButtonEl");y(this,"forwardButtonEl");y(this,"inputEl");y(this,"searchBoxEl");y(this,"clicked");y(this,"onUnload",()=>this.unload());y(this,"onBackward",()=>this.backward());y(this,"onForward",()=>this.forward());y(this,"onSearch",n=>this.search(n));y(this,"onExist",n=>this.exist(n));this.leaf=n,this.webContents=e,this.plugin=t,this.onload()}onload(){const n=this.leaf.view.contentEl;this.searchBoxEl=n.createDiv({cls:"wb-search-box"}),this.inputEl=this.searchBoxEl.createEl("input",{type:"text",placeholder:"",cls:"wb-search-input"});const e=this.searchBoxEl.createDiv({cls:"wb-search-button-group"});this.backwardButtonEl=e.createDiv({cls:"wb-search-button search-forward"}),this.forwardButtonEl=e.createDiv({cls:"wb-search-button search-backward"}),this.closeButtonEl=e.createDiv({cls:"wb-search-button search-close"}),this.closeButtonEl.addEventListener("click",this.onUnload),this.backwardButtonEl.addEventListener("click",this.onBackward),this.forwardButtonEl.addEventListener("click",this.onForward),this.inputEl.addEventListener("keyup",this.onSearch),this.inputEl.addEventListener("keyup",this.onExist),A.setIcon(this.closeButtonEl,"x"),A.setIcon(this.backwardButtonEl,"arrow-up"),A.setIcon(this.forwardButtonEl,"arrow-down"),this.inputEl.focus()}search(n){n.preventDefault(),this.inputEl.value!==""&&(n.key==="Enter"&&!n.shiftKey&&this.forward(),n.key==="Enter"&&n.shiftKey&&this.backward())}exist(n){n.preventDefault(),n.key==="Escape"&&this.unload()}backward(){this.inputEl.value!==""&&(this.clicked?this.webContents.findInPage(this.inputEl.value,{forward:!1,findNext:!1}):this.webContents.findInPage(this.inputEl.value,{forward:!1,findNext:!0}),this.clicked=!0)}forward(){this.inputEl.value!==""&&(this.clicked?this.webContents.findInPage(this.inputEl.value,{forward:!0,findNext:!1}):this.webContents.findInPage(this.inputEl.value,{forward:!0,findNext:!0}),this.clicked=!0)}unload(){this.webContents.stopFindInPage("clearSelection"),this.inputEl.value="",this.closeButtonEl.removeEventListener("click",this.onUnload),this.backwardButtonEl.removeEventListener("click",this.onBackward),this.forwardButtonEl.removeEventListener("click",this.onForward),this.inputEl.removeEventListener("keyup",this.onSearch),this.inputEl.removeEventListener("keyup",this.onExist),this.searchBoxEl.detach()}}const _i={extensions:[],autoUpdate:!1,compatibilityEnabled:!0,pinned:null,autoReloadPages:!1,debug:!1},la=2,da={"notice.prefix":"Chrome extensions: ","toolbar.extensions":"Chrome extensions","common.ok":"OK","common.cancel":"Cancel","common.close":"Close","common.loading":"Loading…","common.more":"More actions","common.separator":", ","source.store":"Chrome Web Store","source.local":"Imported from disk","command.manage":"Manage extensions","command.openStore":"Open Chrome Web Store","command.installFromUrl":"Install extension from store link","command.installLocal":"Install extension from local file or folder","command.showMenu":"Show extensions menu for current page","command.reloadPages":"Reload web pages","unavailable.oldElectron":"Requires Electron {min} or later (current: {current}). Electron is updated with the Obsidian installer: download and reinstall the latest Obsidian from obsidian.md.","unavailable.unknownVersion":"unknown","unavailable.noRemote":"This version of Obsidian does not provide @electron/remote, so extensions cannot be loaded.","unavailable.conflict":"Disable the Chrome Extensions Bridge plugin first: extensions are now managed by Surfing.","unavailable.isolated":'Surfing has session isolation turned on, so every tab uses its own session and extensions cannot be loaded. Turn off session isolation, or enable the core plugin "Web viewer".',"unavailable.notStarted":"Extensions have not started yet","menu.openPanel":"Open extension panel","menu.options":"Options","menu.pin":"Pin to toolbar","menu.unpin":"Unpin from toolbar","menu.enable":"Enable","menu.disable":"Disable","menu.checkUpdate":"Check for updates","menu.viewInStore":"View in Chrome Web Store","menu.diagnoseWorker":"Diagnose background (log to console)","menu.uninstall":"Uninstall…","uninstall.title":'Uninstall "{name}"?',"uninstall.message":"This deletes the extension files Surfing manages and the extension's data in Obsidian.","uninstall.confirm":"Uninstall","notice.needsWebTab":"{name} must be used in a web page tab","notice.noPanel":"{name} has no panel to open","notice.notConnected":"{name} is not connected","notice.blockedOpen":'"{extension}" blocked opening {host}',"notice.imported":"Imported {count} extensions","notice.diagnosticsLogged":"Diagnostics written to the developer console","notice.extensionDiagnosticsLogged":"Extension diagnostics written to the developer console","notice.installBusy":"This extension is already being installed or checked for updates. Please wait.","notice.downloading":"Chrome extensions: downloading from Chrome Web Store…","notice.upToDate":"{name} is already up to date ({version})","notice.noStoreExtensions":"No extensions from Chrome Web Store to check","notice.updateCheckDone":"Update check complete","changes.added":"Added {name}","changes.updated":"Updated {name}","changes.enabled":"Enabled {name}","changes.disabled":"Disabled {name}","changes.uninstalled":"Uninstalled {name}","changes.compatSwitched":"Compatibility layer switched","changes.compatSwitchedWithErrors":"Compatibility layer switched; some extensions failed (see console)","changes.reloaded":"{message}, web pages reloaded","changes.reloadToApply":"{message}. Reload web pages to apply","changes.reloadToApplyNotice":"Chrome extensions: {message}. Reload web pages to apply.","installUrl.title":"Install from Chrome Web Store link","installUrl.desc":"Paste the link to the extension's details page, or its 32-character extension ID.","installUrl.invalid":"Enter a valid Chrome Web Store extension link or 32-character extension ID","installLocal.title":"Import local extension","installLocal.placeholder":"C:\\extensions\\my-extension or …\\extension.crx","installLocal.desc":"The full path to an unpacked extension folder, or to a .crx or .zip file.","install.title":'Add "{name}"?',"install.version":"Version {version} · {source}","install.updateTo":"Update to {version}","install.localSource":"Local: {path}","install.allSites":"Read and change your data on all websites you visit","install.sites":"Read and change your data on these sites: {sites}{more}","install.sitesMore":" and more ({count} sites)","install.apis":"Use these APIs: {apis}","install.noPermissions":"No special permissions required","install.warning":"Extensions can read and change the content of web pages they have access to. Obsidian is not a full Chrome, so some extension features may not work. Only install extensions you trust.","install.confirm":"Add extension","error.notExtensionFolder":"Not a valid Chrome extension folder","error.folderSymlink":"The extension folder contains a symbolic link; import refused: {path}","error.folderTooManyFiles":"The extension folder contains too many files","error.folderUnsupportedFile":"The extension folder contains an unsupported file type: {path}","error.folderExternalLink":"The extension folder contains a link to outside the folder; import refused: {path}","error.noRemoteSession":"Obsidian has not enabled the @electron/remote Session API","error.notLoaded":"The extension is not enabled or not loaded in {target}","error.noPopup":"This extension has no popup","error.noOptions":"This extension has no options page","error.noPermission":"The extension does not have the {permission} permission","error.invalidUrl":"Invalid URL","error.openTooOften":"The extension is opening pages too often and has been temporarily blocked","error.openOwnPagesOnly":"An extension can only open its own pages","error.cannotOpenScheme":"Obsidian cannot open this kind of URL: {protocol}","error.extensionNotFound":"Extension not found","error.unsupportedRequest":"Unsupported request: {method}","error.invalidExtensionDir":"Invalid extension folder","error.invalidUserScript":"Invalid user script file","error.userScriptTooLarge":"User script file is too large","error.userScriptChecksum":"User script file failed verification","error.extensionDirMissing":"Extension folder is missing","error.invalidStoreId":"Invalid extension ID","error.signedIdMismatch":"Extension signature ID verification failed","error.pathNotFound":"File or folder does not exist: {path}","error.unsupportedArchive":"Only .zip and .crx files or unpacked extension folders are supported","error.invalidManagedKey":"Invalid managed folder ID","error.loadedIdMismatch":"The loaded extension ID ({loaded}) does not match the store ID ({expected})","error.refuseDeleteOutside":"Refused to delete a path outside the managed folder","error.probeMissing":"Compatibility probe files are missing. Reinstall the full plugin.","error.workerRuntimeUnavailable":"Service Worker runtime API is unavailable","error.invalidExtensionId":"Invalid extension ID","error.invalidChromeExtensionId":"Invalid Chrome extension ID","error.notManaged":"This extension is not managed by Surfing","error.notLoadedInSession":"The extension is not loaded in the session","error.noStartWorker":"This version of Electron does not provide startWorkerForScope","error.invalidFilePath":"The extension contains an invalid file path: {path}","error.pathOutside":"Extension file path points outside the extension","error.pathSymlink":"The extension path contains a symbolic link","error.reservedFile":"The extension uses a reserved file name: {name}","error.workerEntryNotFile":"The original MV3 worker entry is not a file","error.reservedWorkerFile":"The extension contains a reserved worker file name","error.reservedHtmlBackup":"The extension contains a reserved HTML backup file name","error.invalidPopupPath":"Invalid extension popup path","error.pageNotOwn":"An extension page must belong to the extension's own ID","warning.pageNotFound":"Extension page not found: {page}","warning.skipNonHtml":"Skipped non-HTML page: {page}","store.unsafeRedirect":"CRX download redirect is unsafe or redirected too many times","store.http":"Chrome Web Store download returned HTTP {status}","store.tooLarge":"CRX exceeds the 80 MB limit","store.notCrx":"The server did not return a CRX file (Google's download service may be unreachable)","store.timeout":"Connection to Chrome Web Store timed out","store.install":"Install to Obsidian","store.installed":"Installed","store.installedCheck":"Installed · Check for updates","crx.protobufIncomplete":"CRX protobuf structure is incomplete","crx.varintTooLong":"CRX protobuf varint exceeds the limit","crx.protobufLength":"CRX protobuf length is invalid","crx.protobufTruncated":"CRX protobuf is truncated","crx.protobufWireType":"CRX protobuf field type is not supported","crx.storeNotCrx":"The store download is not a CRX file","crx.headerIncomplete":"CRX header is incomplete","crx.storeNeedsCrx3":"Store extensions must be in CRX3 format","crx.crx2Length":"CRX2 length is invalid","crx.crx2KeyMismatch":"CRX2 public key does not match the store ID","crx.crx2Signature":"CRX2 signature is invalid; installation refused","crx.version":"Only CRX2 and CRX3 are supported","crx.crx3HeaderSize":"CRX3 header size is invalid","crx.crx3NoSignedData":"CRX3 is missing signed data","crx.crx3SignedIdFormat":"CRX3 signed ID has an invalid format","crx.crx3SignedIdMismatch":"CRX3 signed data does not match the store ID","crx.crx3NoMatchingKey":"CRX3 has no public key matching the extension ID; installation refused","crx.crx3DeveloperSignature":"CRX3 developer signature is invalid; installation refused","crx.crx3StoreSignature":"CRX3 lacks a valid Chrome Web Store signature; installation refused","zip.invalidPath":"ZIP contains an invalid path","zip.absolutePath":"ZIP contains an absolute path","zip.pathTraversal":"ZIP path points outside the archive","zip.invalidName":"ZIP contains an invalid file name","zip.sizeOrIncomplete":"ZIP is too large or incomplete","zip.noCentralDirectory":"ZIP central directory not found","zip.tooManyFiles":"ZIP has too many files, or is ZIP64 (not supported)","zip.centralOutOfBounds":"ZIP central directory is out of bounds","zip.centralCorrupt":"ZIP central directory is corrupt","zip.nameOutOfBounds":"ZIP file name is out of bounds","zip.encrypted":"Encrypted ZIP files are not supported","zip.symlink":"ZIP symbolic links and device files are not allowed","zip.tooLarge":"ZIP unpacked size exceeds the safety limit","zip.outOfBounds":"ZIP entry points outside the destination","zip.localHeaderCorrupt":"ZIP local file header is corrupt","zip.dataOutOfBounds":"ZIP compressed data is out of bounds","zip.unsupportedMethod":"ZIP compression method not supported: {method}","zip.checksum":"ZIP file size or CRC check failed: {name}","archive.noManifest":"manifest.json not found at the root of the archive","archive.tooLarge":"Extension archive exceeds 80 MB","archive.invalidManifest":"Invalid Chrome extension manifest","archive.keyMismatch":"manifest.key does not match the CRX signing public key","list.add":"Add extensions","list.addDesc":"Install from Chrome Web Store, or import a local extension folder, .crx or .zip.","list.installFromLink":"Install from link","list.importLocal":"Import from disk","list.empty":"No Chrome extensions installed yet.","list.pinned":"Pinned to toolbar","list.options":"Extension options","panel.title":"Extensions","panel.empty":"No extensions installed yet. Add some from Chrome Web Store.","panel.disabledBadge":"Disabled","panel.disabled":"Extension is disabled","panel.openOptions":"Open extension options","panel.noPanel":"This extension has no panel","panel.addFromStore":"Add from Chrome Web Store","manager.scope":"Extensions only act on web pages opened in {target} in this vault.","manager.settings":"Settings and diagnostics","page.title":"Extension page","page.reload":"Reload","page.notAvailable":"This extension is not installed or not enabled.","page.loadFailed":"The extension page failed to load ({code}: {description}).","popover.panelLabel":"{name} extension panel","popover.optionsLabel":"{name} options","popover.optionsTitle":"{name} · Options","popover.diagnose":"Log diagnostics to console","settings.status.webviewer":'Extensions run in {target}. The core plugin "Web viewer" is enabled: external links open in Web Viewer, and extensions only act on Web Viewer tabs.',"settings.status.surfing":'Extensions run in {target}. The core plugin "Web viewer" is disabled: extensions act on Surfing tabs.',"settings.legacy.name":"Import from Chrome Extensions Bridge","settings.legacy.desc":"Found {count} extensions installed by the Chrome Extensions Bridge plugin. Once imported, Surfing manages them and you can uninstall that plugin.","settings.legacy.disableFirst":" Disable Chrome Extensions Bridge before importing.","settings.legacy.import":"Import","settings.installed":"Installed extensions","settings.toolbar":"Toolbar","settings.toolbar.desc":"Each browser tab has a puzzle button in its header that lists all extensions. Pinned extensions also get their own button; right-click an extension button to open its menu.","settings.resetPinned":"Reset pinned extensions","settings.resetPinned.desc":"Restore the default: pin the first two extensions that have a panel.","settings.reset":"Reset","settings.behavior":"Behavior","settings.autoReload":"Reload web pages after extension changes","settings.autoReload.desc":'Reload open web pages automatically after installing, enabling, disabling or uninstalling an extension. When off, the notice offers a "Reload web pages" button instead (reloading may discard unsubmitted input on the page).',"settings.autoUpdate":"Check for extension updates automatically","settings.autoUpdate.desc":"Checks Chrome Web Store every 6 hours. A new version that requests new permissions still asks for your consent first.","settings.checkNow":"Check now","settings.checkNow.desc":"Look for new versions of the installed extensions right away.","settings.status.name":"Where extensions run","settings.output":"Diagnostic result","settings.output.desc":"The output of the tools above.","settings.compatibility":"Compatibility","settings.compat":"Chrome API compatibility layer","settings.compat.desc":"Adds Chrome APIs that Obsidian (Electron) lacks: webNavigation events, context menus, opening new pages in Obsidian, storage.sync/session, alarms and more. Only changes the copies of extensions that Surfing manages; turning it off restores the original files.","settings.advanced":"Advanced","settings.debug":"Debug mode","settings.debug.desc":"Show diagnostic buttons in extension panels and menus, and log detailed extension channel messages to the console.","settings.diagnostics":"Diagnostic tools","settings.checking":"Checking…","settings.failed":"Failed: {error}","settings.state":"Current status","settings.state.desc":"Loaded extensions, service workers, the compatibility layer report and extension channels.","settings.check":"Check","settings.probe":"MV3 compatibility probe","settings.probe.desc":"Loads a test extension and checks popup ↔ worker messaging, storage.local and tabs.query.","settings.run":"Run","settings.wake":"Wake background: {name}","settings.wake.desc":"Starts the extension's service worker and shows its recent logs.","settings.wakeButton":"Wake"},ua={"notice.prefix":"Chrome 扩展：","toolbar.extensions":"Chrome 扩展","common.ok":"确定","common.cancel":"取消","common.close":"关闭","common.loading":"正在加载…","common.more":"更多操作","common.separator":"、","source.store":"Chrome 应用商店","source.local":"本地导入","command.manage":"管理扩展","command.openStore":"打开 Chrome 应用商店","command.installFromUrl":"从商店链接安装扩展","command.installLocal":"从本地文件或文件夹安装扩展","command.showMenu":"显示当前网页的扩展菜单","command.reloadPages":"刷新网页","unavailable.oldElectron":"需要 Electron {min} 或更高版本（当前 {current}）。Electron 随 Obsidian 安装程序更新：请从 obsidian.md 下载并重新安装最新版 Obsidian。","unavailable.unknownVersion":"未知","unavailable.noRemote":"当前 Obsidian 未提供 @electron/remote，无法加载扩展。","unavailable.conflict":"请先停用 Chrome Extensions Bridge 插件：扩展现在由 Surfing 管理。","unavailable.isolated":"Surfing 开启了会话隔离，每个标签页使用独立会话，无法加载扩展。请关闭会话隔离，或启用核心插件“网页浏览器”。","unavailable.notStarted":"扩展尚未启动","menu.openPanel":"打开扩展面板","menu.options":"选项","menu.pin":"固定到工具栏","menu.unpin":"从工具栏取消固定","menu.enable":"启用","menu.disable":"停用","menu.checkUpdate":"检查更新","menu.viewInStore":"在 Chrome 应用商店中查看","menu.diagnoseWorker":"诊断后台（输出到控制台）","menu.uninstall":"卸载…","uninstall.title":"卸载「{name}」？","uninstall.message":"将删除插件托管的扩展文件和它在 Obsidian 中的数据。","uninstall.confirm":"卸载","notice.needsWebTab":"{name} 需要在网页标签中使用","notice.noPanel":"{name} 没有可打开的面板","notice.notConnected":"{name} 未连接","notice.blockedOpen":"「{extension}」阻止了打开 {host}","notice.imported":"已导入 {count} 个扩展","notice.diagnosticsLogged":"诊断信息已输出到开发者控制台","notice.extensionDiagnosticsLogged":"扩展诊断信息已输出到开发者控制台","notice.installBusy":"这个扩展正在安装或检查更新，请稍候","notice.downloading":"Chrome 扩展：正在从应用商店下载…","notice.upToDate":"{name} 已是最新版本（{version}）","notice.noStoreExtensions":"没有来自应用商店的扩展需要检查","notice.updateCheckDone":"更新检查完成","changes.added":"已添加 {name}","changes.updated":"已更新 {name}","changes.enabled":"已启用 {name}","changes.disabled":"已停用 {name}","changes.uninstalled":"已卸载 {name}","changes.compatSwitched":"兼容层已切换","changes.compatSwitchedWithErrors":"兼容层已切换，部分扩展失败（见控制台）","changes.reloaded":"{message}，已刷新网页","changes.reloadToApply":"{message}。刷新网页后生效","changes.reloadToApplyNotice":"Chrome 扩展：{message}。刷新网页后生效。","installUrl.title":"从 Chrome 应用商店链接安装","installUrl.desc":"粘贴扩展详情页的链接，或 32 位扩展 ID。","installUrl.invalid":"请输入有效的 Chrome 应用商店扩展链接或 32 位扩展 ID","installLocal.title":"导入本地扩展","installLocal.placeholder":"C:\\extensions\\my-extension 或 …\\extension.crx","installLocal.desc":"支持已解压的扩展文件夹、.crx 或 .zip 文件的完整路径。","install.title":"添加「{name}」？","install.version":"版本 {version} · {source}","install.updateTo":"更新到 {version}","install.localSource":"本地：{path}","install.allSites":"读取和更改你访问的所有网站上的数据","install.sites":"读取和更改以下网站上的数据：{sites}{more}","install.sitesMore":" 等 {count} 个","install.apis":"使用以下 API：{apis}","install.noPermissions":"不需要特殊权限","install.warning":"扩展可以读取和修改获授权网页的内容。Obsidian 并非完整的 Chrome，部分扩展功能可能无法使用；请只安装可信的扩展。","install.confirm":"添加扩展","error.notExtensionFolder":"不是有效的 Chrome 扩展目录","error.folderSymlink":"扩展文件夹包含符号链接，已拒绝导入：{path}","error.folderTooManyFiles":"扩展文件夹的文件过多","error.folderUnsupportedFile":"扩展文件夹包含不支持的文件类型：{path}","error.folderExternalLink":"扩展文件夹包含指向外部的链接，已拒绝导入：{path}","error.noRemoteSession":"Obsidian 没有启用 @electron/remote Session API","error.notLoaded":"扩展未启用或未加载到 {target}","error.noPopup":"此扩展没有弹出面板","error.noOptions":"此扩展没有选项页面","error.noPermission":"扩展没有 {permission} 权限","error.invalidUrl":"无效的网址","error.openTooOften":"扩展打开页面过于频繁，已暂时阻止","error.openOwnPagesOnly":"扩展只能打开自身的页面","error.cannotOpenScheme":"Obsidian 不能打开这种网址：{protocol}","error.extensionNotFound":"找不到扩展","error.unsupportedRequest":"不支持的请求：{method}","error.invalidExtensionDir":"无效的扩展目录","error.invalidUserScript":"无效的用户脚本文件","error.userScriptTooLarge":"用户脚本文件过大","error.userScriptChecksum":"用户脚本文件校验失败","error.extensionDirMissing":"扩展目录缺失","error.invalidStoreId":"扩展 ID 无效","error.signedIdMismatch":"扩展签名 ID 校验失败","error.pathNotFound":"文件或文件夹不存在：{path}","error.unsupportedArchive":"只支持 .zip、.crx 或已解压的扩展文件夹","error.invalidManagedKey":"无效的托管目录标识","error.loadedIdMismatch":"扩展加载后的 ID ({loaded}) 与商店 ID ({expected}) 不匹配","error.refuseDeleteOutside":"拒绝删除托管目录之外的路径","error.probeMissing":"兼容探针文件缺失，请重新安装完整版插件","error.workerRuntimeUnavailable":"Service Worker 运行时接口不可用","error.invalidExtensionId":"无效的扩展 ID","error.invalidChromeExtensionId":"无效的 Chrome 扩展 ID","error.notManaged":"该扩展不由 Surfing 管理","error.notLoadedInSession":"扩展未加载到 Session","error.noStartWorker":"当前 Electron 没有提供 startWorkerForScope","error.invalidFilePath":"扩展内包含无效的文件路径: {path}","error.pathOutside":"扩展文件路径越界","error.pathSymlink":"扩展路径包含符号链接","error.reservedFile":"扩展占用了预留文件名：{name}","error.workerEntryNotFile":"MV3 Worker 原始入口不是文件","error.reservedWorkerFile":"扩展包含预留的 Worker 文件名","error.reservedHtmlBackup":"扩展包含预留的 HTML 备份文件名","error.invalidPopupPath":"扩展 Popup 路径无效","error.pageNotOwn":"扩展页面必须属于自身 ID","warning.pageNotFound":"找不到扩展页面: {page}","warning.skipNonHtml":"跳过非 HTML 页面: {page}","store.unsafeRedirect":"CRX 下载重定向不安全或次数过多","store.http":"Chrome Web Store 下载返回 HTTP {status}","store.tooLarge":"CRX 超过 80 MB 限制","store.notCrx":"服务器返回的不是 CRX 文件（可能无法访问谷歌下载服务）","store.timeout":"连接 Chrome Web Store 超时","store.install":"安装到 Obsidian","store.installed":"已安装","store.installedCheck":"已安装 · 检查更新","crx.protobufIncomplete":"CRX protobuf 结构不完整","crx.varintTooLong":"CRX protobuf varint 超出限制","crx.protobufLength":"CRX protobuf 长度无效","crx.protobufTruncated":"CRX protobuf 截断","crx.protobufWireType":"CRX protobuf 字段类型不受支持","crx.storeNotCrx":"商店下载的不是 CRX 文件","crx.headerIncomplete":"CRX 头不完整","crx.storeNeedsCrx3":"商店扩展必须是 CRX3 格式","crx.crx2Length":"CRX2 长度无效","crx.crx2KeyMismatch":"CRX2 公钥与商店 ID 不匹配","crx.crx2Signature":"CRX2 签名无效，已拒绝安装","crx.version":"仅支持 CRX2/CRX3","crx.crx3HeaderSize":"CRX3 头大小无效","crx.crx3NoSignedData":"CRX3 缺少签名数据","crx.crx3SignedIdFormat":"CRX3 签名 ID 格式不正确","crx.crx3SignedIdMismatch":"CRX3 签名数据与商店 ID 不匹配","crx.crx3NoMatchingKey":"CRX3 未找到与扩展 ID 匹配的公钥，已拒绝安装","crx.crx3DeveloperSignature":"CRX3 开发者签名无效，已拒绝安装","crx.crx3StoreSignature":"CRX3 缺少有效的 Chrome 应用商店签名，已拒绝安装","zip.invalidPath":"ZIP 含无效路径","zip.absolutePath":"ZIP 含绝对路径","zip.pathTraversal":"ZIP 路径越界","zip.invalidName":"ZIP 含无效文件名","zip.sizeOrIncomplete":"ZIP 太大或不完整","zip.noCentralDirectory":"ZIP 找不到中央目录","zip.tooManyFiles":"ZIP 文件数量过多或 ZIP64 不受支持","zip.centralOutOfBounds":"ZIP 中央目录越界","zip.centralCorrupt":"ZIP 中央目录损坏","zip.nameOutOfBounds":"ZIP 文件名越界","zip.encrypted":"不支持加密的 ZIP","zip.symlink":"禁止 ZIP 符号链接/设备文件","zip.tooLarge":"ZIP 解压体积超过安全限制","zip.outOfBounds":"ZIP 越界","zip.localHeaderCorrupt":"ZIP 本地文件头损坏","zip.dataOutOfBounds":"ZIP 压缩数据越界","zip.unsupportedMethod":"ZIP 压缩方法不支持: {method}","zip.checksum":"ZIP 文件大小或 CRC 校验失败: {name}","archive.noManifest":"压缩包根目录找不到 manifest.json","archive.tooLarge":"扩展压缩包超过 80 MB","archive.invalidManifest":"无效的 Chrome 扩展 manifest","archive.keyMismatch":"manifest.key 与 CRX 签名公钥不匹配","list.add":"添加扩展","list.addDesc":"从 Chrome 应用商店安装，或导入本地的扩展文件夹、.crx、.zip。","list.installFromLink":"从链接安装","list.importLocal":"从本地导入","list.empty":"还没有安装 Chrome 扩展。","list.pinned":"已固定到工具栏","list.options":"扩展选项","panel.title":"扩展","panel.empty":"还没有安装扩展。可以从 Chrome 应用商店添加。","panel.disabledBadge":"已停用","panel.disabled":"扩展已停用","panel.openOptions":"打开扩展选项","panel.noPanel":"此扩展没有面板","panel.addFromStore":"从 Chrome 应用商店添加","manager.scope":"扩展仅作用于本库 {target} 中打开的网页。","manager.settings":"设置与诊断","page.title":"扩展页面","page.reload":"重新加载","page.notAvailable":"这个扩展未安装或未启用。","page.loadFailed":"扩展页面无法加载（{code}: {description}）。","popover.panelLabel":"{name} 扩展面板","popover.optionsLabel":"{name} 选项","popover.optionsTitle":"{name} · 选项","popover.diagnose":"输出诊断信息到控制台","settings.status.webviewer":"扩展在 {target} 中运行。核心插件“网页浏览器”已启用：外部链接交给 Web Viewer 打开，扩展也只作用于 Web Viewer 标签页。","settings.status.surfing":"扩展在 {target} 中运行。核心插件“网页浏览器”未启用：扩展作用于 Surfing 标签页。","settings.legacy.name":"从 Chrome Extensions Bridge 导入","settings.legacy.desc":"发现 Chrome Extensions Bridge 插件安装的 {count} 个扩展。导入后它们由 Surfing 管理，之后可以卸载那个插件。","settings.legacy.disableFirst":"导入前请先停用 Chrome Extensions Bridge。","settings.legacy.import":"导入","settings.installed":"已安装的扩展","settings.toolbar":"工具栏","settings.toolbar.desc":"每个浏览器标签页标题栏里有一个拼图按钮，列出全部扩展。固定的扩展会额外显示为独立按钮；右键扩展按钮可打开它的菜单。","settings.resetPinned":"重置固定的扩展","settings.resetPinned.desc":"恢复默认：固定前两个可打开面板的扩展。","settings.reset":"重置","settings.behavior":"行为","settings.autoReload":"扩展变更后自动刷新网页","settings.autoReload.desc":"安装、启用、停用或卸载扩展后，自动刷新已打开的网页。关闭时会在通知中提供“刷新网页”按钮（刷新可能丢失网页中未提交的输入）。","settings.autoUpdate":"自动检查扩展更新","settings.autoUpdate.desc":"每 6 小时检查一次 Chrome 应用商店。新版本请求新权限时仍会先征求同意。","settings.checkNow":"立即检查","settings.checkNow.desc":"立即检查已安装扩展是否有新版本。","settings.status.name":"扩展运行位置","settings.output":"诊断结果","settings.output.desc":"上面各个工具的输出。","settings.compatibility":"兼容性","settings.compat":"Chrome API 兼容层","settings.compat.desc":"为扩展补上 Obsidian（Electron）缺少的 Chrome API：webNavigation 导航事件、右键菜单、在 Obsidian 中打开新页面、storage.sync/session、alarms 等。只修改 Surfing 托管的扩展副本，关闭即恢复原文件。","settings.advanced":"高级","settings.debug":"调试模式","settings.debug.desc":"在扩展面板和菜单中显示诊断按钮，并在控制台输出扩展通道的详细日志。","settings.diagnostics":"诊断工具","settings.checking":"正在检查…","settings.failed":"失败：{error}","settings.state":"当前状态","settings.state.desc":"已加载的扩展、Service Worker、兼容层报告与扩展通道。","settings.check":"检查","settings.probe":"MV3 兼容探针","settings.probe.desc":"加载一个测试扩展，检查 Popup ↔ Worker 消息往返、storage.local 与 tabs.query。","settings.run":"运行","settings.wake":"唤醒后台：{name}","settings.wake.desc":"启动扩展的 Service Worker 并显示最近日志。","settings.wakeButton":"唤醒"};function ha(){var r;try{const n=typeof((r=A.moment)==null?void 0:r.locale)=="function"?A.moment.locale():"";return typeof n=="string"&&n.toLowerCase().startsWith("zh")}catch{return!1}}function x(r,n){const e=(ha()?ua[r]:void 0)??da[r]??r;return n?e.replace(/\{(\w+)\}/g,(t,s)=>Object.prototype.hasOwnProperty.call(n,s)?String(n[s]):t):e}function de(r,n=5500){return typeof r=="string"?new A.Notice(x("notice.prefix")+r,n):new A.Notice(r,n)}function Ne(r){return r instanceof Error?r.message:String(r)}function Gt(r){const n=JSON.parse(j.readFileSync(H.join(r,"manifest.json"),"utf8"));if(!n||n.manifest_version!==2&&n.manifest_version!==3||typeof n.version!="string")throw new Error(x("error.notExtensionFolder"));return n}function pa(r){return typeof r.name=="string"?r.name:"Unnamed extension"}function ln(r){const n=Array.isArray(r.permissions)?r.permissions.filter(s=>typeof s=="string"):[],e=Array.isArray(r.host_permissions)?r.host_permissions.filter(s=>typeof s=="string"):[],t=Array.isArray(r.content_scripts)?r.content_scripts.flatMap(s=>Array.isArray(s.matches)?s.matches.filter(i=>typeof i=="string"):[]):[];return{permissions:n,hosts:[...new Set([...e,...t])]}}function Jt(r,n){const e=H.resolve(r,"extensions")+H.sep;return H.resolve(n).startsWith(e)}function ga(r){var n,e,t;return((n=r==null?void 0:r.action)==null?void 0:n.default_popup)||((e=r==null?void 0:r.browser_action)==null?void 0:e.default_popup)||((t=r==null?void 0:r.page_action)==null?void 0:t.default_popup)||null}function fa(r){var n;return((n=r==null?void 0:r.options_ui)==null?void 0:n.page)||(r==null?void 0:r.options_page)||null}function ma(r,n,e=32){var o,a;const t=((o=n.action)==null?void 0:o.default_icon)||((a=n.browser_action)==null?void 0:a.default_icon)||n.icons;let s=t;if(t&&typeof t=="object"){const c=Object.keys(t).map(Number).filter(Number.isFinite).sort((d,p)=>d-p),l=c.find(d=>d>=e)??c[c.length-1];s=l!==void 0?t[String(l)]:void 0}if(typeof s!="string"||!/\.(?:png|jpe?g|webp|gif|svg)$/i.test(s))return null;const i=s.replace(/^\//,"");if(i.includes("\\")||i.split("/").includes(".."))return null;try{const c=H.resolve(r),l=H.resolve(c,i);if(!l.startsWith(c+H.sep))return null;const d=j.realpathSync(c),p=j.realpathSync(l);if(!p.startsWith(d+H.sep))return null;const u=j.statSync(p).size;return!u||u>256*1024?null:`data:${/\.png$/i.test(i)?"image/png":/\.webp$/i.test(i)?"image/webp":/\.gif$/i.test(i)?"image/gif":/\.svg$/i.test(i)?"image/svg+xml":"image/jpeg"};base64,${j.readFileSync(p).toString("base64")}`}catch{return null}}function Bn(r,n,e){r.empty(),n?r.createEl("img",{cls:"chrome-bridge-ext-icon",attr:{src:n,alt:"",draggable:"false"}}):r.createSpan({cls:"chrome-bridge-ext-monogram",text:(e||"EX").trim().slice(0,2).toUpperCase()})}function Ri(r,n,e,t){Bi(r,new A.Setting(n),e,t)}function Bi(r,n,e,t){n.setClass("chrome-bridge-install-row").setName(x("list.add")).setDesc(x("list.addDesc")).addButton(s=>s.setButtonText(x("command.openStore")).setCta().onClick(()=>{t==null||t(),r.openStore()})).addButton(s=>s.setButtonText(x("list.installFromLink")).onClick(()=>r.askStoreUrl(e))).addButton(s=>s.setButtonText(x("list.importLocal")).onClick(()=>r.askLocalPath(e)))}function Di(r,n,e,t){const s=n.createDiv({cls:"chrome-bridge-ext-list"}),i=r.settings.extensions;if(!i.length){s.createDiv({cls:"chrome-bridge-empty",text:x("list.empty")});return}for(const o of i)Ui(r,new A.Setting(s),o,e,t)}function Ui(r,n,e,t,s){const i=r.getDisplayName(e);n.setClass("chrome-bridge-ext-row"),n.nameEl.empty(),e.enabled||n.settingEl.addClass("is-disabled"),Bn(n.nameEl.createSpan({cls:"chrome-bridge-ext-row-icon"}),r.iconFor(e,32),i),n.nameEl.createSpan({text:i});const o=e.source==="store"?x("source.store"):x("source.local");n.setDesc(`${e.version} · ${o}${r.isPinned(e)?" · "+x("list.pinned"):""}`);const a=(d,p,u,g=!1)=>{n.addExtraButton(m=>{m.setIcon(d).setTooltip(p).setDisabled(g),g||m.extraSettingsEl.addEventListener("click",u)})},c=r.popupPageOf(e),l=r.optionsPageOf(e);c&&a("panel-top-open",x("menu.openPanel"),d=>{const p=d.currentTarget.getBoundingClientRect();s==null||s(),r.openPopup(e,p,null)},!e.enabled),l&&a("settings",x("list.options"),d=>{const p=d.currentTarget.getBoundingClientRect();s==null||s(),r.openOptions(e,p)},!e.enabled),a(r.isPinned(e)?"pin":"pin-off",r.isPinned(e)?x("menu.unpin"):x("menu.pin"),()=>void r.togglePinned(e).then(t),!e.enabled),a("more-vertical",x("common.more"),d=>r.showExtensionMenu(e,d,null,t)),n.addToggle(d=>d.setValue(e.enabled).setTooltip(e.enabled?x("menu.disable"):x("menu.enable")).onChange(async()=>{await r.withNotice(()=>r.toggle(e.key)),t()}))}function ba(r,n,e){r.addClass("chrome-bridge-settings");const t=r.createDiv({cls:"chrome-bridge-status"});n.target?t.setText(x(n.target.kind==="webviewer"?"settings.status.webviewer":"settings.status.surfing",{target:n.target.label})):(t.addClass("mod-warning"),t.setText(n.unavailableReason()));const s=n.legacyImport();s&&new A.Setting(r).setName(x("settings.legacy.name")).setDesc(x("settings.legacy.desc",{count:s.count})+(n.legacyPluginEnabled()?x("settings.legacy.disableFirst"):"")).addButton(c=>c.setButtonText(x("settings.legacy.import")).setCta().setDisabled(n.legacyPluginEnabled()).onClick(async()=>{await n.withNotice(()=>n.importLegacy()),e()})),new A.Setting(r).setName(x("settings.installed")).setHeading(),Di(n,r,e),Ri(n,r,e),new A.Setting(r).setName(x("settings.toolbar")).setDesc(x("settings.toolbar.desc")).setHeading(),new A.Setting(r).setName(x("settings.resetPinned")).setDesc(x("settings.resetPinned.desc")).addButton(c=>c.setButtonText(x("settings.reset")).onClick(async()=>{await n.resetPinned(),e()})),new A.Setting(r).setName(x("settings.behavior")).setHeading(),new A.Setting(r).setName(x("settings.autoReload")).setDesc(x("settings.autoReload.desc")).addToggle(c=>c.setValue(n.settings.autoReloadPages).onChange(async l=>{n.settings.autoReloadPages=l,await n.saveSettings()})),new A.Setting(r).setName(x("settings.autoUpdate")).setDesc(x("settings.autoUpdate.desc")).addToggle(c=>c.setValue(n.settings.autoUpdate).onChange(async l=>{n.settings.autoUpdate=l,await n.saveSettings()})).addButton(c=>c.setButtonText(x("settings.checkNow")).onClick(()=>void n.checkUpdates())),new A.Setting(r).setName(x("settings.compatibility")).setHeading(),new A.Setting(r).setName(x("settings.compat")).setDesc(x("settings.compat.desc")).addToggle(c=>c.setValue(n.settings.compatibilityEnabled!==!1).onChange(async l=>{await n.withNotice(()=>n.setCompatibilityEnabled(l)),e()})),new A.Setting(r).setName(x("settings.advanced")).setHeading(),new A.Setting(r).setName(x("settings.debug")).setDesc(x("settings.debug.desc")).addToggle(c=>c.setValue(n.settings.debug).onChange(async l=>{n.settings.debug=l,await n.saveSettings(),e()}));const i=r.createEl("details",{cls:"chrome-bridge-diagnostics"});i.createEl("summary",{text:x("settings.diagnostics")});const o=createEl("pre",{cls:"chrome-bridge-diagnostic-output"}),a=async c=>{o.setText(x("settings.checking"));try{o.setText(JSON.stringify(await c(),null,2))}catch(l){o.setText(x("settings.failed",{error:Ne(l)}))}};new A.Setting(i).setName(x("settings.state")).setDesc(x("settings.state.desc")).addButton(c=>c.setButtonText(x("settings.check")).onClick(()=>a(()=>n.diagnose()))),new A.Setting(i).setName(x("settings.probe")).setDesc(x("settings.probe.desc")).addButton(c=>c.setButtonText(x("settings.run")).onClick(async()=>{const l=c.buttonEl.getBoundingClientRect();await n.withNotice(()=>n.runProbe(l))}));for(const c of n.settings.extensions.filter(l=>{var d,p;return l.enabled&&((p=(d=n.getManifest(l))==null?void 0:d.background)==null?void 0:p.service_worker)}))new A.Setting(i).setName(x("settings.wake",{name:n.getDisplayName(c)})).setDesc(x("settings.wake.desc")).addButton(l=>l.setButtonText(x("settings.wakeButton")).onClick(()=>a(()=>n.startExtensionWorker(c.id))));i.appendChild(o)}function va(r,n,e=""){const t=[{name:x("settings.status.name"),desc:r.target?x(r.target.kind==="webviewer"?"settings.status.webviewer":"settings.status.surfing",{target:r.target.label}):r.unavailableReason(),render:l=>{r.target||l.settingEl.addClass("mod-warning")}}],s=r.legacyImport();s&&t.push({name:x("settings.legacy.name"),desc:x("settings.legacy.desc",{count:s.count})+(r.legacyPluginEnabled()?x("settings.legacy.disableFirst"):""),render:l=>{l.addButton(d=>d.setButtonText(x("settings.legacy.import")).setCta().setDisabled(r.legacyPluginEnabled()).onClick(async()=>{await r.withNotice(()=>r.importLegacy()),n()}))}});const i={type:"list",heading:x("settings.installed"),emptyState:x("list.empty"),items:r.settings.extensions.map(l=>({name:r.getDisplayName(l),desc:`${l.version} · ${l.source==="store"?x("source.store"):x("source.local")}`,render:d=>Ui(r,d,l,n)}))},o=createEl("pre",{cls:"chrome-bridge-diagnostic-output"}),a=async l=>{o.setText(x("settings.checking"));try{o.setText(JSON.stringify(await l(),null,2))}catch(d){o.setText(x("settings.failed",{error:Ne(d)}))}},c=[{name:x("settings.state"),desc:x("settings.state.desc"),render:l=>{l.addButton(d=>d.setButtonText(x("settings.check")).onClick(()=>a(()=>r.diagnose())))}},{name:x("settings.probe"),desc:x("settings.probe.desc"),render:l=>{l.addButton(d=>d.setButtonText(x("settings.run")).onClick(async()=>{const p=d.buttonEl.getBoundingClientRect();await r.withNotice(()=>r.runProbe(p))}))}}];for(const l of r.settings.extensions.filter(d=>{var p,u;return d.enabled&&((u=(p=r.getManifest(d))==null?void 0:p.background)==null?void 0:u.service_worker)}))c.push({name:x("settings.wake",{name:r.getDisplayName(l)}),desc:x("settings.wake.desc"),render:d=>{d.addButton(p=>p.setButtonText(x("settings.wakeButton")).onClick(()=>a(()=>r.startExtensionWorker(l.id))))}});return c.push({name:x("settings.output"),desc:x("settings.output.desc"),render:l=>{l.settingEl.appendChild(o)}}),[{type:"group",items:t},i,{type:"group",items:[{name:x("list.add"),desc:x("list.addDesc"),render:l=>Bi(r,l,n)}]},{type:"group",items:[{name:x("settings.toolbar"),desc:x("settings.toolbar.desc")},{name:x("settings.resetPinned"),desc:x("settings.resetPinned.desc"),render:l=>{l.addButton(d=>d.setButtonText(x("settings.reset")).onClick(async()=>{await r.resetPinned(),n()}))}}]},{type:"group",heading:x("settings.behavior"),items:[{name:x("settings.autoReload"),desc:x("settings.autoReload.desc"),control:{type:"toggle",key:e+"autoReloadPages"}},{name:x("settings.autoUpdate"),desc:x("settings.autoUpdate.desc"),control:{type:"toggle",key:e+"autoUpdate"}},{name:x("settings.checkNow"),desc:x("settings.checkNow.desc"),render:l=>{l.addButton(d=>d.setButtonText(x("settings.checkNow")).onClick(()=>void r.checkUpdates()))}}]},{type:"group",heading:x("settings.compatibility"),items:[{name:x("settings.compat"),desc:x("settings.compat.desc"),control:{type:"toggle",key:e+"compatibilityEnabled",defaultValue:!0}}]},{type:"group",heading:x("settings.advanced"),items:[{name:x("settings.debug"),desc:x("settings.debug.desc"),control:{type:"toggle",key:e+"debug"}}]},{type:"group",heading:x("settings.diagnostics"),items:c}]}function us(r){let n=null;const e=t=>{const s=r.createDiv("setting-group");return r.insertBefore(s,t),s};for(const t of Array.from(r.children))if(t.instanceOf(HTMLElement))if(t.hasClass("setting-item-heading")){const s=e(t);s.appendChild(t),n=s.createDiv("setting-items")}else t.hasClass("setting-item")?(n??(n=e(t).createDiv("setting-items")),n.appendChild(t)):n=null}class Wi extends Ft{constructor(e,t,s){super(e,t,!1);y(this,"files");y(this,"onSelect");this.onSelect=s,this.files=this.app.vault.getFiles().filter(i=>i.extension==="txt")}getSuggestions(e){const t=this.files.map(i=>i.path);if(!e)return t.slice(0,20);const s=A.prepareFuzzySearch(e);return t.map(i=>{const o=s(i);return o?{path:i,score:o.score}:null}).filter(Boolean).sort((i,o)=>o.score-i.score).map(i=>i.path).slice(0,20)}renderSuggestion(e,t){t.createEl("div",{text:e,cls:"wb-bookmark-suggestion-text"}),t.classList.add("wb-bookmark-suggest-item")}selectSuggestion(e){var t;e&&(this.inputEl.value=e,this.inputEl.dispatchEvent(new Event("input")),(t=this.onSelect)==null||t.call(this,e),this.close())}}const dn="chromeExtensions.",hs="javascript:(function(){var%20i%20%3Ddocument.location.href%3B%20document.location.href%3D%22obsidian%3A%2F%2Fweb-open%3Furl%3D%22%20%2B%20encodeURIComponent%28i%29%3B})();";function Yt(r){return typeof r=="string"?r:""}const Fi={ignoreList:{read:r=>Array.isArray(r)?r.join(","):"",write:r=>Yt(r).split(",")},highlightFormat:{write:r=>Yt(r)||ie.highlightFormat},"adBlock.enabled":{after:async r=>{var n;await((n=r.plugin.adBlockManager)==null?void 0:n.reload())}},"bookmarkManager.bookmarkFolder":{write:r=>Yt(r)||ie.bookmarkManager.bookmarkFolder},"mcp.enabled":{store:async(r,n)=>{var e;await((e=r.plugin.mcp)==null?void 0:e.setEnabled(n===!0))},after:r=>r.refreshSettings()},"mcp.port":{store:async(r,n)=>{var e;await((e=r.plugin.mcp)==null?void 0:e.setPort(typeof n=="number"?n:ie.mcp.port))},after:r=>r.refreshSettings()},[`${dn}compatibilityEnabled`]:{store:async(r,n)=>{const e=r.plugin.chromeExtensions;await(e==null?void 0:e.withNotice(()=>e.setCompatibilityEnabled(n===!0)))},after:r=>r.refreshSettings()},[`${dn}debug`]:{after:r=>r.refreshSettings()}};function un(r){return typeof r=="object"&&r!==null}function wa(r,n){let e=r;for(const t of n.split(".")){if(!un(e))return;e=e[t]}return e}function ya(r,n,e){const t=n.split("."),s=t.pop();let i=r;for(const o of t){if(!un(i))return;i=i[o]}s&&un(i)&&(i[s]=e)}function ka(r,n){var s;const e=wa(r.plugin.settings,n),t=(s=Fi[n])==null?void 0:s.read;return t?t(e):e}async function Ea(r,n,e){var s;const t=Fi[n];t!=null&&t.store?await t.store(r,e):(ya(r.plugin.settings,n,t!=null&&t.write?t.write(e):e),t!=null&&t.after?await r.plugin.saveSettings():r.applySettingsUpdate()),await((s=t==null?void 0:t.after)==null?void 0:s.call(t,r,e)),r.refreshState()}function xa(r){const n=[{type:"page",name:E("General"),desc:E("Links, previews, highlights and saving pages."),items:Sa(r)},{type:"page",name:E("Search"),desc:E("The search bar, search engines and shortcuts."),items:Ca(r)},{type:"page",name:E("Theme"),desc:E("How Surfing views look."),items:Ta()},{type:"page",name:E("Bookmark"),desc:E("The bookmark bar and the bookmark manager."),items:Ia(r)},{type:"page",name:E("Ad Block"),desc:E("Block ads and hide elements on web pages."),items:Aa(r)}];return A.Platform.isDesktop&&r.plugin.chromeExtensions&&n.push({type:"page",name:E("Extensions"),desc:E("Install and manage Chrome extensions."),items:va(r.plugin.chromeExtensions,()=>r.refreshSettings(),dn)}),A.Platform.isDesktop&&r.plugin.mcp&&n.push({type:"page",name:E("MCP"),desc:E("Let AI agents see and control the web pages open in Obsidian."),items:La(r)}),n}function Sa(r){const n=r.plugin.settings;return[{type:"group",items:[{name:E("Open URL In Same Tab"),control:{type:"toggle",key:"openInSameTab"}},{name:E("Hover Popover"),desc:E("Show a popover when hover on the link."),control:{type:"toggle",key:"hoverPopover"}},{name:E("Enable HTML Preview"),desc:E("Enable HTML Preview in Surfing"),control:{type:"toggle",key:"enableHtmlPreview"}},{name:E("Enable Tree View"),desc:E("Enable Tree View in Surfing"),control:{type:"toggle",key:"enableTreeView"}},{name:E("Enable Inline Preview")+" [Deprecated]",desc:E("Enable inline preview with surfing. Currently only support Live preview"),control:{type:"toggle",key:"supportLivePreviewInlineUrl"}},{name:E("Show Refresh Button Near Search Bar"),control:{type:"toggle",key:"showRefreshButton"}},{name:E("Independent Sessions Per Tab"),desc:E("Each browser tab gets its own session with separate cookies. Requires reload."),control:{type:"toggle",key:"sessionIsolation"}}]},{type:"group",heading:E("Highlights and saving"),items:[{name:E("Custom Link to Highlight Format"),control:{type:"toggle",key:"customHighlightFormat"}},{name:E("Copy Link to Highlight Format"),desc:E("Set copy link to text fragment format. [{CONTENT}]({URL}) By default. You can also set {TIME:YYYY-MM-DD HH:mm:ss} to get the current date."),control:{type:"text",key:"highlightFormat",placeholder:ie.highlightFormat},visible:()=>n.customHighlightFormat},{name:E("Jump to Opened Page"),desc:E("When click on the URL from same domain name in the note, jump to the same surfing view rather than opening a new Surfing view."),control:{type:"toggle",key:"highlightInSameTab"},visible:()=>n.customHighlightFormat},{name:E("Save As Markdown Path"),control:{type:"text",key:"markdownPath",placeholder:E("Path like /_Tempcard")}}]},{type:"group",heading:E("Integrations"),items:[{name:E("[Experimental] Replace Iframe In Canvas")+E("(Reload to take effect)"),control:{type:"toggle",key:"useWebview"}},{name:E("Open URL In Obsidian Web From Other Software")+" "+E("(Reload to take effect)"),control:{type:"toggle",key:"openInObsidianWeb"}},{name:E("Obsidian bookmarklets code"),desc:E("   <- Drag or click on me").trim(),visible:()=>n.openInObsidianWeb,render:e=>{const t=e.controlEl.createEl("button",{cls:"wb-btn"});t.createEl("a",{text:E("Obsidian bookmarklets code"),cls:"cm-url",href:hs}),t.addEventListener("click",s=>{s.preventDefault(),ne.clipboard.writeText(hs),new A.Notice(E("Copy BookmarkLets Success"))})}}]},{type:"group",items:[{name:"Surfing",render:e=>{e.settingEl.addClass("wb-about-card"),A.setIcon(e.settingEl.createDiv({cls:"wb-about-icon"}),"surfing"),e.controlEl.createEl("a",{cls:"wb-about-version",href:"https://github.com/Quorafind/Obsidian-Surfing/releases/tag/"+r.plugin.manifest.version,text:r.plugin.manifest.version})}}]}]}function Ca(r){const n=r.plugin.settings;typeof n.customSearchEngine!="object"&&(n.customSearchEngine=ie.customSearchEngine);const e=n.customSearchEngine,t={duckduckgo:E("DuckDuckGo"),google:E("Google"),bing:E("Bing"),yahoo:E("Yahoo"),baidu:E("Baidu")};for(const s of e)t[s.name]=s.name;return[{type:"group",heading:E("Search bar"),items:[{name:E("Show Search Bar In Empty Page"),control:{type:"toggle",key:"showSearchBarInPage"}},{name:E("Show last opened files"),control:{type:"toggle",key:"lastOpenedFiles"},visible:()=>n.showSearchBarInPage}]},{type:"group",heading:E("Search engines"),items:[{name:E("Default Search Engine"),control:{type:"dropdown",key:"defaultSearchEngine",options:t}},{name:E("Show Other Search Engines When Searching")+" "+E("(Reload to take effect)"),control:{type:"toggle",key:"showOtherSearchEngines"}},{name:E("Focus search bar via keyboard"),control:{type:"toggle",key:"focusSearchBarViaKeyboard"}},{name:E("Disable / to search when on these sites"),control:{type:"text",key:"ignoreList",placeholder:ie.ignoreList.join(",")},visible:()=>n.focusSearchBarViaKeyboard},{name:E("Always Show Custom Engines"),control:{type:"toggle",key:"alwaysShowCustomSearch"}}]},{type:"list",heading:E("Custom search engines"),emptyState:E("No custom search engines."),visible:()=>n.alwaysShowCustomSearch,addItem:{name:E("Add new custom search engine"),action:()=>{e.push({name:`Custom Search ${e.length+1}`,url:"https://www.google.com/search?q="}),r.plugin.saveSettings(),r.refreshSettings()}},onDelete:s=>{e.splice(s,1),r.plugin.saveSettings(),r.refreshSettings()},items:e.map((s,i)=>({name:s.name?s.name:E("Custom Search")+(e.length>1?` ${i+1}`:""),aliases:[E("Search Engine"),s.url],render:o=>{o.addText(a=>a.setPlaceholder(E("Name")).setValue(s.name).onChange(c=>{e[i]={...e[i],name:c},r.applySettingsUpdate()})).addText(a=>a.setPlaceholder(E("Url")).setValue(s.url).onChange(c=>{e[i]={...e[i],url:c},r.applySettingsUpdate()}))}}))}]}function Ta(){return[{type:"group",items:[{name:E("Use icon list to replace defult text actions in empty view")+E("(Reload to take effect)"),control:{type:"toggle",key:"useIconList"}},{name:E("Toggle Dark Mode"),control:{type:"toggle",key:"darkMode"}},{name:E("Random Background"),control:{type:"toggle",key:"randomBackground"}},{name:E("Working On, Not Available Now"),aliases:["theme"],render:r=>{r.settingEl.addClass("wb-theme-settings-working-on")}},{name:E("Random Icons From Default Art"),aliases:["theme surfing"],control:{type:"toggle",key:"useCustomIcons",disabled:!0}}]}]}function Ia(r){const n=r.plugin.settings,e=()=>n.bookmarkManager.openBookMark;return[{type:"group",items:[{name:E("Open BookmarkBar & Bookmark Manager"),control:{type:"toggle",key:"bookmarkManager.openBookMark"}},{name:E("Save Bookmark When Open URI"),control:{type:"toggle",key:"bookmarkManager.saveBookMark"},visible:e},{name:E("Send to ReadWise"),desc:E("Add a action in page header to Send to ReadWise."),control:{type:"toggle",key:"bookmarkManager.sendToReadWise"},visible:e},{name:E("Bookmark Folder"),desc:E("Vault folder where bookmark files are stored."),control:{type:"text",key:"bookmarkManager.bookmarkFolder",placeholder:ie.bookmarkManager.bookmarkFolder},visible:e},{name:E("Default Category"),control:{type:"text",key:"bookmarkManager.defaultCategory",placeholder:ie.bookmarkManager.defaultCategory},visible:e}]}]}function Aa(r){const n=r.plugin.settings,e=n.adBlock.filterLists,t=()=>n.adBlock.enabled;return[{type:"group",items:[{name:E("Enable Ad Blocking"),desc:E("Block requests to domains in your filter lists."),control:{type:"toggle",key:"adBlock.enabled"}},{name:E("Enable Element Hiding"),desc:E("Allow picking and hiding page elements."),control:{type:"toggle",key:"elementHiding.enabled"}}]},{type:"group",visible:t,items:[{name:E("Filter Lists"),desc:E("Manage filter lists for ad blocking."),render:s=>{s.addButton(i=>i.setButtonText(E("Reload Filter Lists")).onClick(async()=>{r.plugin.adBlockManager&&(await r.plugin.adBlockManager.reload(),new A.Notice(E("Filter lists reloaded.")))}))}}]},{type:"list",visible:t,emptyState:E("No filter lists."),addItem:{name:E("Add filter list"),action:()=>{e.push({name:"New Filter",url:"",enabled:!0}),r.plugin.saveSettings(),r.refreshSettings()}},onDelete:s=>{e.splice(s,1),r.plugin.saveSettings(),r.refreshSettings()},items:e.map((s,i)=>({name:s.name||E("Filter Lists"),aliases:[s.url],render:o=>{o.addText(a=>a.setPlaceholder("Name").setValue(s.name).onChange(async c=>{e[i].name=c,await r.plugin.saveSettings()})).addText(a=>{a.setPlaceholder("URL or vault path").setValue(s.url).onChange(async c=>{e[i].url=c,await r.plugin.saveSettings()}),new Wi(r.app,a.inputEl)}).addToggle(a=>a.setValue(s.enabled).onChange(async c=>{e[i].enabled=c,await r.plugin.saveSettings()}))}}))}]}function Bt(r){return r?r.length<=8?"•".repeat(r.length):r.slice(0,4)+"…"+r.slice(-4):""}function La(r){const n=r.plugin,e=n.settings.mcp,t=n.mcp;if(!t)return[];const s=()=>e.enabled,i=t.snippets(),o=l=>e.token?l.split(e.token).join(Bt(e.token)):l,a=(l,d)=>({name:l,visible:s,render:p=>{p.settingEl.addClass("wb-mcp-snippet-setting"),p.descEl.createEl("pre",{cls:"wb-mcp-snippet",text:o(d)}),p.addButton(u=>u.setButtonText(E("Copy")).onClick(()=>{ne.clipboard.writeText(d),new A.Notice(E("Copied."))}))}}),c=l=>l.map(d=>({name:d,render:p=>{p.setName(d)}}));return[{type:"group",items:[{name:E("Enable MCP server"),desc:E("Lets AI agents such as Claude Code and Codex CLI read and control the web pages open in Obsidian. Only programs on this computer that have the access token can connect."),control:{type:"toggle",key:"mcp.enabled"}},{name:E("Status"),desc:t.statusText(),visible:s},{name:E("Port"),desc:E("The server listens on this port of 127.0.0.1 only."),control:{type:"number",key:"mcp.port",min:1024,max:65535,step:1,defaultValue:ie.mcp.port,validate:l=>Number.isInteger(l)&&l>=1024&&l<=65535?void 0:E("Enter a port between 1024 and 65535.")}},{name:E("Access token"),desc:Bt(e.token)||E("Generated when the server is first enabled."),visible:s,render:l=>{l.addButton(d=>d.setButtonText(E("Copy")).onClick(()=>{ne.clipboard.writeText(e.token),new A.Notice(E("Copied."))})),l.addButton(d=>d.setButtonText(E("Regenerate")).setWarning().onClick(async()=>{await t.regenerateToken(),new A.Notice(E("New token generated. Update the clients you connected.")),r.refreshSettings()}))}}]},{type:"group",heading:E("Connect a client"),items:[a("Claude Code",i.claudeCode),a("Codex CLI (~/.codex/config.toml)",i.codex),a(E("Other clients (JSON)"),i.json)]},{type:"group",heading:E("Permissions"),items:[{name:E("Site access"),desc:E("Ask the first time an agent uses a site, or let agents use every site that is not blocked."),control:{type:"dropdown",key:"mcp.siteAccess",options:{ask:E("Ask"),allow:E("Allow all sites")}}},{name:E("Allow running JavaScript in pages"),desc:E("Warning: lets agents run any code in the pages they control, with access to your logged-in sessions on those sites. Leave off unless you need it."),control:{type:"toggle",key:"mcp.allowScripts"}}]},{type:"list",heading:E("Approved sites"),emptyState:E("No approved sites. Sites you choose to always allow appear here."),onDelete:l=>{e.approvedSites.splice(l,1),n.saveSettings(),r.refreshSettings()},items:c(e.approvedSites)},{type:"list",heading:E("Blocked sites"),emptyState:E("No blocked sites. Agents cannot read or act on blocked sites. Use example.com or *.example.com."),addItem:{name:E("Block a site"),action:()=>{e.blockedSites.push(""),n.saveSettings(),r.refreshSettings()}},onDelete:l=>{e.blockedSites.splice(l,1),n.saveSettings(),r.refreshSettings()},items:e.blockedSites.map((l,d)=>({name:l||E("New blocked site"),aliases:[l],render:p=>{p.addText(u=>u.setPlaceholder("example.com").setValue(l).onChange(g=>{e.blockedSites[d]=g.trim(),r.applySettingsUpdate()}))}}))}]}const ie={defaultSearchEngine:"duckduckgo",customSearchEngine:[{name:"duckduckgo",url:"https://duckduckgo.com/?q="}],hoverPopover:!0,ignoreList:["notion","craft"],alwaysShowCustomSearch:!1,showOtherSearchEngines:!1,showSearchBarInPage:!1,markdownPath:"/",customHighlightFormat:!1,highlightFormat:"[{CONTENT}]({URL})",highlightInSameTab:!1,openInSameTab:!1,showRefreshButton:!1,openInObsidianWeb:!1,useCustomIcons:!1,useWebview:!1,useIconList:!0,darkMode:!1,randomBackground:!1,lastOpenedFiles:!1,bookmarkManager:{openBookMark:!1,saveBookMark:!1,sendToReadWise:!1,bookmarkFolder:"surfing-bookmarks",defaultCategory:"ROOT",bookmarksMigrated:!1},treeData:[],enableHtmlPreview:!0,supportLivePreviewInlineUrl:!1,enableTreeView:!1,focusSearchBarViaKeyboard:!0,mcp:{enabled:!1,port:27125,token:"",siteAccess:"ask",approvedSites:[],blockedSites:[],allowScripts:!1},sessionIsolation:!1,adBlock:{enabled:!1,filterLists:[]},elementHiding:{enabled:!0},chromeExtensions:_i},Oa={General:"chrome",Search:"search",Theme:"brush",Bookmark:"bookmark","Ad Block":"shield",Extensions:"puzzle",MCP:"plug"};class Ma extends A.PluginSettingTab{constructor(e,t){super(e,t);y(this,"plugin");y(this,"applyDebounceTimer",0);y(this,"tabContent",new Map);y(this,"selectedTab","General");y(this,"navigateEl");this.plugin=t,A.requireApiVersion("1.11.0")&&(this.icon="surfing")}getSettingDefinitions(){return xa(this)}getControlValue(e){return ka(this,e)}setControlValue(e,t){return Ea(this,e,t)}refreshSettings(){A.requireApiVersion("1.13.0")&&this.update()}refreshState(){A.requireApiVersion("1.13.0")&&this.refreshDomState()}applySettingsUpdate(){window.clearTimeout(this.applyDebounceTimer);const e=this.plugin;this.applyDebounceTimer=window.setTimeout(()=>{e.saveSettings()},100)}display(){const{containerEl:e}=this;e.empty(),this.generateSettingsTitle(),this.addTabHeader()}generateSettingsTitle(){const e=this.containerEl.createDiv("wb-setting-title");new A.Setting(e).setName("Web browser").setHeading()}addTabHeader(){const e=this.containerEl.createEl("nav",{cls:"wb-setting-header"});this.navigateEl=e.createDiv("wb-setting-tab-group");const t=this.containerEl.createDiv("wb-setting-content");this.createTabAndContent("General",this.navigateEl,t,(s,i)=>this.generateGeneralSettings(i,s)),this.createTabAndContent("Search",this.navigateEl,t,(s,i)=>this.generateSearchSettings(i,s)),this.createTabAndContent("Theme",this.navigateEl,t,(s,i)=>this.generateThemeSettings(i,s)),this.createTabAndContent("Bookmark",this.navigateEl,t,(s,i)=>this.generateBookmarkManagerSettings(i,s)),this.createTabAndContent("Ad Block",this.navigateEl,t,(s,i)=>this.generateAdBlockSettings(i,s)),A.Platform.isDesktop&&this.plugin.chromeExtensions&&this.createTabAndContent("Extensions",this.navigateEl,t,s=>this.generateExtensionsSettings(s)),A.Platform.isDesktop&&this.plugin.mcp&&this.createTabAndContent("MCP",this.navigateEl,t,s=>this.generateMcpSettings(s))}createTabAndContent(e,t,s,i){const o=this.selectedTab===e,a=t.createDiv("wb-navigation-item");a.addClass("wb-desktop"),A.setIcon(a.createDiv({cls:"wb-navigation-item-icon"}),Oa[e]),a.createSpan().setText(E(e)),a.onclick=()=>{if(this.selectedTab==e)return;a.addClass("wb-navigation-item-selected");const d=this.tabContent.get(e);(d==null?void 0:d.content).show();const p=this.tabContent.get(this.selectedTab);p==null||p.navButton.removeClass("wb-navigation-item-selected"),p==null||p.content.hide(),this.selectedTab=e};const l=s.createDiv("wb-tab-settings");l.id=e.toLowerCase().replace(" ","-"),o?a.addClass("wb-navigation-item-selected"):l.hide(),i&&(i(l,e),us(l)),this.tabContent.set(e,{content:l,navButton:a})}generateGeneralSettings(e,t){this.addOpenInSameTab(e,t),this.addHoverPopover(e,t),this.addEnableHTMLPreview(e,t),this.addTreeView(e,t),this.addInlinePreview(e,t),this.addRefreshButton(e,t),this.addHighlightFormat(e,t),this.addMarkdownPath(e,t),this.addReplaceIframeInCanvas(e,t),this.addOpenInObsidianWeb(e,t),this.addAboutInfo(e,t)}generateSearchSettings(e,t){this.addInpageSearch(e,t),this.addSearchEngine(e,t)}generateThemeSettings(e,t){this.useIconList(e,t),this.addDarkMode(e,t),this.addRandomBackground(e,t),this.addMyIcons(e,t)}selectTab(e){this.selectedTab=e}generateMcpSettings(e){const t=this.plugin.mcp;if(!t)return;const s=this.plugin.settings.mcp,i=e.createDiv(),o=()=>{if(i.empty(),new A.Setting(i).setName(E("Enable MCP server")).setDesc(E("Lets AI agents such as Claude Code and Codex CLI read and control the web pages open in Obsidian. Only programs on this computer that have the access token can connect.")).addToggle(c=>c.setValue(s.enabled).onChange(async l=>{await t.setEnabled(l),o()})),s.enabled&&new A.Setting(i).setName(E("Status")).setDesc(t.statusText()),new A.Setting(i).setName(E("Port")).setDesc(E("The server listens on this port of 127.0.0.1 only.")).addText(c=>c.setValue(String(s.port)).onChange(async l=>{const d=Number(l);!Number.isInteger(d)||d<1024||d>65535||await t.setPort(d)})),!s.enabled)return;new A.Setting(i).setName(E("Access token")).setDesc(Bt(s.token)).addButton(c=>c.setButtonText(E("Copy")).onClick(()=>{ne.clipboard.writeText(s.token),new A.Notice(E("Copied."))})).addButton(c=>c.setButtonText(E("Regenerate")).setWarning().onClick(async()=>{await t.regenerateToken(),new A.Notice(E("New token generated. Update the clients you connected.")),o()}));const a=t.snippets().claudeCode;new A.Setting(i).setName("Claude Code").setDesc(a.split(s.token).join(Bt(s.token))).addButton(c=>c.setButtonText(E("Copy")).onClick(()=>{ne.clipboard.writeText(a),new A.Notice(E("Copied."))}))};o()}generateExtensionsSettings(e){const t=this.plugin.chromeExtensions;if(!t)return;const s=e.createDiv(),i=()=>{s.empty(),ba(s,t,i),us(s)};i()}generateBookmarkManagerSettings(e,t){this.addBookmarkManagerSettings(e,t)}addRefreshButton(e,t){const s=E("Show Refresh Button Near Search Bar");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.showRefreshButton).onChange(async o=>{this.plugin.settings.showRefreshButton=o,this.applySettingsUpdate()})})}addInpageSearch(e,t){let s=E("Show Search Bar In Empty Page");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.showSearchBarInPage).onChange(async o=>{this.plugin.settings.showSearchBarInPage=o,this.applySettingsUpdate(),window.setTimeout(()=>{this.display()},200)})}),this.plugin.settings.showSearchBarInPage&&(s="Show last opened files",new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.lastOpenedFiles).onChange(async o=>{this.plugin.settings.lastOpenedFiles=o,this.applySettingsUpdate()})}))}addSearchEngine(e,t){let s=E("Default Search Engine");new A.Setting(t).setName(s).addDropdown(async i=>{const o=i.addOption("duckduckgo",E("DuckDuckGo")).addOption("google",E("Google")).addOption("bing",E("Bing")).addOption("yahoo",E("Yahoo")).addOption("baidu",E("Baidu"));this.plugin.settings.customSearchEngine.forEach((a,c)=>{o.addOption(a.name,a.name)}),o.setValue(this.plugin.settings.defaultSearchEngine).onChange(async a=>{this.plugin.settings.defaultSearchEngine=a,this.applySettingsUpdate(),this.display()})}),s=E("Show Other Search Engines When Searching")+" "+E("(Reload to take effect)"),new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.showOtherSearchEngines).onChange(async o=>{this.plugin.settings.showOtherSearchEngines=o,this.applySettingsUpdate()})}),s=E("Focus search bar via keyboard"),new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.focusSearchBarViaKeyboard).onChange(async o=>{this.plugin.settings.focusSearchBarViaKeyboard=o,this.applySettingsUpdate(),window.setTimeout(()=>{this.display()},200)})}),this.plugin.settings.focusSearchBarViaKeyboard&&(s=E("Disable / to search when on these sites"),new A.Setting(t).setName(s).addText(i=>{i.setPlaceholder(ie.ignoreList.join(",")).setValue(this.plugin.settings.ignoreList.join(",")).onChange(async o=>{this.plugin.settings.ignoreList=o.split(","),this.applySettingsUpdate()})})),s=E("Always Show Custom Engines"),new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.alwaysShowCustomSearch).onChange(async o=>{this.plugin.settings.alwaysShowCustomSearch=o,this.applySettingsUpdate(),this.display()})}),this.plugin.settings.alwaysShowCustomSearch&&(typeof this.plugin.settings.customSearchEngine!="object"&&(this.plugin.settings.customSearchEngine=ie.customSearchEngine),s=E("Add new custom search engine"),new A.Setting(t).setName(s).addButton(i=>i.setButtonText("+").onClick(async()=>{this.plugin.settings.customSearchEngine.push({name:`Custom Search ${this.plugin.settings.customSearchEngine.length+1}`,url:"https://www.google.com/search?q="}),await this.plugin.saveSettings(),this.display()})),this.plugin.settings.customSearchEngine.forEach((i,o)=>{s=i.name?i.name:E("Custom Search")+`${this.plugin.settings.customSearchEngine.length>1?` ${o+1}`:""}`;const c=new A.Setting(t).setClass("search-engine-setting").setName(s).addButton(p=>p.setButtonText(E("Delete Custom Search")).onClick(async()=>{this.plugin.settings.customSearchEngine.splice(o,1),await this.plugin.saveSettings(),this.display()})).settingEl.createDiv("search-engine-main-settings"),l=c.createDiv("search-engine-main-settings-name"),d=c.createDiv("search-engine-main-settings-url");l.createEl("label",{text:E("Name")}),l.createEl("input",{cls:"search-engine-name-input",type:"text",value:i.name}).on("change",".search-engine-name-input",async p=>{const u=p.target;this.plugin.settings.customSearchEngine[o]={...i,name:u.value},await this.plugin.saveSettings()}),d.createEl("label",{text:E("Url")}),d.createEl("input",{cls:"search-engine-url-input",type:"text",value:i.url}).on("change",".search-engine-url-input",async p=>{const u=p.target;this.plugin.settings.customSearchEngine[o]={...i,url:u.value},await this.plugin.saveSettings()})}))}addMarkdownPath(e,t){const s=E("Save As Markdown Path");new A.Setting(t).setName(s).addText(i=>i.setPlaceholder(E("Path like /_Tempcard")).setValue(this.plugin.settings.markdownPath).onChange(async o=>{this.plugin.settings.markdownPath=o,this.applySettingsUpdate()}))}addHighlightFormat(e,t){let s=E("Custom Link to Highlight Format");if(new A.Setting(t).setName(s).addToggle(o=>{o.setValue(this.plugin.settings.customHighlightFormat).onChange(async a=>{this.plugin.settings.customHighlightFormat=a,this.applySettingsUpdate(),this.display()})}),!this.plugin.settings.customHighlightFormat)return;s=E("Copy Link to Highlight Format");let i=E("Set copy link to text fragment format. [{CONTENT}]({URL}) By default. You can also set {TIME:YYYY-MM-DD HH:mm:ss} to get the current date.");new A.Setting(t).setName(s).setDesc(i).addText(o=>o.setPlaceholder(ie.highlightFormat).setValue(this.plugin.settings.highlightFormat).onChange(async a=>{a===""&&(this.plugin.settings.highlightFormat=ie.highlightFormat,this.applySettingsUpdate(),this.display()),this.plugin.settings.highlightFormat=a,this.applySettingsUpdate()})),s=E("Jump to Opened Page"),i=E("When click on the URL from same domain name in the note, jump to the same surfing view rather than opening a new Surfing view."),new A.Setting(t).setName(s).setDesc(i).addToggle(o=>{o.setValue(this.plugin.settings.highlightInSameTab).onChange(async a=>{this.plugin.settings.highlightInSameTab=a,this.applySettingsUpdate()})})}addOpenInSameTab(e,t){const s=E("Open URL In Same Tab");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.openInSameTab).onChange(async o=>{this.plugin.settings.openInSameTab=o,this.applySettingsUpdate(),this.display()})})}addHoverPopover(e,t){const s=E("Hover Popover"),i=E("Show a popover when hover on the link.");new A.Setting(t).setName(s).setDesc(i).addToggle(o=>{o.setValue(this.plugin.settings.hoverPopover).onChange(async a=>{this.plugin.settings.hoverPopover=a,this.applySettingsUpdate()})})}addEnableHTMLPreview(e,t){const s=E("Enable HTML Preview"),i=E("Enable HTML Preview in Surfing");new A.Setting(t).setName(s).setDesc(i).addToggle(o=>{o.setValue(this.plugin.settings.enableHtmlPreview).onChange(async a=>{this.plugin.settings.enableHtmlPreview=a,this.applySettingsUpdate()})})}addTreeView(e,t){const s=E("Enable Tree View"),i=E("Enable Tree View in Surfing");new A.Setting(t).setName(s).setDesc(i).addToggle(o=>{o.setValue(this.plugin.settings.enableTreeView).onChange(async a=>{this.plugin.settings.enableTreeView=a,this.applySettingsUpdate()})})}addInlinePreview(e,t){const s=E("Enable Inline Preview")+" [Deprecated]",i=E("Enable inline preview with surfing. Currently only support Live preview");new A.Setting(t).setName(s).setDesc(i).addToggle(o=>{o.setValue(this.plugin.settings.supportLivePreviewInlineUrl).onChange(async a=>{this.plugin.settings.supportLivePreviewInlineUrl=a,this.applySettingsUpdate()})})}addReplaceIframeInCanvas(e,t){const s=E("[Experimental] Replace Iframe In Canvas")+E("(Reload to take effect)");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.useWebview).onChange(async o=>{this.plugin.settings.useWebview=o,this.applySettingsUpdate()})})}addOpenInObsidianWeb(e,t){const s=E("Open URL In Obsidian Web From Other Software")+" "+E("(Reload to take effect)");if(new A.Setting(t).setName(s).addToggle(a=>{a.setValue(this.plugin.settings.openInObsidianWeb).onChange(async c=>{this.plugin.settings.openInObsidianWeb=c,this.applySettingsUpdate(),this.display()})}),!this.plugin.settings.openInObsidianWeb)return;const i=t.createDiv({cls:"bookmarklets-container"}),o=i.createEl("button",{cls:"wb-btn"});o.createEl("a",{text:"Obsidian bookmarklets code",cls:"cm-url",href:"javascript:(function(){var%20i%20%3Ddocument.location.href%3B%20document.location.href%3D%22obsidian%3A%2F%2Fweb-open%3Furl%3D%22%20%2B%20encodeURIComponent%28i%29%3B})();"}),o.addEventListener("click",a=>{a.preventDefault(),ne.clipboard.writeText("javascript:(function(){var%20i%20%3Ddocument.location.href%3B%20document.location.href%3D%22obsidian%3A%2F%2Fweb-open%3Furl%3D%22%20%2B%20encodeURIComponent%28i%29%3B})();"),new A.Notice(E("Copy BookmarkLets Success"))}),i.createSpan({cls:"wb-btn-tip",text:E("   <- Drag or click on me")})}addAboutInfo(e,t){const s=t.createDiv({cls:"wb-about-card"});A.setIcon(s.createDiv({cls:"wb-about-icon"}),"surfing"),s.createDiv({cls:"wb-about-text",text:"Surfing"});const i=this.plugin.manifest.version,o="https://github.com/Quorafind/Obsidian-Surfing/releases/tag/"+i;s.createEl("a",{cls:"wb-about-version",href:o,text:i})}useIconList(e,t){const s=E("Use icon list to replace defult text actions in empty view")+E("(Reload to take effect)");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.useIconList).onChange(async o=>{this.plugin.settings.useIconList=o,this.applySettingsUpdate()})})}addDarkMode(e,t){const s=E("Toggle Dark Mode");new A.Setting(t).setName(s).addToggle(i=>{i.setValue(this.plugin.settings.darkMode).onChange(async o=>{this.plugin.settings.darkMode=o,this.applySettingsUpdate()})})}addRandomBackground(e,t){new A.Setting(t).setName("Random Background").addToggle(i=>{i.setValue(this.plugin.settings.randomBackground).onChange(async o=>{this.plugin.settings.randomBackground=o,this.applySettingsUpdate()})})}addMyIcons(e,t){let s=E("Working On, Not Available Now");new A.Setting(t).setName(s).settingEl.classList.add("wb-theme-settings-working-on"),s=E("Random Icons From Default Art"),new A.Setting(t).setName(s).addToggle(o=>{o.setValue(this.plugin.settings.useCustomIcons).setDisabled(!0).onChange(async a=>{this.plugin.settings.useCustomIcons=a,this.applySettingsUpdate()})})}addBookmarkManagerSettings(e,t){new A.Setting(t).setName(E("Open BookmarkBar & Bookmark Manager")).addToggle(s=>{s.setValue(this.plugin.settings.bookmarkManager.openBookMark).onChange(async i=>{this.plugin.settings.bookmarkManager.openBookMark=i,this.applySettingsUpdate(),this.display()})}),this.plugin.settings.bookmarkManager.openBookMark&&(new A.Setting(t).setName(E("Save Bookmark When Open URI")).addToggle(s=>{s.setValue(this.plugin.settings.bookmarkManager.saveBookMark).onChange(async i=>{this.plugin.settings.bookmarkManager.saveBookMark=i,this.applySettingsUpdate()})}),new A.Setting(t).setName(E("Send to ReadWise")).setDesc(E("Add a action in page header to Send to ReadWise.")).addToggle(s=>{s.setValue(this.plugin.settings.bookmarkManager.sendToReadWise).onChange(async i=>{this.plugin.settings.bookmarkManager.sendToReadWise=i,this.applySettingsUpdate()})}),new A.Setting(t).setName(E("Bookmark Folder")).setDesc(E("Vault folder where bookmark files are stored.")).addText(s=>{s.setPlaceholder(ie.bookmarkManager.bookmarkFolder).setValue(this.plugin.settings.bookmarkManager.bookmarkFolder).onChange(i=>{this.plugin.settings.bookmarkManager.bookmarkFolder=i||ie.bookmarkManager.bookmarkFolder,this.applySettingsUpdate()})}),new A.Setting(t).setName(E("Default Category")).addText(s=>{s.setPlaceholder(ie.bookmarkManager.defaultCategory).setValue(this.plugin.settings.bookmarkManager.defaultCategory).onChange(i=>{this.plugin.settings.bookmarkManager.defaultCategory=i,this.applySettingsUpdate()})}))}generateAdBlockSettings(e,t){let s=E("Enable Ad Blocking");if(new A.Setting(t).setName(s).setDesc(E("Block requests to domains in your filter lists.")).addToggle(i=>i.setValue(this.plugin.settings.adBlock.enabled).onChange(async o=>{this.plugin.settings.adBlock.enabled=o,await this.plugin.saveSettings(),this.plugin.adBlockManager&&await this.plugin.adBlockManager.reload(),this.display()})),s=E("Enable Element Hiding"),new A.Setting(t).setName(s).setDesc(E("Allow picking and hiding page elements.")).addToggle(i=>i.setValue(this.plugin.settings.elementHiding.enabled).onChange(async o=>{this.plugin.settings.elementHiding.enabled=o,await this.plugin.saveSettings()})),this.plugin.settings.adBlock.enabled){s=E("Filter Lists");const i=new A.Setting(t).setName(s).setDesc(E("Manage filter lists for ad blocking."));i.addButton(o=>o.setButtonText("+").onClick(async()=>{this.plugin.settings.adBlock.filterLists.push({name:"New Filter",url:"",enabled:!0}),await this.plugin.saveSettings(),this.display()})),i.addButton(o=>o.setButtonText(E("Reload Filter Lists")).onClick(async()=>{this.plugin.adBlockManager&&(await this.plugin.adBlockManager.reload(),new A.Notice(E("Filter lists reloaded.")))})),this.plugin.settings.adBlock.filterLists.forEach((o,a)=>{const c=new A.Setting(t).setClass("search-engine-setting");c.addText(l=>l.setPlaceholder("Name").setValue(o.name).onChange(async d=>{this.plugin.settings.adBlock.filterLists[a].name=d,await this.plugin.saveSettings()})),c.addText(l=>{l.setPlaceholder("URL or vault path").setValue(o.url).onChange(async d=>{this.plugin.settings.adBlock.filterLists[a].url=d,await this.plugin.saveSettings()}),new Wi(this.app,l.inputEl)}),c.addToggle(l=>l.setValue(o.enabled).onChange(async d=>{this.plugin.settings.adBlock.filterLists[a].enabled=d,await this.plugin.saveSettings()})),c.addExtraButton(l=>l.setIcon("trash").onClick(async()=>{this.plugin.settings.adBlock.filterLists.splice(a,1),await this.plugin.saveSettings(),this.display()}))})}}}class Na{constructor(n){y(this,"content");y(this,"sContent");this.content=n,this.sContent=n.split(`
`)}searchLines(n,e){return n.substring(n.substring(0,e).lastIndexOf(`
`)+1,e+n.substring(e).indexOf(`
`))}search(n,e){let t="";if(!e)t=this.searchLines(this.content,n);else{t=this.searchLines(this.content,n);const s=this.sContent.findIndex(i=>i.startsWith(t));s===0?t=this.sContent.slice(0,2).filter(i=>i&&i.trim()).join("<br>"):t=this.sContent.slice(s-1,s+1).filter(i=>i&&i.trim()).join("<br>")}return t}}class Pa{constructor(n,e,t,s,i){y(this,"parent");y(this,"path");y(this,"foundWords");y(this,"matches");y(this,"plugin");this.parent=n,this.path=e,this.foundWords=t,this.matches=s,this.plugin=i}async onload(){const n=this.parent.createDiv({cls:"wb-omni-item"});n.createDiv({cls:"wb-omni-item-path",text:this.path});const e=n.createDiv({cls:"wb-omni-item-content-list"}),t=this.plugin.app.vault.getAbstractFileByPath(this.path);let s="";if(t instanceof A.TFile&&(s=await this.plugin.app.vault.cachedRead(t)),!t)return;const i=new Na(s);this.matches.length>0&&this.matches.forEach(o=>{e.createDiv({cls:"wb-content-list-text"}).appendChild(A.sanitizeHTMLToDom(i.search(o.offset,!0)))})}}function ps(){return window.omnisearch}class _a{constructor(n,e){y(this,"leaf");y(this,"plugin");y(this,"wbOmniSearchCtnEl");y(this,"query");y(this,"result");this.plugin=e,this.leaf=n}onload(){this.wbOmniSearchCtnEl=this.leaf.view.contentEl.createDiv({cls:"wb-omni-box"}),this.hide()}hide(){this.wbOmniSearchCtnEl.isShown()&&this.wbOmniSearchCtnEl.hide()}show(){this.wbOmniSearchCtnEl.isShown()||this.wbOmniSearchCtnEl.show()}notFound(){this.wbOmniSearchCtnEl.empty(),this.wbOmniSearchCtnEl.createDiv({text:"No results found",cls:"wb-omni-item-notfound"})}tick(n){var e;if(this.result!==n&&(this.result=n),!this.result||((e=this.result)==null?void 0:e.length)===0){this.show(),this.notFound();return}if(this.result.length>0){if(!this.result[0].foundWords.find(t=>t===this.query)){this.notFound();return}this.show(),this.result.forEach(t=>{new Pa(this.wbOmniSearchCtnEl,t.path,t.foundWords,t.matches,this.plugin).onload()})}}async update(n){var t;if(this.query===n)return;this.wbOmniSearchCtnEl.empty(),this.query=n;const e=await((t=ps())==null?void 0:t.search(this.query));this.tick(e),(!e||(e==null?void 0:e.length)===0)&&window.setTimeout(()=>{(async()=>{var i;const s=await((i=ps())==null?void 0:i.search(this.query??n));this.tick(s)})()},3e3)}onunload(){this.wbOmniSearchCtnEl.empty(),this.wbOmniSearchCtnEl.detach()}}class gs{constructor(n,e,t,s,i,o){y(this,"parentEl");y(this,"plugin");y(this,"categoryName");y(this,"view");y(this,"bookmarks");y(this,"isRoot");this.parentEl=n,this.plugin=e,this.categoryName=s,this.view=t,this.bookmarks=i,this.isRoot=o}onload(){this.isRoot?this.renderBookmark():this.renderFolder()}renderFolder(){const n=this.parentEl.createDiv({cls:"wb-bookmark-folder"}),e=n.createDiv({cls:"wb-bookmark-folder-icon"});n.createDiv({cls:"wb-bookmark-folder-title",text:this.categoryName}),A.setIcon(e,"folder-closed");let t;n.onclick=s=>{const i=new A.Menu;if(!t){const o=s.target,a=o.parentElement;a.classList.contains("wb-bookmark-folder")?t=a.getBoundingClientRect():t=o.getBoundingClientRect()}for(const o of this.bookmarks)i.addItem(a=>{a.setIcon("surfing").setTitle(o.name).onClick(c=>{if(c.shiftKey){window.open(o.url,"_blank","external");return}!c.ctrlKey&&!c.metaKey?K.spawnWebBrowserView(this.plugin,!1,{url:o.url}):K.spawnWebBrowserView(this.plugin,!0,{url:o.url})})});i.showAtPosition({x:t.left,y:t.bottom})}}renderBookmark(){if(this.bookmarks.length!==0)for(const n of this.bookmarks){const e=this.parentEl.createDiv({cls:"wb-bookmark-item"}),t=e.createDiv({cls:"wb-bookmark-item-icon"});A.setIcon(t,"album"),e.createDiv({cls:"wb-bookmark-item-title",text:n.name}),e.onclick=s=>{if(s.shiftKey){window.open(n.url,"","external");return}!s.ctrlKey&&!s.metaKey?K.spawnWebBrowserView(this.plugin,!1,{url:n.url}):K.spawnWebBrowserView(this.plugin,!0,{url:n.url})}}}}class $i{constructor(n,e){y(this,"view");y(this,"plugin");y(this,"BookmarkBarEl");y(this,"BookmarkBarContainerEl");this.view=n,this.plugin=e}async onload(){const n=this.view.contentEl.querySelector(".wb-bookmark-bar");n&&n.detach(),this.BookmarkBarEl=this.view.contentEl.createDiv({cls:"wb-bookmark-bar"}),this.renderIcon();const e=this.plugin.bookmarkCache;this.render(e)}renderIcon(){const n=this.BookmarkBarEl.createDiv({cls:"wb-bookmark-manager-entry"}),e=n.createDiv({cls:"wb-bookmark-manager-icon"});n.onclick=async()=>{var i,o;const t=this.plugin.settings.bookmarkManager.bookmarkFolder||"surfing-bookmarks",s=this.plugin.app.workspace.getLeavesOfType("file-explorer")[0];if(s){this.plugin.app.workspace.revealLeaf(s);const a=this.plugin.app.vault.getAbstractFileByPath(t);a&&((o=(i=s.view)==null?void 0:i.revealInFolder)==null||o.call(i,a))}},A.setIcon(e,"bookmark")}render(n){this.BookmarkBarContainerEl&&this.BookmarkBarContainerEl.detach(),this.BookmarkBarContainerEl=this.BookmarkBarEl.createDiv({cls:"wb-bookmark-bar-container"});const e=new Map;for(const s of n){const i=s.category.length>0?s.category[0]:"ROOT";e.has(i)||e.set(i,[]),e.get(i).push(s)}for(const[s,i]of e)s!=="ROOT"&&new gs(this.BookmarkBarContainerEl,this.plugin,this.view,s,i,!1).onload();const t=e.get("ROOT")||[];for(const s of t)new gs(this.BookmarkBarContainerEl,this.plugin,this.view,"ROOT",[s],!0).onload()}}const Oe=A.moment;function fs(r){return Array.isArray(r)?r:typeof r=="string"?[r]:null}function ms(r,n){return r?new Date(r).getTime():n}function Ra(r){return r.replace(/[\\/:*?"<>|#^[\]]/g," ").replace(/\s+/g," ").trim().slice(0,200)}function $t(r){return A.normalizePath(r.settings.bookmarkManager.bookmarkFolder||"surfing-bookmarks")}async function Ba(r){const n=$t(r);r.app.vault.getAbstractFileByPath(n)||await r.app.vault.createFolder(n)}async function ji(r){const n=$t(r),e=r.app.vault.getAbstractFileByPath(n);if(!e||!(e instanceof A.TFolder))return[];const t=[];for(const s of e.children)if(s instanceof A.TFile&&s.extension==="md"){const i=await Da(r,s);i&&t.push(i)}return t}async function Da(r,n){const e=r.app.metadataCache.getFileCache(n),t=e==null?void 0:e.frontmatter;return!t||!t.url?null:{file:n,name:n.basename,url:typeof t.url=="string"?t.url:"",description:typeof t.description=="string"?t.description:"",tags:fs(t.tags)??[],category:fs(t.category)??["ROOT"],created:ms(t.created,n.stat.ctime),modified:ms(t.modified,n.stat.mtime)}}async function Dn(r,n){if(await Ba(r),qi(r,n.url))return null;const e=$t(r);let t=Ra(n.name||"Untitled");t||(t="Untitled");let s=A.normalizePath(`${e}/${t}.md`),i=1;for(;r.app.vault.getAbstractFileByPath(s);)s=A.normalizePath(`${e}/${t} ${i}.md`),i++;const o=Oe().format("YYYY-MM-DDTHH:mm:ss"),a=n.tags||[],c=n.category||["ROOT"],l=a.length>0?`
tags:
${a.map(g=>`  - ${g}`).join(`
`)}`:`
tags: []`,d=`
category:
${c.map(g=>`  - ${g}`).join(`
`)}`,p=`---
url: "${n.url.replace(/"/g,'\\"')}"
description: "${(n.description||"").replace(/"/g,'\\"')}"${l}${d}
created: ${o}
modified: ${o}
---
`;return await r.app.vault.create(s,p)}function qi(r,n){return r.bookmarkCache.some(e=>e.url===n)}function st(r,n){const e=$t(r);return n.startsWith(e+"/")}async function at(r){r.bookmarkCache=await ji(r)}function St(r){const n=r.app.workspace.getLeavesOfType("empty");n.length>0&&n.forEach(t=>{t.rebuildView()});const e=r.app.workspace.getLeavesOfType("surfing-view");e.length>0&&e.forEach(t=>{var s,i;(i=(s=t.view)==null?void 0:s.bookmarkBar)==null||i.onload()})}function Me(r){try{return decodeURI(r)}catch{return r}}function Hi(r,n){const e=(r||"").toLowerCase();return[...Pe,...n].find(t=>t.name.toLowerCase()===e)??Pe[0]}const Ua=["http","https","file","about","data","blob","javascript","vbscript","chrome","chrome-extension","chrome-error","view-source","devtools"];function bs(r){var t;const n=r.trim(),e=(t=/^([a-z][a-z0-9+.-]+):/i.exec(n))==null?void 0:t[1];return!e||/^\d/.test(n.slice(e.length+1))?!1:!Ua.includes(e.toLowerCase())}const Ct=r=>r.startsWith("http://")||r.startsWith("https://")||r.startsWith("file://")&&/\.htm(l)?/g.test(r),Un=(r,n)=>{const e=/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#?&//=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/g,t=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/g;let s=n;if(e.test(s)){const i=s.slice(0,7).toLowerCase(),o=s.slice(0,8).toLowerCase();i==="http://"||i==="file://"||o==="https://"||(s="https://"+s)}else!(s.startsWith("file://")||/\.htm(l)?/g.test(s))&&!t.test(encodeURI(s))&&(s=r+s);return/^(https?|file):\/\//g.test(s)||(s=r+s),s},Wa=(r,n)=>{let e=r;if(!e)return;const t=n.settings,s=/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#?&//=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/g,i=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/g;if(s.test(e)){const o=e.slice(0,7).toLowerCase(),a=e.slice(0,8).toLowerCase();o==="http://"||o==="file://"||a==="https://"||(e="https://"+e)}else(!(e.startsWith("file://")||/\.htm(l)?/g.test(e))&&!i.test(encodeURI(e))||!/^(https?|file):\/\//g.test(e))&&(e=Hi(t.defaultSearchEngine,t.customSearchEngine).url+e);return e||r};function vs(r){if(!r||r.contains(" "))return!1;try{new URL(r)}catch{return!1}return!0}const Fa=/^(([^<>()[\]\\.,;:\s@"`]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/;function ws(r){return Fa.test(r)}class $a{constructor(n){y(this,"plugin");this.plugin=n}async inject(n){await this.injectDarkMode(n),this.injectHoverLinkDetection(n)}async injectDarkMode(n){try{if(this.plugin.settings.darkMode)try{await n.executeJavaScript(`
						const element = document.createElement('script');

						fetch('https://cdn.jsdelivr.net/npm/darkreader/darkreader.min.js')
							.then((response) => {
								element.src = response.url;
								document.body.appendChild(element);
							})
							.catch((error) => {
								console.error('Error loading the script:', error);
							});

						element.onload = () => {
							try {
								DarkReader?.setFetchMethod(window.fetch);
								DarkReader?.enable({
									brightness: 100,
									contrast: 90,
									sepia: 10
								});
								console.log(DarkReader);
							} catch (err) {

								window.myPostPort?.postMessage('darkreader-failed');
								console.error('Failed to load dark reader: ', err);

							}
						};0
					`)}catch{}}catch{}}injectHoverLinkDetection(n){n.executeJavaScript(`
				window.addEventListener('mouseover', (e) => {
					if(!e.target) return;
					if(!e.ctrlKey && !e.metaKey) return;
					// Tag name is a tag
					if(e.target.tagName.toLowerCase() === 'a'){
						window.myPostPort?.postMessage('link ' + e.clientX + ' ' + e.clientY + ' ' + e.target.href);
					}
				});
			`)}}async function Vi(r,n=800,e=5e3){try{await r.executeJavaScript(`
			new Promise((resolve) => {
				if (document.readyState !== 'complete') {
					window.addEventListener('load', () => startObserving(), { once: true });
				} else {
					startObserving();
				}
				function startObserving() {
					let timer = null;
					const observer = new MutationObserver(() => {
						if (timer) clearTimeout(timer);
						timer = setTimeout(() => {
							observer.disconnect();
							resolve();
						}, ${n});
					});
					observer.observe(document.body, {
						childList: true, subtree: true, characterData: true
					});
					// If no mutations happen within quietMs, resolve immediately
					timer = setTimeout(() => {
						observer.disconnect();
						resolve();
					}, ${n});
					// Hard timeout
					setTimeout(() => {
						observer.disconnect();
						resolve();
					}, ${e});
				}
			})
			`,!0)}catch{}}class hn{constructor(n,e,t){y(this,"contentEl");y(this,"webviewEl");y(this,"node");y(this,"currentUrl");y(this,"plugin");this.contentEl=n.createDiv({cls:"wb-view-content"}),this.node=n,this.currentUrl=e,this.plugin=t}onload(){this.contentEl.empty(),this.appendWebView()}appendWebView(){const n=this.contentEl.doc;this.webviewEl=n.createElement("webview"),this.webviewEl.setAttribute("allowpopups",""),this.webviewEl.setAttribute("webpreferences","nodeIntegration=false, contextIsolation=true, sandbox=true"),this.webviewEl.addClass("wb-frame"),this.currentUrl&&this.webviewEl.setAttribute("src",this.currentUrl),this.webviewEl.addEventListener("dom-ready",()=>{const e=ne.remote.webContents.fromId(this.webviewEl.getWebContentsId());if(e){e.setWindowOpenHandler(t=>t.disposition!=="foreground-tab"?(K.spawnWebBrowserView(this.plugin,!0,{url:t.url}),{action:"allow"}):{action:"deny"});try{const s=this.plugin.settings.highlightFormat,i=()=>{var c;let o="";const a=(c=s.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:c[0];if(a){const l=Oe().format(a.replace(/{TIME:([^}]*)}/g,"$1"));return o=s.replace(a,l),o}return o};e.executeJavaScript(`
					window.addEventListener('dragstart', (e) => {
						if(e.ctrlKey || e.metaKey) {
							e.dataTransfer.clearData();
							const selectionText = document.getSelection().toString();
							const linkToHighlight = e.srcElement.baseURI.replace(/#:~:text=(.*)/g, "") + "#:~:text=" + encodeURIComponent(selectionText);
							let link = "";
							if ("${s}".includes("{TIME")) {
								link = "${i()}";
							}
							link = (link != "" ? link : "${s}").replace(/{URL}/g, linkToHighlight).replace(/{CONTENT}/g, selectionText.replace(/\\n/g, " "));

							e.dataTransfer.setData('text/plain', link);
							console.log(e);
						}
					});
					`,!0).then(()=>{})}catch{}}}),this.webviewEl.addEventListener("did-navigate-in-page",e=>{if(e.url.contains("contacts.google.com/widget")){const t=ne.remote.webContents.fromId(this.webviewEl.getWebContentsId());t==null||t.stop();return}this.currentUrl=e.url}),this.webviewEl.addEventListener("destroyed",()=>{n!==this.contentEl.doc&&(this.webviewEl.detach(),this.appendWebView())}),n.contains(this.contentEl)?this.contentEl.appendChild(this.webviewEl):this.contentEl.onNodeInserted(()=>{this.contentEl.doc===n?this.contentEl.appendChild(this.webviewEl):this.appendWebView()})}}class ja{constructor(n){y(this,"ctx");y(this,"menu",null);y(this,"hoverPopover",null);y(this,"webContents",null);y(this,"webviewEl",null);y(this,"menuTargets",new WeakSet);y(this,"createMenu",(n,e)=>{var c,l,d;this.menu&&((c=this.menu)==null||c.close());const t=this.ctx.plugin;this.menu=new A.Menu;const s=()=>{var p;(p=this.ctx.leaf)==null||p.history.back()},i=()=>{var p;(p=this.ctx.leaf)==null||p.history.forward()},o=this.addTargetItems(n,e);!e.selectionText&&!o&&this.menu.addItem(p=>{p.setTitle(E("Refresh Current Page")),p.setIcon("refresh-ccw"),p.onClick(()=>{var u;(u=this.ctx.leaf)==null||u.rebuildView()})}).addItem(p=>{p.setTitle(E("Back")),p.setIcon("arrow-left"),p.onClick(()=>{s()})}).addItem(p=>{p.setTitle(E("Forward")),p.setIcon("arrow-right"),p.onClick(()=>{i()})}).addSeparator(),this.menu.addItem(p=>{p.setTitle(E("Open Current URL In External Browser")),p.setIcon("link"),p.onClick(()=>{window.open(e.pageURL,"_blank")})}).addItem(p=>{p.setTitle(E("Save Current Page As Markdown")),p.setIcon("download"),p.onClick(async()=>{try{await Vi(n);const u=await n.executeJavaScript("document.documentElement.outerHTML",!0);if(typeof u!="string")return;const g=n.getTitle().replace(/[/\\?%*:|"<>]/g,"-"),h=new DOMParser().parseFromString(u,"text/html"),b=h.createElement("base");b.href=e.pageURL.replace(/\?(.*)/g,""),h.head.prepend(b);const f=new Rn(h,{url:e.pageURL,markdown:!0}).parse(),S=["---",`title: "${g}"`,f.author?`author: "${f.author}"`:null,f.published?`published: "${f.published}"`:null,`url: "${e.pageURL}"`,`date: "${new Date().toISOString().slice(0,10)}"`,"---",""].filter(Boolean).join(`
`)+(f.content||""),k=await t.app.vault.create((t.settings.markdownPath?t.settings.markdownPath+"/":"/")+g+".md",S);await t.app.workspace.openLinkText(k.path,"",!0)}catch{}})}).addItem(p=>{p.setTitle(E("Copy Current Viewport As Image")),p.setIcon("image"),p.onClick(async()=>{try{n.capturePage().then(u=>{ne.clipboard.writeImage(u)})}catch{}})});const a=e.selectionText;if(a){this.menu.addSeparator(),this.menu.addItem(u=>{u.setTitle(E("Search Text")),u.setIcon("search"),u.onClick(()=>{try{K.spawnWebBrowserView(t,!0,{url:a})}catch{}})}),this.menu.addSeparator(),this.menu.addItem(u=>{u.setTitle(E("Copy Plain Text")),u.setIcon("copy"),u.onClick(()=>{try{navigator.clipboard.writeText(a)}catch{}})}),this.menu.addItem(u=>{u.setTitle("Save selection as markdown").setIcon("download").onClick(async()=>{const g=a,m=n.getTitle().replace(/[/\\?%*:|"<>]/g,"-"),h=await t.app.vault.create((t.settings.markdownPath?t.settings.markdownPath+"/":"/")+m+".md",g);await t.app.workspace.openLinkText(h.path,"",!0)})});const p=t.settings.highlightFormat;this.menu.addItem(u=>{u.setTitle(E("Copy Link to Highlight")),u.setIcon("link"),u.onClick(()=>{var g,m;try{let h=encodeURIComponent(a);const b=/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/gi,f=a.split(`
`);if((((g=a.match(b))==null?void 0:g.length)??0)>50)if(f.length>1){const C=f[0],O=f[f.length-1];h=encodeURIComponent(C.slice(0,3))+","+encodeURIComponent(O.slice(O.length-4,O.length))}else h=encodeURIComponent(a.substring(0,8))+","+encodeURIComponent(a.substring(a.length-8,a.length));else if(f.length>1){const C=f[0].split(" "),O=f[f.length-1].split(" ");h=encodeURIComponent(C.slice(0,3).join(" "))+","+encodeURIComponent(O.slice(O.length-1,O.length).join(" "))}const v=e.pageURL.replace(/#:~:text=(.*)/g,"")+"#:~:text="+h,S=a.replace(/\n/g," ");let k="";if(p.contains("{TIME")){const C=(m=p.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:m[0];if(C){const O=Oe().format(C.replace(/{TIME:([^}]*)}/g,"$1"));k=p.replace(C,O)}}k=(k!=""?k:p).replace(/\{URL\}/g,v).replace(/\{CONTENT\}/g,S),ne.clipboard.writeText(k)}catch{}})})}(l=e.pageURL)!=null&&l.contains("bilibili.com/")&&(this.menu.addSeparator(),this.menu.addItem(p=>{p.setTitle(E("Copy Video Timestamp")),p.setIcon("link"),p.onClick(()=>{try{n.executeJavaScript(`
											var time = document.querySelectorAll('.bpx-player-ctrl-time-current')[0].innerHTML;
											var timeYMSArr=time.split(':');
											var joinTimeStr='00h00m00s';
											if(timeYMSArr.length===3){
												 joinTimeStr=timeYMSArr[0]+'h'+timeYMSArr[1]+'m'+timeYMSArr[2]+'s';
											}else if(timeYMSArr.length===2){
												 joinTimeStr=timeYMSArr[0]+'m'+timeYMSArr[1]+'s';
											}
											var timeStr= "";
											var pageStrMatch = window.location.href.match(/(p=[1-9]{1,})/g);
											var pageStr = "";
											if(typeof pageStrMatch === "object" && pageStrMatch?.length > 0){
											    pageStr = '&' + pageStrMatch[0];
											}else if(typeof pageStrMatch === "string") {
											    pageStr = '&' + pageStrMatch;
											}
											timeStr = window.location.href.split('?')[0]+'?t=' + joinTimeStr + pageStr;
										`,!0).then(u=>{typeof u=="string"&&ne.clipboard.writeText("["+(u.split("?t=")[1]??"").replace(/&p=[1-9]{1,}/g,"")+"]("+u+")")})}catch{}})})),(d=t.chromeExtensions)==null||d.addPageMenuItems(this.menu,e,this.webviewEl),this.menu.showAtPosition({x:e.x,y:e.y})});this.ctx=n}async register(n,e){this.webContents=n,this.webviewEl=e,this.menuTargets.has(e)||(this.menuTargets.add(e),e.addEventListener("context-menu",s=>{var l;const i=s.params??{},o=e.getBoundingClientRect();if((l=this.hoverPopover)==null||l.hide(),!this.webContents)return;const a=i.x??NaN,c=i.y??NaN;this.createMenu(this.webContents,{...i,pageURL:i.pageURL||this.ctx.getUrl(),guestX:a,guestY:c,x:a+o.x,y:c+o.y})})),await n.executeJavaScript(`
			window.addEventListener("message", (e) => {
				window.myPostPort = e.ports[0];
			})
			document.addEventListener('click', (e) => {
				window.myPostPort?.postMessage('click');
			});
			document.addEventListener('scroll', (e) => {
				window.myPostPort?.postMessage('scroll');
			});0

		`);const t=new MessageChannel;t.port1.onmessage=s=>{var o,a;const i=s.data;if(typeof i=="string"&&i.startsWith("link ")){this.hoverPopover&&this.hoverPopover.hide();const c=i.split(" ")[1],l=i.split(" ")[2],d=i.split(" ")[3];if(!d||!d.startsWith("http"))return;this.hoverPopover=new A.HoverPopover(this.ctx.contentEl,null,100);const p=e.getClientRects(),u={x:parseInt(c??"",10)+p[0].x,y:parseInt(l??"",10)+p[0].y};window.setTimeout(()=>{var h;(h=this.hoverPopover)==null||h.position({x:u.x,y:u.y,doc:this.ctx.contentEl.doc})},100),this.hoverPopover.hoverEl.toggleClass("surfing-hover-popover",!0);const g=this.hoverPopover.hoverEl.createDiv({cls:"surfing-hover-popover-container"});new hn(g,d,this.ctx.plugin).onload();return}i!=="darkreader-failed"?((o=this.menu)==null||o.close(),(a=this.hoverPopover)==null||a.hide()):n.executeJavaScript(`
										window.getComputedStyle( document.body ,null).getPropertyValue('background-color');
							`,!0).then(c=>{if(typeof c!="string")return;const l=c.slice(c.indexOf("(")+1,c.indexOf(")")).split(", ").map(Number);Math.sqrt((l[0]??NaN)**2*.241+(l[1]??NaN)**2*.691+(l[2]??NaN)**2*.068)>120&&n.insertCSS(`
							html {
								filter: invert(90%) hue-rotate(180deg);
							}

							img, svg, div[class*="language-"] {
								filter: invert(110%) hue-rotate(180deg);
								opacity: .8;
							}

							video, canvas {
								filter: invert(110%) hue-rotate(180deg);
								opacity: 1;
							}
					`)})},e.contentWindow.postMessage("test","*",[t.port2])}close(){var n,e;(n=this.menu)==null||n.close(),(e=this.hoverPopover)==null||e.hide()}addTargetItems(n,e){const t=this.menu;if(!t)return!1;let s=!1;const i=e.linkURL;i&&/^(https?|file):/i.test(i)&&(t.addItem(a=>a.setTitle(E("Open Link In New Tab")).setIcon("external-link").onClick(()=>K.spawnWebBrowserView(this.ctx.plugin,!0,{url:i}))).addItem(a=>a.setTitle(E("Open Link In External Browser")).setIcon("globe").onClick(()=>window.open(i,"_blank","external"))).addItem(a=>a.setTitle(E("Copy Link Address")).setIcon("link").onClick(()=>ne.clipboard.writeText(i))),s=!0);const o=e.srcURL;if(e.mediaType==="image"&&o&&(t.addItem(a=>a.setTitle(E("Copy Image")).setIcon("image").onClick(()=>n.copyImageAt(e.guestX,e.guestY))).addItem(a=>a.setTitle(E("Copy Image Address")).setIcon("link").onClick(()=>ne.clipboard.writeText(o))),s=!0),e.isEditable){const a=e.editFlags??{},c=(l,d,p,u)=>t.addItem(g=>g.setTitle(l).setIcon(d).setDisabled(!p).onClick(u));c(E("Cut"),"scissors",a.canCut!==!1,()=>n.cut()),c(E("Copy"),"copy",a.canCopy!==!1,()=>n.copy()),c(E("Paste"),"clipboard-paste",a.canPaste!==!1,()=>n.paste()),c(E("Select All"),"text-select",a.canSelectAll!==!1,()=>n.selectAll()),s=!0}return s&&t.addSeparator(),s}}class qa{constructor(n){y(this,"webviewEl");y(this,"containerEl");y(this,"config");y(this,"loaded",!1);y(this,"hooked",new Set);this.config=n}create(){this.containerEl=this.config.contentEl.createDiv({cls:"wb-webview-container"});const n=this.config.contentEl.doc;this.webviewEl=n.createElement("webview"),this.webviewEl.setAttribute("allowpopups",""),this.webviewEl.setAttribute("webpreferences","nodeIntegration=false, contextIsolation=true, sandbox=true"),this.config.sessionIsolation?this.webviewEl.partition="surfing-vault-"+this.config.appId+"-"+this.config.leafId:this.webviewEl.partition="persist:surfing-vault-"+this.config.appId,this.webviewEl.addClass("wb-frame"),this.registerEventListeners(n)}getContainerEl(){return this.containerEl}getWebContents(){return this.webviewEl?ne.remote.webContents.fromId(this.webviewEl.getWebContentsId())??null:null}waitForPageLoad(n=1e4){return new Promise(e=>{if(!this.webviewEl){e();return}let t=!1;const s=()=>{var o;t||(t=!0,(o=this.webviewEl)==null||o.removeEventListener("did-finish-load",i),e())},i=()=>s();this.webviewEl.addEventListener("did-finish-load",i),window.setTimeout(s,n)})}refresh(){const n=this.getWebContents();n&&n.reload()}clearHistory(n){const e=this.getWebContents();if(!e)return;const t=e.navigationHistory;t?t.clear():e.clearHistory(),e.executeJavaScript("history.pushState({}, '', location.href)"),n.backHistory.splice(0),n.forwardHistory.splice(0)}registerEventListeners(n){const e=this.config.callbacks;this.webviewEl.addEventListener("dom-ready",()=>{const t=this.getWebContents();if(t){if(e.onDomReady(t),this.hooked.has(t.id)){try{e.onDragStartInject(t)}catch{}return}this.hooked.add(t.id),t.on("before-input-event",(s,i)=>{if(i.type!=="keyDown")return;const o=new KeyboardEvent("keydown",{code:i.code,key:i.key,shiftKey:i.shift,altKey:i.alt,ctrlKey:i.control,metaKey:i.meta,repeat:i.isAutoRepeat});e.onKeyboardEvent(o,t)});try{e.onDragStartInject(t)}catch{}}}),this.webviewEl.addEventListener("focus",()=>{e.onFocus()}),this.webviewEl.addEventListener("page-favicon-updated",t=>{e.onFaviconUpdate(t.favicons)}),this.webviewEl.addEventListener("page-title-updated",t=>{e.onTitleUpdate(t.title)}),this.webviewEl.addEventListener("did-navigate",t=>{e.onNavigate(t.url,!1),e.onMenuClose()}),this.webviewEl.addEventListener("did-navigate-in-page",t=>{t.isMainFrame&&(e.onNavigate(t.url,!0),e.onMenuClose())}),this.webviewEl.addEventListener("did-fail-load",t=>{t.isMainFrame&&e.onNavigationFailed()}),this.webviewEl.addEventListener("destroyed",()=>{n!==this.config.contentEl.doc&&(this.webviewEl.detach(),e.onDestroyed())}),n.contains(this.config.contentEl)?this.containerEl.appendChild(this.webviewEl):this.config.contentEl.onNodeInserted(()=>{this.loaded||(this.loaded=!0,this.config.contentEl.doc===n?this.containerEl.appendChild(this.webviewEl):this.config.callbacks.onDestroyed())})}}const le="surfing-view";class K extends A.ItemView{constructor(e,t){super(e);y(this,"plugin");y(this,"searchBox");y(this,"currentUrl","");y(this,"currentTitle","Surfing");y(this,"headerBar");y(this,"favicon");y(this,"searchContainer");y(this,"bookmarkBar");y(this,"omnisearchEnabled");y(this,"contentInjector");y(this,"contextMenuHandler");y(this,"webviewManager");y(this,"readerModeActive",!1);y(this,"loadPending",!1);y(this,"readerOverlayEl",null);y(this,"createWebview",()=>{this.contentEl.empty(),this.plugin.settings.bookmarkManager.openBookMark&&(this.bookmarkBar=new $i(this.leaf.view,this.plugin),this.bookmarkBar.onload()),this.webviewManager=new qa({plugin:this.plugin,appId:this.app.appId,leafId:this.leaf.id,contentEl:this.contentEl,sessionIsolation:this.plugin.settings.sessionIsolation,getCurrentUrl:()=>this.currentUrl,recreateWebview:()=>this.createWebview(),callbacks:{onDomReady:e=>{(async()=>(e.setWindowOpenHandler(t=>(bs(t.url)?window.open(t.url,"_external"):K.spawnWebBrowserView(this.plugin,!0,{url:t.url,active:t.disposition!=="background-tab"}),{action:"deny"})),await this.contextMenuHandler.register(e,this.webviewEl),await this.contentInjector.inject(e)))()},onKeyboardEvent:(e,t)=>{if(this.plugin.settings.focusSearchBarViaKeyboard&&e.key==="/"&&!this.plugin.settings.ignoreList.find(s=>this.currentUrl.contains(s.toLowerCase()))){t.executeJavaScript("(e => !!e && (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e.isContentEditable))(document.activeElement)",!0).then(s=>{s||this.headerBar.focus()});return}activeDocument.body.dispatchEvent(e),e.ctrlKey&&e.key==="f"&&(this.searchBox=new ca(this.leaf,t,this.plugin))},onDragStartInject:e=>{const t=this.plugin.settings.highlightFormat,s=()=>{var a;let i="";const o=(a=t.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:a[0];if(o){const c=Oe().format(o.replace(/{TIME:([^}]*)}/g,"$1"));return i=t.replace(o,c),i}return i};e.executeJavaScript(`
						window.addEventListener('dragstart', (e) => {
							if(e.ctrlKey || e.metaKey) {
								e.dataTransfer.clearData();
								const selectionText = document.getSelection().toString();

								let tempText = encodeURIComponent(selectionText);
								const chineseRegex = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/gi;
								const englishSentence = selectionText.split('\\n');

								if (selectionText.match(chineseRegex)?.length > 50) {
									if (englishSentence.length > 1) {
										const fistSentenceWords = englishSentence[0];
										const lastSentenceWords = englishSentence[englishSentence.length - 1];

										tempText = encodeURIComponent(fistSentenceWords.slice(0, 4)) + "," + encodeURIComponent(lastSentenceWords.slice(lastSentenceWords.length - 4, lastSentenceWords.length));
									} else {
										tempText = encodeURIComponent(selectionText.substring(0, 8)) + "," + encodeURIComponent(selectionText.substring(selectionText.length - 8, selectionText.length));
									}
								} else if (englishSentence.length > 1) {

									const fistSentenceWords = englishSentence[0].split(' ');
									const lastSentenceWords = englishSentence[englishSentence.length - 1].split(' ');

									tempText = encodeURIComponent(fistSentenceWords.slice(0, 3).join(' ')) + "," + encodeURIComponent(lastSentenceWords.slice(lastSentenceWords.length - 1, lastSentenceWords.length).join(' '));
								}

								const linkToHighlight = e.srcElement.baseURI.replace(/#:~:text=(.*)/g, "") + "#:~:text=" + tempText;
								let link = "";
								if ("${t}".includes("{TIME")) {
									link = "${s()}";
								}
								link = (link != "" ? link : "${t}").replace(/{URL}/g, linkToHighlight).replace(/{CONTENT}/g, selectionText.replace(/\\n/g, " "));

								e.dataTransfer.setData('text/plain', link);
							}
						});
						`,!0)},onFocus:()=>{this.app.workspace.setActiveLeaf(this.leaf),activeDocument.body.dispatchEvent(new MouseEvent("click",{bubbles:!0}))},onFaviconUpdate:e=>{e[0]!==void 0&&(this.favicon.src=e[0]),this.leaf.tabHeaderInnerIconEl.empty(),this.leaf.tabHeaderInnerIconEl.appendChild(this.favicon)},onTitleUpdate:e=>{this.omnisearchEnabled&&this.updateSearchBox(),this.leaf.tabHeaderInnerTitleEl.innerText=e,this.currentTitle=e,this.app.workspace.trigger("surfing:page-change",e,this)},onNavigate:(e,t)=>{var s;this.readerModeActive&&!t&&((s=this.readerOverlayEl)==null||s.remove(),this.readerOverlayEl=null,this.readerModeActive=!1,this.webviewEl.setCssProps({display:""})),this.pageNavigated(e,t)},onNavigationFailed:()=>{this.loadPending=!1},onMenuClose:()=>{var e;(e=this.contextMenuHandler)==null||e.close()},onDestroyed:()=>{this.createWebview()}}}),this.webviewManager.create(),this.currentUrl&&this.navigate(this.currentUrl)});this.plugin=t,this.contentInjector=new $a(t),this.contextMenuHandler=new ja({plugin:t,getUrl:()=>this.currentUrl,getTitle:()=>this.currentTitle,leaf:this.leaf,contentEl:this.contentEl,webviewEl:this.webviewEl,navigateFn:s=>this.navigate(s),copyHighLightFn:()=>this.copyHighLight()}),this.omnisearchEnabled=!1}get webviewEl(){var e;return(e=this.webviewManager)==null?void 0:e.webviewEl}static spawnWebBrowserView(e,t,s){var d,p,u,g,m,h,b,f,v,S,k,C,O;const i=e.settings,o=i.openInSameTab,a=i.highlightInSameTab,c=e.app;if(!o||s.url.startsWith("file://")){if(s.url.contains("bilibili"))for(let I=0;I<c.workspace.getLeavesOfType(le).length;I++){const M=c.workspace.getLeavesOfType(le)[I];if(!M)continue;const B=M.getViewState().state;if(B!=null&&B.url&&B.url.split("?t=")[0]===s.url.split("?t=")[0]){M.view.navigate(s.url,!1,!0),M.rebuildView(),c.workspace.setActiveLeaf(M);return}}else if(s.url.contains("#:~:text=")&&a)for(let I=0;I<c.workspace.getLeavesOfType(le).length;I++){const M=c.workspace.getLeavesOfType(le)[I];if(!M)continue;const R=M.getViewState();if((d=R==null?void 0:R.state)!=null&&d.url&&R.state.url.split("#:~:text=")[0]===s.url.split("#:~:text=")[0]){M.view.navigate(s.url,!1,!0),M.rebuildView(),c.workspace.setActiveLeaf(M);return}}c.workspace.getLeaf(t).setViewState({type:le,active:s.active??!0,state:s});return}const l=c.workspace.getLeavesOfType(le).length?localStorage.getItem("web-browser-leaf-id"):(p=c.workspace.getLeavesOfType(le)[0])==null?void 0:p.id;if(l){if(s.active!=null&&s.active==!1){c.workspace.getLeaf(t).setViewState({type:le,active:!0,state:s});return}if(!c.workspace.getLeafById(l)){const I=(f=c.workspace.getLeavesOfType(le)[0])==null?void 0:f.id;if(I){localStorage.setItem("web-browser-leaf-id",I);const N=(v=c.workspace.getLeafById(I))==null?void 0:v.view;N&&N.navigate(s.url,!0),(S=c.workspace.getLeafById(I))==null||S.rebuildView();return}}if(((k=c.workspace.getLeafById(l))==null?void 0:k.view.getViewType())===le){((C=c.workspace.getLeafById(l))==null?void 0:C.view).navigate(s.url,!0),(O=c.workspace.getLeafById(l))==null||O.rebuildView();return}}else{let I;I=(u=c.workspace.getActiveViewOfType(A.MarkdownView))==null?void 0:u.leaf;const N=(g=c.workspace.getActiveViewOfType(A.ItemView))==null?void 0:g.getViewType();if(I||(I=N==="empty"||N==="surfing-bookmark-manager"?(m=c.workspace.getActiveViewOfType(A.ItemView))==null?void 0:m.leaf:void 0),!I)return;const M=N==="empty"?I:c.workspace.createLeafBySplit(I);localStorage.setItem("web-browser-leaf-id",M.id),M.setViewState({type:le,active:!0,state:s}),M.view.getViewType()!=="empty"&&M.rebuildView(),M.setPinned(!0),(b=(h=M.tabHeaderInnerTitleEl.parentElement)==null?void 0:h.parentElement)==null||b.addClass("same-tab");return}}getDisplayText(){return this.currentTitle}getViewType(){return le}openInpecter(){const e=this.getWebContents();e&&e.openDevTools()}async onOpen(){var e;this.navigation=!0,this.headerBar=new pn(this.titleContainerEl,this.plugin,this,!0),this.headerBar.onLoad(),this.favicon=createEl("img"),this.favicon.width=16,this.favicon.height=16,this.contentEl.addClass("wb-view-content"),this.omnisearchEnabled&&(this.searchContainer=new _a(this.leaf,this.plugin)),this.omnisearchEnabled&&((e=this.searchContainer)==null||e.onload()),this.headerBar.addOnSearchBarEnterListener(t=>{this.navigate(t)}),this.createWebview(),this.initHeaderButtons(),this.registerEvent(this.app.workspace.on("layout-change",()=>{const t=this.leaf.tabHeaderInnerIconEl;this.favicon.getAttribute("src")&&!t.contains(this.favicon)&&(t.empty(),t.appendChild(this.favicon))}))}onload(){var e;super.onload(),(e=this.contextMenuHandler)==null||e.close()}async onClose(){var e;(e=this.contextMenuHandler)==null||e.close()}initHeaderButtons(){this.addAction("book-open",E("Toggle Reader Mode"),()=>{this.toggleReaderMode()}),this.addAction("settings",E("settings"),()=>{this.app.setting.open(),this.app.setting.openTabById("surfing")}),this.addAction("star",E("star"),async()=>{if(qi(this.plugin,this.currentUrl)){new A.Notice("Bookmark already exists.");return}let e="";try{const s=this.getWebContents(),i=await(s==null?void 0:s.executeJavaScript(`document.querySelector('meta[name="description"]')?.content`));typeof i=="string"&&i&&(e=i)}catch{}const t=this.plugin.settings.bookmarkManager.defaultCategory||"ROOT";await Dn(this.plugin,{url:this.currentUrl,name:this.currentTitle,description:e,tags:[],category:[t]}),new A.Notice("Bookmark saved.")}),this.plugin.settings.bookmarkManager.sendToReadWise&&this.addAction("book",E("Send to ReadWise"),()=>{const e=(t,s)=>{open("https://readwise.io/save?title="+encodeURIComponent(t)+"&url="+encodeURIComponent(s))};try{e(this.currentTitle,this.currentUrl),new A.Notice("Save success!")}catch{new A.Notice("Save failed!")}})}async setState(e,t){this.navigate(e.url,!1)}updateSearchBox(){var a,c;const e=[...Pe,...this.plugin.settings.customSearchEngine],t=/^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/g,s=(c=(a=this.currentUrl)==null?void 0:a.match(t))==null?void 0:c[0];if(!s||!e.find(l=>l.url.startsWith(s)))return;const o=this.getWebContents();if(o)try{o.executeJavaScript(`
											document.querySelector('input')?.value
										`,!0).then(l=>{var d;typeof l=="string"&&((d=this.searchContainer)==null||d.update(l.toLowerCase()))})}catch{}}getWebContents(){var e;return((e=this.webviewManager)==null?void 0:e.getWebContents())??null}waitForPageLoad(e=1e4){var t;return((t=this.webviewManager)==null?void 0:t.waitForPageLoad(e))??Promise.resolve()}clearHistory(){var e;(e=this.webviewManager)==null||e.clearHistory(this.leaf.history)}getState(){return{url:this.currentUrl}}getCurrentTitle(){return this.currentTitle}pushHistory(){var e,t,s;this.currentUrl&&((s=(t=(e=this.leaf.history.backHistory.last())==null?void 0:e.state)==null?void 0:t.state)==null?void 0:s.url)!==this.currentUrl&&(this.leaf.history.backHistory.push({state:{type:le,state:this.getState()},title:this.currentTitle,icon:"search"}),this.headerEl.children[1].children[0].setAttribute("aria-disabled","false"))}pageNavigated(e,t){var s;if(!t){const i=this.loadPending;this.loadPending=!1,!i&&e!==this.currentUrl&&this.pushHistory(),(s=this.searchBox)==null||s.unload()}!e||e===this.currentUrl||(this.currentUrl=e,this.headerBar.setSearchBarUrl(e),this.app.workspace.requestSaveLayout())}navigate(e,t=!0,s=!0){var a;if(e==="")return;if(bs(e)){window.open(e.trim(),"_external");return}t&&this.pushHistory(),/^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?([/?#]|$)/i.test(e.trim())&&(e="http://"+e.trim());const i=/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#?&//=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/g,o=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/g;if(i.test(e)){const c=e.slice(0,7).toLowerCase(),l=e.slice(0,8).toLowerCase();c==="http://"||c==="file://"||l==="https://"||(e="https://"+e)}else(!(e.startsWith("file://")||/\.htm(l)?/g.test(e))&&!o.test(encodeURI(e))||!/^(https?|file):\/\//g.test(e))&&(e=Hi(this.plugin.settings.defaultSearchEngine,this.plugin.settings.customSearchEngine).url+e);this.currentUrl=e,this.headerBar.setSearchBarUrl(e),s&&(this.loadPending=!0,this.webviewEl.setAttribute("src",e)),(a=this.searchBox)==null||a.unload(),this.app.workspace.requestSaveLayout()}getCurrentTimestamp(e){const t=this.getWebContents();t&&t.executeJavaScript(`
					var time = document.querySelectorAll('.bpx-player-ctrl-time-current')[0].innerHTML;
					var timeYMSArr=time.split(':');
					var joinTimeStr='00h00m00s';
					if(timeYMSArr.length===3){
						 joinTimeStr=timeYMSArr[0]+'h'+timeYMSArr[1]+'m'+timeYMSArr[2]+'s';
					}else if(timeYMSArr.length===2){
						 joinTimeStr=timeYMSArr[0]+'m'+timeYMSArr[1]+'s';
					}
					var timeStr= "";
					timeStr = window.location.href.split('?')[0]+'?t=' + joinTimeStr;
				`,!0).then(s=>{if(typeof s!="string")return;const i="["+s.split("?t=")[1]+"]("+s+") ",o=e==null?void 0:e.posToOffset(e==null?void 0:e.getCursor());e==null||e.replaceRange(i,e==null?void 0:e.getCursor()),o&&(e==null||e.setCursor(e==null?void 0:e.offsetToPos(o+i.length)))})}refresh(){var e;(e=this.webviewManager)==null||e.refresh()}async toggleReaderMode(){var t;if(this.readerModeActive){(t=this.readerOverlayEl)==null||t.remove(),this.readerOverlayEl=null,this.readerModeActive=!1,this.webviewEl.setCssProps({display:""});return}const e=this.getWebContents();if(e)try{await Vi(e);const s=await e.executeJavaScript("document.documentElement.outerHTML",!0),i=typeof s=="string"?s:"",a=new DOMParser().parseFromString(i,"text/html"),c=createEl("base");c.href=this.currentUrl.replace(/\?(.*)/g,""),a.head.prepend(c);const l=new Rn(a,{url:this.currentUrl,markdown:!0}).parse(),d=l.content||"",p=this.webviewManager.getContainerEl();if(this.readerOverlayEl=p.createDiv({cls:"wb-reader-mode-overlay"}),this.readerOverlayEl.createEl("h1",{cls:"wb-reader-mode-title",text:l.title||this.currentTitle}),l.author||l.published){const g=this.readerOverlayEl.createDiv({cls:"wb-reader-mode-meta"});l.author&&g.createSpan({text:l.author}),l.published&&g.createSpan({text:l.published})}const u=this.readerOverlayEl.createDiv({cls:"wb-reader-mode-content"});await A.MarkdownRenderer.render(this.app,d,u,"",this),this.webviewEl.setCssProps({display:"none"}),this.readerModeActive=!0}catch{}}copyHighLight(){const e=this.plugin.settings.highlightFormat,t=()=>{var l;let a="";const c=(l=e.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:l[0];if(c){const d=Oe().format(c.replace(/{TIME:([^}]*)}/g,"$1"));return a=e.replace(c,d),a}return a},s=()=>this.currentUrl,i=()=>e.includes("{TIME"),o=this.getWebContents();o&&o.executeJavaScript(`
				const selectionText = document.getSelection().toString();
				let tempText = encodeURIComponent(selectionText);
				const chineseRegex = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/gi;
				const englishSentence = selectionText.split('\\n');

				if (selectionText.match(chineseRegex)?.length > 50) {
					if (englishSentence.length > 1) {
						const fistSentenceWords = englishSentence[0];
						const lastSentenceWords = englishSentence[englishSentence.length - 1];

						tempText = encodeURIComponent(fistSentenceWords.slice(0, 4)) + "," + encodeURIComponent(lastSentenceWords.slice(lastSentenceWords.length - 4, lastSentenceWords.length));
					} else {
						tempText = encodeURIComponent(selectionText.substring(0, 8)) + "," + encodeURIComponent(selectionText.substring(selectionText.length - 8, selectionText.length));
					}
				} else if (englishSentence.length > 1) {

					const fistSentenceWords = englishSentence[0].split(' ');
					const lastSentenceWords = englishSentence[englishSentence.length - 1].split(' ');

					tempText = encodeURIComponent(fistSentenceWords.slice(0, 3).join(' ')) + "," + encodeURIComponent(lastSentenceWords.slice(lastSentenceWords.length - 1, lastSentenceWords.length).join(' '));
				}

				let linkToHighlight = "${s()}".replace(/#:~:text=(.*)/g, "") + "#:~:text=" + tempText;

				let link = "";
				if (${i()}) {
					link = "${t()}";
				}
				link = (link != "" ? link : "${e}").replace(/{URL}/g, linkToHighlight).replace(/{CONTENT}/g, selectionText.replace(/\\n/g, " "));

				`,!0).then(a=>{typeof a=="string"&&ne.clipboard.writeText(a)})}}class Ha extends Ft{constructor(e,t,s){super(e,s);y(this,"plugin");this.app=e,this.inputEl=s,this.plugin=t}getSuggestions(e){const t=e.toLowerCase(),s=this.plugin.bookmarkCache;if(!s||s.length===0)return[];const i=s.filter(o=>o.url.toLowerCase().contains(t)||o.name.toLowerCase().contains(t)).map(o=>({isSearchFallback:!1,name:o.name,url:o.url,item:o}));return!i||i.length===0?(this.close(),[]):(i.unshift({isSearchFallback:!0,name:t,url:""}),i)}renderSuggestion(e,t){const s=t.createDiv({cls:"wb-bookmark-suggest-container"});s.createDiv({text:e.name,cls:"wb-bookmark-suggestion-text"}),s.createDiv({text:e.url,cls:"wb-bookmark-suggestion-url"}),t.classList.add("wb-bookmark-suggest-item")}selectSuggestion(e){if(e){if(e.isSearchFallback){const t=Un("",e.name);K.spawnWebBrowserView(this.plugin,!1,{url:t}),this.close();return}K.spawnWebBrowserView(this.plugin,!1,{url:e.url}),this.close()}}}const Va=50;class za extends Ft{constructor(e,t,s,i){super(e,s);y(this,"plugin");y(this,"files");y(this,"view");this.app=e,this.inputEl=s,this.plugin=t,this.view=i,this.files=this.app.vault.getFiles()}fuzzySearchItemsOptimized(e,t){const s=A.prepareFuzzySearch(e);return t.map(i=>{const o=s(i);return o?{item:i,match:o}:null}).filter(Boolean)}getSuggestions(e){const t=this.files.map(a=>a.path),s=e.trim(),o=(s.length<2?[]:this.fuzzySearchItemsOptimized(s,t)).sort((a,c)=>c.match.score-a.match.score).slice(0,Va).map(a=>({path:a.item,type:"file"}));return o.unshift({path:e,type:"web"}),o}renderSuggestion(e,t){t.createDiv({cls:"wb-bookmark-suggest-container"}).createDiv({text:e.path,cls:"wb-bookmark-suggestion-text"}),t.classList.add("wb-bookmark-suggest-item")}selectSuggestion(e){(async()=>{if(e){switch(e.type){case"web":{const t=Un("",e.path);K.spawnWebBrowserView(this.plugin,!1,{url:t});break}case"file":{const t=this.files.find(s=>s.path===e.path);t&&await this.view.leaf.openFile(t);break}}this.close()}})()}}function Ga(r){return r instanceof HTMLElement?r.instanceOf(HTMLInputElement)||r.instanceOf(HTMLTextAreaElement)||r.isContentEditable:!1}class pn extends A.Component{constructor(e,t,s,i){super();y(this,"plugin");y(this,"searchBar");y(this,"onSearchBarEnterListener",new Array);y(this,"view");y(this,"parentEl");y(this,"removeHeaderChild",!0);this.plugin=t,this.view=s,this.parentEl=e,i!==void 0&&(this.removeHeaderChild=i)}onLoad(){if(this.parentEl.addClass("wb-header-bar"),this.removeHeaderChild&&this.parentEl.empty(),this.initScope(),this.plugin.settings.showRefreshButton&&this.removeHeaderChild&&this.view.getViewType()!=="empty"){const e=this.parentEl.createDiv({cls:"wb-refresh-button"});e.addEventListener("click",()=>{this.view.leaf.rebuildView()}),A.setIcon(e,"refresh-cw")}this.searchBar=this.parentEl.createEl("input",{type:"text",placeholder:E("Search with")+this.plugin.settings.defaultSearchEngine+E("or enter address"),cls:"wb-search-bar"}),this.registerDomEvent(this.searchBar,"keydown",e=>{if(e.key==="Enter")for(const t of this.onSearchBarEnterListener)t(this.searchBar.value)}),this.plugin.settings.bookmarkManager.openBookMark||new za(this.plugin.app,this.plugin,this.searchBar,this.view),this.plugin.settings.bookmarkManager.openBookMark&&new Ha(this.plugin.app,this.plugin,this.searchBar),this.registerDomEvent(this.searchBar,"focusin",e=>{this.searchBar.select()}),this.registerDomEvent(this.searchBar,"focusout",e=>{var t;(t=window.getSelection())==null||t.removeAllRanges(),this.removeHeaderChild||this.searchBar.detach()})}initScope(){this.view.scope||(this.view.scope=new A.Scope(this.plugin.app.scope)),this.view.scope.register([],"/",e=>{if(this.plugin.settings.focusSearchBarViaKeyboard&&!(e.key!=="/"||Ga(e.target)))return e.preventDefault(),this.searchBar.focus(),!1})}addOnSearchBarEnterListener(e){this.onSearchBarEnterListener.push(e)}setSearchBarUrl(e){this.searchBar.value=e}focus(){this.searchBar.focus()}}const gn=["html","htm"],fn="surfing-file-view";class Ja extends A.FileView{constructor(e,t){super(e);y(this,"allowNoFile");y(this,"plugin");this.allowNoFile=!1,this.plugin=t}async onLoadFile(e){const s="file:///"+(this.app.vault.adapter.getBasePath()+"/"+e.path).toString().replace(/\s/g,"%20");K.spawnWebBrowserView(this.plugin,!0,{url:s}),this.leaf&&this.leaf.detach()}onunload(){}canAcceptExtension(e){return gn.includes(e)}getViewType(){return fn}}function Ae(r,n){const e=Object.keys(n).map(t=>Ya(r,t,n[t]));return e.length===1?e[0]:function(){e.forEach(t=>t())}}function Ya(r,n,e){const t=r[n],s=r.hasOwnProperty(n);let i=e(t);return t&&Object.setPrototypeOf(i,t),Object.setPrototypeOf(o,i),r[n]=o,a;function o(...c){return i===t&&r[n]===o&&a(),i.apply(this,c)}function a(){r[n]===o&&(s?r[n]=t:delete r[n]),i!==t&&(i=t,Object.setPrototypeOf(o,t||Function))}}class Xa extends Ft{constructor(e,t,s,i){super(e,s);y(this,"searchEngines",[]);y(this,"searchEnginesString",[]);y(this,"plugin");y(this,"mode","web");y(this,"files",[]);y(this,"view");this.app=e,this.inputEl=s,this.plugin=t,this.files=this.app.vault.getFiles(),this.view=i}fuzzySearchItemsOptimized(e,t){const s=A.prepareFuzzySearch(e);return t.map(i=>{const o=s(i);return o?{item:i,match:o}:null}).filter(Boolean)}getSuggestions(e){if(e.trim().startsWith("/")){this.mode="file";const s=this.files.map(o=>o.path);return this.fuzzySearchItemsOptimized(e.slice(1),s).sort((o,a)=>a.match.score-o.match.score).map(o=>o.item)}this.mode="web",this.searchEnginesString=[];const t=this.plugin.settings.defaultSearchEngine;return this.searchEngines=[...Pe,...this.plugin.settings.customSearchEngine].sort(function(s,i){return s.name.toLowerCase()==t.toLowerCase()?-1:i.name.toLowerCase()==t.toLowerCase()?1:0}),this.searchEngines.forEach(s=>{this.searchEnginesString.push(s.name)}),this.searchEnginesString}renderSuggestion(e,t){switch(this.mode){case"web":t.createDiv({text:E("Search with")+e,cls:"wb-search-suggestion-text"}),t.classList.add("wb-search-suggest-item");break;case"file":t.createDiv({text:"Open "+e,cls:"wb-search-suggestion-text"}),t.classList.add("wb-search-suggest-item");break}}selectSuggestion(e){(async()=>{const t=this.inputEl.value;if(t.trim()!=="")switch(this.mode){case"web":{const s=this.searchEngines.find(a=>a.name===e),i=s?s.url:Pe[0].url,o=Un(i,t);K.spawnWebBrowserView(this.plugin,!1,{url:o});break}case"file":{const s=this.files.find(i=>i.path===e);s&&await this.view.leaf.openFile(s);break}}})()}}class Ka extends A.Component{constructor(e,t,s){super();y(this,"plugin");y(this,"inPageSearchBarInputEl");y(this,"SearchBarInputContainerEl");y(this,"inPageSearchBarContainerEl");y(this,"onSearchBarEnterListener",new Array);y(this,"searchEnginesSuggester");y(this,"view");this.plugin=s,this.view=t,this.inPageSearchBarContainerEl=e.createDiv({cls:"wb-page-search-bar-container"}),this.initScope(),this.inPageSearchBarContainerEl.createDiv({text:"Surfing",cls:"wb-page-search-bar-text"}),this.SearchBarInputContainerEl=this.inPageSearchBarContainerEl.createDiv({cls:"wb-page-search-bar-input-container"}),this.inPageSearchBarInputEl=this.SearchBarInputContainerEl.createEl("input",{type:"text",placeholder:E("Search with")+this.plugin.settings.defaultSearchEngine+E("or enter address"),cls:"wb-page-search-bar-input"}),this.registerDomEvent(this.inPageSearchBarInputEl,"keydown",i=>{if(i.key==="Enter")for(const o of this.onSearchBarEnterListener)o(this.inPageSearchBarInputEl.value)}),this.registerDomEvent(this.inPageSearchBarInputEl,"focusin",i=>{this.inPageSearchBarInputEl.select()}),this.registerDomEvent(this.inPageSearchBarInputEl,"focusout",i=>{var o;(o=window.getSelection())==null||o.removeAllRanges()}),this.plugin.settings.showOtherSearchEngines&&(this.searchEnginesSuggester=new Xa(this.plugin.app,this.plugin,this.inPageSearchBarInputEl,this.view))}addOnSearchBarEnterListener(e){this.onSearchBarEnterListener.push(e)}initScope(){this.plugin.settings.focusSearchBarViaKeyboard&&(this.view.scope?this.view.scope.register([],"i",e=>{e.target!==this.inPageSearchBarInputEl&&(e.preventDefault(),this.inPageSearchBarInputEl.focus())}):(this.view.scope=new A.Scope(this.plugin.app.scope),this.view.scope.register([],"i",e=>{e.target!==this.inPageSearchBarInputEl&&(e.preventDefault(),this.inPageSearchBarInputEl.focus())})))}focus(){this.inPageSearchBarInputEl.focus()}}class Za{constructor(n,e,t){y(this,"plugin");y(this,"view");y(this,"closeBtnEl");y(this,"searchBtnEl");y(this,"createBtnEl");y(this,"iconListEl");y(this,"searchBtn");y(this,"createBtn");y(this,"closeBtn");this.plugin=t,this.view=e,this.iconListEl=n.createDiv({cls:"wb-icon-list-container"}),this.createBtnEl=this.iconListEl.createDiv({cls:"wb-create-btn"}),this.searchBtnEl=this.iconListEl.createDiv({cls:"wb-search-btn"}),this.closeBtnEl=this.iconListEl.createDiv({cls:"wb-close-btn"}),this.closeBtn=new A.ButtonComponent(this.closeBtnEl),this.createBtn=new A.ButtonComponent(this.createBtnEl),this.searchBtn=new A.ButtonComponent(this.searchBtnEl),this.createBtn.setIcon("file-plus").onClick(()=>{this.plugin.app.commands.executeCommandById("file-explorer:new-file")}),this.searchBtn.setIcon("file-search-2").onClick(()=>{this.plugin.app.commands.executeCommandById("switcher:open")}),this.closeBtn.setIcon("x-square").onClick(()=>{var s,i;(s=this.view)!=null&&s.leaf&&((i=this.view)==null||i.leaf.detach())}),this.closeBtn.setTooltip(E("Close Current Leaf")),this.createBtn.setTooltip(E("Create A New Note")),this.searchBtn.setTooltip(E("Open Quick Switcher"))}onunload(){this.searchBtn.buttonEl.detach(),this.createBtn.buttonEl.detach(),this.closeBtn.buttonEl.detach()}}class Qa extends A.Component{constructor(e,t,s){super();y(this,"node");y(this,"url");y(this,"searchBar");y(this,"onSearchBarEnterListener",new Array);y(this,"app");this.node=t,this.url=s,this.app=e}onload(){const e=this.app.plugins.getPlugin("surfing");if(!e)return;const t=e.settings;this.searchBar=this.node.contentEl.createEl("input",{type:"text",placeholder:E("Search with")+t.defaultSearchEngine+E("or enter address"),cls:"wb-search-bar"}),this.registerDomEvent(this.searchBar,"keydown",s=>{if(s.key==="Enter")for(const i of this.onSearchBarEnterListener)i(this.searchBar.value)}),this.registerDomEvent(this.searchBar,"focusin",s=>{this.searchBar.select()}),this.registerDomEvent(this.searchBar,"focusout",s=>{var i;(i=window.getSelection())==null||i.removeAllRanges()})}addOnSearchBarEnterListener(e){this.onSearchBarEnterListener.push(e)}setSearchBarUrl(e){this.searchBar.value=e}focus(){this.searchBar.focus()}}class ec{constructor(n,e,t,s){y(this,"contentEl");y(this,"webviewEl");y(this,"canvas");y(this,"node");y(this,"searchBarEl");y(this,"currentUrl");y(this,"plugin");y(this,"type");y(this,"editor");y(this,"widget");var i,o;this.contentEl=n.contentEl,this.node=n,this.canvas=s,this.plugin=e,this.type=t,this.type==="inline"&&(this.editor=(i=this.node)==null?void 0:i.editor,this.widget=(o=this.node)==null?void 0:o.widget)}onload(){this.contentEl.empty(),this.type==="canvas"&&this.appendSearchBar(),this.type==="inline"&&this.appendShowOriginalCode(),this.appendWebView(),this.contentEl.toggleClass("wb-view-content",!0),this.type==="inline"&&this.contentEl.toggleClass("wb-browser-inline",!0)}appendShowOriginalCode(){const n=this.contentEl.createDiv();n.addClass("wb-show-original-code"),new A.ExtraButtonComponent(n).setIcon("code-2").setTooltip(E("Show original url"))}appendSearchBar(){this.searchBarEl=new Qa(this.plugin.app,this.node,this.node.url),this.searchBarEl.onload(),this.currentUrl=this.node.url,this.searchBarEl.setSearchBarUrl(this.node.url),this.searchBarEl.addOnSearchBarEnterListener(n=>{var s;const e=Wa(n,this.plugin);e?this.currentUrl=e:this.currentUrl=n,this.webviewEl.setAttribute("src",this.currentUrl),this.searchBarEl.setSearchBarUrl(this.currentUrl);const t=this.node.getData();t.url!==this.currentUrl&&(t.url=this.currentUrl,this.node.setData(t),(s=this.node.canvas)==null||s.requestSave(),this.node.render())})}appendWebView(){const n=this.contentEl.doc;this.webviewEl=n.createElement("webview"),this.webviewEl.setAttribute("allowpopups",""),this.webviewEl.setAttribute("webpreferences","nodeIntegration=false, contextIsolation=true, sandbox=true"),this.webviewEl.addClass("wb-frame"),this.currentUrl?this.webviewEl.setAttribute("src",this.currentUrl):this.webviewEl.setAttribute("src",this.node.url),this.webviewEl.addEventListener("dom-ready",()=>{const e=ne.remote.webContents.fromId(this.webviewEl.getWebContentsId());if(e){e.setWindowOpenHandler(t=>{if(t.disposition!=="foreground-tab")return K.spawnWebBrowserView(this.plugin,!0,{url:t.url}),{action:"allow"};if(this.canvas){const s=this.canvas.createLinkNode(t.url,{x:this.node.x+this.node.width+20,y:this.node.y},{height:this.node.height,width:this.node.width});return this.canvas.deselectAll(),this.canvas.addNode(s),this.canvas.select(s),this.canvas.zoomToSelection(),this.canvas.requestSave(),{action:"allow"}}return{action:"deny"}});try{const s=this.plugin.settings.highlightFormat,i=()=>{var c;let o="";const a=(c=s.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:c[0];if(a){const l=Oe().format(a.replace(/{TIME:([^}]*)}/g,"$1"));return o=s.replace(a,l),o}return o};e.executeJavaScript(`
						window.addEventListener('dragstart', (e) => {
							if(e.ctrlKey || e.metaKey) {
								e.dataTransfer.clearData();
								const selectionText = document.getSelection().toString();
								const linkToHighlight = e.srcElement.baseURI.replace(/#:~:text=(.*)/g, "") + "#:~:text=" + encodeURIComponent(selectionText);
								let link = "";
								if ("${s}".includes("{TIME")) {
									link = "${i()}";
									// // eslint-disable-next-line no-useless-escape
									// const timeString = "${s}".match(/{TIME:[^{}[]]*}/g)?.[0];
									// if (timeString) {
									// 	// eslint-disable-next-line no-useless-escape
									// 	const momentTime = moment().format(timeString.replace(/{TIME:([^}]*)}/g, "$1"));
									// 	link = "${s}".replace(timeString, momentTime);
									// }
								}
								link = (link != "" ? link : "${s}").replace(/{URL}/g, linkToHighlight).replace(/{CONTENT}/g, selectionText.replace(/\\n/g, " "));

								e.dataTransfer.setData('text/plain', link);
								console.log(e);
							}
						});
						`,!0)}catch{}e.on("context-menu",(t,s)=>{var c;t.preventDefault();const{Menu:i,MenuItem:o}=ne.remote,a=new i;if(a.append(new o({label:E("Open Current URL In External Browser"),click:()=>{window.open(s.pageURL,"_blank")}})),a.append(new o({label:"Open Current URL In Surfing",click:()=>{window.open(s.pageURL)}})),s.selectionText){const l=this.plugin.settings;a.append(new o({type:"separator"})),a.append(new o({label:E("Search Text"),click:()=>{try{K.spawnWebBrowserView(this.plugin,!0,{url:s.selectionText})}catch{}}})),a.append(new o({type:"separator"})),a.append(new o({label:E("Copy Plain Text"),click:()=>{try{e.copy()}catch{}}}));const d=l.highlightFormat;a.append(new o({label:E("Copy Link to Highlight"),click:()=>{var p;try{const u=s.pageURL.replace(/#:~:text=(.*)/g,"")+"#:~:text="+encodeURIComponent(s.selectionText),g=s.selectionText;let m="";if(d.includes("{TIME")){const h=(p=d.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:p[0];if(h){const b=Oe().format(h.replace(/{TIME:([^}]*)}/g,"$1"));m=d.replace(h,b)}}m=(m!=""?m:d).replace(/\{URL\}/g,u).replace(/\{CONTENT\}/g,g),ne.clipboard.writeText(m)}catch{}}})),a.popup()}(c=s.pageURL)!=null&&c.includes("bilibili.com/")&&a.append(new o({label:E("Copy Video Timestamp"),click:()=>{try{e.executeJavaScript(`
											var time = document.querySelectorAll('.bpx-player-ctrl-time-current')[0].innerHTML;
											var timeYMSArr=time.split(':');
											var joinTimeStr='00h00m00s';
											if(timeYMSArr.length===3){
												 joinTimeStr=timeYMSArr[0]+'h'+timeYMSArr[1]+'m'+timeYMSArr[2]+'s';
											}else if(timeYMSArr.length===2){
												 joinTimeStr=timeYMSArr[0]+'m'+timeYMSArr[1]+'s';
											}
											var timeStr= "";
											var pageStrMatch = window.location.href.match(/(p=[1-9]{1,})/g);
											var pageStr = "";
											if(typeof pageStrMatch === "object" && pageStrMatch?.length > 0){
											    pageStr = '&' + pageStrMatch[0];
											}else if(typeof pageStrMatch === "string") {
											    pageStr = '&' + pageStrMatch;
											}
											timeStr = window.location.href.split('?')[0]+'?t=' + joinTimeStr + pageStr;
										`,!0).then(l=>{typeof l=="string"&&ne.clipboard.writeText("["+l.split("?t=")[1].replace(/&p=[1-9]{1,}/g,"")+"]("+l+")")})}catch{}}})),window.setTimeout(()=>{a.popup(),this.node.url!==s.pageURL&&!s.selectionText&&a.popup()},0)})}}),this.webviewEl.addEventListener("will-navigate",e=>{var t;if(this.type==="canvas"){const s=this.node.getData();s.url=e.url,this.node.setData(s),(t=this.node.canvas)==null||t.requestSave()}else this.node.url=e.url}),this.webviewEl.addEventListener("did-navigate-in-page",e=>{var t,s;if(this.type==="canvas"){const i=this.node.getData();if(e.url.includes("contacts.google.com/widget")||(t=this.node.canvas)!=null&&t.isDragging&&i.url===e.url){const o=ne.remote.webContents.fromId(this.webviewEl.getWebContentsId());o==null||o.stop();return}if(i.url===e.url)return;i.url=e.url,i.alwaysKeepLoaded=!0,this.node.setData(i),(s=this.node.canvas)==null||s.requestSave()}else this.node.url=e.url}),this.webviewEl.addEventListener("destroyed",()=>{n!==this.contentEl.doc&&(this.webviewEl.detach(),this.appendWebView())}),n.contains(this.contentEl)?this.contentEl.appendChild(this.webviewEl):this.contentEl.onNodeInserted(()=>{this.contentEl.doc===n?this.contentEl.appendChild(this.webviewEl):this.appendWebView()})}}class ys{constructor(n,e,t,s){y(this,"contentEl");y(this,"webviewEl");y(this,"node");y(this,"file");y(this,"menu");y(this,"app");y(this,"plugin");y(this,"currentUrl");this.contentEl=n.containerEl,this.node=n,this.file=e,this.app=t,this.plugin=s}load(){this.appendWebView(),this.contentEl.addClass("wb-view-content-embeded")}unload(){this.contentEl.removeClass("wb-view-content-embeded")}loadFile(n){this.load()}appendWebView(){const n=this.contentEl.doc;this.webviewEl=n.createElement("webview"),this.webviewEl.setAttribute("allowpopups",""),this.webviewEl.setAttribute("webpreferences","nodeIntegration=false, contextIsolation=true, sandbox=true"),this.webviewEl.addClass("wb-frame");const e=this.app.vault.adapter;this.currentUrl="file:///"+(e.getBasePath()+"/"+this.file.path).toString().replace(/\s/g,"%20"),this.currentUrl?this.webviewEl.setAttribute("src",this.currentUrl):this.webviewEl.setAttribute("src",this.file.path),this.webviewEl.addEventListener("dom-ready",()=>{const t=ne.remote.webContents.fromId(this.webviewEl.getWebContentsId());if(t){t.setWindowOpenHandler(s=>s.disposition!=="foreground-tab"?(K.spawnWebBrowserView(this.plugin,!0,{url:s.url}),{action:"allow"}):{action:"deny"});try{const i=this.plugin.settings.highlightFormat,o=()=>{var l;let a="";const c=(l=i.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:l[0];if(c){const d=Oe().format(c.replace(/{TIME:([^}]*)}/g,"$1"));return a=i.replace(c,d),a}return a};t.executeJavaScript(`
						window.addEventListener('dragstart', (e) => {
							if(e.ctrlKey || e.metaKey) {
								e.dataTransfer.clearData();
								const selectionText = document.getSelection().toString();
								const linkToHighlight = e.srcElement.baseURI.replace(/#:~:text=(.*)/g, "") + "#:~:text=" + encodeURIComponent(selectionText);
								let link = "";
								if ("${i}".includes("{TIME")) {
									link = "${o()}";
									// // eslint-disable-next-line no-useless-escape
									// const timeString = "${i}".match(/{TIME:[^{}[]]*}/g)?.[0];
									// if (timeString) {
									// 	// eslint-disable-next-line no-useless-escape
									// 	const momentTime = moment().format(timeString.replace(/{TIME:([^}]*)}/g, "$1"));
									// 	link = "${i}".replace(timeString, momentTime);
									// }
								}
								link = (link != "" ? link : "${i}").replace(/{URL}/g, linkToHighlight).replace(/{CONTENT}/g, selectionText.replace(/\\n/g, " "));

								e.dataTransfer.setData('text/plain', link);
								console.log(e);
							}
						});
						`,!0)}catch{}t.on("context-menu",(s,i)=>{var l;s.preventDefault();const{Menu:o,MenuItem:a}=ne.remote,c=new o;if(this.menu=c,c.append(new a({label:E("Open Current URL In External Browser"),click:()=>{window.open(i.pageURL,"_blank")}})),c.append(new a({label:"Open Current URL In Surfing",click:()=>{window.open(i.pageURL)}})),i.selectionText){const d=this.plugin.settings;c.append(new a({type:"separator"})),c.append(new a({label:E("Search Text"),click:()=>{try{K.spawnWebBrowserView(this.plugin,!0,{url:i.selectionText})}catch{}}})),c.append(new a({type:"separator"})),c.append(new a({label:E("Copy Plain Text"),click:()=>{try{t.copy()}catch{}}}));const p=d.highlightFormat;c.append(new a({label:E("Copy Link to Highlight"),click:()=>{var u;try{const g=i.pageURL.replace(/#:~:text=(.*)/g,"")+"#:~:text="+encodeURIComponent(i.selectionText),m=i.selectionText;let h="";if(p.includes("{TIME")){const b=(u=p.match(/\{TIME:[^{}[\]]*\}/g))==null?void 0:u[0];if(b){const f=Oe().format(b.replace(/{TIME:([^}]*)}/g,"$1"));h=p.replace(b,f)}}h=(h!=""?h:p).replace(/\{URL\}/g,g).replace(/\{CONTENT\}/g,m),ne.clipboard.writeText(h)}catch{}}})),c.popup()}(l=i.pageURL)!=null&&l.includes("bilibili.com/")&&c.append(new a({label:E("Copy Video Timestamp"),click:()=>{try{t.executeJavaScript(`
											var time = document.querySelectorAll('.bpx-player-ctrl-time-current')[0].innerHTML;
											var timeYMSArr=time.split(':');
											var joinTimeStr='00h00m00s';
											if(timeYMSArr.length===3){
												 joinTimeStr=timeYMSArr[0]+'h'+timeYMSArr[1]+'m'+timeYMSArr[2]+'s';
											}else if(timeYMSArr.length===2){
												 joinTimeStr=timeYMSArr[0]+'m'+timeYMSArr[1]+'s';
											}
											var timeStr= "";
											var pageStrMatch = window.location.href.match(/(p=[1-9]{1,})/g);
											var pageStr = "";
											if(typeof pageStrMatch === "object" && pageStrMatch?.length > 0){
											    pageStr = '&' + pageStrMatch[0];
											}else if(typeof pageStrMatch === "string") {
											    pageStr = '&' + pageStrMatch;
											}
											timeStr = window.location.href.split('?')[0]+'?t=' + joinTimeStr + pageStr;
										`,!0).then(d=>{typeof d=="string"&&ne.clipboard.writeText("["+d.split("?t=")[1].replace(/&p=[1-9]{1,}/g,"")+"]("+d+")")})}catch{}}})),window.setTimeout(()=>{c.popup(),this.node.url!==i.pageURL&&!i.selectionText&&c.popup()},0)})}}),this.webviewEl.addEventListener("will-navigate",t=>{this.currentUrl=t.url}),this.webviewEl.addEventListener("did-navigate-in-page",t=>{this.currentUrl=t.url,this.webviewEl.setAttribute("src",t.url)}),this.webviewEl.addEventListener("destroyed",()=>{n!==this.contentEl.doc&&(this.webviewEl.detach(),this.appendWebView())}),n.contains(this.contentEl)?this.contentEl.appendChild(this.webviewEl):this.contentEl.onNodeInserted(()=>{this.contentEl.doc===n?this.contentEl.appendChild(this.webviewEl):this.appendWebView()})}}async function tc(r){var t;const n=`${r.app.vault.configDir}/surfing-bookmark.json`;if(!await r.app.vault.adapter.exists(n)){r.settings.bookmarkManager.bookmarksMigrated=!0,await r.saveSettings();return}try{const s=await r.app.vault.adapter.read(n),i=JSON.parse(s);if(!i.bookmarks||i.bookmarks.length===0){r.settings.bookmarkManager.bookmarksMigrated=!0,await r.saveSettings();return}let o=0;for(const c of i.bookmarks){const l=c.tags?c.tags.split(" ").filter(p=>p.trim()!==""):[];await Dn(r,{url:c.url,name:c.name||"Untitled",description:c.description||"",tags:l,category:((t=c.category)==null?void 0:t.length)>0?c.category:["ROOT"]})&&o++}const a=n+".bak";await r.app.vault.adapter.exists(a)&&await r.app.vault.adapter.remove(a),await r.app.vault.adapter.rename(n,a),r.settings.bookmarkManager.bookmarksMigrated=!0,await r.saveSettings(),await at(r),new A.Notice(`Migrated ${o} bookmarks to markdown files.`)}catch{new A.Notice("Bookmark migration failed. Check console for details.")}}async function nc(r){var n;try{const e=await A.request({url:r}),t=new DOMParser().parseFromString(e,"text/html"),s=(n=t.querySelector("title"))==null?void 0:n.innerText,i=t.querySelector("meta[name=name]"),o=i?i.getAttribute("content"):null,a=t.querySelector("meta[name=description]"),c=a?a.getAttribute("content"):null;return{title:s||"",name:o,description:c}}catch{return{title:"",name:"",description:""}}}class sc{constructor(n=[]){y(this,"nodes",[]);y(this,"listeners",new Set);this.nodes=[...n]}getNodes(){return this.nodes}setNodes(n){this.nodes=[...n],this.notify()}addNode(n){this.nodes=[...this.nodes,n],this.notify()}updateNode(n,e){const t=this.nodes.findIndex(s=>s.id===n);t!==-1&&(this.nodes=[...this.nodes.slice(0,t),{...this.nodes[t],...e},...this.nodes.slice(t+1)],this.notify())}removeNode(n){this.nodes=this.nodes.filter(e=>e.id!==n),this.notify()}getChildren(n){return this.nodes.filter(e=>String(e.parent)===String(n))}findNode(n){return this.nodes.find(e=>e.id===n)}hasNode(n){return this.nodes.some(e=>e.id===n)}moveToGroup(n,e){const t=this.findNode(n);if(!t||String(t.parent)===e)return;const s=this.nodes.findIndex(o=>o.id===n);if(s===-1)return;const i=e==="0"?0:e;this.nodes=[...this.nodes.slice(0,s),{...t,parent:i},...this.nodes.slice(s+1)],this.notify()}reorderNode(n,e){const t=this.findNode(n);if(!t)return;const s=String(t.parent),i=[];for(const d of this.nodes)String(d.parent)===s&&i.push(d);const o=i.findIndex(d=>d.id===n);if(o===-1)return;i.splice(o,1);const a=Math.max(0,Math.min(e,i.length));i.splice(a,0,t);const c=[];let l=0;for(const d of this.nodes)String(d.parent)===s?c.push(i[l++]):c.push(d);this.nodes=c,this.notify()}toJSON(){return[...this.nodes]}subscribe(n){return this.listeners.add(n),()=>{this.listeners.delete(n)}}notify(){for(const n of this.listeners)n()}}const ic=5,Tt=50,ks=8;class rc extends A.Component{constructor(e,t){super();y(this,"container");y(this,"callbacks");y(this,"dragging",!1);y(this,"sourceEl",null);y(this,"ghostEl",null);y(this,"indicator",null);y(this,"sourceId","");y(this,"startX",0);y(this,"startY",0);y(this,"scrollInterval",0);y(this,"currentDropIndex",-1);y(this,"siblings",[]);y(this,"dropTargetGroupId",null);y(this,"highlightedGroupEl",null);y(this,"boundPointerMove");y(this,"boundPointerUp");this.container=e,this.callbacks=t,this.boundPointerMove=s=>this.onPointerMove(s),this.boundPointerUp=s=>this.onPointerUp(s)}onPointerDown(e,t,s){e.button===0&&(this.sourceEl=t.closest(".tree-item"),this.sourceEl&&(this.sourceId=s,this.startX=e.clientX,this.startY=e.clientY,this.dragging=!1,document.addEventListener("pointermove",this.boundPointerMove),document.addEventListener("pointerup",this.boundPointerUp)))}onPointerMove(e){const t=e.clientX-this.startX,s=e.clientY-this.startY;if(!this.dragging){if(Math.sqrt(t*t+s*s)<ic)return;this.enterDragMode()}if(!this.ghostEl||!this.sourceEl)return;this.ghostEl.style.left=`${e.clientX+8}px`,this.ghostEl.style.top=`${e.clientY-12}px`;const i=this.findGroupTarget(e.clientX,e.clientY);i?(this.dropTargetGroupId=i.id,this.highlightGroup(i.el),this.indicator&&this.indicator.removeClass("is-visible"),this.currentDropIndex=-1):(this.dropTargetGroupId=null,this.clearGroupHighlight(),this.updateDropIndicator(e.clientY)),this.handleAutoScroll(e.clientY)}onPointerUp(e){document.removeEventListener("pointermove",this.boundPointerMove),document.removeEventListener("pointerup",this.boundPointerUp),this.dragging&&(this.dropTargetGroupId?this.callbacks.onMoveToGroup(this.sourceId,this.dropTargetGroupId):this.currentDropIndex>=0&&this.callbacks.onReorder(this.sourceId,this.currentDropIndex)),this.exitDragMode()}enterDragMode(){if(this.dragging=!0,!this.sourceEl)return;const e=this.sourceEl.parentElement;e&&(this.siblings=Array.from(e.querySelectorAll(":scope > .tree-item")),this.ghostEl=this.sourceEl.cloneNode(!0),this.ghostEl.classList.add("surfing-drag-ghost"),this.ghostEl.style.width=`${this.sourceEl.offsetWidth}px`,document.body.appendChild(this.ghostEl),this.sourceEl.classList.add("surfing-drag-source-hidden"),this.indicator=this.container.createDiv({cls:"surfing-drop-indicator"}),document.body.classList.add("is-grabbing"))}exitDragMode(){this.ghostEl&&(this.ghostEl.remove(),this.ghostEl=null),this.indicator&&(this.indicator.remove(),this.indicator=null),this.sourceEl&&(this.sourceEl.classList.remove("surfing-drag-source-hidden"),this.sourceEl=null),this.scrollInterval&&(window.clearInterval(this.scrollInterval),this.scrollInterval=0),this.clearGroupHighlight(),this.dropTargetGroupId=null,document.body.classList.remove("is-grabbing"),this.dragging=!1,this.siblings=[],this.currentDropIndex=-1}updateDropIndicator(e){if(!this.indicator||this.siblings.length===0)return;let t=this.siblings.length;for(let o=0;o<this.siblings.length;o++){const a=this.siblings[o].getBoundingClientRect(),c=a.top+a.height/2;if(e<c){t=o;break}}this.currentDropIndex=t;let s;t<this.siblings.length?s=this.siblings[t].getBoundingClientRect().top:s=this.siblings[this.siblings.length-1].getBoundingClientRect().bottom;const i=this.container.getBoundingClientRect();this.indicator.style.top=`${s-i.top+this.container.scrollTop}px`,this.indicator.addClass("is-visible")}handleAutoScroll(e){const t=this.container.getBoundingClientRect(),s=e-t.top,i=t.bottom-e;if(this.scrollInterval&&(window.clearInterval(this.scrollInterval),this.scrollInterval=0),s<Tt&&s>0){const o=1-s/Tt;this.scrollInterval=window.setInterval(()=>{this.container.scrollTop-=ks*o},16)}else if(i<Tt&&i>0){const o=1-i/Tt;this.scrollInterval=window.setInterval(()=>{this.container.scrollTop+=ks*o},16)}}findGroupTarget(e,t){const s=this.container.querySelectorAll(".tree-item[data-group-id] > .tree-item-self");for(const i of s){const o=i.closest(".tree-item"),a=o==null?void 0:o.dataset.groupId;if(!a||a===this.sourceId)continue;const c=i.getBoundingClientRect();if(e>=c.left&&e<=c.right&&t>=c.top&&t<=c.bottom)return{id:a,el:i}}return null}highlightGroup(e){this.highlightedGroupEl!==e&&(this.clearGroupHighlight(),e.classList.add("surfing-drop-target-group"),this.highlightedGroupEl=e)}clearGroupHighlight(){this.highlightedGroupEl&&(this.highlightedGroupEl.classList.remove("surfing-drop-target-group"),this.highlightedGroupEl=null)}onunload(){this.exitDragMode(),document.removeEventListener("pointermove",this.boundPointerMove),document.removeEventListener("pointerup",this.boundPointerUp)}}class Es extends A.Modal{constructor(e,t,s){super(e);y(this,"plugin");y(this,"result","");y(this,"onSubmit");this.plugin=t,this.onSubmit=s}onOpen(){var t;const{contentEl:e}=this;(t=e.parentElement)==null||t.classList.add("wb-workspace-modal"),e.createEl("h2",{text:"Workspace Name"}),new A.Setting(e).setName("Name").addText(s=>s.onChange(i=>{this.result=i})),new A.Setting(e).addButton(s=>s.setButtonText("Submit").setCta().onClick(()=>{this.close(),this.onSubmit(this.result)}))}onClose(){const{contentEl:e}=this;e.empty()}}const oc=r=>{const n=[];for(let e=0;e<r;e++)n.push((16*Math.random()|0).toString(16));return n.join("")},Nt="surfing-tab-tree";class ac extends A.ItemView{constructor(e,t){super(e);y(this,"store");y(this,"dragReorder");y(this,"containerEl_tree");y(this,"collapsedGroups",new Set);y(this,"selectedNodeId",null);this.plugin=t,this.plugin=t}getViewType(){return Nt}getDisplayText(){return"Surfing Tab Tree"}getIcon(){return"chrome"}async onOpen(){const e=this.contentEl;e.empty(),this.containerEl_tree=e.createDiv({cls:"surfing-tab-tree-container"});const s=(this.plugin.settings.treeData||[]).map(i=>({id:String(i.id),parent:i.parent,droppable:i.droppable,text:i.text,data:i.data}));this.store=new sc(s),this.dragReorder=this.addChild(new rc(this.containerEl_tree,{onReorder:(i,o)=>{this.store.reorderNode(i,o)},onMoveToGroup:(i,o)=>{var c;const a=this.store.findNode(i);a&&((c=a.data)==null?void 0:c.fileType)==="workspace"||this.store.moveToGroup(i,o)}})),this.register(this.store.subscribe(()=>{this.renderTree(),this.persistTree()})),this.syncFromWorkspace(),this.registerEvent(this.app.workspace.on("surfing:page-change",(i,o)=>{this.updateTabData(o,i)})),this.registerEvent(this.app.workspace.on("layout-change",()=>{const i=this.app.workspace.getLeavesOfType(le);if(i.length===0){this.store.setNodes([]);return}for(const c of i)if(!this.store.hasNode(c.id)){const l=c.view;this.store.addNode({id:c.id,parent:0,droppable:!0,text:l.currentTitle||"New Tab",data:{fileType:"site",fileSize:"",icon:l.favicon}})}const o=new Set(i.map(c=>c.id)),a=this.store.getNodes();for(const c of a)c.data.fileType==="site"&&!o.has(c.id)&&this.store.removeNode(c.id)})),this.registerDomEvent(this.containerEl_tree,"contextmenu",i=>{i.target.closest(".tree-item")||(i.preventDefault(),this.showContainerContextMenu(i))}),this.renderTree()}async onClose(){}syncFromWorkspace(){if(this.store.getNodes().length>0){const s=this.store.getNodes().find(i=>{var o;return((o=i.data)==null?void 0:o.fileType)==="site"});if(s)if(!this.app.workspace.getLeafById(s.id))this.store.setNodes([]);else return;else return}const t=this.app.workspace.getLeavesOfType(le).map(s=>({id:s.id,parent:0,droppable:!0,text:s.view.currentTitle||"New Tab",data:{fileType:"site",fileSize:"",icon:s.view.favicon}}));t.length>0&&this.store.setNodes(t)}updateTabData(e,t){const s=e.leaf.id;this.store.hasNode(s)?this.store.updateNode(s,{text:t||e.currentTitle,data:{fileType:"site",fileSize:"",icon:e.favicon}}):this.store.addNode({id:s,parent:0,droppable:!0,text:t||e.currentTitle,data:{fileType:"site",fileSize:"",icon:e.favicon}})}persistTree(){this.plugin.settings.treeData=this.store.toJSON(),this.plugin.settingsTab.applySettingsUpdate()}renderTree(){var i;const e=this.containerEl_tree;if(e.empty(),this.store.getNodes().length===0){this.renderEmptyState(e);return}const s=this.store.getChildren(0);for(const o of s)((i=o.data)==null?void 0:i.fileType)==="workspace"?this.renderGroupNode(o,e):this.renderLeafNode(o,e)}renderEmptyState(e){const s=e.createDiv({cls:"tab-tree-empty-container"}).createDiv({cls:"tab-tree-empty-state"}),i=s.createDiv();A.setIcon(i,"globe"),s.createSpan({text:"No surfing tabs open"})}renderGroupNode(e,t){const s=this.collapsedGroups.has(e.id),i=t.createDiv({cls:"tree-item"});i.dataset.groupId=e.id;const o=i.createDiv({cls:"tree-item-self is-clickable"}),a=o.createDiv({cls:"tree-item-icon collapse-icon"});A.setIcon(a,"right-triangle"),s||a.classList.add("is-collapsed"),a.style.transform=s?"rotate(0deg)":"rotate(90deg)";const c=o.createDiv({cls:"tree-item-icon"});if(A.setIcon(c,"folder"),o.createDiv({cls:"tree-item-inner",text:e.text}),o.addEventListener("click",()=>{this.collapsedGroups.has(e.id)?this.collapsedGroups.delete(e.id):this.collapsedGroups.add(e.id),this.renderTree()}),o.addEventListener("contextmenu",l=>{l.stopPropagation(),l.preventDefault(),this.showGroupContextMenu(l,e)}),o.addEventListener("pointerdown",l=>{var d;(d=this.dragReorder)==null||d.onPointerDown(l,o,e.id)}),!s){const l=i.createDiv({cls:"tree-item-children"}),d=this.store.getChildren(e.id);for(const p of d)this.renderLeafNode(p,l)}}renderLeafNode(e,t){var c;const s=t.createDiv({cls:"tree-item"}),i=this.selectedNodeId===e.id,o=s.createDiv({cls:`tree-item-self is-clickable${i?" is-selected":""}`}),a=o.createDiv({cls:"tree-item-icon"});if((c=e.data)!=null&&c.icon){if(e.data.icon instanceof HTMLImageElement){const l=a.createEl("img",{cls:"surfing-tab-favicon"});l.src=e.data.icon.src,l.width=16,l.height=16}else if(typeof e.data.icon=="string")if(e.data.icon.startsWith("http")||e.data.icon.startsWith("data:")){const l=a.createEl("img",{cls:"surfing-tab-favicon"});l.src=e.data.icon,l.width=16,l.height=16}else A.setIcon(a,e.data.icon||"globe")}else A.setIcon(a,"globe");o.createDiv({cls:"tree-item-inner",text:e.text||"Untitled"}),o.addEventListener("click",l=>{l.stopPropagation(),this.selectedNodeId=e.id;const d=this.app.workspace.getLeafById(e.id);d&&this.app.workspace.setActiveLeaf(d),this.renderTree()}),o.addEventListener("contextmenu",l=>{l.stopPropagation(),l.preventDefault(),this.showNodeContextMenu(l,e)}),o.addEventListener("pointerdown",l=>{var d;(d=this.dragReorder)==null||d.onPointerDown(l,o,e.id)})}showContainerContextMenu(e){const t=new A.Menu;t.addItem(s=>{s.setTitle("New Group").setIcon("folder").onClick(()=>{new Es(this.app,this.plugin,i=>{this.store.addNode({id:oc(16),parent:0,droppable:!0,text:i,data:{fileType:"workspace",fileSize:"",icon:"folder"}})}).open()})}),t.showAtPosition({x:e.clientX,y:e.clientY})}showGroupContextMenu(e,t){const s=new A.Menu;s.addItem(i=>{i.setTitle("Rename Group").setIcon("pencil").onClick(()=>{new Es(this.app,this.plugin,o=>{this.store.updateNode(t.id,{text:o})}).open()})}),s.addItem(i=>{i.setTitle("Delete Group").setIcon("trash").onClick(()=>{const o=this.store.getChildren(t.id);for(const a of o)this.store.moveToGroup(a.id,"0");this.store.removeNode(t.id)})}),s.showAtPosition({x:e.clientX,y:e.clientY})}showNodeContextMenu(e,t){const s=new A.Menu;s.addItem(i=>{i.setTitle("Close Tab").setIcon("x").onClick(()=>{const o=this.app.workspace.getLeafById(t.id);o&&o.detach(),this.store.removeNode(t.id)})}),s.showAtPosition({x:e.clientX,y:e.clientY})}}class cc extends A.Component{constructor(e,t){super();y(this,"plugin");y(this,"parent");y(this,"listEl");this.plugin=e,this.parent=t}onload(){this.listEl=this.parent.createDiv({cls:"wb-last-opened-files"});const e=this.plugin.app.workspace.getLastOpenFiles().slice(0,8);for(const t of e){const s=this.listEl.createEl("button",{cls:"wb-last-opened-file"}),i=s.createSpan({cls:"wb-last-opened-file-icon"});A.setIcon(i,"file-text"),s.createSpan({cls:"wb-last-opened-file-name",text:t}),s.onclick=async()=>{await this.plugin.app.workspace.openLinkText(t,t,!1)}}}onunload(){super.onunload(),this.listEl.empty(),this.listEl.detach()}}class lc{constructor(n){y(this,"plugin");y(this,"blockedDomains",new Set);y(this,"session",null);this.plugin=n}async initialize(){this.session=ne.remote.session.fromPartition(`persist:surfing-vault-${this.plugin.app.appId}`),await this.loadAllFilterLists(),this.registerRequestInterceptor()}async loadAllFilterLists(){var e;this.blockedDomains.clear();const n=((e=this.plugin.settings.adBlock)==null?void 0:e.filterLists)??[];for(const t of n)if(t.enabled)try{const s=await this.fetchListContent(t.url);this.parseList(s)}catch{new A.Notice(E("Filter list load failed: ")+t.name)}}async fetchListContent(n){if(!n.startsWith("http://")&&!n.startsWith("https://"))return await this.plugin.app.vault.adapter.read(n);const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);return await e.text()}parseList(n){const e=n.split(`
`);for(const t of e){const s=t.trim();if(!s||s.startsWith("#")||s.startsWith("!"))continue;let i=s;i.startsWith("0.0.0.0 ")?i=i.substring(8).trim():i.startsWith("127.0.0.1 ")&&(i=i.substring(10).trim()),i.startsWith("||")&&(i=i.substring(2)),i.endsWith("^")&&(i=i.slice(0,-1));const o=i.indexOf("#");o>0&&(i=i.substring(0,o).trim()),!(i.includes("/")||i.includes("*"))&&(!i||i==="localhost"||i==="0.0.0.0"||i==="127.0.0.1"||this.blockedDomains.add(i.toLowerCase()))}}registerRequestInterceptor(){this.session&&this.session.webRequest.onBeforeRequest((n,e)=>{var t;if(!((t=this.plugin.settings.adBlock)!=null&&t.enabled)){e({cancel:!1});return}try{const i=new URL(n.url).hostname.toLowerCase();if(this.isDomainBlocked(i)){e({cancel:!0});return}}catch{}e({cancel:!1})})}isDomainBlocked(n){if(this.blockedDomains.has(n))return!0;const e=n.split(".");for(let t=1;t<e.length-1;t++){const s=e.slice(t).join(".");if(this.blockedDomains.has(s))return!0}return!1}async reload(){await this.loadAllFilterLists()}destroy(){this.session&&this.session.webRequest.onBeforeRequest(null)}}class dc{constructor(n){y(this,"plugin");y(this,"rules",{});this.plugin=n}get savePath(){return`${this.plugin.app.vault.configDir}/surfing-element-hiding.json`}async initialize(){await this.loadRules()}async loadRules(){try{if(await this.plugin.app.vault.adapter.exists(this.savePath)){const e=await this.plugin.app.vault.adapter.read(this.savePath);this.rules=JSON.parse(e)}}catch{this.rules={}}}async saveRules(){await this.plugin.app.vault.adapter.write(this.savePath,JSON.stringify(this.rules,null,2))}async addRule(n,e){this.rules[n]||(this.rules[n]=[]),!this.rules[n].some(t=>t.selector===e)&&(this.rules[n].push({id:String(Date.now()),selector:e,created:Date.now()}),await this.saveRules())}async removeRule(n,e){this.rules[n]&&(this.rules[n]=this.rules[n].filter(t=>t.id!==e),this.rules[n].length===0&&delete this.rules[n],await this.saveRules())}getCssForUrl(n){try{const e=new URL(n).hostname,t=this.rules[e];return!t||t.length===0?"":t.map(s=>`${s.selector} { display: none !important; }`).join(`
`)}catch{return""}}getRulesForDomain(n){return this.rules[n]||[]}}class uc extends A.Modal{constructor(e,t,s){super(e);y(this,"plugin");y(this,"domain");y(this,"cookies",[]);this.plugin=t,this.domain=s}async onOpen(){var i;const{contentEl:e}=this;e.empty(),(i=e.parentElement)==null||i.classList.add("surfing-cookie-modal"),e.createEl("h2",{text:E("Cookies for ")+this.domain});const t=ne.remote.session.fromPartition(`persist:surfing-vault-${this.app.appId}`);if(this.cookies=await t.cookies.get({domain:this.domain}),this.cookies.length===0){e.createEl("p",{text:E("No cookies found for this site.")});return}new A.Setting(e).setName(E("Delete all cookies for this site")).addButton(o=>o.setButtonText(E("Delete All")).setWarning().onClick(async()=>{await this.deleteAllCookies(),this.onOpen()}));const s=e.createDiv({cls:"surfing-cookie-list"});for(const o of this.cookies){const a=s.createDiv({cls:"surfing-cookie-item"}),c=a.createDiv({cls:"surfing-cookie-info"});c.createSpan({text:o.name,cls:"surfing-cookie-name"}),c.createSpan({text:this.truncate(o.value,50),cls:"surfing-cookie-value"});const l=a.createEl("button",{cls:"surfing-cookie-delete-btn"});A.setIcon(l,"trash-2"),l.addEventListener("click",()=>{(async()=>(await this.deleteCookie(o),a.remove(),new A.Notice(E("Cookie deleted: ")+o.name)))()})}e.createEl("p",{text:`${this.cookies.length} cookie(s)`,cls:"surfing-cookie-count"})}async deleteCookie(e){var o;const t=ne.remote.session.fromPartition(`persist:surfing-vault-${this.app.appId}`),i=`${e.secure?"https":"http"}://${(o=e.domain)==null?void 0:o.replace(/^\./,"")}${e.path}`;await t.cookies.remove(i,e.name)}async deleteAllCookies(){for(const e of this.cookies)await this.deleteCookie(e);new A.Notice(E("All cookies deleted for ")+this.domain)}truncate(e,t){return e.length>t?e.substring(0,t)+"...":e}onClose(){this.contentEl.empty()}}const hc={"compat-api.js":`/* Generated from src/extensions by esbuild. Do not edit. */
"use strict";
(() => {
  // src/extensions/shared/protocol.ts
  var CHANNEL_NAME = "__obsidian_bridge_channel_v1";
  var HOST_PAGE = "__obsidian_bridge_host.html";
  var RESERVED_PREFIX = "__obsidian_bridge_";
  var CONTEXT_MENU_STORAGE_KEY = "__obsidian_bridge_context_menus_v1__";
  var USER_SCRIPT_DIR = "__obsidian_bridge_us";
  var WEB_NAVIGATION_EVENTS = [
    "onBeforeNavigate",
    "onCommitted",
    "onDOMContentLoaded",
    "onCompleted",
    "onErrorOccurred",
    "onCreatedNavigationTarget",
    "onReferenceFragmentUpdated",
    "onHistoryStateUpdated",
    "onTabReplaced"
  ];
  var TAB_EVENTS = ["onActivated", "onCreated", "onRemoved", "onUpdated"];

  // src/extensions/compat/bridge.ts
  var BridgeUnavailable = class extends Error {
  };
  function createBridge() {
    const handlers = /* @__PURE__ */ new Map();
    const pending = /* @__PURE__ */ new Map();
    let channel = null;
    try {
      channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(CHANNEL_NAME) : null;
    } catch {
      channel = null;
    }
    channel?.unref?.();
    channel?.addEventListener("message", (event2) => {
      const data = event2.data;
      if (!data || data.v !== 1 || data.from !== "host" || typeof data.type !== "string") return;
      if (data.type === "response") {
        const waiter = pending.get(data.requestId);
        if (!waiter) return;
        pending.delete(data.requestId);
        if (typeof data.error === "string") waiter.reject(new Error(data.error));
        else waiter.resolve(data.result);
        return;
      }
      for (const handler of handlers.get(data.type) || []) {
        try {
          const result = handler(data);
          if (result instanceof Promise) result.catch((e) => console.error("[Chrome Bridge] host message handler failed:", e));
        } catch (e) {
          console.error("[Chrome Bridge] host message handler failed:", e);
        }
      }
    });
    const send = (message) => {
      try {
        channel?.postMessage({ v: 1, from: "extension", ...message });
      } catch (e) {
        console.warn("[Chrome Bridge] post failed:", e);
      }
    };
    return {
      available: !!channel,
      post: send,
      on(type, handler) {
        if (!handlers.has(type)) handlers.set(type, []);
        handlers.get(type).push(handler);
      },
      request(method, params, timeoutMs = 5e3) {
        if (!channel) return Promise.reject(new BridgeUnavailable("Obsidian host channel unavailable"));
        const requestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            pending.delete(requestId);
            reject(new BridgeUnavailable(\`Obsidian did not answer \${method}\`));
          }, timeoutMs);
          pending.set(requestId, {
            // The host answers with the result type the protocol declares for \`method\`.
            resolve: (value) => {
              clearTimeout(timer);
              resolve(value);
            },
            reject: (error) => {
              clearTimeout(timer);
              reject(error);
            }
          });
          send({ type: "request", requestId, method, params });
        });
      }
    };
  }

  // src/extensions/compat/chrome.ts
  var isNamespace = (value) => !!value && (typeof value === "object" || typeof value === "function");
  function nsOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return isNamespace(value) ? value : void 0;
  }
  function fnOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return typeof value === "function" ? value : void 0;
  }
  var isEvent = (value) => isNamespace(value) && typeof value.addListener === "function";
  function eventOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return isEvent(value) ? value : void 0;
  }
  var callbackOf = (value) => typeof value === "function" ? value : void 0;
  var fields = (value) => value && typeof value === "object" ? value : {};
  var isChromeRoot = (value) => {
    const id = fields(fields(value).runtime).id;
    return typeof id === "string" && !!id;
  };

  // src/extensions/shared/text.ts
  function text(value, fallback = "") {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
    if (typeof URL === "function" && value instanceof URL) return value.href;
    return fallback;
  }

  // src/extensions/compat/runtime.ts
  var isWorker = typeof ServiceWorkerGlobalScope === "function" && globalThis instanceof ServiceWorkerGlobalScope;
  function define(obj, key, value) {
    if (!obj || typeof obj !== "object" && typeof obj !== "function") throw new Error(\`Target missing for \${key}\`);
    const target = obj;
    try {
      Object.defineProperty(target, key, { configurable: true, enumerable: true, writable: false, value });
    } catch {
      target[key] = value;
    }
    if (target[key] !== value) throw new Error(\`\${key} is not writable\`);
  }
  var events = /* @__PURE__ */ new WeakMap();
  function event(options = {}) {
    const state = { listeners: /* @__PURE__ */ new Map(), ...options };
    const api = {
      addListener(fn, filter) {
        if (typeof fn !== "function") return;
        state.listeners.set(fn, filter);
        state.onChange?.();
      },
      removeListener(fn) {
        if (state.listeners.delete(fn)) state.onChange?.();
      },
      hasListener(fn) {
        return state.listeners.has(fn);
      },
      hasListeners() {
        return state.listeners.size > 0;
      }
    };
    events.set(api, state);
    return api;
  }
  var isThenable = (value) => !!value && (typeof value === "object" || typeof value === "function") && typeof fields(value).then === "function";
  function emit(target, ...args) {
    const state = typeof target === "object" && target !== null ? events.get(target) : void 0;
    if (!state) return;
    for (const [fn, filter] of [...state.listeners]) {
      if (state.accepts && !state.accepts(filter, args)) continue;
      try {
        const result = fn(...args);
        if (isThenable(result)) result.then(void 0, (e) => console.error("[Chrome Bridge] listener rejected:", e));
      } catch (e) {
        console.error("[Chrome Bridge] listener threw:", e);
      }
    }
  }
  function listenersOf(target) {
    return typeof target === "object" && target !== null ? [...events.get(target)?.listeners.keys() ?? []] : [];
  }
  function listenerCount(target) {
    return typeof target === "object" && target !== null ? events.get(target)?.listeners.size ?? 0 : 0;
  }
  var later = (fn) => queueMicrotask(fn);
  function callbackOrPromise(callback, value) {
    const cb = callbackOf(callback);
    if (cb) later(() => {
      cb(value);
    });
    return Promise.resolve(value);
  }
  function settle(op, callback) {
    const cb = callbackOf(callback);
    if (!cb) return op;
    op.then((value) => {
      cb(value);
    }, (error) => {
      console.warn("[Chrome Bridge]", error);
      cb(void 0);
    });
    return void 0;
  }
  function invoke(chrome, target, method, ...args) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (error) reject(error instanceof Error ? error : new Error(text(error, "Unknown error")));
        else resolve(value);
      };
      try {
        const fn = fnOf(target, method);
        if (!fn) throw new Error(\`\${method} is not available\`);
        const returned = fn.call(target, ...args, (result) => {
          const message = chrome.runtime.lastError?.message;
          finish(message ? new Error(message) : null, result);
        });
        if (isThenable(returned)) returned.then((value) => finish(null, value), (error) => finish(error));
      } catch (e) {
        finish(e);
      }
    });
  }
  var missingFn = (obj, key) => !fnOf(obj, key);
  var missingEvent = (obj, key) => !eventOf(obj, key);
  function fillEvents(obj, names) {
    for (const name of names) if (missingEvent(obj, name)) define(obj, name, event());
  }

  // src/extensions/compat/apis/action.ts
  var observed = /* @__PURE__ */ Symbol.for("obsidian-bridge.action-observed");
  var MAX_ICON_BYTES = 256 * 1024;
  function installAction(ctx) {
    const { c, manifest } = ctx;
    if (!manifest.action) return;
    if (missingFn(c.action, "setIcon") || missingFn(c.action, "getUserSettings")) installStateOnly(ctx);
    const action = nsOf(c, "action");
    if (action && ctx.shared.bridge.available) observeAction(ctx, action);
  }
  function installStateOnly({ c, manifest, info, report }) {
    report("action.state-only", () => {
      const existing = nsOf(c, "action") ?? {};
      const declared = manifest.action ?? {};
      const extensionUrl = (file) => fnOf(c.runtime, "getURL") ? c.runtime.getURL(file) : file;
      const global = {
        title: text(declared.default_title),
        badgeText: "",
        badgeBackgroundColor: [0, 0, 0, 0],
        badgeTextColor: [0, 0, 0, 0],
        popup: declared.default_popup ? extensionUrl(declared.default_popup) : "",
        enabled: true
      };
      const perTab = /* @__PURE__ */ new Map();
      const tabIdOf = (details) => {
        const tabId = fields(details).tabId;
        return typeof tabId === "number" && Number.isInteger(tabId) ? tabId : null;
      };
      const read = (details, key) => {
        const tabId = tabIdOf(details);
        const tab = tabId === null ? null : perTab.get(tabId);
        return tab && Object.hasOwn(tab, key) ? tab[key] : global[key];
      };
      const write = (details, key, value) => {
        const tabId = tabIdOf(details);
        if (tabId === null) {
          global[key] = value;
          return;
        }
        if (!perTab.has(tabId)) perTab.set(tabId, {});
        perTab.get(tabId)[key] = value;
      };
      const setter = (key, field, normalize) => (details = {}, callback) => {
        write(details, key, normalize(fields(details)[field]));
        return settle(Promise.resolve(), callback);
      };
      const getter = (key) => (details = {}, callback) => settle(Promise.resolve(read(details, key)), callback);
      const color = (v) => typeof v === "string" ? v : Array.isArray(v) ? [...v] : [0, 0, 0, 0];
      const toText = (v) => text(v);
      const api = {
        setIcon: setter("icon", "path", (v) => v ?? null),
        setTitle: setter("title", "title", toText),
        getTitle: getter("title"),
        setBadgeText: setter("badgeText", "text", toText),
        getBadgeText: getter("badgeText"),
        setBadgeBackgroundColor: setter("badgeBackgroundColor", "color", color),
        getBadgeBackgroundColor: getter("badgeBackgroundColor"),
        setBadgeTextColor: setter("badgeTextColor", "color", color),
        getBadgeTextColor: getter("badgeTextColor"),
        setPopup: setter("popup", "popup", (v) => v ? extensionUrl(text(v).replace(/^\\//, "")) : ""),
        getPopup: getter("popup"),
        enable: (tabId, callback) => {
          write({ tabId }, "enabled", true);
          return settle(Promise.resolve(), callback);
        },
        disable: (tabId, callback) => {
          write({ tabId }, "enabled", false);
          return settle(Promise.resolve(), callback);
        },
        isEnabled: (tabId, callback) => settle(Promise.resolve(read({ tabId }, "enabled")), callback),
        // Chrome Bridge always offers the button in the Web Viewer toolbar.
        getUserSettings: (callback) => settle(Promise.resolve({ isOnToolbar: true }), callback)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      fillEvents(existing, ["onClicked", "onUserSettingsChanged"]);
      if (!c.action) define(c, "action", existing);
      info.modes.action = "state-only: values round-trip in this context";
    });
  }
  function cssColor(value) {
    if (typeof value === "string") return value.trim() || void 0;
    if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number" && Number.isFinite(n))) {
      const [r, g, b, a] = value.map((n) => Math.max(0, Math.min(255, Math.round(n))));
      return \`rgba(\${r}, \${g}, \${b}, \${(a / 255).toFixed(3)})\`;
    }
    return void 0;
  }
  function base64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(binary);
  }
  function pick(value, isLeaf) {
    if (isLeaf(value)) return value;
    if (!value || typeof value !== "object") return void 0;
    const sizes = Object.keys(value).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const size = sizes.find((s) => s >= 32) ?? sizes[sizes.length - 1];
    const chosen = size === void 0 ? void 0 : fields(value)[String(size)];
    return isLeaf(chosen) ? chosen : void 0;
  }
  var isImageData = (v) => {
    const f = fields(v);
    return typeof f.width === "number" && typeof f.height === "number" && !!f.data && typeof f.data === "object";
  };
  var isString = (v) => typeof v === "string";
  async function iconDataUrl(chrome, details) {
    const { imageData, path: pathField } = fields(details);
    const image = imageData !== void 0 ? pick(imageData, isImageData) : void 0;
    if (image) {
      if (typeof OffscreenCanvas !== "function") return void 0;
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      if (!context) return void 0;
      const data = typeof ImageData === "function" && image instanceof ImageData ? image : new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
      context.putImageData(data, 0, 0);
      const blob2 = await canvas.convertToBlob({ type: "image/png" });
      if (blob2.size > MAX_ICON_BYTES) return void 0;
      return "data:image/png;base64," + base64(new Uint8Array(await blob2.arrayBuffer()));
    }
    const path = pathField !== void 0 ? pick(pathField, isString) : void 0;
    if (typeof path !== "string") return void 0;
    const url = /^[a-z-]+:/i.test(path) ? path : chrome.runtime.getURL(path.replace(/^\\//, ""));
    if (!url.startsWith(chrome.runtime.getURL(""))) return void 0;
    const response = await fetch(url);
    const blob = await response.blob();
    if (!response.ok || blob.size > MAX_ICON_BYTES) return void 0;
    const type = /^image\\/(png|jpeg|gif|webp|svg\\+xml)$/.test(blob.type) ? blob.type : "image/png";
    return \`data:\${type};base64,\` + base64(new Uint8Array(await blob.arrayBuffer()));
  }
  function popupPath(chrome, value) {
    if (value === void 0 || value === null) return void 0;
    const path = text(value);
    if (!path) return "";
    const root = chrome.runtime.getURL("");
    if (path.startsWith(root)) return path.slice(root.length);
    return /^[a-z-]+:/i.test(path) ? void 0 : path.replace(/^\\/+/, "");
  }
  async function fullTab(chrome, known) {
    let tab = { id: known.id, index: 0, windowId: -1, pinned: false, highlighted: true, incognito: false, discarded: false, autoDiscardable: true, groupId: -1 };
    const tabs = nsOf(chrome, "tabs");
    if (fnOf(tabs, "get")) {
      try {
        tab = { ...tab, ...fields(await invoke(chrome, tabs, "get", known.id)) };
      } catch {
      }
    }
    tab = { ...tab, ...known, highlighted: known.active ?? tab.highlighted };
    if (known.url === void 0) {
      delete tab.url;
      delete tab.pendingUrl;
      delete tab.title;
      delete tab.favIconUrl;
    }
    return tab;
  }
  function observeAction({ chrome, info, shared, report }, action) {
    if (observed in action) return;
    report("action.rendered-by-obsidian", () => {
      try {
        Object.defineProperty(action, observed, { value: true });
      } catch {
      }
      const post = (tabId, props) => {
        shared.bridge.post({ type: "action.update", tabId: typeof tabId === "number" && Number.isSafeInteger(tabId) ? tabId : null, props });
      };
      const changes = {
        setTitle: ([d]) => [fields(d).tabId, { title: text(fields(d).title) }],
        setBadgeText: ([d]) => [fields(d).tabId, { badgeText: text(fields(d).text) }],
        setBadgeBackgroundColor: ([d]) => [fields(d).tabId, { badgeBackgroundColor: cssColor(fields(d).color) }],
        setBadgeTextColor: ([d]) => [fields(d).tabId, { badgeTextColor: cssColor(fields(d).color) }],
        setPopup: ([d]) => {
          const popup = popupPath(chrome, fields(d).popup);
          return popup === void 0 ? null : [fields(d).tabId, { popup }];
        },
        enable: ([tabId]) => [typeof tabId === "number" ? tabId : null, { enabled: true }],
        disable: ([tabId]) => [typeof tabId === "number" ? tabId : null, { enabled: false }],
        setIcon: async ([d]) => {
          const icon = await iconDataUrl(chrome, d).catch(() => void 0);
          return icon ? [fields(d).tabId, { icon }] : null;
        }
      };
      for (const [method, change] of Object.entries(changes)) {
        const original = fnOf(action, method);
        if (!original) continue;
        const wrapped = (...args) => {
          const returned = original.apply(action, args);
          Promise.resolve(change(args)).then((result) => {
            if (result) post(result[0], result[1]);
          }, () => void 0);
          return returned;
        };
        define(action, method, wrapped);
      }
      const onClicked = shared.once("action.onClicked", () => {
        const e = event();
        shared.bridge.on("action.clicked", async (message) => {
          if (Number.isSafeInteger(message.tab?.id)) emit(e, await fullTab(chrome, message.tab));
        });
        return e;
      });
      define(action, "onClicked", onClicked);
      define(action, "openPopup", (options, callback) => {
        if (callbackOf(options)) callback = options;
        return settle(shared.bridge.request("action.openPopup", {}, 5e3).then((r) => {
          if (!r?.opened) throw new Error("Failed to open popup.");
        }), callback);
      });
      if (isWorker) {
        const snapshot = async () => {
          const read = (method, arg = {}) => missingFn(action, method) ? Promise.resolve(void 0) : invoke(chrome, action, method, arg).catch(() => void 0);
          const [title, badgeText, background, color, popup, enabled] = await Promise.all([
            read("getTitle"),
            read("getBadgeText"),
            read("getBadgeBackgroundColor"),
            read("getBadgeTextColor"),
            read("getPopup"),
            read("isEnabled", void 0)
          ]);
          const props = {};
          if (typeof title === "string" && title) props.title = title;
          if (typeof badgeText === "string" && badgeText) props.badgeText = badgeText;
          const isSet = (v) => Array.isArray(v) && typeof v[3] === "number" && v[3] > 0;
          const bg = cssColor(background), fg = cssColor(color);
          if (bg && isSet(background)) props.badgeBackgroundColor = bg;
          if (fg && isSet(color)) props.badgeTextColor = fg;
          const path = popupPath(chrome, popup);
          if (path) props.popup = path;
          if (enabled === false) props.enabled = false;
          shared.bridge.post({ type: "action.reset", props });
        };
        shared.bridge.on("bridge.sync", () => {
          void snapshot();
        });
        void snapshot();
      }
      info.modes.action = "rendered by Obsidian in the Web Viewer toolbar (icon, badge, title, enabled, popup per tab); onClicked and openPopup work";
    });
  }

  // src/extensions/shared/url-match.ts
  function wildcardMatch(pattern, text2) {
    let p = 0, t = 0, star = -1, resume = 0;
    while (t < text2.length) {
      if (p < pattern.length && pattern[p] !== "*" && pattern[p] === text2[t]) {
        p++;
        t++;
      } else if (p < pattern.length && pattern[p] === "*") {
        star = p++;
        resume = t;
      } else if (star >= 0) {
        p = star + 1;
        t = ++resume;
      } else return false;
    }
    while (p < pattern.length && pattern[p] === "*") p++;
    return p === pattern.length;
  }
  function urlFilterMatches(filter, raw) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      return false;
    }
    const host = u.hostname, path = u.pathname, query = u.search.replace(/^\\?/, "");
    const url = u.href.replace(/#.*$/, "");
    const str = (value, test) => value === void 0 || test(value);
    const port = u.port ? Number(u.port) : { "http:": 80, "https:": 443, "ws:": 80, "wss:": 443, "ftp:": 21 }[u.protocol];
    const regex = (source, target) => {
      if (source === void 0) return true;
      try {
        return new RegExp(source).test(target);
      } catch {
        return false;
      }
    };
    return str(filter.hostContains, (s) => host.includes(s)) && str(filter.hostEquals, (s) => host === s) && str(filter.hostPrefix, (s) => host.startsWith(s)) && str(filter.hostSuffix, (s) => host.endsWith(s)) && str(filter.pathContains, (s) => path.includes(s)) && str(filter.pathEquals, (s) => path === s) && str(filter.pathPrefix, (s) => path.startsWith(s)) && str(filter.pathSuffix, (s) => path.endsWith(s)) && str(filter.queryContains, (s) => query.includes(s)) && str(filter.queryEquals, (s) => query === s) && str(filter.queryPrefix, (s) => query.startsWith(s)) && str(filter.querySuffix, (s) => query.endsWith(s)) && str(filter.urlContains, (s) => url.includes(s)) && str(filter.urlEquals, (s) => url === s) && str(filter.urlPrefix, (s) => url.startsWith(s)) && str(filter.urlSuffix, (s) => url.endsWith(s)) && regex(filter.urlMatches, url) && regex(filter.originAndPathMatches, u.origin + path) && (!Array.isArray(filter.schemes) || filter.schemes.includes(u.protocol.slice(0, -1))) && (!Array.isArray(filter.ports) || filter.ports.some((p) => Array.isArray(p) ? port >= p[0] && port <= p[1] : port === p));
  }
  function eventFilterMatches(filter, url) {
    const list3 = filter?.url;
    if (!Array.isArray(list3)) return true;
    return typeof url === "string" && list3.some((f) => f && typeof f === "object" && urlFilterMatches(f, url));
  }
  function patternCovers(granted, requested) {
    if (granted === requested) return true;
    const parse = (p) => {
      if (p === "<all_urls>") return { scheme: "<all>", host: "*", path: "/*" };
      const m = /^(\\*|[a-z][a-z0-9+.-]*):\\/\\/(\\*|\\*\\.[^/*]+|[^/*]*)(\\/.*)$/.exec(p);
      return m ? { scheme: m[1], host: m[2].toLowerCase(), path: m[3] } : null;
    };
    const g = parse(granted), r = parse(requested);
    if (!g || !r) return false;
    const web = ["http", "https", "ws", "wss"];
    const schemeOk = g.scheme === "<all>" ? r.scheme === "<all>" || r.scheme === "*" || [...web, "ftp", "file", "urn"].includes(r.scheme) : g.scheme === "*" ? r.scheme === "*" || web.includes(r.scheme) : g.scheme === r.scheme;
    if (!schemeOk) return false;
    const hostOk = g.host === "*" || g.host.startsWith("*.") && (r.host === g.host || r.host === g.host.slice(2) || (r.host.startsWith("*.") ? r.host.endsWith(g.host.slice(1)) : r.host.endsWith(g.host.slice(1)))) || g.host === r.host;
    if (!hostOk) return false;
    return wildcardMatch(g.path, r.path);
  }

  // src/extensions/compat/apis/basics.ts
  function installI18n({ c, report }) {
    if (fnOf(c.i18n, "getMessage")) return;
    report("i18n", () => {
      const original = nsOf(c, "i18n") ?? {};
      const bundle = fields(globalThis).__obsidianBridgeLocaleData ?? {};
      const locale = bundle.locale || "en";
      const getMessage = (name, substitutions) => {
        const key = text(name).toLowerCase();
        if (key === "@@extension_id") return c.runtime.id;
        if (key === "@@ui_locale") return locale;
        const rtl = /^(ar|he|fa|ur)(_|$)/i.test(locale);
        if (key === "@@bidi_dir") return rtl ? "rtl" : "ltr";
        if (key === "@@bidi_reversed_dir") return rtl ? "ltr" : "rtl";
        if (key === "@@bidi_start_edge") return rtl ? "right" : "left";
        if (key === "@@bidi_end_edge") return rtl ? "left" : "right";
        const entry = bundle.messages?.[key];
        if (!entry || typeof entry.message !== "string") return "";
        const subs = substitutions === void 0 ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
        const placeholders = {};
        for (const [k, v] of Object.entries(entry.placeholders || {})) {
          if (typeof v?.content === "string")
            placeholders[k.toLowerCase()] = v.content.replace(/\\$(\\d)/g, (_m, n) => text(subs[Number(n) - 1]));
        }
        return entry.message.replace(/\\$\\$|\\$([\\w@]+)\\$/g, (token, name2) => {
          if (token === "$$") return "$";
          if (/^\\d+$/.test(name2)) return text(subs[Number(name2) - 1]);
          return placeholders[name2.toLowerCase()] ?? token;
        });
      };
      define(c, "i18n", Object.assign({
        getMessage,
        getUILanguage: () => locale.replace(/_/g, "-"),
        getAcceptLanguages: (callback) => callbackOrPromise(callback, [locale.replace(/_/g, "-")])
      }, original));
    });
  }
  var strings = (value) => Array.isArray(value) ? value.filter((x) => typeof x === "string") : [];
  function installPermissions({ c, granted, hosts, report }) {
    if (fnOf(c.permissions, "contains")) return;
    report("permissions", () => {
      const existing = nsOf(c, "permissions") ?? {};
      const shim = {
        onRemoved: eventOf(existing, "onRemoved") ?? event(),
        onAdded: eventOf(existing, "onAdded") ?? event(),
        contains(query, callback) {
          const { permissions, origins } = fields(query);
          return callbackOrPromise(callback, strings(permissions).every((x) => granted.has(x)) && strings(origins).every((x) => [...hosts].some((g) => patternCovers(g, x))));
        },
        getAll(callback) {
          return callbackOrPromise(callback, { permissions: [...granted], origins: [...hosts] });
        },
        request(_query, callback) {
          return callbackOrPromise(callback, false);
        },
        remove(_query, callback) {
          return callbackOrPromise(callback, false);
        }
      };
      define(c, "permissions", Object.assign(shim, existing));
    });
  }
  var commandsFilled = /* @__PURE__ */ Symbol.for("obsidian-bridge.commands");
  function installCommands({ c, manifest, shared, report }) {
    const current = nsOf(c, "commands");
    if (current && commandsFilled in current || eventOf(current, "onCommand") && !shared.bridge.available) return;
    report("commands", () => {
      const existing = current ?? {};
      const onCommand = shared.once("commands.onCommand", () => {
        const e = event();
        shared.bridge.on("commands.command", async (message) => {
          if (typeof message.command !== "string") return;
          const tab = message.tab && Number.isSafeInteger(message.tab.id) ? await fullTab(c, message.tab) : void 0;
          emit(e, message.command, tab);
        });
        return e;
      });
      const declared = fields(manifest.commands);
      const getAll = (callback) => settle((async () => {
        let shortcuts = {};
        if (shared.bridge.available) shortcuts = await shared.bridge.request("commands.shortcuts", {}, 3e3).catch(() => ({}));
        return Object.entries(declared).map(([name, value]) => {
          const description = fields(value).description;
          return { name, description: typeof description === "string" ? description : "", shortcut: typeof shortcuts[name] === "string" ? shortcuts[name] : "" };
        });
      })(), callback);
      const commands = Object.assign(existing, { onCommand, getAll });
      define(c, "commands", commands);
      try {
        Object.defineProperty(commands, commandsFilled, { value: true });
      } catch {
      }
    });
  }
  function installExtension({ c, report }) {
    if (fnOf(c.extension, "isAllowedFileSchemeAccess")) return;
    report("extension.fileSchemeAccess", () => {
      const existing = nsOf(c, "extension") ?? {};
      if (!fnOf(existing, "isAllowedFileSchemeAccess")) {
        define(existing, "isAllowedFileSchemeAccess", (callback) => callbackOrPromise(callback, false));
      }
      if (!fnOf(existing, "isAllowedIncognitoAccess")) {
        define(existing, "isAllowedIncognitoAccess", (callback) => callbackOrPromise(callback, false));
      }
      if (!c.extension) define(c, "extension", existing);
    });
  }
  function installRuntimeExtras({ c, info, report }) {
    if (fnOf(c.runtime, "setUninstallURL")) return;
    report("runtime.setUninstallURL-ignored", () => {
      define(c.runtime, "setUninstallURL", (_url, callback) => callbackOrPromise(callback, void 0));
      info.modes.setUninstallURL = "accepted and ignored";
    });
  }

  // src/extensions/compat/apis/web-navigation.ts
  var FRAME_TIMEOUT_MS = 1500;
  function installWebNavigation(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("webNavigation")) return;
    const missing = WEB_NAVIGATION_EVENTS.filter((name) => !eventOf(c.webNavigation, name));
    if (missing.length) report("webNavigation.events", () => {
      const existing = nsOf(c, "webNavigation") ?? {};
      let pending = false;
      const announce = () => {
        if (!isWorker || pending) return;
        pending = true;
        setTimeout(() => {
          pending = false;
          const events2 = WEB_NAVIGATION_EVENTS.filter((name) => listenerCount(existing[name]) > 0);
          shared.bridge.post({ type: "webNavigation.listeners", events: events2 });
        }, 0);
      };
      for (const name of missing) {
        define(existing, name, event({
          // onCreatedNavigationTarget/onTabReplaced details carry \`url\` or none.
          accepts: (filter, args) => eventFilterMatches(filter, fields(args[0]).url),
          onChange: announce
        }));
      }
      if (!c.webNavigation) define(c, "webNavigation", existing);
      shared.navigation.add(existing);
      shared.bridge.on("bridge.sync", announce);
      if (isWorker) announce();
      info.modes.webNavigation = shared.bridge.available ? "events delivered from Obsidian Web Viewer tabs (transitionType is approximate)" : "registration-only: BroadcastChannel unavailable, events are not delivered";
    });
    const webNavigation = nsOf(c, "webNavigation");
    if (webNavigation && (missingFn(webNavigation, "getAllFrames") || missingFn(webNavigation, "getFrame"))) {
      report("webNavigation.frames", () => {
        const fromHost = (tabId) => shared.bridge.request("webNavigation.getAllFrames", { tabId }, FRAME_TIMEOUT_MS).then((frames) => Array.isArray(frames) ? frames : null, () => void 0);
        const mainFrameOnly = async (tabId) => {
          const tabs = nsOf(c, "tabs");
          if (!fnOf(tabs, "get")) return null;
          let tab;
          try {
            tab = await invoke(chrome, tabs, "get", tabId);
          } catch {
            return null;
          }
          if (!tab) return null;
          const url = fields(tab).url;
          return [{
            frameId: 0,
            parentFrameId: -1,
            processId: -1,
            url: typeof url === "string" ? url : "",
            errorOccurred: false,
            documentLifecycle: "active",
            frameType: "outermost_frame"
          }];
        };
        const allFrames = async (tabId) => {
          if (typeof tabId !== "number" || !Number.isInteger(tabId)) return null;
          const answered = await fromHost(tabId);
          return answered !== void 0 ? answered : mainFrameOnly(tabId);
        };
        if (missingFn(webNavigation, "getAllFrames")) define(
          webNavigation,
          "getAllFrames",
          (details, callback) => settle(allFrames(fields(details).tabId), callback)
        );
        if (missingFn(webNavigation, "getFrame")) define(
          webNavigation,
          "getFrame",
          (details, callback) => settle(allFrames(fields(details).tabId).then((frames) => frames?.find((f) => f.frameId === (fields(details).frameId ?? 0)) ?? null), callback)
        );
        info.modes.webNavigationFrames = "answered by Obsidian; main frame only when the host is unreachable";
      });
    }
  }
  function deliverWebNavigation(ctx) {
    ctx.shared.bridge.on("webNavigation.event", (message) => {
      const name = message.event;
      if (!WEB_NAVIGATION_EVENTS.includes(name) || !message.details || typeof message.details !== "object") return;
      for (const namespace of ctx.shared.navigation) emit(namespace[name], { ...message.details });
    });
  }

  // src/extensions/compat/apis/storage.ts
  function prefixedArea(chrome, c, prefix, before = () => Promise.resolve()) {
    const storage = nsOf(c, "storage");
    const local = nsOf(storage, "local");
    const call = (method, ...args) => before().then(() => invoke(chrome, local, method, ...args));
    const clone = (data) => data === void 0 ? null : JSON.parse(JSON.stringify(data));
    const fromLocal = (all) => {
      const out = {};
      for (const [k, v] of Object.entries(fields(all))) if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
      return out;
    };
    const select = (all, keys) => {
      if (keys == null) return all;
      const selected = {};
      const wanted = typeof keys === "string" ? [keys] : keys;
      if (Array.isArray(wanted)) {
        for (const k of wanted) if (typeof k === "string" && Object.hasOwn(all, k)) selected[k] = all[k];
      } else if (wanted && typeof wanted === "object") {
        for (const [k, v] of Object.entries(wanted)) selected[k] = Object.hasOwn(all, k) ? all[k] : v;
      }
      return selected;
    };
    const onChanged = event();
    eventOf(storage, "onChanged")?.addListener((changes, areaName) => {
      if (areaName !== "local") return;
      const out = fromLocal(changes);
      if (Object.keys(out).length) emit(onChanged, out);
    });
    const get = (keys) => call("get", null).then((all) => select(fromLocal(all), keys));
    return {
      onChanged,
      get(keys, callback) {
        if (callbackOf(keys)) {
          callback = keys;
          keys = null;
        }
        return settle(get(keys), callback);
      },
      getKeys(callback) {
        return settle(call("get", null).then((all) => Object.keys(fromLocal(all))), callback);
      },
      set(data, callback) {
        const values = {};
        for (const [k, v] of Object.entries(fields(data))) values[prefix + k] = clone(v);
        return settle(call("set", values).then(() => void 0), callback);
      },
      remove(keys, callback) {
        const names = (Array.isArray(keys) ? keys : [keys]).filter((k) => typeof k === "string").map((k) => prefix + k);
        return settle(call("remove", names).then(() => void 0), callback);
      },
      clear(callback) {
        const op = call("get", null).then((all) => invoke(chrome, local, "remove", Object.keys(fields(all)).filter((k) => k.startsWith(prefix))));
        return settle(op.then(() => void 0), callback);
      },
      getBytesInUse(keys, callback) {
        if (callbackOf(keys)) {
          callback = keys;
          keys = null;
        }
        const op = get(keys).then((obj) => new TextEncoder().encode(JSON.stringify(obj)).length);
        return settle(op, callback);
      }
    };
  }
  function installStorage({ c, chrome, granted, info, report }) {
    const storage = nsOf(c, "storage");
    const local = nsOf(storage, "local");
    if (!storage || !local || !granted.has("storage")) return;
    report("storage.sync-local", () => {
      const area = Object.assign(prefixedArea(chrome, c, "__obsidian_bridge_sync_v1__"), {
        QUOTA_BYTES: 102400,
        QUOTA_BYTES_PER_ITEM: 8192,
        MAX_ITEMS: 512,
        MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
        MAX_WRITE_OPERATIONS_PER_MINUTE: 120
      });
      define(storage, "sync", area);
      info.modes.storageSync = "local-only: stored in storage.local, never synced";
    });
    report("storage.managed-empty", () => {
      const readOnly = () => Promise.reject(new Error("This is a read-only store."));
      const area = {
        onChanged: eventOf(nsOf(storage, "managed"), "onChanged") ?? event(),
        get(keys, callback) {
          if (callbackOf(keys)) {
            callback = keys;
            keys = null;
          }
          const result = keys && typeof keys === "object" && !Array.isArray(keys) ? { ...keys } : {};
          return settle(Promise.resolve(result), callback);
        },
        getBytesInUse(keys, callback) {
          if (callbackOf(keys)) callback = keys;
          return settle(Promise.resolve(0), callback);
        },
        set: (_items, callback) => settle(readOnly(), callback),
        remove: (_keys, callback) => settle(readOnly(), callback),
        clear: (callback) => settle(readOnly(), callback)
      };
      define(storage, "managed", area);
      info.modes.storageManaged = "empty and read-only (no enterprise policies in Obsidian)";
    });
    if (!storage.session) report("storage.session-local", () => {
      const prefix = "__obsidian_bridge_session_v1__";
      const markerKey = "__obsidian_bridge_session_boot_v1__";
      const bootId = fields(fields(globalThis).__obsidianBridgeLocaleData).bridgeBootId;
      let ready = null;
      const resetIfNewBoot = () => ready ||= typeof bootId !== "string" ? Promise.resolve() : invoke(chrome, local, "get", null).then((raw) => {
        const all = fields(raw);
        if (all[markerKey] === bootId) return;
        const stale = Object.keys(all).filter((k) => k.startsWith(prefix));
        return (stale.length ? invoke(chrome, local, "remove", stale) : Promise.resolve()).then(() => invoke(chrome, local, "set", { [markerKey]: bootId }));
      }).catch((e) => console.warn("[Chrome Bridge] storage.session reset:", e));
      const area = Object.assign(prefixedArea(chrome, c, prefix, resetIfNewBoot), {
        QUOTA_BYTES: 10485760,
        setAccessLevel: (_options, callback) => callbackOrPromise(callback, void 0)
      });
      define(storage, "session", area);
      info.modes.storageSession = typeof bootId === "string" ? "kept in storage.local under a private prefix; cleared on each Obsidian start" : "kept in storage.local under a private prefix; NOT cleared (host boot id missing)";
      void resetIfNewBoot();
    });
  }

  // src/extensions/compat/apis/alarms.ts
  function installAlarms({ c, chrome, granted, info, report }) {
    if (!granted.has("alarms") || !missingFn(c.alarms, "create")) return;
    report("alarms.worker-timers", () => {
      const existing = nsOf(c, "alarms") ?? {};
      const onAlarm = eventOf(existing, "onAlarm") ?? event();
      const KEY = "__obsidian_bridge_alarms_v1__";
      const MAX_TIMER = 2147483647;
      const storage = nsOf(c, "storage");
      const local = nsOf(storage, "local");
      const persistent = granted.has("storage") && !missingFn(local, "get");
      let memory = {};
      const load = async () => persistent ? { ...fields(fields(await invoke(chrome, local, "get", KEY))[KEY]) } : { ...memory };
      const timers = /* @__PURE__ */ new Map();
      const arm = (alarm) => {
        const current = timers.get(alarm.name);
        if (current?.scheduledTime === alarm.scheduledTime) return;
        if (current) clearTimeout(current.timer);
        const wait = Math.max(0, Math.min(alarm.scheduledTime - Date.now(), MAX_TIMER));
        timers.set(alarm.name, { scheduledTime: alarm.scheduledTime, timer: setTimeout(() => fire(alarm.name, alarm.scheduledTime), wait) });
      };
      const reconcile = (all) => {
        if (!isWorker) return;
        for (const [name, t] of timers) if (!all[name]) {
          clearTimeout(t.timer);
          timers.delete(name);
        }
        for (const alarm of Object.values(all)) arm(alarm);
      };
      let queue = Promise.resolve();
      const mutate = (fn) => {
        const op = queue.then(async () => {
          const all = await load();
          const result = fn(all);
          if (persistent) await invoke(chrome, local, "set", { [KEY]: all });
          else memory = all;
          reconcile(all);
          return result;
        });
        queue = op.then(() => void 0, () => void 0);
        return op;
      };
      const fire = (name, scheduledTime) => {
        timers.delete(name);
        mutate((all) => {
          const alarm = all[name];
          if (!alarm || alarm.scheduledTime !== scheduledTime || Date.now() < scheduledTime) return null;
          if (alarm.periodInMinutes) {
            const period = alarm.periodInMinutes * 6e4;
            let next = alarm.scheduledTime + period;
            if (next <= Date.now()) next = Date.now() + period;
            all[name] = { ...alarm, scheduledTime: next };
          } else delete all[name];
          return { ...alarm };
        }).then((fired) => {
          if (fired) emit(onAlarm, fired);
        }, (e) => console.warn("[Chrome Bridge] alarms:", e));
      };
      const finite = (v) => typeof v === "number" && Number.isFinite(v);
      const nameAndCallback = (name, callback) => callbackOf(name) ? ["", name] : [typeof name === "string" ? name : "", callback];
      const api = {
        create(nameArg, infoArg, callbackArg) {
          let name = "", alarmInfo = infoArg, callback = callbackArg;
          if (typeof nameArg === "string") name = nameArg;
          else {
            callback = infoArg;
            alarmInfo = nameArg;
          }
          if (callbackOf(alarmInfo)) {
            callback = alarmInfo;
            alarmInfo = {};
          }
          const { when, delayInMinutes, periodInMinutes } = fields(alarmInfo);
          if (!finite(when) && !finite(delayInMinutes) && !finite(periodInMinutes)) {
            return settle(Promise.reject(new Error("Must set at least one of when, delayInMinutes, or periodInMinutes")), callback);
          }
          const delay = finite(delayInMinutes) ? delayInMinutes : finite(periodInMinutes) ? periodInMinutes : 0;
          const scheduledTime = finite(when) ? when : Date.now() + delay * 6e4;
          const alarm = { name, scheduledTime, ...finite(periodInMinutes) ? { periodInMinutes } : {} };
          return settle(mutate((all) => {
            all[name] = alarm;
          }).then(() => void 0), callback);
        },
        get(nameArg, callbackArg) {
          const [key, callback] = nameAndCallback(nameArg, callbackArg);
          return settle(queue.then(load).then((all) => all[key] ? { ...all[key] } : void 0), callback);
        },
        getAll(callback) {
          return settle(queue.then(load).then((all) => Object.values(all)), callback);
        },
        clear(nameArg, callbackArg) {
          const [key, callback] = nameAndCallback(nameArg, callbackArg);
          return settle(mutate((all) => {
            const had = Object.hasOwn(all, key);
            delete all[key];
            return had;
          }), callback);
        },
        clearAll(callback) {
          return settle(mutate((all) => {
            const had = Object.keys(all).length > 0;
            for (const k of Object.keys(all)) delete all[k];
            return had;
          }), callback);
        }
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      if (missingEvent(existing, "onAlarm")) define(existing, "onAlarm", onAlarm);
      if (!c.alarms) define(c, "alarms", existing);
      if (isWorker) {
        mutate(() => void 0).catch((e) => console.warn("[Chrome Bridge] alarms restore:", e));
        const onChanged = eventOf(storage, "onChanged");
        if (persistent && onChanged) onChanged.addListener((changes, areaName) => {
          const change = fields(changes)[KEY];
          if (areaName === "local" && change) reconcile(fields(fields(change).newValue));
        });
      }
      info.modes.alarms = "timers in the service worker; a stopped worker is not woken" + (persistent ? "" : "; not persisted (no storage permission)");
    });
  }

  // src/extensions/compat/apis/context-menus.ts
  var FIELDS = [
    "id",
    "parentId",
    "title",
    "type",
    "contexts",
    "checked",
    "enabled",
    "visible",
    "documentUrlPatterns",
    "targetUrlPatterns"
  ];
  function serializable(id, properties) {
    const item = { id };
    for (const key of FIELDS) {
      const value = properties[key];
      if (value !== void 0 && typeof value !== "function") item[key] = JSON.parse(JSON.stringify(value));
    }
    item.id = id;
    return item;
  }
  function installContextMenus(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("contextMenus") || !missingFn(c.contextMenus, "create")) return;
    report("contextMenus", () => {
      const existing = nsOf(c, "contextMenus") ?? {};
      const storage = nsOf(c, "storage");
      const local = nsOf(storage, "local");
      const items = /* @__PURE__ */ new Map();
      const onclick = /* @__PURE__ */ new Map();
      const persistent = granted.has("storage") && !missingFn(local, "get");
      let sequence = 0;
      let announcing = false;
      const announce = () => {
        if (announcing) return;
        announcing = true;
        setTimeout(() => {
          announcing = false;
          shared.bridge.post({ type: "contextMenus.items", items: [...items.values()] });
        }, 0);
      };
      const save = () => {
        if (persistent) invoke(chrome, local, "set", { [CONTEXT_MENU_STORAGE_KEY]: [...items.values()] }).catch((e) => console.warn("[Chrome Bridge] contextMenus persist:", e));
      };
      const replaceAll = (list3) => {
        items.clear();
        if (!Array.isArray(list3)) return;
        for (const raw of list3) {
          const id = fields(raw).id;
          if (typeof id === "string" || typeof id === "number") items.set(id, raw);
        }
      };
      let chain = persistent ? invoke(chrome, local, "get", CONTEXT_MENU_STORAGE_KEY).then((all) => replaceAll(fields(all)[CONTEXT_MENU_STORAGE_KEY])).catch((e) => console.warn("[Chrome Bridge] contextMenus restore:", e)) : Promise.resolve();
      const enqueue = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result.then((value) => {
          save();
          announce();
          return value;
        });
      };
      const onStorageChanged = eventOf(storage, "onChanged");
      if (persistent && onStorageChanged) onStorageChanged.addListener((changes, areaName) => {
        const change = fields(changes)[CONTEXT_MENU_STORAGE_KEY];
        if (areaName === "local" && change) replaceAll(fields(change).newValue);
      });
      const removeTree = (id) => {
        items.delete(id);
        onclick.delete(id);
        for (const item of [...items.values()]) if (item.parentId === id) removeTree(item.id);
      };
      const notFound = (id) => new Error(\`Cannot find menu item with id \${text(id)}\`);
      const isId = (v) => typeof v === "string" || typeof v === "number";
      const api = {
        create(createProperties = {}, callback) {
          const properties = fields(createProperties);
          const id = isId(properties.id) ? properties.id : ++sequence;
          const done = enqueue(() => {
            if (items.has(id)) throw new Error(\`Cannot create item with duplicate id \${id}\`);
            const parentId = properties.parentId;
            if (parentId !== void 0 && !(isId(parentId) && items.has(parentId))) throw new Error(\`Cannot find menu item with id \${text(parentId)}\`);
            items.set(id, serializable(id, properties));
            const handler = callbackOf(properties.onclick);
            if (handler) onclick.set(id, handler);
          });
          const cb = callbackOf(callback);
          done.then(
            () => {
              cb?.();
            },
            (e) => {
              console.warn("[Chrome Bridge] contextMenus.create:", e instanceof Error ? e.message : e);
              cb?.();
            }
          );
          return id;
        },
        update(id, updateProperties = {}, callback) {
          const properties = fields(updateProperties);
          return settle(enqueue(() => {
            const current = isId(id) ? items.get(id) : void 0;
            if (!isId(id) || !current) throw notFound(id);
            items.set(id, serializable(id, { ...current, ...properties }));
            const handler = callbackOf(properties.onclick);
            if (handler) onclick.set(id, handler);
          }), callback);
        },
        remove(id, callback) {
          return settle(enqueue(() => {
            if (!isId(id) || !items.has(id)) throw notFound(id);
            removeTree(id);
          }), callback);
        },
        removeAll(callback) {
          return settle(enqueue(() => {
            items.clear();
            onclick.clear();
          }), callback);
        }
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      const onClicked = eventOf(existing, "onClicked") ?? event();
      if (missingEvent(existing, "onClicked")) define(existing, "onClicked", onClicked);
      if (existing.ACTION_MENU_TOP_LEVEL_LIMIT === void 0) define(existing, "ACTION_MENU_TOP_LEVEL_LIMIT", 6);
      if (!c.contextMenus) define(c, "contextMenus", existing);
      shared.contextMenus.add(existing);
      shared.bridge.on("contextMenus.clicked", async (message) => {
        const clicked = message.info;
        if (!clicked) return;
        const item = items.get(clicked.menuItemId);
        if (!item && !isWorker) return;
        if (isWorker && item && (item.type === "checkbox" || item.type === "radio")) {
          await enqueue(() => {
            if (item.type === "checkbox") item.checked = !item.checked;
            else {
              const siblings = [...items.values()].filter((x) => x.parentId === item.parentId);
              const index = siblings.indexOf(item);
              let start = index, end = index;
              while (start > 0 && siblings[start - 1].type === "radio") start--;
              while (end < siblings.length - 1 && siblings[end + 1].type === "radio") end++;
              for (let i = start; i <= end; i++) siblings[i].checked = i === index;
            }
          });
        }
        let tab;
        const tabs = nsOf(c, "tabs");
        if (Number.isInteger(message.tabId) && fnOf(tabs, "get")) {
          try {
            tab = await invoke(chrome, tabs, "get", message.tabId);
          } catch {
            tab = void 0;
          }
        }
        const data = { ...clicked, ...item?.type === "checkbox" || item?.type === "radio" ? { checked: !!item.checked } : {} };
        emit(onClicked, data, tab);
        const legacy = onclick.get(clicked.menuItemId);
        if (legacy) later(() => {
          try {
            legacy(data, tab);
          } catch (e) {
            console.error("[Chrome Bridge] contextMenus onclick:", e);
          }
        });
      });
      if (isWorker) shared.bridge.on("bridge.sync", () => {
        void chain.then(announce);
      });
      info.modes.contextMenus = shared.bridge.available ? "shown in the Obsidian Web Viewer context menu and on the toolbar button; icons are not shown" : "registration-only: BroadcastChannel unavailable, menus are not shown";
    });
  }

  // src/extensions/compat/apis/windows.ts
  var OBSIDIAN_WINDOW_ID = 0;
  var WINDOW_ID_NONE = -1;
  var WINDOW_ID_CURRENT = -2;
  var isBridgePage = (url) => typeof url === "string" && /^chrome-extension:\\/\\/[a-p]{32}\\//.test(url) && url.slice("chrome-extension://".length + 33).startsWith(RESERVED_PREFIX);
  function windowOf(tabs) {
    const screen = typeof globalThis.screen === "object" ? globalThis.screen : void 0;
    const doc = typeof document === "object" ? document : void 0;
    return {
      id: OBSIDIAN_WINDOW_ID,
      focused: doc ? doc.hasFocus() : true,
      alwaysOnTop: false,
      incognito: false,
      type: "normal",
      state: "normal",
      top: 0,
      left: 0,
      width: Number(screen?.availWidth) || 1280,
      height: Number(screen?.availHeight) || 800,
      ...tabs ? { tabs } : {}
    };
  }
  var optionsAndCallback = (options, callback) => callbackOf(options) ? [void 0, options] : [options, callback];
  function installWindows(ctx) {
    const { c, chrome, info, report } = ctx;
    const windows = nsOf(c, "windows");
    if (!windows || !missingFn(windows, "getCurrent")) return;
    report("windows.obsidian-window", () => {
      const tabs = (populate) => populate ? invoke(chrome, c.tabs, "query", {}).then((rows) => Array.isArray(rows) ? rows.filter((t) => !isBridgePage(fields(t).url)) : []).catch(() => []) : Promise.resolve(void 0);
      const lookup = (windowId, options) => {
        if (windowId !== OBSIDIAN_WINDOW_ID && windowId !== WINDOW_ID_CURRENT) return Promise.reject(new Error(\`No window with id: \${text(windowId)}.\`));
        return tabs(fields(options).populate).then(windowOf);
      };
      const api = {
        get: (windowId, options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(windowId, opts), cb);
        },
        getCurrent: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(OBSIDIAN_WINDOW_ID, opts), cb);
        },
        getLastFocused: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(OBSIDIAN_WINDOW_ID, opts), cb);
        },
        getAll: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          const types = fields(opts).windowTypes;
          const wantsNormal = !Array.isArray(types) || types.includes("normal");
          return settle(wantsNormal ? lookup(OBSIDIAN_WINDOW_ID, opts).then((w) => [w]) : Promise.resolve([]), cb);
        },
        // Obsidian's window is not the extension's to move, resize or close.
        update: (windowId, _info, callback) => settle(lookup(windowId, {}), callback),
        remove: (windowId, callback) => settle(Promise.reject(new Error(\`Window \${text(windowId)} cannot be closed by an extension in Obsidian.\`)), callback)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(windows, key)) define(windows, key, value);
      fillEvents(windows, ["onCreated", "onRemoved", "onFocusChanged", "onBoundsChanged"]);
      if (windows.WINDOW_ID_NONE === void 0) define(windows, "WINDOW_ID_NONE", WINDOW_ID_NONE);
      if (windows.WINDOW_ID_CURRENT === void 0) define(windows, "WINDOW_ID_CURRENT", WINDOW_ID_CURRENT);
      if (windows.WindowType === void 0) define(windows, "WindowType", { NORMAL: "normal", POPUP: "popup", PANEL: "panel", APP: "app", DEVTOOLS: "devtools" });
      if (windows.WindowState === void 0) define(windows, "WindowState", { NORMAL: "normal", MINIMIZED: "minimized", MAXIMIZED: "maximized", FULLSCREEN: "fullscreen", LOCKED_FULLSCREEN: "locked_fullscreen" });
      info.modes.windows = "Obsidian is one window (id 0, as Electron reports for every tab); windows cannot be moved or closed; window events are registration-only";
    });
  }
  function installTabExtras(ctx) {
    const { c, chrome, info, shared, report } = ctx;
    const tabs = nsOf(c, "tabs");
    if (!tabs || !shared.bridge.available) return;
    report("tabs.extras", () => {
      const added = [];
      const add = (name, fn) => {
        if (missingFn(tabs, name)) {
          define(tabs, name, fn);
          added.push(name);
        }
      };
      add("getCurrent", (callback) => settle((async () => {
        if (isWorker || !globalThis.location) return void 0;
        const rows = await invoke(chrome, tabs, "query", {}).catch(() => []);
        const popup = chrome.runtime.getManifest?.()?.action?.default_popup;
        if (typeof popup === "string" && globalThis.location.pathname === "/" + popup.replace(/^\\//, "").split(/[?#]/)[0]) return void 0;
        return Array.isArray(rows) ? rows.find((t) => fields(t).url === globalThis.location.href) : void 0;
      })(), callback));
      const history = (delta) => (tabId, callback) => {
        if (callbackOf(tabId)) {
          callback = tabId;
          tabId = void 0;
        }
        return settle(shared.bridge.request("tabs.history", { tabId: typeof tabId === "number" && Number.isSafeInteger(tabId) ? tabId : null, delta }, 5e3).then(() => void 0), callback);
      };
      add("goBack", history(-1));
      add("goForward", history(1));
      add("captureVisibleTab", (...args) => {
        const callback = callbackOf(args[args.length - 1]) ? args.pop() : void 0;
        const options = fields(args.find((a) => a && typeof a === "object"));
        const quality = options.quality;
        return settle(shared.bridge.request("tabs.capture", {
          format: options.format === "png" ? "png" : "jpeg",
          ...typeof quality === "number" && Number.isInteger(quality) ? { quality } : {}
        }, 1e4).then((r) => r.dataUrl), callback);
      });
      add("duplicate", (tabId, callback) => settle((async () => {
        const url = fields(await invoke(chrome, tabs, "get", tabId)).url;
        if (typeof url !== "string" || !url) throw new Error(\`No tab with id: \${text(tabId)}.\`);
        const { tabId: id } = await shared.bridge.request("tabs.open", { url, active: true, reason: "tabs.create" }, 1e4);
        return Number.isSafeInteger(id) ? invoke(chrome, tabs, "get", id).catch(() => ({ id, url })) : void 0;
      })(), callback));
      add("highlight", (highlightInfo, callback) => settle((async () => {
        const requested = fields(highlightInfo).tabs;
        const ids = Array.isArray(requested) ? requested : [requested];
        const first = ids.find((x) => typeof x === "number" && Number.isSafeInteger(x));
        if (first !== void 0) await shared.bridge.request("tabs.activate", { tabId: first }, 5e3).catch(() => void 0);
        return windowOf();
      })(), callback));
      if (tabs.TAB_ID_NONE === void 0) define(tabs, "TAB_ID_NONE", -1);
      if (tabs.TAB_INDEX_NONE === void 0) define(tabs, "TAB_INDEX_NONE", -1);
      if (added.length) info.modes.tabsExtras = added.join(", ") + " via Obsidian (captureVisibleTab: the active Web Viewer tab)";
    });
  }

  // src/extensions/compat/apis/tabs.ts
  var OTHER_TAB_EVENTS = ["onAttached", "onDetached", "onHighlighted", "onMoved", "onReplaced", "onZoomChange"];
  var filtered = /* @__PURE__ */ Symbol.for("obsidian-bridge.tabs-query-filtered");
  var tabRows = (value) => Array.isArray(value) ? value.map(fields) : null;
  function installTabs(ctx) {
    const { c, chrome, info, report } = ctx;
    const tabs = nsOf(c, "tabs");
    if (!tabs) return;
    const registrationOnly = ctx.shared.bridge.available ? OTHER_TAB_EVENTS : [...OTHER_TAB_EVENTS, ...TAB_EVENTS];
    if (registrationOnly.some((name) => missingEvent(tabs, name))) report("tabs.events-registration-only", () => {
      info.modes.otherTabsEvents = "registration-only: " + registrationOnly.filter((name) => missingEvent(tabs, name)).join(", ");
      fillEvents(tabs, registrationOnly);
    });
    installTabEvents(ctx, tabs);
    const nativeQuery = fnOf(tabs, "query");
    if (nativeQuery && !(filtered in nativeQuery)) report("tabs.hide-bridge-pages", () => {
      const holder = { query: nativeQuery.bind(tabs) };
      const query = (queryInfo = {}, callback) => {
        const op = invoke(chrome, holder, "query", queryInfo).then((result) => tabRows(result)?.filter((tab) => !isBridgePage(tab.url)) ?? result);
        const cb = callbackOf(callback);
        if (!cb) return op;
        op.then((rows) => {
          cb(rows);
        }, (error) => {
          console.warn("[Chrome Bridge] tabs.query:", error);
          cb([]);
        });
        return void 0;
      };
      Object.defineProperty(query, filtered, { value: true });
      define(tabs, "query", query);
    });
    installActiveTab(ctx, tabs);
  }
  var TARGET_TIMEOUT_MS = 2e3;
  var WINDOW_ID_CURRENT2 = -2;
  function isPopupDocument(manifest) {
    if (typeof document !== "object" || !globalThis.location || isWorker) return false;
    const popup = manifest.action?.default_popup || manifest.browser_action?.default_popup || manifest.page_action?.default_popup;
    if (typeof popup !== "string") return false;
    return globalThis.location.pathname === "/" + popup.split(/[?#]/)[0].replace(/^\\//, "");
  }
  var validTab = (r) => {
    const tabId = r?.tabId;
    return typeof tabId === "number" && Number.isSafeInteger(tabId) && tabId > 0 ? tabId : null;
  };
  function installActiveTab({ c, chrome, info, manifest, shared, report }, tabs) {
    const nativeQuery = fnOf(tabs, "query");
    if (!shared.bridge.available || !nativeQuery) return;
    const popup = isPopupDocument(manifest);
    report(popup ? "tabs.active-webviewer" : "tabs.active-from-obsidian", () => {
      let popupTarget = null;
      let inFlight = null;
      const activeTab = () => {
        if (popup) {
          return popupTarget ??= shared.bridge.request("popup.targetTab", {}, TARGET_TIMEOUT_MS).then(validTab, () => null).then((id) => {
            info.targetTabId = id;
            return id;
          });
        }
        return inFlight ??= shared.bridge.request("tabs.activeTab", {}, TARGET_TIMEOUT_MS).then(validTab, () => null).finally(() => {
          inFlight = null;
        });
      };
      if (popup) void activeTab();
      const holder = { query: nativeQuery.bind(tabs) };
      const native = (queryInfo) => invoke(chrome, holder, "query", queryInfo);
      const ownPage = (tab) => {
        if (!popup || typeof tab.url !== "string") return false;
        try {
          const u = new URL(tab.url);
          return u.protocol === "chrome-extension:" && u.hostname === c.runtime.id && u.pathname === globalThis.location.pathname;
        } catch {
          return false;
        }
      };
      const patchedQuery = (queryInfo = {}, callback) => {
        const requested = fields(queryInfo);
        const has = (k) => Object.hasOwn(requested, k);
        const active = has("active") ? !!requested.active : has("highlighted") ? !!requested.highlighted : null;
        const current = has("currentWindow") ? !!requested.currentWindow : has("lastFocusedWindow") ? !!requested.lastFocusedWindow : requested.windowId === WINDOW_ID_CURRENT2 ? true : null;
        const op = activeTab().then((target) => {
          const nativeFilter = { ...requested };
          for (const k of ["active", "highlighted", "currentWindow", "lastFocusedWindow"]) delete nativeFilter[k];
          if (nativeFilter.windowId === WINDOW_ID_CURRENT2) delete nativeFilter.windowId;
          return native(nativeFilter).then((result) => {
            const all = tabRows(result);
            if (!all) return result;
            const rows = all.filter((tab) => !ownPage(tab));
            const focused = target === null ? void 0 : rows.find((tab) => tab.id === target);
            if (!focused) return rows.filter(() => active !== true && current !== true).map((tab) => ({ ...tab, active: false }));
            return rows.filter((tab) => {
              if (current === true && tab.windowId !== focused.windowId) return false;
              if (current === false && tab.windowId === focused.windowId) return false;
              if (active !== null && active !== (tab.id === focused.id)) return false;
              return true;
            }).map((tab) => ({ ...tab, active: tab.id === focused.id, highlighted: tab.id === focused.id }));
          });
        });
        const cb = callbackOf(callback);
        if (!cb) return op;
        op.then((value) => {
          cb(value);
        }, (error) => {
          console.warn("[Chrome Bridge] tabs.query compatibility:", error);
          cb([]);
        });
        return void 0;
      };
      define(tabs, "query", patchedQuery);
      info.modes.tabsActive = popup ? "the popup's active tab is the Web Viewer it was opened from" : "active tab = the Web Viewer tab focused in Obsidian";
    });
  }
  var tabNamespaces = /* @__PURE__ */ new Set();
  var tabDelivery = false;
  function installTabEvents(ctx, namespace) {
    const { chrome, granted, hosts, info, shared, report } = ctx;
    if (!shared.bridge.available || tabNamespaces.has(namespace)) return;
    report("tabs.events-from-obsidian", () => {
      let pending = false;
      const announce = () => {
        if (!isWorker || pending) return;
        pending = true;
        setTimeout(() => {
          pending = false;
          const events2 = TAB_EVENTS.filter((name) => [...tabNamespaces].some((ns) => listenerCount(ns[name]) > 0));
          shared.bridge.post({ type: "tabs.listeners", events: events2 });
        }, 0);
      };
      for (const name of TAB_EVENTS) define(namespace, name, event({ onChange: announce }));
      tabNamespaces.add(namespace);
      shared.bridge.on("bridge.sync", announce);
      if (isWorker) announce();
      const sensitive = granted.has("tabs") || hosts.size > 0;
      if (!tabDelivery) {
        tabDelivery = true;
        const nativeTabs = nsOf(chrome, "tabs");
        shared.bridge.on("tabs.event", async (message) => {
          const name = message.event;
          if (!TAB_EVENTS.includes(name) || !Number.isSafeInteger(message.tab?.id)) return;
          const known = { ...message.tab };
          if (!sensitive) {
            delete known.url;
            delete known.title;
            delete known.favIconUrl;
          }
          let tab = { id: known.id };
          if (name !== "onRemoved" && fnOf(nativeTabs, "get")) {
            try {
              tab = fields(await invoke(chrome, nativeTabs, "get", known.id));
            } catch {
            }
          }
          tab = { id: known.id, ...tab, ...known, ...known.active !== void 0 ? { highlighted: known.active } : {} };
          if (!sensitive) {
            delete tab.url;
            delete tab.title;
            delete tab.favIconUrl;
            delete tab.pendingUrl;
          }
          const change = { ...message.changeInfo || {} };
          if (!sensitive) {
            delete change.url;
            delete change.title;
            delete change.favIconUrl;
          }
          for (const ns of tabNamespaces) {
            if (name === "onUpdated") emit(ns.onUpdated, tab.id, change, tab);
            else if (name === "onCreated") emit(ns.onCreated, tab);
            else if (name === "onActivated") emit(ns.onActivated, { tabId: tab.id, windowId: tab.windowId ?? -1 });
            else if (name === "onRemoved") emit(ns.onRemoved, tab.id, message.removeInfo || { windowId: -1, isWindowClosing: false });
          }
        });
      }
      info.modes.tabsEvents = "onActivated/onCreated/onRemoved/onUpdated delivered from Obsidian Web Viewer tabs";
    });
  }

  // src/extensions/compat/apis/open.ts
  var OPENABLE = /^(https?:|chrome-extension:|about:blank$)/i;
  var activates = /* @__PURE__ */ Symbol.for("obsidian-bridge.tabs-update-activates");
  var extensionRoot;
  function resolveUrl(raw) {
    const value = raw === void 0 || raw === null || raw === "" ? "about:blank" : text(raw);
    try {
      const url = new URL(value, globalThis.location?.href ?? extensionRoot);
      return OPENABLE.test(url.href) ? url.href : null;
    } catch {
      return null;
    }
  }
  function installOpen(ctx) {
    const { c, chrome, info, shared, report } = ctx;
    if (!shared.bridge.available) return;
    if (fnOf(chrome.runtime, "getURL")) extensionRoot ??= chrome.runtime.getURL("");
    const tabs = nsOf(c, "tabs");
    const open = async (raw, active, reason) => {
      const url = resolveUrl(raw);
      if (!url) throw new Error(\`Cannot open URL in Obsidian: \${text(raw, typeof raw)}\`);
      const { tabId } = await shared.bridge.request("tabs.open", { url, active, reason }, 1e4);
      return Number.isSafeInteger(tabId) ? tabId : null;
    };
    const tabFor = async (tabId, url, active) => {
      if (tabId !== null && fnOf(tabs, "get")) {
        try {
          const tab = await invoke(chrome, tabs, "get", tabId);
          if (tab) return tab;
        } catch {
        }
      }
      return {
        id: tabId ?? -1,
        index: 0,
        windowId: -1,
        url: url ?? void 0,
        active,
        highlighted: active,
        pinned: false,
        incognito: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1
      };
    };
    if (tabs && missingFn(tabs, "create")) report("tabs.create", () => {
      define(tabs, "create", (createProperties = {}, callback) => {
        const properties = fields(createProperties);
        const active = properties.active !== false;
        const op = open(properties.url, active, "tabs.create").then((tabId) => tabFor(tabId, resolveUrl(properties.url), active));
        return settle(op, callback);
      });
      info.modes.tabsCreate = "opens in an Obsidian tab (web URLs in Web Viewer, extension pages in an extension tab)";
    });
    if (tabs && missingFn(tabs, "remove")) report("tabs.remove", () => {
      define(tabs, "remove", (tabIds, callback) => {
        const ids = (Array.isArray(tabIds) ? tabIds : [tabIds]).filter((id) => typeof id === "number" && Number.isSafeInteger(id));
        return settle(shared.bridge.request("tabs.remove", { tabIds: ids }, 1e4).then(() => void 0), callback);
      });
    });
    const nativeUpdate = fnOf(tabs, "update");
    if (tabs && nativeUpdate && !(activates in nativeUpdate)) report("tabs.update.active", () => {
      const update = (...args) => {
        const [tabId, properties] = typeof args[0] === "number" ? [args[0], args[1]] : [void 0, args[0]];
        if (fields(properties).active === true && typeof tabId === "number") {
          shared.bridge.request("tabs.activate", { tabId }, 5e3).catch(() => void 0);
        }
        return nativeUpdate.apply(tabs, args);
      };
      Object.defineProperty(update, activates, { value: true });
      define(tabs, "update", update);
    });
    if (missingFn(c.windows, "create")) report("windows.create", () => {
      const existing = nsOf(c, "windows") ?? {};
      define(existing, "create", (createData = {}, callback) => {
        const data = fields(createData);
        const urls = Array.isArray(data.url) ? data.url : [data.url];
        const op = (async () => {
          const opened = [];
          for (const [i, url] of urls.entries()) {
            const active = i === 0 && data.focused !== false;
            opened.push(await tabFor(await open(url, active, "windows.create"), resolveUrl(url), active));
          }
          return {
            id: OBSIDIAN_WINDOW_ID,
            focused: data.focused !== false,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            incognito: false,
            type: typeof data.type === "string" ? data.type : "normal",
            state: "normal",
            alwaysOnTop: false,
            tabs: opened
          };
        })();
        return settle(op, callback);
      });
      if (existing.WINDOW_ID_NONE === void 0) define(existing, "WINDOW_ID_NONE", -1);
      if (existing.WINDOW_ID_CURRENT === void 0) define(existing, "WINDOW_ID_CURRENT", -2);
      if (!c.windows) define(c, "windows", existing);
      info.modes.windowsCreate = "opens the URLs as Obsidian tabs; the returned window is not a real window";
    });
    if (missingFn(c.runtime, "openOptionsPage")) report("runtime.openOptionsPage", () => {
      define(c.runtime, "openOptionsPage", (callback) => settle(
        shared.bridge.request("runtime.openOptionsPage", {}, 1e4).then(() => void 0),
        callback
      ));
    });
  }
  function installPageOpen(ctx) {
    const doc = typeof document === "object" ? document : void 0;
    if (isWorker || !doc || !ctx.shared.bridge.available) return;
    const request = (raw, reason) => {
      const url = resolveUrl(raw);
      if (!url) return false;
      ctx.shared.bridge.request("tabs.open", { url, active: true, reason }, 1e4).catch((e) => console.warn("[Chrome Bridge] open:", e));
      return true;
    };
    const nativeOpen = globalThis.open;
    define(globalThis, "open", (url, target, features) => {
      if (target === "_self" || target === "_top" || target === "_parent") return nativeOpen.call(globalThis, url, target, features);
      request(url, "window.open");
      return null;
    });
    const onClick = (event2) => {
      if (event2.defaultPrevented) return;
      const anchor = event2.target?.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const target = (anchor.getAttribute("target") || "").toLowerCase();
      const newTab = target && !["_self", "_top", "_parent"].includes(target) || event2.ctrlKey || event2.metaKey || event2.shiftKey || event2.button === 1;
      if (!newTab || /^javascript:/i.test(anchor.href)) return;
      if (request(anchor.href, "link")) event2.preventDefault();
    };
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("auxclick", onClick, true);
    ctx.info.installed.push("page.open-in-obsidian");
  }

  // src/extensions/shared/re2.ts
  var MAX_REPEAT = 1e3;
  var MAX_PROGRAM = 2e4;
  var SyntaxError2 = class extends Error {
  };
  var isWord = (c) => !!c && /[A-Za-z0-9_]/.test(c);
  var DIGIT = (c) => c >= "0" && c <= "9";
  var WORD = (c) => isWord(c);
  var SPACE = (c) => c === " " || c === "	" || c === "\\n" || c === "\\r" || c === "\\f" || c === "\\v";
  var not = (f) => (c) => !f(c);
  var POSIX = {
    alpha: (c) => /[A-Za-z]/.test(c),
    digit: DIGIT,
    alnum: (c) => /[A-Za-z0-9]/.test(c),
    upper: (c) => /[A-Z]/.test(c),
    lower: (c) => /[a-z]/.test(c),
    space: SPACE,
    xdigit: (c) => /[0-9A-Fa-f]/.test(c),
    word: WORD,
    punct: (c) => /[!-/:-@[-\`{-~]/.test(c),
    blank: (c) => c === " " || c === "	",
    cntrl: (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
    print: (c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127,
    graph: (c) => c.charCodeAt(0) > 32 && c.charCodeAt(0) < 127,
    ascii: (c) => c.charCodeAt(0) < 128
  };
  var CONTROL = { n: "\\n", t: "	", r: "\\r", f: "\\f", v: "\\v", a: String.fromCharCode(7) };
  function folded(test, caseInsensitive) {
    if (!caseInsensitive) return test;
    return (c) => test(c) || test(c.toLowerCase()) || test(c.toUpperCase());
  }
  var Parser = class {
    constructor(src, ci) {
      this.src = src;
      this.ci = ci;
    }
    src;
    ci;
    pos = 0;
    groups = 0;
    parse() {
      const node = this.alternation();
      if (this.pos < this.src.length) throw new SyntaxError2("unexpected )");
      return node;
    }
    peek() {
      return this.src[this.pos];
    }
    alternation() {
      const branches = [this.concatenation()];
      while (this.peek() === "|") {
        this.pos++;
        branches.push(this.concatenation());
      }
      return branches.length === 1 ? branches[0] : { t: "alt", nodes: branches };
    }
    concatenation() {
      const nodes = [];
      while (this.pos < this.src.length && this.peek() !== "|" && this.peek() !== ")") {
        const atom = this.atom();
        if (atom) nodes.push(this.quantified(atom));
      }
      return nodes.length === 1 ? nodes[0] : { t: "cat", nodes };
    }
    quantified(atom) {
      let node = atom;
      for (; ; ) {
        const c = this.peek();
        let min, max;
        if (c === "*") {
          min = 0;
          max = Infinity;
          this.pos++;
        } else if (c === "+") {
          min = 1;
          max = Infinity;
          this.pos++;
        } else if (c === "?") {
          min = 0;
          max = 1;
          this.pos++;
        } else if (c === "{") {
          const m = /^\\{(\\d+)(,(\\d*))?\\}/.exec(this.src.slice(this.pos));
          if (!m) return node;
          min = Number(m[1]);
          max = m[2] === void 0 ? min : m[3] === "" ? Infinity : Number(m[3]);
          if (min > MAX_REPEAT || max !== Infinity && (max > MAX_REPEAT || max < min)) throw new SyntaxError2("bad repetition");
          this.pos += m[0].length;
        } else return node;
        if (node.t === "assert") throw new SyntaxError2("nothing to repeat");
        let greedy = true;
        if (this.peek() === "?") {
          greedy = false;
          this.pos++;
        }
        if (node.t === "repeat") throw new SyntaxError2("bad repetition operator");
        node = { t: "repeat", node, min, max, greedy };
      }
    }
    atom() {
      const c = this.src[this.pos++];
      switch (c) {
        case "(":
          return this.group();
        case "[":
          return { t: "char", test: folded(this.charClass(), this.ci) };
        case ".":
          return { t: "char", test: (ch) => ch !== "\\n" };
        case "^":
          return { t: "assert", kind: "start" };
        case "$":
          return { t: "assert", kind: "end" };
        case "\\\\":
          return this.escape();
        case "*":
        case "+":
        case "?":
          throw new SyntaxError2("missing argument to repetition operator");
        default:
          return this.literal(c);
      }
    }
    literal(c) {
      const lit = c.toLowerCase();
      if (!this.ci) return { t: "char", test: (ch) => ch === c, lit };
      return { t: "char", test: (ch) => ch.toLowerCase() === lit, lit };
    }
    group() {
      let index = null;
      if (this.src.startsWith("?:", this.pos)) this.pos += 2;
      else if (this.src.startsWith("?P<", this.pos) || this.src.startsWith("?<", this.pos) && !/^\\?<[=!]/.test(this.src.slice(this.pos))) {
        const close = this.src.indexOf(">", this.pos);
        if (close < 0) throw new SyntaxError2("bad named group");
        this.pos = close + 1;
        index = ++this.groups;
      } else if (this.peek() === "?") {
        const m = /^\\?(i)(\\)|:)/.exec(this.src.slice(this.pos));
        if (!m) throw new SyntaxError2("unsupported group (lookaround or flags)");
        this.pos += m[0].length;
        if (m[2] === ")") {
          this.ci = true;
          return null;
        }
        const outer = this.ci;
        this.ci = true;
        const node2 = this.alternation();
        this.ci = outer;
        if (this.src[this.pos++] !== ")") throw new SyntaxError2("missing )");
        return { t: "group", index: null, node: node2 };
      } else index = ++this.groups;
      const node = this.alternation();
      if (this.src[this.pos++] !== ")") throw new SyntaxError2("missing )");
      return { t: "group", index, node };
    }
    /** An escape outside a class: assertion, class shorthand or literal. */
    escape() {
      const c = this.src[this.pos++];
      if (c === void 0) throw new SyntaxError2("trailing backslash");
      if (c === "b") return { t: "assert", kind: "word" };
      if (c === "B") return { t: "assert", kind: "notword" };
      if (c === "A") return { t: "assert", kind: "start" };
      if (c === "z") return { t: "assert", kind: "end" };
      if ("dDwWsS".includes(c)) return { t: "char", test: folded(this.classEscape(c), this.ci) };
      return this.literal(this.escapedChar(c));
    }
    /** Escapes valid both inside and outside classes. */
    classEscape(c) {
      switch (c) {
        case "d":
          return DIGIT;
        case "D":
          return not(DIGIT);
        case "w":
          return WORD;
        case "W":
          return not(WORD);
        case "s":
          return SPACE;
        case "S":
          return not(SPACE);
      }
      const ch = this.escapedChar(c);
      return (x) => x === ch;
    }
    escapedChar(c) {
      if (CONTROL[c]) return CONTROL[c];
      if (c === "x") {
        const m = /^(?:\\{([0-9A-Fa-f]{1,6})\\}|([0-9A-Fa-f]{2}))/.exec(this.src.slice(this.pos));
        if (!m) throw new SyntaxError2("bad \\\\x escape");
        this.pos += m[0].length;
        return String.fromCodePoint(parseInt(m[1] ?? m[2], 16));
      }
      if (c === "0") return String.fromCharCode(0);
      if (/[0-9A-Za-z]/.test(c)) throw new SyntaxError2("invalid escape \\\\" + c);
      return c;
    }
    charClass() {
      let negated = false;
      if (this.peek() === "^") {
        negated = true;
        this.pos++;
      }
      const tests = [];
      let first = true;
      for (; ; ) {
        const c = this.src[this.pos++];
        if (c === void 0) throw new SyntaxError2("missing ]");
        if (c === "]" && !first) break;
        first = false;
        if (c === "[" && this.peek() === ":") {
          const m = /^:(\\^?)([a-z]+):\\]/.exec(this.src.slice(this.pos));
          if (m && POSIX[m[2]]) {
            this.pos += m[0].length;
            tests.push(m[1] ? not(POSIX[m[2]]) : POSIX[m[2]]);
            continue;
          }
        }
        let low;
        if (c === "\\\\") {
          const e = this.src[this.pos++];
          if (e === void 0) throw new SyntaxError2("trailing backslash");
          if ("dDwWsS".includes(e)) {
            tests.push(this.classEscape(e));
            continue;
          }
          low = this.escapedChar(e);
        } else low = c;
        if (this.peek() === "-" && this.src[this.pos + 1] !== void 0 && this.src[this.pos + 1] !== "]") {
          this.pos++;
          let high = this.src[this.pos++];
          if (high === "\\\\") high = this.escapedChar(this.src[this.pos++]);
          if (high < low) throw new SyntaxError2("bad character class range");
          tests.push((x) => x >= low && x <= high);
        } else tests.push((x) => x === low);
      }
      const any = (x) => tests.some((t) => t(x));
      return negated ? not(any) : any;
    }
  };
  function compileProgram(node) {
    const prog = [];
    const emit2 = (inst) => {
      if (prog.length >= MAX_PROGRAM) throw new SyntaxError2("pattern too large");
      prog.push(inst);
      return prog.length - 1;
    };
    const emitSplit = () => {
      const inst = { op: "split", x: 0, y: 0 };
      return [emit2(inst), inst];
    };
    const emitJump = (x = 0) => {
      const inst = { op: "jmp", x };
      emit2(inst);
      return inst;
    };
    const gen = (n) => {
      switch (n.t) {
        case "char":
          emit2({ op: "char", test: n.test });
          return;
        case "assert":
          emit2({ op: "assert", kind: n.kind });
          return;
        case "group":
          if (n.index === null) {
            gen(n.node);
            return;
          }
          emit2({ op: "save", slot: n.index * 2 });
          gen(n.node);
          emit2({ op: "save", slot: n.index * 2 + 1 });
          return;
        case "cat":
          for (const x of n.nodes) gen(x);
          return;
        case "alt": {
          const jumps = [];
          for (let i = 0; i < n.nodes.length; i++) {
            if (i < n.nodes.length - 1) {
              const [, split] = emitSplit();
              split.x = prog.length;
              gen(n.nodes[i]);
              jumps.push(emitJump());
              split.y = prog.length;
            } else gen(n.nodes[i]);
          }
          for (const jump of jumps) jump.x = prog.length;
          return;
        }
        case "repeat": {
          for (let i = 0; i < n.min; i++) gen(n.node);
          if (n.max === Infinity) {
            const [at, split] = emitSplit();
            gen(n.node);
            emitJump(at);
            const out = prog.length;
            split.x = n.greedy ? at + 1 : out;
            split.y = n.greedy ? out : at + 1;
          } else {
            const splits = [];
            for (let i = n.min; i < n.max; i++) {
              splits.push(emitSplit());
              gen(n.node);
            }
            const out = prog.length;
            for (const [at, split] of splits) {
              split.x = n.greedy ? at + 1 : out;
              split.y = n.greedy ? out : at + 1;
            }
          }
          return;
        }
      }
    };
    emit2({ op: "save", slot: 0 });
    gen(node);
    emit2({ op: "save", slot: 1 });
    emit2({ op: "match" });
    return prog;
  }
  function requiredLiteral(node) {
    let best = "";
    let run2 = "";
    const end = () => {
      if (run2.length > best.length) best = run2;
      run2 = "";
    };
    const walk = (n) => {
      if (n.t === "char" && n.lit !== void 0) run2 += n.lit;
      else if (n.t === "cat") n.nodes.forEach(walk);
      else if (n.t === "group") walk(n.node);
      else if (n.t === "assert") {
      } else {
        end();
        if (n.t === "repeat" && n.min > 0) {
          const inner = requiredLiteral(n.node);
          if (inner.length > best.length) best = inner;
        }
      }
    };
    walk(node);
    end();
    return best;
  }
  var lastInput = "";
  var lastLower = "";
  var lowerOf = (input) => input === lastInput ? lastLower : lastLower = (lastInput = input).toLowerCase();
  function anchoredAtStart(prog) {
    for (const inst of prog) {
      if (inst.op === "save") continue;
      return inst.op === "assert" && inst.kind === "start";
    }
    return false;
  }
  function run(prog, slots, anchored, input) {
    const n = prog.length;
    let clist = [];
    let nlist = [];
    const mark = new Int32Array(n).fill(-1);
    let generation = 0;
    let matched = null;
    const add = (list3, pc0, caps0, pos) => {
      const stack = [[pc0, caps0]];
      while (stack.length) {
        const [pc, caps] = stack.pop();
        if (mark[pc] === generation) continue;
        mark[pc] = generation;
        const inst = prog[pc];
        switch (inst.op) {
          case "jmp":
            stack.push([inst.x, caps]);
            break;
          case "split":
            stack.push([inst.y, caps], [inst.x, caps]);
            break;
          case "save": {
            const next = caps.slice();
            next[inst.slot] = pos;
            stack.push([pc + 1, next]);
            break;
          }
          case "assert": {
            const before = input[pos - 1], after = input[pos];
            const ok = inst.kind === "start" ? pos === 0 : inst.kind === "end" ? pos === input.length : isWord(before) !== isWord(after) === (inst.kind === "word");
            if (ok) stack.push([pc + 1, caps]);
            break;
          }
          default:
            list3.push({ pc, caps });
        }
      }
    };
    const empty = new Array(slots).fill(-1);
    generation++;
    add(clist, 0, empty, 0);
    for (let pos = 0; ; pos++) {
      if (!clist.length && (matched || anchored)) break;
      generation++;
      const ch = input[pos];
      for (const thread of clist) {
        const inst = prog[thread.pc];
        if (inst.op === "match") {
          matched = thread.caps;
          break;
        }
        if (inst.op === "char" && ch !== void 0 && inst.test(ch)) add(nlist, thread.pc + 1, thread.caps, pos + 1);
      }
      if (pos >= input.length) break;
      if (!matched && !anchored) add(nlist, 0, empty, pos + 1);
      [clist, nlist] = [nlist, clist];
      nlist.length = 0;
    }
    return matched;
  }
  var cache = /* @__PURE__ */ new Map();
  function compileRe2(source, caseInsensitive = false) {
    const key = (caseInsensitive ? "i:" : "s:") + source;
    if (cache.has(key)) return cache.get(key);
    let result = null;
    try {
      const parser = new Parser(source, caseInsensitive);
      const ast = parser.parse();
      const prog = compileProgram(ast);
      const literal = requiredLiteral(ast);
      const possible = (input) => !literal || lowerOf(input).includes(literal);
      const slots = (parser.groups + 1) * 2;
      const anchored = anchoredAtStart(prog);
      result = {
        source,
        test: (input) => possible(input) && run(prog, slots, anchored, input) !== null,
        exec(input) {
          const caps = possible(input) ? run(prog, slots, anchored, input) : null;
          if (!caps) return null;
          const out = [];
          for (let i = 0; i < slots; i += 2) out.push(caps[i] >= 0 && caps[i + 1] >= 0 ? input.slice(caps[i], caps[i + 1]) : void 0);
          return out;
        }
      };
    } catch {
      result = null;
    }
    if (cache.size > 4e3) cache.clear();
    cache.set(key, result);
    return result;
  }

  // src/extensions/shared/net-request.ts
  function appliesToMainFrame(rule) {
    const c = rule?.condition || {};
    if (Array.isArray(c.resourceTypes)) return c.resourceTypes.includes("main_frame");
    if (Array.isArray(c.excludedResourceTypes)) return !c.excludedResourceTypes.includes("main_frame");
    return false;
  }

  // src/extensions/compat/apis/net-request.ts
  var observed2 = /* @__PURE__ */ Symbol.for("obsidian-bridge.dnr-observed");
  var DYNAMIC_KEY = "__obsidian_bridge_dnr_dynamic_v1__";
  var SESSION_KEY = "__obsidian_bridge_dnr_session_v1__";
  var ENABLED_KEY = "__obsidian_bridge_dnr_enabled_rulesets_v1__";
  var LIMITS = {
    MAX_NUMBER_OF_DYNAMIC_RULES: 3e4,
    MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES: 5e3,
    MAX_NUMBER_OF_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_UNSAFE_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_REGEX_RULES: 1e3,
    MAX_NUMBER_OF_STATIC_RULESETS: 100,
    MAX_NUMBER_OF_ENABLED_STATIC_RULESETS: 50,
    GUARANTEED_MINIMUM_STATIC_RULES: 3e4,
    GETMATCHEDRULES_QUOTA_INTERVAL: 10,
    MAX_GETMATCHEDRULES_CALLS_PER_INTERVAL: 20
  };
  function validate(rules, existing) {
    if (!Array.isArray(rules)) return [];
    const out = [];
    for (const raw of rules) {
      const rule = raw;
      if (!rule || !Number.isInteger(rule.id) || rule.id < 1) throw new Error(\`Rule with id \${JSON.stringify(raw?.id)} does not have a valid ID.\`);
      if (existing.has(rule.id) || out.some((r) => r.id === rule.id)) throw new Error(\`Rule with id \${rule.id} does not have a unique ID.\`);
      if (!rule.action || typeof rule.action.type !== "string") throw new Error(\`Rule with id \${rule.id} does not specify a valid action.\`);
      if (rule.priority !== void 0 && (!Number.isInteger(rule.priority) || rule.priority < 1)) throw new Error(\`Rule with id \${rule.id} has an invalid priority.\`);
      if (typeof rule.condition?.regexFilter === "string" && !compileRe2(rule.condition.regexFilter)) {
        throw new Error(\`Rule with id \${rule.id} specified a non-supported regular expression.\`);
      }
      out.push(JSON.parse(JSON.stringify({ ...rule, priority: rule.priority ?? 1, condition: rule.condition ?? {} })));
    }
    return out;
  }
  var ruleList = (value) => Array.isArray(value) ? value.filter((r) => Number.isInteger(fields(r).id)) : [];
  var list = (value) => Array.isArray(value) ? value : [];
  function declaredRulesets(manifest) {
    const resources = fields(manifest.declarative_net_request).rule_resources;
    const out = [];
    for (const raw of list(resources)) {
      const { id, path, enabled } = fields(raw);
      if (typeof id === "string" && typeof path === "string") out.push({ id, path, enabled: enabled !== false });
    }
    return out;
  }
  function staticLoader(chrome) {
    const cache2 = /* @__PURE__ */ new Map();
    return (ruleset) => {
      if (!cache2.has(ruleset.id)) cache2.set(ruleset.id, (async () => {
        try {
          const response = await fetch(chrome.runtime.getURL(ruleset.path.replace(/^\\//, "")));
          const parsed = await response.json();
          return ruleList(parsed).filter(appliesToMainFrame);
        } catch (e) {
          console.warn("[Chrome Bridge] declarativeNetRequest ruleset", ruleset.id, e);
          return [];
        }
      })());
      return cache2.get(ruleset.id);
    };
  }
  var isBridgePage2 = () => !isWorker && globalThis.location?.pathname === "/" + HOST_PAGE;
  function observeNative(ctx, dnr) {
    const { chrome, info, manifest, shared, report } = ctx;
    if (observed2 in dnr) return;
    report("declarativeNetRequest.enforced-by-obsidian", () => {
      const declared = declaredRulesets(manifest);
      const loadStatic = staticLoader(chrome);
      let pending = false;
      const announce = () => {
        if (pending) return;
        pending = true;
        setTimeout(() => void (async () => {
          pending = false;
          try {
            const [session, dynamic, enabled] = await Promise.all([
              invoke(chrome, dnr, "getSessionRules"),
              invoke(chrome, dnr, "getDynamicRules"),
              missingFn(dnr, "getEnabledRulesets") ? Promise.resolve(declared.filter((r) => r.enabled).map((r) => r.id)) : invoke(chrome, dnr, "getEnabledRulesets")
            ]);
            const enabledIds = list(enabled);
            const statics = (await Promise.all(declared.filter((r) => enabledIds.includes(r.id)).map(loadStatic))).flat();
            const rules = [...ruleList(session), ...ruleList(dynamic), ...statics].filter(appliesToMainFrame);
            shared.bridge.post({ type: "netRequest.rules", rules });
          } catch (e) {
            console.warn("[Chrome Bridge] declarativeNetRequest snapshot:", e);
          }
        })(), 0);
      };
      for (const method of ["updateSessionRules", "updateDynamicRules", "updateEnabledRulesets", "updateStaticRules"]) {
        const original = fnOf(dnr, method);
        if (!original) continue;
        define(dnr, method, (...args) => {
          const last = args.length - 1;
          const callback = callbackOf(args[last]);
          if (callback) args[last] = (...result) => {
            announce();
            callback(...result);
          };
          const returned = original.apply(dnr, args);
          if (isThenable(returned)) returned.then(announce, announce);
          return returned;
        });
      }
      try {
        Object.defineProperty(dnr, observed2, { value: true });
      } catch {
      }
      shared.bridge.on("bridge.sync", announce);
      if (isWorker || isBridgePage2()) announce();
      info.modes.declarativeNetRequest = "native rules enforced by Obsidian for Web Viewer top-level navigations (block/allow/redirect/upgradeScheme); sub-resources and modifyHeaders are not";
    });
  }
  function installNetRequest(ctx) {
    const { c, chrome, granted, info, manifest, shared, report } = ctx;
    if (!granted.has("declarativeNetRequest") && !granted.has("declarativeNetRequestWithHostAccess")) return;
    if (!shared.bridge.available) return;
    const native = nsOf(c, "declarativeNetRequest");
    if (native && fnOf(native, "updateSessionRules")) {
      observeNative(ctx, native);
      return;
    }
    report("declarativeNetRequest", () => {
      const existing = native ?? {};
      const local = nsOf(nsOf(c, "storage"), "local");
      const persistent = granted.has("storage") && !missingFn(local, "get");
      const boot = fields(fields(globalThis).__obsidianBridgeLocaleData).bridgeBootId;
      const bootId = typeof boot === "string" ? boot : null;
      const dynamic = /* @__PURE__ */ new Map();
      const session = /* @__PURE__ */ new Map();
      const declared = declaredRulesets(manifest);
      let enabledRulesets = new Set(declared.filter((r) => r.enabled).map((r) => r.id));
      const loadStatic = staticLoader(chrome);
      let announcing = false;
      const announce = () => {
        if (!isWorker || announcing) return;
        announcing = true;
        setTimeout(() => void (async () => {
          announcing = false;
          const statics = (await Promise.all(declared.filter((r) => enabledRulesets.has(r.id)).map(loadStatic))).flat();
          const rules = [...session.values(), ...dynamic.values(), ...statics].filter(appliesToMainFrame);
          shared.bridge.post({ type: "netRequest.rules", rules });
        })(), 0);
      };
      const save = () => {
        if (!persistent) return;
        invoke(chrome, local, "set", {
          [DYNAMIC_KEY]: [...dynamic.values()],
          [SESSION_KEY]: { boot: bootId, rules: [...session.values()] },
          [ENABLED_KEY]: [...enabledRulesets]
        }).catch((e) => console.warn("[Chrome Bridge] declarativeNetRequest persist:", e));
      };
      let chain = persistent ? invoke(chrome, local, "get", [DYNAMIC_KEY, SESSION_KEY, ENABLED_KEY]).then((raw) => {
        const all = fields(raw);
        for (const rule of ruleList(all[DYNAMIC_KEY])) dynamic.set(rule.id, rule);
        const stored = fields(all[SESSION_KEY]);
        if (stored.boot === bootId) for (const rule of ruleList(stored.rules)) session.set(rule.id, rule);
        if (Array.isArray(all[ENABLED_KEY])) enabledRulesets = new Set(list(all[ENABLED_KEY]).filter((id) => declared.some((r) => r.id === id)));
      }).catch((e) => console.warn("[Chrome Bridge] declarativeNetRequest restore:", e)) : Promise.resolve();
      const enqueue = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result.then((value) => {
          save();
          announce();
          return value;
        });
      };
      const update = (store, options) => enqueue(() => {
        const { removeRuleIds, addRules } = fields(options);
        const next = new Map(store);
        for (const id of list(removeRuleIds)) if (typeof id === "number") next.delete(id);
        const added = validate(addRules, next);
        for (const rule of added) next.set(rule.id, rule);
        store.clear();
        for (const [id, rule] of next) store.set(id, rule);
      });
      const read = (store, filter) => chain.then(() => {
        const { ruleIds } = fields(filter);
        const ids = Array.isArray(ruleIds) ? list(ruleIds) : null;
        return [...store.values()].filter((r) => !ids || ids.includes(r.id)).map((r) => JSON.parse(JSON.stringify(r)));
      });
      const args = (a, b) => callbackOf(a) ? [void 0, a] : [a, b];
      const api = {
        updateDynamicRules: (options, callback) => settle(update(dynamic, options).then(() => void 0), callback),
        updateSessionRules: (options, callback) => settle(update(session, options).then(() => void 0), callback),
        getDynamicRules: (a, b) => {
          const [filter, cb] = args(a, b);
          return settle(read(dynamic, filter), cb);
        },
        getSessionRules: (a, b) => {
          const [filter, cb] = args(a, b);
          return settle(read(session, filter), cb);
        },
        getEnabledRulesets: (callback) => settle(chain.then(() => [...enabledRulesets]), callback),
        updateEnabledRulesets: (options, callback) => settle(enqueue(() => {
          const { disableRulesetIds, enableRulesetIds } = fields(options);
          const disable = list(disableRulesetIds), enable = list(enableRulesetIds);
          for (const id of [...disable, ...enable]) {
            if (!declared.some((r) => r.id === id)) throw new Error(\`Invalid ruleset id: \${text(id)}.\`);
          }
          for (const id of disable) if (typeof id === "string") enabledRulesets.delete(id);
          for (const id of enable) if (typeof id === "string") enabledRulesets.add(id);
        }).then(() => void 0), callback),
        getAvailableStaticRuleCount: (callback) => callbackOrPromise(callback, LIMITS.GUARANTEED_MINIMUM_STATIC_RULES),
        // RE2, as Chrome compiles regexFilter (no backreferences or lookaround).
        isRegexSupported: (options, callback) => {
          const supported = !!compileRe2(text(fields(options).regex));
          return callbackOrPromise(callback, supported ? { isSupported: true } : { isSupported: false, reason: "syntaxError" });
        },
        getMatchedRules: (filter, callback) => callbackOrPromise(callbackOf(filter) ? filter : callback, { rulesMatchedInfo: [] }),
        setExtensionActionOptions: (_options, callback) => callbackOrPromise(callback, void 0)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      if (!existing.onRuleMatchedDebug) define(existing, "onRuleMatchedDebug", event());
      for (const [key, value] of Object.entries({ ...LIMITS, SESSION_RULESET_ID: "_session", DYNAMIC_RULESET_ID: "_dynamic" })) {
        if (existing[key] === void 0) define(existing, key, value);
      }
      if (!c.declarativeNetRequest) define(c, "declarativeNetRequest", existing);
      shared.bridge.on("bridge.sync", () => {
        void chain.then(announce);
      });
      if (isWorker) void chain.then(announce);
      info.modes.declarativeNetRequest = shared.bridge.available ? "applied to Obsidian Web Viewer top-level navigations (block/allow/redirect/upgradeScheme); sub-resources and modifyHeaders are not intercepted" : "registration-only: BroadcastChannel unavailable, rules are not applied";
    });
  }

  // src/extensions/compat/kv.ts
  var DB = "__obsidian_bridge";
  var STORE = "kv";
  function createKV() {
    const idb = typeof indexedDB === "object" ? indexedDB : void 0;
    if (!idb) {
      const memory = /* @__PURE__ */ new Map();
      return {
        persistent: false,
        get: async (key) => memory.get(key),
        set: async (key, value) => {
          memory.set(key, structuredClone(value));
        }
      };
    }
    let db = null;
    const open = () => db ??= new Promise((resolve, reject) => {
      const request = idb.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        db = null;
        reject(request.error ?? new Error("IndexedDB open failed"));
      };
    });
    const run2 = (mode, fn) => open().then((database) => new Promise((resolve, reject) => {
      const request = fn(database.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    }));
    return {
      persistent: true,
      get: (key) => run2("readonly", (store) => store.get(key)),
      set: (key, value) => run2("readwrite", (store) => store.put(value, key)).then(() => void 0)
    };
  }

  // src/extensions/shared/inline-script.ts
  function runInlineScript(detail) {
    const frameAttr = "data-obsidian-bridge-relay";
    let message;
    try {
      message = JSON.parse(String(detail));
    } catch {
      return false;
    }
    if (typeof message?.code !== "string") return false;
    const findFrame = (win, token, depth) => {
      for (let i = 0; i < win.frames.length; i++) {
        try {
          const doc2 = win.frames[i].document;
          if (doc2?.documentElement?.getAttribute(frameAttr) === token) return doc2;
          const nested = depth < 4 ? findFrame(win.frames[i], token, depth + 1) : null;
          if (nested) return nested;
        } catch {
        }
      }
      return null;
    };
    const doc = typeof message.frame === "string" && findFrame(window, message.frame, 0) || document;
    const script = doc.createElement("script");
    script.textContent = message.code;
    (doc.head || doc.documentElement).appendChild(script);
    script.remove();
    return true;
  }

  // src/extensions/compat/apis/user-scripts.ts
  var PREFIX = "obsidian-us-";
  var PORT_PREFIX = "__obsidian_us__";
  var STATE_KEY = "userScripts.v1";
  var DEFAULT_WORLD = "";
  var list2 = (value) => Array.isArray(value) ? value : [];
  function globsAllow(include, exclude, url) {
    const test = (glob) => {
      let source = "^";
      for (const ch of glob) source += ch === "*" ? ".*" : ch === "?" ? "." : ch.replace(/[.+^\${}()|[\\]\\\\/]/g, (m) => "\\\\" + m);
      return new RegExp(source + "$").test(url);
    };
    if (include && include.length && !include.some(test)) return false;
    if (exclude && exclude.some(test)) return false;
    return true;
  }
  function userScriptWorld(worldId, messaging, portPrefix, inlineEvent, execEvent = null) {
    const g = globalThis;
    const marker = "__obsidianBridgeUserScriptWorld";
    if (g[marker]) return;
    const rt = g.chrome?.runtime;
    if (!rt) return;
    Object.defineProperty(g, marker, { value: true });
    const runtime = { id: rt.id, getURL: (path) => rt.getURL(path) };
    Object.defineProperty(runtime, "lastError", { enumerable: true, get: () => rt.lastError });
    if (messaging) {
      runtime.onMessage = rt.onMessage;
      runtime.onConnect = rt.onConnect;
      const tag = (message) => ({ __obsidianUserScript: 1, worldId, message });
      runtime.sendMessage = (...args) => {
        if (args.length > 1 && typeof args[0] === "string" && /^[a-p]{32}$/.test(args[0])) args.shift();
        args[0] = tag(args[0]);
        return rt.sendMessage(...args);
      };
      runtime.connect = (...args) => {
        const info = args.find((a) => !!a && typeof a === "object");
        const name = typeof info?.name === "string" ? info.name : "";
        const port = rt.connect({ name: portPrefix + JSON.stringify({ worldId, name }) });
        try {
          Object.defineProperty(port, "name", { value: name, configurable: true, enumerable: true });
        } catch {
        }
        return port;
      };
    }
    const prototypeOf = (win, name) => win[name]?.prototype;
    if (inlineEvent && typeof Node === "function" && typeof HTMLScriptElement === "function") {
      const inert = "application/x-obsidian-bridge-relayed";
      const frameAttr = "data-obsidian-bridge-relay";
      const relay = (node, parent) => {
        const el = node;
        if (!el || el.nodeType !== 1 || el.nodeName.toUpperCase() !== "SCRIPT" || el.isConnected || el.hasAttribute("src")) return null;
        const type = (el.getAttribute("type") || "").trim().toLowerCase();
        if (type && !/^(text|application)\\/(java|ecma)script$/.test(type)) return null;
        const code = el.textContent || "";
        if (!code) return null;
        const host = parent;
        const doc = host ? host.nodeType === 9 ? host : host.ownerDocument : null;
        let frame = null;
        if (doc && doc !== document && doc.documentElement) {
          frame = Math.random().toString(36).slice(2);
          doc.documentElement.setAttribute(frameAttr, frame);
        }
        try {
          const detail = JSON.stringify({ code, frame });
          const ran = !!execEvent && !document.dispatchEvent(new CustomEvent(execEvent, { detail, cancelable: true }));
          if (!ran) document.dispatchEvent(new CustomEvent(inlineEvent, { detail }));
        } finally {
          if (frame) doc?.documentElement.removeAttribute(frameAttr);
        }
        const original = el.getAttribute("type");
        el.setAttribute("type", inert);
        return () => {
          if (original === null) el.removeAttribute("type");
          else el.setAttribute("type", original);
        };
      };
      const patchedRealms = /* @__PURE__ */ new WeakSet();
      const patchRealm = (realm) => {
        const win = realm;
        try {
          if (!win || patchedRealms.has(win) || !win.Node) return;
          patchedRealms.add(win);
        } catch {
          return;
        }
        const patch = (proto, method, targets) => {
          const original = proto?.[method];
          if (!proto || typeof original !== "function") return;
          const call = original;
          proto[method] = function(...args) {
            const restore = targets(this, args).map(([node2, parent]) => relay(node2, parent)).filter((r) => !!r);
            try {
              return call.apply(this, args);
            } finally {
              for (const r of restore) r();
            }
          };
        };
        const intoSelf = (self, args) => [[args[0], self]];
        const siblings = (self, args) => args.map((a) => [a, self.parentNode || self]);
        const node = prototypeOf(win, "Node"), element = prototypeOf(win, "Element");
        patch(node, "appendChild", intoSelf);
        patch(node, "insertBefore", intoSelf);
        patch(node, "replaceChild", intoSelf);
        for (const m of ["append", "prepend"]) patch(element, m, (self, args) => args.map((a) => [a, self]));
        for (const m of ["before", "after", "replaceWith"]) patch(element, m, siblings);
        patch(element, "insertAdjacentElement", (self, args) => [[
          args[1],
          typeof args[0] === "string" && /^(beforebegin|afterend)$/i.test(args[0]) ? self.parentNode || self : self
        ]]);
        for (const name of ["HTMLIFrameElement", "HTMLFrameElement"]) {
          const proto = prototypeOf(win, name);
          for (const prop of ["contentWindow", "contentDocument"]) {
            const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
            const getter = descriptor?.get;
            if (!proto || !getter) continue;
            Object.defineProperty(proto, prop, {
              ...descriptor,
              get() {
                const value = getter.call(this);
                try {
                  patchRealm(prop === "contentWindow" ? value : value?.defaultView);
                } catch {
                }
                return value;
              }
            });
          }
        }
      };
      patchRealm(g);
    }
    const facade = { runtime };
    const install = (win) => {
      Object.defineProperty(win, "chrome", { value: facade, configurable: true, writable: true });
      if ("browser" in win) Object.defineProperty(win, "browser", { value: facade, configurable: true, writable: true });
      if (win !== g) Object.defineProperty(win, marker, { value: true });
    };
    try {
      install(g);
    } catch {
    }
    const checked = /* @__PURE__ */ new WeakSet();
    const guard = (value) => {
      const win = value;
      if (!win || win === g || checked.has(win)) return;
      checked.add(win);
      try {
        if (win.chrome && win.chrome !== facade) install(win);
      } catch {
      }
    };
    const sweep = (value, depth) => {
      guard(value);
      const win = value;
      try {
        for (let i = 0; win && i < win.length && depth < 8; i++) sweep(win[i], depth + 1);
      } catch {
      }
    };
    const sweepAll = () => {
      let top = g;
      try {
        while (top.parent && top.parent !== top) top = top.parent;
      } catch {
      }
      sweep(top, 0);
    };
    sweepAll();
    const after = (proto, method) => {
      const original = proto?.[method];
      if (!proto || typeof original !== "function") return;
      const call = original;
      proto[method] = function(...args) {
        try {
          return call.apply(this, args);
        } finally {
          sweepAll();
        }
      };
    };
    const afterSet = (proto, prop) => {
      const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
      const setter = descriptor?.set;
      if (!proto || !setter) return;
      Object.defineProperty(proto, prop, { ...descriptor, set(value) {
        try {
          setter.call(this, value);
        } finally {
          sweepAll();
        }
      } });
    };
    if (typeof Node === "function" && typeof document === "object") {
      document.addEventListener("load", (event2) => {
        const win = event2.target?.contentWindow;
        if (!win || typeof win !== "object") return;
        checked.delete(win);
        sweep(win, 0);
      }, true);
      for (const m of ["appendChild", "insertBefore", "replaceChild"]) after(prototypeOf(g, "Node"), m);
      for (const m of ["append", "prepend", "before", "after", "replaceWith", "replaceChildren", "insertAdjacentElement", "insertAdjacentHTML", "setHTMLUnsafe"]) after(prototypeOf(g, "Element"), m);
      for (const m of ["write", "writeln"]) after(prototypeOf(g, "Document"), m);
      after(prototypeOf(g, "Range"), "insertNode");
      for (const p of ["innerHTML", "outerHTML"]) afterSet(prototypeOf(g, "Element"), p);
      for (const name of ["HTMLIFrameElement", "HTMLFrameElement", "HTMLObjectElement"]) {
        const proto = prototypeOf(g, name);
        for (const prop of ["contentWindow", "contentDocument"]) {
          const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
          const getter = descriptor?.get;
          if (!proto || !getter) continue;
          Object.defineProperty(proto, prop, {
            ...descriptor,
            get() {
              const value = getter.call(this);
              const win = prop === "contentWindow" ? value : value?.defaultView;
              if (win) sweep(win, 0);
              return value;
            }
          });
        }
      }
    }
    if (typeof g.open === "function") {
      const open = g.open.bind(g);
      try {
        Object.defineProperty(g, "open", {
          configurable: true,
          writable: true,
          value: (url, target, features) => {
            const win = open(url, target, features);
            if (win) sweep(win, 0);
            return win;
          }
        });
      } catch {
      }
    }
  }
  function inlineRelay(eventName, run2) {
    const marker = "__obsidianBridgeInlineRelay";
    const g = globalThis;
    if (g[marker]) return;
    Object.defineProperty(g, marker, { value: true });
    document.addEventListener(eventName, (event2) => {
      if (run2(event2.detail)) event2.stopImmediatePropagation();
    }, true);
  }
  async function sha256(code) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function validate2(script, existing, requireNew) {
    const s = fields(script);
    const id = s.id;
    if (typeof id !== "string" || !id) throw new Error("User script must have a non-empty ID.");
    if (id.startsWith("_")) throw new Error(\`User script with ID '\${id}' must not start with '_'.\`);
    if (requireNew && id === "relay") throw new Error(\`User script ID 'relay' is reserved by Obsidian.\`);
    if (requireNew && existing.has(id)) throw new Error(\`Duplicate script ID '\${id}'.\`);
    if (!Array.isArray(s.js) || !s.js.length) throw new Error(\`User script with ID '\${id}' must specify at least one js source.\`);
    for (const source of list2(s.js)) {
      const hasCode = typeof fields(source).code === "string", hasFile = typeof fields(source).file === "string";
      if (hasCode === hasFile) throw new Error(\`User script with ID '\${id}' must specify exactly one of 'code' or 'file' per source.\`);
    }
    const hasMatches = list2(s.matches).length > 0;
    const hasGlobs = list2(s.includeGlobs).length > 0;
    if (!hasMatches && !hasGlobs) throw new Error(\`User script with ID '\${id}' must specify 'matches' or 'includeGlobs'.\`);
    if (s.world !== void 0 && s.world !== "MAIN" && s.world !== "USER_SCRIPT") throw new Error(\`Invalid world for user script '\${id}'.\`);
    return JSON.parse(JSON.stringify(script));
  }
  function installUserScripts(ctx) {
    const { c, chrome, granted, info, manifest, shared, report } = ctx;
    const scripting = nsOf(c, "scripting");
    if (!granted.has("userScripts") || c.userScripts || !shared.bridge.available) return;
    if (missingFn(scripting, "registerContentScripts")) return;
    report("userScripts", () => {
      const kv = createKV();
      const facadeAllowed = !(Array.isArray(manifest.content_scripts) && manifest.content_scripts.length);
      let chain = Promise.resolve();
      const serial = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result;
      };
      const load = async () => {
        const state = await kv.get(STATE_KEY).catch(() => void 0);
        return { scripts: Array.isArray(state?.scripts) ? state.scripts : [], worlds: Array.isArray(state?.worlds) ? state.worlds : [] };
      };
      const worldOf = (state, id) => state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === (id ?? DEFAULT_WORLD)) ?? state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === DEFAULT_WORLD);
      const plan = async (state) => {
        const files = /* @__PURE__ */ new Map();
        const generated = async (code) => {
          const hash = await sha256(code);
          files.set(hash, code);
          return \`\${USER_SCRIPT_DIR}/\${hash}.js\`;
        };
        const registrations = [];
        const inlineEvent = "__obsidian_bridge_inline_" + chrome.runtime.id;
        let execEvent = null;
        try {
          execEvent = (await shared.bridge.request("userScripts.pageExec", {}, 5e3))?.event ?? null;
        } catch {
        }
        let relayNeeded = false;
        const ordered = [...state.scripts].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
        for (const script of ordered) {
          const main = script.world === "MAIN";
          const globs = !!(script.includeGlobs?.length || script.excludeGlobs?.length);
          const js = [];
          if (!main && facadeAllowed) {
            const world = worldOf(state, script.worldId);
            const inline = typeof world?.csp === "string" && world.csp.includes("'unsafe-inline'");
            relayNeeded ||= inline;
            js.push(await generated(\`(\${userScriptWorld.toString()})(\${JSON.stringify(script.worldId ?? null)}, \${!!world?.messaging}, \${JSON.stringify(PORT_PREFIX)}, \${inline ? JSON.stringify(inlineEvent) : "null"}, \${inline ? JSON.stringify(execEvent) : "null"});
\`));
          }
          for (const source of script.js) {
            if ("file" in source && !globs) {
              js.push(source.file.replace(/^\\//, ""));
              continue;
            }
            let code = "code" in source ? source.code : "";
            if ("file" in source) {
              try {
                code = await (await fetch(chrome.runtime.getURL(source.file.replace(/^\\//, "")))).text();
              } catch (e) {
                console.warn("[Chrome Bridge] userScripts source", source.file, e);
                continue;
              }
            }
            if (globs) {
              code = \`if ((\${globsAllow.toString()})(\${JSON.stringify(script.includeGlobs ?? null)}, \${JSON.stringify(script.excludeGlobs ?? null)}, location.href)) {
\${code}
}
\`;
            }
            js.push(await generated(code));
          }
          registrations.push({
            id: PREFIX + script.id,
            js,
            matches: script.matches?.length ? script.matches : ["<all_urls>"],
            ...script.excludeMatches?.length ? { excludeMatches: script.excludeMatches } : {},
            allFrames: !!script.allFrames,
            runAt: script.runAt || "document_idle",
            world: main ? "MAIN" : "ISOLATED",
            persistAcrossSessions: true
          });
        }
        if (relayNeeded) {
          registrations.unshift({
            id: PREFIX + "relay",
            js: [await generated(\`(\${inlineRelay.toString()})(\${JSON.stringify(inlineEvent)}, \${runInlineScript.toString()});
\`)],
            matches: ["<all_urls>"],
            allFrames: true,
            runAt: "document_start",
            world: "MAIN",
            persistAcrossSessions: true
          });
        }
        return { registrations, files };
      };
      const writeFiles = async (files) => {
        const { missing } = await shared.bridge.request("userScripts.syncFiles", { keep: [...files.keys()], prune: false }, 1e4);
        const pending = (Array.isArray(missing) ? missing : []).filter((h) => files.has(h));
        let batch = [], size = 0;
        const flush = async () => {
          if (batch.length) await shared.bridge.request("userScripts.writeFiles", { files: batch }, 3e4);
          batch = [];
          size = 0;
        };
        for (const hash of pending) {
          const code = files.get(hash);
          if (size + code.length > 4e6) await flush();
          batch.push({ hash, code });
          size += code.length;
        }
        await flush();
      };
      const comparable = (r) => JSON.stringify([r.id, r.js, r.matches, r.excludeMatches ?? [], !!r.allFrames, r.runAt ?? "document_idle", r.world ?? "ISOLATED"]);
      const reconcile = async () => {
        const state = await load();
        const { registrations, files } = await plan(state);
        await writeFiles(files);
        const current = list2(await invoke(chrome, scripting, "getRegisteredContentScripts")).map(fields).flatMap((r) => typeof r.id === "string" && r.id.startsWith(PREFIX) ? [{ ...r, id: r.id }] : []);
        const wanted = new Map(registrations.map((r) => [r.id, comparable({ ...r })]));
        const order = (ids2) => ids2.filter((id) => wanted.has(id)).join("\\n");
        const reorder = order(current.map((r) => r.id)) !== order(registrations.map((r) => r.id).filter((id) => current.some((cur) => cur.id === id)));
        const stale = current.filter((r) => reorder || wanted.get(r.id) !== comparable(r)).map((r) => r.id);
        const kept = new Set(current.map((r) => r.id).filter((id) => !stale.includes(id)));
        if (stale.length) await invoke(chrome, scripting, "unregisterContentScripts", { ids: stale });
        const add = registrations.filter((r) => !kept.has(r.id));
        if (add.length) await invoke(chrome, scripting, "registerContentScripts", add);
        await shared.bridge.request("userScripts.syncFiles", { keep: [...files.keys()], prune: true }, 1e4);
      };
      let scheduled = null;
      const scheduleReconcile = () => scheduled ??= new Promise((resolve) => setTimeout(() => {
        scheduled = null;
        serial(reconcile).then(resolve, (e) => {
          console.warn("[Chrome Bridge] userScripts sync (retried when Obsidian reconnects):", e);
          resolve();
        });
      }, 30));
      const mutate = (change) => serial(async () => {
        const state = await load();
        change(state);
        await kv.set(STATE_KEY, state);
      }).then(() => scheduleReconcile());
      const ids = (filter) => {
        const value = fields(filter).ids;
        return Array.isArray(value) ? list2(value).map((id) => text(id)) : null;
      };
      const filterAndCallback = (filter, callback) => callbackOf(filter) ? [void 0, filter] : [filter, callback];
      const api = {
        register: (scripts, callback) => settle(mutate((state) => {
          const existing = new Set(state.scripts.map((s) => s.id));
          const added = list2(scripts).map((s) => {
            const v = validate2(s, existing, true);
            existing.add(v.id);
            return v;
          });
          state.scripts.push(...added);
        }), callback),
        update: (scripts, callback) => settle(mutate((state) => {
          for (const patch of list2(scripts)) {
            const id = fields(patch).id;
            const index = state.scripts.findIndex((s) => s.id === id);
            if (index < 0) throw new Error(\`Script with ID '\${text(id)}' does not exist.\`);
            state.scripts[index] = validate2({ ...state.scripts[index], ...fields(patch) }, /* @__PURE__ */ new Set(), false);
          }
        }), callback),
        unregister: (filterArg, callbackArg) => {
          const [filter, callback] = filterAndCallback(filterArg, callbackArg);
          const wanted = ids(filter);
          return settle(mutate((state) => {
            state.scripts = wanted ? state.scripts.filter((s) => !wanted.includes(s.id)) : [];
          }), callback);
        },
        getScripts: (filterArg, callbackArg) => {
          const [filter, callback] = filterAndCallback(filterArg, callbackArg);
          const wanted = ids(filter);
          return settle(serial(load).then((state) => state.scripts.filter((s) => !wanted || wanted.includes(s.id))), callback);
        },
        configureWorld: (properties = {}, callback) => settle(mutate((state) => {
          const requested = fields(properties);
          const key = typeof requested.worldId === "string" ? requested.worldId : DEFAULT_WORLD;
          const next = { ...state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === key) || {}, ...JSON.parse(JSON.stringify(requested)) };
          state.worlds = state.worlds.filter((w) => (w.worldId ?? DEFAULT_WORLD) !== key).concat(next);
        }), callback),
        getWorldConfigurations: (callback) => settle(serial(load).then((state) => state.worlds), callback),
        resetWorldConfiguration: (worldIdArg, callbackArg) => {
          const [worldId, callback] = filterAndCallback(worldIdArg, callbackArg);
          const key = typeof worldId === "string" ? worldId : DEFAULT_WORLD;
          return settle(mutate((state) => {
            state.worlds = state.worlds.filter((w) => (w.worldId ?? DEFAULT_WORLD) !== key);
          }), callback);
        },
        execute: (injectionArg, callback) => settle((async () => {
          const injection = fields(injectionArg);
          if (!injection.target || !Array.isArray(injection.js) || !injection.js.length) throw new Error("Invalid injection.");
          const script = validate2({ id: "execute", matches: ["<all_urls>"], ...injection, world: injection.world }, /* @__PURE__ */ new Set(), false);
          const { registrations, files } = await plan({ scripts: [script], worlds: (await serial(load)).worlds });
          await writeFiles(files);
          const own = registrations.find((r) => r.id === PREFIX + script.id);
          const results = await invoke(chrome, scripting, "executeScript", {
            target: injection.target,
            files: own.js,
            world: own.world,
            ...injection.injectImmediately ? { injectImmediately: true } : {}
          });
          return list2(results).map(fields).map((r) => ({
            frameId: r.frameId,
            documentId: r.documentId,
            result: r.result,
            ...r.error ? { error: text(r.error, "Error") } : {}
          }));
        })(), callback)
      };
      const namespace = {};
      for (const [key, value] of Object.entries(api)) define(namespace, key, value);
      define(c, "userScripts", namespace);
      if (isWorker) {
        shared.bridge.on("bridge.sync", () => {
          void scheduleReconcile();
        });
        void scheduleReconcile();
      }
      info.modes.userScripts = "registered as Electron content scripts in ID order; USER_SCRIPT world = the extension's isolated world with a restricted chrome object; inline <script> is relayed to the page when the world CSP allows 'unsafe-inline' (the page's own CSP still applies); eval is not available" + (facadeAllowed ? "" : "; user scripts see the full content-script API (the extension has its own content scripts)") + (kv.persistent ? "" : "; not persisted (no IndexedDB)");
    });
  }
  var routed = /* @__PURE__ */ Symbol.for("obsidian-bridge.user-script-routing");
  var isTagged = (m) => fields(m).__obsidianUserScript === 1;
  function installUserScriptMessaging({ c, report }) {
    const runtime = c.runtime;
    const onMessage = eventOf(runtime, "onMessage"), onConnect = eventOf(runtime, "onConnect");
    if (routed in runtime || !onMessage || !onConnect || missingEvent(runtime, "onMessage")) return;
    report("runtime.onUserScriptMessage", () => {
      try {
        Object.defineProperty(runtime, routed, { value: true });
      } catch {
      }
      const onUserScriptMessage = event();
      const onUserScriptConnect = event();
      define(runtime, "onUserScriptMessage", onUserScriptMessage);
      define(runtime, "onUserScriptConnect", onUserScriptConnect);
      const routedPorts = /* @__PURE__ */ new WeakSet();
      const nativeAddMessage = onMessage.addListener.bind(onMessage);
      const nativeAddConnect = onConnect.addListener.bind(onConnect);
      nativeAddMessage((message, sender, sendResponse) => {
        if (!isTagged(message)) return void 0;
        const respond = callbackOf(sendResponse) ?? (() => void 0);
        const from = { ...fields(sender), ...message.worldId ? { userScriptWorldId: message.worldId } : {} };
        let keepOpen = false;
        for (const listener of listenersOf(onUserScriptMessage)) {
          try {
            const result = listener(message.message, from, respond);
            if (result === true) keepOpen = true;
            else if (isThenable(result)) {
              keepOpen = true;
              result.then(respond, () => respond(void 0));
            }
          } catch (e) {
            console.error("[Chrome Bridge] onUserScriptMessage listener threw:", e);
          }
        }
        return keepOpen;
      });
      nativeAddConnect((portArg) => {
        const port = portArg;
        if (!port || typeof port.name !== "string" || !port.name.startsWith(PORT_PREFIX)) return;
        let meta = {};
        try {
          meta = fields(JSON.parse(port.name.slice(PORT_PREFIX.length)));
        } catch {
        }
        routedPorts.add(port);
        try {
          Object.defineProperty(port, "name", { value: text(meta.name), configurable: true, enumerable: true });
        } catch {
        }
        if (meta.worldId && port.sender) {
          try {
            port.sender.userScriptWorldId = meta.worldId;
          } catch {
          }
        }
        for (const listener of listenersOf(onUserScriptConnect)) {
          try {
            listener(port);
          } catch (e) {
            console.error("[Chrome Bridge] onUserScriptConnect listener threw:", e);
          }
        }
      });
      const hide = (target, skip) => {
        const wrapped = /* @__PURE__ */ new WeakMap();
        const add = fnOf(target, "addListener"), remove = fnOf(target, "removeListener"), has = fnOf(target, "hasListener");
        if (!add || !remove || !has) return;
        define(target, "addListener", (fn, ...rest) => {
          const listener = callbackOf(fn);
          if (!listener) return add.call(target, fn, ...rest);
          let w = wrapped.get(listener);
          if (!w) {
            w = function(...args) {
              return skip(args) ? void 0 : listener.apply(this, args);
            };
            wrapped.set(listener, w);
          }
          return add.call(target, w, ...rest);
        });
        const known = (fn) => {
          const listener = callbackOf(fn);
          return (listener && wrapped.get(listener)) ?? fn;
        };
        define(target, "removeListener", (fn) => remove.call(target, known(fn)));
        define(target, "hasListener", (fn) => has.call(target, known(fn)));
      };
      hide(onMessage, (args) => isTagged(args[0]));
      hide(onConnect, (args) => !!args[0] && typeof args[0] === "object" && routedPorts.has(args[0]));
    });
  }

  // src/extensions/compat/apis/notifications.ts
  var MAX_ICON_BYTES2 = 256 * 1024;
  async function iconData(chrome, iconUrl) {
    if (typeof iconUrl !== "string" || !iconUrl) return void 0;
    if (/^data:image\\//i.test(iconUrl)) return iconUrl;
    let url;
    try {
      url = new URL(iconUrl, globalThis.location?.href ?? chrome.runtime.getURL(""));
    } catch {
      return void 0;
    }
    if (url.protocol !== "chrome-extension:" || url.hostname !== chrome.runtime.id) return void 0;
    try {
      const response = await fetch(url.href);
      const blob = await response.blob();
      if (!response.ok || blob.size > MAX_ICON_BYTES2) return void 0;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
      const type = /^image\\/(png|jpeg|gif|webp|svg\\+xml)$/.test(blob.type) ? blob.type : "image/png";
      return \`data:\${type};base64,\${btoa(binary)}\`;
    } catch {
      return void 0;
    }
  }
  var randomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  function installNotifications(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("notifications") || c.notifications || !shared.bridge.available) return;
    report("notifications", () => {
      const events2 = shared.once("notifications.events", () => {
        const all = { onClicked: event(), onClosed: event(), onButtonClicked: event(), onPermissionLevelChanged: event(), onShowSettings: event() };
        shared.bridge.on("notifications.event", (message) => {
          if (typeof message.id !== "string") return;
          if (message.event === "onClicked") emit(all.onClicked, message.id);
          else if (message.event === "onButtonClicked" && Number.isInteger(message.buttonIndex)) emit(all.onButtonClicked, message.id, message.buttonIndex);
          else if (message.event === "onClosed") emit(all.onClosed, message.id, message.byUser === true);
        });
        return all;
      });
      const show = async (id, raw, update) => {
        if (!raw || typeof raw !== "object") throw new Error("Invalid notification options.");
        const options = fields(raw);
        if (!update && (!options.type || !options.title || options.message === void 0 || !options.iconUrl)) {
          throw new Error("Some of the required properties are missing: type, iconUrl, title and message.");
        }
        const plain = JSON.parse(JSON.stringify({ ...options, iconUrl: void 0, imageUrl: void 0, appIconMaskUrl: void 0 }));
        const iconUrl = await iconData(chrome, options.iconUrl);
        if (iconUrl) plain.iconUrl = iconUrl;
        const { shown } = await shared.bridge.request("notifications.show", { id, options: plain, update }, 5e3);
        return shown;
      };
      const api = {
        create(...args) {
          const callback = callbackOf(args[args.length - 1]) ? args.pop() : void 0;
          const [id, options] = typeof args[0] === "string" ? [args[0] || randomId(), args[1]] : [randomId(), args[0]];
          return settle(show(id, options, false).then(() => id), callback);
        },
        update(id, options, callback) {
          return settle(show(text(id), options, true), callback);
        },
        clear(id, callback) {
          return settle(shared.bridge.request("notifications.clear", { id: text(id) }, 5e3).then((r) => !!r?.cleared), callback);
        },
        getAll(callback) {
          return settle(shared.bridge.request("notifications.getAll", {}, 5e3).then((r) => Object.fromEntries((r?.ids ?? []).map((id) => [id, true]))), callback);
        },
        getPermissionLevel(callback) {
          return settle(Promise.resolve("granted"), callback);
        },
        TemplateType: { BASIC: "basic", IMAGE: "image", LIST: "list", PROGRESS: "progress" },
        PermissionLevel: { GRANTED: "granted", DENIED: "denied" },
        ...events2
      };
      define(c, "notifications", api);
      info.modes.notifications = "shown as Obsidian notices (title, message, icon, progress, items, buttons); images are not shown";
    });
  }

  // src/extensions/compat/apis/cookies.ts
  var STORE2 = { id: "0", tabIds: [] };
  function installCookies(ctx) {
    const { c, granted, info, shared, report } = ctx;
    if (!granted.has("cookies") || c.cookies || !shared.bridge.available) return;
    report("cookies", () => {
      const onChanged = shared.once("cookies.onChanged", () => {
        let announced = false;
        const announce = () => {
          const active = listenerCount(e) > 0;
          if (active === announced || !isWorker && !active) return;
          announced = active;
          shared.bridge.post({ type: "cookies.listeners", active });
        };
        const e = event({ onChange: announce });
        shared.bridge.on("cookies.changed", (message) => {
          if (message.info?.cookie) emit(e, message.info);
        });
        shared.bridge.on("bridge.sync", () => {
          if (announced) shared.bridge.post({ type: "cookies.listeners", active: true });
        });
        return e;
      });
      const call = (method, details, callback) => settle(shared.bridge.request(method, JSON.parse(JSON.stringify(details ?? {})), 1e4), callback);
      define(c, "cookies", {
        get: (details, callback) => call("cookies.get", details, callback),
        getAll: (details, callback) => call("cookies.getAll", details, callback),
        set: (details, callback) => call("cookies.set", details, callback),
        remove: (details, callback) => call("cookies.remove", details, callback),
        getAllCookieStores: (callback) => settle(Promise.resolve([{ ...STORE2, tabIds: [...STORE2.tabIds] }]), callback),
        getPartitionKey: (_details, callback) => settle(Promise.resolve({ partitionKey: {} }), callback),
        onChanged,
        OnChangedCause: { EVICTED: "evicted", EXPIRED: "expired", EXPLICIT: "explicit", EXPIRED_OVERWRITE: "expired_overwrite", OVERWRITE: "overwrite" },
        SameSiteStatus: { NO_RESTRICTION: "no_restriction", LAX: "lax", STRICT: "strict", UNSPECIFIED: "unspecified" }
      });
      info.modes.cookies = 'the Web Viewer session cookie store (one store "0"); partitioned cookies are not supported';
    });
  }

  // src/extensions/compat/compat-api.ts
  var VERSION = "0.15.0";
  (() => {
    const g = globalThis;
    const chrome = g.chrome;
    if (!isChromeRoot(chrome)) return;
    if (g.__obsidianBridgeCompatV06) return;
    const info = { version: VERSION, extensionId: chrome.runtime.id, installed: [], failed: [], modes: {} };
    Object.defineProperty(g, "__obsidianBridgeCompatV06", { value: info, configurable: false });
    if (isWorker && typeof globalThis.addEventListener === "function") {
      const describe = (e) => e instanceof Error ? \`\${e.name}: \${e.message}
\${e.stack || ""}\` : text(e, typeof e);
      globalThis.addEventListener("error", (ev) => console.error(
        "[Chrome Bridge Worker] Uncaught:",
        describe(ev.error ?? ev.message),
        \`\${ev.filename || ""}:\${ev.lineno || 0}:\${ev.colno || 0}\`
      ));
      globalThis.addEventListener("unhandledrejection", (ev) => console.error("[Chrome Bridge Worker] Unhandled rejection:", describe(ev.reason)));
      info.installed.push("worker.error-trap");
    }
    const manifest = fnOf(chrome.runtime, "getManifest") && chrome.runtime.getManifest?.() || { manifest_version: 3, version: "0" };
    const strings2 = (value) => Array.isArray(value) ? value.filter((x) => typeof x === "string") : [];
    const singletons = /* @__PURE__ */ new Map();
    const shared = {
      bridge: createBridge(),
      navigation: /* @__PURE__ */ new Set(),
      contextMenus: /* @__PURE__ */ new Set(),
      once(key, create) {
        if (!singletons.has(key)) singletons.set(key, create());
        return singletons.get(key);
      }
    };
    const installOn = (c, tag) => {
      const ctx = {
        c,
        chrome,
        tag,
        info,
        manifest,
        shared,
        granted: new Set(strings2(manifest.permissions)),
        hosts: new Set(strings2(manifest.host_permissions)),
        report(key, fn) {
          const name = tag + key;
          try {
            fn();
            info.installed.push(name);
          } catch (error) {
            info.failed.push(\`\${name}: \${String(error)}\`);
          }
        }
      };
      installI18n(ctx);
      installPermissions(ctx);
      installCommands(ctx);
      installExtension(ctx);
      installWebNavigation(ctx);
      installStorage(ctx);
      installAlarms(ctx);
      installContextMenus(ctx);
      installTabs(ctx);
      installAction(ctx);
      installOpen(ctx);
      installWindows(ctx);
      installTabExtras(ctx);
      installNotifications(ctx);
      installCookies(ctx);
      installNetRequest(ctx);
      installUserScripts(ctx);
      if (info.installed.includes("userScripts")) installUserScriptMessaging(ctx);
      installRuntimeExtras(ctx);
    };
    installOn(chrome, "");
    const alt = g.browser;
    if (isNamespace(alt) && alt !== chrome && typeof alt === "object") {
      for (const key of [
        "i18n",
        "permissions",
        "commands",
        "extension",
        "webNavigation",
        "alarms",
        "contextMenus",
        "action",
        "tabs",
        "storage",
        "scripting",
        "windows",
        "declarativeNetRequest",
        "userScripts",
        "notifications",
        "cookies"
      ]) {
        if (alt[key] == null && chrome[key] != null) {
          try {
            define(alt, key, chrome[key]);
            info.installed.push(\`browser:\${key}=chrome.\${key}\`);
          } catch (error) {
            info.failed.push(\`browser:\${key}: \${String(error)}\`);
          }
        }
      }
      if (isChromeRoot(alt)) installOn(alt, "browser:");
    }
    deliverWebNavigation({ shared });
    installPageOpen({ shared, info });
    info.bridge = shared.bridge.available ? "broadcast-channel" : "unavailable";
    console.debug("[Chrome Bridge Compat] " + JSON.stringify(info));
    if (info.failed.length) console.warn("[Chrome Bridge] \\u90E8\\u5206 API \\u517C\\u5BB9\\u5C42\\u5B89\\u88C5\\u5931\\u8D25", info);
  })();
})();
`,"bridge-host.js":`/* Generated from src/extensions by esbuild. Do not edit. */
"use strict";
(() => {
  // src/extensions/shared/protocol.ts
  var CHANNEL_NAME = "__obsidian_bridge_channel_v1";
  var CONSOLE_PREFIX = "[obsidian-bridge:v1] ";

  // src/extensions/compat/bridge-host.ts
  var channel = new BroadcastChannel(CHANNEL_NAME);
  var toHost = (message) => console.debug(CONSOLE_PREFIX + JSON.stringify(message));
  channel.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.v !== 1 || data.from !== "extension" || typeof data.type !== "string") return;
    const { v: _v, from: _from, ...message } = data;
    toHost(message);
  });
  Object.defineProperty(globalThis, "__obsidianBridgeHost", {
    configurable: false,
    value: Object.freeze({
      send(message) {
        if (!message || typeof message.type !== "string") return false;
        channel.postMessage({ v: 1, from: "host", ...message });
        return true;
      }
    })
  });
  toHost({ type: "bridge.ready" });
})();
`,"compat-probe/background.js":`'use strict';
console.info('[Bridge MV3 Probe] Background evaluated');
// Register synchronously before the first asynchronous boundary.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'BRIDGE_PING') return false;
  sendResponse({
    ok: true,
    nonce: message.nonce,
    senderOrigin: sender?.origin || null,
    background: 'mv3-service-worker',
    runtimeId: chrome.runtime.id,
    hasAlarms: typeof chrome.alarms?.create === 'function',
    hasTabs: typeof chrome.tabs?.query === 'function',
    hasStorageLocal: !!chrome.storage?.local,
    now: Date.now()
  });
  return false;
});
`,"compat-probe/content.js":`document.documentElement.dataset.bridgeMv3Probe = 'content-script-active';
console.info('[Bridge MV3 Probe] Content script injected on example.com');
`,"compat-probe/manifest.json":`{
  "manifest_version": 3,
  "name": "Bridge MV3 Probe",
  "version": "1.0.0",
  "description": "Isolated diagnostic extension to test Electron MV3 background and messaging",
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html", "default_title": "MV3 Probe" },
  "permissions": ["storage", "alarms"],
  "content_scripts": [{ "matches": ["https://example.com/*"], "js": ["content.js"] }]
}
`,"compat-probe/popup.html":`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{font:13px/1.6 system-ui,Arial,sans-serif;background:#18202a;color:#eef2ff;margin:0;padding:14px;}h3{margin:0 0 8px;}pre{white-space:pre-wrap;word-break:break-word;background:#101721;padding:10px;border-radius:6px}button{padding:8px;border:0;border-radius:6px;cursor:pointer} .ok{color:#86efac}.err{color:#fca5a5}</style>
</head><body><h3>MV3 兼容性检测</h3><p>检测真正的 Service Worker 与原生扩展 API，不使用模拟 Worker。</p><button id="retry">重新检测</button><pre id="output">等待检测…</pre><script src="popup.js"><\/script></body></html>
`,"compat-probe/popup.js":`'use strict';
const chrome = globalThis.chrome || {};
const el = document.getElementById('output');
async function withTimeout(p, ms = 4500) {
  let timer;
  return Promise.race([p, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(\`等待 \${ms}ms 后超时\`)), ms);
  })]).finally(() => clearTimeout(timer));
}
async function run() {
  const results = { time: new Date().toISOString(), url: location.href, api: {} };
  results.api.chromeRuntime = !!globalThis.chrome?.runtime;
  results.api.runtimeId = globalThis.chrome?.runtime?.id || null;
  results.api.runtimeSendMessage = typeof chrome?.runtime?.sendMessage === 'function';
  results.api.alarms = typeof chrome?.alarms?.create === 'function';
  results.api.tabsQuery = typeof chrome?.tabs?.query === 'function';
  results.api.storageLocal = !!chrome?.storage?.local;
  results.api.storageSync = !!chrome?.storage?.sync;
  el.textContent = JSON.stringify(results, null, 2) + '\\n正在执行消息往返…';
  try {
    const nonce = crypto.randomUUID();
    const response = await withTimeout(chrome.runtime.sendMessage({ type: 'BRIDGE_PING', nonce }));
    results.background = response;
    results.messageRoundTrip = response?.ok === true && response?.nonce === nonce ? 'PASS' : 'FAIL: 错误的响应';
  } catch (e) { results.messageRoundTrip = \`FAIL: \${e?.message || e}\`; }
  try {
    const key = 'bridge_probe_' + Math.random().toString(36).slice(2);
    await withTimeout(chrome.storage.local.set({ [key]: 42 }));
    const value = await withTimeout(chrome.storage.local.get(key));
    await withTimeout(chrome.storage.local.remove(key));
    results.storageRoundTrip = value?.[key] === 42 ? 'PASS' : 'FAIL';
  } catch (e) { results.storageRoundTrip = \`FAIL: \${e?.message || e}\`; }
  try {
    const tabs = await withTimeout(chrome.tabs.query({ active: true }));
    results.tabsQuery = { isArray: Array.isArray(tabs), count: tabs?.length || 0, first: tabs?.[0]?.url || null };
  } catch (e) { results.tabsQuery = \`FAIL: \${e?.message || e}\`; }
  el.textContent = JSON.stringify(results, null, 2);
  el.className = results.messageRoundTrip === 'PASS' ? 'ok' : 'err';
  console.log('[Bridge MV3 Probe] Results', results);
}
document.getElementById('retry').addEventListener('click', run);
run();
`};function we(r,n=""){return typeof r=="string"?r:typeof r=="number"||typeof r=="boolean"||typeof r=="bigint"?String(r):typeof URL=="function"&&r instanceof URL?r.href:n}const pc=/^__MSG_([\w@]+)__$/i,gc=/^[a-z]{2,3}(?:_[A-Za-z0-9]{2,8}){0,2}$/i,fc=2*1024*1024;function Dt(r){if(typeof r!="string")return null;const n=r.trim().replace(/-/g,"_");return gc.test(n)?n:null}function mc(r,n){const e=[],t=i=>{const o=Dt(i);o&&!e.includes(o)&&e.push(o)},s=Dt(r);return s&&(t(s),t(s.split("_")[0])),t(n),t("en"),e}function xs(r,n){const e=Dt(n);if(!e)return{};const t=H.join(r,"_locales",e,"messages.json");try{const s=j.realpathSync(r),i=j.realpathSync(t);if(!i.startsWith(s+H.sep))return{};if(j.statSync(i).size>fc)return{};const o=JSON.parse(j.readFileSync(i,"utf8"));if(!o||typeof o!="object"||Array.isArray(o))return{};const a={};for(const[c,l]of Object.entries(o)){const d=l&&typeof l=="object"?l:{};if(typeof d.message!="string")continue;const p={};if(d.placeholders&&typeof d.placeholders=="object")for(const[u,g]of Object.entries(d.placeholders)){const m=(g&&typeof g=="object"?g:{}).content;typeof m=="string"&&(p[u]={content:m})}a[c.toLowerCase()]={message:d.message,placeholders:p}}return a}catch{return{}}}function mn(r,n,e){const t=Dt(n.default_locale)||"en",s=mc(e,t),i=xs(r,t);let o=t,a=i;for(const c of s){const l=xs(r,c);if(Object.keys(l).length){o=c,a=l;break}}return{locale:o,defaultLocale:t,messages:{...i,...a}}}function bc(r,n,e=[]){var a;const t=we(n).toLowerCase();if(t==="@@ui_locale")return r.locale||r.defaultLocale||"en";if(t==="@@bidi_dir")return/^(ar|he|fa|ur)(_|$)/i.test(r.locale)?"rtl":"ltr";const s=(a=r.messages)==null?void 0:a[t];if(!s)return"";const i=Array.isArray(e)?e:[e],o={};for(const[c,l]of Object.entries(s.placeholders||{}))typeof(l==null?void 0:l.content)=="string"&&(o[c.toLowerCase()]=l.content.replace(/\$(\d)/g,(d,p)=>we(i[Number(p)-1])));return s.message.replace(/\$\$|\$([\w@]+)\$/g,(c,l)=>c==="$$"?"$":/^\d+$/.test(l)?we(i[Number(l)-1]):o[l.toLowerCase()]??c)}function je(r,n,e,t){if(typeof e!="string")return e;const s=pc.exec(e);return s&&bc(mn(r,n,t),s[1])||e}function vc(r){return"globalThis.__obsidianBridgeLocaleData = "+JSON.stringify(r).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+`;
`}const wc=Er.promisify(Cr.inflateRaw),vt=80*1024*1024,yc=250*1024*1024,kc=75*1024*1024,Ec=4500,zi=()=>new Promise(r=>setImmediate(r));let xc;async function Sc(r){const n=xc??(xc=Array.from({length:256},(t,s)=>{let i=s;for(let o=0;o<8;o++)i=i&1?3988292384^i>>>1:i>>>1;return i>>>0}));let e=4294967295;for(let t=0;t<r.length;t++)e=n[(e^r[t])&255]^e>>>8,(t&4194303)===4194303&&await zi();return(e^4294967295)>>>0}function Z(r,n,e){if(!r)throw new Error(x(n,e))}function Xt(r,n){let e=0,t=0;for(let s=0;s<10;s++){Z(n<r.length,"crx.protobufIncomplete");const i=r[n++];if(t<53&&(e+=(i&127)*Math.pow(2,t)),!(i&128))return[e,n];t+=7}throw new Error(x("crx.varintTooLong"))}function Kt(r){const n=[];let e=0;for(;e<r.length;){let t;[t,e]=Xt(r,e);const s=Math.floor(t/8),i=t%8;if(i===2){let o;[o,e]=Xt(r,e),Z(Number.isSafeInteger(o)&&o>=0&&e+o<=r.length,"crx.protobufLength"),n.push({field:s,value:r.subarray(e,e+o)}),e+=o}else if(i===0)[,e]=Xt(r,e);else if(i===1||i===5)e+=i===1?8:4,Z(e<=r.length,"crx.protobufTruncated");else throw new Error(x("crx.protobufWireType"))}return n}function Gi(r){return Array.from(r,n=>String.fromCharCode(97+(n>>4),97+(n&15))).join("")}function ht(r){return Gi(Ce.createHash("sha256").update(r).digest().subarray(0,16))}const Cc="61f7f2a6bfcf74cd0bc1fe2497cc9b04254c658f79f2145392867ea8366367cf",Tc=Buffer.concat([Buffer.from("CRX3 SignedData","ascii"),Buffer.from([0])]),Zt=4*1024*1024;async function Qt(r,n,e,t,s){let i;try{i=Ce.createPublicKey({key:e,format:"der",type:"spki"})}catch{return!1}if(i.asymmetricKeyType!==n)return!1;const o=Ce.createVerify(r);for(const a of s)for(let c=0;c<a.length;c+=Zt)o.update(a.subarray(c,c+Zt)),a.length>Zt&&await zi();try{return o.verify(i,t)}catch{return!1}}async function Ic(r,n){var b;const e=n.expectedId;if(r.subarray(0,4).toString("ascii")!=="Cr24")return Z(!e&&!n.requirePublisherProof,"crx.storeNotCrx"),{zip:r,key:null};Z(r.length>=16,"crx.headerIncomplete");const t=r.readUInt32LE(4);if(t===2){Z(!n.requirePublisherProof,"crx.storeNeedsCrx3");const f=r.readUInt32LE(8),v=r.readUInt32LE(12),S=16+f+v;Z(S<=r.length&&f<=1024*1024&&v<=1024*1024,"crx.crx2Length");const k=r.subarray(16,16+f);e&&Z(ht(k)===e,"crx.crx2KeyMismatch");const C=r.subarray(S);return Z(await Qt("sha1","rsa",k,r.subarray(16+f,S),[C]),"crx.crx2Signature"),{zip:C,key:k}}Z(t===3,"crx.version");const s=r.readUInt32LE(8);Z(s>0&&s<4*1024*1024&&12+s<r.length,"crx.crx3HeaderSize");const i=r.subarray(12,12+s),o=r.subarray(12+s),a=Kt(i),c=a.filter(f=>f.field===2||f.field===3).map(f=>{var S,k;const v=Kt(f.value);return{keyType:f.field===2?"rsa":"ec",key:((S=v.find(C=>C.field===1))==null?void 0:S.value)??null,signature:((k=v.find(C=>C.field===2))==null?void 0:k.value)??null}}).filter(f=>!!f.key&&!!f.signature),l=a.find(f=>f.field===1e4);Z(l,"crx.crx3NoSignedData");const d=(b=Kt(l.value).find(f=>f.field===1))==null?void 0:b.value;Z(d&&d.length===16,"crx.crx3SignedIdFormat");const p=Gi(d);e&&Z(p===e,"crx.crx3SignedIdMismatch");const u=Buffer.alloc(4);u.writeUInt32LE(l.value.length,0);const g=[Tc,u,l.value,o],m=c.filter(f=>ht(f.key)===p);Z(m.length,"crx.crx3NoMatchingKey");let h=null;for(const f of m)if(await Qt("sha256",f.keyType,f.key,f.signature,g)){h=f.key;break}if(Z(h,"crx.crx3DeveloperSignature"),n.requirePublisherProof){const f=n.publisherKeyHash??Cc,v=c.filter(k=>Ce.createHash("sha256").update(k.key).digest("hex")===f);let S=!1;for(const k of v)if(await Qt("sha256",k.keyType,k.key,k.signature,g)){S=!0;break}Z(S,"crx.crx3StoreSignature")}return{zip:o,key:h}}function Ac(r){Z(r&&!r.includes("\0"),"zip.invalidPath");const n=r.replace(/\\/g,"/");Z(!n.startsWith("/")&&!/^[a-zA-Z]:/.test(n),"zip.absolutePath");const e=n.split("/").filter(t=>t&&t!==".");return Z(e.every(t=>t!==".."),"zip.pathTraversal"),Z(e.every(t=>!/[\x00-\x1f:*?"<>|]/.test(t)&&!/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(t)&&!/[. ]$/.test(t)),"zip.invalidName"),e}async function Lc(r,n){Z(r.length>=22&&r.length<=vt,"zip.sizeOrIncomplete");let e=-1;for(let d=r.length-22;d>=Math.max(0,r.length-65557);d--)if(r.readUInt32LE(d)===101010256){e=d;break}Z(e>=0,"zip.noCentralDirectory");const t=r.readUInt16LE(e+10),s=r.readUInt32LE(e+12),i=r.readUInt32LE(e+16);Z(t<=Ec&&s!==4294967295&&i!==4294967295,"zip.tooManyFiles"),Z(i+s<=e,"zip.centralOutOfBounds");let o=i,a=0,c=0;await j.promises.mkdir(n,{recursive:!0});for(let d=0;d<t;d++){Z(o+46<=r.length&&r.readUInt32LE(o)===33639248,"zip.centralCorrupt");const p=r.readUInt16LE(o+8),u=r.readUInt16LE(o+10),g=r.readUInt32LE(o+16),m=r.readUInt32LE(o+20),h=r.readUInt32LE(o+24),b=r.readUInt16LE(o+28),f=r.readUInt16LE(o+30),v=r.readUInt16LE(o+32),S=r.readUInt32LE(o+38),k=r.readUInt32LE(o+42);Z(o+46+b+f+v<=r.length,"zip.nameOutOfBounds");const C=r.subarray(o+46,o+46+b).toString("utf8");o+=46+b+f+v,Z(!(p&1),"zip.encrypted");const O=S>>>16&61440;Z(O!==40960&&O!==24576,"zip.symlink"),Z(m<=vt&&h<=kc&&a+h<=yc,"zip.tooLarge"),a+=h;const I=Ac(C);if(I.length===0)continue;const N=H.join(n,...I);if(Z(N.startsWith(n+H.sep),"zip.outOfBounds"),C.endsWith("/")){await j.promises.mkdir(N,{recursive:!0});continue}Z(k+30<=r.length&&r.readUInt32LE(k)===67324752,"zip.localHeaderCorrupt");const M=k+30+r.readUInt16LE(k+26)+r.readUInt16LE(k+28);Z(M+m<=r.length,"zip.dataOutOfBounds");let R;const B=r.subarray(M,M+m);if(u===0)R=B;else if(u===8)R=await wc(B,{maxOutputLength:h+1});else throw new Error(x("zip.unsupportedMethod",{method:u}));Z(R.length===h&&await Sc(R)===g,"zip.checksum",{name:C}),await j.promises.mkdir(H.dirname(N),{recursive:!0}),await j.promises.writeFile(N,R,{flag:"wx"}),c++}let l=n;if(!j.existsSync(H.join(l,"manifest.json"))){const d=j.readdirSync(l,{withFileTypes:!0}).filter(p=>p.isDirectory());d.length===1&&j.existsSync(H.join(l,d[0].name,"manifest.json"))&&(l=H.join(l,d[0].name))}return Z(j.existsSync(H.join(l,"manifest.json")),"archive.noManifest"),{root:l,written:c}}async function Ss({archive:r,directory:n,expectedId:e=null,requirePublisherProof:t=!1,publisherKeyHash:s}){const i=await j.promises.stat(r);Z(i.isFile()&&i.size<=vt,"archive.tooLarge"),await j.promises.mkdir(n,{recursive:!0});const{zip:o,key:a}=await Ic(await j.promises.readFile(r),{expectedId:e,requirePublisherProof:t,publisherKeyHash:s}),c=await Lc(o,n),l=H.join(c.root,"manifest.json"),d=JSON.parse(await j.promises.readFile(l,"utf8"));return Z(d&&[2,3].includes(d.manifest_version)&&typeof d.version=="string","archive.invalidManifest"),a&&(d.key?Z(ht(Buffer.from(d.key,"base64"))===ht(a),"archive.keyMismatch"):(d.key=a.toString("base64"),await j.promises.writeFile(l,JSON.stringify(d,null,2)))),{root:c.root,count:c.written,manifest:d,derivedId:a?ht(a):null}}const Cs="https://chromewebstore.google.com/",bn=/^[a-p]{32}$/;function Ji(r){try{const n=new URL(String(r));if(n.hostname!=="chromewebstore.google.com"||!n.pathname.startsWith("/detail/"))return null;const e=n.pathname.split("/").filter(t=>bn.test(t));return e.length?e[e.length-1]:null}catch{return null}}function Oc(r){const n=r.hostname.toLowerCase();return n==="google.com"||n.endsWith(".google.com")||n==="googleusercontent.com"||n.endsWith(".googleusercontent.com")||n==="gvt1.com"||n.endsWith(".gvt1.com")||n==="gstatic.com"||n.endsWith(".gstatic.com")}function Mc(r,n){const e=new URL("https://clients2.google.com/service/update2/crx");return e.searchParams.set("response","redirect"),e.searchParams.set("prodversion",n),e.searchParams.set("acceptformat","crx3"),e.searchParams.set("x","id="+r+"&uc"),e.href}function Yi(r,n=0){return new Promise((e,t)=>{const s=new URL(r);if(s.protocol!=="https:"||!Oc(s)||n>7)return t(new Error(x("store.unsafeRedirect")));const i=Tr.get(s,{headers:{"User-Agent":"Mozilla/5.0 Chrome/142.0.0.0"},timeout:25e3},o=>{const a=o.statusCode||0;if([301,302,303,307,308].includes(a)&&o.headers.location){const p=new URL(o.headers.location,s).href;o.resume(),Yi(p,n+1).then(e,t);return}if(a!==200){o.resume(),t(new Error(x("store.http",{status:String(a)})));return}const c=Number(o.headers["content-length"]);if(Number.isFinite(c)&&c>vt){o.destroy(new Error(x("store.tooLarge")));return}let l=0;const d=[];o.on("data",p=>{if(l+=p.length,l>vt){o.destroy(new Error(x("store.tooLarge")));return}d.push(p)}),o.on("error",t),o.on("end",()=>{const p=Buffer.concat(d);p.subarray(0,4).toString("ascii")!=="Cr24"?t(new Error(x("store.notCrx"))):e(p)})});i.on("timeout",()=>i.destroy(new Error(x("store.timeout")))),i.on("error",t)})}const We="__obsidian_bridge_host.html",Ze="__obsidian_bridge_host.js",Ts="[obsidian-bridge:v1] ",Xi="__obsidian_bridge_us",Nc=["onBeforeNavigate","onCommitted","onDOMContentLoaded","onCompleted","onErrorOccurred","onCreatedNavigationTarget","onReferenceFragmentUpdated","onHistoryStateUpdated","onTabReplaced"],Pc=["onActivated","onCreated","onRemoved","onUpdated"],Ve="__obsidian_bridge_compat.js",ze="__obsidian_bridge_compat_state.json",Is="__obsidian_bridge_worker.js",_c="__obsidian_bridge_original_",Be="__obsidian_bridge_locale_data.js",vn=8,Rc=300,Bc=4*1024*1024,As=typeof __dirname=="string"?__dirname:"",Dc=r=>({compat:r.compatSource||H.join(As,"compat-api.js"),host:r.hostSource||H.join(As,"bridge-host.js")}),Ls=r=>vc({...r,bridgeBootId:Ce.randomUUID()}),Uc=`<!doctype html>
<html><head><meta charset="utf-8"><title>Chrome Bridge</title>
<script src="/${Ze}"><\/script>
</head><body></body></html>
`;function ve(r,n){if(typeof n!="string"||!n||H.isAbsolute(n)||n.includes("\\")||n.split("/").some(s=>!s||s==="."||s==="..")||/^[a-z]+:/i.test(n))throw new Error(x("error.invalidFilePath",{path:String(n)}));const e=H.resolve(r,n);if(!e.startsWith(H.resolve(r)+H.sep))throw new Error(x("error.pathOutside"));let t=r;for(const s of n.split("/"))if(t=H.join(t,s),j.existsSync(t)&&j.lstatSync(t).isSymbolicLink())throw new Error(x("error.pathSymlink"));return e}const pt=r=>H.join(r,"manifest.json"),wn=r=>JSON.parse(j.readFileSync(pt(r),"utf8")),Wn=r=>JSON.parse(j.readFileSync(r,"utf8")),Se=(r,n)=>j.writeFileSync(r,n,"utf8");function Ki(r){const n=`<script src="/${Be}" data-obsidian-chrome-bridge="0.8"><\/script>
<script src="/${Ve}" data-obsidian-chrome-bridge="0.8"><\/script>`,e=/<head\b[^>]*>/i.exec(r);if(e)return r.slice(0,e.index+e[0].length)+`
`+n+r.slice(e.index+e[0].length);const t=/^\s*<!doctype[^>]*>/i.exec(r),s=t?t[0].length:0;return r.slice(0,s)+`
`+n+`
`+r.slice(s)}function Wc(r,n){var o;const e=(o=n.sandbox)==null?void 0:o.pages,t=new Set((Array.isArray(e)?e:[]).map(a=>we(a).replace(/^\//,""))),s=[],i=(a,c)=>{if(!(c>6||s.length>=Rc))for(const l of j.readdirSync(H.join(r,a),{withFileTypes:!0})){const d=a?`${a}/${l.name}`:l.name;if(!(l.isSymbolicLink()||l.name.startsWith("__obsidian_bridge_")||l.name.startsWith("."))){if(l.isDirectory()){l.name!=="_locales"&&l.name!=="_metadata"&&i(d,c+1);continue}!/\.html?$/i.test(l.name)||t.has(d)||j.statSync(H.join(r,d)).size>Bc||s.push(d)}}};return i("",0),s}function Os(r,n){Se(H.join(r,We),Ki(Uc)),j.copyFileSync(n,H.join(r,Ze))}function Fc(r,n={}){var c,l,d,p,u,g;const{enabled:e=!0,locale:t="en"}=n,s=Dc(n);if(!e)return Ms(r),{applied:!1,reason:"disabled"};let i=wn(r);if(j.existsSync(H.join(r,ze))){const m=Wn(H.join(r,ze));if(m.version===vn){j.copyFileSync(s.compat,H.join(r,Ve)),Os(r,s.host);const h=mn(r,i,t);return Se(H.join(r,Be),Ls(h)),{applied:!0,...m,locale:h.locale}}Ms(r),i=wn(r)}const o={version:vn,serviceWorker:null,html:[],warnings:[],locale:null},a=j.readFileSync(pt(r),"utf8");try{const m=mn(r,i,t);o.locale=m.locale;for(const v of[Be,We,Ze])if(j.existsSync(H.join(r,v)))throw new Error(x("error.reservedFile",{name:v}));Se(H.join(r,Be),Ls(m));const h=(i==null?void 0:i.manifest_version)===3&&((c=i.background)==null?void 0:c.service_worker);if(h){const v=h.replace(/^\//,""),S=ve(r,v);if(!j.statSync(S).isFile())throw new Error(x("error.workerEntryNotFile"));const k=H.posix.dirname(v),C=k==="."?Is:`${k}/${Is}`;if(j.existsSync(ve(r,C)))throw new Error(x("error.reservedWorkerFile"));const O=F=>{const z=H.posix.relative(k,F);return z.startsWith(".")?z:`./${z}`},I=O(Ve),N=O(Be),M="./"+H.posix.basename(v),R=((l=i.background)==null?void 0:l.type)==="module",B=R?["// Chrome Bridge: MV3 ESM worker bootstrap (local extension files only)",`import ${JSON.stringify(N)};`,`import ${JSON.stringify(I)};`,`import ${JSON.stringify(M)};`]:["// Chrome Bridge: MV3 classic worker bootstrap",`importScripts(${JSON.stringify(N)});`,`importScripts(${JSON.stringify(I)});`,`importScripts(${JSON.stringify(M)});`];Se(ve(r,C),B.join(`
`)+`
`),o.serviceWorker={original:h,wrapper:C,type:R?"module":"classic"},i.background&&(i.background.service_worker=C)}const b=[(d=i.action)==null?void 0:d.default_popup,(p=i.browser_action)==null?void 0:p.default_popup,(u=i.page_action)==null?void 0:u.default_popup,(g=i.options_ui)==null?void 0:g.page,i.options_page],f=[...new Set([...b.filter(v=>typeof v=="string"&&!!v).map(v=>v.split(/[?#]/)[0].replace(/^\//,"")),...Wc(r,i)])];for(const v of f){const S=ve(r,v);if(!j.existsSync(S)){o.warnings.push(x("warning.pageNotFound",{page:v}));continue}if(!/\.html?$/i.test(v)){o.warnings.push(x("warning.skipNonHtml",{page:v}));continue}const k=j.readFileSync(S,"utf8");if(k.includes("data-obsidian-chrome-bridge"))continue;const C=Ce.createHash("sha256").update(v).digest("hex").slice(0,12),O=_c+C+".html";if(j.existsSync(ve(r,O)))throw new Error(x("error.reservedHtmlBackup"));Se(ve(r,O),k),Se(S,Ki(k)),o.html.push({page:v,backup:O})}return j.copyFileSync(s.compat,H.join(r,Ve)),Os(r,s.host),o.hostPage=We,Se(pt(r),JSON.stringify(i,null,2)),Se(H.join(r,ze),JSON.stringify(o,null,2)),{applied:!0,...o}}catch(m){for(const{page:h,backup:b}of o.html)try{const f=ve(r,b);j.existsSync(f)&&j.copyFileSync(f,ve(r,h)),j.rmSync(f,{force:!0})}catch{}if(o.serviceWorker)try{j.rmSync(ve(r,o.serviceWorker.wrapper),{force:!0})}catch{}for(const h of[Ve,Be,We,Ze,ze])try{j.rmSync(H.join(r,h),{force:!0})}catch{}try{Se(pt(r),a)}catch{}throw m}}function Ms(r){var s;const n=H.join(r,ze);if(!j.existsSync(n))return!1;const e=Wn(n),t=wn(r);e.serviceWorker&&(((s=t.background)==null?void 0:s.service_worker)===e.serviceWorker.wrapper&&(t.background.service_worker=e.serviceWorker.original),j.rmSync(ve(r,e.serviceWorker.wrapper),{force:!0}));for(const{page:i,backup:o}of e.html||[]){const a=ve(r,i),c=ve(r,o);j.existsSync(c)&&j.copyFileSync(c,a),j.rmSync(c,{force:!0})}for(const i of[Ve,Be,We,Ze])j.rmSync(H.join(r,i),{force:!0});return j.rmSync(H.join(r,Xi),{recursive:!0,force:!0}),Se(pt(r),JSON.stringify(t,null,2)),j.rmSync(n,{force:!0}),!0}function $c(r){const n=H.join(r,ze);if(!j.existsSync(n))return{applied:!1};const{version:e,locale:t,serviceWorker:s,html:i,warnings:o}=Wn(n);return{applied:!0,version:e,locale:t,serviceWorker:s,pages:(i==null?void 0:i.map(a=>a.page))||[],warnings:o||[],hostPage:j.existsSync(H.join(r,We))}}const en="[Chrome Bridge Compat] ";class jc{constructor(n,e=()=>[]){y(this,"events",[]);y(this,"subscriptions",[]);this.session=n,this.allowedIds=e;const t=n.serviceWorkers;this.subscribe(t,"registration-completed",(s,i)=>{this.isAllowed(i==null?void 0:i.scope)&&this.record("registered",{scope:i.scope})}),this.subscribe(t,"running-status-changed",(s,i)=>{var c;const o=i??s;let a=null;try{a=((c=t.getInfoFromVersionID(o.versionId))==null?void 0:c.scope)||null}catch{}a&&this.isAllowed(a)&&this.record("status",{scope:a,versionId:o.versionId,state:o.runningStatus})}),this.subscribe(t,"console-message",(s,i)=>{if(!this.isAllowed(i==null?void 0:i.sourceUrl))return;const o=we(i.message);this.record("console",{url:i.sourceUrl,message:o.slice(0,o.startsWith(en)?8e3:1500),level:i.level,line:i.lineNumber,versionId:i.versionId})})}isAllowed(n){const e=we(n).match(/^chrome-extension:\/\/([a-p]{32})(?:\/|$)/);return!!e&&this.allowedIds().includes(e[1])}record(n,e){this.events.push({time:new Date().toISOString(),kind:n,...e}),this.events.length>120&&this.events.splice(0,this.events.length-120)}subscribe(n,e,t){const s=n;typeof(s==null?void 0:s.on)=="function"&&(s.on(e,t),this.subscriptions.push(()=>{var i;try{(i=s.removeListener)==null||i.call(s,e,t)}catch{}}))}snapshot(n=null){return{workers:Object.values(this.session.serviceWorkers.getAllRunning()).filter(s=>this.isAllowed(s.scope)&&(!n||s.scope.startsWith(`chrome-extension://${n}/`))),events:this.events.filter(s=>!n||(s.url||s.scope||"").startsWith(`chrome-extension://${n}/`)).slice(-40)}}latestCompatReport(n){var e;for(let t=this.events.length-1;t>=0;t--){const s=this.events[t];if(s.kind==="console"&&(s.url??"").startsWith(`chrome-extension://${n}/`)&&((e=s.message)!=null&&e.startsWith(en)))try{return JSON.parse(s.message.slice(en.length))}catch{return null}}return null}async start(n){if(!/^[a-p]{32}$/.test(n))throw new Error(x("error.invalidExtensionId"));if(!this.allowedIds().includes(n))throw new Error(x("error.notManaged"));if(!this.session.extensions.getExtension(n))throw new Error(x("error.notLoadedInSession"));const e=`chrome-extension://${n}/`;if(typeof this.session.serviceWorkers.startWorkerForScope!="function")throw new Error(x("error.noStartWorker"));const t=await this.session.serviceWorkers.startWorkerForScope(e);return this.record("start-requested",{scope:e}),{scope:e,started:!!t,...this.snapshot(n)}}close(){for(const n of this.subscriptions.splice(0))n()}}function qc(r,n){let e=0,t=0,s=-1,i=0;for(;t<n.length;)if(e<r.length&&r[e]!=="*"&&r[e]===n[t])e++,t++;else if(e<r.length&&r[e]==="*")s=e++,i=t;else if(s>=0)e=s+1,t=++i;else return!1;for(;e<r.length&&r[e]==="*";)e++;return e===r.length}function Zi(r,n){let e;try{e=new URL(n)}catch{return!1}if(r==="<all_urls>")return/^(https?|wss?|ftp|file|data|urn):$/.test(e.protocol);const t=/^(\*|https?|wss?|file|ftp|urn|chrome-extension):\/\/(\*|\*\.[^/*]+|[^/*]*)(\/.*)$/.exec(r);if(!t)return!1;const[,s,i,o]=t,a=e.protocol.slice(0,-1);if(s==="*"?!["http","https","ws","wss"].includes(a):s!==a)return!1;if(i!=="*"){if(i.startsWith("*.")){const c=i.slice(2).toLowerCase();if(e.hostname!==c&&!e.hostname.endsWith("."+c))return!1}else if(e.hostname!==i.toLowerCase())return!1}return qc(o,e.pathname+e.search)}function Ns(r,n){return!Array.isArray(r)||!r.length?!0:n?r.some(e=>typeof e=="string"&&Zi(e,n)):!1}const Ps=1e3,Hc=2e4;class ce extends Error{}const yn=r=>!!r&&/[A-Za-z0-9_]/.test(r),kn=r=>r>="0"&&r<="9",En=r=>yn(r),xn=r=>r===" "||r==="	"||r===`
`||r==="\r"||r==="\f"||r==="\v",it=r=>n=>!r(n),tn={alpha:r=>/[A-Za-z]/.test(r),digit:kn,alnum:r=>/[A-Za-z0-9]/.test(r),upper:r=>/[A-Z]/.test(r),lower:r=>/[a-z]/.test(r),space:xn,xdigit:r=>/[0-9A-Fa-f]/.test(r),word:En,punct:r=>/[!-/:-@[-`{-~]/.test(r),blank:r=>r===" "||r==="	",cntrl:r=>r.charCodeAt(0)<32||r.charCodeAt(0)===127,print:r=>r.charCodeAt(0)>=32&&r.charCodeAt(0)<127,graph:r=>r.charCodeAt(0)>32&&r.charCodeAt(0)<127,ascii:r=>r.charCodeAt(0)<128},_s={n:`
`,t:"	",r:"\r",f:"\f",v:"\v",a:"\x07"};function Rs(r,n){return n?e=>r(e)||r(e.toLowerCase())||r(e.toUpperCase()):r}class Vc{constructor(n,e){y(this,"pos",0);y(this,"groups",0);this.src=n,this.ci=e}parse(){const n=this.alternation();if(this.pos<this.src.length)throw new ce("unexpected )");return n}peek(){return this.src[this.pos]}alternation(){const n=[this.concatenation()];for(;this.peek()==="|";)this.pos++,n.push(this.concatenation());return n.length===1?n[0]:{t:"alt",nodes:n}}concatenation(){const n=[];for(;this.pos<this.src.length&&this.peek()!=="|"&&this.peek()!==")";){const e=this.atom();e&&n.push(this.quantified(e))}return n.length===1?n[0]:{t:"cat",nodes:n}}quantified(n){let e=n;for(;;){const t=this.peek();let s,i;if(t==="*")s=0,i=1/0,this.pos++;else if(t==="+")s=1,i=1/0,this.pos++;else if(t==="?")s=0,i=1,this.pos++;else if(t==="{"){const a=/^\{(\d+)(,(\d*))?\}/.exec(this.src.slice(this.pos));if(!a)return e;if(s=Number(a[1]),i=a[2]===void 0?s:a[3]===""?1/0:Number(a[3]),s>Ps||i!==1/0&&(i>Ps||i<s))throw new ce("bad repetition");this.pos+=a[0].length}else return e;if(e.t==="assert")throw new ce("nothing to repeat");let o=!0;if(this.peek()==="?"&&(o=!1,this.pos++),e.t==="repeat")throw new ce("bad repetition operator");e={t:"repeat",node:e,min:s,max:i,greedy:o}}}atom(){const n=this.src[this.pos++];switch(n){case"(":return this.group();case"[":return{t:"char",test:Rs(this.charClass(),this.ci)};case".":return{t:"char",test:e=>e!==`
`};case"^":return{t:"assert",kind:"start"};case"$":return{t:"assert",kind:"end"};case"\\":return this.escape();case"*":case"+":case"?":throw new ce("missing argument to repetition operator");default:return this.literal(n)}}literal(n){const e=n.toLowerCase();return this.ci?{t:"char",test:t=>t.toLowerCase()===e,lit:e}:{t:"char",test:t=>t===n,lit:e}}group(){let n=null;if(this.src.startsWith("?:",this.pos))this.pos+=2;else if(this.src.startsWith("?P<",this.pos)||this.src.startsWith("?<",this.pos)&&!/^\?<[=!]/.test(this.src.slice(this.pos))){const t=this.src.indexOf(">",this.pos);if(t<0)throw new ce("bad named group");this.pos=t+1,n=++this.groups}else if(this.peek()==="?"){const t=/^\?(i)(\)|:)/.exec(this.src.slice(this.pos));if(!t)throw new ce("unsupported group (lookaround or flags)");if(this.pos+=t[0].length,t[2]===")")return this.ci=!0,null;const s=this.ci;this.ci=!0;const i=this.alternation();if(this.ci=s,this.src[this.pos++]!==")")throw new ce("missing )");return{t:"group",index:null,node:i}}else n=++this.groups;const e=this.alternation();if(this.src[this.pos++]!==")")throw new ce("missing )");return{t:"group",index:n,node:e}}escape(){const n=this.src[this.pos++];if(n===void 0)throw new ce("trailing backslash");return n==="b"?{t:"assert",kind:"word"}:n==="B"?{t:"assert",kind:"notword"}:n==="A"?{t:"assert",kind:"start"}:n==="z"?{t:"assert",kind:"end"}:"dDwWsS".includes(n)?{t:"char",test:Rs(this.classEscape(n),this.ci)}:this.literal(this.escapedChar(n))}classEscape(n){switch(n){case"d":return kn;case"D":return it(kn);case"w":return En;case"W":return it(En);case"s":return xn;case"S":return it(xn)}const e=this.escapedChar(n);return t=>t===e}escapedChar(n){if(_s[n])return _s[n];if(n==="x"){const e=/^(?:\{([0-9A-Fa-f]{1,6})\}|([0-9A-Fa-f]{2}))/.exec(this.src.slice(this.pos));if(!e)throw new ce("bad \\x escape");return this.pos+=e[0].length,String.fromCodePoint(parseInt(e[1]??e[2],16))}if(n==="0")return"\0";if(/[0-9A-Za-z]/.test(n))throw new ce("invalid escape \\"+n);return n}charClass(){let n=!1;this.peek()==="^"&&(n=!0,this.pos++);const e=[];let t=!0;for(;;){const i=this.src[this.pos++];if(i===void 0)throw new ce("missing ]");if(i==="]"&&!t)break;if(t=!1,i==="["&&this.peek()===":"){const a=/^:(\^?)([a-z]+):\]/.exec(this.src.slice(this.pos));if(a&&tn[a[2]]){this.pos+=a[0].length,e.push(a[1]?it(tn[a[2]]):tn[a[2]]);continue}}let o;if(i==="\\"){const a=this.src[this.pos++];if(a===void 0)throw new ce("trailing backslash");if("dDwWsS".includes(a)){e.push(this.classEscape(a));continue}o=this.escapedChar(a)}else o=i;if(this.peek()==="-"&&this.src[this.pos+1]!==void 0&&this.src[this.pos+1]!=="]"){this.pos++;let a=this.src[this.pos++];if(a==="\\"&&(a=this.escapedChar(this.src[this.pos++])),a<o)throw new ce("bad character class range");e.push(c=>c>=o&&c<=a)}else e.push(a=>a===o)}const s=i=>e.some(o=>o(i));return n?it(s):s}}function zc(r){const n=[],e=o=>{if(n.length>=Hc)throw new ce("pattern too large");return n.push(o),n.length-1},t=()=>{const o={op:"split",x:0,y:0};return[e(o),o]},s=(o=0)=>{const a={op:"jmp",x:o};return e(a),a},i=o=>{switch(o.t){case"char":e({op:"char",test:o.test});return;case"assert":e({op:"assert",kind:o.kind});return;case"group":if(o.index===null){i(o.node);return}e({op:"save",slot:o.index*2}),i(o.node),e({op:"save",slot:o.index*2+1});return;case"cat":for(const a of o.nodes)i(a);return;case"alt":{const a=[];for(let c=0;c<o.nodes.length;c++)if(c<o.nodes.length-1){const[,l]=t();l.x=n.length,i(o.nodes[c]),a.push(s()),l.y=n.length}else i(o.nodes[c]);for(const c of a)c.x=n.length;return}case"repeat":for(let a=0;a<o.min;a++)i(o.node);if(o.max===1/0){const[a,c]=t();i(o.node),s(a);const l=n.length;c.x=o.greedy?a+1:l,c.y=o.greedy?l:a+1}else{const a=[];for(let l=o.min;l<o.max;l++)a.push(t()),i(o.node);const c=n.length;for(const[l,d]of a)d.x=o.greedy?l+1:c,d.y=o.greedy?c:l+1}return}};return e({op:"save",slot:0}),i(r),e({op:"save",slot:1}),e({op:"match"}),n}function Qi(r){let n="",e="";const t=()=>{e.length>n.length&&(n=e),e=""},s=i=>{if(i.t==="char"&&i.lit!==void 0)e+=i.lit;else if(i.t==="cat")i.nodes.forEach(s);else if(i.t==="group")s(i.node);else if(i.t!=="assert"){if(t(),i.t==="repeat"&&i.min>0){const o=Qi(i.node);o.length>n.length&&(n=o)}}};return s(r),t(),n}let Bs="",Ds="";const Gc=r=>r===Bs?Ds:Ds=(Bs=r).toLowerCase();function Jc(r){for(const n of r)if(n.op!=="save")return n.op==="assert"&&n.kind==="start";return!1}function Us(r,n,e,t){const s=r.length;let i=[],o=[];const a=new Int32Array(s).fill(-1);let c=0,l=null;const d=(u,g,m,h)=>{const b=[[g,m]];for(;b.length;){const[f,v]=b.pop();if(a[f]===c)continue;a[f]=c;const S=r[f];switch(S.op){case"jmp":b.push([S.x,v]);break;case"split":b.push([S.y,v],[S.x,v]);break;case"save":{const k=v.slice();k[S.slot]=h,b.push([f+1,k]);break}case"assert":{const k=t[h-1],C=t[h];(S.kind==="start"?h===0:S.kind==="end"?h===t.length:yn(k)!==yn(C)==(S.kind==="word"))&&b.push([f+1,v]);break}default:u.push({pc:f,caps:v})}}},p=new Array(n).fill(-1);c++,d(i,0,p,0);for(let u=0;!(!i.length&&(l||e));u++){c++;const g=t[u];for(const m of i){const h=r[m.pc];if(h.op==="match"){l=m.caps;break}h.op==="char"&&g!==void 0&&h.test(g)&&d(o,m.pc+1,m.caps,u+1)}if(u>=t.length)break;!l&&!e&&d(o,0,p,u+1),[i,o]=[o,i],o.length=0}return l}const rt=new Map;function er(r,n=!1){const e=(n?"i:":"s:")+r;if(rt.has(e))return rt.get(e);let t=null;try{const s=new Vc(r,n),i=s.parse(),o=zc(i),a=Qi(i),c=p=>!a||Gc(p).includes(a),l=(s.groups+1)*2,d=Jc(o);t={source:r,test:p=>c(p)&&Us(o,l,d,p)!==null,exec(p){const u=c(p)?Us(o,l,d,p):null;if(!u)return null;const g=[];for(let m=0;m<l;m+=2)g.push(u[m]>=0&&u[m+1]>=0?p.slice(u[m],u[m+1]):void 0);return g}}}catch{t=null}return rt.size>4e3&&rt.clear(),rt.set(e,t),t}const Ws=/^(<all_urls>|(\*|[a-z][a-z0-9+.-]*):\/\/.*)$/i;function Yc(r){const n=i=>Array.isArray(i)?i.filter(o=>typeof o=="string"):[],e=n(r==null?void 0:r.permissions),t=new Set(e.filter(i=>!Ws.test(i))),s=[...new Set([...e.filter(i=>Ws.test(i)),...n(r==null?void 0:r.host_permissions)])];return{webNavigation:t.has("webNavigation"),contextMenus:t.has("contextMenus"),tabs:t.has("tabs"),netRequest:t.has("declarativeNetRequest"),netRequestWithHostAccess:t.has("declarativeNetRequestWithHostAccess"),activeTab:t.has("activeTab"),cookies:t.has("cookies"),notifications:t.has("notifications"),hosts:s}}function Xc(r,n){return JSON.stringify(r)===JSON.stringify(n)}function Qe(r,n){return!!n&&r.hosts.some(e=>Zi(e,n))}function Fs(r,n){return r.tabs||Qe(r,n)}function Kc(r,n,e){var i;if(!r.netRequest&&!r.netRequestWithHostAccess)return!1;const t=(i=n.action)==null?void 0:i.type;return!(t==="redirect"||t==="modifyHeaders"||!r.netRequest)||Qe(r,e)}function Zc(r,n){let e;try{e=new URL(r)}catch{return!1}return e.protocol==="http:"||e.protocol==="https:"?!0:e.protocol==="chrome-extension:"&&e.hostname===n}const tr=2048;function Qc(r){return r.length<=tr&&er(r)!==null}function el(r,n){const e=[];for(const t of r){if(e.length>=n)break;const s=t;if(!s||!Number.isInteger(s.id)||!s.action||typeof s.action.type!="string"||!s.condition||typeof s.condition!="object")continue;const i=s.condition.regexFilter;if(i!==void 0&&(typeof i!="string"||!Qc(i)))continue;const o=s.condition.urlFilter;o!==void 0&&(typeof o!="string"||o.length>tr)||e.push(s)}return e}const tl=1e3,nl=16,sl=512*1024,il=/^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\)|[a-z]{3,20})$/i,rl=/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/,ol=/^[^\\:?#]*(\?[^#]*)?(#.*)?$/;function $s(r){const n={};if(!r||typeof r!="object")return n;const e=r;typeof e.title=="string"&&(n.title=e.title.slice(0,tl)),typeof e.badgeText=="string"&&(n.badgeText=e.badgeText.slice(0,nl));for(const t of["badgeBackgroundColor","badgeTextColor"]){const s=e[t];typeof s=="string"&&il.test(s)&&(n[t]=s)}return typeof e.icon=="string"&&e.icon.length<=sl&&rl.test(e.icon)&&(n.icon=e.icon),typeof e.popup=="string"&&e.popup.length<=2048&&ol.test(e.popup)&&!e.popup.split("/").includes("..")&&(n.popup=e.popup.replace(/^\/+/,"")),typeof e.enabled=="boolean"&&(n.enabled=e.enabled),n}class al{constructor(){y(this,"globalProps",{});y(this,"tabs",new Map)}update(n,e){if(n===null){this.globalProps={...this.globalProps,...e};return}Number.isSafeInteger(n)&&(!this.tabs.has(n)&&this.tabs.size>=500&&this.tabs.delete(this.tabs.keys().next().value),this.tabs.set(n,{...this.tabs.get(n),...e}))}reset(n){this.globalProps={...n}}forgetTab(n){this.tabs.delete(n)}resolve(n){const e=n===null?void 0:this.tabs.get(n);return e?{...this.globalProps,...e}:{...this.globalProps}}}const cl=8e3,ll=500,dl=5e3,ul=300;class hl{constructor(n,e,t,s,i){y(this,"webview",null);y(this,"ready",null);y(this,"resolveReady",null);y(this,"queue",Promise.resolve());y(this,"disposed",!1);y(this,"navigationListeners",null);y(this,"tabListeners",null);y(this,"menuItems",[]);y(this,"netRules",[]);y(this,"action",new al);y(this,"cookieListeners",!1);this.id=n,this.name=e,this.capabilities=t,this.host=s,this.container=i}connect(){if(this.ready)return this.ready;const n=document.createElement("webview");n.className="chrome-bridge-channel",n.setAttribute("partition",this.host.partition()),n.setAttribute("src",`chrome-extension://${this.id}/${We}`),n.setAttribute("aria-hidden","true"),n.tabIndex=-1;const e=`chrome-extension://${this.id}/${Ze}`;n.addEventListener("console-message",s=>{const i=s.message||"";if(!i.startsWith(Ts)||s.sourceId&&!s.sourceId.startsWith(e))return;let o;try{o=JSON.parse(i.slice(Ts.length))}catch{return}this.receive(o)}),n.addEventListener("did-fail-load",s=>{var i;s.errorCode!==-3&&((i=this.resolveReady)==null||i.call(this,!1))});const t=()=>{this.webview===n&&(this.webview=null,this.ready=null,n.remove())};return n.addEventListener("render-process-gone",t),n.addEventListener("destroyed",t),this.webview=n,this.ready=new Promise(s=>{const i=window.setTimeout(()=>s(!1),cl);this.resolveReady=o=>{window.clearTimeout(i),s(o)}}),this.container.appendChild(n),this.ready}async start(){await this.connect()&&await this.send({type:"bridge.sync"})}receive(n){var t;if(!n||typeof n!="object")return;const e=n;switch(e.type){case"bridge.ready":(t=this.resolveReady)==null||t.call(this,!0);break;case"webNavigation.listeners":if(!Array.isArray(e.events))return;this.navigationListeners=new Set(e.events.filter(s=>Nc.includes(s)));break;case"request":{const{requestId:s,method:i,params:o}=e;if(typeof s!="string"||s.length>100||typeof i!="string")return;this.host.handleRequest(this,i,o).then(a=>this.send({type:"response",requestId:s,result:a},!1),a=>this.send({type:"response",requestId:s,error:a instanceof Error?a.message:String(a)},!1));break}case"tabs.listeners":if(!Array.isArray(e.events))return;this.tabListeners=new Set(e.events.filter(s=>Pc.includes(s)));break;case"netRequest.rules":if(!Array.isArray(e.rules)||!(this.capabilities.netRequest||this.capabilities.netRequestWithHostAccess))return;this.netRules=el(e.rules,dl);break;case"action.update":{const s=e.tabId===null?null:Number.isSafeInteger(e.tabId)?e.tabId:void 0;if(s===void 0)return;this.action.update(s,$s(e.props)),this.host.actionChanged(this.id);break}case"action.reset":this.action.reset($s(e.props)),this.host.actionChanged(this.id);break;case"cookies.listeners":this.cookieListeners=e.active===!0&&this.capabilities.cookies,this.host.cookieListenersChanged();break;case"contextMenus.items":if(!Array.isArray(e.items)||!this.capabilities.contextMenus)return;this.menuItems=e.items.slice(0,ll).filter(pl),this.host.menusChanged();break}}send(n,e=!0){const t=async()=>{if(this.disposed||!await this.connect()||!this.webview)return!1;if(e)try{await this.host.wakeWorker(this.id)}catch{this.host.debug()}try{return!!await this.webview.executeJavaScript(`globalThis.__obsidianBridgeHost ? globalThis.__obsidianBridgeHost.send(${JSON.stringify(n)}) : false`)}catch{return this.host.debug(),!1}},s=this.queue.then(t,t);return this.queue=s.catch(()=>{}),s}dispose(){var n,e;this.disposed=!0,(n=this.resolveReady)==null||n.call(this,!1),(e=this.webview)==null||e.remove(),this.webview=null,this.ready=null}}function pl(r){if(!r||typeof r!="object")return!1;const n=r,e=s=>typeof s=="string"||typeof s=="number"&&Number.isFinite(s),t=s=>s===void 0||Array.isArray(s)&&s.every(i=>typeof i=="string");return e(n.id)&&(n.parentId===void 0||e(n.parentId))&&(n.title===void 0||typeof n.title=="string"&&n.title.length<=ul)&&(n.type===void 0||["normal","checkbox","radio","separator"].includes(n.type))&&t(n.contexts)&&t(n.documentUrlPatterns)&&t(n.targetUrlPatterns)}class gl{constructor(n){y(this,"channels",new Map);y(this,"container",null);this.host=n}root(){var n;return(n=this.container)!=null&&n.isConnected||(this.container=document.body.createDiv({cls:"chrome-bridge-channels",attr:{"aria-hidden":"true"}})),this.container}sync(n){const e=new Set(n.map(s=>s.id));for(const[s,i]of this.channels)e.has(s)||(i.dispose(),this.channels.delete(s));let t=!1;for(const s of n){const i=this.channels.get(s.id);if(i&&Xc(i.capabilities,s.capabilities))continue;i==null||i.dispose();const o=new hl(s.id,s.name,s.capabilities,this.host,this.root());this.channels.set(s.id,o),t=!0,o.start()}t&&this.host.menusChanged()}get(n){return this.channels.get(n)}all(){return[...this.channels.values()]}dispose(){var n;for(const e of this.channels.values())e.dispose();this.channels.clear(),(n=this.container)==null||n.remove(),this.container=null}}const fl=20,ml=8e3,bl=/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;class vl{constructor(n){y(this,"shown",new Map);this.deliver=n}show(n,e,t,s,i){const o=this.shown.get(n)??new Map;this.shown.set(n,o);const a=o.get(t);if(i&&!a)return!1;const c={...i?a.options:{},...wl(s)};if(!a&&o.size>=fl){const[m]=o.keys();this.close(n,m,"clear")}a&&this.close(n,t,"replace");const l={notice:null,options:c,closedBy:null},d=createFragment(m=>{var f;const h=m.createDiv({cls:"chrome-bridge-notification"});c.iconUrl&&h.createEl("img",{cls:"chrome-bridge-notification-icon",attr:{src:c.iconUrl,alt:""}});const b=h.createDiv({cls:"chrome-bridge-notification-body"});b.createDiv({cls:"chrome-bridge-notification-title",text:c.title||e}),c.message&&b.createDiv({cls:"chrome-bridge-notification-message",text:c.message});for(const v of c.items??[])b.createDiv({cls:"chrome-bridge-notification-item",text:`${v.title} ${v.message}`});if(typeof c.progress=="number"){const v=b.createEl("progress",{attr:{max:"100"}});v.value=c.progress}if(b.createDiv({cls:"chrome-bridge-notification-context",text:c.contextMessage||e}),(f=c.buttons)!=null&&f.length){const v=b.createDiv({cls:"chrome-bridge-notification-buttons"});c.buttons.forEach((S,k)=>{v.createEl("button",{text:S.title}).addEventListener("click",O=>{O.stopPropagation(),this.deliver(n,{event:"onButtonClicked",id:t,buttonIndex:k}),this.close(n,t,"user")})})}h.addEventListener("click",()=>{l.closedBy||(l.closedBy="user",this.deliver(n,{event:"onClicked",id:t}))})}),p=new A.Notice(d,c.requireInteraction?0:ml);l.notice=p;const u=p.hide.bind(p);let g=!1;return p.hide=()=>{if(g)return;g=!0,o.get(t)===l&&o.delete(t),u();const m=l.closedBy;m!=="replace"&&m!=="clear"&&this.deliver(n,{event:"onClosed",id:t,byUser:m==="user"})},o.set(t,l),!0}close(n,e,t){var i;const s=(i=this.shown.get(n))==null?void 0:i.get(e);return s?(s.closedBy=t,s.notice.hide(),!0):!1}clear(n,e){var s;return((s=this.shown.get(n))==null?void 0:s.get(e))?(this.close(n,e,"clear"),this.deliver(n,{event:"onClosed",id:e,byUser:!1}),!0):!1}ids(n){var e;return[...((e=this.shown.get(n))==null?void 0:e.keys())??[]]}forget(n){for(const e of this.ids(n))this.close(n,e,"clear");this.shown.delete(n)}dispose(){for(const n of[...this.shown.keys()])this.forget(n)}}function wl(r){const n=r&&typeof r=="object"?r:{},e=(i,o=500)=>typeof i=="string"?i.slice(0,o):void 0,t={};for(const i of["type","title","message","contextMessage"]){const o=e(n[i],i==="message"?2e3:300);o!==void 0&&(t[i]=o)}typeof n.iconUrl=="string"&&n.iconUrl.length<=512*1024&&bl.test(n.iconUrl)&&(t.iconUrl=n.iconUrl);const s=(i,o,a)=>e(i&&typeof i=="object"?i[o]:void 0,a)??"";return Array.isArray(n.buttons)&&(t.buttons=n.buttons.slice(0,2).map(i=>({title:s(i,"title",100)}))),Array.isArray(n.items)&&(t.items=n.items.slice(0,10).map(i=>({title:s(i,"title",100),message:s(i,"message",300)}))),typeof n.requireInteraction=="boolean"&&(t.requireInteraction=n.requireInteraction),typeof n.progress=="number"&&Number.isFinite(n.progress)&&(t.progress=Math.max(0,Math.min(100,n.progress))),t}const Fn="0",yl=["no_restriction","lax","strict","unspecified"],kl=r=>typeof r=="string"&&yl.includes(r);function jt(r){const n={name:r.name??"",value:r.value??"",domain:r.domain??"",hostOnly:!!r.hostOnly,path:r.path??"/",secure:!!r.secure,httpOnly:!!r.httpOnly,sameSite:r.sameSite??"unspecified",session:!!r.session,storeId:Fn};return!n.session&&typeof r.expirationDate=="number"&&(n.expirationDate=r.expirationDate),n}function $n(r,n){const e=n.domain.replace(/^\./,""),t=n.path||"/";return Qe(r,`https://${e}${t}`)||!n.secure&&Qe(r,`http://${e}${t}`)}function qt(r,n){if(!r.cookies)throw new Error(x("error.noPermission",{permission:"cookies"}));if(typeof n!="string"||n.length>8192)throw new Error("Invalid url.");let e;try{e=new URL(n)}catch{throw new Error("Invalid url: "+n)}if(e.protocol!=="http:"&&e.protocol!=="https:")throw new Error("Invalid url: "+n);if(!Qe(r,e.href))throw new Error(`No host permissions for cookies at url: "${e.href}".`);return e.href}const Ht=r=>r===void 0||r===Fn,Vt=(r,n=4096)=>typeof r=="string"&&r.length<=n?r:void 0;async function El(r,n,e){const t=qt(n,e.url),s=Vt(e.name);if(s===void 0||!Ht(e.storeId))return null;const i=await r.get({url:t,name:s});return i.sort((o,a)=>(a.path??"").length-(o.path??"").length),i.length?jt(i[0]):null}async function xl(r,n,e){if(!n.cookies)throw new Error(x("error.noPermission",{permission:"cookies"}));if(!Ht(e.storeId))return[];const t={};e.url!==void 0&&(t.url=qt(n,e.url));for(const i of["name","domain","path"]){const o=Vt(e[i]);o!==void 0&&(t[i]=o)}for(const i of["secure","session"])typeof e[i]=="boolean"&&(t[i]=e[i]);return(await r.get(t)).map(jt).filter(i=>$n(n,i))}async function Sl(r,n,e){const t=qt(n,e.url);if(!Ht(e.storeId))throw new Error("Invalid cookie store id.");const s={url:t};for(const a of["name","value","domain","path"]){const c=Vt(e[a]);c!==void 0&&(s[a]=c)}for(const a of["secure","httpOnly"])typeof e[a]=="boolean"&&(s[a]=e[a]);if(typeof e.expirationDate=="number"&&Number.isFinite(e.expirationDate)&&(s.expirationDate=e.expirationDate),kl(e.sameSite)&&(s.sameSite=e.sameSite),typeof s.domain=="string"&&!$n(n,{domain:s.domain,path:we(s.path,"/"),secure:!!s.secure}))throw new Error(`No host permissions for cookies at domain: "${s.domain}".`);await r.set(s);const i=we(s.name),o=await r.get({url:t,name:i});return o.length?jt(o[0]):null}async function Cl(r,n,e){const t=qt(n,e.url),s=Vt(e.name);return s===void 0||!Ht(e.storeId)?null:(await r.remove(t,s),{url:t,name:s,storeId:Fn})}function Ge(r,n,e,t=!1){const s=e;return r.addEventListener(n,s,t),()=>r.removeEventListener(n,s,t)}function Tl(r){return{resolve(n,e){try{const t=r==null?void 0:r.webFrameMain.fromId(n,e);if(!t)return null;const s=t.parent;if(!s)return{frameId:0,parentFrameId:-1};const i=!s.parent;return{frameId:t.frameTreeNodeId,parentFrameId:i?0:s.frameTreeNodeId}}catch{return null}}}}function Il(r){const n=r.mainFrame,e=n.frameTreeNodeId;return n.framesInSubtree.map(t=>{const s=t.frameTreeNodeId,i=t.parent;return{frameId:s===e?0:s,parentFrameId:i?i.frameTreeNodeId===e?0:i.frameTreeNodeId:-1,processId:t.processId,url:t.url,errorOccurred:!1,frameType:s===e?"outermost_frame":"sub_frame",documentLifecycle:"active"}})}const Al=(r,n)=>r.replace(/#.*$/,"")===n.replace(/#.*$/,"");class Ll{constructor(n,e,t,s){y(this,"committed",new Map);y(this,"frames",new Map);y(this,"mainProcessId",-1);y(this,"lastMainUrl","");y(this,"detach",[]);this.webview=n,this.resolver=e,this.sink=t,this.wanted=s;const i=(o,a)=>{this.detach.push(Ge(n,o,c=>{if(this.wanted())try{a(c)}catch{}}))};i("did-start-navigation",o=>{if(o.isInPlace)return;const a=this.frame(o);a&&this.emit("onBeforeNavigate",a,{url:o.url,processId:-1})}),i("did-frame-navigate",o=>{const a=this.frame(o);if(!a)return;const c=Number(o.frameProcessId)||-1;let l=a.frameId===0?"link":"auto_subframe";a.frameId===0&&(o.url===this.lastMainUrl&&(l="reload"),this.lastMainUrl=o.url,this.mainProcessId=c,this.committed.clear(),this.frames.clear()),this.committed.set(this.key(o),{url:o.url,processId:c,...a}),this.emit("onCommitted",a,{url:o.url,processId:c,transitionType:l,transitionQualifiers:[]})}),i("did-navigate-in-page",o=>{const a=this.frame(o);if(!a)return;const c=this.key(o),l=this.committed.get(c),d=l&&Al(l.url,o.url)?"onReferenceFragmentUpdated":"onHistoryStateUpdated",p=(l==null?void 0:l.processId)??(Number(o.frameProcessId)||-1);this.committed.set(c,{url:o.url,processId:p,...a}),a.frameId===0&&(this.lastMainUrl=o.url),this.emit(d,a,{url:o.url,processId:p,transitionType:"link",transitionQualifiers:[]})}),i("dom-ready",()=>{this.emit("onDOMContentLoaded",{frameId:0,parentFrameId:-1},{url:this.url(),processId:this.mainProcessId})}),i("did-frame-finish-load",o=>{const a=o.isMainFrame?{frameId:0,parentFrameId:-1}:this.frame(o);if(!a)return;const c=this.committed.get(this.key(o)),l=a.frameId===0?this.url():c==null?void 0:c.url;l&&this.emit("onCompleted",a,{url:l,processId:a.frameId===0?this.mainProcessId:(c==null?void 0:c.processId)??-1})}),i("did-fail-load",o=>{const a=o.isMainFrame?{frameId:0,parentFrameId:-1}:this.frame(o);if(!a)return;const c=o.errorDescription||"ERR_FAILED";this.emit("onErrorOccurred",a,{url:o.validatedURL||"",processId:Number(o.frameProcessId)||-1,error:c.startsWith("net::")?c:"net::"+c})})}key(n){return n.isMainFrame?"main":`${n.frameProcessId}:${n.frameRoutingId}`}frame(n){if(n.isMainFrame)return{frameId:0,parentFrameId:-1};const e=Number(n.frameProcessId),t=Number(n.frameRoutingId);if(!Number.isInteger(e)||!Number.isInteger(t))return null;const s=`${e}:${t}`;return this.frames.has(s)||this.frames.set(s,this.resolver.resolve(e,t)),this.frames.get(s)??null}url(){try{return this.webview.getURL()}catch{return this.lastMainUrl}}emit(n,e,t){let s;try{s=this.webview.getWebContentsId()}catch{return}Number.isSafeInteger(s)&&this.sink(n,{tabId:s,timeStamp:Date.now(),...e,...t,frameType:e.frameId===0?"outermost_frame":"sub_frame",documentLifecycle:"active"})}dispose(){for(const n of this.detach.splice(0))n()}}class Ol{constructor(n,e,t,s){y(this,"detach",[]);y(this,"status","complete");y(this,"title","");y(this,"tabId",null);this.webview=n,this.sink=e,this.wanted=t,this.isActive=s,this.captureId();const i=(o,a)=>{this.detach.push(Ge(n,o,c=>{if(this.captureId(),!(this.tabId===null||!this.wanted()))try{a(c)}catch{}}))};i("did-navigate",o=>{this.status="loading",this.update({status:"loading",url:o.url})}),i("did-navigate-in-page",o=>{o.isMainFrame&&this.update({url:o.url})}),i("page-title-updated",o=>{const a=o.title??"";a!==this.title&&(this.title=a,this.update({title:a}))}),i("page-favicon-updated",o=>{const a=Array.isArray(o.favicons)?o.favicons[0]:void 0;typeof a=="string"&&this.update({favIconUrl:a})}),i("did-stop-loading",()=>{this.status!=="complete"&&(this.status="complete",this.update({status:"complete"}))})}captureId(){if(this.tabId===null)try{const n=this.webview.getWebContentsId();Number.isSafeInteger(n)&&n>0&&(this.tabId=n)}catch{}}fields(){if(this.captureId(),this.tabId===null)return null;let n;try{n=this.webview.getURL()||void 0}catch{}return{id:this.tabId,url:n,title:this.title||void 0,status:this.status,active:this.isActive()}}update(n){const e=this.fields();e&&this.sink("onUpdated",e,{changeInfo:n})}dispose(){for(const n of this.detach.splice(0))n()}}const js=["action","browser_action","page_action"],qs=32;function Ml(r){const n=new Set(["all"]);r.selectionText&&n.add("selection"),r.linkURL&&n.add("link"),r.isEditable&&n.add("editable"),(r.mediaType==="image"||r.mediaType==="video"||r.mediaType==="audio")&&n.add(r.mediaType);const e=!!r.frameURL&&r.frameURL!==r.pageURL;return e&&n.add("frame"),(n.size===1||e&&n.size===2)&&n.add("page"),n}function Nl(r,n,e,t){var c,l;if(r.visible===!1)return!1;const s=(c=r.contexts)!=null&&c.length?r.contexts:["page"];if(!(t?s.some(d=>js.includes(d)):s.some(d=>d!=="launcher"&&!js.includes(d)&&n.has(d))))return!1;const o=n.has("frame")?e.frameURL:e.pageURL;if(!Ns(r.documentUrlPatterns,o))return!1;const a=e.linkURL||e.srcURL;return!((l=r.targetUrlPatterns)!=null&&l.length&&(n.has("link")||n.has("image")||n.has("video")||n.has("audio"))&&!Ns(r.targetUrlPatterns,a))}function nr(r,n){var t;let e=((t=n.selectionText)==null?void 0:t.replace(/\s+/g," ").trim())||"";return e.length>qs&&(e=e.slice(0,qs)+"…"),String(r.title??"").replace(/%s/g,e)}function Sn(r,n,e=!1){const t=Ml(n),s=new Map;for(const a of r)s.set(a.id,{item:a,children:[]});const i=[];for(const a of s.values()){const c=a.item.parentId!==void 0?s.get(a.item.parentId):void 0;(c?c.children:i).push(a)}const o=a=>{var l,d;const c=[];for(const p of a)p.item.visible!==!1&&(p.children=o(p.children),(p.children.length||(p.item.type==="separator"||Nl(p.item,t,n,e)))&&c.push(p));for(;((l=c[0])==null?void 0:l.item.type)==="separator";)c.shift();for(;((d=c[c.length-1])==null?void 0:d.item.type)==="separator";)c.pop();return c.filter((p,u)=>{var g;return!(p.item.type==="separator"&&((g=c[u-1])==null?void 0:g.item.type)==="separator")})};return o(i)}function sr(r,n){const e=n.mediaType==="image"||n.mediaType==="video"||n.mediaType==="audio"?n.mediaType:void 0,t=!!n.frameURL&&n.frameURL!==n.pageURL,s={menuItemId:r.id,editable:!!n.isEditable};return r.parentId!==void 0&&(s.parentMenuItemId=r.parentId),e&&(s.mediaType=e),n.linkURL&&(s.linkUrl=n.linkURL),n.srcURL&&e&&(s.srcUrl=n.srcURL),n.pageURL&&(s.pageUrl=n.pageURL),t?s.frameUrl=n.frameURL:s.frameId=0,n.selectionText&&(s.selectionText=n.selectionText),(r.type==="checkbox"||r.type==="radio")&&(s.wasChecked=!!r.checked,s.checked=r.type==="radio"?!0:!r.checked),s}const Hs=r=>r.replace(/&/g,"&&");function Pl(r,n){const e=[];for(const t of r){const s=Sn(t.items,n);if(!s.length)continue;const i=o=>{const{item:a}=o;if(a.type==="separator")return{type:"separator"};const c={label:Hs(nr(a,n)),enabled:a.enabled!==!1};return o.children.length?c.submenu=o.children.map(i):((a.type==="checkbox"||a.type==="radio")&&(c.type=a.type,c.checked=!!a.checked),c.click=()=>t.click(sr(a,n))),c};e.push(s.length===1&&s[0].item.type!=="separator"?i(s[0]):{label:Hs(t.extensionName),submenu:s.map(i)})}return e}const _l="#5f6368",Vs=new WeakMap;function Cn(r,n,e=!0){const t=JSON.stringify(n);if(Vs.get(r)===t)return;if(Vs.set(r,t),Bn(r,n.icon,n.name),n.badgeText){const i=r.createSpan({cls:"chrome-bridge-badge",text:n.badgeText});i.style.backgroundColor=n.badgeBackgroundColor||_l,i.style.color=n.badgeTextColor||"#fff"}if(r.toggleClass("is-action-disabled",!n.enabled),!e)return;const s=n.title&&n.title!==n.name?`${n.name}
${n.title}`:n.name;r.setAttribute("aria-label",s),A.setTooltip(r,s)}const zs=["dom-ready","did-navigate","did-navigate-in-page"];class Rl extends A.Component{constructor(e,t){super();y(this,"states",new Map);y(this,"scheduled",null);y(this,"observer",null);y(this,"lastActive",null);y(this,"ready",!1);y(this,"disposed",!1);this.plugin=e,this.target=t}onload(){const{workspace:e}=this.plugin.app,t=this.target.webviewSelector;this.registerEvent(e.on("layout-change",()=>this.schedule())),this.registerEvent(e.on("active-leaf-change",s=>{var i,o,a;if(((o=(i=s==null?void 0:s.view)==null?void 0:i.getViewType)==null?void 0:o.call(i))===this.target.viewType){this.lastActive=s.view;const c=(a=this.states.get(this.lastActive))==null?void 0:a.tabs.fields();c&&this.plugin.wantsTabEvents()&&this.plugin.deliverTabEvent("onActivated",{...c,active:!0})}this.schedule()})),this.observer=new MutationObserver(s=>{s.some(i=>[...i.addedNodes].some(o=>{var a;return o.instanceOf(HTMLElement)&&(o.matches(t)||!!((a=o.querySelector)!=null&&a.call(o,t)))}))&&this.schedule()}),this.observer.observe(e.containerEl,{childList:!0,subtree:!0}),e.onLayoutReady(()=>{this.disposed||this.sync()})}schedule(){this.scheduled===null&&(this.scheduled=window.setTimeout(()=>{this.scheduled=null,this.sync()},60))}sync(){const e=new Set;for(const t of this.plugin.app.workspace.getLeavesOfType(this.target.viewType)){const s=t.view;if(typeof(s==null?void 0:s.addAction)!="function")continue;const i=this.target.webviewOf(s);if(!i||i.getAttribute("partition")!==this.target.partition)continue;e.add(s);const o=this.states.get(s);if(o&&o.webview===i&&o.actions.every(d=>d.isConnected))continue;const a=(o==null?void 0:o.tabs.tabId)??null;o&&this.teardown(o);const l=this.attach(s,i).tabs.fields();this.ready&&l&&this.plugin.wantsTabEvents()&&l.id!==a&&(a!==null&&this.removed(a),this.plugin.deliverTabEvent("onCreated",l))}for(const[t,s]of this.states){if(e.has(t))continue;const i=s.tabs.tabId;this.teardown(s),this.states.delete(t),i!==null&&this.removed(i)}this.ready=!0}removed(e){this.plugin.forgetTab(e),this.plugin.wantsTabEvents()&&this.plugin.deliverTabEvent("onRemoved",{id:e},{removeInfo:{windowId:-1,isWindowClosing:!1}})}refreshActions(){for(const e of this.states.values())this.buildActions(e)}refreshActionVisuals(e){for(const t of this.states.values()){const s=this.tabIdOf(t.webview);for(const i of t.actions){const o=i.dataset.extensionId;if(!o||e&&o!==e)continue;const a=this.plugin.settings.extensions.find(c=>c.id===o);a&&Cn(i,this.plugin.actionView(a,s))}}}tabIdOf(e){try{const t=e.getWebContentsId();return Number.isSafeInteger(t)?t:null}catch{return null}}activeWebview(){var s;const e=this.plugin.app.workspace.getMostRecentLeaf(),t=(e?this.states.get(e.view):void 0)??(this.lastActive?this.states.get(this.lastActive):void 0);return(t==null?void 0:t.webview)??((s=[...this.states.values()][0])==null?void 0:s.webview)??null}puzzleButton(e){for(const t of this.states.values())if(!e||t.webview===e)return t.actions[0]??null;return null}actionAnchor(e,t){for(const s of this.states.values())if(!(t&&s.webview!==t))return s.actions.find(i=>i.dataset.extensionId===e&&i.isConnected)??s.actions[0]??null;return null}isBrowserTab(e){for(const t of this.states.values())try{if(t.webview.getWebContentsId()===e)return!0}catch{}return!1}attach(e,t){const s={view:e,webview:t,actions:[],storeAction:null,storeBusy:!1,detach:[],redirects:[],pendingRedirect:null,tabs:new Ol(t,(c,l,d)=>this.plugin.deliverTabEvent(c,l,d),()=>this.plugin.wantsTabEvents(),()=>this.lastActive===e),navigation:new Ll(t,Tl(this.plugin.remote),(c,l)=>this.plugin.deliverNavigation(c,l),()=>this.plugin.wantsNavigation())};this.states.set(e,s),this.buildActions(s);const i=()=>this.updateStoreAction(s);for(const c of zs)t.addEventListener(c,i);s.detach.push(()=>{for(const c of zs)t.removeEventListener(c,i)}),this.updateStoreAction(s),s.detach.push(Ge(t,"did-start-navigation",c=>{!c.isMainFrame||c.isInPlace||typeof c.url!="string"||this.applyNetRequest(s,c.url)}));let o=0;s.detach.push(Ge(t,"did-navigate",c=>{var p,u;const l=s.pendingRedirect;if(l&&c.url===l.from){s.pendingRedirect=null,this.dropPlaceholder(s.webview),s.webview.executeJavaScript(`location.replace(${JSON.stringify(l.to)})`).catch(()=>s.webview.loadURL(l.to).catch(()=>{}));return}const d=s.redirects.find(g=>g.to===c.url&&!g.cleaned);d&&(d.cleaned=!0,this.dropHistoryEntry(s.webview,d.from));try{o=((u=(p=this.plugin.remote)==null?void 0:p.webContents.fromId(s.webview.getWebContentsId()))==null?void 0:u.navigationHistory.length())??0}catch{}})),s.detach.push(Ge(t,"did-fail-load",c=>{const l=s.pendingRedirect;!l||!c.isMainFrame||c.validatedURL!==l.from||(s.pendingRedirect=null,s.webview.loadURL(l.to).catch(()=>{}))}));const a=()=>{o===1&&e.leaf.detach()};return t.addEventListener("close",a),s.detach.push(()=>t.removeEventListener("close",a)),this.target.nativePageMenu&&s.detach.push(Ge(e.containerEl,"context-menu",c=>{c.target===s.webview&&this.extendNextMenu(c.params??{},s.webview)},!0)),s}teardown(e){var t;e.navigation.dispose(),e.tabs.dispose();for(const s of e.detach.splice(0))s();for(const s of e.actions)s.remove();e.actions=[],(t=e.storeAction)==null||t.remove(),e.storeAction=null}buildActions(e){for(const i of e.actions)i.remove();e.actions=[];const{view:t}=e,s=t.addAction("puzzle",x("toolbar.extensions"),()=>this.plugin.togglePanel(s,e.webview));s.addClass("chrome-bridge-action"),e.actions.push(s);for(const i of[...this.plugin.pinnedRecords()].reverse()){const o=this.plugin.getDisplayName(i),a=t.addAction("puzzle",o,()=>this.plugin.activateExtension(i,a,e.webview));a.addClass("chrome-bridge-action","chrome-bridge-pinned"),a.dataset.extensionId=i.id,Cn(a,this.plugin.actionView(i,this.tabIdOf(e.webview))),a.addEventListener("contextmenu",c=>{c.preventDefault(),this.plugin.showExtensionMenu(i,c,e.webview)}),e.actions.push(a)}e.storeAction&&!e.storeBusy&&(e.storeAction.remove(),e.storeAction=null,this.updateStoreAction(e))}currentUrl(e){try{return e.getURL()||e.getAttribute("src")||""}catch{return e.getAttribute("src")||""}}updateStoreAction(e){var a,c,l;if(e.storeBusy)return;const t=Ji(this.currentUrl(e.webview));if(!t){(a=e.storeAction)==null||a.remove(),e.storeAction=null;return}const s=this.plugin.settings.extensions.some(d=>d.source==="store"&&d.storeId===t),i=x(s?"store.installedCheck":"store.install");if((c=e.storeAction)!=null&&c.isConnected&&e.storeAction.dataset.storeId===t&&e.storeAction.dataset.installed===String(s))return;(l=e.storeAction)==null||l.remove();const o=e.view.addAction(s?"refresh-cw":"download",i,async()=>{var d;if(!e.storeBusy){e.storeBusy=!0,o.addClass("is-busy"),o.setAttribute("aria-disabled","true");try{await this.plugin.installFromStore(t)}finally{e.storeBusy=!1,o.removeClass("is-busy"),o.removeAttribute("aria-disabled"),(d=e.storeAction)==null||d.remove(),e.storeAction=null,this.updateStoreAction(e)}}});o.addClass("chrome-bridge-action","chrome-bridge-store-action","mod-cta"),o.createSpan({cls:"chrome-bridge-store-label",text:x(s?"store.installed":"store.install")}),o.dataset.storeId=t,o.dataset.installed=String(s),e.storeAction=o}dropPlaceholder(e){var t,s,i,o,a;try{const c=(o=(i=(s=(t=this.plugin.remote)==null?void 0:t.webContents)==null?void 0:s.fromId)==null?void 0:i.call(s,e.getWebContentsId()))==null?void 0:o.navigationHistory;if(!c||typeof c.removeEntryAtIndex!="function"||c.getActiveIndex()!==1)return;const l=((a=c.getEntryAtIndex(0))==null?void 0:a.url)||"";(l==="data:text/plain,"||l==="data:text/plain")&&c.removeEntryAtIndex(0)}catch{}}dropHistoryEntry(e,t){var s,i,o,a,c,l;try{const d=(a=(o=(i=(s=this.plugin.remote)==null?void 0:s.webContents)==null?void 0:i.fromId)==null?void 0:o.call(i,e.getWebContentsId()))==null?void 0:a.navigationHistory;if(!d||typeof d.removeEntryAtIndex!="function")return;let p=d.getActiveIndex();for(let g=p-1;g>=Math.max(0,p-2);g--)if(((c=d.getEntryAtIndex(g))==null?void 0:c.url)===t){d.removeEntryAtIndex(g),p--;break}const u=((l=d.getEntryAtIndex(0))==null?void 0:l.url)||"";p===1&&(u==="data:text/plain,"||u==="data:text/plain")&&d.removeEntryAtIndex(0)}catch{}}applyNetRequest(e,t){if(!/^(https?|ftp|file):/i.test(t))return;let s;try{s=e.webview.getWebContentsId()}catch{return}const i=Date.now();e.redirects=e.redirects.filter(l=>i-l.at<5e3);const o=this.plugin.netRequestDecision(t,s);if(!o)return;const{decision:a,extension:c}=o;if(a.kind==="block")e.webview.stop(),this.plugin.notifyBlocked(c,t);else if(a.kind==="redirect"&&a.url!==t){if(e.redirects.some(l=>l.to===t)||e.redirects.length>=3)return;e.redirects.push({from:t,to:a.url,at:i}),/^https?:/i.test(a.url)?e.pendingRedirect={from:t,to:a.url}:(e.webview.stop(),window.setTimeout(()=>{e.webview.loadURL(a.url).catch(()=>{})},0))}}extendNextMenu(e,t){var d;let s=null;try{s=t.getWebContentsId()}catch{}const i=Pl(this.plugin.menuSources(s),e),o=(d=this.plugin.remote)==null?void 0:d.Menu;if(!i.length||!o||typeof o.buildFromTemplate!="function")return;const a=o.buildFromTemplate;let c=!1;const l=()=>{c||(c=!0,o.buildFromTemplate=a)};o.buildFromTemplate=function(p){l();const u=Array.isArray(p)?[...p,...p.length?[{type:"separator"}]:[],...i]:p;return a.call(o,u)},window.setTimeout(l,0)}onunload(){var e;this.disposed=!0,this.scheduled!==null&&window.clearTimeout(this.scheduled),(e=this.observer)==null||e.disconnect();for(const t of this.states.values())this.teardown(t);this.states.clear()}}const Ut="webviewer",gt="surfing-view";function jn(r){var t,s;const n=r.internalPlugins,e=((t=n==null?void 0:n.getPluginById)==null?void 0:t.call(n,Ut))??((s=n==null?void 0:n.plugins)==null?void 0:s[Ut]);return!!(e!=null&&e.enabled)}async function ir(r,n,e,t){const s=r.workspace.getLeaf("tab");return await s.setViewState({type:n,state:e,active:t}),t&&r.workspace.revealLeaf(s),s}function rr(r){var t;const n='.webviewer-content webview[partition^="persist:"]',e=(t=document.querySelector(n))==null?void 0:t.getAttribute("partition");return{kind:"webviewer",label:"Web Viewer",viewType:Ut,partition:e||`persist:vault-${r.appId??""}`,webviewSelector:n,webviewOf:s=>s.webview??s.containerEl.querySelector(n),open:(s,i)=>ir(r,Ut,{url:s,navigate:!0},i),nativePageMenu:!0}}function or(r,n){const e=`.workspace-leaf-content[data-type="${gt}"] webview.wb-frame`;return{kind:"surfing",label:"Surfing",viewType:gt,partition:n.sessionIsolation?"":`persist:surfing-vault-${r.appId??""}`,webviewSelector:e,webviewOf:t=>t.webviewEl??t.containerEl.querySelector("webview.wb-frame"),open:(t,s)=>ir(r,gt,{url:t},s),nativePageMenu:!1}}function Bl(r){const n="data-obsidian-bridge-relay";let e;try{e=JSON.parse(String(r))}catch{return!1}if(typeof(e==null?void 0:e.code)!="string")return!1;const t=(o,a,c)=>{var l;for(let d=0;d<o.frames.length;d++)try{const p=o.frames[d].document;if(((l=p==null?void 0:p.documentElement)==null?void 0:l.getAttribute(n))===a)return p;const u=c<4?t(o.frames[d],a,c+1):null;if(u)return u}catch{}return null},s=typeof e.frame=="string"&&t(window,e.frame,0)||document,i=s.createElement("script");return i.textContent=e.code,(s.head||s.documentElement).appendChild(i),i.remove(),!0}const ar="obsidian-chrome-bridge-page-exec";function Dl(r){return"__obsidian_bridge_exec_"+r}function Ul(r){return`'use strict';
// Generated by Obsidian Chrome Bridge: runs inline scripts from extension user
// script worlds despite the page CSP (Chrome's userScripts world CSP).
(() => {
  const { webFrame } = require('electron');
  const run = ${Bl.toString()};
  const warn = e => console.warn('[Chrome Bridge] page exec:', e);
  document.addEventListener(${JSON.stringify(r)}, event => {
    if (typeof event.detail !== 'string') return;
    let message;
    try { message = JSON.parse(event.detail); } catch { return; }
    if (!message || typeof message.code !== 'string') return;
    event.stopImmediatePropagation();
    event.preventDefault();
    try {
      // executeJavaScript itself is exempt from the page CSP; a <script>
      // element it inserted would not be. Code for a same-origin child frame
      // still goes through an element there (and that frame's CSP applies).
      const source = typeof message.frame === 'string' ? '(' + run + ')(' + JSON.stringify(event.detail) + ')' : message.code;
      Promise.resolve(webFrame.executeJavaScript(source)).catch(warn);
    } catch (e) { warn(e); }
  }, true);
})();
`}function Wl(r,n,e){if(typeof(r==null?void 0:r.registerPreloadScript)!="function")return!1;const t=Ul(e);let s=null;try{s=j.readFileSync(n,"utf8")}catch{}return s!==t&&j.writeFileSync(n,t),cr(r),r.registerPreloadScript({type:"frame",id:ar,filePath:n}),!0}function cr(r){var n;try{(n=r==null?void 0:r.unregisterPreloadScript)==null||n.call(r,ar)}catch{}}function Fl(r){const n=(r==null?void 0:r.condition)||{};return Array.isArray(n.resourceTypes)?n.resourceTypes.includes("main_frame"):Array.isArray(n.excludedResourceTypes)?!n.excludedResourceTypes.includes("main_frame"):!1}function qn(r,n){return er(r,n.includes("i"))}function $l(r,n=!1){let e=r,t="",s="";e.startsWith("||")?(t="^[a-z][a-z0-9+.-]*:\\/\\/(?:[^/?#]*\\.)?",e=e.slice(2)):e.startsWith("|")&&(t="^",e=e.slice(1)),e.endsWith("|")&&(s="$",e=e.slice(0,-1));const i=e.replace(/\*{2,}/g,"*").split("").map(o=>o==="*"?".*":o==="^"?"(?:[^A-Za-z0-9_\\-.%]|$)":o.replace(/[.+?${}()|[\]\\/]/g,"\\$&")).join("");return qn(t+i+s,n?"":"i")}const Gs=r=>{try{return new URL(r).hostname.toLowerCase()}catch{return""}},It=(r,n)=>n.some(e=>{const t=String(e).toLowerCase();return r===t||r.endsWith("."+t)});function jl(r,n){const e=r.condition||{};if(!Fl(r))return!1;const t=n.url,s=Gs(t),i=(n.method||"get").toLowerCase(),o=e.requestDomains??e.domains,a=e.excludedRequestDomains??e.excludedDomains;if(Array.isArray(o)&&!It(s,o)||Array.isArray(a)&&It(s,a))return!1;const c=n.initiator?Gs(n.initiator):"";if(Array.isArray(e.initiatorDomains)&&(!c||!It(c,e.initiatorDomains))||Array.isArray(e.excludedInitiatorDomains)&&c&&It(c,e.excludedInitiatorDomains)||Array.isArray(e.requestMethods)&&!e.requestMethods.map(l=>l.toLowerCase()).includes(i)||Array.isArray(e.excludedRequestMethods)&&e.excludedRequestMethods.map(l=>l.toLowerCase()).includes(i)||Array.isArray(e.tabIds)&&!e.tabIds.includes(n.tabId)||Array.isArray(e.excludedTabIds)&&e.excludedTabIds.includes(n.tabId)||e.domainType==="thirdParty")return!1;if(typeof e.regexFilter=="string"){const l=qn(e.regexFilter,e.isUrlFilterCaseSensitive?"":"i");if(!l||!l.test(t))return!1}else if(typeof e.urlFilter=="string"&&e.urlFilter){const l=$l(e.urlFilter,!!e.isUrlFilterCaseSensitive);if(!l||!l.test(t))return!1}return!0}const Js={allow:5,allowAllRequests:5,block:4,upgradeScheme:3,redirect:2,modifyHeaders:0};function ql(r,n,e){const t=r.action.redirect;if(!t)return null;if(typeof t.url=="string")return t.url;if(typeof t.extensionPath=="string")return`chrome-extension://${e}/${t.extensionPath.replace(/^\//,"")}`;if(typeof t.regexSubstitution=="string"&&typeof r.condition.regexFilter=="string"){const s=qn(r.condition.regexFilter,r.condition.isUrlFilterCaseSensitive?"":"i"),i=s==null?void 0:s.exec(n);return i?t.regexSubstitution.replace(/\\(\d)/g,(o,a)=>i[Number(a)]??""):null}if(t.transform){let s;try{s=new URL(n)}catch{return null}const i=t.transform;if(i.scheme&&(s.protocol=i.scheme+":"),i.host!==void 0&&(s.hostname=i.host),i.port!==void 0&&(s.port=i.port),i.path!==void 0&&(s.pathname=i.path),i.query!==void 0&&(s.search=i.query),i.fragment!==void 0&&(s.hash=i.fragment),i.username!==void 0&&(s.username=i.username),i.password!==void 0&&(s.password=i.password),i.queryTransform){for(const o of i.queryTransform.removeParams||[])s.searchParams.delete(o);for(const o of i.queryTransform.addOrReplaceParams||[])o.replaceOnly&&!s.searchParams.has(o.key)||s.searchParams.set(o.key,o.value)}return s.href}return null}function Hl(r,n,e,t=()=>!0){let s=null;for(const i of r){if(!(i!=null&&i.action)||i.action.type==="modifyHeaders"||!t(i)||!jl(i,n))continue;if(!s){s=i;continue}const o=i.priority??1,a=s.priority??1;(o>a||o===a&&(Js[i.action.type]??0)>(Js[s.action.type]??0))&&(s=i)}if(!s)return null;switch(s.action.type){case"block":return{kind:"block",rule:s};case"allow":case"allowAllRequests":return{kind:"allow",rule:s};case"upgradeScheme":return/^http:/i.test(n.url)?{kind:"redirect",rule:s,url:n.url.replace(/^http:/i,"https:")}:null;case"redirect":{const i=ql(s,n.url,e);return i?{kind:"redirect",rule:s,url:i}:null}}return null}class lr{constructor(n,e,t){y(this,"el");y(this,"closed",!1);y(this,"cleanup",[]);y(this,"size",{width:380,height:490});y(this,"onClose",null);this.anchor=n,this.el=document.body.createDiv({cls:["chrome-bridge-surface",e],attr:{role:"dialog","aria-label":t}});const s=c=>{this.el.contains(c.target)||this.anchor instanceof HTMLElement&&this.anchor.contains(c.target)||this.close()},i=c=>{c.key==="Escape"&&(c.stopPropagation(),this.close())},o=()=>this.position(),a=c=>{this.el.contains(c.target)||(this.anchor instanceof HTMLElement?this.position():this.close())};document.addEventListener("pointerdown",s,!0),document.addEventListener("keydown",i,!0),window.addEventListener("resize",o),document.addEventListener("scroll",a,!0),this.cleanup.push(()=>document.removeEventListener("pointerdown",s,!0),()=>document.removeEventListener("keydown",i,!0),()=>window.removeEventListener("resize",o),()=>document.removeEventListener("scroll",a,!0))}get isClosed(){return this.closed}isAnchoredTo(n){return this.anchor===n}setSize(n,e){this.size={width:n,height:e},this.position()}position(){if(this.closed)return;if(this.anchor instanceof HTMLElement&&!this.anchor.isConnected){this.close();return}const n=Math.min(this.size.width,Math.max(220,window.innerWidth-24)),e=Math.min(this.size.height,Math.max(160,window.innerHeight-24)),t=this.anchor instanceof HTMLElement?this.anchor.getBoundingClientRect():this.anchor??{right:window.innerWidth-18,top:55,bottom:78},s=Math.min(Math.max(12,t.right-n),window.innerWidth-n-12),i=t.bottom+6+e<=window.innerHeight-12?t.bottom+6:Math.max(12,t.top-e-6);Object.assign(this.el.style,{left:`${s}px`,top:`${i}px`,width:`${n}px`,height:`${e}px`})}close(){var n;if(!this.closed){this.closed=!0;for(const e of this.cleanup.splice(0))e();this.el.remove(),(n=this.onClose)==null||n.call(this)}}}const Ys={width:160,height:60},Xs={width:800,height:600},Ks={width:360,height:420},Vl={width:680,height:560},Zs=36,Tn="[obsidian-bridge:size] ",zl=`(() => {
  if (window.__obsidianBridgeSizeProbe) return true;
  window.__obsidianBridgeSizeProbe = true;
  let last = '';
  const report = () => {
    const doc = document.documentElement, body = document.body;
    if (!body) return;
    let right = 0, bottom = 0;
    for (const el of body.children) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.display === 'none') continue;
      right = Math.max(right, r.right + (parseFloat(style.marginRight) || 0));
      bottom = Math.max(bottom, r.bottom + (parseFloat(style.marginBottom) || 0));
    }
    const bs = getComputedStyle(body);
    right += parseFloat(bs.marginRight) || 0;
    bottom += (parseFloat(bs.marginBottom) || 0) + (parseFloat(bs.paddingBottom) || 0);
    const size = {
      contentWidth: Math.ceil(right), contentHeight: Math.ceil(bottom),
      scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth,
      scrollHeight: doc.scrollHeight, clientHeight: doc.clientHeight
    };
    const key = JSON.stringify(size);
    if (key !== last) { last = key; console.debug(${JSON.stringify(Tn)} + key); }
  };
  const ro = new ResizeObserver(report);
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);
  new MutationObserver(() => {
    if (document.body) for (const el of document.body.children) ro.observe(el);
    report();
  }).observe(document.documentElement, { childList: true, subtree: true });
  report();
  return true;
})()`;class De{constructor(n,e,t,s,i="popup",o=null){y(this,"surface",null);y(this,"frame",null);y(this,"errors",[]);y(this,"targetTabId",null);y(this,"size",{...Ks});this.plugin=n,this.rec=e,this.relativePath=t,this.anchor=s,this.kind=i,this.sourceWebview=o}static resolveUrl(n,e){if(!/^[a-p]{32}$/.test(n))throw new Error(x("error.invalidChromeExtensionId"));const t=String(e||"");if(!t||/^[/\\]/.test(t)||/\\/.test(t)||/^(?:[a-z]+:|\/\/)/i.test(t))throw new Error(x("error.invalidPopupPath"));const s=new URL(t,`chrome-extension://${n}/`);if(s.protocol!=="chrome-extension:"||s.hostname!==n||t.split("/").some(i=>{try{return decodeURIComponent(i)===".."}catch{return!0}}))throw new Error(x("error.pageNotOwn"));return s.href}get targetTab(){return this.isOpen?this.targetTabId:null}get isOpen(){return!!this.surface&&!this.surface.isClosed}isAnchoredTo(n){var e;return!!((e=this.surface)!=null&&e.isAnchoredTo(n))}resolveTargetTab(){var e,t;const n=(e=this.sourceWebview)!=null&&e.isConnected?this.sourceWebview:this.plugin.activeWebview();try{const s=(t=n==null?void 0:n.getWebContentsId)==null?void 0:t.call(n);return Number.isSafeInteger(s)&&s>0?s:null}catch{return null}}open(){this.targetTabId=this.kind==="popup"?this.resolveTargetTab():null;const n=new URL(De.resolveUrl(this.rec.id,this.relativePath)),e=this.plugin.getDisplayName(this.rec),t=new lr(this.anchor,"chrome-bridge-popover",x(this.kind==="options"?"popover.optionsLabel":"popover.panelLabel",{name:e}));this.surface=t,t.onClose=()=>{this.frame=null,this.plugin.popoverClosed(this)};const s=t.el.createDiv({cls:"chrome-bridge-popover-head"});Bn(s.createSpan({cls:"chrome-bridge-popover-icon"}),this.plugin.iconFor(this.rec,16),e),s.createSpan({cls:"chrome-bridge-popover-title",text:this.kind==="options"?x("popover.optionsTitle",{name:e}):e});const i=(c,l,d)=>{const p=s.createEl("button",{cls:"clickable-icon chrome-bridge-popover-button",attr:{type:"button","aria-label":l}});return A.setIcon(p,c),A.setTooltip(p,l),p.addEventListener("click",d),p};this.kind==="popup"&&this.plugin.optionsPageOf(this.rec)&&i("settings",x("list.options"),()=>{t.close(),this.plugin.openOptions(this.rec,this.anchor)}),this.plugin.settings.debug&&i("bug",x("popover.diagnose"),()=>void this.diagnose()),i("x",x("common.close"),()=>t.close());const o=t.el.createDiv({cls:"chrome-bridge-popover-status",text:x("common.loading")}),a=document.createElement("webview");return a.className="chrome-bridge-popover-webview",a.setAttribute("partition",this.plugin.partition()),a.setAttribute("src",n.href),this.frame=a,a.addEventListener("dom-ready",()=>{o.hidden=!0,this.kind==="popup"&&a.executeJavaScript(zl).catch(()=>{})}),a.addEventListener("console-message",c=>{const l=c.message||"";if(l.startsWith(Tn)){try{this.fitContent(JSON.parse(l.slice(Tn.length)))}catch{}return}const d=c.level;(d>=2||/(?:Uncaught|TypeError|ReferenceError|Failed to load|SyntaxError)/i.test(l))&&(this.errors.push({level:d,message:l.slice(0,1500),sourceId:c.sourceId,line:c.line}),this.errors.length>30&&this.errors.shift(),this.plugin.settings.debug)}),a.addEventListener("close",()=>t.close()),a.addEventListener("did-fail-load",c=>{c.errorCode!==-3&&(o.hidden=!1,o.setText(x("page.loadFailed",{code:c.errorCode,description:c.errorDescription||"unknown"})))}),t.el.appendChild(a),this.size=this.kind==="options"?{...Vl}:{...Ks},t.setSize(this.size.width,this.size.height+Zs),this}fitContent(n){if(!this.surface||this.surface.isClosed)return;const e=(o,a,c)=>Math.round(Math.min(c,Math.max(a,o))),t=n.scrollWidth>n.clientWidth+1?n.scrollWidth:n.contentWidth>0?n.contentWidth:this.size.width,s=n.scrollHeight>n.clientHeight+1?n.scrollHeight:n.contentHeight>0?n.contentHeight:this.size.height,i={width:e(t,Ys.width,Xs.width),height:e(s,Ys.height,Xs.height)};Math.abs(i.width-this.size.width)<2&&Math.abs(i.height-this.size.height)<2||(this.size=i,this.surface.setSize(i.width,i.height+Zs))}async diagnose(){var e;const n={extension:this.plugin.getDisplayName(this.rec),id:this.rec.id,expectedUrl:De.resolveUrl(this.rec.id,this.relativePath),targetTabId:this.targetTabId,size:this.size,errors:[...this.errors]};try{n.page=await((e=this.frame)==null?void 0:e.executeJavaScript(`(() => ({
        url: location.href, readyState: document.readyState, title: document.title,
        bodyText: document.body?.innerText?.slice(0, 180),
        runtimeId: chrome?.runtime?.id, browserType: typeof globalThis.browser,
        bridge: globalThis.__obsidianBridgeCompatV06 || null
      }))()`))}catch(t){n.diagnosticError=String(t)}return new A.Notice(x("notice.extensionDiagnosticsLogged")),n}close(){var n;(n=this.surface)==null||n.close()}}const Gl=36;class Jl{constructor(n,e,t){y(this,"surface",null);this.plugin=n,this.anchor=e,this.webview=t}get isOpen(){return!!this.surface&&!this.surface.isClosed}isAnchoredTo(n){var e;return!!((e=this.surface)!=null&&e.isAnchoredTo(n))}open(){const n=new lr(this.anchor,"chrome-bridge-panel",x("toolbar.extensions"));return this.surface=n,n.onClose=()=>this.plugin.panelClosed(this),this.render(),this}close(){var n;(n=this.surface)==null||n.close()}render(){var p;const n=this.surface;if(!n||n.isClosed)return;const e=n.el;e.empty();const t=e.createDiv({cls:"chrome-bridge-panel-head"});t.createSpan({cls:"chrome-bridge-panel-title",text:x("panel.title")});const s=t.createEl("button",{cls:"clickable-icon",attr:{type:"button","aria-label":x("command.manage")}});A.setIcon(s,"settings"),A.setTooltip(s,x("command.manage")),s.addEventListener("click",()=>{n.close(),this.plugin.openManager()});const i=e.createDiv({cls:"chrome-bridge-panel-list"}),o=this.plugin.settings.extensions;let a=null;try{a=((p=this.webview)==null?void 0:p.getWebContentsId())??null}catch{}o.length||i.createDiv({cls:"chrome-bridge-panel-empty",text:x("panel.empty")});for(const u of o){const g=this.plugin.getDisplayName(u),m=i.createDiv({cls:"chrome-bridge-panel-row"+(u.enabled?"":" is-disabled")}),h=m.createEl("button",{cls:"chrome-bridge-panel-open",attr:{type:"button"}}),b=this.plugin.actionView(u,a);Cn(h.createSpan({cls:"chrome-bridge-panel-icon"}),b,!1),h.createSpan({cls:"chrome-bridge-panel-name",text:g}),u.enabled||h.createSpan({cls:"chrome-bridge-panel-badge",text:x("panel.disabledBadge")});const f=this.plugin.popupFor(u,a),v=this.plugin.hasAction(u),S=u.enabled&&b.enabled&&!!(f||v||this.plugin.optionsPageOf(u));h.disabled=!S,A.setTooltip(h,u.enabled?f?x("menu.openPanel"):v?b.title||g:x(S?"panel.openOptions":"panel.noPanel"):x("panel.disabled")),h.addEventListener("click",()=>{n.close(),this.plugin.activateExtension(u,this.anchor,this.webview)}),h.addEventListener("contextmenu",I=>{I.preventDefault(),this.plugin.showExtensionMenu(u,I,this.webview)});const k=this.plugin.isPinned(u),C=m.createEl("button",{cls:"clickable-icon chrome-bridge-panel-pin"+(k?" is-active":""),attr:{type:"button","aria-label":x(k?"menu.unpin":"menu.pin"),"aria-pressed":String(k)}});A.setIcon(C,k?"pin":"pin-off"),A.setTooltip(C,x(k?"menu.unpin":"menu.pin")),C.disabled=!u.enabled,C.addEventListener("click",()=>void this.plugin.togglePinned(u).then(()=>this.render()));const O=m.createEl("button",{cls:"clickable-icon",attr:{type:"button","aria-label":x("common.more")}});A.setIcon(O,"more-vertical"),A.setTooltip(O,x("common.more")),O.addEventListener("click",I=>this.plugin.showExtensionMenu(u,I,this.webview,()=>this.render()))}const l=e.createDiv({cls:"chrome-bridge-panel-foot"}).createEl("button",{cls:"chrome-bridge-panel-link",attr:{type:"button"}});A.setIcon(l.createSpan({cls:"chrome-bridge-panel-link-icon"}),"plus"),l.createSpan({text:x("panel.addFromStore")}),l.addEventListener("click",()=>{n.close(),this.plugin.openStore()});const d=44+Math.max(1,o.length)*Gl+46+8;n.setSize(320,Math.min(d,480))}}const ct="chrome-bridge-extension-page";class Qs extends A.ItemView{constructor(e,t){super(e);y(this,"url","");y(this,"title","");y(this,"webview",null);y(this,"status",null);this.plugin=t}getViewType(){return ct}getIcon(){return"puzzle"}getDisplayText(){if(this.title)return this.title;const e=this.plugin.recordForUrl(this.url);return e?this.plugin.getDisplayName(e):x("page.title")}getState(){return{url:this.url}}async setState(e,t){typeof(e==null?void 0:e.url)=="string"&&e.url!==this.url&&(this.url=e.url,this.showPage()),await super.setState(e,t)}async onOpen(){this.contentEl.addClass("chrome-bridge-extension-page"),this.addAction("rotate-cw",x("page.reload"),()=>{var e;return(e=this.webview)==null?void 0:e.reload()}),this.url&&this.showPage()}refreshIfStale(){var s;if(!this.url)return;let e=null;try{e=this.plugin.partition()}catch{}const t=((s=this.webview)==null?void 0:s.getAttribute("partition"))??null;t!==null&&t===e||t===null&&!this.plugin.recordForUrl(this.url)||this.showPage()}showPage(){if(this.contentEl.empty(),this.webview=null,this.title="",!this.plugin.recordForUrl(this.url)){this.contentEl.createDiv({cls:"chrome-bridge-page-status",text:this.url?x("page.notAvailable"):""});return}this.status=this.contentEl.createDiv({cls:"chrome-bridge-page-status",text:x("common.loading")});const t=document.createElement("webview");t.className="chrome-bridge-page-webview",t.setAttribute("partition",this.plugin.partition()),t.setAttribute("src",this.url),t.addEventListener("dom-ready",()=>{this.status&&(this.status.hidden=!0)}),t.addEventListener("page-title-updated",s=>{var i,o;this.title=s.title||"",(o=(i=this.leaf).updateHeader)==null||o.call(i)}),t.addEventListener("did-fail-load",s=>{s.errorCode===-3||!this.status||(this.status.hidden=!1,this.status.setText(x("page.loadFailed",{code:s.errorCode,description:s.errorDescription||"unknown"})))}),t.addEventListener("close",()=>this.leaf.detach()),this.contentEl.appendChild(t),this.webview=t}async onClose(){var e;(e=this.webview)==null||e.remove(),this.webview=null}}class Yl extends A.Modal{constructor(n,e){super(n),this.plugin=e}onOpen(){this.modalEl.addClass("chrome-bridge-manager"),this.setTitle(x("toolbar.extensions")),this.render()}render(){var o;const n=this.contentEl;n.empty();const e=()=>this.render(),t=()=>this.close();Di(this.plugin,n,e,t),Ri(this.plugin,n,e,t);const s=n.createDiv({cls:"chrome-bridge-manager-foot"});s.createSpan({cls:"chrome-bridge-muted",text:x("manager.scope",{target:((o=this.plugin.target)==null?void 0:o.label)??"Web Viewer"})}),s.createEl("a",{text:x("manager.settings"),href:"#"}).addEventListener("click",a=>{a.preventDefault(),this.close(),this.plugin.openSettings()})}onClose(){this.contentEl.empty()}}class dr extends A.Modal{constructor(){super(...arguments);y(this,"finish");y(this,"resolved",!1);y(this,"promise",new Promise(e=>{this.finish=e}))}openAndWait(){return this.open(),this.promise}settle(e){this.resolved||(this.resolved=!0,this.finish(e)),this.close()}onClose(){this.contentEl.empty(),this.resolved||(this.resolved=!0,this.finish(!1))}}class ei extends dr{constructor(n,e,t,s){super(n),this.manifestData=e,this.source=t,this.displayName=s}onOpen(){const{contentEl:n}=this;n.empty(),n.addClass("chrome-bridge-confirm"),this.setTitle(x("install.title",{name:this.displayName||pa(this.manifestData)})),n.createEl("p",{cls:"chrome-bridge-muted",text:x("install.version",{version:this.manifestData.version,source:this.source})});const{permissions:e,hosts:t}=ln(this.manifestData),s=n.createEl("ul",{cls:"chrome-bridge-permissions"});t.some(i=>/^(<all_urls>|\*:\/\/\*\/\*|https?:\/\/\*\/\*)$/.test(i))?s.createEl("li",{text:x("install.allSites")}):t.length&&s.createEl("li",{text:x("install.sites",{sites:t.slice(0,6).join(x("common.separator")),more:t.length>6?x("install.sitesMore",{count:t.length}):""})}),e.length&&s.createEl("li",{text:x("install.apis",{apis:e.join(x("common.separator"))})}),s.childElementCount||s.createEl("li",{text:x("install.noPermissions")}),n.createEl("p",{cls:"chrome-bridge-warning",text:x("install.warning")}),new A.Setting(n).addButton(i=>i.setButtonText(x("common.cancel")).onClick(()=>this.settle(!1))).addButton(i=>i.setButtonText(x("install.confirm")).setCta().onClick(()=>this.settle(!0)))}}class Xl extends dr{constructor(n,e,t,s=x("common.ok"),i=!1){super(n),this.titleText=e,this.message=t,this.confirmText=s,this.danger=i}onOpen(){this.setTitle(this.titleText),this.contentEl.createEl("p",{text:this.message}),new A.Setting(this.contentEl).addButton(n=>n.setButtonText(x("common.cancel")).onClick(()=>this.settle(!1))).addButton(n=>{n.setButtonText(this.confirmText).onClick(()=>this.settle(!0)),this.danger?n.setWarning():n.setCta()})}}class ti extends A.Modal{constructor(n,e,t,s,i){super(n),this.titleText=e,this.placeholderText=t,this.description=s,this.onSubmit=i}onOpen(){this.contentEl.empty(),this.setTitle(this.titleText),this.description&&this.contentEl.createEl("p",{cls:"chrome-bridge-muted",text:this.description});let n="";const e=()=>{n.trim()&&(this.close(),this.onSubmit(n.trim()))};new A.Setting(this.contentEl).setClass("chrome-bridge-input-row").addText(t=>{t.setPlaceholder(this.placeholderText).onChange(s=>{n=s}),t.inputEl.addClass("chrome-bridge-input"),t.inputEl.addEventListener("keydown",s=>{s.key==="Enter"&&e()}),window.setTimeout(()=>t.inputEl.focus(),0)}),new A.Setting(this.contentEl).addButton(t=>t.setButtonText(x("common.ok")).setCta().onClick(e))}onClose(){this.contentEl.empty()}}const Kl=6*3600*1e3,ni=39,Zl=4e3,Ql=16*1024*1024,ed=256*1024*1024,si=/^[0-9a-f]{64}$/,ii={count:10,windowMs:1e4},td=2,ri="ext:";async function nd(r){let n=0;const e=async t=>{for(const o of await j.promises.readdir(t,{withFileTypes:!0})){const a=H.join(t,o.name);if(o.isSymbolicLink())throw new Error(x("error.folderSymlink",{path:a}));if(++n>2e4)throw new Error(x("error.folderTooManyFiles"));if(o.isDirectory())await e(a);else if(!o.isFile())throw new Error(x("error.folderUnsupportedFile",{path:a}))}const s=await j.promises.realpath(t),i=await j.promises.realpath(r);if(s!==i&&!s.startsWith(i+H.sep))throw new Error(x("error.folderExternalLink",{path:t}))};await e(r)}function sd(){try{return require("@electron/remote")}catch{}const r=window.require;try{return(r==null?void 0:r("@electron/remote"))??null}catch{return null}}const nn="obsidian-chrome-bridge",id=2e3;class rd extends A.Component{constructor(e){super();y(this,"root");y(this,"remote",null);y(this,"state","starting");y(this,"target",null);y(this,"restorePromise",Promise.resolve());y(this,"compatRuntime",null);y(this,"compatPartition",null);y(this,"pageExec",null);y(this,"probeId",null);y(this,"installing",new Set);y(this,"opened",new Map);y(this,"notifications");y(this,"actionRefresh",null);y(this,"captures",new Map);y(this,"extensionCommands",new Set);y(this,"cookieWatch",null);y(this,"pageExecSecret",Ce.randomBytes(16).toString("hex"));y(this,"tracker",null);y(this,"channels");y(this,"activePopover",null);y(this,"activePanel",null);y(this,"manifestCache",new Map);y(this,"nameCache",new Map);y(this,"iconCache",new Map);y(this,"registered",!1);this.host=e}get app(){return this.host.plugin.app}get settings(){return this.host.settings}onload(){const e=this.host.settings;for(const[o,a]of Object.entries(_i))e[o]===void 0&&(e[o]=a);Array.isArray(e.extensions)||(e.extensions=[]);const t=this.electronVersion();if(!(Number(t==null?void 0:t.split(".")[0])>=ni)){this.state="old-electron";return}const s=this.app.vault.adapter;if(!(s instanceof A.FileSystemAdapter)){this.state="no-remote";return}const i=this.host.plugin.manifest.dir??H.posix.join(this.app.vault.configDir,"plugins",this.host.plugin.manifest.id);if(this.root=H.join(s.getBasePath(),...i.split("/"),"chrome-extensions"),j.mkdirSync(H.join(this.root,"extensions"),{recursive:!0}),this.writeAssets(),this.remote=sd(),!this.remote){this.state="no-remote";return}this.channels=new gl(this),this.notifications=new vl((o,a)=>{var c;return void((c=this.channels.get(o))==null?void 0:c.send({type:"notifications.event",...a}))}),this.app.workspace.onLayoutReady(()=>{this.retarget(),this.registerEvent(this.app.workspace.on("layout-change",()=>this.retarget())),this.registerInterval(window.setInterval(()=>this.retarget(),id))}),this.registerInterval(window.setInterval(()=>{this.settings.autoUpdate&&this.target&&this.checkUpdates(!0)},Kl))}registerUI(){if(this.registered)return;this.registered=!0;const e=this.host.plugin;e.registerView(ct,t=>new Qs(t,this)),e.addCommand({id:"manage-chrome-extensions",name:x("command.manage"),callback:()=>this.openManager()}),e.addCommand({id:"open-chrome-web-store",name:x("command.openStore"),callback:()=>void this.openStore()}),e.addCommand({id:"install-chrome-extension-url",name:x("command.installFromUrl"),callback:()=>this.askStoreUrl()}),e.addCommand({id:"install-chrome-extension-local",name:x("command.installLocal"),callback:()=>this.askLocalPath()}),e.addCommand({id:"show-extensions-menu",name:x("command.showMenu"),checkCallback:t=>{var o,a;const s=((o=this.tracker)==null?void 0:o.activeWebview())??null,i=(a=this.tracker)==null?void 0:a.puzzleButton(s);return i?(t||this.togglePanel(i,s),!0):!1}}),e.addCommand({id:"reload-webview-after-extension",name:x("command.reloadPages"),callback:()=>this.reloadGuestPages()})}legacyPluginEnabled(){var t;const e=this.app.plugins;return!!((t=e==null?void 0:e.plugins)!=null&&t[nn])}wantedTarget(){if(this.legacyPluginEnabled())return this.state="conflict",null;if(jn(this.app))return rr(this.app);const e=or(this.app,{sessionIsolation:this.host.sessionIsolation()});return e.partition?e:(this.state="isolated",null)}retarget(){if(!this.remote)return;const e=this.wantedTarget(),t=this.target;if(!(e&&t&&e.kind===t.kind&&e.partition===t.partition)&&!(!e&&!t)){if(t&&this.stopTarget(),!e){this.refreshUI();return}this.registerUI(),this.target=e,this.state="running",this.tracker=this.addChild(new Rl(this,e)),this.restorePromise=this.restore()}}stopTarget(){var e,t,s,i;(e=this.activePopover)==null||e.close(),(t=this.activePanel)==null||t.close(),this.unwatchCookies(),(s=this.channels)==null||s.sync([]),this.tracker&&this.removeChild(this.tracker),this.tracker=null;try{const o=this.session();this.probeId&&o.extensions.getExtension(this.probeId)&&o.extensions.removeExtension(this.probeId);for(const a of this.settings.extensions)a.id&&o.extensions.getExtension(a.id)&&o.extensions.removeExtension(a.id);this.pageExec&&cr(o)}catch{}this.probeId=null,this.pageExec=null,(i=this.compatRuntime)==null||i.close(),this.compatRuntime=null,this.compatPartition=null,this.target=null}writeAssets(){for(const[e,t]of Object.entries(hc)){const s=H.join(this.root,...e.split("/"));try{if(j.existsSync(s)&&j.readFileSync(s,"utf8")===t)continue;j.mkdirSync(H.dirname(s),{recursive:!0}),j.writeFileSync(s,t)}catch{}}}onunload(){var e,t,s;this.target&&this.stopTarget(),(e=this.notifications)==null||e.dispose(),(t=this.channels)==null||t.dispose();for(const i of this.extensionCommands)(s=this.internals.commands)==null||s.removeCommand(`${this.host.plugin.manifest.id}:${i}`);this.extensionCommands.clear()}get internals(){return this.app}electronVersion(){return process.versions.electron}locale(){var e;return((e=window.navigator)==null?void 0:e.language)||"en"}async saveSettings(){await this.host.save()}partition(){var t;const e=(t=this.target)==null?void 0:t.partition;if(!e||!/^persist:[a-zA-Z0-9_-]+$/.test(e))throw new Error(this.unavailableReason());return e}unavailableReason(){switch(this.state){case"old-electron":return x("unavailable.oldElectron",{min:ni,current:this.electronVersion()??x("unavailable.unknownVersion")});case"no-remote":return x("unavailable.noRemote");case"conflict":return x("unavailable.conflict");case"isolated":return x("unavailable.isolated");default:return x("unavailable.notStarted")}}session(){var i,o;const e=this.remote;if(typeof((i=e==null?void 0:e.session)==null?void 0:i.fromPartition)!="function")throw new Error(x("error.noRemoteSession"));const t=this.partition(),s=e.session.fromPartition(t);if(this.compatPartition!==t){(o=this.compatRuntime)==null||o.close(),this.compatPartition=t;try{this.compatRuntime=new jc(s,()=>[...this.settings.extensions.map(a=>a.id),this.probeId].filter(Boolean))}catch{this.compatRuntime=null}this.installPageExec(s)}return s}installPageExec(e){this.pageExec=null;try{const t=Dl(this.pageExecSecret);Wl(e,H.join(this.root,"page-exec-preload.js"),t)&&(this.pageExec=t)}catch{}}dirOf(e){return H.join(this.root,"extensions",e.key)}getManifest(e){const t=`${e.key}@${e.version}`;if(!this.manifestCache.has(t)){let s=null;try{s=Gt(this.dirOf(e))}catch{}this.manifestCache.set(t,s)}return this.manifestCache.get(t)??null}getDisplayName(e){const t=`${e.key}@${e.version}`,s=this.nameCache.get(t);if(s)return s;const i=this.getManifest(e),o=i?String(je(this.dirOf(e),i,i.name,this.locale())||e.name):e.name||"Unnamed extension";return this.nameCache.set(t,o),o}iconFor(e,t){const s=`${e.key}@${e.version}:${t}`;if(!this.iconCache.has(s)){const i=this.getManifest(e);this.iconCache.set(s,i?ma(this.dirOf(e),i,t):null)}return this.iconCache.get(s)??null}popupPageOf(e){return ga(this.getManifest(e))}optionsPageOf(e){return fa(this.getManifest(e))}recordForUrl(e){let t;try{const i=new URL(e);if(i.protocol!=="chrome-extension:")return null;t=i.hostname}catch{return null}const s=this.settings.extensions.find(i=>i.id===t&&i.enabled);if(!s)return null;try{return this.session().extensions.getExtension(s.id)?s:null}catch{return null}}extensionCompatStatus(e){try{return $c(this.dirOf(e))}catch(t){return{applied:!1,error:Ne(t)}}}prepareExtensionFolder(e){return Fc(e,{enabled:this.settings.compatibilityEnabled!==!1,locale:this.locale(),compatSource:H.join(this.root,"compat-api.js"),hostSource:H.join(this.root,"bridge-host.js")})}canActivate(e){return e.enabled&&!!(this.popupPageOf(e)||this.optionsPageOf(e)||this.hasAction(e))}hasAction(e){const t=this.getManifest(e);return!!(t!=null&&t.action||t!=null&&t.browser_action||t!=null&&t.page_action)}popupFor(e,t){var i,o;const s=(o=(i=this.channels)==null?void 0:i.get(e.id))==null?void 0:o.action.resolve(t);return(s==null?void 0:s.popup)!==void 0?s.popup||null:this.popupPageOf(e)}actionView(e,t){var c,l,d,p;const s=this.getDisplayName(e),i=this.getManifest(e),o=(e.enabled?(l=(c=this.channels)==null?void 0:c.get(e.id))==null?void 0:l.action.resolve(t):void 0)??{},a=((d=i==null?void 0:i.action)==null?void 0:d.default_title)??((p=i==null?void 0:i.browser_action)==null?void 0:p.default_title);return{name:s,title:o.title??(typeof a=="string"?je(this.dirOf(e),i,a,this.locale()):s),icon:o.icon??this.iconFor(e,32),badgeText:o.badgeText??"",badgeBackgroundColor:o.badgeBackgroundColor,badgeTextColor:o.badgeTextColor,enabled:o.enabled!==!1}}actionChanged(e){this.actionRefresh===null&&(this.actionRefresh=window.setTimeout(()=>{var t,s;this.actionRefresh=null,(t=this.tracker)==null||t.refreshActionVisuals(),(s=this.activePanel)==null||s.render()},50))}forgetTab(e){var t;for(const s of((t=this.channels)==null?void 0:t.all())??[])s.action.forgetTab(e)}tabFor(e,t,s){if(!e)return null;let i,o="",a="";try{i=e.getWebContentsId(),o=e.getURL(),a=e.getTitle()}catch{return null}return Number.isSafeInteger(i)?Fs(t.capabilities,o)||s&&t.capabilities.activeTab?{id:i,url:o,title:a,active:!0,status:"complete"}:{id:i,active:!0,status:"complete"}:null}pinnedKeys(){return Array.isArray(this.settings.pinned)?this.settings.pinned:this.settings.extensions.filter(e=>this.canActivate(e)).slice(0,la).map(e=>e.key)}pinnedRecords(){return this.pinnedKeys().map(e=>this.settings.extensions.find(t=>t.key===e)).filter(e=>!!e&&this.canActivate(e))}isPinned(e){return this.pinnedRecords().includes(e)}async togglePinned(e){const t=this.pinnedKeys().filter(s=>this.settings.extensions.some(i=>i.key===s));this.settings.pinned=t.includes(e.key)?t.filter(s=>s!==e.key):[...t,e.key],await this.saveSettings(),this.refreshUI()}async resetPinned(){this.settings.pinned=null,await this.saveSettings(),this.refreshUI()}refreshUI(){var e,t;this.manifestCache.clear(),this.nameCache.clear(),this.iconCache.clear(),(e=this.tracker)==null||e.refreshActions(),(t=this.activePanel)==null||t.render(),this.syncChannels(),this.syncCommands();for(const s of this.app.workspace.getLeavesOfType(ct))s.view instanceof Qs&&s.view.refreshIfStale()}openManager(){new Yl(this.app,this).open()}openSettings(){this.host.openSettings()}togglePanel(e,t){var s,i,o;if((s=this.activePanel)!=null&&s.isAnchoredTo(e)){this.activePanel.close();return}(i=this.activePanel)==null||i.close(),(o=this.activePopover)==null||o.close(),this.activePanel=new Jl(this,e,t).open()}panelClosed(e){this.activePanel===e&&(this.activePanel=null)}popoverClosed(e){this.activePopover===e&&(this.activePopover=null)}closePopover(){var e;(e=this.activePopover)==null||e.close()}activateExtension(e,t,s){const i=s??this.activeWebview();let o=null;try{o=(i==null?void 0:i.getWebContentsId())??null}catch{}const a=this.channels.get(e.id);if(!(e.enabled&&(a==null?void 0:a.action.resolve(o).enabled)===!1))if(this.popupFor(e,o))this.openPopup(e,t,s);else if(e.enabled&&this.hasAction(e)&&a){const c=this.tabFor(i,a,!0);c?a.send({type:"action.clicked",tab:c}):de(x("notice.needsWebTab",{name:this.getDisplayName(e)}))}else this.optionsPageOf(e)?this.openOptions(e,t):de(x("notice.noPanel",{name:this.getDisplayName(e)}))}ensureLoaded(e){var t;if(!e.enabled||!this.session().extensions.getExtension(e.id))throw new Error(x("error.notLoaded",{target:((t=this.target)==null?void 0:t.label)??"Web Viewer"}))}openPopup(e,t,s){var i,o,a,c;try{if(t instanceof HTMLElement&&((i=this.activePopover)!=null&&i.isAnchoredTo(t))){this.activePopover.close();return}this.ensureLoaded(e);let l=null;try{l=((o=s??this.activeWebview())==null?void 0:o.getWebContentsId())??null}catch{}const d=this.popupFor(e,l)??this.popupPageOf(e);if(!d)throw new Error(x("error.noPopup"));(a=this.activePanel)==null||a.close(),(c=this.activePopover)==null||c.close(),this.activePopover=new De(this,e,d,t,"popup",s).open()}catch(l){de(Ne(l))}}async openOptions(e,t){var s,i;try{this.ensureLoaded(e);const o=this.getManifest(e),a=this.optionsPageOf(e);if(!a)throw new Error(x("error.noOptions"));const c=o!=null&&o.options_ui?o.options_ui.open_in_tab===!0:!!(o!=null&&o.options_page);return(s=this.activePanel)==null||s.close(),(i=this.activePopover)==null||i.close(),c?await this.openExtensionTab(De.resolveUrl(e.id,a),!0):(this.activePopover=new De(this,e,a,t,"options").open(),null)}catch(o){return de(Ne(o)),null}}async waitForTabId(e){const t=Date.now()+Zl;for(;Date.now()<t;){const s=e.view,i=s.webview??s.containerEl.querySelector("webview");try{const o=i==null?void 0:i.getWebContentsId();if(Number.isSafeInteger(o)&&o>0)return o}catch{}await new Promise(o=>window.setTimeout(o,100))}return null}async openBrowserTab(e,t){if(!this.target)throw new Error(this.unavailableReason());return this.waitForTabId(await this.target.open(e,t))}activeWebview(){var e;return((e=this.tracker)==null?void 0:e.activeWebview())??null}actionAnchor(e,t){var s;return((s=this.tracker)==null?void 0:s.actionAnchor(e,t))??null}async openExtensionTab(e,t){const s=this.app.workspace.getLeaf("tab");return await s.setViewState({type:ct,state:{url:e},active:t}),t&&this.app.workspace.revealLeaf(s),this.waitForTabId(s)}showExtensionMenu(e,t,s,i){const o=new A.Menu,a=(t.currentTarget instanceof HTMLElement?t.currentTarget:null)??new DOMRect(t.clientX,t.clientY,0,0),c=()=>{var d;i==null||i(),(d=this.activePanel)==null||d.render()},l=this.channels.get(e.id);if(e.enabled&&(l!=null&&l.menuItems.length)){let d=null,p="";const u=s??this.activeWebview();try{d=(u==null?void 0:u.getWebContentsId())??null,p=(u==null?void 0:u.getURL())??""}catch{}const g=[],m=(h,b)=>{for(const f of h)g.push({item:f.item,depth:b}),m(f.children,b+1)};m(Sn(l.menuItems,{pageURL:p},!0),0);for(const{item:h,depth:b}of g){if(h.type==="separator"){o.addSeparator();continue}o.addItem(f=>{f.setSection("extension").setTitle("　".repeat(b)+String(h.title??"")).setDisabled(h.enabled===!1).onClick(()=>void l.send({type:"contextMenus.clicked",tabId:d,info:{menuItemId:h.id,editable:!1,pageUrl:p||void 0,...h.type==="checkbox"||h.type==="radio"?{wasChecked:!!h.checked,checked:h.type==="radio"?!0:!h.checked}:{}}})),(h.type==="checkbox"||h.type==="radio")&&f.setChecked(!!h.checked)})}}if(e.enabled&&this.popupPageOf(e)&&o.addItem(d=>d.setSection("open").setTitle(x("menu.openPanel")).setIcon("panel-top-open").onClick(()=>this.openPopup(e,a,s))),e.enabled&&this.optionsPageOf(e)&&o.addItem(d=>d.setSection("open").setTitle(x("menu.options")).setIcon("settings").onClick(()=>void this.openOptions(e,a))),e.enabled&&this.canActivate(e)){const d=this.isPinned(e);o.addItem(p=>p.setSection("manage").setTitle(x(d?"menu.unpin":"menu.pin")).setIcon(d?"pin-off":"pin").onClick(async()=>{await this.togglePinned(e),c()}))}if(o.addItem(d=>d.setSection("manage").setTitle(e.enabled?x("menu.disable"):x("menu.enable")).setIcon(e.enabled?"power-off":"power").onClick(()=>this.withNotice(async()=>{await this.toggle(e.key),c()}))),e.source==="store"&&e.storeId){const d=e.storeId;o.addItem(p=>p.setSection("manage").setTitle(x("menu.checkUpdate")).setIcon("refresh-cw").onClick(()=>void this.installFromStore(d).then(c))),o.addItem(p=>p.setSection("manage").setTitle(x("menu.viewInStore")).setIcon("external-link").onClick(()=>void this.openBrowserTab(`${Cs}detail/${d}`,!0)))}this.settings.debug&&e.enabled&&o.addItem(d=>d.setSection("debug").setTitle(x("menu.diagnoseWorker")).setIcon("bug").onClick(async()=>{try{new A.Notice(x("notice.diagnosticsLogged"))}catch(p){de(Ne(p))}})),o.addItem(d=>d.setSection("danger").setTitle(x("menu.uninstall")).setIcon("trash-2").setWarning(!0).onClick(async()=>{const p=this.getDisplayName(e);await new Xl(this.app,x("uninstall.title",{name:p}),x("uninstall.message"),x("uninstall.confirm"),!0).openAndWait()&&await this.withNotice(async()=>{await this.uninstall(e.key),c()})})),o.showAtMouseEvent(t)}debug(){return!!this.settings.debug}syncChannels(){if(!this.channels)return;let e=null;try{this.target&&this.remote&&(e=this.session())}catch{}if(!e||this.settings.compatibilityEnabled===!1){this.channels.sync([]);return}const t=[];for(const s of this.settings.extensions)!s.enabled||!e.extensions.getExtension(s.id)||this.extensionCompatStatus(s).hostPage&&t.push({id:s.id,name:this.getDisplayName(s),capabilities:Yc(this.getManifest(s))});this.channels.sync(t)}async wakeWorker(e){var i,o;const t=this.settings.extensions.find(a=>a.id===e);if(!t||!((o=(i=this.getManifest(t))==null?void 0:i.background)!=null&&o.service_worker))return;const s=this.session().serviceWorkers;typeof(s==null?void 0:s.startWorkerForScope)=="function"&&await s.startWorkerForScope(`chrome-extension://${e}/`)}menusChanged(){}syncCommands(){const e=this.internals.commands;if(!e)return;const t=new Map;for(const s of this.settings.extensions){const i=s.enabled?this.getManifest(s):null,o=i==null?void 0:i.commands;if(!i||!o||typeof o!="object")continue;const a=this.getDisplayName(s);for(const[c,l]of Object.entries(o).slice(0,50)){if(!/^[\w.-]{1,64}$/.test(c))continue;const d=l==null?void 0:l.description,p=typeof d=="string"?String(je(this.dirOf(s),i,d,this.locale())):"",u=c==="_execute_action"||c==="_execute_browser_action"?x("menu.openPanel"):p||c;t.set(`${ri}${s.key}:${c}`,{rec:s,name:c,label:`${a}: ${u}`})}}for(const s of[...this.extensionCommands])t.has(s)||(e.removeCommand(`${this.host.plugin.manifest.id}:${s}`),this.extensionCommands.delete(s));for(const[s,{rec:i,name:o,label:a}]of t){if(this.extensionCommands.has(s))continue;const c=i.key;this.host.plugin.addCommand({id:s,name:a,callback:()=>this.runExtensionCommand(c,o)}),this.extensionCommands.add(s)}}runExtensionCommand(e,t){const s=this.settings.extensions.find(a=>a.key===e&&a.enabled);if(!s)return;const i=this.activeWebview();if(t==="_execute_action"||t==="_execute_browser_action"){this.activateExtension(s,this.actionAnchor(s.id,i),i);return}const o=this.channels.get(s.id);if(!o){de(x("notice.notConnected",{name:this.getDisplayName(s)}));return}o.send({type:"commands.command",command:t,tab:this.tabFor(i,o,!0)})}commandShortcuts(e){const t=this.settings.extensions.find(a=>a.id===e.id),s=this.internals.hotkeyManager,i={};if(!t||!s)return i;const o=`${ri}${t.key}:`;for(const a of this.extensionCommands){if(!a.startsWith(o))continue;const c=`${this.host.plugin.manifest.id}:${a}`,l=(s.getHotkeys(c)??s.getDefaultHotkeys(c)??[])[0];if(!l)continue;const d=l.modifiers.map(p=>p==="Mod"?process.platform==="darwin"?"Command":"Ctrl":p==="Meta"?"Command":p);i[a.slice(o.length)]=[...d,l.key.toUpperCase()].join("+")}return i}cookieListenersChanged(){var t;const e=((t=this.channels)==null?void 0:t.all().some(s=>s.cookieListeners))??!1;if(e&&!this.cookieWatch){let s;try{s=this.session().cookies}catch{return}const i=(o,a,c,l)=>{const d=jt(a);for(const p of this.channels.all())!p.cookieListeners||!$n(p.capabilities,d)||p.send({type:"cookies.changed",info:{cookie:d,cause:String(c),removed:!!l}},!1)};s.on("changed",i),this.cookieWatch={cookies:s,listener:i}}else e||this.unwatchCookies()}unwatchCookies(){if(this.cookieWatch){try{this.cookieWatch.cookies.removeListener("changed",this.cookieWatch.listener)}catch{}this.cookieWatch=null}}wantsNavigation(){var e;return((e=this.channels)==null?void 0:e.all().some(t=>t.capabilities.webNavigation&&(t.navigationListeners===null||t.navigationListeners.size>0)))??!1}deliverNavigation(e,t){for(const s of this.channels.all())s.capabilities.webNavigation&&(s.navigationListeners&&!s.navigationListeners.has(e)||s.send({type:"webNavigation.event",event:e,details:t}))}netRequestDecision(e,t){let s=null;for(const i of[...this.channels.all()].reverse()){if(!i.netRules.length)continue;const o=Hl(i.netRules,{url:e,tabId:t,method:"get"},i.id,a=>Kc(i.capabilities,a,e));if(o&&!(o.kind==="redirect"&&!Zc(o.url,i.id))){if(o.kind==="block")return{decision:o,extension:i.name};o.kind==="redirect"&&!s&&(s={decision:o,extension:i.name})}}return s}notifyBlocked(e,t){let s=t;try{s=new URL(t).host}catch{}de(x("notice.blockedOpen",{extension:e,host:s}))}wantsTabEvents(){var e;return((e=this.channels)==null?void 0:e.all().some(t=>t.tabListeners===null||t.tabListeners.size>0))??!1}deliverTabEvent(e,t,s={}){for(const i of this.channels.all()){if(i.tabListeners&&!i.tabListeners.has(e))continue;if(Fs(i.capabilities,t.url)){i.send({type:"tabs.event",event:e,tab:t,...s});continue}const{url:o,title:a,favIconUrl:c,...l}=t,d=s.changeInfo&&Object.fromEntries(Object.entries(s.changeInfo).filter(([p])=>p!=="url"&&p!=="title"&&p!=="favIconUrl"));e==="onUpdated"&&d&&!Object.keys(d).length||i.send({type:"tabs.event",event:e,tab:l,...s,...d?{changeInfo:d}:{}})}}menuSources(e){return this.channels.all().filter(t=>t.capabilities.contextMenus&&t.menuItems.length).map(t=>({extensionId:t.id,extensionName:t.name,items:t.menuItems,click:s=>void t.send({type:"contextMenus.clicked",info:s,tabId:e})}))}addPageMenuItems(e,t,s){if(!this.target||this.target.nativePageMenu||!this.channels)return;let i=null;try{i=(s==null?void 0:s.getWebContentsId())??null}catch{}const o=(c,l,d,p)=>{const{item:u}=l;if(u.type==="separator"){c.addSeparator();return}let g=null;c.addItem(m=>{var h;m.setTitle("　".repeat(p)+nr(u,t)).setDisabled(u.enabled===!1),l.children.length?g=((h=m.setSubmenu)==null?void 0:h.call(m))??null:((u.type==="checkbox"||u.type==="radio")&&m.setChecked(!!u.checked),m.onClick(()=>d.click(sr(u,t))))});for(const m of l.children)o(g??c,m,d,g?0:p+1)};let a=!1;for(const c of this.menuSources(i)){const l=Sn(c.items,t);if(l.length){if(a||(e.addSeparator(),a=!0),l.length===1){o(e,l[0],c,0);continue}o(e,{item:{id:`__extension_${c.extensionId}`,title:c.extensionName},children:l},c,0)}}}legacyImport(){var c,l;if(!this.root)return null;const e=(c=this.app.plugins)==null?void 0:c.manifests,t=this.app.vault.adapter;if(!(t instanceof A.FileSystemAdapter))return null;const s=((l=e==null?void 0:e[nn])==null?void 0:l.dir)??H.posix.join(this.app.vault.configDir,"plugins",nn),i=H.join(t.getBasePath(),...s.split("/"));let o;try{o=JSON.parse(j.readFileSync(H.join(i,"data.json"),"utf8"))}catch{return null}const a=(Array.isArray(o.extensions)?o.extensions:[]).filter(d=>d&&typeof d.key=="string"&&/^[a-z0-9_-]{1,64}$/i.test(d.key)&&!this.settings.extensions.some(p=>p.key===d.key)&&j.existsSync(H.join(i,"extensions",d.key,"manifest.json")));return a.length?{dir:i,settings:o,records:a,count:a.length}:null}async importLegacy(){if(this.legacyPluginEnabled())throw new Error(this.unavailableReason());const e=this.legacyImport();if(e){for(const t of e.records){const s=H.join(this.root,"extensions",t.key);Jt(this.root,s)&&(await j.promises.cp(H.join(e.dir,"extensions",t.key),s,{recursive:!0,errorOnExist:!1,force:!1}),this.settings.extensions.push({...t}))}if(Array.isArray(e.settings.pinned)){const t=e.records.map(s=>s.key);this.settings.pinned=[...this.settings.pinned??[],...e.settings.pinned.filter(s=>t.includes(s))]}await this.saveSettings(),this.target?await this.restore():this.refreshUI(),de(x("notice.imported",{count:e.count}))}}async handleRequest(e,t,s){var o,a,c,l,d,p,u,g,m,h,b;const i=s&&typeof s=="object"?s:{};switch(t){case"webNavigation.getAllFrames":{if(!e.capabilities.webNavigation)throw new Error(x("error.noPermission",{permission:"webNavigation"}));const f=this.guestContents(i.tabId);return f?Il(f):null}case"tabs.open":{const f=typeof i.url=="string"&&i.url.length<=8192?i.url:"",v=i.active!==!1,S=we(i.reason,"tabs.create");let k;try{k=new URL(f)}catch{throw new Error(x("error.invalidUrl"))}const C=Date.now(),O=(this.opened.get(e.id)??[]).filter(I=>C-I<ii.windowMs);if(O.length>=ii.count)throw new Error(x("error.openTooOften"));if(O.push(C),this.opened.set(e.id,O),v&&((o=this.activePopover)==null||o.close(),(a=this.activePanel)==null||a.close()),k.protocol==="chrome-extension:"){if(k.hostname!==e.id)throw new Error(x("error.openOwnPagesOnly"));return{tabId:await this.openExtensionTab(k.href,v)}}if(k.protocol==="http:"||k.protocol==="https:"||k.href==="about:blank")return this.settings.debug,{tabId:await this.openBrowserTab(k.href,v)};throw new Error(x("error.cannotOpenScheme",{protocol:k.protocol}))}case"popup.targetTab":{const f=this.activePopover;return{tabId:f&&f.kind==="popup"&&f.rec.id===e.id?f.targetTab:null}}case"tabs.activeTab":{const f=((c=this.activePopover)==null?void 0:c.kind)==="popup"?this.activePopover.targetTab:null;if(f!==null)return{tabId:f};let v=null;try{v=((l=this.activeWebview())==null?void 0:l.getWebContentsId())??null}catch{}return{tabId:Number.isSafeInteger(v)?v:null}}case"userScripts.syncFiles":case"userScripts.writeFiles":{const f=this.settings.extensions.find(v=>v.id===e.id&&v.enabled);if(!f||!((p=(d=this.getManifest(f))==null?void 0:d.permissions)!=null&&p.includes("userScripts")))throw new Error(x("error.noPermission",{permission:"userScripts"}));return t==="userScripts.syncFiles"?this.syncUserScriptFiles(f,i):this.writeUserScriptFiles(f,i)}case"userScripts.pageExec":{const f=this.settings.extensions.find(v=>v.id===e.id&&v.enabled);if(!f||!((g=(u=this.getManifest(f))==null?void 0:u.permissions)!=null&&g.includes("userScripts")))throw new Error(x("error.noPermission",{permission:"userScripts"}));return{event:this.pageExec}}case"tabs.remove":{const f=(Array.isArray(i.tabIds)?i.tabIds:[]).filter(S=>Number.isSafeInteger(S));let v=0;for(const S of f){const k=this.leafForTab(S,e.id);k&&(k.detach(),v++)}return{removed:v}}case"tabs.activate":{const f=Number.isSafeInteger(i.tabId)?this.leafForTab(i.tabId,e.id):null;return f&&this.app.workspace.setActiveLeaf(f,{focus:!0}),{activated:!!f}}case"action.openPopup":{const f=this.settings.extensions.find(k=>k.id===e.id&&k.enabled),v=this.activeWebview();let S=null;try{S=(v==null?void 0:v.getWebContentsId())??null}catch{}return!f||!this.popupFor(f,S)?{opened:!1}:((m=this.activePopover)==null?void 0:m.rec.id)===f.id&&this.activePopover.isOpen?{opened:!0}:(this.openPopup(f,this.actionAnchor(f.id,v),v),{opened:!!((h=this.activePopover)!=null&&h.isOpen)})}case"notifications.show":case"notifications.clear":case"notifications.getAll":{if(!e.capabilities.notifications)throw new Error(x("error.noPermission",{permission:"notifications"}));if(t==="notifications.getAll")return{ids:this.notifications.ids(e.id)};const f=typeof i.id=="string"&&i.id.length<=500?i.id:null;if(f===null)throw new Error("Invalid notification ID.");return t==="notifications.clear"?{cleared:this.notifications.clear(e.id,f)}:{shown:this.notifications.show(e.id,e.name,f,i.options,i.update===!0)}}case"tabs.history":{const f=i.tabId===null||i.tabId===void 0?this.activeTabId():i.tabId,v=(b=this.guestContents(f))==null?void 0:b.navigationHistory;if(!v)throw new Error(`No tab with id: ${we(f,"none")}.`);const S=i.delta===-1;if(!v||!(S?v.canGoBack():v.canGoForward()))throw new Error("Cannot find a next page in history.");return S?v.goBack():v.goForward(),{moved:!0}}case"tabs.capture":{const f=this.guestContents(this.activeTabId());if(!f)throw new Error("No active web page to capture.");const v=f.getURL(),S=e.capabilities;if(!(S.hosts.includes("<all_urls>")||S.activeTab||Qe(S,v)))throw new Error("Either the '<all_urls>' or 'activeTab' permission is required.");const k=Date.now(),C=(this.captures.get(e.id)??[]).filter(N=>k-N<1e3);if(C.length>=td)throw new Error("This request exceeds the MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND quota.");this.captures.set(e.id,[...C,k]);const O=await f.capturePage();if(i.format==="png")return{dataUrl:O.toDataURL()};const I=typeof i.quality=="number"&&Number.isInteger(i.quality)&&i.quality>=0&&i.quality<=100?i.quality:92;return{dataUrl:"data:image/jpeg;base64,"+O.toJPEG(I).toString("base64")}}case"commands.shortcuts":return this.commandShortcuts(e);case"cookies.get":return El(this.session().cookies,e.capabilities,i);case"cookies.getAll":return xl(this.session().cookies,e.capabilities,i);case"cookies.set":return Sl(this.session().cookies,e.capabilities,i);case"cookies.remove":return Cl(this.session().cookies,e.capabilities,i);case"runtime.openOptionsPage":{const f=this.settings.extensions.find(v=>v.id===e.id);if(!f)throw new Error(x("error.extensionNotFound"));return{tabId:await this.openOptions(f,null)}}default:throw new Error(x("error.unsupportedRequest",{method:String(t)}))}}guestContents(e){var t,s;return typeof e!="number"||!Number.isSafeInteger(e)||!((t=this.tracker)!=null&&t.isBrowserTab(e))?null:((s=this.remote)==null?void 0:s.webContents.fromId(e))??null}activeTabId(){var t,s;const e=((t=this.activePopover)==null?void 0:t.kind)==="popup"?this.activePopover.targetTab:null;if(e!==null)return e;try{const i=(s=this.activeWebview())==null?void 0:s.getWebContentsId();return Number.isSafeInteger(i)?i:null}catch{return null}}leafForTab(e,t){var o;const s=a=>{try{return a==null?void 0:a.getWebContentsId()}catch{return}},i=this.target;for(const a of i?this.app.workspace.getLeavesOfType(i.viewType):[])if(s(i.webviewOf(a.view))===e)return a;for(const a of this.app.workspace.getLeavesOfType(ct)){const c=a.view;if(s(c.webview)===e&&((o=this.recordForUrl(we(c.getState().url)))==null?void 0:o.id)===t)return a}return null}userScriptDir(e){const t=H.join(this.dirOf(e),Xi);if(!Jt(this.root,t))throw new Error(x("error.invalidExtensionDir"));return t}syncUserScriptFiles(e,t){const s=new Set((Array.isArray(t.keep)?t.keep:[]).filter(a=>typeof a=="string"&&si.test(a))),i=this.userScriptDir(e);j.mkdirSync(i,{recursive:!0});const o=new Set;for(const a of j.readdirSync(i)){const c=a.replace(/\.js$/,"");if(a.endsWith(".js")&&s.has(c)){o.add(c);continue}t.prune===!0&&j.rmSync(H.join(i,a),{force:!0})}return{missing:[...s].filter(a=>!o.has(a))}}async writeUserScriptFiles(e,t){const s=this.userScriptDir(e);j.mkdirSync(s,{recursive:!0});let i=0;for(const a of j.readdirSync(s))i+=j.statSync(H.join(s,a)).size;let o=0;for(const a of Array.isArray(t.files)?t.files:[]){const{hash:c,code:l}=a&&typeof a=="object"?a:{};if(typeof c!="string"||!si.test(c)||typeof l!="string")throw new Error(x("error.invalidUserScript"));const d=Buffer.byteLength(l,"utf8");if(d>Ql||i+d>ed)throw new Error(x("error.userScriptTooLarge"));if(Ce.createHash("sha256").update(l,"utf8").digest("hex")!==c)throw new Error(x("error.userScriptChecksum"));await j.promises.writeFile(H.join(s,c+".js"),l,"utf8"),i+=d,o++}return{written:o}}async withNotice(e){try{await e()}catch(t){de(Ne(t),1e4)}}async restore(){if(!this.target||!this.remote)return;const e=this.session();for(const t of this.settings.extensions){if(!t.enabled)continue;const s=this.dirOf(t);try{if(!j.existsSync(H.join(s,"manifest.json")))throw new Error(x("error.extensionDirMissing"));const i=e.extensions.getExtension(t.id),o=this.extensionCompatStatus(t),a=this.settings.compatibilityEnabled!==!1!==o.applied||o.applied&&o.version!==vn;i&&a&&e.extensions.removeExtension(t.id),(!i||a)&&(this.prepareExtensionFolder(s),t.id=(await e.extensions.loadExtension(s)).id),t.name=this.getDisplayName(t)}catch{}}await this.saveSettings(),this.refreshUI()}async setCompatibilityEnabled(e){const t=this.session(),s=this.settings.compatibilityEnabled!==!1;if(this.settings.compatibilityEnabled=!!e,s===!!e)return;const i=[];this.channels.sync([]);for(const o of this.settings.extensions){const a=this.dirOf(o);if(j.existsSync(H.join(a,"manifest.json"))){o.id&&t.extensions.getExtension(o.id)&&t.extensions.removeExtension(o.id);try{this.prepareExtensionFolder(a),o.enabled&&(o.id=(await t.extensions.loadExtension(a)).id)}catch(c){i.push(`${o.name}: ${Ne(c)}`)}}}if(await this.saveSettings(),this.refreshUI(),this.extensionsChanged(i.length?x("changes.compatSwitchedWithErrors"):x("changes.compatSwitched")),i.length)throw new Error(i.join("; "))}extensionsChanged(e){if(this.settings.autoReloadPages){this.reloadGuestPages(),de(x("changes.reloaded",{message:e}));return}if(typeof window.createFragment!="function"){de(x("changes.reloadToApply",{message:e}));return}let t=null;const s=createFragment(i=>{i.createSpan({text:x("changes.reloadToApplyNotice",{message:e})}),i.createEl("button",{cls:"mod-cta chrome-bridge-notice-button",text:x("command.reloadPages")}).addEventListener("click",()=>{this.reloadGuestPages(),t==null||t.hide()})});t=new A.Notice(s,1e4)}reloadGuestPages(){const e=this.target;if(e)for(const t of document.querySelectorAll(e.webviewSelector))try{t.getAttribute("partition")===e.partition&&t.reload()}catch{}}async openStore(){await this.withNotice(()=>this.openBrowserTab(Cs,!0))}askStoreUrl(e){new ti(this.app,x("installUrl.title"),"https://chromewebstore.google.com/detail/…",x("installUrl.desc"),async t=>{await this.withNotice(async()=>{const s=Ji(t)||(bn.test(t)?t:null);if(!s)throw new Error(x("installUrl.invalid"));await this.installFromStore(s),e==null||e()})}).open()}askLocalPath(e){new ti(this.app,x("installLocal.title"),x("installLocal.placeholder"),x("installLocal.desc"),async t=>{await this.withNotice(async()=>{await this.installLocal(t),e==null||e()})}).open()}async installFromStore(e,t={}){if(this.installing.has(e)){de(x("notice.installBusy"));return}this.installing.add(e);try{await this.withNotice(async()=>{var l;if(!bn.test(e))throw new Error(x("error.invalidStoreId"));const s=this.session(),i=((l=/Chrome\/(\d+\.\d+\.\d+\.\d+)/.exec(we(s.getUserAgent())))==null?void 0:l[1])??"142.0.0.0",o=t.backgroundUpdate?null:new A.Notice(x("notice.downloading"),0);let a;try{a=await Yi(Mc(e,i))}finally{o==null||o.hide()}const c=j.mkdtempSync(H.join(es.tmpdir(),"obsidian-crx-"));try{const d=H.join(c,"download.crx");j.writeFileSync(d,a);const p=await Ss({archive:d,directory:H.join(c,"unpacked"),expectedId:e,requirePublisherProof:!0});if(p.derivedId!==e)throw new Error(x("error.signedIdMismatch"));const u=this.settings.extensions.find(h=>h.source==="store"&&h.storeId===e),g=String(je(p.root,p.manifest,p.manifest.name,this.locale()));if(u&&u.version===p.manifest.version&&!t.force){t.backgroundUpdate||de(x("notice.upToDate",{name:g,version:u.version}));return}let m=!0;if(u&&t.backgroundUpdate){const h=this.getManifest(u);h&&JSON.stringify(ln(h))===JSON.stringify(ln(p.manifest))&&(m=!1)}if(m&&!await new ei(this.app,p.manifest,u?x("install.updateTo",{version:p.manifest.version}):x("source.store"),g).openAndWait())return;await this.installPrepared(p.root,p.manifest,{key:e,source:"store",storeId:e,expectedId:e,previous:u}),this.extensionsChanged(u?x("changes.updated",{name:g}):x("changes.added",{name:g}))}finally{j.rmSync(c,{recursive:!0,force:!0})}})}finally{this.installing.delete(e)}}async installLocal(e){const t=H.resolve(e.replace(/^"|"$/g,""));if(!j.existsSync(t))throw new Error(x("error.pathNotFound",{path:t}));let s=null,i;try{if(j.statSync(t).isDirectory())await nd(t),i=t;else{if(!/\.(zip|crx)$/i.test(t))throw new Error(x("error.unsupportedArchive"));s=j.mkdtempSync(H.join(es.tmpdir(),"obsidian-extension-local-")),i=(await Ss({archive:t,directory:H.join(s,"unpacked"),expectedId:null})).root}const o=Gt(i),a=String(je(i,o,o.name,this.locale()));if(!await new ei(this.app,o,x("install.localSource",{path:t}),a).openAndWait())return;await this.installPrepared(i,o,{source:"local",key:Ce.randomUUID()}),this.extensionsChanged(x("changes.added",{name:a}))}finally{s&&j.rmSync(s,{recursive:!0,force:!0})}}async installPrepared(e,t,s){const i=this.session(),o=s.key;if(!/^[a-z0-9_-]{1,64}$/i.test(o))throw new Error(x("error.invalidManagedKey"));const a=H.join(this.root,"extensions",o),c=a+".backup-"+Ce.randomUUID(),l=s.previous||null,d=l?i.extensions.getExtension(l.id):null;let p=!1,u=null;try{if(d&&i.extensions.removeExtension(l.id),j.existsSync(a)&&(await j.promises.rename(a,c),p=!0),await j.promises.cp(e,a,{recursive:!0,errorOnExist:!0,force:!1}),Gt(a),this.prepareExtensionFolder(a),u=await i.extensions.loadExtension(a),s.expectedId&&u.id!==s.expectedId)throw new Error(x("error.loadedIdMismatch",{loaded:u.id,expected:s.expectedId}));const g={key:o,source:s.source,storeId:s.storeId||null,id:u.id,name:String(je(a,t,t.name,this.locale())),version:t.version,enabled:!0,installedAt:new Date().toISOString()};l?Object.assign(l,g):this.settings.extensions.push(g),await this.saveSettings(),p&&await j.promises.rm(c,{recursive:!0,force:!0}),this.refreshUI()}catch(g){if(u&&i.extensions.getExtension(u.id)&&i.extensions.removeExtension(u.id),j.existsSync(a)&&await j.promises.rm(a,{recursive:!0,force:!0}),p&&j.existsSync(c)&&(await j.promises.rename(c,a),l!=null&&l.enabled))try{await i.extensions.loadExtension(a)}catch{}throw g}}async toggle(e){const t=this.settings.extensions.find(i=>i.key===e);if(!t)throw new Error(x("error.extensionNotFound"));const s=this.session();if(t.enabled)s.extensions.getExtension(t.id)&&s.extensions.removeExtension(t.id),this.notifications.forget(t.id),t.enabled=!1;else{const i=this.dirOf(t);this.prepareExtensionFolder(i),t.id=(await s.extensions.loadExtension(i)).id,t.enabled=!0}await this.saveSettings(),this.refreshUI(),this.extensionsChanged(x(t.enabled?"changes.enabled":"changes.disabled",{name:this.getDisplayName(t)}))}async uninstall(e){const t=this.settings.extensions.findIndex(c=>c.key===e);if(t<0)return;const s=this.settings.extensions[t],i=this.session();i.extensions.getExtension(s.id)&&i.extensions.removeExtension(s.id),this.notifications.forget(s.id);const o=this.dirOf(s);if(!Jt(this.root,o))throw new Error(x("error.refuseDeleteOutside"));const a=this.getDisplayName(s);await j.promises.rm(o,{recursive:!0,force:!0}),this.settings.extensions.splice(t,1),Array.isArray(this.settings.pinned)&&(this.settings.pinned=this.settings.pinned.filter(c=>c!==e)),await this.saveSettings(),this.refreshUI(),this.extensionsChanged(x("changes.uninstalled",{name:a}))}async checkUpdates(e=!1){const t=this.settings.extensions.filter(s=>s.enabled&&s.source==="store"&&s.storeId);if(!t.length){e||de(x("notice.noStoreExtensions"));return}for(const s of t)try{await this.installFromStore(s.storeId,{backgroundUpdate:!0})}catch{}e||de(x("notice.updateCheckDone"))}async runProbe(e=null){var a;const t=this.session(),s=H.join(this.root,"compat-probe");if(!j.existsSync(H.join(s,"manifest.json")))throw new Error(x("error.probeMissing"));let i=t.extensions.getAllExtensions().find(c=>c.name==="Bridge MV3 Probe");i||(i=await t.extensions.loadExtension(s)),this.probeId=i.id;const o={key:"__probe__",source:"local",storeId:null,id:i.id,name:x("settings.probe"),version:"0",enabled:!0};(a=this.activePopover)==null||a.close(),this.activePopover=new De(this,o,"popup.html",e).open()}async startExtensionWorker(e){if(this.session(),!this.compatRuntime)throw new Error(x("error.workerRuntimeUnavailable"));return await this.compatRuntime.start(e)}async diagnose(){var s;const e=this.session(),t=Object.values(e.serviceWorkers.getAllRunning());return{surfingVersion:this.host.plugin.manifest.version,state:this.state,browser:((s=this.target)==null?void 0:s.label)??null,electron:process.versions.electron,partition:this.partition(),compatibilityEnabled:this.settings.compatibilityEnabled!==!1,tabs:this.target?document.querySelectorAll(this.target.webviewSelector).length:0,extensions:this.settings.extensions.map(i=>{var a;const o=this.channels.get(i.id);return{name:this.getDisplayName(i),id:i.id,version:i.version,enabled:i.enabled,loaded:!!e.extensions.getExtension(i.id),worker:t.filter(c=>c.scope.startsWith(`chrome-extension://${i.id}/`)),wrapper:this.extensionCompatStatus(i),compat:((a=this.compatRuntime)==null?void 0:a.latestCompatReport(i.id))??null,channel:o?{capabilities:o.capabilities,navigationListeners:o.navigationListeners?[...o.navigationListeners]:null,contextMenuItems:o.menuItems.length}:null}})}}}class od extends A.Modal{constructor(e,t,s,i){super(e);y(this,"answered",!1);this.host=t,this.clientName=s,this.onAnswer=i}answer(e){this.answered||(this.answered=!0,this.onAnswer(e),this.close())}onOpen(){this.setTitle(E("An AI agent wants to use a site")),this.contentEl.createEl("p",{text:E("{client} wants to read and control {host} in Surfing.").replace("{client}",this.clientName).replace("{host}",this.host)});const e=this.contentEl.createDiv({cls:"modal-button-container"}),t=e.createEl("button",{text:E("Allow this time"),cls:"mod-cta"});t.addEventListener("click",()=>this.answer("once")),e.createEl("button",{text:E("Always allow {host}").replace("{host}",this.host)}).addEventListener("click",()=>this.answer("always")),e.createEl("button",{text:E("Deny"),cls:"mod-warning"}).addEventListener("click",()=>this.answer("deny")),t.focus()}onClose(){this.contentEl.empty(),this.answer("deny")}}function ad(r,n,e,t){return new Promise(s=>{const i=new od(r,n,e,s);t.addEventListener("abort",()=>i.close(),{once:!0}),i.open()})}function me(r){try{const n=new URL(r);return n.protocol!=="http:"&&n.protocol!=="https:"?"":n.hostname.toLowerCase().replace(/\.$/,"")}catch{return""}}function Hn(r){let n=r.trim().toLowerCase();if(!n)return"";if(n.includes("://")){const e=me(n);if(e)return e;n=n.replace(/^[a-z][a-z0-9+.-]*:\/\//,"")}return n=n.replace(/[/?#].*$/,"").replace(/:\d+$/,""),n.replace(/\.$/,"")}function cd(r,n){const e=Hn(n);if(!r||!e)return!1;if(e.startsWith("*.")){const t=e.slice(2);return!!t&&(r===t||r.endsWith("."+t))}return r===e}function Pt(r,n){return r?n.some(e=>{const t=Hn(e);if(!t)return!1;const s=t.startsWith("*.")?t.slice(2):t;return!!s&&(r===s||r.endsWith("."+s))}):!1}function ld(r,n){return n.some(e=>cd(r,e))}function oi(r,n,e){return r?Pt(r,n.blockedSites)?"blocked":e.revoked.has(r)?"ask":n.siteAccess==="allow"||e.approved.has(r)||ld(r,n.approvedSites)?"allowed":"ask":"allowed"}function ai(r){const n=r.trim();if(!n)return null;const e=/^[a-z][a-z0-9+.-]*:/i.test(n)&&!/^[^/]*:\d+(\/|$)/.test(n)?n:"https://"+n;try{const t=new URL(e);return t.protocol!=="http:"&&t.protocol!=="https:"?null:t.href}catch{return null}}const ue={type:"integer",description:"Tab to act on (from tabs_list). Omit to use the tab the user was last on."},qe={type:"string",description:'Element ref from read_page or find, like "e12".'};function ae(r,n,e={},t=[]){return{name:r,description:n,inputSchema:{type:"object",properties:e,...t.length?{required:t}:{},additionalProperties:!1}}}const In="javascript",ci=[ae("tabs_list","List the web tabs open in Obsidian (Surfing and Web Viewer): tabId, title, url, which browser, and whether it is the active tab."),ae("tabs_create","Open a URL in a new tab (Web Viewer while that core plugin is on, otherwise Surfing). Returns the new tabId once the page has started loading.",{url:{type:"string",description:"http(s) URL to open."},active:{type:"boolean",description:"Bring the tab to the front. Default true."}},["url"]),ae("tabs_activate","Bring a tab to the front.",{tabId:ue},["tabId"]),ae("tabs_close","Close a tab.",{tabId:ue},["tabId"]),ae("navigate",'Navigate a tab to a URL, or go "back", "forward" or "reload". Waits for the page to load and returns the final url and title.',{tabId:ue,url:{type:"string",description:'http(s) URL, or one of "back", "forward", "reload".'}},["url"]),ae("read_page",'Snapshot of the page: one line per element as [ref] role "name" (state) @x,y,w,h in document order, plus url, title, scroll position and viewport size. Use the refs with click, type, scroll, form_input, screenshot and wait_for. Refs stay valid until the next read_page of this tab or a navigation.',{tabId:ue,filter:{type:"string",enum:["interactive","all"],description:'"interactive" (default): links, buttons, fields and the like. "all": also headings, text blocks, images and landmarks.'},maxElements:{type:"integer",description:"Maximum elements to list. Default 300."}}),ae("find","Find elements by words in their name, text, placeholder or role. Returns up to 20 matches as read_page lines, with usable refs.",{tabId:ue,query:{type:"string",description:'What to look for, e.g. "search box" or "sign in button".'}},["query"]),ae("get_page_text","The main content of the page as Markdown (articles, docs), falling back to the visible text.",{tabId:ue,maxLength:{type:"integer",description:"Truncate to this many characters. Default 20000."}}),ae("click","Click an element by ref, or a point by viewport coordinates, with real (trusted) mouse input.",{tabId:ue,ref:qe,x:{type:"number",description:"Viewport x in CSS pixels (when no ref)."},y:{type:"number",description:"Viewport y in CSS pixels (when no ref)."},button:{type:"string",enum:["left","right","middle"],description:"Default left."},clickCount:{type:"integer",description:"2 for a double click. Default 1."},modifiers:{type:"array",items:{type:"string",enum:["shift","ctrl","alt","meta"]},description:"Keys held during the click."}}),ae("type","Type text into the focused element, or into the element with the given ref (it is clicked first), with real input events.",{tabId:ue,ref:qe,text:{type:"string",description:"Text to insert."},submit:{type:"boolean",description:"Press Enter afterwards. Default false."}},["text"]),ae("key",'Press keys. A space-separated sequence, e.g. "Enter", "Escape", "Tab", "ctrl+a", "shift+Tab", "ArrowDown ArrowDown Enter".',{tabId:ue,keys:{type:"string",description:"Key or keys to press."}},["keys"]),ae("scroll","Scroll an element into view (ref), or scroll the page with the mouse wheel. Returns the new scroll position.",{tabId:ue,ref:qe,direction:{type:"string",enum:["up","down","left","right"],description:"Default down."},amount:{type:"number",description:"Wheel ticks (about 100 px each). Default 3."}}),ae("form_input","Set the value of a form control by ref: text for inputs and textareas, a value or visible text for selects, true/false for checkboxes and radio buttons. Fires input and change events.",{tabId:ue,ref:qe,value:{type:["string","boolean","number"],description:"The value to set."}},["ref","value"]),ae("screenshot","Capture the page (or one element by ref) as an image, scaled so the longer side is at most 1280 px.",{tabId:ue,ref:qe,fullPage:{type:"boolean",description:"Capture the whole scrollable page. Default false."}}),ae("wait_for","Wait until text appears on the page, an element (ref) is attached and visible, or the URL contains a string.",{tabId:ue,text:{type:"string",description:"Text to wait for."},ref:qe,urlIncludes:{type:"string",description:"Substring the URL must contain."},timeoutMs:{type:"integer",description:"Default 10000, at most 60000."}}),ae(In,'Run JavaScript in the page and return the JSON of the result. Only available when the user has enabled "Allow running JavaScript in pages".',{tabId:ue,code:{type:"string",description:"Code to run; the value of the last expression is returned."}},["code"]),ae("console_messages","Console messages the page has logged (the last 200 per tab).",{tabId:ue,level:{type:"string",enum:["verbose","info","warning","error"],description:"Only messages at this level or more severe."},pattern:{type:"string",description:"Only messages containing this text (case-insensitive)."},clear:{type:"boolean",description:"Clear the buffer after reading."}})],dd=new Set(["tabs_list","tabs_create","tabs_activate","tabs_close"]),ur="webviewer",ud=["verbose","info","warning","error"],li=200;function xe(r){return new Promise(n=>window.setTimeout(n,r))}function hd(r){const n=r.getViewType();if(n===ur){const t=r.webview??r.containerEl.querySelector("webview");return t?{kind:"webviewer",webview:t}:null}if(n===gt){const e=r.webviewEl;return e?{kind:"surfing",webview:e}:null}return null}function pd(r){const n=r.view.getViewType();return n===ur||n===gt}class gd{constructor(n){y(this,"consoles",new WeakMap);y(this,"lastLeaf",null);this.app=n}noteActiveLeaf(n){n&&pd(n)&&(this.lastLeaf=new WeakRef(n))}trackConsole(n){let e=this.consoles.get(n);if(e)return e;const t=[];return e=t,this.consoles.set(n,t),n.addEventListener("did-navigate",()=>{t.length=0}),n.addEventListener("console-message",s=>{t.push({level:ud[s.level]??"info",text:String(s.message).slice(0,2e3),source:s.sourceId?`${s.sourceId}:${s.line}`:"",time:Date.now()}),t.length>li&&t.splice(0,t.length-li)}),t}consoleOf(n){return this.trackConsole(n.webview)}list(){const n=[];return this.app.workspace.iterateAllLeaves(e=>{const t=this.tabOfLeaf(e);t&&n.push(t)}),n}tabOfLeaf(n){if(n.isDeferred)return null;const e=hd(n.view);if(!e)return null;let t;try{t=e.webview.getWebContentsId()}catch{return null}return this.trackConsole(e.webview),{id:t,kind:e.kind,leaf:n,view:n.view,webview:e.webview}}get(n){return this.list().find(e=>e.id===n)??null}resolve(n){var o;const e=this.list();if(n!==void 0){const a=e.find(c=>c.id===n);if(!a)throw new Error(`No web tab with tabId ${n}. Call tabs_list.`);return a}if(e.length===0)throw new Error("No web tabs are open. Use tabs_create to open one.");const t=(o=this.lastLeaf)==null?void 0:o.deref(),s=t?e.find(a=>a.leaf===t):void 0;if(s)return s;const i=this.app.workspace.getMostRecentLeaf();return e.find(a=>a.leaf===i)??e.find(a=>a.webview.clientWidth>0)??e[0]}isActive(n){return this.app.workspace.getMostRecentLeaf()===n.leaf||n.webview.clientWidth>0}webContents(n){const e=ne.remote.webContents.fromId(n.id);if(!e||e.isDestroyed())throw new Error("The tab's page is gone. Call tabs_list.");return e}async ensureVisible(n){if(!(n.webview.clientWidth>0&&n.webview.clientHeight>0)){await this.app.workspace.revealLeaf(n.leaf);for(let e=0;e<20&&n.webview.clientWidth===0;e+=1)await xe(50)}}async activate(n){this.app.workspace.setActiveLeaf(n.leaf,{focus:!0}),await this.app.workspace.revealLeaf(n.leaf)}async open(n,e,t){const i=await(jn(this.app)?rr(this.app):or(this.app,{sessionIsolation:t})).open(n,e);await i.loadIfDeferred();let o=null;for(let a=0;a<100&&!o;a+=1)o=this.tabOfLeaf(i),o||await xe(100);if(!o)throw new Error("The new tab did not start in time.");return await fd(o.webview,this.webContents(o),1e4),o}}function fd(r,n,e){return new Promise(t=>{const s=()=>{window.clearTimeout(i),r.removeEventListener("did-navigate",s),r.removeEventListener("did-stop-loading",s),t()},i=window.setTimeout(s,e);r.addEventListener("did-navigate",s),r.addEventListener("did-stop-loading",s),n.getURL()&&!n.isLoading()&&s()})}function di(r,n,e){return new Promise(t=>{let s=n.isLoading();const i=()=>{window.clearTimeout(a),window.clearTimeout(c),r.removeEventListener("did-start-loading",o),r.removeEventListener("did-stop-loading",i),t()},o=()=>{s=!0},a=window.setTimeout(i,e),c=window.setTimeout(()=>{!s&&!n.isLoading()&&i()},500);r.addEventListener("did-start-loading",o),r.addEventListener("did-stop-loading",i)})}const md={shift:"shift",ctrl:"control",control:"control",alt:"alt",option:"alt",opt:"alt",meta:"meta",cmd:"meta",command:"meta",super:"meta",win:"meta"},bd={enter:"Enter",return:"Enter",escape:"Escape",esc:"Escape",tab:"Tab",backspace:"Backspace",delete:"Delete",del:"Delete",insert:"Insert",space:"Space",spacebar:"Space",up:"Up",arrowup:"Up",down:"Down",arrowdown:"Down",left:"Left",arrowleft:"Left",right:"Right",arrowright:"Right",home:"Home",end:"End",pageup:"PageUp",pagedown:"PageDown",plus:"Plus"},vd={Enter:"\r",Tab:"	",Space:" "};function wd(r){const n=r.toLowerCase(),e=bd[n];return e||(/^f([1-9]|1\d|2[0-4])$/.test(n)?n.toUpperCase():[...r].length===1?r:null)}function yd(r){let n,e;if(r==="+")n="+",e=[];else if(r.endsWith("++"))n="+",e=r.slice(0,-2).split("+");else{const a=r.split("+");n=a.pop()??"",e=a}if(!n)throw new Error(`Empty key in "${r}".`);const t=[];for(const a of e){const c=md[a.toLowerCase()];if(!c)throw new Error(`Unknown modifier "${a}" in "${r}".`);t.includes(c)||t.push(c)}const s=wd(n);if(!s)throw new Error(`Unknown key "${n}" in "${r}".`);const i=[{type:"keyDown",keyCode:s,modifiers:t}];if(!t.some(a=>a==="control"||a==="alt"||a==="meta")){let a=vd[s]??([...s].length===1?s:null);a!==null&&t.includes("shift")&&(a=a.toUpperCase()),a!==null&&i.push({type:"char",keyCode:a,modifiers:t})}return i.push({type:"keyUp",keyCode:s,modifiers:t}),{label:r,events:i}}function kd(r){const n=r.trim().split(/\s+/).filter(Boolean);if(n.length===0)throw new Error("No keys given.");if(n.length>100)throw new Error("Too many keys in one call (limit 100).");return n.map(yd)}const Ed="__surfingMcp";function xd(){const r=globalThis;if(r.__surfingMcp)return;let n=new Map,e=new WeakMap,t=0;const s=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","HEAD","META","LINK","TITLE","BASE"]),i=new Set(["button","link","checkbox","menuitem","menuitemcheckbox","menuitemradio","tab","option","switch","textbox","combobox","searchbox","radio","slider","spinbutton","treeitem"]),o=new Set(["NAV","MAIN","HEADER","FOOTER","ASIDE","FORM","TABLE","UL","OL","SECTION","ARTICLE","FIGURE","DIALOG"]),a=new Set(["H1","H2","H3","H4","H5","H6","P","LI","TD","TH","LABEL","LEGEND","CAPTION","FIGCAPTION","BLOCKQUOTE","DT","DD","SUMMARY","PRE","IMG"]),c={A:"link",BUTTON:"button",TEXTAREA:"textbox",IMG:"img",NAV:"navigation",MAIN:"main",HEADER:"banner",FOOTER:"contentinfo",ASIDE:"complementary",FORM:"form",TABLE:"table",UL:"list",OL:"list",LI:"listitem",P:"paragraph",TD:"cell",TH:"columnheader",SECTION:"region",ARTICLE:"article",SUMMARY:"button",LABEL:"label",BLOCKQUOTE:"blockquote",PRE:"code",DT:"term",DD:"definition",FIGURE:"figure",FIGCAPTION:"caption",LEGEND:"legend",CAPTION:"caption",DIALOG:"dialog",H1:"heading",H2:"heading",H3:"heading",H4:"heading",H5:"heading",H6:"heading",VIDEO:"video",AUDIO:"audio"},l=(P,w)=>{const T=P.replace(/\s+/g," ").trim();return T.length>w?T.slice(0,w-1)+"…":T},d=P=>JSON.stringify(P),p=P=>{const w=P.getAttribute("role");if(w)return w.trim().split(/\s+/)[0];const T=P.tagName;if(T==="INPUT"){const L=(P.type||"text").toLowerCase();return L==="checkbox"||L==="radio"?L:L==="button"||L==="submit"||L==="reset"||L==="image"?"button":L==="range"?"slider":L==="number"?"spinbutton":L==="search"?"searchbox":L==="file"?"file input":"textbox"}if(T==="SELECT"){const L=P;return L.multiple||L.size>1?"listbox":"combobox"}return T==="A"?P.hasAttribute("href")?"link":"generic":P.isContentEditable===!0?"textbox":c[T]??"generic"},u=P=>{const w=P.ownerDocument.defaultView;if(!w)return!1;const T=w.getComputedStyle(P);if(T.display==="none"||T.visibility==="hidden"||T.visibility==="collapse")return!1;const L=P.getBoundingClientRect();return!(L.width<=0||L.height<=0||P.closest('[aria-hidden="true"]'))},g=P=>{const w=P.getBoundingClientRect();let T=w.left,L=w.top,_=P.ownerDocument.defaultView;for(;_&&_.frameElement;){const W=_.frameElement,$=W.getBoundingClientRect();T+=$.left+W.clientLeft,L+=$.top+W.clientTop,_=_.parent}return{x:Math.round(T),y:Math.round(L),w:Math.round(w.width),h:Math.round(w.height)}},m=P=>{let w="";for(const T of Array.from(P.childNodes))T.nodeType===3&&(w+=T.textContent??"");return w},h=P=>P.innerText||P.textContent||"",b=P=>{const w=P.getAttribute("aria-labelledby");if(!w)return"";const T=P.ownerDocument;return w.split(/\s+/).map(L=>{const _=T.getElementById(L);return _?h(_):""}).join(" ")},f=(P,w)=>{const T=P.getAttribute("aria-label");if(T&&T.trim())return l(T,80);const L=b(P);if(L.trim())return l(L,80);const _=P.tagName;if(_==="INPUT"||_==="SELECT"||_==="TEXTAREA"){const U=P,G=(U.type||"").toLowerCase();if(_==="INPUT"&&(G==="button"||G==="submit"||G==="reset"))return l(U.value||(G==="submit"?"Submit":G==="reset"?"Reset":""),80);if(_==="INPUT"&&G==="image")return l(U.alt||U.value||"",80);const Q=U.labels?Array.from(U.labels).map(Y=>h(Y)).join(" "):"";return Q.trim()?l(Q,80):U.title?l(U.title,80):l(U.placeholder||U.name||"",80)}if(_==="IMG")return l(P.alt||P.getAttribute("title")||"",80);if(o.has(_))return"";if(w==="generic")return l(m(P),80);const W=h(P);if(W.trim())return l(W,80);const $=P.getAttribute("title");if($)return l($,80);const D=P.querySelector("img[alt], svg title");return D?l(D.getAttribute("alt")||D.textContent||"",80):""},v=(P,w)=>{const T=[],L=P.tagName;if(/^H[1-6]$/.test(L)&&T.push("level "+L[1]),L==="A"){const D=P.href;D&&T.push("href="+l(D,100))}if(L==="INPUT"||L==="TEXTAREA"){const D=P,U=(D.type||"").toLowerCase();if(U==="checkbox"||U==="radio")T.push(D.checked?"checked":"unchecked");else if(U!=="button"&&U!=="submit"&&U!=="reset"&&U!=="image"&&U!=="file"){const G=U==="password"?D.value?"••••":"":D.value;G&&T.push("value="+d(l(G,60))),L==="INPUT"&&U&&U!=="text"&&U!=="textarea"&&T.push("type="+U)}D.required&&T.push("required"),D.readOnly&&T.push("readonly")}else if(L==="SELECT"){const D=P,U=Array.from(D.selectedOptions).map(G=>G.text.trim());U.length&&T.push("value="+d(l(U.join(", "),60))),D.required&&T.push("required")}else if(P.isContentEditable===!0){const D=l(P.innerText||"",60);D&&T.push("value="+d(D))}if(w==="checkbox"||w==="switch"||w==="radio"){const D=P.getAttribute("aria-checked");D&&T.push(D==="true"?"checked":D==="mixed"?"mixed":"unchecked")}const _=P.getAttribute("aria-expanded");return _&&T.push(_==="true"?"expanded":"collapsed"),P.getAttribute("aria-pressed")==="true"&&T.push("pressed"),P.getAttribute("aria-selected")==="true"&&T.push("selected"),(P.disabled||P.getAttribute("aria-disabled")==="true")&&T.push("disabled"),P.ownerDocument.activeElement===P&&T.push("focused"),T},S=P=>{const w=P.tagName;if(w==="A"||w==="AREA")return P.hasAttribute("href");if(w==="BUTTON"||w==="SELECT"||w==="TEXTAREA"||w==="SUMMARY")return!0;if(w==="INPUT")return P.type!=="hidden";if((w==="VIDEO"||w==="AUDIO")&&P.hasAttribute("controls"))return!0;const T=P.getAttribute("role");if(T&&i.has(T.trim().split(/\s+/)[0]))return!0;const L=P.getAttribute("contenteditable");if(L!==null&&L!=="false"||P.hasAttribute("onclick"))return!0;const _=P.getAttribute("tabindex");return _!==null&&parseInt(_,10)>=0},k=P=>{const w=P.tagName;return o.has(w)||a.has(w)||P.hasAttribute("role")?!0:m(P).trim().length>0};let C=0;const O=(P,w)=>{for(const T of Array.from(P.children))if(!s.has(T.tagName)){if(!w(T)||T.shadowRoot&&!O(T.shadowRoot,w))return!1;if(T.tagName==="IFRAME"||T.tagName==="FRAME"){let L=null;try{L=T.contentDocument}catch{L=null}if(L&&L.documentElement){if(!O(L,w))return!1}else C+=1}else if(!O(T,w))return!1}return!0},I=P=>{let w=e.get(P);return w||(t+=1,w="e"+t,e.set(P,w),n.set(w,new WeakRef(P))),w},N=P=>{var T;const w=(T=n.get(P))==null?void 0:T.deref();return w&&w.isConnected?w:null},M=()=>({width:window.innerWidth,height:window.innerHeight}),R=(P,w)=>{const T=g(P),L=f(P,w),_=v(P,w),W=M();(T.x+T.w<=0||T.y+T.h<=0||T.x>=W.width||T.y>=W.height)&&_.push("offscreen");const $=["["+I(P)+"]",w];return L&&$.push(d(L)),_.length&&$.push("("+_.join(", ")+")"),$.push("@"+T.x+","+T.y+","+T.w+","+T.h),$.join(" ")},B=P=>{const w=P.tagName.toLowerCase(),T=P.id?"#"+P.id:"",L=typeof P.className=="string"&&P.className.trim()?"."+P.className.trim().split(/\s+/)[0]:"";return"<"+w+T+L+">"},F=["button","submit","reset","checkbox","radio","image","file","range","color","hidden"],z=P=>{const w=P.tagName;return w==="TEXTAREA"?!0:w==="INPUT"?!F.includes(P.type):P.isContentEditable===!0},V=P=>{if(z(P))return!0;const w=P.getAttribute("role");return w==="textbox"||w==="searchbox"||w==="combobox"?!0:Array.from(P.querySelectorAll("input, textarea, [contenteditable]")).some(z)},J=()=>{const P=document.documentElement;return{x:Math.round(window.scrollX),y:Math.round(window.scrollY),width:P.scrollWidth,height:P.scrollHeight,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}},q={snapshot({filter:P,max:w}){n=new Map,e=new WeakMap,t=0,C=0;const T=[];let L=0;O(document,W=>{const $=S(W);if(!$&&(P!=="all"||!k(W))||!u(W))return!0;const D=p(W);return!$&&D==="generic"&&!m(W).trim()?!0:(L+=1,T.length<w&&T.push(R(W,D)),L<w+2e3)});const _=J();return{url:location.href,title:document.title,scroll:{x:_.x,y:_.y,width:_.width,height:_.height},viewport:M(),lines:T,total:L,crossOriginFrames:C}},find({query:P}){const w=P.toLowerCase().split(/\s+/).filter(Boolean),T=[];return w.length&&O(document,L=>{const _=S(L);if(!_&&!k(L))return!0;const W=p(L),$=f(L,W),D=L,U=[$,W,D.placeholder||"",D.name||"",L.getAttribute("title")||"",L.id||""].join(" ").toLowerCase();let G=0;for(const Q of w)U.includes(Q)&&(G+=1);return G===0||!u(L)?!0:($.toLowerCase().includes(P.toLowerCase())&&(G+=2),_&&(G+=1),G-=Math.min($.length,200)/1e3,T.push({score:G,el:L,role:W}),T.length<3e3)}),T.sort((L,_)=>_.score-L.score),{url:location.href,title:document.title,lines:T.slice(0,20).map(L=>R(L.el,L.role))}},target({ref:P}){const w=N(P);if(!w)return{error:'Unknown or stale ref "'+P+'". Call read_page again.'};w.scrollIntoView({block:"center",inline:"center",behavior:"instant"});const T=g(w),L=M(),_=Math.max(0,T.x),W=Math.max(0,T.y),$=Math.min(L.width,T.x+T.w),D=Math.min(L.height,T.y+T.h);if($<=_||D<=W||T.w<=0||T.h<=0)return{error:"The element is not visible in the viewport (hidden, or zero size)."};const U=Math.round((_+$)/2),G=Math.round((W+D)/2),Q={box:T,cx:U,cy:G,editable:V(w),described:B(w)};if(w.ownerDocument===document){const Y=document.elementFromPoint(U,G);Y&&Y!==w&&!w.contains(Y)&&!Y.contains(w)&&(Q.covered=B(Y))}return Q},focus({ref:P}){var W;let w=null;if(P){if(w=N(P),!w)return{error:'Unknown or stale ref "'+P+'". Call read_page again.',editable:!1,described:""};const $=w.ownerDocument.activeElement;$!==w&&!w.contains($)&&w.focus({preventScroll:!0})}let T=document.activeElement;for(let $=0;$<8&&T;$+=1){const D=T.tagName==="IFRAME"?T.contentDocument:null;if(D!=null&&D.activeElement)T=D.activeElement;else if((W=T.shadowRoot)!=null&&W.activeElement)T=T.shadowRoot.activeElement;else break}const L=T?T.tagName:"";return{editable:!!T&&(L==="TEXTAREA"||L==="INPUT"&&!["button","submit","reset","checkbox","radio","image","file","range","color"].includes(T.type)||T.isContentEditable===!0),described:T?B(T):"nothing"}},setValue({ref:P,value:w}){const T=N(P);if(!T)return{error:'Unknown or stale ref "'+P+'". Call read_page again.'};const L=T.ownerDocument.defaultView;if(!L)return{error:"The element is not in a page."};const _=W=>T.dispatchEvent(new L.Event(W,{bubbles:!0}));if(T instanceof L.HTMLSelectElement){const W=String(w),$=Array.from(T.options),D=$.find(U=>U.value===W)??$.find(U=>U.text.trim()===W.trim())??$.find(U=>U.text.trim().toLowerCase()===W.trim().toLowerCase());return D?(T.value=D.value,_("input"),_("change"),{described:"selected "+d(D.text.trim())}):{error:'No option "'+W+'". Options: '+$.map(U=>d(U.text.trim())).join(", ")}}if(T instanceof L.HTMLInputElement&&(T.type==="checkbox"||T.type==="radio")){const W=w===!0||w==="true";return T.checked!==W&&T.click(),{described:T.type+" is now "+(T.checked?"checked":"unchecked")}}if(T instanceof L.HTMLInputElement||T instanceof L.HTMLTextAreaElement){const W=T instanceof L.HTMLInputElement?L.HTMLInputElement.prototype:L.HTMLTextAreaElement.prototype;return Reflect.set(W,"value",String(w),T)||(T.value=String(w)),_("input"),_("change"),{described:"value set"}}return T instanceof L.HTMLElement&&T.isContentEditable?(T.textContent=String(w),_("input"),{described:"text set"}):{error:"The element is not a form control ("+B(T)+")."}},check({text:P,ref:w}){if(w){const T=N(w);return!!T&&u(T)}if(P){const T=document.body;return(T&&(T.innerText||T.textContent)||"").toLowerCase().includes(P.toLowerCase())}return!1},scrollState:J,scrollRef({ref:P}){const w=N(P);return w?(w.scrollIntoView({block:"center",inline:"center",behavior:"instant"}),{state:J()}):{error:'Unknown or stale ref "'+P+'". Call read_page again.'}},scrollBy({dx:P,dy:w}){return window.scrollBy({left:P,top:w,behavior:"instant"}),J()},content(){const P=document.body;return{url:location.href,title:document.title,html:document.documentElement.outerHTML,text:P&&(P.innerText||P.textContent)||""}}};r.__surfingMcp=q}const Sd=1013,ui=1280,Cd=2600,Td=300*300;async function pe(r,n,e){const t=`(${xd.toString()})();JSON.stringify(globalThis.${Ed}.${n}(${JSON.stringify(e??{})}))`,s=await r.executeJavaScriptInIsolatedWorld(Sd,[{code:t}]);if(typeof s!="string")throw new Error("The page did not answer. It may still be loading.");return JSON.parse(s)}function Id(r,n,e){return pe(r,"snapshot",{filter:n,max:e})}function Ad(r,n){const e=[`url: ${r.url}`,`title: ${r.title}`,`scroll: ${r.scroll.x},${r.scroll.y} of ${r.scroll.width}x${r.scroll.height}`,`viewport: ${r.viewport.width}x${r.viewport.height}`];r.crossOriginFrames>0&&e.push(`note: ${r.crossOriginFrames} cross-origin frame(s) are not readable`);const t=r.lines.length?r.lines:["(no matching elements)"],s=r.total-r.lines.length;return s>0&&t.push(`... ${s} more element(s) not shown (maxElements=${n}); scroll or use find to narrow down.`),e.join(`
`)+`

`+t.join(`
`)}function Ld(r){return pe(r,"content")}function Od(r){try{const n=new DOMParser().parseFromString(r.html,"text/html"),e=n.createElement("base");e.href=r.url,n.head.prepend(e);const s=(new Rn(n,{url:r.url,markdown:!0}).parse().content||"").trim();if(s.length>80&&!s.startsWith("<"))return s}catch{}return r.text.trim()}function Vn(r){const n=r.getZoomFactor();return n>0?n:1}const Md={shift:"shift",ctrl:"control",control:"control",alt:"alt",meta:"meta",cmd:"meta"};function Nd(r){if(!Array.isArray(r))return[];const n=[];for(const e of r){const t=typeof e=="string"?Md[e.toLowerCase()]:void 0;if(!t)throw new Error(`Unknown modifier ${JSON.stringify(e)}. Use shift, ctrl, alt or meta.`);n.includes(t)||n.push(t)}return n}async function hi(r,n,e,t){const s=Vn(r),i=Math.round(n*s),o=Math.round(e*s),{button:a,modifiers:c}=t;r.sendInputEvent({type:"mouseMove",x:i,y:o,modifiers:c}),await xe(15);for(let l=1;l<=t.clickCount;l+=1)r.sendInputEvent({type:"mouseDown",x:i,y:o,button:a,clickCount:l,modifiers:c}),await xe(15),r.sendInputEvent({type:"mouseUp",x:i,y:o,button:a,clickCount:l,modifiers:c}),await xe(15)}async function pi(r,n){const e=kd(n);for(const t of e){for(const s of t.events)r.sendInputEvent(s);await xe(20)}return e.length}async function Pd(r,n){await r.insertText(n)}async function _d(r,n,e){const t=await pe(r,"scrollState"),s=Math.round(Math.max(.1,Math.min(e,100))*100),i=n==="left"?-s:n==="right"?s:0,o=n==="up"?-s:n==="down"?s:0,a=Vn(r),c=Math.round(t.viewportWidth/2*a),l=Math.round(t.viewportHeight/2*a);r.sendInputEvent({type:"mouseWheel",x:c,y:l,deltaX:-i,deltaY:-o,wheelTicksX:-i/100,wheelTicksY:-o/100,canScroll:!0}),await xe(250);let d=await pe(r,"scrollState");return d.x===t.x&&d.y===t.y&&(d=await pe(r,"scrollBy",{dx:i,dy:o})),d}async function sn(r,n){const e=Vn(r),t=n?{x:Math.max(0,Math.round(n.x*e)),y:Math.max(0,Math.round(n.y*e)),width:Math.max(1,Math.round(n.w*e)),height:Math.max(1,Math.round(n.h*e))}:void 0,s=await r.capturePage(t);if(s.isEmpty())throw new Error("The capture came back empty (is the tab visible?).");return hr(s)}function hr(r){const n=r.getSize(),e=Math.max(n.width,n.height);let t=r;if(e>ui){const a=ui/e;t=r.resize({width:Math.max(1,Math.round(n.width*a)),height:Math.max(1,Math.round(n.height*a)),quality:"good"})}const s=t.getSize(),i=s.width*s.height<=Td,o=i?t.toPNG():t.toJPEG(80);return{data:Buffer.from(o).toString("base64"),mimeType:i?"image/png":"image/jpeg",width:s.width,height:s.height}}async function Rd(r){const n=await pe(r,"scrollState"),e=Math.min(Math.max(n.height,n.viewportHeight),Cd),t=Math.max(n.viewportWidth,Math.min(n.width,2*n.viewportWidth)),s=!r.debugger.isAttached();s&&r.debugger.attach("1.3");try{const i=await r.debugger.sendCommand("Page.captureScreenshot",{format:"png",captureBeyondViewport:!0,clip:{x:0,y:0,width:t,height:e,scale:1}}),o=Bd(i)&&typeof i.data=="string"?i.data:"";if(!o)throw new Error("The full-page capture returned nothing.");const a=hr(ne.nativeImage.createFromBuffer(Buffer.from(o,"base64")));return n.height>e&&(a.note=`The page is ${n.height} px tall; captured the first ${e} px. Scroll and take another screenshot for the rest.`),a}finally{s&&r.debugger.isAttached()&&r.debugger.detach()}}function Bd(r){return typeof r=="object"&&r!==null}async function rn(r,n){return pe(r,"target",{ref:n})}const Dd=300,Ud=2e4,Wd=2e4;function oe(r){return{content:[{type:"text",text:r}]}}function se(r){return{isError:!0,content:[{type:"text",text:r}]}}function gi(r){return oe(JSON.stringify(r,null,2))}function he(r,n){const e=r[n];if(e!=null){if(typeof e!="string")throw new Error(`"${n}" must be a string.`);return e}}function He(r,n){const e=he(r,n);if(e===void 0||e==="")throw new Error(`"${n}" is required.`);return e}function lt(r,n){const e=r[n];if(e!=null){if(typeof e!="number"||!Number.isFinite(e))throw new Error(`"${n}" must be a number.`);return e}}function At(r,n,e,t,s){const i=lt(r,n);return i===void 0?s:Math.min(t,Math.max(e,Math.round(i)))}function Lt(r,n,e){const t=r[n];if(t==null)return e;if(typeof t!="boolean")throw new Error(`"${n}" must be true or false.`);return t}function fi(r,n){return r.length>n?r.slice(0,n)+`

[truncated: ${r.length-n} more characters]`:r}function mi(r){return`scroll ${r.x},${r.y} of ${r.width}x${r.height} (viewport ${r.viewportWidth}x${r.viewportHeight})`}class Fd{constructor(n){this.deps=n}tools(){return ci}async callTool(n,e,t){try{if(n===In&&!this.deps.allowScripts())return se(`Running JavaScript in pages is turned off. The user can enable "Allow running JavaScript in pages" in Surfing's MCP settings.`);switch(n){case"tabs_list":return this.tabsList();case"tabs_create":return await this.tabsCreate(e);case"tabs_activate":return await this.tabsActivate(e);case"tabs_close":return this.tabsClose(e);case"navigate":return await this.navigate(e,t);default:return await this.onPage(n,e,t)}}catch(s){return se(s instanceof Error?s.message:String(s))}}tabsList(){const n=this.deps.registry,e=this.deps.getRules().blockedSites,t=n.list().map(s=>{let i="",o="";try{const c=n.webContents(s);i=c.getURL(),o=c.getTitle()}catch{}const a=Pt(me(i),e);return{tabId:s.id,title:a?"(blocked)":o,url:a?"(blocked)":i,browser:s.kind,active:n.isActive(s)}});return t.length?gi(t):oe("No web tabs are open.")}async tabsCreate(n){const e=He(n,"url"),t=ai(e);if(!t)return se(`"${e}" is not an http(s) URL.`);if(Pt(me(t),this.deps.getRules().blockedSites))return se(`${me(t)} is on the blocked sites list in Surfing's MCP settings. Do not retry.`);const s=Lt(n,"active",!0),i=await this.deps.registry.open(t,s,this.deps.sessionIsolation()),o=this.deps.registry.webContents(i).getURL(),a=Pt(me(o),this.deps.getRules().blockedSites)?"(blocked)":o;return gi({tabId:i.id,url:a,browser:i.kind})}async tabsActivate(n){const e=this.deps.registry.resolve(this.tabIdArg(n,!0));return await this.deps.registry.activate(e),oe(`Activated tab ${e.id}.`)}tabsClose(n){const e=this.deps.registry.resolve(this.tabIdArg(n,!0));return this.deps.indicator.unmark(e.leaf),e.leaf.detach(),oe(`Closed tab ${e.id}.`)}tabIdArg(n,e){const t=lt(n,"tabId");if(t===void 0&&e)throw new Error('"tabId" is required.');return t}async navigate(n,e){const t=He(n,"url"),{registry:s}=this.deps,i=s.resolve(this.tabIdArg(n,!1)),o=s.webContents(i),a=o.navigationHistory;let c;const l=t.trim().toLowerCase();if(l==="back"||l==="forward"||l==="reload"){const p=await this.deps.permissions.ensure(me(o.getURL()),e.name);if(!p.ok)return se(p.message);if(l==="back"){if(!a.canGoBack())return se("There is no earlier page in this tab's history.");c=()=>a.goBack()}else if(l==="forward"){if(!a.canGoForward())return se("There is no later page in this tab's history.");c=()=>a.goForward()}else c=()=>o.reload()}else{const p=ai(t);if(!p)return se(`"${t}" is not an http(s) URL (or back, forward, reload).`);const u=await this.deps.permissions.ensure(me(p),e.name);if(!u.ok)return se(u.message);c=()=>i.webview.loadURL(p).catch(()=>{})}this.deps.indicator.mark(i.leaf,me(o.getURL()));const d=di(i.webview,o,15e3);return await c(),await d,oe(await this.locationOf(i,o,e))}async locationOf(n,e,t){const s=e.getURL(),i=me(s),o=await this.deps.permissions.ensure(i,t.name);return o.ok?(this.deps.indicator.mark(n.leaf,i),`url: ${s}
title: ${e.getTitle()}`):`Now at a page on ${i}: ${o.message}`}async pageContext(n,e){const{registry:t,permissions:s,indicator:i}=this.deps,o=t.resolve(this.tabIdArg(n,!1)),a=t.webContents(o);let c=me(a.getURL());for(let l=0;l<3;l+=1){const d=await s.ensure(c,e.name);if(!d.ok)return se(d.message);const p=me(t.webContents(o).getURL());if(p===c)break;if(c=p,l===2)return se("The page keeps navigating; try again once it has settled.")}return i.mark(o.leaf,c),{tab:o,contents:a,host:c}}async stillOn(n,e,t){const s=me(e);if(s===n.host)return null;const i=await this.deps.permissions.ensure(s,t.name);return i.ok?null:se(i.message)}async onPage(n,e,t){if(dd.has(n)||!ci.some(o=>o.name===n))return se(`Unknown tool: ${n}`);const s=await this.pageContext(e,t);if("content"in s)return s;const i=s;switch(n){case"read_page":return this.readPage(i,e,t);case"find":return this.find(i,e,t);case"get_page_text":return this.pageText(i,e,t);case"click":return this.click(i,e,t);case"type":return this.type(i,e,t);case"key":return this.key(i,e,t);case"scroll":return this.scroll(i,e);case"form_input":return this.formInput(i,e);case"screenshot":return this.screenshot(i,e);case"wait_for":return this.waitFor(i,e);case In:return this.script(i,e);case"console_messages":return this.consoleMessages(i,e);default:return se(`Unknown tool: ${n}`)}}async readPage(n,e,t){const s=he(e,"filter")??"interactive";if(s!=="interactive"&&s!=="all")throw new Error('"filter" must be "interactive" or "all".');const i=At(e,"maxElements",1,2e3,Dd),o=await Id(n.contents,s,i),a=await this.stillOn(n,o.url,t);return a||oe(Ad(o,i))}async find(n,e,t){const s=He(e,"query"),i=await pe(n.contents,"find",{query:s}),o=await this.stillOn(n,i.url,t);return o||(i.lines.length===0?oe(`No elements match "${s}". Try read_page.`):oe(i.lines.join(`
`)))}async pageText(n,e,t){const s=At(e,"maxLength",100,5e5,Ud),i=await Ld(n.contents),o=await this.stillOn(n,i.url,t);if(o)return o;const a=Od(i);return oe(`url: ${i.url}
title: ${i.title}

${fi(a,s)}`)}async changes(n,e,t){await xe(300),n.contents.isLoading()&&await di(n.tab.webview,n.contents,8e3);const s=n.contents.getURL();if(s===e)return"";const i=await this.stillOn(n,s,t);return i?` The page moved to another site: ${i.content[0].type==="text"?i.content[0].text:""}`:` The page is now at ${s} ("${n.contents.getTitle()}").`}async click(n,e,t){const s=he(e,"ref"),i=he(e,"button")??"left";if(i!=="left"&&i!=="right"&&i!=="middle")throw new Error('"button" must be left, right or middle.');const o=At(e,"clickCount",1,3,1),a=Nd(e.modifiers);await this.deps.registry.ensureVisible(n.tab);let c,l,d,p="";if(s){const m=await rn(n.contents,s);if(m.error||m.cx===void 0||m.cy===void 0)return se(m.error??"The element cannot be clicked.");c=m.cx,l=m.cy,d=s,m.covered&&(p=` Warning: ${m.covered} was on top of the element at that point, so the click may have hit it instead.`)}else{const m=lt(e,"x"),h=lt(e,"y");if(m===void 0||h===void 0)throw new Error("Give a ref, or both x and y.");c=m,l=h,d="the point"}const u=n.contents.getURL();await hi(n.contents,c,l,{button:i,clickCount:o,modifiers:a});const g=await this.changes(n,u,t);return oe(`Clicked ${d} at ${Math.round(c)},${Math.round(l)}.${p}${g}`)}async type(n,e,t){const s=he(e,"text");if(s===void 0)throw new Error('"text" is required.');const i=he(e,"ref"),o=Lt(e,"submit",!1);if(await this.deps.registry.ensureVisible(n.tab),i){const d=await rn(n.contents,i);if(d.error||d.cx===void 0||d.cy===void 0)return se(d.error??"The element cannot be focused.");if(!d.editable)return se(`${i} is ${d.described??"not a text field"}, not a text field. Pass the ref of an input, textarea or editable element (nothing was clicked).`);await hi(n.contents,d.cx,d.cy,{button:"left",clickCount:1,modifiers:[]})}let a=await pe(n.contents,"focus",i?{ref:i}:{});if(a.error)return se(a.error);if(!a.editable&&i&&(a=await pe(n.contents,"focus",{ref:i})),!a.editable)return se(`Nothing editable has focus (${a.described}). Pass the ref of a text field, or click one first.`);const c=n.contents.getURL();await Pd(n.contents,s),o&&await pi(n.contents,"Enter");const l=o?await this.changes(n,c,t):"";return oe(`Typed ${s.length} character(s) into ${a.described}.${o?" Pressed Enter.":""}${l}`)}async key(n,e,t){const s=He(e,"keys");await this.deps.registry.ensureVisible(n.tab);const i=n.contents.getURL(),o=await pi(n.contents,s),a=await this.changes(n,i,t);return oe(`Pressed ${o} key(s): ${s}.${a}`)}async scroll(n,e){const t=he(e,"ref");if(t){const a=await pe(n.contents,"scrollRef",{ref:t});return a.error||!a.state?se(a.error??"Could not scroll."):oe(`Scrolled ${t} into view; ${mi(a.state)}.`)}const s=he(e,"direction")??"down";if(s!=="up"&&s!=="down"&&s!=="left"&&s!=="right")throw new Error('"direction" must be up, down, left or right.');const i=lt(e,"amount")??3;await this.deps.registry.ensureVisible(n.tab);const o=await _d(n.contents,s,i);return oe(`Scrolled ${s}; ${mi(o)}.`)}async formInput(n,e){const t=He(e,"ref"),s=e.value;if(typeof s!="string"&&typeof s!="boolean"&&typeof s!="number")throw new Error('"value" must be a string, number or boolean.');const i=await pe(n.contents,"setValue",{ref:t,value:s});return i.error?se(i.error):oe(`${t}: ${i.described??"done"}.`)}async screenshot(n,e){const t=he(e,"ref"),s=Lt(e,"fullPage",!1);await this.deps.registry.ensureVisible(n.tab);let i;if(t){const o=await rn(n.contents,t);if(o.error||!o.box)return se(o.error??"The element cannot be captured.");await xe(100),i=await sn(n.contents,o.box)}else if(s)try{i=await Rd(n.contents)}catch{i=await sn(n.contents,null),i.note="Full-page capture is not available for this tab; captured the viewport instead."}else i=await sn(n.contents,null);return{content:[{type:"image",data:i.data,mimeType:i.mimeType},{type:"text",text:`Screenshot ${i.width}x${i.height}${i.note?". "+i.note:""}`}]}}async waitFor(n,e){const t=he(e,"text"),s=he(e,"ref"),i=he(e,"urlIncludes");if(t===void 0&&s===void 0&&i===void 0)throw new Error("Give text, ref or urlIncludes to wait for.");const o=At(e,"timeoutMs",100,6e4,1e4),a=Date.now();for(;Date.now()-a<o;){let c=!0;if(i!==void 0&&!n.contents.getURL().includes(i)&&(c=!1),c&&me(n.contents.getURL())!==n.host)return se("The page moved to another site while waiting; call read_page.");if(c&&t!==void 0&&(c=await pe(n.contents,"check",{text:t})),c&&s!==void 0&&(c=await pe(n.contents,"check",{ref:s})),c)return oe(`Condition met after ${Date.now()-a} ms.`);await xe(250)}return se(`Timed out after ${o} ms.`)}async script(n,e){const t=He(e,"code"),s=await n.contents.executeJavaScript(t,!0);let i;try{i=JSON.stringify(s)??"undefined"}catch{i=String(s)}return oe(fi(i,Wd))}consoleMessages(n,e){var d;const t=["verbose","info","warning","error"],s=he(e,"level");if(s!==void 0&&!t.includes(s))throw new Error('"level" must be verbose, info, warning or error.');const i=(d=he(e,"pattern"))==null?void 0:d.toLowerCase(),o=Lt(e,"clear",!1),a=this.deps.registry.consoleOf(n.tab),c=s?t.indexOf(s):0,l=a.filter(p=>t.indexOf(p.level)>=c).filter(p=>!i||p.text.toLowerCase().includes(i)).map(p=>`[${p.level}] ${p.text}${p.source?"  ("+p.source+")":""}`);return o&&(a.length=0),oe(l.length?l.join(`
`):"No console messages.")}}const bi=1e4,vi="wb-mcp-controlled";class $d{constructor(n){y(this,"markers",new Map);this.onStop=n}mark(n,e){const t=this.markers.get(n);if(t){t.host=e,window.clearTimeout(t.timer),t.timer=window.setTimeout(()=>this.unmark(n),bi);return}const s=n.view.containerEl,i=s.querySelector(".view-actions"),o=s.querySelector(".view-content")??s;if(!i)return;const a=createDiv({cls:"wb-mcp-indicator"});a.setAttribute("aria-label",E("Controlled by an MCP client")),a.createSpan({cls:"wb-mcp-indicator-dot"}),a.createSpan({cls:"wb-mcp-indicator-text",text:E("Agent")});const c={pill:a,content:o,host:e,timer:window.setTimeout(()=>this.unmark(n),bi)};a.addEventListener("click",l=>{const d=new A.Menu;d.addItem(p=>p.setTitle(E("Stop: revoke this site for this session")).setIcon("octagon-x").onClick(()=>{this.onStop(c.host),this.unmark(n)})),d.showAtMouseEvent(l)}),i.prepend(a),o.addClass(vi),this.markers.set(n,c)}unmark(n){const e=this.markers.get(n);e&&(window.clearTimeout(e.timer),e.pill.remove(),e.content.removeClass(vi),this.markers.delete(n))}isMarked(n){return this.markers.has(n)}clear(){for(const n of Array.from(this.markers.keys()))this.unmark(n)}}const jd=6e4,qd=15e3;class Hd{constructor(n,e=jd){y(this,"approved",new Set);y(this,"revoked",new Set);y(this,"pending",new Map);y(this,"deniedUntil",new Map);y(this,"queue",Promise.resolve());this.host=n,this.askTimeoutMs=e}now(){return this.host.now?this.host.now():Date.now()}async ensure(n,e){const t=oi(n,this.host.getRules(),{approved:this.approved,revoked:this.revoked});if(t==="allowed")return{ok:!0};if(t==="blocked")return{ok:!1,message:`${n} is on the blocked sites list in Surfing's MCP settings. Do not retry.`};const s=this.deniedUntil.get(n);if(s!==void 0&&s>this.now())return{ok:!1,message:`The user denied access to ${n}.`};let i=this.pending.get(n);return i||(i=this.enqueue(n,e).finally(()=>this.pending.delete(n)),this.pending.set(n,i)),await i?{ok:!0}:{ok:!1,message:`The user denied access to ${n}.`}}enqueue(n,e){const t=async()=>{const i=oi(n,this.host.getRules(),{approved:this.approved,revoked:this.revoked});if(i==="allowed")return!0;if(i==="blocked")return!1;const o=new AbortController,a=setTimeout(()=>o.abort(),this.askTimeoutMs);let c;try{c=await this.host.ask(n,e,o.signal)}catch{c="deny"}finally{clearTimeout(a)}return o.signal.aborted&&(c="deny"),c==="deny"?(this.deniedUntil.set(n,this.now()+qd),!1):(this.approved.add(n),this.revoked.delete(n),this.deniedUntil.delete(n),c==="always"&&this.host.approveForever(n),!0)},s=this.queue.then(t,t);return this.queue=s.catch(()=>{}),s}revoke(n){n&&(this.approved.delete(n),this.revoked.add(n))}reset(){this.approved.clear(),this.revoked.clear(),this.deniedUntil.clear()}}const Vd=["2025-06-18","2025-03-26","2024-11-05"],zd="2025-06-18",Gd=1024*1024,Jd=100,Yd=-32700,wi=-32600,Xd=-32601,yi=-32602,Kd=-32603,Zd="Controls the web pages open in Obsidian (Surfing and the core Web Viewer). Call tabs_list to see the open tabs; every page tool takes a tabId (omit it to use the tab the user was last on). Call read_page to get the interactive elements as refs like [e12], then pass a ref to click, type, scroll, form_input, screenshot or wait_for. Refs stay valid until the next read_page of that tab or a navigation. Use get_page_text to read an article. Sites may need the user's approval; if access is denied, do not retry.";function _t(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function Qd(r){return _t(r)&&r.jsonrpc==="2.0"&&typeof r.method=="string"&&(r.id===void 0||r.id===null||typeof r.id=="string"||typeof r.id=="number")}function eu(r,n){if(!n)return!1;const e=Buffer.from(r),t=Buffer.from(n);return e.length!==t.length?(ft.timingSafeEqual(t,t),!1):ft.timingSafeEqual(e,t)}function tu(r){if(!r)return"";const n=/^Bearer[ \t]+(.+)$/i.exec(r.trim());return n?n[1].trim():""}function on(){return ft.randomBytes(24).toString("hex")}class nu{constructor(n){y(this,"server",null);y(this,"actualPort",0);y(this,"sessions",new Map);this.options=n}get port(){return this.actualPort}get listening(){var n;return((n=this.server)==null?void 0:n.listening)??!1}start(){return new Promise((n,e)=>{const t=Sr.createServer((s,i)=>{this.handle(s,i).catch(()=>{i.headersSent?i.end():this.sendJson(i,500,{error:"Internal error"})})});t.once("error",e),t.listen(this.options.port,"127.0.0.1",()=>{t.off("error",e);const s=t.address();this.actualPort=typeof s=="object"&&s?s.port:this.options.port,this.server=t,n()})})}stop(){const n=this.server;return this.server=null,this.sessions.clear(),n?new Promise(e=>{n.close(()=>e()),n.closeAllConnections()}):Promise.resolve()}sendJson(n,e,t,s={}){const i=JSON.stringify(t);n.writeHead(e,{"Content-Type":"application/json","Content-Length":Buffer.byteLength(i),"Cache-Control":"no-store",...s}),n.end(i)}hostAllowed(n){if(!n)return!1;const e=n.toLowerCase(),t=this.actualPort;return e===`127.0.0.1:${t}`||e===`localhost:${t}`}async handle(n,e){if(!this.hostAllowed(n.headers.host)){this.sendJson(e,421,{error:"Misdirected request: unexpected Host"});return}if(n.headers.origin!==void 0){this.sendJson(e,403,{error:"Requests with an Origin header are not allowed"});return}if((n.url??"").split("?")[0]!=="/mcp"){this.sendJson(e,404,{error:"Not found"});return}if(!eu(tu(n.headers.authorization),this.options.getToken())){this.sendJson(e,401,{error:"Missing or invalid bearer token"},{"WWW-Authenticate":"Bearer"});return}if(n.method!=="POST"){this.sendJson(e,405,{error:"Use POST"},{Allow:"POST"});return}const s=await this.readBody(n,e);if(s===null)return;let i;try{i=JSON.parse(s)}catch{this.sendJson(e,400,this.error(null,Yd,"Parse error"));return}const o=su(n.headers["mcp-session-id"]),a=o&&this.sessions.get(o)||{name:"An MCP client"},c={};if(Array.isArray(i)){if(i.length===0){this.sendJson(e,400,this.error(null,wi,"Empty batch"));return}const d=[];for(const p of i){const u=await this.handleMessage(p,a,c);u&&d.push(u)}if(d.length===0){e.writeHead(202).end();return}this.sendJson(e,200,d,c);return}const l=await this.handleMessage(i,a,c);if(!l){e.writeHead(202).end();return}this.sendJson(e,200,l,c)}readBody(n,e){return new Promise(t=>{const s=[];let i=0,o=!1;const a=c=>{o||(o=!0,t(c))};n.on("data",c=>{if(i+=c.length,i>Gd){this.sendJson(e,413,{error:"Request body too large"},{Connection:"close"}),n.destroy(),a(null);return}s.push(c)}),n.on("end",()=>a(Buffer.concat(s).toString("utf8"))),n.on("error",()=>a(null))})}error(n,e,t){return{jsonrpc:"2.0",id:n,error:{code:e,message:t}}}async handleMessage(n,e,t){if(!Qd(n))return this.error(null,wi,"Invalid request");const s=n.id===void 0,i=n.id??null,o=_t(n.params)?n.params:{};try{switch(n.method){case"initialize":{const a=o.protocolVersion,c=typeof a=="string"&&Vd.includes(a)?a:zd,l=_t(o.clientInfo)?o.clientInfo:{},d=ft.randomBytes(16).toString("hex");if(this.sessions.size>=Jd)for(const p of this.sessions.keys()){this.sessions.delete(p);break}return this.sessions.set(d,{name:typeof l.name=="string"&&l.name?l.name.slice(0,80):"An MCP client",version:typeof l.version=="string"?l.version.slice(0,40):void 0}),t["Mcp-Session-Id"]=d,{jsonrpc:"2.0",id:i,result:{protocolVersion:c,capabilities:{tools:{}},serverInfo:{name:"surfing",version:this.options.version},instructions:Zd}}}case"ping":return s?void 0:{jsonrpc:"2.0",id:i,result:{}};case"tools/list":return{jsonrpc:"2.0",id:i,result:{tools:this.options.backend.tools()}};case"tools/call":{if(typeof o.name!="string")return this.error(i,yi,"tools/call needs a tool name");const a=_t(o.arguments)?o.arguments:{};if(!this.options.backend.tools().some(l=>l.name===o.name))return this.error(i,yi,`Unknown tool: ${o.name}`);let c;try{c=await this.options.backend.callTool(o.name,a,e)}catch(l){c={isError:!0,content:[{type:"text",text:l instanceof Error?l.message:String(l)}]}}return{jsonrpc:"2.0",id:i,result:c}}default:return n.method.startsWith("notifications/")||s?void 0:this.error(i,Xd,`Method not found: ${n.method}`)}}catch(a){return s?void 0:this.error(i,Kd,a instanceof Error?a.message:"Internal error")}}}function su(r){return Array.isArray(r)?r[0]??"":r??""}const Ot=1024,ki=65535;function Ei(r){if(typeof r!="object"||r===null||!("code"in r))return;const n=r.code;return typeof n=="string"?n:void 0}class iu extends A.Component{constructor(e){super();y(this,"status","off");y(this,"statusDetail","");y(this,"server",null);y(this,"registry");y(this,"indicator");y(this,"permissions");y(this,"handlers");y(this,"chain",Promise.resolve());this.plugin=e;const t=e.app;this.registry=new gd(t),this.permissions=new Hd({getRules:()=>({siteAccess:this.plugin.settings.mcp.siteAccess,approvedSites:this.plugin.settings.mcp.approvedSites,blockedSites:this.plugin.settings.mcp.blockedSites}),approveForever:s=>this.approveSite(s),ask:(s,i,o)=>ad(t,s,i,o)}),this.indicator=new $d(s=>{this.permissions.revoke(s),new A.Notice(E("Revoked {host} for this session.").replace("{host}",s))}),this.handlers=new Fd({registry:this.registry,permissions:this.permissions,indicator:this.indicator,getRules:()=>({siteAccess:this.plugin.settings.mcp.siteAccess,approvedSites:this.plugin.settings.mcp.approvedSites,blockedSites:this.plugin.settings.mcp.blockedSites}),allowScripts:()=>this.plugin.settings.mcp.allowScripts,sessionIsolation:()=>this.plugin.settings.sessionIsolation})}onload(){this.registerEvent(this.plugin.app.workspace.on("active-leaf-change",e=>this.registry.noteActiveLeaf(e))),this.plugin.app.workspace.onLayoutReady(()=>{this.registry.noteActiveLeaf(this.plugin.app.workspace.getMostRecentLeaf()),this.sync()})}onunload(){this.indicator.clear(),this.stopServer()}get url(){return`http://127.0.0.1:${this.plugin.settings.mcp.port}/mcp`}sync(){return this.chain=this.chain.then(()=>this.apply()).catch(()=>{}),this.chain}async apply(){const e=this.plugin.settings.mcp;if(await this.stopServer(),!e.enabled){this.status="off",this.statusDetail="";return}e.token||(e.token=on(),await this.plugin.saveSettings());const t=Math.min(ki,Math.max(Ot,Math.round(e.port)||Ot));try{for(let s=0;;s+=1){const i=new nu({backend:this.handlers,getToken:()=>this.plugin.settings.mcp.token,port:t,version:this.plugin.manifest.version});try{await i.start(),this.server=i;break}catch(o){if(Ei(o)!=="EADDRINUSE"||s>=6)throw o;await xe(300)}}this.status="listening",this.statusDetail=""}catch(s){Ei(s)==="EADDRINUSE"?(this.status="port-in-use",new A.Notice(E("Surfing MCP: port {port} is already in use.").replace("{port}",String(t)))):(this.status="error",this.statusDetail=s instanceof Error?s.message:String(s),new A.Notice(E("Surfing MCP server could not start: {error}").replace("{error}",this.statusDetail)))}}async stopServer(){const e=this.server;this.server=null,e&&await e.stop(),this.permissions.reset()}async setEnabled(e){const t=this.plugin.settings.mcp;t.enabled=e,e&&!t.token&&(t.token=on()),await this.plugin.saveSettings(),await this.sync()}async setPort(e){this.plugin.settings.mcp.port=Math.min(ki,Math.max(Ot,Math.round(e)||Ot)),await this.plugin.saveSettings(),this.plugin.settings.mcp.enabled&&await this.sync()}async regenerateToken(){this.plugin.settings.mcp.token=on(),await this.plugin.saveSettings(),this.plugin.settings.mcp.enabled&&await this.sync()}approveSite(e){var s;const t=this.plugin.settings.mcp.approvedSites;t.some(i=>Hn(i)===e)||t.push(e),this.plugin.saveSettings(),(s=this.plugin.settingsTab)==null||s.refreshSettings()}statusText(){switch(this.status){case"listening":return E("Listening on {url}").replace("{url}",this.url);case"port-in-use":return E("Port in use");case"error":return E("Error: {error}").replace("{error}",this.statusDetail);default:return E("Off")}}snippets(){const{token:e}=this.plugin.settings.mcp,t=this.url;return{claudeCode:`claude mcp add --transport http surfing ${t} --header "Authorization: Bearer ${e}"`,codex:`[mcp_servers.surfing]
url = "${t}"
http_headers = { Authorization = "Bearer ${e}" }`,json:JSON.stringify({mcpServers:{surfing:{type:"http",url:t,headers:{Authorization:`Bearer ${e}`}}}},null,2)}}}function ot(r){return Object.getPrototypeOf(r)}function ru(r){return r.url!==void 0}class ou extends A.Plugin{constructor(){super(...arguments);y(this,"settingsTab");y(this,"adBlockManager");y(this,"elementHidingManager");y(this,"bookmarkCache",[]);y(this,"onLayoutChangeEventRef");y(this,"applyURLDebounceTimer",0);y(this,"urlOpened",!1);y(this,"chromeExtensions",null);y(this,"mcp",null)}async onload(){await this.loadSettings(),this.checkWebBrowser(),A.Platform.isDesktopApp&&this.startChromeExtensions(),A.Platform.isDesktopApp&&(this.mcp=this.addChild(new iu(this))),this.adBlockManager=new lc(this),this.elementHidingManager=new dc(this),await this.adBlockManager.initialize(),await this.elementHidingManager.initialize(),this.settingsTab=new Ma(this.app,this),this.addSettingTab(this.settingsTab),this.registerView(le,e=>new K(e,this)),this.registerView(fn,e=>new Ja(e,this)),this.settings.enableTreeView&&this.registerView(Nt,e=>new ac(e,this));try{this.settings.enableHtmlPreview&&this.registerExtensions(gn,fn)}catch{new A.Notice(`File extensions ${String(gn)} had been registered by other plugin!`)}this.settings.bookmarkManager.openBookMark&&(this.settings.bookmarkManager.bookmarksMigrated||await tc(this),this.bookmarkCache=await ji(this),this.registerBookmarkVaultEvents()),this.openTabTreeView(),this.updateEmptyLeaves(!1),this.registerContextMenu(),this.registerCustomURI(),this.registerCodeBlock(),this.registerHoverPopover(),this.patchMarkdownView(),this.patchWindowOpen(),this.patchMarkdownView(),A.requireApiVersion("1.0.4")&&this.patchEditMode(),this.onLayoutChangeEventRef=this.app.workspace.on("layout-change",()=>{const e=this.app.workspace.getActiveViewOfType(A.ItemView);e&&this.addHeaderAndSearchBar(e)}),this.registerCommands(),this.registerCustomIcon(),this.patchEmptyView(),this.patchMarkdownPreviewRenderer(),this.patchProperty(),A.requireApiVersion("1.1.0")&&this.settings.useWebview&&(this.patchCanvasNode(),this.patchCanvas()),this.registerEmbededHTML(),this.settings.bookmarkManager.openBookMark&&this.registerRibbon()}onunload(){var e;(e=this.adBlockManager)==null||e.destroy(),this.app.workspace.offref(this.onLayoutChangeEventRef),this.updateEmptyLeaves(!0),this.unRegisterEmbededHTML(),A.requireApiVersion("1.1.0")&&this.settings.useWebview&&this.refreshAllRelatedView()}handsLinksToWebViewer(){return jn(this.app)}startChromeExtensions(e=this){this.chromeExtensions=this.addChild(new rd({plugin:e,get settings(){return e.settings.chromeExtensions},save:()=>e.saveSettings(),sessionIsolation:()=>e.settings.sessionIsolation,openSettings:()=>e.openSettings("Extensions")}))}openSettings(e){e&&this.settingsTab.selectTab(e),this.app.setting.open(),this.app.setting.openTabById(this.manifest.id)}openTabTreeView(){this.app.workspace.onLayoutReady(()=>this.onLayoutReady())}onLayoutReady(){var e;this.settings.enableTreeView&&(this.app.workspace.getLeavesOfType(Nt).length||(e=this.app.workspace.getLeftLeaf(!1))==null||e.setViewState({type:Nt}))}registerRibbon(){this.addRibbonIcon("bookmark","Open bookmarks folder",async()=>{var s,i;const e=this.settings.bookmarkManager.bookmarkFolder||"surfing-bookmarks",t=this.app.workspace.getLeavesOfType("file-explorer")[0];t&&(this.app.workspace.revealLeaf(t),(i=(s=t.view)==null?void 0:s.revealInFolder)==null||i.call(s,this.app.vault.getAbstractFileByPath(e)))})}registerBookmarkVaultEvents(){this.registerEvent(this.app.vault.on("create",async e=>{e.path&&st(this,e.path)&&e.path.endsWith(".md")&&window.setTimeout(()=>{(async()=>(await at(this),St(this)))()},200)})),this.registerEvent(this.app.vault.on("modify",async e=>{e.path&&st(this,e.path)&&e.path.endsWith(".md")&&window.setTimeout(()=>{(async()=>(await at(this),St(this)))()},200)})),this.registerEvent(this.app.vault.on("delete",async e=>{e.path&&st(this,e.path)&&e.path.endsWith(".md")&&(await at(this),St(this))})),this.registerEvent(this.app.vault.on("rename",async(e,t)=>{(e.path&&st(this,e.path)&&e.path.endsWith(".md")||t&&st(this,t)&&t.endsWith(".md"))&&window.setTimeout(()=>{(async()=>(await at(this),St(this)))()},200)}))}addHeaderAndSearchBar(e){if(!e||e.getViewType()!="empty"&&e.getViewType()!=="home-tab-view")return;if(!e.titleContainerEl.hasClass("wb-header-bar")){const s=new pn(e.titleContainerEl,this,e);s.onLoad(),this.settings.showSearchBarInPage||s.focus(),s.addOnSearchBarEnterListener(i=>{K.spawnWebBrowserView(this,!1,{url:i})})}if(this.app.plugins.getPlugin("home-tab"))return;this.settings.randomBackground&&e.contentEl.toggleClass("wb-random-background",!0);const t=e.contentEl.children[0].hasClass("empty-state")?e.contentEl.children[0]:null;if(t&&!t.hasClass("wb-page-search-bar")&&this.settings.showSearchBarInPage){const s=t.createDiv({cls:"wb-search-bar-container"});t==null||t.addClass("wb-page-search-bar");const i=new Ka(s,e,this);if(this.settings.lastOpenedFiles&&new cc(this,i.inPageSearchBarContainerEl).onload(),this.settings.useIconList){new Za(t,e,this);const o=t.querySelector(".empty-state-container");o&&o.addClass("wb-empty-actions")}i.focus(),i.addOnSearchBarEnterListener(o=>{o.trim()===""||this.settings.showOtherSearchEngines||K.spawnWebBrowserView(this,!1,{url:o})})}}removeHeaderAndSearchBar(e){var t,s,i,o,a;e&&(e.getViewType()!="empty"&&e.getViewType()!=="home-tab-view"||(e.titleContainerEl.hasClass("wb-header-bar")&&(e.titleContainerEl.empty(),e.titleContainerEl.removeClass("wb-header-bar")),(t=e.contentEl.children[1])!=null&&t.hasClass("surfing-settings-icon")&&((s=e.contentEl.children[1])==null||s.detach()),!this.app.plugins.getPlugin("home-tab")&&e.contentEl.children[0].hasClass("wb-page-search-bar")&&this.settings.showSearchBarInPage&&((i=e.contentEl.children[0].children[1])==null||i.detach(),(o=e.contentEl.children[0].children[1])==null||o.empty(),(a=e.contentEl.children[0].children[1])==null||a.detach(),e.contentEl.children[0].removeClass("wb-page-search-bar"))))}updateEmptyLeaves(e){const t=this.app.workspace.getLeavesOfType("empty"),s=this.app.workspace.getLeavesOfType("home-tab-view");[...t,...s].forEach(o=>{o.view instanceof A.ItemView&&(e||this.addHeaderAndSearchBar(o.view),e&&this.removeHeaderAndSearchBar(o.view))})}registerCustomURI(){this.settings.openInObsidianWeb&&this.registerObsidianProtocolHandler("web-open",async e=>{let t=e.url;t&&(Me(t)!==t&&(t=Me(t).toString().replace(/\s/g,"%20")),this.settings.bookmarkManager.saveBookMark?new au(this.app,t,this).open():K.spawnWebBrowserView(this,!0,{url:t}))})}registerContextMenu(){this.registerEvent(this.app.workspace.on("editor-menu",(e,t,s)=>{if(!t)return;if(t.getSelection().length===0){const o=t.getClickableTokenAt(t.getCursor());o&&o.type==="external-link"&&(e.addItem(a=>{a.setIcon("surfing").setTitle(E("Open With Surfing")).onClick(()=>{K.spawnWebBrowserView(this,!0,{url:o.text})})}).addItem(a=>{a.setIcon("surfing").setTitle(E("Open With External Browser")).onClick(()=>{window.open(o.text,"_blank","external")})}),this.app.plugins.getPlugin("obsidian-hover-editor")&&e.addItem(a=>{a.setIcon("surfing").setTitle("Open with hover editor").onClick(async()=>{const c=this.app.plugins.getPlugin("obsidian-hover-editor");if(!c){new A.Notice("Please install obsidian-hover-editor plugin first");return}const l=await c.spawnPopover(s instanceof A.MarkdownView?s.contentEl:void 0);l&&l.setViewState({type:"surfing-view",active:!0,state:{url:o.text}})})}));return}const i=t.getSelection();e.addItem(o=>{const a=[...Pe,...this.settings.customSearchEngine],c=o.setTitle("Search In Surfing").setIcon("search").setSubmenu();a.forEach(l=>{c.addItem(d=>{d.setIcon("search").setTitle(l.name).onClick(()=>{K.spawnWebBrowserView(this,!0,{url:l.url+i})})})})})}))}registerCommands(){this.addCommand({id:"clear-browsing-data",name:"Clear browsing data",callback:()=>{ne.remote.session.fromPartition(`persist:surfing-vault-${this.app.appId}`).clearStorageData({storages:["cookies","filesystem","indexdb","localstorage","shadercache","serviceworkers","cachestorage"]}).then(()=>{new A.Notice("Browsing data cleared")})}}),this.addCommand({id:"manage-cookies",name:E("Manage Cookies for Current Site"),checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s&&s.currentUrl){if(!t)try{const i=new URL(s.currentUrl).hostname;new uc(this.app,this,i).open()}catch{}return!0}}}),this.addCommand({id:"open-current-url-with-external-browser",name:E("Open Current URL In External Browser"),checkCallback:t=>{var i;const s=this.app.workspace.getActiveViewOfType(K);if(s)return t||window.open((i=s.getState())==null?void 0:i.url,"_blank"),!0}}),this.addCommand({id:"clear-current-page-history",name:E("Clear Current Page History"),checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s)return t||s.clearHistory(),!0}}),this.addCommand({id:"open-inspecter",name:"Open inspecter",checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s)return t||s.openInpecter(),!0}}),this.addCommand({id:"refresh-page",name:E("Refresh Current Page"),checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s)return t||s.refresh(),!0}}),this.addCommand({id:"toggle-same-tab-globally",name:E("Toggle Same Tab In Web Browser"),callback:async()=>{this.settings.openInSameTab=!this.settings.openInSameTab,await this.saveSettings()}}),this.addCommand({id:"get-current-timestamp",name:E("Get Current Timestamp from Web Browser"),editorCallback:t=>{var c;const s=this.app.workspace.getLeavesOfType("surfing-view");if(s.length===0)return;const o=s.sort((l,d)=>d.activeTime-l.activeTime)[0].view,a=(c=o.getState())==null?void 0:c.url;a!=null&&a.contains("bilibili")&&o.getCurrentTimestamp(t)}}),this.addCommand({id:"search-in-current-page-title-bar",name:E("Search In Current Page Title Bar"),callback:()=>{const t=this.app.workspace.getActiveViewOfType(A.MarkdownView);if(!t||t.headerEl.childNodes.length>4)return;const s=new pn(t.headerEl,this,t,!1);s.onLoad(),s.addOnSearchBarEnterListener(i=>{K.spawnWebBrowserView(this,!1,{url:i})}),s.focus()}}),[...Pe,...this.settings.customSearchEngine].forEach(t=>{this.addCommand({id:"using"+t.name.replace(/\s/g,"-")+"-to-search",name:E("Using ")+t.name+E(" to search"),editorCallback:s=>{if(s.getSelection().length===0)return;const i=s.getSelection();K.spawnWebBrowserView(this,!0,{url:t.url+i})}})}),this.addCommand({id:"toggle-dark-mode",name:E("Toggle Dark Mode"),callback:async()=>{this.settings.darkMode=!this.settings.darkMode,await this.saveSettings();const t=this.app.workspace.getActiveViewOfType(K);t&&t.refresh()}}),this.addCommand({id:"focus-on-current-search-bar",name:E("Focus On Current Search Bar"),checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s){if(!t){const i=s.headerBar;i&&i.focus()}return!0}}}),this.addCommand({id:"copy-link-to-highlight",name:E("Copy Link to Highlight"),checkCallback:t=>{const s=this.app.workspace.getActiveViewOfType(K);if(s)return t||s.copyHighLight(),!0}}),this.addCommand({id:"copy-surfing-tabs-as-markdown",name:"Copy tabs as Markdown",callback:()=>{const t=this.app.workspace.getLeavesOfType("surfing-view");if(t.length===0)return;t.sort((i,o)=>o.activeTime-i.activeTime);let s="";t.forEach(i=>{const o=i.view,a=o.currentUrl;if(!a)return;const c=o.currentTitle;c&&(s.length===0?s=`- [${c}](<${a}>)`:s+=`
- [${c}](<${a}>)`)});try{navigator.clipboard.writeText(s)}catch{new A.Notice(E("Copy failed, you may focus on surfing view, click the title bar, and try again."))}}})}registerCustomIcon(){A.addIcon("surfing",'<svg t="1669432317981" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1590" data-darkreader-inline-fill="" width="100" height="100"><path d="M330.926 1023.978c-11.78 0-21.328-9.562-21.328-21.344v-42.652c0-11.782 9.546-21.344 21.328-21.344s21.342 9.562 21.342 21.344v42.652c0 11.782-9.56 21.344-21.342 21.344z" fill="#EAAD7A" p-id="1591" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#e2a36a;"></path><path d="M650.892 273.08C624.644 115.932 579.958 16.656 578.052 12.532a21.332 21.332 0 0 0-25.904-11.5c-1.406 0.468-35.186 11.28-70.262 24.842-20.936 8.062-37.998 15.466-50.7 21.936-22.046 11.25-32.014 20.092-35.358 31.404-2.578 7.188-24.764 54.842-48.232 105.246-39.138 84.088-92.746 199.27-136.086 298.016-23.796 54.248-41.92 97.714-53.84 129.212-21.952 57.998-20.89 69.652-17.204 78.872 4.172 10.466 13.282 21.842 82.808 55.342 36.28 17.466 85.76 39.278 147.07 64.902 104.088 43.464 207.894 83.372 208.926 83.746 2.468 0.968 5.062 1.438 7.656 1.438 3.124 0 6.218-0.688 9.124-2.062a21.284 21.284 0 0 0 11.124-12.532c35.308-106.152 55.808-217.832 60.84-331.952 4.034-91.246-1.716-184.21-17.122-276.362z" fill="#ED5564" p-id="1592" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#cc5b60;"></path><path d="M650.892 273.08C624.644 115.932 579.958 16.656 578.052 12.532a21.332 21.332 0 0 0-25.904-11.5c-0.656 0.218-8.31 2.686-19.842 6.592a21.938 21.938 0 0 1 3.094 4.906c1.89 4.124 46.59 103.4 72.84 260.548 15.376 92.152 21.154 185.116 17.124 276.362-5.06 114.12-25.53 225.798-60.872 331.952a21.216 21.216 0 0 1-3.282 6.156c11.28 4.406 17.81 6.906 18.06 7 2.468 0.968 5.062 1.438 7.656 1.438 3.124 0 6.218-0.688 9.124-2.062a21.284 21.284 0 0 0 11.124-12.532c35.308-106.152 55.808-217.832 60.84-331.952 4.034-91.244-1.716-184.208-17.122-276.36z" fill="#FFFFFF" opacity=".2" p-id="1593" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#ebe3d5;"></path><path d="M181.622 874.642c0 2.468 0.406 4.938 1.266 7.282 0.954 2.624 9.89 26.124 32.092 49.934 21.014 22.562 58.2 49.436 115.948 49.436h383.996c128.744 0 186.428-91.588 188.834-95.494a21.314 21.314 0 0 0 3.156-11.156H181.622z" fill="#F4BE8E" p-id="1594" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#ecb177;"></path><path d="M685.924 584.064c-6.782-2.25-13.532-3.876-19.562-5.062a1292.052 1292.052 0 0 1-3.656 42.81c12.844 3.032 24.876 7.936 29.188 13.686-7.25 3.718-26.344 10.906-73.402 17.844-42.218 6.218-97.95 11-161.196 13.75-122.15 5.342-251.97 2.376-315.686-7.218-11.656-1.782-22.514 6.25-24.28 17.904-1.75 11.656 6.264 22.53 17.92 24.28 44.826 6.75 118.102 10.376 199.598 10.376 39.28 0 80.496-0.844 121.336-2.594 64.154-2.718 121.274-7.5 165.118-13.78 71.778-10.312 92.806-22.438 102.368-30.686 10.406-8.938 12.594-18.75 12.594-25.376 0-14.688-6.562-41.466-50.34-55.934z" fill="#434A54" p-id="1595" data-darkreader-inline-fill="" style="--darkreader-inline-fill:#555755;"></path></svg>')}registerCodeBlock(){this.registerMarkdownCodeBlockProcessor("surfing",(e,t,s)=>{const i=A.parseYaml(e);if(!i||typeof i!="object"||!("url"in i)||typeof i.url!="string"||!i.url)return;const o=i.url;t.toggleClass("surfing-embed-website",!0);const a=t.createDiv({cls:"surfing-embed-website-container"});new hn(a,o,this).onload()})}registerHoverPopover(e=this){this.settings.hoverPopover&&(this.registerEditorExtension(wr.EditorView.domEventHandlers({mouseover:(t,s)=>{var d;if(!t.target.hasClass("cm-underline")&&!t.target.hasClass("external-link"))return;const i=s.state.field(A.editorInfoField),o=(d=i.editMode)==null?void 0:d.editor;if(!o)return;const a=s.posAtDOM(t.target),c=o.offsetToPos(a),l=o.getClickableTokenAt(c);l&&l.text.trim().startsWith("http")&&this.app.workspace.trigger("hover-link",{event:t,source:"editor",hoverParent:i,targetEl:t.target,linktext:l.text.trim()})}})),this.registerMarkdownPostProcessor((t,s)=>{t.querySelectorAll("a").forEach(i=>{i.addEventListener("mouseover",o=>{i.hasClass("external-link")&&(!i.href||!i.href.trim().startsWith("http")||this.app.workspace.trigger("hover-link",{event:o,source:"preview",hoverParent:s,targetEl:i,linktext:i.href.trim()}))})})}),this.app.workspace.onLayoutReady(()=>{const t=this.app.internalPlugins.plugins["page-preview"];this.register(Ae(t.instance,{onLinkHover(s){return function(i,o,a,c,l,...d){if(a.startsWith("http://")||a.startsWith("https://")){const{hoverPopover:p}=i;if(p&&p.state!==A.PopoverState.Hidden&&p.targetEl===o)return;const u=new A.HoverPopover(i,o);u.hoverEl.addClass("surfing-hover-popover"),window.setTimeout(()=>{if(u.state!==A.PopoverState.Hidden){const g=u.hoverEl.createDiv("surfing-hover-popover-container");new hn(g,a,e).onload()}},100);return}s.call(this,i,o,a,c,l,...d)}}})),t.enabled&&(t.disable(),t.enable(),this.register(()=>{t.enabled&&(t.disable(),t.enable())}))}))}checkWebBrowser(){this.app.plugins.getPlugin("obsidian-web-browser")&&new A.Notice(E("You enabled obsidian-web-browser plugin, please disable it/disable surfing to avoid conflict."),4e3),this.app.vault.getConfig("showViewHeader")||new A.Notice(E("You didn't enable show tab title bar in apperance settings, please enable it to use surfing happily."),4e3)}patchMarkdownView(e=this){this.register(Ae(A.MarkdownView.prototype,{triggerClickableToken:t=>function(s,i,...o){if(s.type==="external-link"&&!e.handsLinksToWebViewer()){if(i==="tab"||i==="window"){window.open(s.text,"_blank","external");return}const a=s.text!==Me(s.text)?Me(s.text):s.text;Ct(a)?K.spawnWebBrowserView(e,!0,{url:a}):window.open(a,"_blank","external");return}t.call(this,s,i,...o)}}))}patchEditMode(){const e=async t=>{const s=t.app.workspace.getLeavesOfType("markdown")[0],i=s==null?void 0:s.view;if(A.requireApiVersion("1.7.3")&&(s!=null&&s.isDeferred)&&await s.loadIfDeferred(),!s||!i)return!1;const o=i.editMode??i.sourceMode;return o?(this.register(Ae(ot(o),{triggerClickableToken:a=>function(c,l,...d){if(c.type==="external-link"&&!t.handsLinksToWebViewer()){if(l==="tab"||l==="window"){window.open(c.text,"_blank","external");return}const p=c.text!==Me(c.text)?Me(c.text):c.text;Ct(p)?K.spawnWebBrowserView(t,!0,{url:p}):window.open(p,"_blank","external");return}a.call(this,c,l,...d)}})),!0):!1};this.app.workspace.onLayoutReady(async()=>{if(!await e(this)){const t=this.app.workspace.on("layout-change",async()=>{await e(this)&&this.app.workspace.offref(t)});this.registerEvent(t)}})}patchWindowOpen(e=this){const t=()=>{window.clearTimeout(this.applyURLDebounceTimer),this.urlOpened=!0,this.applyURLDebounceTimer=window.setTimeout(()=>{this.urlOpened=!1},300)},s=()=>this.urlOpened,i=Ae(window,{open:o=>function(a,c,l){if(e.handsLinksToWebViewer())return o(a,c,l);let d="";return typeof a=="string"?d=a:a instanceof URL&&(d=a.toString()),Me(d)!==d&&(d=Me(d).toString().replace(/\s/g,"%20")),d==="about:blank"&&l||!Ct(d)||d!=="about:blank"&&(c==="_blank"||c==="_self")||c==="_external"||l==="external"?o(a,c,l):(d&&!c&&!l&&!s()&&(K.spawnWebBrowserView(e,!0,{url:d}),t()),null)}});this.register(i)}patchMarkdownPreviewRenderer(e=this){const t=()=>{window.clearTimeout(this.applyURLDebounceTimer),this.urlOpened=!0,this.applyURLDebounceTimer=window.setTimeout(()=>{this.urlOpened=!1},300)},s=()=>this.urlOpened,i=Ae(A.MarkdownPreviewRenderer,{registerDomEvents:o=>function(a,c,l){a==null||a.on("click",".external-link",(d,p)=>{if(!e.handsLinksToWebViewer()&&(d.preventDefault(),!s()&&p)){const u=p.getAttribute("href");if(u){if(d.ctrlKey||d.metaKey){window.open(u,"_blank","external"),t();return}Ct(u)&&!s()?(K.spawnWebBrowserView(e,!0,{url:u}),t()):window.open(u,"_blank","external");return}}}),o.call(this,a,c,l)}});this.register(i)}patchProperty(){if(!A.requireApiVersion("1.4.0"))return;const e=t=>{var c,l;const s=t.app.workspace.activeEditor,i=(c=s==null?void 0:s.metadataEditor)==null?void 0:c.rendered.filter(d=>d.entry.type==="text");if(!(i!=null&&i.length))return!1;const o=i[0];if(!o)return!1;const a=o.rendered;return a?(this.register(Ae(ot(a),{render:d=>async function(...p){var m;if(d.apply(this,p),t.handsLinksToWebViewer())return;const u=this.linkTextEl,g=u.cloneNode(!0);(m=u.parentNode)==null||m.replaceChild(g,u),g.onclick=h=>{if(!(h.button!==0&&h.button!==1))if(h.preventDefault(),this.isWikilink())this.ctx.app.workspace.openLinkText(this.getLinkText(),this.ctx.sourcePath,A.Keymap.isModEvent(h),{active:!0});else if(vs(this.value)){if(A.Keymap.isModEvent(h)){window.open(this.value,"_blank");return}K.spawnWebBrowserView(t,!0,{url:this.value});return}else ws(this.value)&&window.open("mailto:"+this.value,"_blank")},g.oncontextmenu=h=>{h.preventDefault();const b=new A.Menu().addSections(["title","correction","spellcheck","open","selection","clipboard","action","view","info","","danger"]);this.isWikilink()?(h.preventDefault(),this.ctx.app.workspace.handleLinkContextMenu(b,this.getLinkText(),this.ctx.sourcePath)):vs(this.value)?(h.preventDefault(),this.ctx.app.workspace.handleExternalLinkContextMenu(b,this.value)):ws(this.value)&&(h.preventDefault(),this.ctx.app.workspace.handleExternalLinkContextMenu(b,"mailto:"+this.value)),b.showAtMouseEvent(h)}}})),(l=s==null?void 0:s.leaf)==null||l.rebuildView(),!0):!1};this.app.workspace.onLayoutReady(()=>{if(!e(this)){const t=this.app.workspace.on("layout-change",()=>{e(this)&&this.app.workspace.offref(t)});this.registerEvent(t)}})}patchEmptyView(e=this){const t=()=>{const s=this.app.workspace.getLeavesOfType("empty").first(),i=s==null?void 0:s.view;return i instanceof A.ItemView?(this.register(Ae(ot(i),{onOpen:o=>function(...a){const c=e.app.plugins.getPlugin("surfing").settings;if(!this.contentEl.querySelector(".wb-bookmark-bar")&&c.bookmarkManager.openBookMark&&(this.contentEl.classList.add("mod-wb-bookmark-bar"),new $i(this,e).onload()),!this.contentEl.querySelector(".surfing-settings-icon")){const l=this.contentEl.createDiv({cls:"surfing-settings-icon"});l.addEventListener("click",()=>{e.app.setting.open(),e.app.setting.openTabById("surfing")}),A.setIcon(l,"settings")}return o.call(this,...a)}})),s==null||s.rebuildView(),!0):!1};this.app.workspace.onLayoutReady(()=>{if(!t()){const s=this.app.workspace.on("layout-change",()=>{t()&&this.app.workspace.offref(s)});this.registerEvent(s)}})}patchCanvasNode(){const e=t=>{var c;const s=(c=t.app.workspace.getLeavesOfType("canvas").first())==null?void 0:c.view;if(!(s!=null&&s.canvas))return!1;const o=(l=>{for(const[,d]of l)if(ru(d))return d;return!1})(s.canvas.nodes);if(!o)return!1;const a=Ae(ot(o),{render(l){return function(){l.call(this),!this.canvas.isDragging&&new ec(this,t,"canvas",this.canvas).onload()}}});return this.register(a),o.render(),!0};this.app.workspace.onLayoutReady(()=>{if(!e(this)){const t=this.app.workspace.on("layout-change",()=>{e(this)&&this.app.workspace.offref(t)});this.registerEvent(t)}})}patchCanvas(){const e=t=>{var o;const s=(o=t.app.workspace.getLeavesOfType("canvas").first())==null?void 0:o.view;if(!s||!s.canvas)return!1;const i=Ae(ot(s.canvas),{selectOnly:a=>function(c){a.call(this,c),c.contentEl&&c.url!==void 0&&!c.contentEl.classList.contains("wb-view-content")&&window.setTimeout(()=>{c.render()},0)}});return this.register(i),!0};this.app.workspace.onLayoutReady(()=>{if(!e(this)){const t=this.app.workspace.on("layout-change",()=>{e(this)&&this.app.workspace.offref(t)});this.registerEvent(t)}})}refreshAllRelatedView(){for(const e of this.app.workspace.getLeavesOfType("canvas"))e&&e.rebuildView()}registerEmbededHTML(){this.app.embedRegistry.registerExtension("html",(e,t,s)=>new ys(e,t,this.app,this)),this.app.embedRegistry.registerExtension("htm",(e,t,s)=>new ys(e,t,this.app,this))}unRegisterEmbededHTML(){this.app.embedRegistry.unregisterExtension("html"),this.app.embedRegistry.unregisterExtension("htm")}migrateRemovedAISettings(e){const t=e.aiAssistant;if(delete e.aiAssistant,e.mcp!==void 0||typeof t!="object"||t===null||!("pageReadBlocklist"in t))return;const s=t.pageReadBlocklist;Array.isArray(s)&&(e.mcp={blockedSites:s.filter(i=>typeof i=="string")})}sanitizeMcpSettings(e){const t=ie.mcp,s=o=>Array.isArray(o)?o.filter(a=>typeof a=="string"):[],i=e==null?void 0:e.port;return{enabled:(e==null?void 0:e.enabled)===!0,port:typeof i=="number"&&Number.isInteger(i)&&i>=1024&&i<=65535?i:t.port,token:typeof(e==null?void 0:e.token)=="string"?e.token:t.token,siteAccess:(e==null?void 0:e.siteAccess)==="allow"?"allow":"ask",approvedSites:s(e==null?void 0:e.approvedSites),blockedSites:s(e==null?void 0:e.blockedSites),allowScripts:(e==null?void 0:e.allowScripts)===!0}}async loadSettings(){const e=await this.loadData()||{};this.migrateRemovedAISettings(e),this.settings=Object.assign({},ie,e),this.settings.mcp=this.sanitizeMcpSettings(e.mcp),this.settings.adBlock=Object.assign({},ie.adBlock,e.adBlock),this.settings.bookmarkManager=Object.assign({},ie.bookmarkManager,e.bookmarkManager),this.settings.elementHiding=Object.assign({},ie.elementHiding,e.elementHiding),this.settings.chromeExtensions=Object.assign({},ie.chromeExtensions,e.chromeExtensions)}async saveSettings(){await this.saveData(this.settings)}}class au extends A.Modal{constructor(e,t,s){super(e);y(this,"url");y(this,"plugin");this.url=t,this.app=e,this.plugin=s}onOpen(){var o;const{contentEl:e}=this;(o=e.parentElement)==null||o.classList.add("wb-bookmark-modal"),e.createEl("h2",{text:"Save bookmark"});const t=e.createDiv({cls:"wb-bookmark-modal-btn-container"}),s=t.createEl("button",{text:"Save"});s.onclick=async()=>{this.close();const a=await nc(this.url),c=this.plugin.settings.bookmarkManager.defaultCategory||"ROOT";await Dn(this.plugin,{url:this.url,name:(a==null?void 0:a.title)||"Untitled",description:(a==null?void 0:a.description)||"",tags:[],category:[c]}),new A.Notice("Bookmark saved.")};const i=t.createEl("button",{text:"Open"});i.onclick=()=>{this.close(),K.spawnWebBrowserView(this.plugin,!0,{url:this.url})}}onClose(){const{contentEl:e}=this;e.empty()}}module.exports=ou;

/* nosourcemap */