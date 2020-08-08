/*--------------------------------------------------------------------------
  
Implement a wand that can only be used before moving

update
20/08/03@create
Version
@SRPG Studio Version:1.215
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(”M‘Ñ‹›)
  
--------------------------------------------------------------------------*/

(function() {

var aliasWandUsableTnternal = WandChecker.isWandUsableInternal;

WandChecker.isWandUsableInternal =  function(unit, wand) {

  var result = aliasWandUsableTnternal.call(this,unit,wand);
  if(!result){
    return false;
  }

  if( typeof wand.custom.RYBA_selfMoved === 'boolean'){
    if(wand.custom.RYBA_selfMoved){
      if(unit.getMostResentMov() > 0 ){
        return false;
      }
    }
  }

  return result;
};

})();