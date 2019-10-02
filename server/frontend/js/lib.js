// initialize app structure
let app={
	fb:{},
	state:{
		cart:null, auth:null
	}, 
	evts:{}, 
	cart:{},
	cst:{
		// API_HOST:"https://yichunhuang.com/api/1.0"
	}
};
// core operations
app.get=function(selector){
	return document.querySelector(selector);
};
app.getAll=function(selector){
	return document.querySelectorAll(selector);
};
app.createElement=function(tagName,settings,parentElement){
	let obj=document.createElement(tagName);
	if(settings.atrs){app.setAttributes(obj,settings.atrs);}
	if(settings.stys){app.setStyles(obj,settings.stys);}
	if(settings.evts){app.setEventHandlers(obj,settings.evts);}
	if(parentElement instanceof Element){parentElement.appendChild(obj);}
	return obj;
};
app.modifyElement=function(obj,settings,parentElement){
	if(settings.atrs){
		app.setAttributes(obj,settings.atrs);
	}
	if(settings.stys){
		app.setStyles(obj,settings.stys);
	}
	if(settings.evts){
		app.setEventHandlers(obj,settings.evts);
	}
	if(parentElement instanceof Element&&parentElement!==obj.parentNode){
		parentElement.appendChild(obj);
	}
	return obj;
};
app.setStyles=function(obj,styles){
	for(let name in styles){
		obj.style[name]=styles[name];
	}
	return obj;
};
app.setAttributes=function(obj,attributes){
	for(let name in attributes){
		obj[name]=attributes[name];
	}
	return obj;
};
app.setEventHandlers=function(obj,eventHandlers,useCapture){
	for(let name in eventHandlers){
		if(eventHandlers[name] instanceof Array){
			for(let i=0;i<eventHandlers[name].length;i++){
				obj.addEventListener(name,eventHandlers[name][i],useCapture);
			}
		}else{
			obj.addEventListener(name,eventHandlers[name],useCapture);
		}
	}
	return obj;
};
app.ajax=function(method, src, args, headers, callback){
	let req=new XMLHttpRequest();
	if(method.toLowerCase()==="post"){ // post through json args
		req.open(method, src);
		req.setRequestHeader("Content-Type", "application/json");
		app.setRequestHeaders(req, headers);
		req.onload=function(){
			callback(this);
		};
		req.send(JSON.stringify(args));
	}else{ // get through http args
		req.open(method, src+"?"+args);
		app.setRequestHeaders(req, headers);
		req.onload=function(){
			callback(this);
		};
		req.send();
	}
};
	app.setRequestHeaders=function(req, headers){
		for(let key in headers){
			req.setRequestHeader(key, headers[key]);
		}
	};
app.getParameter=function(name){
    let result=null, tmp=[];
    window.location.search.substring(1).split("&").forEach(function(item){
		tmp=item.split("=");
		if(tmp[0]===name){
			result=decodeURIComponent(tmp[1]);
		}
	});
    return result;
};
// menu items
app.updateMenuItems=function(tag){
	let desktopItems=app.getAll("header>nav>.item");
	let mobileItems=app.getAll("nav.mobile>.item");
	if(tag==="women"){
		desktopItems[0].classList.add("current");
		mobileItems[0].classList.add("current");
	}else if(tag==="men"){
		desktopItems[1].classList.add("current");
		mobileItems[1].classList.add("current");
	}else if(tag==="accessories"){
		desktopItems[2].classList.add("current");
		mobileItems[2].classList.add("current");
	}
};
// loading
app.showLoading=function(){
	app.get("#loading").style.display="block";
};
app.closeLoading=function(){
	app.get("#loading").style.display="none";
};
// facebook login
app.fb.load=function(){
	// Load the SDK asynchronously
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/zh_TW/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, "script", "facebook-jssdk"));
};
app.fb.init=function(){
	FB.init({
		appId:"2088123174829137",
		cookie:true, xfbml:true,
		version:"v3.1"
	});
	FB.getLoginStatus(function(response){
		app.fb.loginStatusChange(response);
		// set member click handlers
		let memberIcons=app.getAll(".member");
		for(let i=0;i<memberIcons.length;i++){
			app.setEventHandlers(memberIcons[i], {
				click:app.fb.clickProfile
			});
		}
	});
};
app.fb.login=function(){
	FB.login(function(response){
		app.fb.loginStatusChange(response);
	}, {scope:"public_profile,email"});
};
app.fb.loginStatusChange=function(response){
	if(response.status==="connected"){
		app.state.auth=response.authResponse;
		app.fb.updateLoginToServer();
	}else{
		app.state.auth=null;
	}
	if(typeof app.fb.statusChangeCallback==="function"){
		app.fb.statusChangeCallback();
	}
};
app.fb.updateLoginToServer=function(){
	let data={
		provider:"facebook",
		access_token:app.state.auth.accessToken
	}
	app.ajax("post", app.cst.API_HOST+"/user/signin", data, {}, function(req){});
};
app.fb.clickProfile=function(){
	if(app.state.auth===null){
		app.fb.login();
	}else{
		window.location="./profile.html";
	}
};
app.fb.getProfile=function(){
	return new Promise((resolve, reject)=>{
		FB.api("/me?fields=id,name,email", function(response){
			if(response.error){
				reject(response.error);
			}else{
				resolve(response);
			}
		});
	});
};
window.fbAsyncInit=app.fb.init;
window.addEventListener("DOMContentLoaded", app.fb.load);
// shopping cart
app.cart.init=function(){
	let storage=window.localStorage;
	let cart=storage.getItem("cart");
	if(cart===null){
		cart={
			shipping:"delivery", payment:"credit_card",
			recipient:{
				name:"", phone:"", email:"", address:"", time:"anytime"
			},
			list:[],
			subtotal:0,
			freight:60,
			total:0
		};
	}else{
		try{
			cart=JSON.parse(cart);
		}catch(e){
			storage.removeItem("cart");
			app.cart.init();
			return;
		}
	}
	app.state.cart=cart;
	// refresh UIs
	app.cart.show();
};
app.cart.update=function(){
	let storage=window.localStorage;
	let cart=app.state.cart;
	let subtotal=0;
	for(let i=0;i<cart.list.length;i++){
		subtotal+=cart.list[i].price*cart.list[i].qty;
	}
	cart.subtotal=subtotal;
	cart.total=cart.subtotal+cart.freight;
	// save to storage
	storage.setItem("cart", JSON.stringify(cart));
	// refresh UIs
	app.cart.show();
};
app.cart.show=function(){
	let cart=app.state.cart;
	app.get("#cart-qty-mobile").textContent=app.get("#cart-qty").textContent=cart.list.length;
};
app.cart.add=function(product, variant, qty){
	let list=app.state.cart.list;
	let color=product.colors.find((item)=>{
		return item.code===variant.color_code;
	});
	let item=list.find((item)=>{
		return item.id===product.id&&item.size===variant.size&&item.color.code===color.code;
	});
	if(item){
		item.qty=qty;
	}else{
		list.push({
			id:product.id,
			name:product.title,
			price:product.price,
			main_image:product.main_image,
			size:variant.size,
			color:color,
			qty:qty, stock:variant.stock
		});
	}
	app.cart.update();
	alert("已加入購物車");
};
app.cart.remove=function(index){
	let list=app.state.cart.list;
	list.splice(index, 1);
	app.cart.update();
	alert("已從購物車中移除");
};
app.cart.change=function(index, qty){
	let list=app.state.cart.list;
	list[index].qty=qty;
	app.cart.update();
};
app.cart.clear=function(){
	let storage=window.localStorage;
	storage.removeItem("cart");
};