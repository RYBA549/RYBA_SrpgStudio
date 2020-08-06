/*--------------------------------------------------------------------------
  
Create a command to recover HP based on the amount of movement
(This plugin is meant to describe the use of the original content)

Original content Required Items
1 unit.

Original content Setting items

Set the recovery method to variable 1.
Type 1 is based on the amount of travel consumed.
Type 2 is based on the value of variable 3 minus the amount of movement consumed.
Otherwise, it's based on the unit's movement value minus the amount of movement consumed.

Set a threshold value for variable 2; setting it to 0 is equivalent to 1.

update
20/08/04@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/

//Calculate the amount of recovery and use it as the return value.
//If you specify the return value as a recovery event command, you can make a recovery animation while recovering HP.
function hpRecoveryMovedCalculation(){
    var content = root.getEventCommandObject().getOriginalContent();
	if(!content){
		return 0;
    }
    var unit = content.getUnit();
	if(!unit){
		return 0;
	}
    var type = content.getValue(0);
    var threshold = content.getValue(1);
    if(threshold < 1){
        threshold = 1;
    }
    var movValue = 0;
    if(type === 1){
        //Movement power consumed
        movValue = unit.getMostResentMov();
    }else if(type === 2){
        //The value of variable 3 minus the movement force consumed
        //This is used when you want to favor low-moving units.
        movValue = content.getValue(2) - unit.getMostResentMov();
    }else{
        //Remaining mobility
        movValue = ParamBonus.getMov(unit) - unit.getMostResentMov();
    }

    var hpRecoveryValue = movValue * threshold;

    if( hpRecoveryValue < 1 ){
        hpRecoveryValue = 0;
    }

    return hpRecoveryValue;
}

//Function to recover HP directly
function hpRecoveryMovedCommand(){
	
    var hpRecoveryValue = hpRecoveryMovedReturnValue();
    if(hpRecoveryValue < 1){
        return;
    }

    var content = root.getEventCommandObject().getOriginalContent();
	if(!content){
		return;
    }
    var unit = content.getUnit();
	if(!unit){
		return;
	}

    var hp = unit.getHp() + hpRecoveryValue;
    var mhp = ParamBonus.getMhp(unit);

    if( hp > mhp ){
        hp = mhp;
    }

    unit.setHp(hp);
}