let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let movingSpeed = 60;
let secondsPassed = 0;
let oldTimeStamp = 0;

//sets canvas fullscreen
canvas.height = Math.floor(window.innerHeight)
canvas.width = Math.floor(window.innerWidth)

//setting variables
let birdHeight = 60
let birdWidth = 80
let velocityY = 0
let acceleration = .5
let openingGap = 300
let pipeWidth = 100
let playing = false
let played = false
let timer = 0
let score = 0
let currentPipe = 0
let registeredPoint = false
let highscore = 0
let results = document.getElementById("results");

//getting highscore from local storage
if (localStorage.getItem("highscore") === null){
    highscore = 0
}
else{
    highscore = parseFloat(localStorage.getItem("highscore"))
    document.getElementById("results").innerHTML = "Score: "+score+"<br /><br />"+"Highscore: "+highscore
}

//height then x
let pipes = []

//creates key object (kind of array)
let toggledKeys = {};

let bird = {
    x: canvas.width/2-100,
    y: canvas.height-birdHeight
}

//when key is pressed down, log the key
document.addEventListener("keydown", event => {
    toggledKeys[event.code] = true;
    event.preventDefault();
});
//when key comes back up, log the key
document.addEventListener("keyup", event => {
    toggledKeys[event.code] = false;
    event.preventDefault();
});

function update() {
    if (playing){
        //if the most recent pipe gets to a certain point, spawn a new pipe
        if (pipes[pipes.length - 1] < canvas.width-400){
            pipes.push(Math.round(Math.random()*(canvas.height-openingGap)), canvas.width)
            let topHeight = pipes[pipes.length-2]
            pipes.push(canvas.height-openingGap-topHeight, canvas.width)
        }
        //if the oldest pipe goes off screen, delete it
        if (pipes[1] < -pipeWidth){
            pipes.splice(0, 4);
            currentPipe -= 4
        }

        //bird velocity/gravity stuff
        velocityY += secondsPassed*movingSpeed * acceleration;   
        if (bird.y > canvas.height-birdHeight*2){
            velocityY=-8
        }
        if (bird.y < canvas.height-birdHeight*2 && bird.y > 100 && Math.random() > .85 && timer > 25){
            velocityY=-8
            timer = 0
        }
        bird.y += secondsPassed*movingSpeed * (velocityY + secondsPassed*movingSpeed * acceleration / 2);

        
        for (let i = 1; i < pipes.length; i+=4) {
            //moving pipes left
            pipes[i]-=2*movingSpeed*secondsPassed
            pipes[i+2]-=2*movingSpeed*secondsPassed
            //if bird hits pipe
            if ((bird.x+birdWidth >= pipes[i] && bird.x <= pipes[i]+pipeWidth && bird.y <= pipes[i-1]) || (bird.x+birdWidth >= pipes[i+2] && bird.x <= pipes[i+2]+pipeWidth && bird.y+birdHeight >= canvas.height-pipes[i+1]) || (bird.y+birdHeight >= canvas.height)){
                restart()
            }
            //moving pipes up and down
            if (toggledKeys["ArrowUp"] && pipes[i+1] + 4*movingSpeed*secondsPassed < canvas.height){
                pipes[i-1]-=4*movingSpeed*secondsPassed
                pipes[i+1]+=4*movingSpeed*secondsPassed
            }
            else if (toggledKeys["ArrowUp"]){
                pipes[i+1] = canvas.height
            }
            if (toggledKeys["ArrowDown"] && pipes[i-1] + 4*movingSpeed*secondsPassed < canvas.height){
                pipes[i-1]+=4*movingSpeed*secondsPassed
                pipes[i+1]-=4*movingSpeed*secondsPassed
            }
            else if (toggledKeys["ArrowDown"]){
                pipes[i-1] = canvas.height
            }
            //scoring system
            if (bird.x >= pipes[i] && bird.x <= pipes[i]+pipeWidth && !registeredPoint){
                score+=1
                registeredPoint = true
                currentPipe = i
            }
        }
        if (bird.x < pipes[currentPipe] || bird.x > pipes[currentPipe]+pipeWidth){
            registeredPoint = false
            currentPipe += 4
        }

        timer+=secondsPassed*movingSpeed
    }
    //start game
    if(!playing && toggledKeys["Space"]){
        results.close()
        score = 0
        playing = true
        played = true
        velocityY=-8
        pipes.push(Math.round(Math.random()*(canvas.height-openingGap)), canvas.width)
        let topHeight = pipes[pipes.length-2]
        pipes.push(canvas.height-openingGap-topHeight, canvas.width)
    }
}

function restart(){
    if (score > highscore){
        highscore = score
        localStorage.setItem("highscore", highscore)
    }
    document.getElementById("results").innerHTML = "Score: "+score+"<br /><br />"+"Highscore: "+highscore
    results.showModal()
    playing = false
    velocityY = 0
    bird.y = canvas.height-birdHeight
    pipes = []
    toggledKeys = []
}



function draw(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);    
    update();
    for (let i = 0; i < pipes.length; i+=4) {
        ctx.drawImage(topPipe, pipes[i+1], -canvas.height*1.5+pipes[i], pipeWidth, canvas.height*1.5);
        ctx.drawImage(bottomPipe, pipes[i+3], canvas.height-pipes[i+2], pipeWidth, canvas.height*1.5);
    }
    if(!playing){
        ctx.drawImage(birdImg, bird.x, bird.y, birdWidth, birdHeight);
    }
    else if(playing && velocityY < 0){
        ctx.drawImage(upBirdImg, bird.x, bird.y, birdWidth, birdHeight);
    }
    else{
        ctx.drawImage(downBirdImg, bird.x, bird.y, birdWidth, birdHeight); 
    }
    ctx.font="30px Kanit"
    ctx.textAlign="center";
    ctx.fillStyle="black"
    if (playing){
        ctx.fillText(score, canvas.width/2, 200)
    }
    if (!played){
        ctx.fillText("Press Space To Start", canvas.width/2, 200)
        ctx.fillText("Press Arrow Keys To Move Pipes Up And Down", canvas.width/2, 240)
        ctx.fillText("Try To Guide The AI Bird Through The Pipes To Win!", canvas.width/2, 280)
    }
    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);