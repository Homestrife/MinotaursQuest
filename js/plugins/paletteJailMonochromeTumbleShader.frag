uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float hue;
uniform float shiftAmount;
uniform float shiftDirection;
uniform int ignoreBlack;

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
	
	float finalShiftAmount = shiftAmount < 0.0 ? 0.0 : (shiftAmount > brightLevels - 1.0 ? brightLevels - 1.0 : shiftAmount);
	float finalShiftDirection = shiftDirection < 0.0 ? -1.0 : 1.0;
	float newBrightLevel = brightLevel + finalShiftAmount * finalShiftDirection;
	newBrightLevel = newBrightLevel < 0.0 ? newBrightLevel + brightLevels : (newBrightLevel > brightLevels - 1.0 ? newBrightLevel - brightLevels : newBrightLevel);
	if(ignoreBlack > 0) {
		newBrightLevel = newBrightLevel < 1.0 ? newBrightLevel + (brightLevels - 1.0) : (newBrightLevel > brightLevels - 1.0 ? newBrightLevel - (brightLevels - 1.0) : newBrightLevel);
	}
	
	paletteCoord.x = newHue * pIncX + pHalfIncX;
	paletteCoord.y = pIncY * newBrightLevel + pHalfIncY;
	gl_FragColor = texture2D(paletteTex, paletteCoord);
	gl_FragColor = inputColor.a == 0.0 || (ignoreBlack > 0 && inputColor.r == 0.0 && inputColor.g == 0.0 && inputColor.b == 0.0) ? inputColor : gl_FragColor;
}
