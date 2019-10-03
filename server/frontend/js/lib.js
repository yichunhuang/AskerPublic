// initialize app structure
let app={
	evts:{}, 
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
