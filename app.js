      // Vertex shader (standard fullscreen quad)
      const vertexShaderSource = `
      attribute vec2 position;
      void main() {
          gl_Position = vec4(position, 0.0, 1.0);
      }
      `;

      // Your fragment shader (converted for WebGL)
      const fragmentShaderSource = `
      precision highp float;

      uniform vec2 r;   // resolution
      uniform float t;  // time

      void main() {
          vec2 FC = gl_FragCoord.xy;

          vec2 p = (FC * 2.0 - r) / r.y;
          float a = atan(p.y, p.x);
          float l = length(p);
          vec3 c = vec3(0.0);

          for(float i = 0.0; i < 15.0; i++) {
              float m = sin(a * 10.0 + t * (2.0 + i * 0.5) - l * 20.0) * 0.05;
              c += vec3(2.0, i * 0.1, 1.0) * 0.0008 / abs(l - 0.5 - m + i * 0.015);
          }

          gl_FragColor = vec4(c, 1.0);
      }
      `;

      function createShader(gl, type, source) {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              alert("Shader compile error: " + gl.getShaderInfoLog(shader));
              return null;
          }
          return shader;
      }

      function createProgram(gl, vsSrc, fsSrc) {
          const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
          const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
          const program = gl.createProgram();
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
              alert("Program link error: " + gl.getProgramInfoLog(program));
              return null;
          }
          return program;
      }

      function main() {
          const canvas = document.getElementById("glcanvas");
          const gl = canvas.getContext("webgl");
          if (!gl) { alert("WebGL not supported"); return; }

          const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
          gl.useProgram(program);

          // Fullscreen quad
          const quadBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              -1, -1,  1, -1, -1, 1,
              1, -1,  1, 1,  -1, 1
          ]), gl.STATIC_DRAW);

          const positionLoc = gl.getAttribLocation(program, "position");
          gl.enableVertexAttribArray(positionLoc);
          gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

          const resolutionLoc = gl.getUniformLocation(program, "r");
          const timeLoc = gl.getUniformLocation(program, "t");

          function resize() {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              gl.viewport(0, 0, canvas.width, canvas.height);
          }
          window.addEventListener("resize", resize);
          resize();

          let start = performance.now();
          function render() {
              const now = performance.now();
              const time = (now - start) * 0.001;

              gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
              gl.uniform1f(timeLoc, time);

              gl.drawArrays(gl.TRIANGLES, 0, 6);
              requestAnimationFrame(render);
          }
          render();
      }

      main();