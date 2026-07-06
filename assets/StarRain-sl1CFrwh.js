import{H as e,L as t,V as n}from"./index-B19oN0MX.js";var r=e(n(),1),i=t(),a=[`#fbbf24`,`#f472b6`,`#60a5fa`,`#34d399`,`#a78bfa`,`#fb923c`,`#f87171`];function o({style:e}){return(0,i.jsx)(`div`,{className:`absolute text-white/30 pointer-events-none animate-[star-fall_linear_infinite]`,style:e,children:`★`})}function s({count:e=20}){let t=(0,r.useMemo)(()=>Array.from({length:e},(e,t)=>({id:t,left:`${Math.random()*100}%`,fontSize:`${8+Math.random()*12}px`,color:a[Math.floor(Math.random()*a.length)],duration:`${4+Math.random()*6}s`,delay:`${Math.random()*8}s`,opacity:.15+Math.random()*.25})),[e]);return(0,i.jsxs)(`div`,{className:`absolute inset-0 overflow-hidden pointer-events-none z-0`,children:[(0,i.jsx)(`style`,{children:`
        @keyframes star-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}),t.map(e=>(0,i.jsx)(o,{style:{left:e.left,fontSize:e.fontSize,color:e.color,animationDuration:e.duration,animationDelay:e.delay,opacity:e.opacity}},e.id))]})}export{s as t};