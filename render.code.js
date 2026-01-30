import { step } from "./script.js";
import { front } from "./script.js";
import { visited } from "./script.js";

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

export default renderCode