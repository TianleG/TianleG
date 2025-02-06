let rotation = 0;
let image = null;
let rotationDirection = 0;
let animationFrameId = null;
const ROTATION_SPEED = 1; // 度/帧

// 用于 3D 旋转的变量
let isDragging = false;
let startX = 0;
let startY = 0;
let currentRotX = 0;
let currentRotY = 0;
const ROTATION_SENSITIVITY = 0.5;

function startRotation(direction) {
    rotationDirection = direction;
    if (!animationFrameId) {
        animateRotation();
    }
}

function stopRotation() {
    rotationDirection = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function animateRotation() {
    rotation += rotationDirection * ROTATION_SPEED;
    rotation = rotation % 360; // 保持角度在0-359之间
    drawCanvases();
    animationFrameId = requestAnimationFrame(animateRotation);
}

// 为所有按钮添加事件监听
document.querySelectorAll('#rotateLeft, #rotateRight').forEach(btn => {
    btn.addEventListener('mouseup', stopRotation);
    btn.addEventListener('mouseleave', stopRotation);
    btn.addEventListener('touchend', stopRotation);
});

document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        image = new Image();
        image.onload = function () {
            rotation = 0;
            drawCanvases();
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
});


function drawCanvases() {
    const container = document.querySelector('.section');
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    drawOriginal(width, height);
    drawMirror(width, height);
}

function drawOriginal(width, height) {
    const canvas = document.getElementById('originalCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!image) return;

    ctx.save();

    // 设置透视投影
    const perspective = 1000;
    ctx.translate(width / 2, height / 2);

    // 应用3D变换矩阵
    apply3DTransform(ctx, width, height);

    // 原有旋转逻辑
    ctx.rotate(rotation * Math.PI / 180);

    // 计算缩放比例
    const imgWidth = rotation % 180 === 0 ? image.width : image.height;
    const imgHeight = rotation % 180 === 0 ? image.height : image.width;
    const scale = Math.min(width / imgWidth, height / imgHeight);

    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
}
function apply3DTransform(ctx, width, height) {
    // 创建3D变换矩阵
    const matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, -1 / 1000,
        currentRotX, currentRotY, 0, 1
    ];

    // 应用矩阵变换
    ctx.transform(
        matrix[0], matrix[1],
        matrix[4], matrix[5],
        matrix[12], matrix[13]
    );
}

// 新增鼠标事件处理
document.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchstart', startDrag);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const pos = getMousePos(e);
    const deltaX = pos.x - startX;
    const deltaY = pos.y - startY;

    currentRotY += deltaX * ROTATION_SENSITIVITY;
    currentRotX -= deltaY * ROTATION_SENSITIVITY;

    // 限制旋转角度范围
    currentRotX = Math.max(-90, Math.min(90, currentRotX));

    startX = pos.x;
    startY = pos.y;

    updateRotationDisplay();
    drawCanvases();
}

function endDrag() {
    isDragging = false;
}

function getMousePos(e) {
    const rect = document.body.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function updateRotationDisplay() {
    document.getElementById('rotX').textContent = Math.round(currentRotX);
    document.getElementById('rotY').textContent = Math.round(currentRotY);
}
// 修改镜像绘制函数
function drawMirror(width, height) {
    const canvas = document.getElementById('mirrorCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!image) return;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    // 应用相同的3D变换
    apply3DTransform(ctx, width, height);

    // 镜像特有变换
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(-1, 1);

    // 计算缩放比例
    const imgWidth = rotation % 180 === 0 ? image.width : image.height;
    const imgHeight = rotation % 180 === 0 ? image.height : image.width;
    const scale = Math.min(width / imgWidth, height / imgHeight);

    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
}