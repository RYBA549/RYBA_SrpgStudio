/*-----------------------------------------------------------------------------------------------
    
　フュージョン中、フュージョン元のユニットのステータスをアップできるスキルを作成できます。

　仕様：ユニットAに「フュージョンパラメータボーナススキル（攻撃＋５）」を持たせる
　　　　ユニットBがユニットAを救出する
　　　　ユニットBのパラメータがアップする（攻撃＋５）

　　　　フュージョン時のみ効果を発揮するため、
　　　　ユニットA自体はフュージョンパラメータボーナススキルからは補正を得ることはできない


■設定項目

スキルの設定
スキルの種類は「パラメータボーナス」を選択します。（カスタムではない）
isFusinoParamBonusSkill:trueのカスパラがないとただのパラメータボーナススキルとなる
targetUnitIdは記載しないと-1で-1だと全ユニットが対象
0以上の値を入れると特定のユニットIDのユニットしか効果を得られない
{
    isFusinoParamBonusSkill:true,
    targetUnitId:-1
}

■注意点

フュージョン設定→詳細→スキルと形態変化で
取り込むスキルを設定し、本スキルが取り込まれる対象になっても効果は重複しません。
（例えば攻撃＋５されるスキルの場合、２回加算されて＋１０になることはなく、＋５となります）

■対応バージョン
　SRPG Studio Version:1.279

■作成者：熱帯魚(/RYBA)

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

-----------------------------------------------------------------------------------------------*/
var Ryba = Ryba || {};
Ryba.FusionParamBonusSkillControl = {
    isTargetSkill:function(skill){
        if(typeof skill.custom.isFusinoParamBonusSkill === 'boolean'){
            return skill.custom.isFusinoParamBonusSkill;
        }
        return false;
    },
    targetUnitId:function(skill){
        if(typeof skill.custom.targetUnitId === 'number'){
            return skill.custom.targetUnitId;
        }
        return -1;
    }
};
//新規関数
BaseUnitParameter.skillArrayTotalParamBonus = function(unit, skillArray){
    // パラメータボーナスのスキルを確認する。
    // 武器、アイテムはパラメータボーナススキルではなく、
    // 直接パラメータボーナスを設定しているものとする。
    var i = 0;
    var arr = skillArray;
    var count = arr.length;
    var validityObjectIsFusionSkill = undefined;
    var d = 0;
    var paramBonus, targetUnitId;
    for (i = 0; i < count; i++) {
        skill = arr[i].skill;
        paramBonus = this.getParameterBonus(skill);
        if(paramBonus === 0){
            continue;
        }
        validityObjectIsFusionSkill = Ryba.FusionParamBonusSkillControl.isTargetSkill(skill);
        if(validityObjectIsFusionSkill){
            if( arr[i].objecttype !== ObjectType.FUSION){
                continue;
            }
            targetUnitId = Ryba.FusionParamBonusSkillControl.targetUnitId(skill);
            if( targetUnitId > -1 ){
                if( unit.getId() !== targetUnitId ){
                    continue;
                }
            }
        }

        d += paramBonus;
    }
    return d;
};

(function() {

    //処理を上書き
    BaseUnitParameter.getUnitTotalParamBonus = function(unit, weapon) {
        var child, objectFlag;
        var d = 0;
        var arr = [];
        
        // 武器のパラメータボーナス
        if (weapon !== null) {
            d += this.getParameterBonus(weapon);
        }
        
        // アイテムのパラメータボーナス
        d += this._getItemBonus(unit, true);
        
        // パラメータボーナスのスキルを確認する。
        // 武器、アイテムはパラメータボーナススキルではなく、
        // 直接パラメータボーナスを設定しているものとする。
        objectFlag = this._getParamBonusObjectFlag();

        //フュージョンユニットのパラメータボーナススキルを得る
        child = FusionControl.getFusionChild(unit);
        if (child !== null) {
            if(unit.getUnitType() === child.getUnitType()){
                objectFlag |= ObjectFlag.FUSION;
            }
        }
        
        //root.log(unit.getName())
        
        arr = SkillControl.getSkillObjectArray(unit, weapon, SkillType.PARAMBONUS, '', objectFlag);
        d += this.skillArrayTotalParamBonus(unit,arr);
        
        return d;
    };
    var alias_SkillControlPushObjectSkillFromFusion = SkillControl._pushObjectSkillFromFusion;
    SkillControl._pushObjectSkillFromFusion =  function(unit, weapon, arr, skilltype, keyword, objectFlag) {
        if(skilltype === SkillType.PARAMBONUS){
            objectFlag |= ObjectFlag.UNIT;
            objectFlag |= ObjectFlag.CLASS;
            objectFlag |= ObjectFlag.WEAPON;
            objectFlag |= ObjectFlag.ITEM;
            objectFlag |= ObjectFlag.STATE;
        }
        alias_SkillControlPushObjectSkillFromFusion.call(this,unit, weapon, arr, skilltype, keyword, objectFlag);
    };
})();