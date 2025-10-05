(function(){
  const displayEl = document.getElementById('display');
  const grid = document.querySelector('.grid');

  let expression = '0';

  function setDisplay(text){
    displayEl.textContent = text;
  }

  function appendValue(val){
    if(expression === '0' && /[0-9.]/.test(val)){
      expression = val === '.' ? '0.' : val;
    } else {
      const lastChar = expression.slice(-1);
      const isOp = /[+\-*/%]/.test(val);
      const lastIsOp = /[+\-*/%]/.test(lastChar);
      if(isOp && lastIsOp){
        expression = expression.slice(0,-1) + val;
      } else if(val === '.' ){
        // prevent multiple decimals in current number segment
        const parts = expression.split(/[+\-*/%]/);
        const current = parts[parts.length-1];
        if(current.includes('.')) return;
        expression += val;
      } else {
        expression += val;
      }
    }
    setDisplay(expression);
  }

  function clearAll(){
    expression = '0';
    setDisplay(expression);
  }

  function delLast(){
    if(expression.length <= 1){
      expression = '0';
    } else {
      expression = expression.slice(0,-1);
    }
    setDisplay(expression);
  }

  function sanitize(expr){
    // Replace percentage: number% => number/100
    // Also handle cases like a%b (mod) not intended; here % is percentage
    return expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  }

  function evaluate(){
    try{
      const safe = sanitize(expression);
      // Disallow invalid trailing operators
      if(/[+\-*/.]$/.test(safe)){
        return;
      }
      // Evaluate using Function for simplicity in this contained use-case
      const result = Function(`"use strict"; return (${safe})`)();
      if(!isFinite(result)){
        setDisplay('Error');
        expression = '0';
        return;
      }
      const formatted = Number(result.toFixed(10)).toString();
      expression = formatted;
      setDisplay(formatted);
    }catch(err){
      setDisplay('Error');
      expression = '0';
    }
  }

  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const value = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');
    if(action === 'clear') return clearAll();
    if(action === 'delete') return delLast();
    if(action === 'equals') return evaluate();
    if(value) return appendValue(value);
  });

  // Keyboard support (basic)
  window.addEventListener('keydown', (e)=>{
    const k = e.key;
    if((/^[0-9]$/).test(k)) return appendValue(k);
    if(['+','-','*','/','%','.'].includes(k)) return appendValue(k);
    if(k === 'Enter' || k === '=') return evaluate();
    if(k === 'Backspace') return delLast();
    if(k.toLowerCase() === 'c') return clearAll();
  });
})();


