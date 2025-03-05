var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeUp = new Image();
var pipeBottom = new Image();

bird.src = "img/bird.png";
bg.src = "img/bg.png";
fg.src = "img/fg.png";
pipeUp.src = "img/pipeUp.png";
pipeBottom.src = "img/pipeBottom.png";

var fly = new Audio();
var score_audio = new Audio();

fly.src = "audio/fly.mp3";
score_audio.src = "audio/score.mp3";

var gap = 90; // Зазор между трубами

// Начальная позиция птицы
var xPos = 10;
var yPos = 150;
var grav = 1;

// Счёт и лучший результат
var score = 0;
var bestScore = localStorage.getItem("bestScore") || 0;

// Массив труб
var pipe = [{
    x: cvs.width,
    y: -100,
    scored: false // Флаг для отслеживания счёта
}];

// Загружаем все изображения перед рисованием
var imagesToLoad = 5;
var imagesLoaded = 0;

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === imagesToLoad) {
        draw(); // Рисуем, только когда все изображения загружены
    }
}

bird.onload = onImageLoad;
bg.onload = onImageLoad;
fg.onload = onImageLoad;
pipeUp.onload = onImageLoad;
pipeBottom.onload = onImageLoad;

// Обработчик нажатия клавиши для прыжка
document.addEventListener("keydown", moveUp);

function moveUp() {
    yPos -= 20; // Прыжок вверх
    fly.play(); // Воспроизводим звук прыжка
}

// Функция перезапуска игры
function restartGame() {
    score = 0; // Сбрасываем счёт
    pipe = [{
        x: cvs.width,
        y: -100,
        scored: false
    }];
    xPos = 10;
    yPos = 150;
    draw();
}

function draw() {
    // Рисуем фон
    ctx.drawImage(bg, 0, 0, cvs.width, cvs.height);

    // Обрабатываем трубы
    for (var i = 0; i < pipe.length; i++) {
        // Рисуем верхнюю и нижнюю трубы
        ctx.drawImage(pipeUp, pipe[i].x, pipe[i].y);
        ctx.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap);

        // Двигаем трубы влево
        pipe[i].x--;

        // Увеличиваем счёт, когда птица пролетает трубу
        if (pipe[i].x + pipeUp.width < xPos && !pipe[i].scored) {
            score++;
            pipe[i].scored = true; // Помечаем, что счёт за эту трубу учтён
            score_audio.play(); // Воспроизводим звук при наборе очков
            // Обновляем лучший результат
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
            }
        }

        // Добавляем новую трубу, когда текущая достигает середины
        if (pipe[i].x === 125) {
            pipe.push({
                x: cvs.width,
                y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height,
                scored: false
            });
        }

        // Проверка столкновения
        if (
            xPos + bird.width >= pipe[i].x &&
            xPos <= pipe[i].x + pipeUp.width &&
            (
                yPos <= pipe[i].y + pipeUp.height ||
                yPos + bird.height >= pipe[i].y + pipeUp.height + gap
            ) ||
            yPos + bird.height >= cvs.height - fg.height
        ) {
            restartGame(); // Перезапускаем игру без перезагрузки страницы
            return;
        }
    }

    // Рисуем передний план (землю)
    ctx.drawImage(fg, 0, cvs.height - fg.height, cvs.width, fg.height);

    // Применяем гравитацию
    yPos += grav;

    // Рисуем птицу
    ctx.drawImage(bird, xPos, yPos);

    // Рисуем счёт
    ctx.fillStyle = "#FFF"; // Белый цвет текста
    ctx.strokeStyle = "#000"; // Чёрная обводка
    ctx.lineWidth = 2;
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.strokeText("Score: " + score, 10, 30);
    ctx.fillText("Best: " + bestScore, 10, 60);
    ctx.strokeText("Best: " + bestScore, 10, 60);

    // Запрашиваем следующий кадр анимации
    requestAnimationFrame(draw);
}