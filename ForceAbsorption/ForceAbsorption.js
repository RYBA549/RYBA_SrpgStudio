
/*--------------------------------------------------------------------------
  
This plugin
Gives a state at the start of a turn or after battle, and allows re-action after battle.

How to use

Custom Skill Keyword 'ForceAbsorption'
Gives you a state after a battle in which you attack.

Custom Skill Keyword 'CounterAddState'
Gives a state to the opponent after a battle in which the opponent attacks you.

Custom Skill Keyword 'TurnStartAddState'
Give yourself a state at the start of your turn.

Custom Skill Keyword 'LightningStorm'
You will take another action after the battle in which you attacked.
(Custom parameters are valid only for param_bonus and enemyKill).

Example
Custom Parameter
{
TurnStart_AddState:[ { State:[2,3,4], levelUp:true, levelKeep:true } ], 
enemyKill:true, minTurnCount:-1, maxTurnCount:-1, multipleNumber:0, param_bonus:0
}

levelUp : 
When set to true, the state is overwritten in the order in which it was set.
(2 > 3 > 4)

levelKeep : 
If true, the last state in the array will continue to be given;
if false, the last state in the array will not be overwritten as long as it is given.

enemyKill : 
If true, the state will be granted when an enemy is defeated
If set to false, it grants a state if you fail to defeat the enemy.
If not set, the state will be added after the fight.

minTurnCount: 
It will only be activated after the specified turn.
If you specify -1, it will be activated unconditionally.
If the notation is omitted, it will be treated as -1.

maxTurnCount: 
It will be activated until the specified turn.
If you specify -1, it will be activated unconditionally.
If the notation is omitted, it will be treated as -1.

multipleNumber: 
It will only be activated for the specified multiple of turns.
If you specify 0, it will be activated unconditionally.
If the notation is omitted, it will be treated as 0.

param_bonus:
Valid only with LightningStorm. Specify the number of activations in one turn. Setting it to 0 means infinity.

update
20/08/20?@create
24/09/14 Added map animation and bug fixes
Version
?@SRPG Studio Version:1.301
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(�M�ы�)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};

RYBA.ForceAbsorptionKeyword = 'ForceAbsorption'; //< 旧プラグインでのキーワードは 'paramBattleEndAddState';
RYBA.CounterAddStateKeyword = 'CounterAddState';//< 旧プラグインでのキーワードは'paramBattleEndAddStateDeath';
RYBA.TurnStartAddStateKeyword = 'TurnStartAddState';
RYBA.LightningStormSkillKeyword = "LightningStorm";

RYBA.ForceAbsorptionStateAnimeType = {
    None:0,
    Single:1,
    All:2
};

RYBA.StateControl = {
    //------------------------------------------------------------------------------
    /** 
     * 
     * Parameter settings
     * 
     * None
     * No map animation display
     * 
     * Single
     * Even if multiple states are granted by meeting the conditions, only one of them will be displayed.
     * 
     * All
     * All map animations of the states to be granted will be displayed in order.
    */
    ShowAnimeType:RYBA.ForceAbsorptionStateAnimeType.All,

    //------------------------------------------------------------------------------
    getDataFromIdState:function(id){
		var stateBaseList = root.getBaseData().getStateList();
		var state = stateBaseList.getDataFromId(id);
		return state;
	},
	isDataFromidState:function(unit,id){
		var state = this.getDataFromIdState(id);
		return StateControl.getTurnState(unit, state);
	},

    //自動AIステートかどうか
    isAutoAI: function(unit) {		
		if (StateControl.isBadStateOption(unit, BadStateOption.BERSERK)) {
			return true;
		}
		
		if (StateControl.isBadStateOption(unit, BadStateOption.AUTO)) {
			return true;
		}
		
		return false;
	},

	removeDataFromidState:function(unit,id){
        var state = this.getDataFromIdState(id);
        return StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
    },
    checkState_BattleEndState:function(unit){
        var isSkillEnemyKillFunc = function(target, skillEntry){
            if(skillEntry.skill.custom.enemyKill !== undefined || skillEntry.skill.custom.battleEnd){
                if( !RYBA.UnitLastAttackControl.isSkillEnemyKill(target, skillEntry.skill)){
					return false;
                }
            }
            return true;
        };
        var result;
        var passiveUnit = RYBA.UnitLastAttackControl.getLastAttackPassiveUnit(unit);
        var stateList = RYBA.StateControl.checkState(unit,unit,RYBA.ForceAbsorptionKeyword,isSkillEnemyKillFunc);
        if(passiveUnit){
            result = RYBA.StateControl.checkState(passiveUnit,unit,RYBA.CounterAddStateKeyword,isSkillEnemyKillFunc);
            if(stateList !== null){
                result = stateList.concat(result);
            }
        }else{
            result = stateList;
        }
        
        
        return result;
    },
    checkState_TurnStartAddState:function(unit){
        var isSkillEnemyKillFunc = function(target, skillEntry){
            return true;
        };
        return RYBA.StateControl.checkState(unit,unit,RYBA.TurnStartAddStateKeyword,isSkillEnemyKillFunc);
    },
    checkState:function(unit, target, skillKeyword, isSkillEnemyKillFunc){
        return this._checkStateBase(unit, target, skillKeyword, isSkillEnemyKillFunc);
    },
    _checkStateBase:function(unit, target, skillKeyword, isSkillEnemyKillFunc){
        var result = [];
        var skillEntry, stateList;
        var skillList = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, skillKeyword);
        if( skillList === null ){
			//root.log('skillList === null')
            return null;
        }
        var skillCount = skillList.length;
		//root.log('skillCount === '+skillCount)
        var turnCount = root.getCurrentSession().getTurnCount();
        for(var j = 0; j < skillCount; ++j) {
            skillEntry = skillList[j];
            if( !skillEntry.skill ){
                continue;
            }

            if(!isSkillEnemyKillFunc(target, skillEntry)){
                continue;
            }

            if(!this._isTurnCheckCustomParam(skillEntry.skill.custom,turnCount)){
                continue;
            }

            stateList = this._updateUnitFunction(target, skillEntry.skill);
            if(stateList === null){
				//root.log('stateList === null')
                continue;
            }

            result = result.concat(stateList);
        }
		//root.log('result === '+result)
        return result;
    },
    _updateUnitFunction:function(unit, skill){
        if( skill === null )
        {
            return null;
        }
        var add = skill.custom.TurnStart_AddState;
        return this.unitAddState(unit,add);
    },
    unitAddState:function(unit, addObject){
        var addState;
        var addStateList = [];
        var commandCount = 0;
        var add = addObject;
        if(typeof add !== 'object')
        {
            return null;
        }
        var stateBaseList = root.getBaseData().getStateList();
        var length = add.length;
        for(var j = 0; j < length; j++)
        {
            var obj = add[j];
            var stateLength = obj['State'].length;
            addState = this._levelUpAddState(unit, obj, stateBaseList);
            if(addState !== null){
                commandCount += 1;
                addStateList.push(addState);
                continue;
            }
            this._unitStateChange(unit, obj, stateLength, stateBaseList, addStateList);
        }
        return addStateList;
    },
    _unitStateChange:function(unit, obj, stateLength, stateBaseList, addStateList) {
        for(var h=0 ; h<stateLength ; h++)
        {
            var state = stateBaseList.getDataFromId(obj['State'][h]);
            if(state === null){
                continue;
            }
            addStateList.push(state);
            StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        }
    },
    _levelUpAddState:function(unit, obj, stateBaseList){
        if(!obj.levelUp){
            return null;
        }
        var i = 0;
        var stateLength = obj['State'].length;
        var stateId = 0;
        var index = 0;
        for(var h=0 ; h<stateLength ; h++)
        {
            stateId = obj['State'][h];
            if(this.isDataFromidState(unit, stateId) === null){
                continue;
            }
            index = h + 1;	
            if( index >= stateLength){
                if(obj.levelKeep){
                    this.removeDataFromidState(unit, stateId);
                    index = stateLength - 1;
                }else{
                    return null;
                }
            }else{
                this.removeDataFromidState(unit, stateId);
            }
            break;
        }

        this.removeDataFromidState(unit, stateId);
        
        var state = stateBaseList.getDataFromId(obj['State'][index]);
        StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        return state;
    },
    _isTurnCheckCustomParam:function(param,turn){
        var min,max,multiple;
        if(typeof param.minTurnCount === 'number'){
            min = param.minTurnCount;
        }else{
            min = -1;
        }
        if(typeof param.maxTurnCount === 'number'){
            max = param.maxTurnCount;
        }else{
            max = -1;
        }
        if(typeof param.multipleNumber === 'number'){
            multiple = param.multipleNumber;
        }else{
            multiple = 0;
        }
        
        return this._isTurnCheck(turn, min, max, multiple);
    },
    _isTurnCheck:function(now,min,max,multiple){
        if(min > -1){
            if(now < min){
                return false;
            }
        }
        if(max > -1){
            if(now > max){
                return false;
            }
        }
        if(multiple > 0){
            if(now % multiple !== 0){
                return false;
            }
        }
        return true;
    }
};

RYBA.LightningStormControl = {
	checkUpdate: function(unit){
		var result =this.activeCheck(unit);
		if( result !== null ){
			this.addReactionTurnCount(unit);
		}
		return result;
	},
	activeCheck: function(unit){
	
		var skill = SkillControl.getPossessionCustomSkill(unit, RYBA.LightningStormSkillKeyword);
		if( skill === null ) {
			return null;
		}
	
		if( !RYBA.UnitLastAttackControl.isSkillEnemyKill(unit, skill)){
			return null;
		}
	
		var remCount = this.remainingReactionTurnCount(unit,skill);
		if( remCount === 0 ){
			return null;
		}
		return skill;
	},
	remainingReactionTurnCount: function(unit,skill){
		var maxCount = 0
		// パラメータボーナスの取得
		if( typeof skill.custom.param_bonus === "number" ) {
			maxCount = skill.custom.param_bonus;
		}
	
		var result = maxCount - this.getReactionTurnCount(unit);
		if( maxCount > 0 ){
			if(result < 0){
				return 0;
			}
			return result;
		}
	
		return -1;
	},
	setReactionTurnCount: function(unit, trun){
		if(unit === null || unit === undefined){
			return;
		}
		unit.custom.lightningStormReactionTurnCount = trun;
	},
	addReactionTurnCount: function(unit){
		var nowCount = this.getReactionTurnCount(unit);
		this.setReactionTurnCount(unit,nowCount+1);
	},
	getReactionTurnCount: function(unit){
		if(!unit){
			return 0;
		}
		if( typeof unit.custom.lightningStormReactionTurnCount === "number" ){
			return unit.custom.lightningStormReactionTurnCount;
		}
		return 0;
	}
};

RYBA.UnitControl = {

	//idを指定して指定ユニットを得る（負傷者であろうがデータさえあれば拾う）
	getAllActorToUnitId:function(id){
		var list = PlayerList.getMainList();
		var unit = list.getDataFromId(id);
		if(!unit){
			list = EnemyList.getMainList();
			unit = list.getDataFromId(id);
			if(!unit){
				list = AllyList.getMainList();
				unit = list.getDataFromId(id);
			}
		}
		return unit;
	}
};

//
RYBA.UnitLastAttackControl = {
	//フラグ取得系
	isEnemyDeathFinish: function(unit){
		if( unit.custom.isEnemyDeathFinish == undefined ){
			return false;
		}
		return true;
	},
	//skillのenemyKillを確認する
	//ようは「倒した時」なのか「倒せなかった時」なのか
	//条件を満たすとtrueを返します
	//設定されていない場合無条件でtrueを返します
	isSkillEnemyKill: function(unit,skill){
		if( !this.getLastAttackPassiveUnit(unit)){
			//そもそも戦闘していない場合はfalse	
			return false;
		}
		if( skill.custom.enemyKill !== undefined){
			if( this.isEnemyDeathFinish(unit) === skill.custom.enemyKill ){
				return true;
			}else{
				return false;
			}
		}else{
			return true;
		}
	},
	isChargeExchange: function(unit){
		if( unit.custom.isChargeExchange == undefined ){
			return false;
		}
		return true;
	},
	getLastAttackPassiveUnitPos: function(active){
		var unit = this.getLastAttackPassiveUnit(active);
		if( unit == undefined ) {
			return null;
		}
		return {x:active.custom.lastAttackPassiveUnitPosX,y:active.custom.lastAttackPassiveUnitPosY};
	},
	getLastAttackPassiveUnit: function(active){
		var id = active.custom.lastAttackPassiveUnitId;
		if( id == undefined ) {
			return null;
		}
		var unit = RYBA.UnitControl.getAllActorToUnitId(id);
		return unit;
	},
	setLastAttackPassiveUnit: function(active, passive){
		//root.log("たおしたふらぐを得る" + active.getName());
		if(passive){
			active.custom.lastAttackPassiveUnitId = passive.getId();
			active.custom.lastAttackPassiveUnitPosX = passive.getMapX();
			active.custom.lastAttackPassiveUnitPosY = passive.getMapY();
		}
		this._setChargeExchange(active,passive);
	},
	setEnemyDeathFinish: function(active, passive){
		active.custom.isEnemyDeathFinish = true;
	},
	_setChargeExchange: function(active, passive){
		active.custom.isChargeExchange = true;
	},
	allClear: function(unit){
		this.unitAfterEndReset(unit);
		RYBA.LightningStormControl.setReactionTurnCount(unit,0);
	},
	unitAfterEndReset: function(unit){
		if( unit != undefined ){
			if(unit.custom.lastAttackPassiveUnitId != undefined){
				delete unit.custom.lastAttackPassiveUnit;
				delete unit.custom.lastAttackPassiveUnitId;
				delete unit.custom.lastAttackPassiveUnitPosX;
				delete unit.custom.lastAttackPassiveUnitPosY;
			}
		}
		this.clearEnemyDeathFinish(unit);
		this.clearChargeExchange(unit);
	},
	getLastDeathFinishUnit: function(active){
		if(!active.custom.isEnemyDeathFinish){
			return null;
		}
		return this.getLastAttackPassiveUnit(active);
	},

	clearEnemyDeathFinish: function(unit){
		if( unit == undefined ){
			return;
		}
		delete unit.custom.isEnemyDeathFinish;
	},

	clearChargeExchange: function(unit){
		if( unit == undefined ){
			return;
		}
		delete unit.custom.isChargeExchange;
	},

	moveCommand_actionEnd: function(targetUnit){

	}
};
//ベースステート付与オブジェクト
//マップアニメのリストを渡して順番に表示する
RYBA.UnitMapAnimeShow = defineObject(BaseObject,
{
    _targetPos: null,
    _dynamicAnime: null,
    _animeList: null,
    _animeIndex: 0,
    _animeMax: 0,

    setup:function(){
        this._dynamicAnime = createObject(DynamicAnime);
    },
    
    enterFunc:function(pos, animeList){
        this._targetPos = pos;
        this._animeList = animeList;
        //root.log('this._animeMax = ' + this._animeMax);
        if(this._animeList === null ){
            return EnterResult.NOTENTER;
        }
        this._animeMax = this._animeList.length;
        //root.log('this._animeMax = ' + this._animeMax);
        if( this._animeMax === 0){
            return EnterResult.NOTENTER;
        }

        //root.log('RYBA.StateControl.ShowAnimeType = ' + RYBA.StateControl.ShowAnimeType);

        if(RYBA.StateControl.ShowAnimeType ===  RYBA.ForceAbsorptionStateAnimeType.None){
            return EnterResult.NOTENTER;
        }
        

        this._animeIndex = 0;

        if(!this._stateAnime()){
            return EnterResult.NOTENTER;
        }

        if(RYBA.StateControl.ShowAnimeType === RYBA.ForceAbsorptionStateAnimeType.Single){
            this._animeIndex = this._animeMax;
        }

        return EnterResult.OK;
    },
    moveFunc:function(){
        if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
            if(!this._stateAnime()){
                return MoveResult.END;
            }
        }
        return MoveResult.CONTINUE;	
    },
    drawFunc:function(){
        this._dynamicAnime.drawDynamicAnime();
    },

    _stateAnime:function(){
        if(this._animeIndex >= this._animeMax){
            return false;
        }
        var index = this._nextAnimeIndex(this._animeIndex);
        if(index < 0){
            return false;
        }

        var anime = this._getAnimeIndex(index);

        var pos = LayoutControl.getMapAnimationPos(this._targetPos.x, this._targetPos.y, anime);
        this._dynamicAnime.startDynamicAnime(anime, pos.x, pos.y, anime);
        this._animeIndex++;
        return true;
        
    },

    _nextAnimeIndex:function(nowIndex){
        var i, anime;
        for( i = nowIndex; i < this._animeMax; i++){
            anime = this._getAnimeIndex(i);
            if(anime === null){
                continue;
            }
            return i;
        }
        return -1;
    },

    _getAnimeIndex:function(index){
        return this._animeList[index];
    }
});
RYBA.UnitStateMapAnimeShow = defineObject(RYBA.UnitMapAnimeShow,
{
    _targetPos: null,
    _dynamicAnime: null,
    _animeList: null,
    _animeIndex: 0,
    _animeMax: 0,
    _getAnimeIndex:function(index){
        return this._animeList[index].getEasyAnime();
    }
});
RYBA.TurnChangeStart = RYBA.TurnChangeStart || {};
RYBA.TurnChangeStart.UpdateFlowEntry = defineObject(BaseFlowEntry,
{
    enterFlowEntry: function(turnChange) {
        this._prepareMemberData(turnChange);
        return this._completeMemberData(turnChange);
    },
    
    moveFlowEntry: function() {
        
        return MoveResult.END;
    },
    
    _prepareMemberData: function(turnChange) {
        var i, unit;
        var list = TurnControl.getActorList();
        var count = list.getCount();
        
        for (i = 0 ; i < count; i++) {
            unit = list.getData(i);
            this._updateUnitFunction(unit);
        }
    },
    
    _completeMemberData: function(turnChange) {
        return EnterResult.OK;
    },

    //更新処理をこの関数に書く
    _updateUnitFunction:function(unit){
        RYBA.UnitLastAttackControl.allClear(unit);
    }
}
);
RYBA.MapSequenceCommand = RYBA.MapSequenceCommand || {};
RYBA.MapSequenceCommand.UpdateFlowEntry = defineObject(BaseFlowEntry,
{
    _targetUnit: null,
    _skill: null,
    
    enterFlowEntry: function(playerTurn) {
        this._prepareMemberData(playerTurn);
        return this._completeMemberData(playerTurn);
    },
    
    moveFlowEntry: function() {
        RYBA.UnitLastAttackControl.clearEnemyDeathFinish(this._targetUnit);
        return MoveResult.END;
    },
    
    _prepareMemberData: function(playerTurn) {
        this._targetUnit = playerTurn.getTurnTargetUnit();
        //this._dynamicAnime = createObject(DynamicAnime);
    },
    
    _completeMemberData: function(playerTurn) {
        return EnterResult.OK;
    }
});

RYBA.MapSequenceCommand.AddState = defineObject(BaseFlowEntry,
{
    _targetUnit: null,
    _mapAnimeShow: null,
    
    enterFlowEntry: function(playerTurn) {
        this._prepareMemberData(playerTurn);
        return this._completeMemberData(playerTurn);
    },
    
    moveFlowEntry: function() {
        if (this._mapAnimeShow.moveFunc() !== MoveResult.CONTINUE) {
            return MoveResult.END;
        }
        return MoveResult.CONTINUE;	
    },

    drawFlowEntry: function() {
        this._mapAnimeShow.drawFunc();
    },
    
    _prepareMemberData: function(playerTurn) {
        this._targetUnit = playerTurn.getTurnTargetUnit();
        this._mapAnimeShow = createObject(RYBA.UnitStateMapAnimeShow);
        this._mapAnimeShow.setup();
    },
    
    _completeMemberData: function(playerTurn) {
        var isSkipMode = CurrentMap.isTurnSkipMode();
        if(isSkipMode){
            return EnterResult.NOTENTER;
        }
        //var generator = this._dynamicEvent.acquireEventGenerator();

        var x = LayoutControl.getPixelX(this._targetUnit.getMapX());
        var y = LayoutControl.getPixelY(this._targetUnit.getMapY());
        var pos = {x:x,y:y};
        
        this._stateList = RYBA.StateControl.checkState_BattleEndState(this._targetUnit);

        return this._mapAnimeShow.enterFunc(pos, this._stateList);
    }
});

RYBA.TurnStartAddStateFlowEntry = defineObject(BaseFlowEntry,
{
    _unitType:0,
    _unitIndex:0,
    _unitList: null,
    _unitMax: 0,
    _mapAnimeShow: null,
    
    enterFlowEntry: function(playerTurn) {
        this._prepareMemberData(playerTurn);
        return this._completeMemberData(playerTurn);
    },
    
    moveFlowEntry: function() {
        if (this._mapAnimeShow.moveFunc() !== MoveResult.CONTINUE) {
            if(!this._stateAnime()){
                return MoveResult.END;
            }
        }
        return MoveResult.CONTINUE;	
    },

    drawFlowEntry: function() {
        this._mapAnimeShow.drawFunc();
    },

    //trueを返すと自軍/敵軍/同盟軍全てを同時に処理する
    _isAllList:function(){
        return false;
    },
    
    _prepareMemberData: function(playerTurn) {
        this._mapAnimeShow = createObject(RYBA.UnitStateMapAnimeShow);
        this._mapAnimeShow.setup();
    },
    
    _completeMemberData: function(playerTurn) {

        if(this._isAllList()){
            this._unitType = -1;
        }else{
            this._unitType = root.getCurrentSession().getTurnType() - 1;
        }

        this._nextListSetup();
        
        if(!this._stateAnime()){
            return EnterResult.NOTENTER;
        }

        return EnterResult.OK;
    },

    _stateAnime:function(){
        return this._getNextUnitAnime();
    },

    _startState:function(unit){
        var x = LayoutControl.getPixelX(unit.getMapX());
        var y = LayoutControl.getPixelY(unit.getMapY());
        var pos = {x:x,y:y};
        
        this._stateList = RYBA.StateControl.checkState_TurnStartAddState(unit);

        return this._mapAnimeShow.enterFunc(pos, this._stateList);
    },

    _getUnitList:function(unitType){
        if( unitType === UnitType.PLAYER ) {
            return PlayerList.getSortieList();
        }else if( unitType === UnitType.ENEMY){
            return EnemyList.getAliveList();
        }else if( unitType === UnitType.ALLY){
            return AllyList.getAliveList();
        }
        return null;
    },

    _nextListSetup:function(){
        this._unitType++;
        this._unitList = this._getUnitList(this._unitType);
        this._unitIndex = 0;
        if(this._unitList === null){
            this._unitMax = 0;
        }else{
            this._unitMax = this._unitList.getCount();
        }
    },

    _getNextUnitAnime:function(){
        var unit;
        while(true){
            if(this._unitIndex >= this._unitMax){
                if(this._isAllList()){
                    this._nextListSetup();
                }else{
                    return false;
                }
            }
            if(this._unitType > UnitType.ALLY){
                return false;
            }
            for(; this._unitIndex < this._unitMax; this._unitIndex++){
                unit = this._unitList.getData(this._unitIndex);
                if(unit === null){
                    continue;
                }
                if( this._startState(unit) === EnterResult.NOTENTER ){
                    continue;
                }
                //returnするとfor分の最後が機能しないため加算
                this._unitIndex++
                return true;
            }
        }
        return false;
        
    }
});

(function() {
    var alias1 = MapSequenceCommand._pushFlowEntries;
    MapSequenceCommand._pushFlowEntries = function(straightFlow) {
        alias1.call(this,straightFlow );
        straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.AddState);
        straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.UpdateFlowEntry);
    };
    var alias2 = WaitAutoAction._pushFlowEntries;
    WaitAutoAction._pushFlowEntries = function(straightFlow) {
        alias2.call(this,straightFlow );
        straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.AddState);
        straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.UpdateFlowEntry);
    };

    var alias3 = DamageControl.checkHp;
    DamageControl.checkHp = function(active, passive) {
        alias3.call(this,active,passive);
        var isTurnPlayer = false;
        if( root.getBaseScene() !== SceneType.REST ) {
            if(active.getUnitType() === root.getCurrentSession().getTurnType()){
                isTurnPlayer = true;
                RYBA.UnitLastAttackControl.setLastAttackPassiveUnit(active,passive);
            }
        }
        
        if( passive.getAliveState() === AliveType.DEATH 
            || passive.getAliveState() === AliveType.INJURY ){
                if(isTurnPlayer){
                    RYBA.UnitLastAttackControl.setEnemyDeathFinish(active,passive);
                }
        }
    }

    var alias4 = TurnChangeStart.pushFlowEntries;
    TurnChangeStart.pushFlowEntries = function(straightFlow){
        alias4.call(this,straightFlow);
        straightFlow.pushFlowEntry(RYBA.TurnChangeStart.UpdateFlowEntry);
    };

    var alias5 = ReactionFlowEntry._completeMemberData;
	ReactionFlowEntry._completeMemberData = function(playerTurn) {
		//rtpSkill
		var result = alias5.call(this,playerTurn);
		if( result === EnterResult.OK){
			return EnterResult.OK;
		}

		if( result !== EnterResult.OK){
            var skill = RYBA.LightningStormControl.checkUpdate(this._targetUnit);
			if(skill){
				this._skill = null;
				this._startReactionAnime();
				return EnterResult.OK;
			}
		}
		return result;
	};

	ReactionFlowEntry.moveFlowEntry = function() {
		if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
			if( this._skill !== null ){
				this._targetUnit.setReactionTurnCount(this._skill.getSkillValue());
			}
			this._targetUnit.setWait(false);
			// EnemyAI
			this._targetUnit.setOrderMark(OrderMarkType.FREE);
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	};

    //
    TurnChangeStart.pushFlowEntries = function(straightFlow){
        // ターン表示を先行させる
        if (this._isTurnAnimeEnabled()) {
            straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
        }
        else {
            straightFlow.pushFlowEntry(TurnMarkFlowEntry);
        }
        straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
        straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
        straightFlow.pushFlowEntry(BerserkFlowEntry);
        straightFlow.pushFlowEntry(StateTurnFlowEntry);
        straightFlow.pushFlowEntry(RYBA.TurnStartAddStateFlowEntry);
    };
})();
