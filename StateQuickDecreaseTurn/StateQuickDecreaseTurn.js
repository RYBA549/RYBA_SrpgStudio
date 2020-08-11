/*--------------------------------------------------------------------------
  
You can create skills that make it easier for Bad State to heal.
You can increase the number of decreases in state turns. (Usually 1)

If you omit any custom parameters.
{decreaseTurnValue:1,isBadState:true}

update
20/08/12@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
var RYBA = RYBA || {};
RYBA.StateDecreaseKeyword = 'RYBA_StateDecrease'
//RYBA.StateDecreaseControl.getDecreaseTurnValue();
RYBA.StateDecreaseControl = {

    getDecreaseTurnValue:function(unit,skillArray,state){
        var i, count, skill, value, decreaseTurn, targetBad;
        value = 1;
        if( !unit ){
            return value;
        }

        count = skillArray.length;
        for( i = 0; i < count; i++ ){
            skill = skillArray[i].skill;
            targetBad = true;
            if(typeof skill.custom.isBadState === 'boolean'){
                targetBad = skill.custom.isBadState;
            }
            if( targetBad !== state.isBadState()){
                continue;
            }
            decreaseTurn = 1;
            if(typeof skill.custom.decreaseTurnValue === 'number'){
                decreaseTurn =  skill.custom.decreaseTurnValue;
            }
            value += decreaseTurn;
        }

        if(value < 1){
            value = 1;
        }
        
        return value;
    }
    
};

(function() {
    StateControl.decreaseTurn = function(list) {
        var skillArray;
		var i, j, count, count2, unit, arr, list2, turn, turnState, state;
		
		count = list.getCount();
		for (i = 0; i < count; i++) {
			arr = [];
            unit = list.getData(i);
            skillArray = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, RYBA.StateDecreaseKeyword);
			list2 = unit.getTurnStateList();
			count2 = list2.getCount();
			for (j = 0; j < count2; j++) {
                turnState = list2.getData(j);
                state = turnState.getState();
				turn = turnState.getTurn();
				if (turn <= 0) {
					continue;
				}
				
				// ターンを1つ減少させ、新たに設定する
				turn -= RYBA.StateDecreaseControl.getDecreaseTurnValue(unit,skillArray,state);
				turnState.setTurn(turn);
				if (turn <= 0) {
					// ステートを後で解除するために配列へ保存する
					arr.push(turnState.getState());
				}
			}
			
			count2 = arr.length;
			for (j = 0; j < count2; j++) {
				this.arrangeState(unit, arr[j], IncreaseType.DECREASE);
			}
		}
	};
})();