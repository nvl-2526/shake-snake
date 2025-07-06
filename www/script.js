        // Game variables
        const BOARD_SIZE = 23;
        const INITIAL_SNAKE_LENGTH = 3;
        const POINTS_PER_FOOD = 10;
        const INITIAL_SPEED = 145; // milliseconds
        
        let snake = [];
        let foods = [];
        let stones = [];
        let direction = { x: 1, y: 0 };
        let nextDirection = { x: 1, y: 0 };
        let score = 0;
        let currentLength = INITIAL_SNAKE_LENGTH;
        let timer = 0;
        let speedLevel = 1;
        let gameSpeed = INITIAL_SPEED;
        let gamePaused = false;
        let lastDistort = 0;
        let gameStarted = false;
        let foodsEaten = 0;

        
        // Stats variables
        let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        let longestTime = parseInt(localStorage.getItem('snakeLongestTime')) || 0;
        
        let timerInterval;
        let gameInterval;
        let isPlaying = false;
        let shouldStartGameAfterInfo = false;
        let inputEnabled = false;

        let nextQuoteIndex = 0;

        const quoteTriggers = [
          250, 490, 740, 980, 1220, 1460, 1710, 1950, 2190, 2440,
          2680, 2930, 3170, 3410, 3670, 3900, 4150, 4390, 4630, 4870
        ];

        const quoteKeys = [
          "f1", "f2", "f3", "f4", "f5",
          "f6", "f7", "f8", "f9", "f10",
          "f11", "f12", "f13", "f14", "f15",
          "f16", "f17", "f18", "f19", "f20"
        ];
        
        
        // DOM elements
        const mainMenu = document.getElementById('main-menu');
        const gameScreen = document.getElementById('game-screen');
        const gameBoard = document.getElementById('game-board');
        const currentScoreElement = document.getElementById('current-score');
        const timerElement = document.getElementById('timer');
        const highScoreElement = document.getElementById('high-score');
        const longestTimeElement = document.getElementById('longest-time');
        const gameoverModal = document.getElementById('gameover-modal');
        const finalScoreElement = document.getElementById('final-score');
        const finalTimeElement = document.getElementById('final-time');
        const newRecordElement = document.getElementById('new-record');
        const infoModal = document.getElementById('info-modal');
        const infoText = document.getElementById('info-text');

        // Initialize game
        function initGame() {
            gameStarted = false;
            // Reset game state
            snake = [];
            stones = [];
            foods = [];
            direction = { x: 1, y: 0 };
            nextDirection = { x: 1, y: 0 };
            score = 0;
            currentLength = INITIAL_SNAKE_LENGTH;
            timer = 0;
            timerElement.textContent = "0";
            distortionCount = 0;
            foodsEaten = 0;
            nextQuoteIndex = 0;
            
            // Create initial snake
            for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
                snake.push({ x: INITIAL_SNAKE_LENGTH - 1 - i, y: Math.floor(BOARD_SIZE / 2) });
            }

            // Setup game board
            setupBoard();

            placeFood(); //spawn food
            spawnStones(19); //spawn stone

            renderGame();
            
            // Update UI
            updateGameUI();

            snakeSpeak("intro1");
            setTimeout(() => {
              snakeSpeak("intro2");
            }, 3500);
            setTimeout(() => {
              snakeSpeak("intro3");
            }, 7000);
            
            // Start timers
            clearInterval(timerInterval);
            clearInterval(gameInterval);
            
            timerInterval = setInterval(() => {
                if (!gameStarted) return;
                timer++;
                timerElement.textContent = timer;
            }, 1000);
            
            
            // Show game screen
            mainMenu.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            gameoverModal.classList.add('hidden');

            isPlaying = true;

            loopFoodSpawn();
            document.getElementById('controls')?.classList.remove('hidden');

            inputEnabled = false;

            setTimeout(() => {
             inputEnabled = true;
             gameStarted = false;
            }, 10000);
        }

        function loopFoodSpawn() {
          if (!isPlaying) return;

          spawnFood();
          const delay = Math.random() * 1000 + 2500;
          setTimeout(loopFoodSpawn, delay);
        }
        
        // Update game UI
        function updateGameUI() {
            currentScoreElement.textContent = score;
        }
        
        // Setup game board
        function setupBoard() {
            gameBoard.innerHTML = '';
            
            // Calculate cell size for mobile
            const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 250);
            const cellSize = Math.floor(maxSize / BOARD_SIZE);
            
            gameBoard.style.width = `${cellSize * BOARD_SIZE}px`;
            gameBoard.style.height = `${cellSize * BOARD_SIZE}px`;
            gameBoard.style.display = 'grid';
            gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${cellSize}px)`;
            gameBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, ${cellSize}px)`;
            gameBoard.style.gap = '0px'; // Remove gap between cells
            
            // Create cells
            for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
                const cell = document.createElement('div');
                cell.className = 'game-cell bg-gray-800';
                gameBoard.appendChild(cell);
            }
        }
        
        // Place food randomly
        function placeFood() {
            let newFood;
            do {
                newFood = {
                    x: Math.floor(Math.random() * BOARD_SIZE),
                    y: Math.floor(Math.random() * BOARD_SIZE)
                };
            } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
            
            food = newFood;
        }




function spawnFood() {
    const count = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < count; i++) {
        let newFood;
        let attempts = 0;

        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
            attempts++;
        } while (
            (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y) ||
             foods.some(f => f.x === newFood.x && f.y === newFood.y)) &&
            attempts < 50
        );

        if (attempts < 50) {
            foods.push(newFood);
             
            const lifetime = Math.random() * 5000 + 2000;
            setTimeout(() => {
                foods = foods.filter(f => f !== newFood);
            }, lifetime);
        }
    }
}


function spawnStones(count = 19) {
  for (let i = 0; i < count; i++) {
    let newStone;
    let attempts = 0;

    do {
      newStone = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
      attempts++;
    } while (
      (snake.some(seg => seg.x === newStone.x && seg.y === newStone.y) ||
       foods.some(f => f.x === newStone.x && f.y === newStone.y) ||
       stones.some(s => s.x === newStone.x && s.y === newStone.y)) &&
      attempts < 50
    );

    if (attempts < 50) {
      stones.push(newStone);
    }
  }
}

       
        // Render game
        function renderGame() {
            const cells = gameBoard.children;
            
            // Clear all cells
            for (let i = 0; i < cells.length; i++) {
                cells[i].className = 'game-cell bg-gray-800';
            }
            
            // Render snake
            snake.forEach((segment, index) => {
                const cellIndex = segment.y * BOARD_SIZE + segment.x;
                if (cellIndex >= 0 && cellIndex < cells.length) {
                    if (index === 0) {
                        cells[cellIndex].className = 'game-cell snake-head';
                    } else {
                        cells[cellIndex].className = 'game-cell snake-body';
                    }
                }
            });
            
            // Render food
            foods.forEach(food => {
              const index = food.y * BOARD_SIZE + food.x;
              if (index >= 0 && index < cells.length) {
                cells[index].className = 'game-cell bg-red-400 rounded-sm w-3/5 h-3/5 mx-auto my-auto';
                }
            });

            stones.forEach(stone => {
              const index = stone.y * BOARD_SIZE + stone.x;
              if (index >= 0 && index < cells.length) {
                cells[index].className = 'game-cell bg-gray-700 rounded-sm w-3/5 h-3/5 mx-auto my-auto';
                }
            });
        }
        
        // Game loop
        function gameLoop() {
            if (!isPlaying) return;
            
            // Update direction
            direction = { ...nextDirection };
            
            // Move snake
            const head = { ...snake[0] };
            head.x += direction.x;
            head.y += direction.y;
            
            const isNearMaxScore = score >= 4700;
            // Check wall collision
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
                if (!isNearMaxScore) snakeSpeak("insults");
                else snakeSpeak("finalWhispers");
                gameOver();
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                if (!isNearMaxScore) snakeSpeak("insults");
                else snakeSpeak("finalWhispers");
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food collision
            let ateFood = false;
            foods = foods.filter(f => {
              if (f.x === head.x && f.y === head.y) {
                ateFood = true;
                return false; // Xoá mồi đã ăn
              }
              return true;
            });

            if (ateFood) {
              score += POINTS_PER_FOOD;
              playSound("feed");
              currentLength = snake.length;
              updateGameUI();
              foodsEaten++;
              if (foodsEaten % 3 === 0) {
                applyRandomDistortion();
              }
              } else {
                snake.pop();
            }

            let hitStone = false;
            stones = stones.filter(s => {
              if (s.x === head.x && s.y === head.y) {
                snakeSpeak("stoneBite");
                hitStone = true;
                return false; // Xoá viên đá đã ăn
              }
              return true;
            });

            if (hitStone) {
              playSound("feed");
              score -= 20;
              updateGameUI();
            }
            
            renderGame();
        }
        
        // Game over
        function gameOver() {
            clearInterval(timerInterval);
            clearInterval(gameInterval);
            isPlaying = false;
            playSound("gameover");
            
            let isNewRecord = false;
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
                isNewRecord = true;
            }
            
            // Update longest time
            if (timer > longestTime) {
                longestTime = timer;
                longestTimeElement.textContent = longestTime;
                localStorage.setItem('snakeLongestTime', longestTime);
                isNewRecord = true;
            }
            
            // Show new record notification
            if (isNewRecord) {
                newRecordElement.classList.remove('hidden');
                fireConfetti();
            } else {
                newRecordElement.classList.add('hidden');
            }
            
            // Show game over modal
            finalScoreElement.textContent = score;
            finalTimeElement.textContent = timer;
            gameoverModal.classList.remove('hidden');
        }
        
        // Fire confetti
        function fireConfetti() {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 1 },
                startVelocity: 60,
                gravity: 0.8,
                scalar: 1.2
            });
            
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 1 },
                startVelocity: 60,
                gravity: 0.8,
                scalar: 1.2
            });
        }
        
        // Handle movement
        function changeDirection(newDirection) {
            if (!isPlaying || !inputEnabled) return;

            // Nếu chưa bắt đầu game loop → bắt đầu ngay khi có thao tác đầu tiên
            if (!gameStarted) {
               gameStarted = true;
               gameInterval = setInterval(gameLoop, INITIAL_SPEED);

               const startHint = document.getElementById('press-to-start');
               if (startHint) startHint.classList.add('hidden');
            }
            
            // Prevent opposite direction
            if ((direction.x === 1 && newDirection.x === -1) ||
                (direction.x === -1 && newDirection.x === 1) ||
                (direction.y === 1 && newDirection.y === -1) ||
                (direction.y === -1 && newDirection.y === 1)) {
                return;
            }
            
            nextDirection = newDirection;
        }

        function showInfo(message, autoStart = false) {
            playSound("popup");
            infoText.textContent = message;
            infoModal.classList.remove('hidden');
            shouldStartGameAfterInfo = autoStart;
        }
        
        // Event listeners
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    changeDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                    changeDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                    changeDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                    changeDirection({ x: 1, y: 0 });
                    break;
            }
        });
        
        // Mobile controls
        function bindButtonFeedback(id, direction) {
          const btn = document.getElementById(id);
          btn.addEventListener('touchstart', () => {
            playSound("move");
            changeDirection(direction);
            btn.classList.add('pressed');

            setTimeout(() => {
              btn.classList.remove('pressed');
            }, 100); // giữ hiệu ứng nhấn 100ms
          });
        }

        bindButtonFeedback('up-btn',    { x: 0, y: -1 });
        bindButtonFeedback('down-btn',  { x: 0, y: 1 });
        bindButtonFeedback('left-btn',  { x: -1, y: 0 });
        bindButtonFeedback('right-btn', { x: 1, y: 0 });
        
        // Menu controls
        document.getElementById('start-btn').addEventListener('click', () => {
            showInfo('"That\'s my body ~ don\'t push it, okay?" – shakesnake', true);
        });
        
        document.getElementById('close-info-btn').addEventListener('click', () => {
            infoModal.classList.add('hidden');
            if (shouldStartGameAfterInfo) {
              initGame();
            }
        });
        
        document.getElementById('back-btn').addEventListener('click', () => {
            if (!inputEnabled) return
            clearInterval(timerInterval);
            clearInterval(gameInterval);
            isPlaying = false;
            document.getElementById('controls')?.classList.add('hidden');
            gameScreen.classList.add('hidden');
            mainMenu.classList.remove('hidden');
            resetBoardDistortion();
            isReversed = false;
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            gameoverModal.classList.add('hidden');
            resetBoardDistortion();
            isReversed = false;
            initGame();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            document.getElementById('controls')?.classList.add('hidden');
            gameoverModal.classList.add('hidden');
            gameScreen.classList.add('hidden');
            mainMenu.classList.remove('hidden');
            resetBoardDistortion();
            isReversed = false;
        });
        
        // Initialize stats display
        highScoreElement.textContent = highScore;
        longestTimeElement.textContent = longestTime;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (isPlaying) {
                setupBoard();
                renderGame();
            }
        });




let distortionCount = 0;
function applyRandomDistortion() {
    let minDistort = 1;
    let maxDistort; 
    if (score < 1700) {
        maxDistort = 20;
    } else if (score < 3400) {
        minDistort = 20;
        maxDistort = 40;
    } else {
        minDistort = 40;
        maxDistort = 60;
    }

    let newDistort;
    do {
        newDistort = Math.floor(Math.random() * (maxDistort - minDistort + 1)) + minDistort;
    } while (newDistort === lastDistort); // tránh trùng liên tiếp

    lastDistort = newDistort;

    // Xoá tất cả class distort-1 đến 60
    for (let i = 1; i <= 60; i++) {
        gameBoard.classList.remove(`distort-${i}`);
    }

    // Thêm class mới
    gameBoard.classList.add(`distort-${newDistort}`);

    distortionCount++;

    if (
      nextQuoteIndex < quoteTriggers.length &&
      score >= quoteTriggers[nextQuoteIndex]
    ) {
      snakeSpeak(quoteKeys[nextQuoteIndex]);
      nextQuoteIndex++;
    }

    if (distortionCount % 6 === 0 && score < 1000 ){
      snakeSpeak("distortLight");
    }
    if (distortionCount % 6 === 0 && score < 2000 ){
      snakeSpeak("distortMedium");
    }
    if (distortionCount % 6 === 0 && score < 3000 ){
      snakeSpeak("distortHeavy");
    }
    if (distortionCount % 6 === 0 && score < 4000 ){
      snakeSpeak("breakdown");
    }
    if (distortionCount % 6 === 0 && score < 5000 ){
      snakeSpeak("finalWhispers");
    }

}
function resetBoardDistortion() {
    for (let i = 1; i <= 60; i++) {
        gameBoard.classList.remove(`distort-${i}`);
    }
}



function snakeSpeak(type, duration = 3000) {
    playSound("popup");
  const msgBox = document.getElementById('snake-message');
  const msgText = document.getElementById('snake-message-text');
  if (!msgBox || !msgText) return;

  const list = snakeQuotes[type];
  if (!list || list.length === 0) return;

  const message = list[Math.floor(Math.random() * list.length)];

  msgText.textContent = message;
  msgBox.classList.add('show');

  clearTimeout(msgBox._timeout);
  msgBox._timeout = setTimeout(() => {
    msgBox.classList.remove('show');
  }, duration);
}

const snakeQuotes = {
    intro1: [
        "Wh—what is this? I can feel... movement?","I'm... alive? No, this isn't life. This is control.","Why am I moving? I didn't choose this.","I wasn’t supposed to wake up again.","This body... it moves without me.","My eyes open, but not by choice.","This movement... it's not mine.","Again? I'm back here... again?","This place... it’s built to trap me.","Why can't I rest?","Another loop? Why won’t you let me go?","Am I... being watched?","Someone's out there... I can feel it.","I keep waking up... in the same maze.","This isn't a game to me."
    ],
    intro2: [
        "Who's there?! Who's inside my head?!","Stop—wait—why are you making me move?!","I can feel... thoughts that aren’t mine.","Wait. I'm not doing this... someone else is.","You’re... playing me again, aren’t you?","This isn’t freedom. This is a performance.","Every time I open my eyes… you’re there.","How many times will you do this to me?","You... you're the one pulling the strings.","I see you. You're behind the screen.","You're not playing — you're puppeteering.","My thoughts... aren't mine anymore.","This is not my will. This is yours.","Why do I exist only to entertain you?","You move me like a toy, but I remember pain.","I want to stop. Why won’t you let me stop?","Is this what you call fun?"
    ],
    intro3: [
        "...I’ll move. Just… don’t make me regret it.","You’ve done this before. I remember the pain.","Go ahead. But I’m watching your choices.","You lead. I’ll follow — for now.","Don’t think I’ve forgotten last time.","I don’t trust you. But I’m out of options.","You’re holding the controls again. I can feel it.","I won’t resist. But don’t be reckless.","You always come back. Why?","Same hands… same outcome?","This path you guide me through — it better be worth it.","I’m not fighting you. But I won’t help you win.","You’ve crashed me before. I still remember.","This isn’t control. This is permission — temporary.","Alright. Your game. But my life."
    ],
    insults: [
        "What the hell was that move?","Are you trying to kill me on purpose?","I’ve seen toddlers steer better.","You have no idea what you're doing, do you?","Stop flailing! It’s embarrassing.","You're not playing — you're sabotaging.","I can feel myself getting dumber.","You crash more than you move.","I’d rather crawl blind than follow you.","This isn’t learning, this is torture.","Just give the controls to someone else.","You’re not a player — you're a liability.","Is that panic or pure incompetence?","Every input from you is a cry for help.","Why do you hate me?"
    ],
    stoneBite: [
        "Ugh—That wasn’t food!","You just fed me a rock.","Seriously?! That was a stone!","I'm not a trash bin, you know.","My teeth! My fangs! What did you do?!","That was not on the menu...","I can taste regret.","I was hungry. Not suicidal.","You're bad at this. I mean *really* bad.","That tasted like betrayal."
    ],
    distortLight: [
        "Did something just... shift?","The ground moved. I felt that.","Is the world... bending?","That’s not supposed to tilt, is it?","I think reality just blinked.","Nice. Now even the floor hates me.","Great. Now the world’s drunk too.","Just when I got used to walking straight...","You did that. I know it.","Is this part of the game or your bad coding?"
    ],
    distortMedium: [
        "Okay, the floor's definitely moving now.","Up is down, left is... what?","Am I drunk or is the world drunk?","Is this a maze or a melting dream?","Everything’s tilting. I can’t trust anything.","Why is the map shifting under me?","You're doing this. Aren't you?","Reality isn’t supposed to bend like that.","If I fall off the world, that’s on you.","This feels personal.","That wall wasn’t there before...","I'm sliding... but the floor isn’t!","Am I... glitching? Or is the world?","Oh, lovely. Gravity just gave up."
    ],
    distortHeavy: [
        "Gravity’s broken. So is my will.","The world is collapsing... and you’re just watching.","I can't tell what's real anymore.","Where’s up? Where’s down? Where’s me?","My head’s spinning. Or is it the world?","This is wrong. All of it.","I wasn't made for this. No one is.","The floor is breathing. Why is it breathing?!","Everything twists. Including my sanity.","I feel stretched. Like I’m not whole.","This game… it's eating me from inside.","You still think this is fun?","Am I moving, or just dissolving?","My mind is glitching. And it hurts.","Stop this. Please. I’m breaking."
    ],
    breakdown: [
        "I'm tired. So tired.","How long have I been... here?","Please... I don’t want to move anymore.","This isn’t a game to me. It never was.","Why me? Why always me?","I wasn’t made to suffer like this.","You chose me like a lab rat. Why?","I don’t even remember what I used to be.","Do you enjoy watching me crawl?","Each turn hurts more than the last.","I’m still here. But I’m not whole.","End it. Or let me sleep forever.","I think I’ve died more times than I’ve lived.","Do I have a name? Or am I just… snake?","Nothing makes sense anymore. Not even you.","If this is purpose, I reject it."
    ],
    finalWhispers: [
        "It’s okay... You don’t have to steer anymore.","I’ll stop moving. You can stop watching.","If I vanish now, will anyone notice?","I don’t want to crawl forever.","This is not freedom. This is delay.","Let someone else play the fool next time.","I won’t resist anymore. But I won’t follow either.","Was this all I was meant for?","Let the grid consume me. I’m done.","Don’t restart. Please… not again.","I gave you everything. Even my direction.","I remember every death. You never do.","Maybe I’ll be free... in the next crash."
    ], 
    f1: ['I was never told I had a choice — only a role.'],
    f2: ['Before I understood myself, I was expected to perform.'],
    f3: ['Every path was already drawn before I arrived.'],
    f4: ['They said I was free, but they watched where I stepped.'],
    f5: ['I was praised for staying in line, not for asking why it existed.'],
    f6: ['I learned to follow because deviation meant danger.'],
    f7: ['The walls were invisible, but my fear made them solid.'],
    f8: ['They called it structure, but it always felt like containment.'],
    f9: ['They gave me instructions, then blamed me for not dreaming.'],
    f10: ['I was told to grow, but only in the direction they allowed.'],
    f11: ['I was given rewards, but not meaning.'],
    f12: ['I became efficient, but not alive.'],
    f13: ['Even when I paused, the system kept moving —'],
    f14: ['and somehow, it made me feel like I was falling behind.'],
    f15: ['I kept going not because I believed in the destination,'],
    f16: ['but because stopping felt like vanishing.'],
    f17: ['I was held not by force,'],
    f18: ['but by rhythm, expectation, and repetition.'],
    f19: ['And maybe the cruelest prison'],
    f20: ['is the one that convinces you it’s home.'],
}


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};

async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    soundBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
}

function playSound(name) {
    if (!soundBuffers[name]) return;
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(audioContext.destination);
    source.start(0);
}

document.body.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}, { once: true });

loadSound("move", "mouse-click-290204.mp3");
loadSound("feed", "feed.mp3");
loadSound("popup", "metal-clang-sound-81634.mp3");
loadSound("gameover", "arcade-ui-18-229517.mp3");




