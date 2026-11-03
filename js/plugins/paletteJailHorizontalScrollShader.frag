uniform float startY;
uniform float height;
uniform float scrollAmt;
uniform float scrollDir;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 finalColor = texture2D(uSampler, vTextureCoord);
	
	if(vTextureCoord.y >= startY && vTextureCoord.y < startY + height) {
		vec2 scrollCoord = vTextureCoord;
		scrollCoord.x += scrollDir < 0.0 ? -scrollAmt : scrollAmt;
		scrollCoord.x += scrollCoord.x < 0.0 ? 1.0 : (scrollCoord.x > 1.0 ? -1.0 : 0.0);
		finalColor = texture2D(uSampler, scrollCoord);
	}

	gl_FragColor = finalColor;
}
