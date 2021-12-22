precision mediump float;
uniform vec3 uColor;
uniform vec3 uColor1;

// Type for textures
// uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vposition;
varying float vdisplacement;

    void main() {

      //vec4 textureColor = texture2D(uTexture, vUv);
      // gl_FragColor = vec4(vposition, 1.0);
      //gl_FragColor = textureColor;

      //Mixed Color 
      // float strength = 0.5;
      // vec3 blackColor = vec3(0.07, 0.14, 0.16);
      // vec3 uvColor = vec3(0.46, 0.85, 1);
      // vec3 mixedColor = mix(blackColor, uvColor, strength);

      // Farbabstufung nach displacement 
      float mixStrength = (vdisplacement + 0.5) * 2.0; //default 0.25
      vec3 color = mix(uColor, uColor1, mixStrength);

      gl_FragColor = vec4(color, 1.0);

      // gl_FragColor = vec4(uColor, 1.0);

    }