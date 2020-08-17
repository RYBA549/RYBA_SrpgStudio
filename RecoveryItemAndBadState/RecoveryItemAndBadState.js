/*--------------------------------------------------------------------------
  
Adds healing wand and full recovery wand with bat state recovery.

How to use

This is described in the item's custom parameters.
{allBadStateRecovery:true}

update
20/08/17@create
Version
@SRPG Studio Version:1.216
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.RecoveryItemBaseControl = {

	getItemAllBadStateRecovery: function(item){
        
		var allBadStateRec = false;
		if(item){
            //root.log(item.getName());
			if(typeof item.custom.allBadStateRecovery === 'boolean'){
                allBadStateRec = item.custom.allBadStateRecovery;
            }
        }
        //root.log('allBadStateRecovery' + allBadStateRec);
		return allBadStateRec;
	},

	isAllBadStateRecoverable: function(unit) {
		var i, state;
		var list = unit.getTurnStateList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			state = list.getData(i).getState();
			if (state.isBadState()) {
				return true;
			}
		}
		
		return false;
	},
	availabilityIsItemAllowed:function(unit, targetUnit, item){
		var result = false;
	
		if(this.getItemAllBadStateRecovery(item)){
			result = this.isAllBadStateRecoverable(targetUnit);
			if(result){
				return true;
			}
		}
	
		return result;
	},
	useEnterMainUseCycle:function(itemUseParent){
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var targetUnit = itemTargetInfo.targetUnit;
		this.singleRec(itemTargetInfo,targetUnit);
	},
	singleRec:function(itemTargetInfo,targetUnit){
		var item = itemTargetInfo.item;
		var unit = itemTargetInfo.unit;
		var value = 0;
	
		if(this.getItemAllBadStateRecovery(item)){
			var arr = [];
			var list = targetUnit.getTurnStateList();
			var count = list.getCount();
			var state;
			for (i = 0; i < count; i++) {
				state = list.getData(i).getState();
				if (state.isBadState()) {
					arr.push(state);	
				}
			}
			
			count = arr.length;
			for (i = 0; i < count; i++) {
				StateControl.arrangeState(targetUnit, arr[i], IncreaseType.DECREASE);
			}
		}
    },
    AI_getScore:function(unit, combination)
	{
		var score = 0;
		if(!combination){
			return score;
		}
		var item = combination.item;
		if(!item){
			return score;
		}
		var targetUnit = combination.targetUnit;
		if(this.getItemAllBadStateRecovery(item)){
			result = this.isAllBadStateRecoverable(targetUnit);
			if(result){
				score += 10;
			}
		}
		return score;
	}
};

RYBA.StateRecoveryInfo = defineObject(BaseItemSentence,
{
    drawItemSentence: function(x, y, item) {
        this.drawAllBadState(x, y);
    },
    
    getItemSentenceCount: function(item) {
        return 1;
    },

    drawAllBadState: function(x, y) {
        var text;
        var textui = ItemInfoRenderer.getTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        
        text = '解除';
        
        ItemInfoRenderer.drawKeyword(x, y, text);
        x += ItemInfoRenderer.getSpaceX();
        
        TextRenderer.drawKeywordText(x, y, StringTable.State_AllBadState, -1, color, font);
    }
}
);

(function() {

    var alias1 = RecoveryItemAvailability.isItemAllowed;
    RecoveryItemAvailability.isItemAllowed = function(unit, targetUnit, item)
    {
        var result = alias1.call(this, unit, targetUnit, item);
        
        if(result === false){
            result = RYBA.RecoveryItemBaseControl.availabilityIsItemAllowed(unit, targetUnit, item);
        }
        
        return result;
    };
    var alias2 = RecoveryItemUse.enterMainUseCycle;
    RecoveryItemUse.enterMainUseCycle = function(itemUseParent)
    {
        var result = alias2.call(this, itemUseParent);
        
        RYBA.RecoveryItemBaseControl.useEnterMainUseCycle(itemUseParent);

        return result;
    };
    var alias3 = RecoveryItemAI._getScore;
    RecoveryItemAI._getScore = function(unit, combination)
    {
        var score = alias3.call(this, unit, combination);
        score += RYBA.RecoveryItemBaseControl.AI_getScore(unit, combination);
        return score;
    };

    //EntireRecoveryItemUse
    EntireRecoveryItemAvailability.isItemAvailableCondition = function(unit, item) {
        var i, targetUnit;
        var arr = EntireRecoveryControl.getTargetArray(unit, item);
        var count = arr.length;
        
        for (i = 0; i < count; i++) {
            targetUnit = arr[i];
            if (targetUnit.getHp() !== ParamBonus.getMhp(targetUnit)) {
                return true;
            }else if(RYBA.RecoveryItemBaseControl.availabilityIsItemAllowed(unit, targetUnit, item)){
                return true;
            }
        }
        
        return false;
    };
    EntireRecoveryItemUse.mainAction = function() {
        var i, targetUnit;
        var info = this._itemUseParent.getItemTargetInfo();
        var arr = EntireRecoveryControl.getTargetArray(info.unit, info.item);
        var count = arr.length;
        for (i = 0; i < count; i++) {
            targetUnit = arr[i];
            this._recoveryHp(targetUnit);
            RYBA.RecoveryItemBaseControl.singleRec(info,targetUnit);
        }
        
        return false;
    };
    var alias7 = EntireRecoveryItemAI._getScore;
    EntireRecoveryItemAI._getScore = function(unit, combination)
    {
        var score = alias7.call(this, unit, combination);
        score += RYBA.RecoveryItemBaseControl.AI_getScore(unit, combination);
        return score;
    };

    var alias8 = ItemInfoWindow._configureItem;
    ItemInfoWindow._configureItem = function(groupArray) {
        alias8.call(this,groupArray);
		if(RYBA.RecoveryItemBaseControl.getItemAllBadStateRecovery(this._item)){
			groupArray.appendObject(RYBA.StateRecoveryInfo);
		}
	};
})();