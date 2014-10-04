
function onBridgeReady() {
	
    //转发朋友圈
    WeixinJSBridge.on("menu:share:timeline", function(e) {
        var data = {
            img_url:mainImgUrl,
            img_width: "120",
            img_height: "120",
            link: mainURL,
            //desc这个属性要加上，虽然不会显示，但是不加暂时会导致无法转发至朋友圈，
            desc: mainDesc,
            title: mainTitle
        };
		
        WeixinJSBridge.invoke("shareTimeline", data, function(res) {
            WeixinJSBridge.log(res.err_msg)
        });
    });
    //同步到微博
    WeixinJSBridge.on("menu:share:weibo", function() {
        WeixinJSBridge.invoke("shareWeibo", {
            "content": mainDesc,
            "url": mainURL
        }, function(res) {
            WeixinJSBridge.log(res.err_msg);
        });
    });
    //分享给朋友
    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
        WeixinJSBridge.invoke("sendAppMessage", {
            img_url: mainImgUrl,
            img_width: "120",
            img_height: "120",
            link: mainURL,
            desc: mainDesc,
            title: mainTitle
        }, function(res) {
            WeixinJSBridge.log(res.err_msg)
        });
    });
	//WeixinJSBridge.call('hideToolbar');
	//WeixinJSBridge.call('hideOptionMenu');
	//setTimeout(function(){initPage();$("#arrow").addClass("move1")}, 300 );
};




// 以下是拖动效果
var startX = 0,
    startY = 0;
    margin = 0;
var pages = null;
var curPage = 0;
var pageWidth = 0,
    pageHeight = 0;
var lineHeight = 0, secHeight = 0;
var targetElement = null;
var scrollPrevent = false, movePrevent = false, touchDown = false;

var nsPage={
	init:function(){
		

		Is.init();
		nsTouch.init();
		
		initPage();
		//执行
		document.addEventListener('WeixinJSBridgeReady', function() {
			
			onBridgeReady();
		});
		
	}
}
var Is={
	type:"Android",
	Android:true,
	PC:false,
	init:function(){
	var userAgentInfo = navigator.userAgent;  
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
	var flag = true; 
	for (var v = 0; v < Agents.length; v++) 
	if(userAgentInfo.indexOf(Agents[v]) > 0 ){
		flag = false;
		Is.types=Agents[v];
		if(Is.types=="Android"){Is.Android=true} else{Is.Android=false}
		break;
	} 
	if(flag){Is.PC=true}
	}
}

var nsTouch={
	init:function(){
		
		
		document.body.addEventListener('touchstart', function (e) {
			//console.log("target:"+e.target.className);
			e = e.changedTouches[0];
			onStart(e);
		});
		
		document.body.addEventListener('touchmove', function (e) {
			onMove(e.changedTouches[0], e);
		});
		
		document.body.addEventListener('touchend', function (e) {
			onEnd(e.changedTouches[0]);
		});
				
		// 翻转的绑定
		window.onorientationchange = nsTouch.orientationChange;
	},
	orientationChange:function(){
		initPage();
	}

}
function onStart (e) {

    if(movePrevent == true){
	
        event.preventDefault();
        return false;
    }


    touchDown = true;

    // 起始点，页面位置
    startX = e.pageX;
    startY = e.pageY;
    //margin = parseInt($(".sec").css("top"));
    //-webkit-transform:translateY(0px)

    //matrix(1, 0, 0, 1, 0, 8)

    $(".sec").addClass("drag");

    margin = $(".sec").css("-webkit-transform");
	
    //margin = "matrix(1, 0, 0, 1, 0, -50)";
    margin = margin.replace("matrix(", "");
    margin = margin.replace(")", "");
    margin = margin.split(",");
    margin = parseInt(margin[5]);
	
}

function onMove (e, oe) {
	
    if(movePrevent == true || touchDown != true){
        event.preventDefault();
        return false;
		
    }
    event.preventDefault();
    if( scrollPrevent==false && e.pageY!=startY){
        var temp = margin + e.pageY - startY;
        $(".sec").css("-webkit-transform", "matrix(1, 0, 0, 1, 0, "+temp+")");

    }
}

function onEnd (e) {
    if(movePrevent == true){
        event.preventDefault();
        //return false;
    }

    touchDown = false;

    if( scrollPrevent==false ){
        // 抬起点，页面位置
        endX = e.pageX;
        endY = e.pageY;
        // swip 事件默认大于50px才会触发，小于这个就将页面归回
        if( Math.abs(endY-startY)<=50) {
            animatePage(curPage);
        }else{
        	if(endY>startY){
        		prevPage();
        	}else{
        		nextPage();
        	}
        }
    }

    $(".sec").removeClass("drag");
}


function prevPage(){
    var newPage = curPage - 1;
    animatePage(newPage);
    
}
function nextPage(){
    var newPage = curPage + 1;
    animatePage(newPage);
}

var nsProgress={
	value:0,
	pos:0,
	delay:40,
	init:function(){
		var progressEl = $('.progress');
		
		nsProgress.value++;
		if (nsProgress.value < 21) {
			progressEl.attr("values",nsProgress.value+"%");
			nsProgress.pos = 1 - (nsProgress.value/21);
		} else if(nsProgress.value < (nsProgress.delay + 21) ) {
			progressEl.attr("values","20%");	
			nsProgress.pos = 0;
			nsProgress.value = 0;
			nsProgress.clear()
		} else {
			nsProgress.value = 0;
			nsProgress.clear()
		}
		
		progressEl.css('background-position', '0 '+ nsProgress.pos +'em');

	},
	clear:function(){
		
		clearInterval(timer);
		timer=null	
	}
	
}