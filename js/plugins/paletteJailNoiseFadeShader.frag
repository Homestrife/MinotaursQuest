uniform sampler2D noiseSampler;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	vec4 inputColor = texture2D(uSampler, vTextureCoord);
	vec4 noiseColor = texture2D(noiseSampler, vTextureCoord);
	
	gl_FragColor = noiseColor.a == 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : inputColor;
	gl_FragColor = inputColor.a == 0.0 ? inputColor : gl_FragColor;
}
