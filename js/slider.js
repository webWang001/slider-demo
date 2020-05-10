$(function () {
    function windowResize() {
        document.documentElement.style.fontSize =
            document.documentElement.clientWidth / 7.5 + "px";
    }
    windowResize();
    window.addEventListener("resize", windowResize, false);
    
    var data = ["选项A", "选项B", "选项C", "选项D"];
    function Slider(opts) {
        this.wrap = opts.dom;
        this.data = opts.data;
        this.init();
        this.bindDom();
    }
    Slider.prototype.init = function() {
        let self = this;
        this.data.forEach(function (item, index) {
            self.wrap.append(`
                    <div class="row">
                        <div>
                            <span class="cicle init-cicle">${index+1}</span>
                            <span>${item}</span>
                        </div>
                        <div class="icon-box">默认图标</div>
                    </div>
                `);
        });
    }

    Slider.prototype.bindDom = function() {
        let self = this;
        var $targetDiv = this.wrap.find(".row");
        var liH = this.wrap.find(".row").eq(0).css("height");
        var boxReact = this.wrap.offset();
        var curReact = null; //最开始时的offset数据
        var curClientY = 0;  
        var timer = null;
        var originOrder = 1; //被拖拽行的序号
        var curList = 0; // 最开始所处的index
        var targetList = 0; //移动到第index行
        var movedHeight = 0; //单次移动的高度
        var lastMoves = 0; //保存上一次的移动距离
        $targetDiv.on("touchstart",handlerStart);
        $targetDiv.on("touchmove",handlerMove);
        $targetDiv.on("touchend",handlerEnd);

        function handlerStart(event) {
            event.preventDefault();
            curClientY = event.touches[0].clientY;
            curReact = $(this).offset();
            lastMoves = $(this).css("transform").split(",")[1]; 
            timer = setTimeout(
                function () {
                    self.wrap.removeClass("un-init");
                    $(this).addClass("moveing");
                    $(this).siblings().addClass("un-moveing");
                    $(this).find(".icon-box").text("拖拽图标");
                }.bind(this),
                100
            );
        }
        function handlerMove(event) {
            if (!$(this).hasClass("moveing")) {
                return;
            }
            // 控制上下移动范围开始
            var maxT = curReact.top - boxReact.top;
            var maxB =
                boxReact.top + boxReact.height - (curReact.top + curReact.height);
            var moves = event.touches[0].clientY - curClientY;
            if (moves <= 0) {
                moves = -moves > maxT ? -maxT : moves;
            } else {
                moves = moves > maxB ? maxB : moves;
            }
            let curMoves = parseInt(lastMoves) + moves;
            $(this).css("transform", "translate3d(0, " + curMoves + "px ,0)");
            // 控制上下移动范围结束
            
            originOrder = $(this).find("span").eq(0).text();
            curList = Math.floor(maxT / parseInt(liH));
            targetList = Math.round(moves / parseInt(liH)) + curList; 
            movedHeight = (targetList - curList) * parseInt(liH); 
            // 被替换元素的移动及序号互换
            let dom = $(this).siblings().filter(function(){
                return $(this).find("span").eq(0).text() == targetList + 1;
            }) //被替换序号的dom
            if(dom.length>0) {
                dom.find("span").eq(0).text(originOrder); //序号与拖拽元素的序号互换
                $(this).find("span").eq(0).html(targetList + 1);//移动元素的序号变化
                let domLastmoves = dom.css("transform").split(",")[1]; //保存被替换元素上一次translate数据
                let domCurmoves = 0; //被替换元素本次translate值
                let directFlag = $(this).offset().top - dom.offset().top > 0;//判断向上移动还是向下移动
                if(directFlag) {
                    domCurmoves = parseInt(domLastmoves) + parseInt(liH);
                }else{
                    domCurmoves = parseInt(domLastmoves) - parseInt(liH);
                }
                dom.css("transform", "translate3d(0, " + domCurmoves + "px,0)"); 
            }
        }
        function handlerEnd() {
            clearTimeout(timer);
            $(this).removeClass("moveing");
            $(this).siblings().removeClass("un-moveing");
            let curMoves = parseInt(lastMoves) + movedHeight;
            $(this).css("transform", "translate3d(0, " + curMoves + "px ,0)");
            // 初始化
            let oldTxt = self.data.splice(curList, 1);
            self.data.splice(targetList, 0, oldTxt);
            self.wrap.empty();
            new Slider({
                dom: $(".question-box"),
                data: data,
            });
        }

    }
    
    new Slider({
        dom: $(".question-box"),
        data: data,
    });

});