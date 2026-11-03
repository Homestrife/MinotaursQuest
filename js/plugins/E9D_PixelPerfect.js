//=============================================================================
// RPG Maker MZ - Emerald9D's Pixel Perfect
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for different resolutions.
 * @author Malachite "Emerald9D" Royal
 *
 * @help E9D_PixelPerfect.js
 *
 * This plugin enables crisp pixels for low resolutions, so everything isn't
 * rendered blurry. It can also limit the rendered area scaling to only whole
 * multiples of the base game resolution.
 *
 * This plugin does not provide plugin commands.
 *
 * @param renderPixelated
 * @text Render Pixelated
 * @desc When resizing the game window, graphics will render sharply pixelated rather than blurred.
 * @type boolean
 * @default false
 *
 * @param forceWholeResolution
 * @text Force Whole Resolution
 * @desc Only allow resolutions that are whole multiples of the base screen width, when resizing the game window.
 * @type boolean
 * @default false
 *
 * @param disableCharacterVerticalOffset
 * @text Disable Character Vertical Offset
 * @desc Disable the vertical offset that is applied to character sprites on the map.
 * @type boolean
 * @default false
 */
 
(() => {
	// plugin parameters
	const ppParams = PluginManager.parameters('E9D_PixelPerfect');
	parsePPParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parsePPParameters() {
		ppParams.renderPixelated = ppParams.renderPixelated === 'true';
		ppParams.forceWholeResolution = ppParams.forceWholeResolution === 'true';
		ppParams.disableCharacterVerticalOffset = ppParams.disableCharacterVerticalOffset === 'true';
	}
	
	// Graphics
	_Graphics__initialize = Graphics.initialize;
	Graphics.initialize = function() {
		this._pixelPerfect = false;
		return _Graphics__initialize.call(this);
	};
	
	/**
	 * Pixel perfect or not. Manipulate this in your own game's code!
	 *
	 * @type boolean
	 * @name Graphics.pixelPerfect
	 */
	Object.defineProperty(Graphics, "pixelPerfect", {
		get: function() {
			return this._pixelPerfect;
		},
		set: function(value) {
			this._pixelPerfect = value;
			this._updateAllElements();
		},
		configurable: true
	});
	
	Graphics._updateRealScale = function() {
		if (this._stretchEnabled && this._width > 0 && this._height > 0) {
			const h = this._stretchWidth() / this._width;
			const v = this._stretchHeight() / this._height;
			this._realScale = Math.min(h, v);
			if(ppParams.forceWholeResolution || this._pixelPerfect) {
				this._realScale = Math.floor(this._realScale);
			}
			window.scrollTo(0, 0);
		} else {
			this._realScale = this._defaultScale;
		}
	};
	
	const _Graphics__updateCanvas = Graphics._updateCanvas;
	Graphics._updateCanvas = function() {
		_Graphics__updateCanvas.call(this);
		this._canvas.style.imageRendering = ppParams.renderPixelated ? 'pixelated' : '';
	};
	
	// Game CharacterBase
	Game_CharacterBase.prototype.shiftY = function() {
		return ppParams.disableCharacterVerticalOffset || this.isObjectCharacter() ? 0 : 6;
	};
})();
