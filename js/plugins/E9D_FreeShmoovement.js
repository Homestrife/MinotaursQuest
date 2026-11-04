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
	// Game Map
	Game_Map.prototype.xWithDirection = function(x, d, dist) {
		if(dist === undefined || dist === null || Number.isNaN(dist)) { dist = 1; }
		return x + (d === 6 ? dist : d === 4 ? -dist : 0);
	};

	Game_Map.prototype.yWithDirection = function(y, d, dist) {
		if(dist === undefined || dist === null || Number.isNaN(dist)) { dist = 1; }
		return y + (d === 2 ? dist : d === 8 ? -dist : 0);
	};

	Game_Map.prototype.roundXWithDirection = function(x, d, dist) {
		if(dist === undefined || dist === null || Number.isNaN(dist)) { dist = 1; }
		return this.roundX(x + (d === 6 ? dist : d === 4 ? -dist : 0));
	};

	Game_Map.prototype.roundYWithDirection = function(y, d, dist) {
		if(dist === undefined || dist === null || Number.isNaN(dist)) { dist = 1; }
		return this.roundY(y + (d === 2 ? dist : d === 8 ? -dist : 0));
	};
	
	Game_Map.prototype.isPassable = function(x, y, d) {
		let x2 = Math.ceil(x);
		let y2 = Math.ceil(y);
		x = Math.floor(x);
		y = Math.floor(y);
		
		const bit = (1 << (d / 2 - 1)) & 0x0f;
		if(x !== x2 && y !== y2) {
			return this.checkPassage(x, y, bit)
				&& this.checkPassage(x, y2, bit)
				&& this.checkPassage(x2, y, bit)
				&& this.checkPassage(x2, y2, bit);
		} else if(x !== x2) {
			return this.checkPassage(x, y, bit)
				&& this.checkPassage(x2, y, bit);
		} else if(y !== y2) {
			return this.checkPassage(x, y, bit)
				&& this.checkPassage(x, y2, bit);
		}
		return this.checkPassage(x, y, bit);
	};
	
	// Game CharacterBase
	_Game_CharacterBase__initMembers = Game_CharacterBase.prototype.initMembers;
	Game_CharacterBase.prototype.initMembers = function() {
		_Game_CharacterBase__initMembers.call(this);
		this._moveSpeed = this.defaultMoveSpeed();
	};
	
	Game_CharacterBase.prototype.defaultMoveSpeed = function() {
		return 4.5;
	};
	
	Game_CharacterBase.prototype.canPass = function(x, y, d) {
		const dist = this.distancePerFrame();
		const x2 = $gameMap.roundXWithDirection(x, d, dist);
		const y2 = $gameMap.roundYWithDirection(y, d, dist);
		if (!$gameMap.isValid(x2, y2)) {
			return false;
		}
		if (this.isThrough() || this.isDebugThrough()) {
			return true;
		}
		if (!this.isMapPassable(x, y, d)) {
			return false;
		}
		if (this.isCollidedWithCharacters(x2, y2)) {
			return false;
		}
		return true;
	};
	
	Game_CharacterBase.prototype.canPassDiagonally = function(x, y, horz, vert) {
		const dist = this.distancePerFrame();
		const x2 = $gameMap.roundXWithDirection(x, horz, dist);
		const y2 = $gameMap.roundYWithDirection(y, vert, dist);
		return this.canPass(x, y, vert) && this.canPass(x, y2, horz) && this.canPass(x, y, horz) && this.canPass(x2, y, vert);
	};
	
	Game_CharacterBase.prototype.updateMove = function() {
		if (this._x < this._realX) {
			this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
		}
		if (this._x > this._realX) {
			this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
		}
		if (this._y < this._realY) {
			this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
		}
		if (this._y > this._realY) {
			this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
		}
		if (!this.isMoving()) {
			this.refreshBushDepth();
		}
	};
	
	Game_CharacterBase.prototype.isMapPassable = function(x, y, d) {
		const dist = this.distancePerFrame();
		const x2 = $gameMap.roundXWithDirection(x, d, dist);
		const y2 = $gameMap.roundYWithDirection(y, d, dist);
		const d2 = this.reverseDir(d);
		return $gameMap.isPassable(x, y, d) && $gameMap.isPassable(x2, y2, d2);
	};
	
	Game_CharacterBase.prototype.checkEventTriggerTouchFront = function(d) {
		const dist = this.distancePerFrame();
		const x2 = $gameMap.roundXWithDirection(this._x, d, dist);
		const y2 = $gameMap.roundYWithDirection(this._y, d, dist);
		return(this.checkEventTriggerTouch(x2, y2));
	};
	
	Game_CharacterBase.prototype.moveStraight = function(d) {
		this.setMovementSuccess(this.canPass(this._x, this._y, d));
		if (this.isMovementSucceeded()) {
			this.setDirection(d);
			const dist = this.distancePerFrame();
			this._x = $gameMap.roundXWithDirection(this._x, d, dist);
			this._y = $gameMap.roundYWithDirection(this._y, d, dist);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d), dist);
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d), dist);
			this.increaseSteps();
		} else {
			this.setDirection(d);
			this.checkEventTriggerTouchFront(d);
		}
	};
	
	Game_CharacterBase.prototype.moveStraightFromDiagonal = function(d) {
		const dist = this.distancePerFrame();
		if (this._direction === this.reverseDir(d)) {
			this.setDirection(d);
		}
		this._x = $gameMap.roundXWithDirection(this._x, d, dist);
		this._y = $gameMap.roundYWithDirection(this._y, d, dist);
		this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d), dist);
		this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d), dist);
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
			const dist = this.distancePerFrame();
			this._x = $gameMap.roundXWithDirection(this._x, horz, dist);
			this._y = $gameMap.roundYWithDirection(this._y, vert, dist);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz), dist);
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert), dist);
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
	Game_Player.prototype.isDashing = function() {
		return false;
	};
	
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
	
	Game_Player.prototype.getOffVehicle = function() {
		if (this.vehicle().isLandOk(this.x, this.y, this.direction())) {
			if (this.isInAirship()) {
				this.setDirection(2);
			}
			this._followers.synchronize(this.x, this.y, this.direction());
			this.vehicle().getOff();
			if (!this.isInAirship()) {
				this.forceMoveForward();
				this.setTransparent(false);
			}
			this._vehicleGettingOff = true;
			this.setMoveSpeed(this.defaultMoveSpeed());
			this.setThrough(false);
			this.makeEncounterCount();
			this.gatherFollowers();
		}
		return this._vehicleGettingOff;
	};
	
	// Game Vehicle
	Game_Vehicle.prototype.defaultBoatSpeed = function() {
		return this.defaultMoveSpeed();
	};
	
	Game_Vehicle.prototype.defaultShipSpeed = function() {
		return this.defaultMoveSpeed() + 0.75;
	};
	
	Game_Vehicle.prototype.defaultAirshipSpeed = function() {
		return this.defaultMoveSpeed() + 1.5;
	};
	
	Game_Vehicle.prototype.initMoveSpeed = function() {
		if (this.isBoat()) {
			this.setMoveSpeed(this.defaultBoatSpeed());
		} else if (this.isShip()) {
			this.setMoveSpeed(this.defaultShipSpeed());
		} else if (this.isAirship()) {
			this.setMoveSpeed(this.defaultAirshipSpeed());
		}
	};
})();