uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float shiftAmount;
uniform float shiftDirection;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	
	bool colorFound = false;
	vec2 paletteCoord = vec2(0.0, 0.0);
	float hue = 0.0;
	float pIncX = 1.0 / hues;
	float pIncY = 1.0 / brightLevels;
	float pHalfIncX = pIncX / 2.0;
	float pHalfIncY = pIncY / 2.0;
	
	for(int y = 0; y < %%PALETTE_HEIGHT%%; y++) {
		paletteCoord.y = pIncY * float(y) + pHalfIncY;
		for(int x = 0; x < %%PALETTE_WIDTH%%; x++) {
			hue = float(x);
			paletteCoord.x = pIncX * hue + pHalfIncX;
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
	
	float finalShiftAmount = shiftAmount < 0.0 ? 0.0 : (shiftAmount > hues - 2.0 ? hues - 2.0 : shiftAmount);
	float finalShiftDirection = shiftDirection < 0.0 ? -1.0 : 1.0;
	float newHue = hue + finalShiftAmount * finalShiftDirection;
	newHue = hue == 0.0 ? 0.0 : (newHue > hues - 1.0 ? newHue - (hues - 1.0) : (newHue < 1.0 ? newHue + (hues - 1.0) : newHue));
	
	paletteCoord.x = newHue * pIncX + pHalfIncX;
	gl_FragColor = texture2D(paletteTex, paletteCoord);
	gl_FragColor = inputColor.a == 0.0 ? inputColor : gl_FragColor;
}
