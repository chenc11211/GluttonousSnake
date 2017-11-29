
;
//兼容的事件绑定和解绑函数
function addHandler(element,type,handler) {
    if(element.addEventListener){
        element.addEventListener(type,handler,false);
    }else if(element.attachEvent){
        element.attachEvent("on"+type,handler);
    }else {
        element["on"+type]=handler;
    }
}

function removeHandler(element,type,handler) {
    if(element.removeEventListener){
        element.removeEventListener(type,handler,false);
    }else if(element.detachEvent){
        element.detachEvent("on"+type,handler);
    }else {
        element["on"+type]=null;
    }
}

window.onload=function () {
    var space=[];
    for (let i=0;i<16;i++){
        space[i]=[];
    }
    //创建二维数组，下标为网格位置，值为当前状态；
    //0：空白；1：食物；2：蛇；3：障碍物
    // 初始化网格数组
    function reset_space() {
        for (let i=0;i<16;i++){
            for (let n=0;n<30;n++){
                space[i][n]=0;
                document.querySelector('tr.r_'+i+' .c_'+n).setAttribute('class',"c_"+n);
            }
        }
    }

    //预设墙壁位置数组
    var wallList=[[{}],[{x:10,y:6},{x:11,y:6}],[{x:12,y:6},{x:18,y:9}],[{x:20,y:12},{x:11,y:6},{x:6,y:10}],[{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6}],[{x:9,y:13},{x:10,y:13},{x:13,y:13},{x:14,y:13}],[{x:13,y:8},{x:12,y:7},{x:11,y:6},{x:10,y:5}],[{x:20,y:6},{x:23,y:10},{x:10,y:12},{x:27,y:4}],[{x:0,y:6},{x:9,y:9},{x:0,y:7},{x:11,y:11},{x:10,y:10},{x:12,y:12}],[{x:1,y:6},{x:13,y:6}],[{x:20,y:6},{x:21,y:6}],[{x:17,y:5},{x:28,y:3}],[{x:20,y:11},{x:21,y:0}],[{x:7,y:11},{x:15,y:9}],[{x:17,y:6},{x:18,y:6}],[{x:3,y:10},{x:21,y:3}],[{x:13,y:12},{x:21,y:2}],[{x:0,y:8},{x:13,y:11}],[{x:12,y:4},{x:15,y:7}],[{x:20,y:0},{x:19,y:2}],[{x:13,y:7},{x:17,y:3}]];

    // 设置障碍物
    //传入包含障碍物位置对象的数组
    function setWall(wall) {
        if(wall){
            for (let i=0,len=wall.length;i<len;i++){
                space[wall[i].y][wall[i].x]=3;
                document.querySelector('tr.r_'+wall[i].y+' .c_'+wall[i].x).classList.add('wall');
            }
        }
    }

    // 生成食物
    function makeFood() {
        var blank_space=[];
        var m=0;
        for (let i=0;i<16;i++){
            for (let n=0;n<30;n++){
                if(space[i][n]===0){
                    blank_space[m]={y:i,x:n};
                    m++;
                }
            }
        }
        var food=blank_space[Math.floor(Math.random()*blank_space.length)];
        document.querySelector('tr.r_'+food.y+' .c_'+food.x).classList.add('food');
        space[food.y][food.x]=1;
    }

    // 移动更新位置
    function snake_move(snake,target) {
        if(!(space[target.y])){
            return false;
        }
        if(space[target.y][target.x]===0){
            snake.head=target;
            snake.body.push(target);
            var remove=snake.body.shift();
            //更新数组
            space[target.y][target.x]=2;
            space[remove.y][remove.x]=0;
            return true;
        }else if(space[target.y][target.x]===1){
            snake.head=target;
            snake.body.push(target);
            document.querySelector('tr.r_'+target.y+' .c_'+target.x).classList.remove('food');
            // 更新数组
            space[target.y][target.x]=2;
            snake.eat();
            makeFood();
            return true;
        }else {
            return false;
        }
    }

    function Snake(wall,model,level) {
        this.length=3;
        this.body=[{x:1,y:1},{x:2,y:1},{x:3,y:1}];
        this.head={x:3,y:1};
        //实际运动的方向
        this.direction='right';
        //将要运动的方向
        this.nextDirection='right';
        this.speed=2;
        //模式，1：自由模式，2：闯关模式，3：躲避模式
        this.model=model;
        this.level=level;
        this.interval=null;
        // 初始化
        (function (snake,wall) {
            //若为闯关模式，速度为1+关卡等级
            if(snake.model===2){
                snake.speed=1+snake.level;
            }
            reset_space();
            setWall(wall);
            for (let i=0,len=snake.body.length;i++;){
                space[snake.body[i].y][snake.body[i].x]=2;
            }
            makeFood();
            //设置信息栏
            oLength.innerHTML=""+snake.length;
            oSpeed.innerHTML=""+snake.speed;
            var info_model_str="";
            if(snake.model===1){
                info_model_str='自由模式';
            }else if(snake.model===2){
                info_model_str='闯关'+snake.level+'关';
            }else {
                info_model_str='躲避'+snake.level+'关';
            }
            oModel.innerHTML=info_model_str;
        })(this,wall);
    }
    // 移动
    Snake.prototype.move=function () {
        var _this=this;
        clearInterval(this.interval);
        //设置定时器
        this.interval=setInterval(function () {
            var target=null;
            //确定位置；
            _this.direction=_this.nextDirection;
            switch (_this.direction){
                case 'right':
                    target={x:_this.head.x+1,y:_this.head.y};
                    break;
                case 'top':
                    target={x:_this.head.x,y:_this.head.y-1};
                    break;
                case 'left':
                    target={x:_this.head.x-1,y:_this.head.y};
                    break;
                case 'bottom':
                    target={x:_this.head.x,y:_this.head.y+1};
                    break;
            }
            if(!snake_move(_this,target)){
                _this.dead();
            }else {
                var snake=document.querySelectorAll('.snake');
                var current_snake=null;
                for (let i=0,len=snake.length;i<len;i++){
                    snake.item(i).classList.remove('snake');
                }
                for (let i=0,len=_this.body.length;i<len;i++){
                    current_snake=document.querySelector('tr.r_'+_this.body[i].y+' .c_'+_this.body[i].x);
                    current_snake.classList.add('snake');
                }
            }

        },1000/this.speed);
    };
    // 停止
    Snake.prototype.stop=function () {
        clearInterval(this.interval);
        console.log(this.interval);
    };
    //吞噬
    // 吃完后增加长度，并判断速度是否增加，若速度改变则重设定时器；
    Snake.prototype.eat=function (){
        this.length+=1;

        //若不为闯关模式，则速度随长度增加而增加
        if(this.model!==2){
            var speed=2+Math.floor((this.length-3)/4);
            if(this.speed!==speed){
                this.speed=speed;
                clearInterval(this.interval);
                this.move();
            }
        }
        //判断长度，确定是否成功！
        if(this.model===1){
            if(this.length===480){
                this.win();
            }
        }else {
            if (this.length===15){
                if(this.level===20){
                    this.win();
                }else {
                    this.next();
                }
            }
        }

        //设置信息栏
        //var info_length=document.createTextNode(this.length);
        oLength.innerHTML=this.length;
        //var info_speed=document.createTextNode(this.speed);
        oSpeed.innerHTML=this.speed;
    };
    //死亡
    Snake.prototype.dead=function () {
        this.stop();
        oCover.style.display='block';
        oResultMenu.style.display='block';
        oFailMenu.style.display='block';
    };
    //胜利
    Snake.prototype.win=function () {
        this.stop();
        oCover.style.display='block';
        oResultMenu.style.display='block';
        oWinMenu.style.display='block';
    };
    // 下一关
    Snake.prototype.next=function () {
        this.stop();
        oCover.style.display='block';
        oResultMenu.style.display='block';
        oSuccessMenu.style.display='block';
    };

    //转向
    function turn(ev) {
        var event=ev||window.event,
            code=event.keyCode,
            direction=newSnake.direction,
            current_direction=newSnake.direction;
        switch (code){
            case 38:
                direction='top';
                if(current_direction==='bottom'){
                    direction='bottom';
                }
                break;
            case 39:
                direction='right';
                if(current_direction==='left'){
                    direction='left';
                }
                break;
            case 40:
                direction='bottom';
                if(current_direction==='top'){
                    direction='top';
                }
                break;
            case 37:
                direction='left';
                if(current_direction==='right'){
                    direction='right';
                }
                break;
            case 32:
                newSnake.stop();
                oCover.style.display='block';
                oResultMenu.style.display='block';
                oStopMenu.style.display='block';
                break;
            default:
                break;
        }
        //方向设置在nextDirection上，防止直接设在direction上方向多次变换出现可以同实际方向相反的情况；
        newSnake.nextDirection=direction;
        if((code>=37&&code<=40)||code===32){
            if(event.preventDefault){
                event.preventDefault();
            }else {
                event.returnValue=false;
            }
        }
    }
    // 绑定按键事件
    addHandler(document,'keydown',turn);


    //声明变量用于存放Snake对象；
    var newSnake=null;
    //界面控件
    var oCover=document.getElementById('cover'),
        oLength=document.getElementById('length'),
        oSpeed=document.getElementById('speed'),
        oModel=document.getElementById('model'),
        oResultMenu=document.getElementById('result'),
        oMainMenu=document.getElementById('main'),
        oFailMenu=document.getElementById('fail'),
        oSuccessMenu=document.getElementById('success'),
        oWinMenu=document.getElementById('win'),
        oStopMenu=document.getElementById('stop');

    //主菜单
    var oFreedom=document.getElementById('freedom'),
        oThrough=document.getElementById('through'),
        oDuck=document.getElementById('duck');
    oFreedom.onclick=function () {
        oMainMenu.style.display='none';
        oCover.style.display='none';
        newSnake=new Snake([],1,1);
        newSnake.move();
    };
    oThrough.onclick=function () {
        oMainMenu.style.display='none';
        oCover.style.display='none';
        newSnake=new Snake([],2,1);
        newSnake.move();
    };
    oDuck.onclick=function () {
        oMainMenu.style.display='none';
        oCover.style.display='none';
        newSnake=new Snake(wallList[1],3,1);
        newSnake.move();
    };

    //结果菜单
    var oReturn=document.querySelectorAll('.return'),
        oRestart=document.querySelectorAll('.restart'),
        oContinue=document.querySelector('.continue'),
        oNext=document.querySelector('.next');

       //返回首页按钮绑定事件
    for (let i=0,len=oReturn.length;i<len;i++){
        oReturn.item(i).onclick=function () {
            this.parentNode.style.display='none';
            oResultMenu.style.display='none';
            oMainMenu.style.display='block';
        }
    }

       //重新开始按钮绑定事件
    for (let i=0,len=oRestart.length;i<len;i++){
        oRestart.item(i).onclick=function () {
            this.parentNode.style.display='none';
            oResultMenu.style.display='none';
            oCover.style.display='none';
            var wall=[];
            if(newSnake.model===3){
                wall=wallList[newSnake.level];
            }
            newSnake=new Snake(wall,newSnake.model,newSnake.level);
            newSnake.move();
        }
    }

       //下一关
    oNext.onclick=function () {
        this.parentNode.style.display='none';
        oResultMenu.style.display='none';
        oCover.style.display='none';
        var wall=[];
        if(newSnake.model===3){
            wall=wallList[newSnake.level+1];
        }
        newSnake=new Snake(wall,newSnake.model,newSnake.level+1);
        newSnake.move();
    };

       //继续
    oContinue.onclick=function () {
        this.parentNode.style.display='none';
        oResultMenu.style.display='none';
        oCover.style.display='none';
        newSnake.move();
    };

};