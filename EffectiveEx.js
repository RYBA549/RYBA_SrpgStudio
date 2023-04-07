/*-----------------------------------------------------------------------------------------------
    
　特効武器に特効時のダメージ・命中・回避・必殺・必殺回避に補正をつけることができます。
　ダメージの補正はツール上の特効補正とは別に加算されます。
  (ツール上の特効補正をなくしたい場合は、バトル係数値で特効係数(%)を100%にします)
  ※ダメージの補正は競合しやすいのでそもそもダメージ補正を使わない場合、コメントアウトしておくことをオススメします。
  　DamageCalculator.calculateAttackPowerの部分をコメントアウトしましょう。

  また、ダメージ値のみ、スキルでさらに上乗せができます
  カスタムスキルのキーワードを「Ryba_calculateAttackPower」
  カスパラに上乗せしたいダメージ値を
  {
    value:0
　}
  で設定します

  isEffectiveをカスパラに設定でき、設定しないとtrueになります
  これがfalseだと「特効時以外にもダメージ補正が乗ります」
  カスタムスキルの有効相手も加味されるので
  一般系に対してのみ常時ダメージ+5したいという時には
  {
    value:5,
    isEffective:false
　}
  有効相手：一般系
  とすることもできます。


■設定項目

武器の設定項目(他のカスパラがない場合)
{
    Ryba_EffectiveData:{
        damage:0,
        hit:0,
        avoid:0,
        critical:0,
        criticalAvoid:0
    }
}

スキルの設定(isEffectiveはfalseを設定したい時のみ記載)
カスタムスキルのキーワードを「Ryba_calculateAttackPower」
{
    value:0
}


■カスパラ設定例
　
　武器Aで特攻するとき必殺を30上げたい
　{
    Ryba_EffectiveData:{
        critical:30
    }
　}

　武器Bで特攻するとき命中と回避を50上げたい
　{
    Ryba_EffectiveData:{
        hit: 50,
        avoid:50
    }
　}

　特攻時にダメージ+5のスキル
  {
    value:5
　}

　飛行系の相手に特攻する時のみダメージ+10のスキル
  {
    value:10
　}
  有効相手：飛行系

　重装系の相手に対して常にダメージ+5のスキル (特効相手かどうかは関係なし)
  {
    value:5,
    isEffective:false
　}
  有効相手：重装系

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

//標準値（データを設定していない場合に適用される数値）を設定できます
//例えば「特効時には一律で命中を100上げる」
//としたい場合はRyba.EffectiveExDefaultHit = 100;とします。
Ryba.EffectiveExDefaultDamage = 0;
Ryba.EffectiveExDefaultHit = 0;
Ryba.EffectiveExDefaultAvoid = 0;
Ryba.EffectiveExDefaultCritical = 0;
Ryba.EffectiveExDefaultCriticalAvoid = 0;
Ryba.EffectiveExSkillKeyword = 'Ryba_calculateAttackPower';

Ryba.EffectiveExControl = {
    getEffectiveData:function(object){
        var data = object.custom.Ryba_EffectiveData;
        return data;
    },
    isEffective:function(active, passive, weapon){
        //武器がない場合、特効できない
        if(weapon === null){
            return false;
        }
        return DamageCalculator.isEffective(active, passive, weapon, false, TrueHitValue.NONE);
    },
    getSkillDamage:function(active, passive, weapon, isEffective){
        var i, skill;
        var arr = SkillControl.getDirectSkillArray(active, SkillType.CUSTOM, Ryba.EffectiveExSkillKeyword);
        var damage = 0;
        var count = arr.length;
		for (i = 0; i < count; i++) {
			skill = arr[i].skill;
            //root.log(skill.getName());
            //特効ではないとき、特効時のみ加算するスキルは除外する
            if(!isEffective){
                if( skill.custom.isEffective === undefined || skill.custom.isEffective) {
                    continue;
                }
            }
            //root.log('特攻対象');
            //有効相手出ないとき除外
            if(!skill.getTargetAggregation().isCondition(passive)){
                continue;
            }
            //root.log('有効対象');

            damage += skill.custom.value;
        }
        //root.log('skillDamage' + damage + 'count' + count)
        return damage;
    },
    getDamage:function(active, passive, weapon){
        var data = this.getEffectiveData(weapon);
        if(data == null){
            return Ryba.EffectiveExDefaultDamage;
        }
        if(typeof data.damage === 'number'){
            return data.damage;
        }
        return Ryba.EffectiveExDefaultDamage;
    },
    getHit:function(active, passive, weapon){
        var data = this.getEffectiveData(weapon);
        if(data == null){
            return Ryba.EffectiveExDefaultHit;
        }
        if(typeof data.hit === 'number'){
            return data.hit;
        }
        return Ryba.EffectiveExDefaultHit;
    },
    getAvoid:function(active, passive, weapon){
        var data = this.getEffectiveData(weapon);
        if(data == null){
            return Ryba.EffectiveExDefaultAvoid;
        }
        if(typeof data.avoid === 'number'){
            return data.avoid;
        }
        return Ryba.EffectiveExDefaultAvoid;
    },
    getCritical:function(active, passive, weapon){
        var data = this.getEffectiveData(weapon);
        if(data == null){
            return Ryba.EffectiveExDefaultCritical;
        }
        if(typeof data.critical === 'number'){
            return data.critical;
        }
        return Ryba.EffectiveExDefaultCritical;
    },
    getCriticalAvoid:function(active, passive, weapon){
        var data = this.getEffectiveData(weapon);
        if(data == null){
            return Ryba.EffectiveExDefaultCriticalAvoid;
        }
        if(typeof data.criticalAvoid === 'number'){
            return data.criticalAvoid;
        }
        return Ryba.EffectiveExDefaultCriticalAvoid;
    }
};

(function() {

    var alias1 = HitCalculator.calculateSingleHit;
    HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
        var result = alias1.call(this, active, passive, weapon, totalStatus);
        if(Ryba.EffectiveExControl.isEffective(active, passive, weapon)){
            result += Ryba.EffectiveExControl.getHit(active, passive, weapon);
        }
		return result;
	};
	
    var alias2 = HitCalculator.calculateAvoid;
    HitCalculator.calculateAvoid = function(active, passive, weapon, totalStatus) {
        result = alias2.call(this, active, passive, weapon, totalStatus);
        var passiveWeapon = ItemControl.getEquippedWeapon(passive);
        if(Ryba.EffectiveExControl.isEffective(passive, active, passiveWeapon)){
            result += Ryba.EffectiveExControl.getAvoid( passive, active, passiveWeapon);
        }
		return result;
	};

    var alias3 = CriticalCalculator.calculateSingleCritical;
    CriticalCalculator.calculateSingleCritical = function(active, passive, weapon, totalStatus) {
		var result = alias3.call(this, active, passive, weapon, totalStatus);
        if(Ryba.EffectiveExControl.isEffective(active, passive, weapon)){
            result += Ryba.EffectiveExControl.getCritical(active, passive, weapon);
        }
		return result;
	};
	
    var alias4 = CriticalCalculator.calculateCriticalAvoid;
    CriticalCalculator.calculateCriticalAvoid = function(active, passive, weapon, totalStatus) {
		var result = alias4.call(this, active, passive, weapon, totalStatus);
        var passiveWeapon = ItemControl.getEquippedWeapon(passive);
        if(Ryba.EffectiveExControl.isEffective(passive, active, passiveWeapon)){
            result += Ryba.EffectiveExControl.getCriticalAvoid( passive, active, passiveWeapon);
        }
		return result;
	};


    //----------------------------------------------------------------------------------------------------------
    //この項目は競合しやすいです。
    //ダメージ補正を使わないのであれば
    //この項目をコメントアウトすることも可能
    var alias5 = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
		var pow = alias5.call(this,active, passive, weapon, isCritical, totalStatus, trueHitValue);
		
        var isEffective = this.isEffective(active, passive, weapon, isCritical, trueHitValue);
		if (isEffective) {
			pow += Ryba.EffectiveExControl.getDamage(active, passive, weapon);
        }

        //スキルのダメージ補正を使わないのであればこの行はコメントアウトしてもよい
        pow += Ryba.EffectiveExControl.getSkillDamage(active, passive, weapon, isEffective);
		
		return pow;
	};
    //----------------------------------------------------------------------------------------------------------

})();
