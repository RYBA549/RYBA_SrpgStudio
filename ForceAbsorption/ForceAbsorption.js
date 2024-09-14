
/*--------------------------------------------------------------------------
  
This plugin provides 'force absorption'

How to use

Custom Skill Keyword 'ForceAbsorption'

Example
Custom Parameter
{
TurnStart_AddState:[ { State:[2,3,4], levelUp:true, levelKeep:true } ], enemyKill:true
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
RYBA.ForceAbsorptionKeyword = 'ForceAbsorption';
RYBA.ForceAbsorptionStateAnimeType = {
    None:0,
    Single:1,
    All:2
};
//
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
    ShowAnimeType:RYBA.ForceAbsorptionStateAnimeType.Single,

    //------------------------------------------------------------------------------
    isSkillEnemyKill: function(unit,skill){
        if( skill.custom.enemyKill !== undefined){
            if( this.isEnemyDeathFinish(unit) === skill.custom.enemyKill ){
                return true;
            }else{
                return false;
            }
        }else{
            return true;
        }
        return true;
    },
    setEnemyDeathFinish: function(active, passive){
        active.custom.isEnemyDeathFinishUnit = passive;
    },
    isEnemyDeathFinish:function(unit){
        if(!unit){
            return false;
        }
        return (unit.custom.isEnemyDeathFinishUnit !== undefined);
    },
    clearEnemyDeathFinish: function(unit){
        if( unit == undefined ){
            return;
        }
        delete unit.custom.isEnemyDeathFinishUnit;
    },
    getDataFromIdState:function(id){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(id);
        return state;
    },
    isDataFromidState:function(unit,id){
        var state = this.getDataFromIdState(id);
        return StateControl.getTurnState(unit, state);
    },
    removeDataFromidState:function(unit,id){
        var state = this.getDataFromIdState(id);
        return StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
    },
    checkState:function(unit, skillKeyword){
        return this._checkStateBase(unit, unit, skillKeyword);
    },
    _checkStateBase:function(unit, target, skillKeyword){
        var result = [];
        var skillEntry, stateList;
        var skillList = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, skillKeyword);
        if( skillList === null ){
            return;
        }
        var skillCount = skillList.length;
        for(var j = 0; j < skillCount; ++j) {
            skillEntry = skillList[j];
            if( !skillEntry.skill ){
                continue;
            }

            if(skillEntry.skill.custom.enemyKill !== undefined || skillEntry.skill.custom.battleEnd){
                if( !RYBA.StateControl.isSkillEnemyKill(target, skillEntry.skill)){
                    continue;
                }
            }

            stateList = this._updateUnitFunction(target, skillEntry.skill);
            if(stateList === null){
                continue;
            }

            result = result.concat(stateList);
        }
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
    }
}

RYBA.MapSequenceCommand = RYBA.MapSequenceCommand || {};
RYBA.MapSequenceCommand.AddState = defineObject(BaseFlowEntry,
{
	_targetUnit: null,
	_skill: null,
    _dynamicAnime: null,
    _stateList: null,
    _animeIndex: 0,
    _animeMax: 0,
	
	enterFlowEntry: function(playerTurn) {
		this._prepareMemberData(playerTurn);
		return this._completeMemberData(playerTurn);
	},
	
	moveFlowEntry: function() {
		if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
            if(!this._stateAnime()){
                return MoveResult.END;
            }
		}
		return MoveResult.CONTINUE;	
	},

	drawFlowEntry: function() {
		this._dynamicAnime.drawDynamicAnime();
	},
	
	_prepareMemberData: function(playerTurn) {
		this._targetUnit = playerTurn.getTurnTargetUnit();
		this._dynamicEvent = createObject(DynamicEvent);
        this._dynamicAnime = createObject(DynamicAnime);
	},
	
	_completeMemberData: function(playerTurn) {
		var isSkipMode = CurrentMap.isTurnSkipMode();
		//var generator = this._dynamicEvent.acquireEventGenerator();
        
		this._stateList = RYBA.StateControl.checkState(this._targetUnit,RYBA.ForceAbsorptionKeyword);
        RYBA.StateControl.clearEnemyDeathFinish(this._targetUnit);
        
        //root.log('this._animeMax = ' + this._animeMax);
        if(this._stateList === null  || isSkipMode){
            return EnterResult.NOTENTER;
        }
        this._animeMax = this._stateList.length;
        if( this._animeMax === 0){
            return EnterResult.NOTENTER;
        }

        //root.log('RYBA.StateControl.ShowAnimeType = ' + RYBA.StateControl.ShowAnimeType);

        if(RYBA.StateControl.ShowAnimeType ===  RYBA.ForceAbsorptionStateAnimeType.None){
            return EnterResult.NOTENTER;
        }else if(RYBA.StateControl.ShowAnimeType === RYBA.ForceAbsorptionStateAnimeType.All){
            this._animeIndex = 0;
        }else{
            this._animeIndex = this._nextAnimeIndex(0);
            if(this._animeIndex < 0){
                this._animeIndex = this._animeMax;
            }
        }
        
        this._stateAnime();

        return EnterResult.OK;
	},

    _stateAnime:function(){
        if(this._animeIndex >= this._animeMax){
            return false;
        }
        var index = this._nextAnimeIndex(this._animeIndex);
        if(index < 0){
            return false;
        }
        //root.queryAnime('reaction')
        var anime = this._stateList[index].getEasyAnime();
        var x = LayoutControl.getPixelX(this._targetUnit.getMapX());
		var y = LayoutControl.getPixelY(this._targetUnit.getMapY());
        var pos = LayoutControl.getMapAnimationPos(x, y, anime);
        this._dynamicAnime.startDynamicAnime(anime, pos.x, pos.y, anime);
        this._animeIndex++;
        return true;
        
    },

    _nextAnimeIndex:function(nowIndex){
        var i, anime;
        var len = this._stateList.length;
        for( i = nowIndex; i < len; i++){
            anime = this._stateList[i].getEasyAnime();
            if(anime === null){
                continue;
            }
            return i;
        }
        return -1;
    }
});

(function() {
var alias1 = MapSequenceCommand._pushFlowEntries;
MapSequenceCommand._pushFlowEntries = function(straightFlow) {
	alias1.call(this,straightFlow );
	straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.AddState);
};
var alias2 = WaitAutoAction._pushFlowEntries;
WaitAutoAction._pushFlowEntries = function(straightFlow) {
	alias2.call(this,straightFlow );
	straightFlow.pushFlowEntry(RYBA.MapSequenceCommand.AddState);
};

var alias3 = DamageControl.checkHp;
DamageControl.checkHp = function(active, passive) {
    alias3.call(this,active,passive);
    if( passive.getAliveState() === AliveType.DEATH 
        || passive.getAliveState() === AliveType.INJURY ){
        RYBA.StateControl.setEnemyDeathFinish(active,passive);
    }
}
})();
