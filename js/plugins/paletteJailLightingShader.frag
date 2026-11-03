uniform sampler2D paletteTex;
uniform float hues;
uniform float brightLevels;
uniform float lightHue;
uniform float hueIntensity;
uniform float brightness;
uniform float hueDarkenThreshold;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	
	bool colorFound = false;
	vec2 paletteCoord = vec2(0.0, 0.0);
	float hue = 0.0;
	float brightLevel = 0.0;
	float pIncX = 1.0 / hues;
	float pIncY = 1.0 / brightLevels;
	float pHalfIncX = pIncX / 2.0;
	float pHalfIncY = pIncY / 2.0;
	
	for(int y = 0; y < %%PALETTE_HEIGHT%%; y++) {
		brightLevel = float(y);
		paletteCoord.y = pIncY * brightLevel + pHalfIncY;
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
	
	float finalLightHue = lightHue < 0.0 ? 0.0 : (lightHue > hues - 1.0 ? hues - 1.0 : lightHue);
	float maxHueDifference = floor((hues - 1.0) / 2.0);
	float hueDifference = abs(finalLightHue - hue);
	float hueDirection = hueDifference / (finalLightHue - hue);
	hueDirection *= hueDifference > maxHueDifference ? -1.0 : 1.0;
	hueDifference = hueDifference > maxHueDifference ? hueDifference - maxHueDifference : hueDifference;
	float finalHueIntensity = hueIntensity < 1.0 ? 1.0 : (hueIntensity > hueDifference ? hueDifference : hueIntensity);
	float newHue = finalLightHue == 0.0 || hue == 0.0 ? finalLightHue : hue + finalHueIntensity * hueDirection;
	newHue = finalLightHue == 0.0 || hue == 0.0 ? newHue : (newHue > hues - 1.0 ? newHue - (hues - 1.0) : (newHue < 1.0 ? newHue + (hues - 1.0) : newHue));
	
	float finalHueDarkenThreshold = hueDarkenThreshold < 1.0 ? 1.0 : (hueDarkenThreshold > hues - 1.0 ? hues - 1.0 : hueDarkenThreshold);
	float thresholdBrightReduce = floor(hueDifference / finalHueDarkenThreshold);
	float newBrightLevel = (finalLightHue == 0.0 || hue == 0.0 ? brightLevel : brightLevel - thresholdBrightReduce) + brightness;
	newBrightLevel = newBrightLevel < 0.0 ? 0.0 : (newBrightLevel > brightLevels - 1.0 ? brightLevels - 1.0 : newBrightLevel);
	
	paletteCoord.x = newHue * pIncX + pHalfIncX;
	paletteCoord.y = newBrightLevel * pIncY + pHalfIncY;
	gl_FragColor = texture2D(paletteTex, paletteCoord);
	gl_FragColor = inputColor.a == 0.0 ? inputColor : gl_FragColor;
}
