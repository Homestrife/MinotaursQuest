uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float hue;
uniform float brightness;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	
	bool colorFound = false;
	vec2 paletteCoord = vec2(0.0, 0.0);
	float brightLevel = 0.0;
	float pIncX = 1.0 / hues;
	float pIncY = 1.0 / brightLevels;
	float pHalfIncX = pIncX / 2.0;
	float pHalfIncY = pIncY / 2.0;
	
	for(int y = 0; y < %%PALETTE_HEIGHT%%; y++) {
		brightLevel = float(y);
		paletteCoord.y = pIncY * brightLevel + pHalfIncY;
		for(int x = 0; x < %%PALETTE_WIDTH%%; x++) {
			paletteCoord.x = pIncX * float(x) + pHalfIncX;
			vec4 paletteColor = texture2D(paletteTex, paletteCoord);
			if(inputColor.r == paletteColor.r && inputColor.g == paletteColor.g && inputColor.b == paletteColor.b) {
				colorFound = true;
				break;
			}
		}
		if(colorFound) {
			break;
		}
	}
	
	float newHue = hue < 0.0 ? 0.0 : hue > hues - 1.0 ? hues - 1.0 : hue;
	
	brightLevel += brightness;
	brightLevel = brightLevel < 0.0 ? 0.0 : brightLevel > brightLevels - 1.0 ? brightLevels - 1.0 : brightLevel;
	
	paletteCoord.x = newHue * pIncX + pHalfIncX;
	paletteCoord.y = pIncY * brightLevel + pHalfIncY;
	gl_FragColor = texture2D(paletteTex, paletteCoord);
	gl_FragColor = inputColor.a == 0.0 ? inputColor : gl_FragColor;
}
