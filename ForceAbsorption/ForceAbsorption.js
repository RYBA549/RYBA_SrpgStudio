
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
20/08/20@create
Version
@SRPG Studio Version:1.216
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.ForceAbsorptionKeyword = 'ForceAbsorption'
RYBA.StateControl = {
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
    checkState:function(unit, skillKeyword, isSkipMode, generator){
        var commandCount = this._checkStateBase(unit, unit, skillKeyword, isSkipMode, generator);
        return commandCount;
    },
    _checkStateBase:function(unit, target, skillKeyword, isSkipMode, generator){
        var commandCount = 0;
        var skillEntry;
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
            
            commandCount += this._updateUnitFunction(target, skillEntry.skill, isSkipMode, generator);
        }
        return commandCount;
    },
    _updateUnitFunction:function(unit, skill, isSkipMode ,generator){
        var commandCount = 0;
        if( skill === null )
        {
            return 0;
        }
        var add = skill.custom.TurnStart_AddState;
        commandCount = this.unitAddState(unit,add,isSkipMode,generator);
        return commandCount;
    },
    unitAddState:function(unit, addObject, isSkipMode ,generator){
        var commandCount = 0;
        var add = addObject;
        if(typeof add !== 'object')
        {
            return 0;
        }
        var stateBaseList = root.getBaseData().getStateList();
        var length = add.length;
        for(var j = 0; j < length; j++)
        {
            var obj = add[j];
            var stateLength = obj['State'].length;
            if(this._levelUpAddState(unit, obj, stateBaseList, isSkipMode ,generator)){
                commandCount += 1;
                continue;
            }
            commandCount += this._unitStateChange(unit,obj,stateLength,stateBaseList, isSkipMode ,generator);
        }
        return commandCount;
    },
    _unitStateChange:function(unit, obj,stateLength,stateBaseList, isSkipMode ,generator) {
        var commandCount = 0;
        for(var h=0 ; h<stateLength ; h++)
        {
            var state = stateBaseList.getDataFromId(obj['State'][h]);
            StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        }
        return commandCount;
    },
    _levelUpAddState:function(unit, obj, stateBaseList, isSkipMode ,generator){
        var commandCount = 0;
        if(!obj.levelUp){
            return false;
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
                    return true;
                }
            }else{
                this.removeDataFromidState(unit, stateId);
            }
            break;
        }

        this.removeDataFromidState(unit, stateId);
        
        var state = stateBaseList.getDataFromId(obj['State'][index]);
        StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        return true;
    }
}

RYBA.MapSequenceCommand = RYBA.MapSequenceCommand || {};
RYBA.MapSequenceCommand.AddState = defineObject(BaseFlowEntry,
{
	_targetUnit: null,
	_skill: null,
	
	enterFlowEntry: function(playerTurn) {
		this._prepareMemberData(playerTurn);
		return this._completeMemberData(playerTurn);
	},
	
	moveFlowEntry: function() {
		if( this._slideAction.moveCycle() === MoveResult.END){
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;	
	},

	drawFlowEntry: function() {
		
	},
	
	_prepareMemberData: function(playerTurn) {
		this._targetUnit = playerTurn.getTurnTargetUnit();
		this._dynamicEvent = createObject(DynamicEvent);
	},
	
	_completeMemberData: function(playerTurn) {
		var isSkipMode = CurrentMap.isTurnSkipMode();
		var generator = this._dynamicEvent.acquireEventGenerator();
		RYBA.StateControl.checkState(this._targetUnit,RYBA.ForceAbsorptionKeyword, isSkipMode, generator);
        RYBA.StateControl.clearEnemyDeathFinish(this._targetUnit);
        return EnterResult.NOTENTER;
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
