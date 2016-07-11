var twgl = require('twgl.js');

var vs = '\n\
  attribute vec4 position;\n\
  void main() {\n\
    gl_Position = position;\n\
    gl_PointSize = 1.0;\n\
  }\n\
';

var fs = '\n\
  void main() {\n\
    gl_FragColor = vec4(0, 0, 0, 1); // green\n\
  }\n\
';

var canvas = document.querySelector('canvas');
var gl = canvas.getContext('webgl',
  {
    antialias: true,
  }
);
twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

var positions = new Float32Array(60000);
var bufferInfo = twgl.createBufferInfoFromArrays(
  gl,
  {
    position: { numComponents: 2, data: positions },
  }
);

gl.useProgram(programInfo.program);
twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

var mults = [1.34, 0.37, 1.75, 1.33, 0.15, 0.81];

function convertFunc(sFunc)
{
  return eval('(' + String(sFunc) + ')');
}

var sFuncs = (
  [
    'function (n, t) {\n  n[5] = n[5]+Math.PI;\n}',
    'function (x, y, z, x1, y1) {\n  return z + 0.1;\n}',
    'function (v, w) {\n  return (Math.sin(v[0] * w[0]) - Math.sin(v[1] * w[1]) - Math.cos(v[2] * w[2]));\n}',
  ]
);
var funcs = sFuncs.map(convertFunc);

function getElem(input)
{
  return document.getElementById('input' + input);
}

function getVarElems()
{
  return ['A', 'B', 'C', 'D', 'E', 'F'].map(getElem);
}

function setVarElem(elem, i)
{
  elem.value = mults[i];
}

function setVarElems()
{
  var elems = getVarElems();
  elems.map(setVarElem);
}

function setVar(elem, i)
{
  const value = Number(elem.value);
  if (Number.isNaN(value))
  {
    console.warn('non numeric value ', elem.value);
    return;
  }
  mults[i] = value;
}

function setVars()
{
  var elems = getVarElems();
  elems.map(setVar);
}

function getFuncElem(func)
{
  return document.getElementById('inputFunc' + func);
}

function getFuncElems()
{
  return ['F', 'G', 'H'].map(getFuncElem);
}

function setFuncElem(elem, i)
{
  elem.value = sFuncs[i];
}

function setFuncElems()
{
  var elems = getFuncElems();
  elems.map(setFuncElem);
}

function setFunc(elem, i)
{
  var func = convertFunc(elem.value)
  if (typeof func !== 'function')
  {
    console.warn('non function value', elem.value);
    return;
  }
  funcs[i] = func;
}

function setFuncs()
{
  var elems = getFuncElems();
  elems.map(setFunc);
}

function setElems()
{
  setVarElems();
  setFuncElems();
}
setElems();

function setAll()
{
  setFuncs();
  setVars();
}

function getRand()
{
  return (Math.random() * Math.PI).toFixed(2) * 1;
}

function handleRandomClick()
{
  mults = [getRand(), getRand(), getRand(), getRand(), getRand(), getRand()];
  setVarElems();
}

var randomButton = document.getElementById('randomButton');
randomButton.addEventListener('click', handleRandomClick, false);
var setButton = document.getElementById('setButton');
setButton.addEventListener('click', setAll, false);

var then = 0;
function render(now)
{
  var delta = now - then;
  then = now;
  funcs[0](mults, delta);

  var x = 1.0;
  var y = 1.0;
  var z = 1.0;
  positions = positions.map(
    function(p, i)
    {
      switch (i % 2)
      {
        case 0:
          var x1 = funcs[2]([x, y, z], [mults[0], mults[1], mults[2]]);
          var y1 = funcs[2]([x, y, z], [mults[3], mults[4], mults[5]]);
          z = funcs[1](x, y, z, x1, y1);
          x = x1;
          y = y1;
          return x / 5;
        case 1:
          return y / 5;
      }
    }
  );
  twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, positions);  
  twgl.drawBufferInfo(gl, gl.POINTS, bufferInfo);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
