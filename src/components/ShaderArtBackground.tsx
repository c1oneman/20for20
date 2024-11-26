import { useEffect, useRef } from "react";

export function ShaderArtBackground() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const loadShaderArt = async () => {
        try {
          const shaderArtModule = await import("shader-art");
          const uniformPluginModule = await import(
            "@shader-art/plugin-uniform"
          );

          if (shaderArtModule.ShaderArt && uniformPluginModule.UniformPlugin) {
            shaderArtModule.ShaderArt.register([
              () => new uniformPluginModule.UniformPlugin(),
            ]);
            initialized.current = true;
          }
        } catch (error) {
          console.error("Failed to load shader-art:", error);
        }
      };

      // Add the shader-art script to the document
      const script = document.createElement("script");
      script.src = "https://esm.sh/shader-art";
      script.type = "module";
      script.onload = () => loadShaderArt();
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return (
    <shader-art
      autoplay
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <uniform
        type="float"
        name="scale"
        value=".4"
        min="0.1"
        max="4"
        step="0.01"
      />
      <uniform type="float" name="ax" value="5" min="1" max="15" step=".01" />
      <uniform type="float" name="ay" value="7" min="1" max="15" step=".01" />
      <uniform type="float" name="az" value="9" min="1" max="15" step=".01" />
      <uniform type="float" name="aw" value="13" min="1" max="15" step=".01" />
      <uniform type="float" name="bx" value="1" min="-1" max="1" step="0.01" />
      <uniform type="float" name="by" value="1" min="-1" max="1" step="0.01" />
      <uniform type="color" name="color1" value="#ffffff" />
      <uniform type="color" name="color2" value="#ffafaf" />
      <uniform type="color" name="color3" value="#0099ff" />
      <uniform type="color" name="color4" value="#aaffff" />

      <script type="buffer" name="position" data-size="2">
        [-1, 1, -1,-1, 1,1, 1, 1, -1,-1, 1,-1]
      </script>
      <script type="buffer" name="uv" data-size="2">
        [ 0, 0, 0, 1, 1,0, 1, 0, 0, 1, 1, 1]
      </script>

      <script type="vert">
        {`
          precision highp float;
          attribute vec4 position;
          attribute vec2 uv;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = position;
          }
        `}
      </script>
      <script type="frag">
        {`
          precision highp float;
          varying vec2 vUv;
          uniform float time;
          uniform float scale;
          uniform vec2 resolution;
          uniform vec3 color1, color2, color3, color4;
          uniform int numOctaves;
          const float PI = 3.141592654;
          uniform float ax, ay, az, aw;
          uniform float bx, by;
          
          float cheapNoise(vec3 stp) {
            vec3 p = vec3(stp.st, stp.p);
            vec4 a = vec4(ax, ay, az, aw);
            return mix(
              sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * 
              cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
              sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * 
              cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)), 
              .436
            );
          }
          
          void main() {
            vec2 aR = vec2(resolution.x/resolution.y, 1.);
            vec2 st = vUv * aR * scale;
            float S = sin(time * .005);
            float C = cos(time * .005);
            vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
            vec2 v2 = vec2(
              cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
              cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
            );
            float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
            
            vec3 color = mix(color1,
              color2,
              clamp((n*n)*8.,0.0,1.0));

            color = mix(color,
              color3,
              clamp(length(v1),0.0,1.0));

            color = mix(color,
                      color4,
                      clamp(length(v2.x),0.0,1.0));
            
            color /= n*n + n * 7.;
            gl_FragColor = vec4(color,1.);
          }
        `}
      </script>
    </shader-art>
  );
}
