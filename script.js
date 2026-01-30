let graph = {};
let front = [];
let visited = [];
let algo = "";
let step = 0;
let dist = {}; 
let prev = {};
let current = null;
let  goalNode;
let visitedEdges = new Set();   
let shortestPathEdges = new Set();

let isRunning = false;   
let runTimer = null;    








document.getElementById("runBtn").addEventListener("click", runTraversal);
document.getElementById("pauseBtn").addEventListener("click", stopAutoRun);

function buildGraph() {

  graph = {};
  front = [];
  visited = [];
  step = 0;
  current = null;
  dist = {};
  prev = {};

  algo = document.getElementById("algo").value;
  const mode = document.getElementById("graphMode").value;
  const start = document.getElementById("startNode").value.trim();
  goalNode = document.getElementById("goalNode")?.value?.trim() || null;

  // ===== BUILD GRAPH =====
  if (mode !== "manual") {
    const nodes = document.getElementById("nodes").value.trim().split(/\s+/);
    const edges = document.getElementById("edges").value.trim().split("\n");

    nodes.forEach(n => graph[n] = []);
    manualGraph.edges = [];

    edges.forEach(e => {
      const [u, v, w] = e.trim().split(/\s+/);
      if (graph[u] && v) {
        graph[u].push(v);
        manualGraph.edges.push({
          from: u,
          to: v,
          weight: w ? parseInt(w) : null
        });
      }
    });
  } else {
    Object.keys(manualGraph.nodes).forEach(n => graph[n] = []);
    manualGraph.edges.forEach(e => {
      if (!graph[e.from].includes(e.to)) {
        graph[e.from].push(e.to);
      }
    });
  }

  // ===== VALIDATION =====
  if (!graph[start]) {
    alert("❌ Invalid Start Node");
    return;
  }

  if ((algo === "dijkstra" || algo === "astar") &&
      !manualGraph.edges.some(e => e.weight != null)) {
    alert("❌ Dijkstra / A* need WEIGHTED graph");
    return;
  }

  if (algo === "astar" && !goalNode) {
    alert("❌ A* needs a GOAL node");
    return;
  }

  // ===== INIT =====
  Object.keys(graph).forEach(n => dist[n] = Infinity);
  dist[start] = 0;
  front = [start];

  document.getElementById("internal").innerHTML = "";

  renderAdj();
  renderFront();
  renderVisited();
  renderCode();
  drawGraph();
  updateGraphState(null);

  document.getElementById("explain").innerHTML =
    "Graph built. Click <b>Next Step</b>.";
}



function heuristic(a, b) {
  const pa = manualGraph.nodes[a];
  const pb = manualGraph.nodes[b];
  if (!pa || !pb) return 0;

  return Math.sqrt(
    Math.pow(pa.x - pb.x, 2) +
    Math.pow(pa.y - pb.y, 2)
  );
}



let traversalFinished = false; 
function nextStep() {
  if (traversalFinished) return;

if (front.length === 0 && step % 4 === 0) {

  traversalFinished = true;   // 🔥 pehle

  if (algo === "dijkstra" || algo === "astar") {
    buildShortestPath();      // 🔥 path build
  }

  document.getElementById("explain").innerHTML +=
    "<br><b>Traversal finished.</b>";

  updateGraphState(null);     // 🔥 ab highlight hoga

  clearInterval(runTimer);
  isRunning = false;
  return;
}


  const phase = step % 4;

  // ===== CLEAR INTERNAL PANEL =====
  if (phase === 0) {
    document.getElementById("internal").innerHTML = "";
  }

  // ===== PHASE 0: SELECT NODE =====
  if (phase === 0) {
    if (algo === "bfs") {
      current = front.shift();
    } else if (algo === "dfs") {
      current = front.pop();
    } else {
      // 🔥 Dijkstra / A*
      front.sort((a, b) => {
        if (algo === "dijkstra") return dist[a] - dist[b];
        else return (dist[a] + heuristic(a, goalNode)) - (dist[b] + heuristic(b, goalNode));
      });
      current = front.shift();
    }

    document.getElementById("explain").innerHTML =
      `<b>${algo.toUpperCase()}</b>: Selected <b>${current}</b>
       ${(algo !== "bfs" && algo !== "dfs") ? `(g=${dist[current]})` : ""}`;
  }

  // ===== PHASE 1: CHECK =====
  else if (phase === 1) {
    document.getElementById("explain").innerHTML =
      `Checking if <b>${current}</b> is finalized`;
  }

  // ===== PHASE 2: MARK =====
  else if (phase === 2) {
    if (!visited.includes(current)) {
      visited.push(current);
      document.getElementById("explain").innerHTML =
        `Finalized <b>${current}</b>`;
    }
  }

  // ===== PHASE 3: EXPLORE =====
  else {
    if (!visited.includes(current)) return;

    (graph[current] || []).forEach(n => {
      let weight = 1;
      const edge = manualGraph.edges.find(e => e.from === current && e.to === n);
      if (edge?.weight != null) weight = edge.weight;

      if (algo === "bfs" || algo === "dfs") {
        if (!visited.includes(n) && !front.includes(n)) front.push(n);
      } else {
        const g = dist[current];
        const h = algo === "astar" ? heuristic(n, goalNode) : 0;
        const newDist = g + weight;

        document.getElementById("internal").innerHTML += `
          <div>
            <b>${current} → ${n}</b><br>
            g = ${g}<br>
            weight = ${weight}<br>
            ${algo === "astar" ? `h = ${h.toFixed(2)}<br>` : ""}
            <b>${algo === "astar"
              ? `f = ${(newDist + h).toFixed(2)}`
              : `newDist = ${newDist}`}</b>
            <hr>
          </div>
        `;

        if (newDist < dist[n]) {
          dist[n] = newDist;
          prev[n] = current;
          if (!front.includes(n)) front.push(n);
        }
      }
visitedEdges.add(`${current}->${n}`);
      highlightEdge(current, n);
    });

    document.getElementById("explain").innerHTML =
      `Processed neighbors of <b>${current}</b>`;
  }

  step++;
  renderFront();
  renderVisited();
  renderCode();
 
  updateGraphState(current);
}

function startAutoRun() {
  clearInterval(runTimer); // just in case

  isRunning = true;
  disableManualEditing();

  runTimer = setInterval(() => {
    if (!traversalFinished) {
      nextStep();
    }
  }, getSpeed());
}
function getSpeed() {
  // Higher slider value = faster execution
  const sliderVal = Number(document.getElementById("speed").value);
  // Map 200-1500 to 1500-200
  return 1600 - sliderVal;
}

document.getElementById("speed").addEventListener("input", () => {
  if (isRunning) {
    clearInterval(runTimer);
    runTimer = setInterval(nextStep, getSpeed());
  }
});

document.getElementById("speed").addEventListener("input", () => {
  if (isRunning) {
    clearInterval(runTimer);
    runTimer = setInterval(nextStep, getSpeed());
  }
});

function runTraversal() {
  if (isRunning) return;

  // 🔁 RESET EVERYTHING
  traversalFinished = false;
  step = 0;
  visited = [];
  front = [];
  prev = {};
  dist = {};

  document.getElementById("explain").innerHTML = "";
  document.getElementById("internal").innerHTML = "";

  const mode = document.getElementById("graphMode").value;

  if (mode === "manual") {
    if (Object.keys(manualGraph.nodes).length === 0) {
      alert("Create at least one node first");
      return;
    }
  }

  // rebuild graph + init dist/front
  buildGraph();

  // ▶️ start traversal
  startAutoRun();
}

function stopAutoRun() {
  isRunning = false;
  clearInterval(runTimer);
  runTimer = null;

  enableManualEditing();

  document.getElementById("explain").textContent = "Paused. You can edit graph now.";
}
function renderAdj() {
  let out = "";
  for (let k in graph) {
    out += `<b>${k}</b>: ${graph[k].join(", ") || "None"}<br>`;
  }
  document.getElementById("adj").innerHTML = out;
}


function renderFront() {
  const q = document.getElementById("queue");
  const s = document.getElementById("stack");
  q.innerHTML = "";
  s.innerHTML = "";

  if (algo === "bfs") {
    s.style.display = "none";
    q.style.display = "flex";

    front.forEach((n, i) => {
      const d = document.createElement("div");
      d.className = "queue-item";
      d.textContent = i === 0 ? `FRONT → ${n}` : n;
      q.appendChild(d);
    });
  }

  if (algo === "dfs") {
    q.style.display = "none";
    s.style.display = "flex";

    [...front].forEach((n, i) => {
      const d = document.createElement("div");
      d.className = "stack-item";
      d.textContent = i === front.length - 1 ? `TOP → ${n}` : n;
      s.appendChild(d);
    });
  }
}
function buildShortestPath() {
  shortestPathEdges.clear();   

  let path = [];
  let cur = goalNode;

  while (cur && prev[cur]) {
    path.push(cur);
    shortestPathEdges.add(`${prev[cur]}->${cur}`); 
    cur = prev[cur];
  }

  if (cur) path.push(cur);

  path.reverse();

  document.getElementById("explain").innerHTML += `
    <br><b>Shortest Path:</b> ${path.join(" → ")}
    <br><b>Total Cost:</b> ${dist[goalNode]}
  `;
}





function renderVisited() {
  const v = document.getElementById("visitedBox");
  v.innerHTML = "";
  visited.forEach(n => {
    const s = document.createElement("span");
    s.textContent = n;
    v.appendChild(s);
  });
}

 function drawGraph() {
  const svg = document.getElementById("graphSVG");
  const mode = document.getElementById("graphMode").value;

  svg.innerHTML = `
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10"
      refX="10" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#555"/>
    </marker>
  </defs>`;

  const nodes = Object.keys(graph);
  let positions = {};

  // ===== NODE POSITIONS =====
  if (mode === "manual") {
    // use user-created positions
    positions = { ...manualGraph.nodes };
  } else {
    // auto circular layout
    const centerX = 200, centerY = 200, radius = 140;
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI / nodes.length) * i;
      positions[n] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }

 
for (let u in graph) {
  graph[u].forEach(v => {
    if (!positions[u] || !positions[v]) return;

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg", "line"
    );

    line.setAttribute("x1", positions[u].x);
    line.setAttribute("y1", positions[u].y);
    line.setAttribute("x2", positions[v].x);
    line.setAttribute("y2", positions[v].y);
    line.setAttribute("stroke", "#555");
    line.setAttribute("stroke-width", "1");
    const edgeData = manualGraph.edges.find(
  e => e.from === u && e.to === v
);

if (
  edgeData &&
  edgeData.directed &&
  (algo === "bfs" || algo === "dfs" || algo === "dijkstra" || algo === "astar")
) {
  line.setAttribute("marker-end", "url(#arrow)");
} else {
  line.removeAttribute("marker-end");
}
    line.dataset.from = u;
    line.dataset.to = v;

    svg.appendChild(line);

    // ✅ WEIGHT TEXT (always visible)
    const edge = manualGraph.edges.find(e => e.from === u && e.to === v);
    if (
  edge &&
  edge.weight != null &&
  (algo === "dijkstra" || algo === "astar")
) {
      const t = document.createElementNS(
        "http://www.w3.org/2000/svg", "text"
      );
      t.setAttribute("x", (positions[u].x + positions[v].x) / 2);
      t.setAttribute("y", (positions[u].y + positions[v].y) / 2);
      t.setAttribute("fill", "#ff9800");
      t.textContent = edge.weight;
      svg.appendChild(t);
    }
  });
}


  // ===== NODES =====
  nodes.forEach(n => {
    if (!positions[n]) return;

    const c = document.createElementNS(
      "http://www.w3.org/2000/svg", "circle"
    );
    c.setAttribute("cx", positions[n].x);
    c.setAttribute("cy", positions[n].y);
    c.setAttribute("r", 18);
    c.setAttribute("id", `node-${n}`);
    c.setAttribute("fill", "#e0e0e0");
    svg.appendChild(c);

    const t = document.createElementNS(
      "http://www.w3.org/2000/svg", "text"
    );
    t.setAttribute("x", positions[n].x);
    t.setAttribute("y", positions[n].y + 5);
    t.setAttribute("text-anchor", "middle");
    t.textContent = n;
    svg.appendChild(t);
  });
}





 function renderCode() {
  const lang = document.getElementById("lang").value;
  const phase = step % 4;

  const pseudo = algo === "bfs" ? [
    "queue = [start]",
    "visited = []",
    "while queue not empty:",
    "  current = queue.dequeue()",
    "  if current not visited:",
    "    visited.add(current)",
    "    for each neighbor:",
    "      queue.enqueue(neighbor)"
  ] : [
    "stack = [start]",
    "visited = []",
    "while stack not empty:",
    "  current = stack.pop()",
    "  if current not visited:",
    "    visited.add(current)",
    "    for each neighbor:",
    "      stack.push(neighbor)"
  ];

  const pseudoLine = Math.min(step % 4 + 2, pseudo.length - 1);
  document.getElementById("pseudo").innerHTML =
    pseudo.map((l,i)=>`<div class="${i===pseudoLine?'highlight':''}">${l}</div>`).join("\n");


  let actual = [];
  let activeLines = [];
  const frontierStr = `[${front.join(", ")}]`;
  const visitedStr = `[${visited.join(", ")}]`;

  if(lang==='js'){
    if(algo==='bfs'){
      actual = [
        `// BFS in JavaScript`,
        `let queue = ${frontierStr};`,
        `let visited = ${visitedStr};`,
        ``,
        `while(queue.length > 0) {`,
        `  let current = queue.shift();`,
        `  if(!visited.includes(current)) {`,
        `    visited.push(current);`,
        `  for(let n of graph[current]) {`,
        `            queue.push(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[4];
      else if(phase===1) activeLines=[5];
      else if(phase===2) activeLines=[6];
      else if(phase===3) activeLines=[7,8];
    } 
    
    else { 
      actual = [
        `// DFS in JavaScript`,
        `let stack = ${frontierStr};`,
        `let visited = ${visitedStr};`,
        ``,
        `while(stack.length > 0) {`,
        `    let current = stack.pop();`,
        `    if(!visited.includes(current)) {`,
        `        visited.push(current);`,
        `        for(let n of graph[current]) {`,
        `            stack.push(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[4];
      else if(phase===1) activeLines=[5];
      else if(phase===2) activeLines=[6];
      else if(phase===3) activeLines=[7,8];
    }
  }

  else if(lang==='py'){
    if(algo==='bfs'){
      actual = [
        `# BFS in Python`,
        `queue = ${frontierStr}`,
        `visited = ${visitedStr}`,
        ``,
        `while queue:`,
        `    current = queue.pop(0)`,
        `    if current not in visited:`,
        `        visited.append(current)`,
        `        for n in graph[current]:`,
        `            queue.append(n)`
      ];
      if(phase===0) activeLines=[4];
      else if(phase===1) activeLines=[5];
      else if(phase===2) activeLines=[6];
      else if(phase===3) activeLines=[7,8];
    }
    else { 
      actual = [
        `# DFS in Python`,
        `stack = ${frontierStr}`,
        `visited = ${visitedStr}`,
        ``,
        `while stack:`,
        `    current = stack.pop()`,
        `    if current not in visited:`,
        `        visited.append(current)`,
        `        for n in graph[current]:`,
        `            stack.append(n)`
      ];
 
  if(phase===0) activeLines=[4];
      else if(phase===1) activeLines=[5];
      else if(phase===2) activeLines=[6];
      else if(phase===3) activeLines=[7,8];
    }
  }

  else if(lang==='cpp'){
    if(algo==='bfs'){
      actual = [
        `// BFS in C++`,
        `#include <iostream>`,
        `#include <queue>`,
        `#include <set>`,
        `#include <map>`,
        ``,
        `std::queue<char> q; // frontier: ${front.join(", ")}`,
        `std::set<char> visited; // visited: ${visited.join(", ")}`,
        ``,
        `while(!q.empty()) {`,
        `    char current = q.front(); q.pop();`,
        `    if(!visited.count(current)) {`,
        `        visited.insert(current);`,
        `        for(char n : graph[current]) {`,
        `            q.push(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[9];
      else if(phase===1) activeLines=[10];
      else if(phase===2) activeLines=[11];
      else if(phase===3) activeLines=[12,13];
    } 
    else { 
      actual = [
        `// DFS in C++`,
        `#include <iostream>`,
        `#include <stack>`,
        `#include <set>`,
        `#include <map>`,
        ``,
        `std::stack<char> s; // frontier: ${front.join(", ")}`,
        `std::set<char> visited; // visited: ${visited.join(", ")}`,
        ``,
        `while(!s.empty()) {`,
        `    char current = s.top(); s.pop();`,
        `    if(!visited.count(current)) {`,
        `        visited.insert(current);`,
        `        for(char n : graph[current]) {`,
        `            s.push(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[9];
      else if(phase===1) activeLines=[10];
      else if(phase===2) activeLines=[11];
      else if(phase===3) activeLines=[12,13];
    }
  }

  else if(lang==='java'){
    if(algo==='bfs'){
      actual = [
        `// BFS in Java`,
        `import java.util.*;`,
        ``,
        `Queue<Character> q = new LinkedList<>(); // frontier: ${front.join(", ")}`,
        `Set<Character> visited = new HashSet<>(); // visited: ${visited.join(", ")}`,
        ``,
        `while(!q.isEmpty()) {`,
        `    char current = q.poll();`,
        `    if(!visited.contains(current)) {`,
        `        visited.add(current);`,
        `        for(char n : graph.get(current)) {`,
        `            q.add(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[6];
      else if(phase===1) activeLines=[7];
      else if(phase===2) activeLines=[8];
      else if(phase===3) activeLines=[9,10];
    } else { 
      actual = [
        `// DFS in Java`,
        `import java.util.*;`,
        ``,
        `Stack<Character> s = new Stack<>(); // frontier: ${front.join(", ")}`,
        `Set<Character> visited = new HashSet<>(); // visited: ${visited.join(", ")}`,
        ``,
        `while(!s.isEmpty()) {`,
        `    char current = s.pop();`,
        `    if(!visited.contains(current)) {`,
        `     visited.add(current);`,
        `       for(char n : graph.get(current)) {`,
        `        s.push(n);`,
        `        }`,
        `    }`,
        `}`
      ];
      if(phase===0) activeLines=[6];
      else if(phase===1) activeLines=[7];
      else if(phase===2) activeLines=[8];
      else if(phase===3) activeLines=[9,10];
    }
  }

  document.getElementById("actual").innerHTML =
    actual.map((l,i)=>`<div class="${activeLines.includes(i)?'highlight':''}">${l}</div>`).join("\n");
}

function disableManualEditing() {
  document.getElementById("graphSVG").style.pointerEvents = "none";
}

function enableManualEditing() {
  document.getElementById("graphSVG").style.pointerEvents = "auto";
}







function updateGraphState(current) {

  // ===== RESET ALL EDGES =====
  document.querySelectorAll("line").forEach(l => {
    l.setAttribute("stroke", "#555");
    l.setAttribute("stroke-width", "1");
    l.removeAttribute("marker-end");
  });

  // ===== VISITED EDGES (BLUE) =====
  visitedEdges.forEach(key => {
    const [u, v] = key.split("->");
    const edge = [...document.querySelectorAll("line")]
      .find(l => l.dataset.from === u && l.dataset.to === v);

    if (edge) {
      edge.setAttribute("stroke", "#90caf9");
      edge.setAttribute("stroke-width", "2");
    }
  });

  // ===== NODE COLORS =====
  Object.keys(graph).forEach(n => {
    const node = document.getElementById(`node-${n}`);
    if (!node) return;

    let color = "#e0e0e0";        // normal
    if (front.includes(n)) color = "#64b5f6";    // frontier
    if (visited.includes(n)) color = "#81c784"; // visited
    if (n === current) color = "#ff7043";        // current

    node.setAttribute("fill", color);
  });

  // ===== CURRENT STEP EDGE (ORANGE) =====
  if (!traversalFinished && current) {
    (graph[current] || []).forEach(n => {
      const edge = [...document.querySelectorAll("line")]
        .find(l => l.dataset.from === current && l.dataset.to === n);

      if (edge) {
        edge.setAttribute("stroke", "#ff7043");
        edge.setAttribute("stroke-width", "3");
      }
    });
  }

// ===== SHORTEST PATH (ONLY DIJKSTRA / ASTAR) =====
if (traversalFinished && (algo === "dijkstra" || algo === "astar")) {
  shortestPathEdges.forEach(key => {
    const [u, v] = key.split("->");

    const edge = [...document.querySelectorAll("line")]
      .find(l => l.dataset.from === u && l.dataset.to === v);

    if (edge) {
      edge.setAttribute("stroke", "#ffa000");
      edge.setAttribute("stroke-width", "4");
    }
  });
}

}



function highlightEdge(from, to) {
  const edge = [...document.querySelectorAll("line")]
    .find(l => l.dataset.from === from && l.dataset.to === to);

  if (!edge) return;

  edge.setAttribute("stroke", "#ff7043");
  edge.setAttribute("stroke-width", "3");

  const e = manualGraph.edges.find(
    x => x.from === from && x.to === to
  );

  // 🔥 arrow ONLY if directed
  if (!e || !e.directed) {
    edge.removeAttribute("marker-end");
  } else {
    edge.setAttribute("marker-end", "url(#arrow)");
  }
}




let manualGraph = {
  nodes: {},   // {A:{x,y}}
  edges: []    // {from,to,weight,directed}
};
let select=document.getElementById('graphMode')
let manualNodeCount = 0;
let manualSelectedNode = null;
let manualEdgeType = null;
let manualDragging = null;
function resetAll() {
  graph = {};
  front = [];
  visited = [];
  step = 0;
  current = null;
  dist = {};
  prev = {};
  visitedEdges = new Set();

  isRunning = false;
  clearInterval(runTimer);
  runTimer = null;

  manualGraph = { nodes:{}, edges:[] };
  manualNodeCount = 0;
  manualSelectedNode = null;
  manualEdgeType = null;

  document.getElementById("graphSVG").innerHTML = "";
  document.getElementById("queue").innerHTML = "";
  document.getElementById("stack").innerHTML = "";
  document.getElementById("visitedBox").innerHTML = "";
  document.getElementById("adj").innerHTML = "";
  document.getElementById("pseudo").innerHTML = "";
  document.getElementById("actual").innerHTML = "";
  document.getElementById("internal").innerHTML = "";
  document.getElementById("explain").textContent = "Reset done.";

  enableManualEditing();
}
let edgeFrom = null;
let edgeTo = null;


let reset=document.getElementById('reset')
reset.addEventListener('click',resetAll)

select.addEventListener('change',switchMode)
function switchMode() {
  const mode = document.getElementById("graphMode").value;

  const nodeEdge = document.getElementById("nodeEdgeControls");

  if (mode === "manual") {
    // hide only nodes & edges
    nodeEdge.style.display = "none";

    resetAll();
    enableManualMode();

    document.getElementById("explain").textContent =
      "Manual Mode: Build the graph visually. Set start and goal nodes.";
  } else {
    // show everything
    nodeEdge.style.display = "block";

    disableManualMode();

    document.getElementById("explain").textContent =
      "Input Mode: Define nodes and edges using text.";
  }
}
window.onload = switchMode;


function enableManualMode() {
  const svg = document.getElementById("graphSVG");
  svg.addEventListener("click", manualCreateNode);
}

function disableManualMode() {
  const svg = document.getElementById("graphSVG");
  svg.removeEventListener("click", manualCreateNode);
}
function manualCreateNode(e) {
  if (isRunning) return;   // 🔒 lock when running
  if (e.target.tagName !== "svg") return;

  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const label = prompt("Node label (A, B, 1, 2 etc)");
  if (!label) return;

  manualGraph.nodes[label] = { x, y };
  drawManualGraph();
}

function openEdgePopup() {
  document.getElementById("edgePopup").classList.remove("hidden");
}

function closeEdgePopup() {
  document.getElementById("edgePopup").classList.add("hidden");
  manualSelectedNode = null;
  drawManualGraph();
}

function manualNodeClick(node) {
  if (!manualSelectedNode) {
    manualSelectedNode = node;
    drawManualGraph();
    return;
  }

  if (manualSelectedNode === node) return;

  edgeFrom = manualSelectedNode;
  edgeTo = node;

  openEdgePopup();
}



function addManualEdge(from, to) {
  // duplicate edge check
  if (manualGraph.edges.some(e => e.from === from && e.to === to)) return;

  const type = document.getElementById("edgeType").value;

  let weight = null;
  let directed = type !== "undirected";

  if (type === "weighted") {
    const w = document.getElementById("edgeWeight").value;
    weight = parseInt(w);

    if (isNaN(weight)) {
      alert("Please enter a valid weight");
      return;
    }
  }

  // main edge
  manualGraph.edges.push({
    from,
    to,
    weight,
    directed
  });

  // reverse edge if undirected
  if (!directed) {
    manualGraph.edges.push({
      from: to,
      to: from,
      weight,
      directed
    });
  }
}

let dragNode = null;

let draggingNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function drawManualGraph() {
  const svg = document.getElementById("graphSVG");
  svg.innerHTML = "";

  // ----- EDGES -----
  manualGraph.edges.forEach(e => {
    const a = manualGraph.nodes[e.from];
    const b = manualGraph.nodes[e.to];

    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", "#888");
    line.setAttribute("stroke-width", "2");

    if (e.directed) {
      line.setAttribute("marker-end", "url(#arrow)");
    }

    svg.appendChild(line);

    if (e.weight != null) {
      const t = document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x", (a.x + b.x) / 2);
      t.setAttribute("y", (a.y + b.y) / 2);
      t.setAttribute("fill", "orange");
      t.textContent = e.weight;
      svg.appendChild(t);
    }
  });

  // ----- NODES -----
// ----- NODES -----
Object.keys(manualGraph.nodes).forEach(n => {
  const { x, y } = manualGraph.nodes[n];

  const c = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  c.setAttribute("cx", x);
  c.setAttribute("cy", y);
  c.setAttribute("r", 18);
  c.setAttribute(
    "fill",
    n === manualSelectedNode ? "orange" : "#64b5f6"
  );

  // 🟢 Drag start
  c.addEventListener("mousedown", (e) => {
    draggingNode = n;
    dragOffsetX = e.offsetX - x;
    dragOffsetY = e.offsetY - y;
    e.stopPropagation();
  });

  // 🟢 CLICK = select / connect node
  c.addEventListener("click", (e) => {
    e.stopPropagation();     // ⛔ svg click
    manualNodeClick(n);
  });

  svg.appendChild(c);

  // ----- LABEL -----
  const t = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  t.setAttribute("x", x);
  t.setAttribute("y", y + 5);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("fill", "#000");
  t.setAttribute("font-weight", "bold");
  t.textContent = n;

  // 🟢 Text click bhi node click
  t.addEventListener("click", (e) => {
    e.stopPropagation();
    manualNodeClick(n);
  });

  svg.appendChild(t);
});

}
document.getElementById("popupEdgeType").addEventListener("change", e => {
  document.getElementById("popupEdgeWeight").style.display =
    e.target.value === "weighted" ? "block" : "none";
});

function confirmEdge() {
  const type = document.getElementById("popupEdgeType").value;
  let weight = null;
  let directed = type !== "undirected";

  if (type === "weighted") {
    weight = parseInt(
      document.getElementById("popupEdgeWeight").value
    );
    if (isNaN(weight)) {
      alert("Enter valid weight");
      return;
    }
  }

  // duplicate check
  if (manualGraph.edges.some(e => e.from === edgeFrom && e.to === edgeTo)) {
    closeEdgePopup();
    return;
  }

  manualGraph.edges.push({ from: edgeFrom, to: edgeTo, weight, directed });

  if (!directed) {
    manualGraph.edges.push({
      from: edgeTo,
      to: edgeFrom,
      weight,
      directed
    });
  }

  document.getElementById("popupEdgeWeight").value = "";
  closeEdgePopup();
  drawManualGraph();
}


function deleteManualNode(node) {
  delete manualGraph.nodes[node];

  manualGraph.edges = manualGraph.edges.filter(
    e => e.from !== node && e.to !== node
  );

  manualSelectedNode = null;
  drawManualGraph();
}


function deleteSelectedNode() {
  if (!manualSelectedNode) {
    alert("Select a node first");
    return;
  }
  deleteManualNode(manualSelectedNode);
}

const svg = document.getElementById("graphSVG");

svg.addEventListener("mousemove", (e) => {
  if (!draggingNode) return;

  const rect = svg.getBoundingClientRect();
  manualGraph.nodes[draggingNode].x = e.clientX - rect.left - dragOffsetX;
  manualGraph.nodes[draggingNode].y = e.clientY - rect.top - dragOffsetY;

  drawManualGraph();
});

svg.addEventListener("mouseup", () => draggingNode = null);
svg.addEventListener("mouseleave", () => draggingNode = null);
