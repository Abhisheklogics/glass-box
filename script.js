let graph = {};
let front = [];
let visited = []; 
let algo = "";
let step = 0;
let current = null;


function buildGraph() {
  graph = {};
  front = [];
  visited = [];
  step = 0;
  current = null;

  algo = document.getElementById("algo").value;
  const nodes = document.getElementById("nodes").value.trim().split(/\s+/);
  const edges = document.getElementById("edges").value.trim().split("\n");
  const start = document.getElementById("startNode").value.trim();

  nodes.forEach(n => graph[n] = []);

  edges.forEach(e => {
    const [u, v] = e.trim().split(/\s+/);
    if (graph[u] && v && !graph[u].includes(v)) graph[u].push(v);
  });

  front.push(start);

  renderAdj();
  renderFront();


  renderVisited();
  renderCode();
  drawGraph();
  updateGraphState(null);
  document.getElementById("explain").textContent =
    "Graph built. Click Next Step.";
}


function renderAdj() {
  let out = "";
  for (let k in graph) {
    out += `<b>${k}</b>: ${graph[k].join(", ") || "None"}<br>`;
  }
  document.getElementById("adj").innerHTML = out;
}


function renderFront() {
  
  document.getElementById("queue").innerHTML = "";
  
  document.getElementById("stack").innerHTML = "";

  if (algo === "bfs") {
    front.forEach((n,i) => {
    const d = document.createElement("div");
    d.className = "item";
    d.textContent = i===0 ? `FRONT → ${n}`: n;
    document.getElementById("queue").appendChild(d);
    });
  }

  if (algo === "dfs") {
    [...front].reverse().forEach((n,i) => {
    const d = document.createElement("div");
    d.className = "item stack-item";
    d.textContent = i===0 ? `TOP → ${n}` : n;
    document.getElementById("stack").appendChild(d);
    });
  }
}


function renderVisited() {
  
  const v = document.getElementById("visited");
  v.innerHTML = "";
 visited.forEach(n => {
    const s = document.createElement("span");
    s.textContent = n;
    v.appendChild(s);
  
  });
}



function nextStep() {
  if (front.length === 0 && step % 4 === 0) {
    document.getElementById("explain").textContent = "Traversal finished. front empty.";
    renderCode(); 
    updateGraphState(null);
    return;
  }

  const phase = step % 4;

  if (phase === 0) { 
    if (front.length === 0) return;
    if (algo === "bfs") {
      current = front.shift();
      document.getElementById("explain").innerHTML =
        `<b>BFS</b>: Dequeued <b>${current}</b> from Queue (FIFO)`;
    } else {
      current = front.pop();
      document.getElementById("explain").innerHTML =
        `<b>DFS</b>: Popped <b>${current}</b> from Stack (LIFO)`;
    }
  } 
  else if (phase === 1) { 
    document.getElementById("explain").innerHTML =
      `Checking if <b>${current}</b> is already visited`;
  } 
  else if (phase === 2) { 
    if (!visited.includes(current)) {
      visited.push(current);
      document.getElementById("explain").innerHTML =
        `Added <b>${current}</b> to Visited list`;
    } else {
      document.getElementById("explain").innerHTML =
        `<b>${current}</b> already visited, skipping`;
    }
  } 
  else if (phase === 3) { 
    if (!visited.includes(current)) return;

    const neighbors = graph[current] || [];
    neighbors.forEach(n => {
      if (!visited.includes(n) && !front.includes(n)) {
        front.push(n);
      }
      highlightEdge(current, n);
    });

    document.getElementById("explain").innerHTML =
      `Pushed neighbors of <b>${current}</b> → ${neighbors.join(", ") || "None"}`;
  }

  step++;
  
  renderFront();
 
  renderVisited();
  renderCode();       
  updateGraphState(current);
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

  const pseudoLine = Math.floor(step % pseudo.length);
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




function drawGraph() {
  const svg = document.getElementById("graphSVG");
  svg.innerHTML = `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#555"/></marker></defs>`;

  const nodes = Object.keys(graph);
  const centerX=200, centerY=200, radius=140;
  let positions = {};

  nodes.forEach((n,i)=>{
    const angle = (2*Math.PI/nodes.length)*i;
    positions[n]={x:centerX+radius*Math.cos(angle), y:centerY+radius*Math.sin(angle)};
  });

  // edges
  for(let u in graph){
    graph[u].forEach(v=>{
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1",positions[u].x);
      line.setAttribute("y1",positions[u].y);
      line.setAttribute("x2",positions[v].x);
      line.setAttribute("y2",positions[v].y);
      line.setAttribute("stroke","#555");
      line.setAttribute("stroke-width","1");
      line.setAttribute("marker-end","url(#arrow)");
      line.dataset.from = u;
      line.dataset.to = v;
      svg.appendChild(line);
    });
  }

  // nodes
  nodes.forEach(n=>{
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",positions[n].x);
    c.setAttribute("cy",positions[n].y);
    c.setAttribute("r",18);
    c.setAttribute("id",`node-${n}`);
    c.setAttribute("fill","#e0e0e0");
    svg.appendChild(c);

    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("x",positions[n].x);
    t.setAttribute("y",positions[n].y+5);
    t.setAttribute("text-anchor","middle");
    t.textContent = n;
    svg.appendChild(t);
  });
}


function updateGraphState(current) {
  
document.querySelectorAll("line").forEach(l=>{
    l.setAttribute("stroke","#555");
    l.setAttribute("stroke-width","1");
  });

  Object.keys(graph).forEach(n=>{
    const node = document.getElementById(`node-${n}`);
    if(!node) return;

    let color="#e0e0e0";
    if(front.includes(n)) color="#64b5f6";
    if(visited.includes(n)) color="#81c784";
    if(n===current) color="#ff7043";

    node.setAttribute("fill",color);
  });


  if(current){
    graph[current].forEach(n=>{
      if(!visited.includes(n)){
  const edge = [...document.querySelectorAll("line")].find(l=>l.dataset.from===current && l.dataset.to===n);
    if(edge){
          edge.setAttribute("stroke","#ff7043");
          edge.setAttribute("stroke-width","3");
        }
      }
    });
  }
}

function highlightEdge(from,to){
  const edge = [...document.querySelectorAll("line")].find(l=>l.dataset.from===from && l.dataset.to===to);
  console.log('ye rahe edge',edge)
  if(edge){
    edge.setAttribute("stroke","#ff7043");
    edge.setAttribute("stroke-width","3");
  }
}
