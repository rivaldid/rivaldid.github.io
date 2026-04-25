// Configurazione Dati Grafo
const graphData = {
    nodes: window.messagesIndex.map(file => ({ id: file, name: file })),
    links: []
};

// Creazione collegamenti a raggiera (estetico)
if (graphData.nodes.length > 1) {
    for(let i=1; i < graphData.nodes.length; i++) {
        graphData.links.push({ source: graphData.nodes[0].id, target: graphData.nodes[i].id });
    }
}

document.getElementById('node-count').innerText = graphData.nodes.length;

// Inizializzazione Grafo
const Graph = ForceGraph()
    (document.getElementById('graph-container'))
    .graphData(graphData)
    .nodeColor(() => '#00ff00')
    .linkColor(() => '#004400')
    .linkWidth(1)
    .enablePanInteraction(false)
    
    // Logica di blocco posizione nodi
    .onNodeDrag((node) => {
        node.fx = node.x;
        node.fy = node.y;
    })
    .onNodeDragEnd(node => {
        node.fx = node.x;
        node.fy = node.y;
    })
    
    // Apertura file al click
    .onNodeClick(node => {
        openFileContent(node.id);
    })
    
    .nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 14/globalScale;
        ctx.font = `${fontSize}px "Courier New"`;
        ctx.fillStyle = '#00ff00';
        ctx.fillText(label, node.x + 8, node.y + 3);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ff00";
    });

// --- GESTIONE FINESTRE ---

function openFileContent(fileName) {
    const existingWin = document.getElementById(`win-${fileName}`);
    if (existingWin) {
        bringToFront(existingWin);
        return;
    }

    fetch(`messages/${fileName}`)
        .then(response => response.text())
        .then(text => {
            createWindow(fileName, marked.parse(text));
        })
        .catch(err => console.error("Errore caricamento file:", err));
}

function createWindow(title, content) {
    const win = document.createElement('div');
    win.id = `win-${title}`;
    win.className = 'window';
    win.style.top = '150px';
    win.style.left = '150px';

    win.innerHTML = `
        <div class="window-header" onmousedown="dragStart(event, this.parentElement)">
            <span>${title}</span>
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">[X]</span>
        </div>
        <div class="window-content">${content}</div>
    `;

    document.body.appendChild(win);
    bringToFront(win);
}

// --- LOGICA DRAG & DROP FINESTRE ---

let activeWin = null;
let offset = { x: 0, y: 0 };

window.dragStart = function(e, win) {
    activeWin = win;
    bringToFront(win);
    offset.x = e.clientX - win.offsetLeft;
    offset.y = e.clientY - win.offsetTop;
    document.onmousemove = dragMove;
    document.onmouseup = dragEnd;
};

function dragMove(e) {
    if (activeWin) {
        activeWin.style.left = (e.clientX - offset.x) + 'px';
        activeWin.style.top = (e.clientY - offset.y) + 'px';
    }
}

function dragEnd() {
    activeWin = null;
    document.onmousemove = null;
}

let zIndexCounter = 100;
function bringToFront(win) {
    win.style.zIndex = ++zIndexCounter;
}

// Resize responsive del grafo
window.addEventListener('resize', () => {
    Graph.width(window.innerWidth).height(window.innerHeight);
});
