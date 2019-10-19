class Canvas 
{
    constructor(width, height, color) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.width = width;
        this.canvas.height  = height;
        this.canvas.style.backgroundColor = 'rgba(0,0,0,1)';
        const body = document.getElementById('root');
        body.appendChild(this.canvas);
        

        //const c = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    reset() {
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    

}

export default Canvas;
