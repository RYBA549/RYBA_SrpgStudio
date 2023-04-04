/*-----------------------------------------------------------------------------------------------
    
　発動スキルの条件に
　武器タイプの有効武器（または不利な武器）と戦うならという条件を追加できるようにします
  また、自分のターンならという条件も追加します

■使い方
　

■スキルのカスパラ

//Ryba_selfTrun 自分のターンに発動させたい場合true、違うターンに発動したい場合false
//Ryba_compatible 相性有利な時に発動させたい場合true、不利な時に発動してほしいならfalse
{
    Ryba_selfTrun:true,
    Ryba_compatible:true
}

■設定項目

　

■対応バージョン
　SRPG Studio Version:1.279

■作成者：熱帯魚

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

-----------------------------------------------------------------------------------------------*/

var Ryba = Ryba || {};

//どの数値を判定有利として扱うか
SkillCondCompatibleType = {
    Pow:1,
    Def:2,
    Hit:3,
    Avoid:4,
    Critical:5,
    CriticalAvoid:6,
    Agility:7
};

Ryba.SkillCond = {

    //---------------------------------------------------------
    //ここを変更する事で
    //Pow以外の設定できます
    TargetType:SkillCondCompatibleType.Pow,
    //---------------------------------------------------------

    skillCheckSelfTrun:function(skill, active, passive){
        var selfTrun = skill.custom.Ryba_selfTrun;
        if(selfTrun != null){
            if( (root.getCurrentSession().getTurnType() === active.getUnitType()) !== selfTrun ) {
                return false;
            }
        }
        
        return true;
    },
    //３すくみが有利ならtrueを返す
    skillCheckCompatible:function(skill, active, passive, weapon){
        var compatible = skill.custom.Ryba_compatible;
        if(compatible != null){
            if(weapon === null){
                weapon = ItemControl.getEquippedWeapon(active);
            }
            if(!this.getCompatibleFlag(active, passive, weapon,compatible)){
                return false;
            }
        }
        return true;
    },
    getCompatibleValue:function(active,passive,weapon){

        var result = 0;
	if(this.TargetType === SkillCondCompatibleType.Pow){
            result = CompatibleCalculator.getPower(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.Def){
            result = CompatibleCalculator.getDefense(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.Hit){
            result = CompatibleCalculator.getHit(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.Avoid){
            result = CompatibleCalculator.getAvoid(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.Critical){
            result = CompatibleCalculator.getCritical(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.CriticalAvoid){
            result = CompatibleCalculator.getCriticalAvoid(active, passive, weapon);
        }else if(this.TargetType === SkillCondCompatibleType.Agility){
            result = CompatibleCalculator.getAgility(active, passive, weapon);
        }
        return result;
    },
    getCompatibleNumber: function(active, passive, weapon) {
		var value = this.getCompatibleValue(active, passive, weapon);
		
		// 数値が0以外の場合、有利不利が存在するためその時点で返す
		if( value !== 0 ) {
			return value;
		}

        //次に相手のチェック
		var weaponPassive = ItemControl.getEquippedWeapon(passive);
		// 相手と自分をひっくり返して、相手の相性をチェック
        value = this.getCompatibleValue(passive, active, weaponPassive);
		value *= -1;
		
		return value;
    },
    //指定フラグに合致しているかどうかを返す
    //有利：flag = true
    //不利: flag = false
    getCompatibleFlag: function(active,passive,weapon,flag){
        var pow = this.getCompatibleNumber(active, passive, weapon)
        if(pow === 0){
            return false;
        }

        var powFlag = (pow > 0);
        return (flag === powFlag);
    }
};

(function() {
var alias1 = SkillRandomizer._isSkillInvokedInternal;
SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill) {
//root.log("skillrandomizer")
  var result = alias1.call(this,active,passive,skill);
  var weapon = null;
  if(!Ryba.SkillCond.skillCheckCompatible(skill, active, passive, weapon)){
    return false;
  }
  if(!Ryba.SkillCond.skillCheckSelfTrun(skill, active, passive)){
    return false;
  }
  return result;
}
})();
