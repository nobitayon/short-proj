let font;
let font3;
let recordSum;
let recordStand;

const capturer = new CCapture({
    framerate:30,
    format:"webm",
    name:"movie",
    quality:100,
    verbose:false
})

function preload() {
    font = loadFont('./assets/Comic San DY-free.otf');
    font3 = loadFont('./assets/ComicSansMS3.ttf');
    recordSum = loadTable('df_recordSum.csv','csv','header');
    recordStand = loadTable('df_stand.csv','csv','header');
}
const array2d_const = (m_grid,n_grid,val)=>Array(m_grid).fill(val).map(x => Array(n_grid).fill(val)); 
const sortWithIndeces = function(toSort) {
    for (let i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function(left, right) {
    return left[0] > right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (let j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

class point{
    // titik yang merupakan skala
    // karena ada batas, jadi skalanya akan berubah tergantung nilai maksimal dari bar yang ada
    constructor(x){
        this.disp;  
        this.x = x; 
        this.vx;
        this.batas = 0.00001;
        this.setGx = true;
        this.live = false;
    }
    updatePosx(deltaT,G){
        this.x += this.vx*deltaT;
        if(Math.abs(this.x-G)<=this.batas){
            this.vx = NaN;
            this.setGx = true;
        }
    }
}

class bar{
    // bar yang digunakan untuk menunjukkan perolehan poin dari suatu tim epl
    constructor(x,y,panjang,lebar,color,name){
        this.x = x;
        this.y = y;
        this.p = panjang;
        this.l = lebar;
        this.disp;
        this.name = name;
        this.vx;
        this.vy;
        this.color = color;
        this.setGx = true;
        this.setGy = true;
        this.batas = 0.00001;
    }
    show(xtoPx,ytoPx){
        rect(this.x,this.y,this.p,this.l*ytoPx);
        push();
        noFill();
        stroke(255);
        strokeWeight(1);
        textSize(16);
        textFont(font);
        text(this.name,this.p-8*this.name.length,this.y+15);
        pop();
        push();
        noFill();
        stroke(255);
        strokeWeight(1);
        text(this.disp,this.p + 5,this.y+15);
        pop();
    }
    updatePosy(deltaT,G){
        this.y += this.vy*deltaT;
        if(Math.abs(this.y-G)<=this.batas){
            this.vy = NaN;
            this.setGy = true;
        }
    }
    updatePosx(deltaT,G){
        this.p += this.vx*deltaT;
        if(Math.abs(this.p-G)<=this.batas){
            this.vx = NaN;
            this.setGx = true;
        }
    }
}

let list_color = ['#0048ba', '#b0bf1a', '#e52b50', '#ffbf00', '#9966cc', '#458b74', '#4b5320', '#e9d66b', '#b2beb5', '#87a96b', '#89cff0', '#f4c2c2', '#ff91af', '#8b7d6b', '#3d2b1f', '#cae00d', '#bfff00', '#fe6f5e', '#318ce7', '#0d98ba', '#8a2be2', '#873260', '#bf94e4', '#004225', '#cc5500', '#006b3c', '#56a0d3', '#f88379', '#fbec5d', '#03c03c', '#8b6508', '#006400', '#8b4500', '#e9967a', '#9400d3', '#da3287', '#ffcba4', '#ff1493', '#696969', '#50c878', '#f64a8a'];
let list_bar = [];
let stand;
let sumPoint;
let klub;
let tanggal=[];
let iter = 1;
let deltaT = 0.01;
let time = 0.3; // waktu untuk dari setiap bar, berpindah ke posisi y yang baru
let list_point = [];
let maxPxSkala = 700; 
let toPx = 20;      
let xtoPx = 50;
let ytoPx = 20;
let last = false;
let cek_max = false;
let bar_length;

function setup(){
    p5Canvas = createCanvas(800,450);
    frameRate(30);
    sumPoint = array2d_const(recordSum.getRowCount(),recordSum.getColumnCount()-1,0);
    for(let ii=0;ii<recordSum.getRowCount();ii++){
        for(let jj=1;jj<recordSum.getColumnCount();jj++){
            sumPoint[ii][jj-1] = parseInt( recordSum.get(ii,jj) );
        }
    }
    klub = recordSum.columns.slice(1,recordSum.getColumnCount());
    for(let ii=0;ii<klub.length;ii++){
        if(klub[ii].length>22){
            nama = klub[ii].split(" ")
            nama[nama.length-1] = nama[nama.length-1][0];
            klub[ii] = nama.join(" ");
        }
    }
    for(let ii=0;ii<recordSum.getRowCount();ii++){
        tanggal.push(recordSum.get(ii,0));
    }
    stand = array2d_const(recordStand.getRowCount(),recordStand.getColumnCount()-1,0);
    for(let ii=0;ii<recordStand.getRowCount();ii++){
        for(let jj=1;jj<recordStand.getColumnCount();jj++){
            stand[ii][jj-1] = parseInt(recordStand.get(ii,jj));
        }
    }
    let temp_bar;
    for(let ii=0;ii<klub.length;ii++){
        if(sumPoint[0][ii] * xtoPx>maxPxSkala){
            temp_bar = new bar(0, stand[0][ii] * ytoPx,maxPxSkala,1,list_color[ii%41],klub[ii]);
        }else{
            temp_bar = new bar(0, stand[0][ii] * ytoPx,sumPoint[0][ii] * xtoPx,1,list_color[ii%41],klub[ii]); 
        }
        list_bar.push(temp_bar);
        list_bar[ii].disp = sumPoint[0][ii];
    }
    bar_length = list_bar.length;
    let sorting = sortWithIndeces([...sumPoint[0]]);
    let maks_skala = sorting[0]*xtoPx;
    let tempPoint;
    if(maks_skala>maxPxSkala){
        tempPoint = new point(maxPxSkala); 
        tempPoint.disp = sorting[0];
        tempPoint.live = true;
        list_point.push(tempPoint);
        xtoPx = maxPxSkala/sorting[0];
    }
}

function draw(){
    if(frameCount===1){
        capturer.start();
    }
    background(0);
    translate(10,100);
    
    // plot untuk iterasi yang sebelumnya
    push();
    let colorV = color(255,0,0);
    colorV.setAlpha(50);
    stroke(colorV);
    line(maxPxSkala,0,maxPxSkala,600);
    pop();

    push();
    fill(255);
    stroke(255);
    textFont(font);
    textSize(20);
    text('Divisi satu liga inggris',300,-50);
    pop();

    push();
    textFont(font3);
    noFill();
    stroke(255);
    text('1888-2021',350,-30);
    pop();

    push();
    stroke(255);
    fill(255);
    textSize(25);
    text(tanggal[iter],650,340);
    pop();
    if(last==false){
        // masih plot untuk iterasi sebelumnya
        push();
        for(let ii=0;ii<list_point.length;ii++){
            if(list_point[ii].live){
                push();
                noFill();
                stroke(255);
                textSize(10);
                text(list_point[ii].disp,list_point[ii].x-5,-10);
                pop();
                let colorU = color(255);
                colorU.setAlpha(50);
                stroke(colorU);
                line(list_point[ii].x,-5,list_point[ii].x,600);
            }
        }
        pop();

        for(let ii=0;ii<bar_length;ii++){
            push();
            fill(list_bar[ii].color);
            list_bar[ii].show(xtoPx,ytoPx);
            pop();
        }

        // bagian menentukan apakah bar harus menentukan posisi y dan x yang baru
        // juga untuk x yang merupakan skala
        let sum_setGx = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGx+=list_bar[ii].setGx;
        }
        let sum_setGy = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGy+=list_bar[ii].setGy;
        }
        let sum_setGxx = 0;
        for(let ii=0;ii<list_point.length;ii++){
            sum_setGxx+=list_point[ii].setGx;
        }

        let sorting = sortWithIndeces([...sumPoint[iter]]);
        let maks_skala = sorting[0]*xtoPx;
        let tempPoint;
        
        if(cek_max!=true){
            if(list_point.length==0){
                if(maks_skala>maxPxSkala){
                    tempPoint = new point(maxPxSkala); 
                    tempPoint.disp = sorting[0];
                    if(iter%10==0){
                        tempPoint.live = true;
                    }
                    list_point.push(tempPoint);
                    xtoPx = maxPxSkala/sorting[0];
                    cek_max = true;
                }
            }else{
                let dispKanan = list_point[list_point.length-1].disp;
                if(sorting[0]>dispKanan){
                    tempPoint = new point(maxPxSkala);
                    tempPoint.disp = sorting[0];
                    if(iter%11==0){
                        tempPoint.live = true;
                    }
                    list_point.push(tempPoint);
                    xtoPx = maxPxSkala/sorting[0];
                    cek_max = true;
                }
            }
        }

        if(sum_setGy==bar_length){
            for(let ii=0;ii<bar_length;ii++){
                let G = stand[iter][ii]*ytoPx;
                let dist_toG = G - list_bar[ii].y;
                list_bar[ii].vy = dist_toG/time;
            }
            for(let ii=0;ii<bar_length;ii++){
                list_bar[ii].setGy = false; 
            }
        }
        if(sum_setGx==bar_length){
            for(let ii=0;ii<bar_length;ii++){
                let G = sumPoint[iter][ii]*xtoPx;
                let dist_toG = G - list_bar[ii].p;
                list_bar[ii].vx = dist_toG/time;
                list_bar[ii].disp = sumPoint[iter][ii];

                for(let ii=0;ii<bar_length;ii++){
                    list_bar[ii].setGx = false;
                }
            }
        }
        if(cek_max==true){
            if(list_point.length>1){
                if(sum_setGxx==list_point.length){
                    for(let ii=0;ii<list_point.length-1;ii++){
                        let G = list_point[ii].disp * xtoPx; 
                        let dist_toG = G - list_point[ii].x;  
                        list_point[ii].vx = dist_toG/time;
                    }
                    for(let ii=0;ii<list_point.length-1;ii++){
                        list_point[ii].setGx = false;
                    }
                }
            }
        }
        for(let ii=list_point.length-1;ii>=0;ii--){
            if(list_point[ii].x<90){
                list_point.splice(ii,1);
            }
        }
        
        // bagian update posisi dari bar dan point
        sum_setGx = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGx+=list_bar[ii].setGx;
        }
        sum_setGy = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGy+=list_bar[ii].setGy;
        }
        sum_setGxx = 0;
        for(let ii=0;ii<list_point.length;ii++){
            sum_setGxx+=list_point[ii].setGx;
        }
        if(sum_setGy<bar_length){
            for(let ii=0;ii<bar_length;ii++){
                if(list_bar[ii].setGy==false){
                    list_bar[ii].updatePosy(deltaT,stand[iter][ii]*ytoPx);
                }   
            }
        }

        if(sum_setGx<bar_length){
            for(let ii=0;ii<bar_length;ii++){
                if(list_bar[ii].setGx==false){
                    list_bar[ii].updatePosx(deltaT,sumPoint[iter][ii]*xtoPx);
                }   
            }
        }
        if(cek_max){
            if(sum_setGxx<list_point.length && list_point.length>1){
                for(let ii=0;ii<list_point.length-1;ii++){
                    if(list_point[ii].setGx==false){
                        let G = list_point[ii].disp * xtoPx;
                        list_point[ii].updatePosx(deltaT,G);
                    }   
                }
            }
        }
        
        sum_setGx = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGx+=list_bar[ii].setGx;
        }
        sum_setGy = 0;
        for(let ii=0;ii<bar_length;ii++){
            sum_setGy+=list_bar[ii].setGy;
        }
        sum_setGxx = 0;
        for(let ii=0;ii<list_point.length;ii++){
            sum_setGxx+=list_point[ii].setGx;
        }

        // bagian untuk menentukan apakah untuk selanjutnya bar dan point nentuin posisi baru
        // atau masih dalam proses mencapai posisi yang sekarang
        if( sum_setGx==bar_length && sum_setGy==bar_length && sum_setGxx==list_point.length){
            iter+=1;
            if(cek_max==true){
                cek_max = false;
            }
            if(iter==stand.length){
                last = true;
            }
        }
      
    }else{
        // untuk iterasi terakhir
        // tinggal plot aja
        push();
        for(let ii=0;ii<list_point.length;ii++){
            if(list_point[ii].live){
                push();
                noFill();
                stroke(255);
                textSize(10);
                text(list_point[ii].disp,list_point[ii].x-5,-10);
                pop();
                let colorU = color(255);
                colorU.setAlpha(50);
                stroke(colorU);
                line(list_point[ii].x,-5,list_point[ii].x,600);
            }
        }
        pop();

        push();
        for(let ii=0;ii<bar_length;ii++){
            fill(list_bar[ii].color);
            list_bar[ii].show(xtoPx,ytoPx);
        }
        pop();
        
        push();
        stroke(255);
        fill(255);
        textSize(25);
        text(tanggal[iter-1],650,340);
        pop();
        
        console.log('exit finished iteration');
        noLoop();
        capturer.stop();
        capturer.save();   
    }
    capturer.capture(p5Canvas.canvas);   
}