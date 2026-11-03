//=============================================================================
// RPG Maker MZ - Emerald9D's Free Shmoovement
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Characters move freely instead of grid-based
 * @author Malachite "Emerald9D" Royal
 *
 * @help E9D_FreeShmoovement.js
 *
 * Exactly what it says on the tin.
 *
 * This plugin does not provide plugin commands.
 *
 */
 
(() => {
	// Game CharacterBase
	Game_CharacterBase.prototype.canPassDiagonally = function(x, y, horz, vert) {
		const x2 = $gameMap.roundXWithDirection(x, horz);
		const y2 = $gameMap.roundYWithDirection(y, vert);
		return this.canPass(x, y, vert) && this.canPass(x, y2, horz) && this.canPass(x, y, horz) && this.canPass(x2, y, vert);
	};
	
	Game_CharacterBase.prototype.checkEventTriggerTouchFront = function(d) {
		const x2 = $gameMap.roundXWithDirection(this._x, d);
		const y2 = $gameMap.roundYWithDirection(this._y, d);
		return(this.checkEventTriggerTouch(x2, y2));
	};
	
	Game_CharacterBase.prototype.moveStraightFromDiagonal = function(d) {
		if (this._direction === this.reverseDir(d)) {
			this.setDirection(d);
		}
		this._x = $gameMap.roundXWithDirection(this._x, d);
		this._y = $gameMap.roundYWithDirection(this._y, d);
		this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
		this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
		this.increaseSteps();
	};
	
	Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
		this.setMovementSuccess(
			this.canPassDiagonally(this._x, this._y, horz, vert)
		);
		// try diagonal
		if (this.isMovementSucceeded()) {
			if (this._direction === this.reverseDir(horz)) {
				this.setDirection(horz);
			}
			if (this._direction === this.reverseDir(vert)) {
				this.setDirection(vert);
			}
			this._x = $gameMap.roundXWithDirection(this._x, horz);
			this._y = $gameMap.roundYWithDirection(this._y, vert);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
			this.increaseSteps();
		} else {
			// try horizontal
			this.setMovementSuccess(this.canPass(this._x, this._y, horz));
			if (this.isMovementSucceeded()) {
				this.moveStraightFromDiagonal(horz);
			} else if(this.checkEventTriggerTouchFront(horz)) {
				this.setDirection(horz);
			} else {
				// try vertical
				this.setMovementSuccess(this.canPass(this._x, this._y, vert));
				if (this.isMovementSucceeded()) {
					this.moveStraightFromDiagonal(vert);
				} else if(this.checkEventTriggerTouchFront(vert)) {
					this.setDirection(vert);
				}
			}
		}
	};
	
	// Game Player
	Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
		if (!$gameMap.isEventRunning()) {
			for (const event of $gameMap.eventsXy(x, y)) {
				if (
					event.isTriggerIn(triggers) &&
					event.isNormalPriority() === normal
				) {
					event.start();
					return true;
				}
			}
		}
		return false;
	};
	
	Game_Player.prototype.moveByInput = function() {
		if (!this.isMoving() && this.canMove()) {
			let direction = this.getInputDirection();
			if (direction > 0) {
				$gameTemp.clearDestination();
			} else if ($gameTemp.isDestinationValid()) {
				const x = $gameTemp.destinationX();
				const y = $gameTemp.destinationY();
				direction = this.findDirectionTo(x, y);
			}
			if (direction > 0) {
				this.executeMove(direction);
			}
		}
	};
	
	Game_Player.prototype.getInputDirection = function() {
		return Input.dir8;
	};
	
	Game_Player.prototype.executeMove = function(direction) {
		if(direction % 2) {
			switch(direction) {
			case 1: this.moveDiagonally(4, 2); break;
			case 3: this.moveDiagonally(6, 2); break;
			case 7: this.moveDiagonally(4, 8); break;
			case 9: this.moveDiagonally(6, 8); break;
			}
		} else {
			this.moveStraight(direction);
		}
	};
	
	Game_Player.prototype.checkEventTriggerTouch = function(x, y) {
		if (this.canStartLocalEvents()) {
			return(this.startMapEvent(x, y, [1, 2], true));
		}
		return false;
	};
})();