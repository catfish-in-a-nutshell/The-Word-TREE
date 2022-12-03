var secret_canvas;
var secret_ctx;

var right_tab;

function retrieveSecretCanvasData() {
	let treeCanv = document.getElementById("secret-canvas")
	if (treeCanv===undefined || treeCanv===null) return false
	secret_canvas = treeCanv;
	secret_ctx = secret_canvas.getContext("2d");
    right_tab = document.getElementById("right-tab")
	return true;
}

function resizeSecretCanvas() {
	if (!retrieveSecretCanvasData()) return
	secret_canvas.width = 0;
    secret_canvas.height = 0;
	secret_canvas.width  = window.innerWidth;
	secret_canvas.height = window.innerHeight;
    drawSecretCanvas();
}

var record_target = {}

function drawSecretCanvas() {
	if (!retrieveSecretCanvasData()) return;
	secret_ctx.clearRect(0, 0, secret_canvas.width, secret_canvas.height)

    if (player.tab == "none") return false
    for (let ach in layers.s.achievements) {
        let achID = "achievement_s" + ach

        let element = document.getElementById(achID)
        if (element===undefined || element===null) continue
            
        let rect = element.getBoundingClientRect()
        
        let x1 = rect.left + document.body.scrollLeft
        let x2 = rect.left + rect.width + document.body.scrollLeft
        let y = rect.top + rect.height + document.body.scrollTop

        secret_ctx.lineWidth = 2
        secret_ctx.beginPath()
        secret_ctx.strokeStyle = "white"

        secret_ctx.shadowOffsetX = 2
        secret_ctx.shadowOffsetY = 2
        secret_ctx.shadowBlur = 0;
        secret_ctx.shadowColor = "#00000022"

        secret_ctx.moveTo(x1, y)
        secret_ctx.lineTo(x2, y)
        secret_ctx.stroke()

        let ach_obj = layers.s.achievements[ach]
        let x = ach_obj.is_left_stroke ? x1 : x2

        let offset = ach_obj.offset
        if (record_target[ach]) {
            offset = [offset[0], record_target[ach][1] - y]
        } else {
            record_target[ach] = [x + offset[0], y + offset[1], ]
        }

        let xt = x + offset[0] * 0.7
        let yt = y + offset[1] * 0.7

        let xe = x + offset[0]
        let ye = y + offset[1]
        
        secret_ctx.moveTo(x, y)
        secret_ctx.lineTo(xt, yt)
        secret_ctx.stroke()
        
        let grd = secret_ctx.createRadialGradient(xe, ye, 0, xe, ye, 20)
        grd.addColorStop(0, "white")
        grd.addColorStop(0.15, "#95a5a6")
        grd.addColorStop(1, "#00000000")

        secret_ctx.fillStyle = grd
        
        secret_ctx.beginPath()
        secret_ctx.arc(xe, ye, 10, 0, Math.PI*2)
        secret_ctx.fill()
    }
}
