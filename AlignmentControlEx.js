/*-----------------------------------------------------------------------------------------------
    
　某ゲームの「攻陣」「追撃（挟み撃ち）」みたいな事ができるようになります。
　（対局の位置にいる味方が攻撃してくれるスキル）

　※攻陣対応版です。AlignmentControl及び2は削除してください
　※ダミーステートIDの設定3つと攻陣の設定項目4つが増えてます。

■新規項目（攻陣関連）

    //攻陣発動時に表示するスキルのID
    //-1にすると何も表示しない
    AttackFormationShowSkillNumber: -1,

    攻陣の時に追加で一時的に付与されるステートのID
    「メニュー上で表示しない」にチェックを入れ
    自動解除条件「戦闘に入った 1」にしておくこと
    この付与ステートをカスタマイズすると
    追撃中のみ、能力の上げ下げやスキルを得る等も可能
    AttackFormationStateId:9

    メイン攻撃を行う前の連携攻撃する時に付与されるステートID
    「メニュー上で表示しない」にチェックを入れ
    自動解除条件「なし」にしておくこと
    NoEraseAttackStateId:10

    一時的にHP0でも存在できるようにするステートID
    「メニュー上で表示しない」にチェックを入れ
    自動解除条件「なし」にしておくこと
    NoEraseStateId:11

    隣接している他の味方が戦闘前に攻撃してくれる人数の上限
    0以下にすると攻撃しなくなる
    AttackFormationCount: 1,

    trueだと攻撃者にフュージョンユニットがいると発動しない。
    falseだと居ても発動できる
    AttackFormationNotFusion: true,

    trueだと攻陣する人が追撃を行える
    falseだと追撃不可
    falseにした場合、追撃の分のダメージは予測ダメージに反映されないので要注意
    AttackFormationRound:false,

    trueだと反撃でも攻陣が発生するようになる
    falseだと攻撃者が攻撃を仕掛けた時だけ発動する
    ただし、下記の事情のため、trueにすると確率発動の先制攻撃スキルorどちらかの追撃発生時に挙動が原本と異なってしまう...
    AttackFormationCounter:true,
    
    falseにした場合、常に（通常）の処理順となる。
    発動率100%未満の先制攻撃を実装している場合、falseしないと挙動がおかしくなる
    （条件を満たすと必ず発動するタイプ先制攻撃は大丈夫）
    『』内は通常の戦闘を行う。
    この間に他のユニットの攻撃を差し込むことは物理的に不可能なため
    どちらかの追撃が発生するとちょっと辺になるが仕様という事で...。
    ・攻撃者が先制する場合（通常）
    　味方攻陣→『攻撃者の攻撃→敵の反撃』→敵の攻陣→味方の追加攻撃（援護射撃など）
    ・反撃者が先制する場合（先制発生）
    　敵の攻陣→『敵の攻撃→攻撃者の反撃』→味方攻陣→味方の追加攻撃（援護射撃など）
    AttackFormationFastAttackCheck:true,
    

■設定項目（追加攻撃関連）
    発動時に表示するスキルのID
    -1にすると何も表示しない
    DefaultSkillNumber: 737

    追撃を仕掛けるユニットに一時的に付与されるステートのID
    このステートを付与されているユニットは相手の反撃を受けない
    このステートは
    「メニュー上で表示しない」にチェックを入れ
    自動解除条件「戦闘に入った 1」にしておくこと
    この付与ステートをカスタマイズすると
    追撃中のみ、能力の上げ下げやスキルを得る等も可能
    CounterAttackStateId: 210

    このIDのグローバルスイッチがオンだと
    （環境でリアル戦闘をオンにしていても）
    連携攻撃時のみ、戦闘アニメは強制的に簡易戦闘になる
    -1以下を指定するとこの機能は無効になる
    EasyBattleSwitchId:-1

■使い方
　スキルのカスタムキーワードに//発動トリガーを入力します
    //Main:自身が攻撃した時
    Ryba_AlignmentMain
    //Support:他の味方が攻撃した時
    Ryba_AlignmentSupport
    //MainAndSupport:自身または味方が攻撃した時
    Ryba_AlignmentMainAndSupport
    //Fusion:自分がフュージョンされているとき
    Ryba_AlignmentFusion

■スキルのカスパラ

//何も設定しないと下記になります
　{
    weaponCategoryType:-1,
    weaponTypeId:-1,
    minDistance:-1,
    maxDistance:-1,
    minAttackerDistance:-1,
    maxAttackerDistance:-1,
    isPinching:0,
    isAttackRange:1
   }

   weaponCategoryType　武器タイプのタブです。数値が一致すると発動可能になります。-1だと無条件です。
   武器タイプタブ（デフォルトの場合）
   「戦士系:0」
   「弓兵系:1」
   「魔法系:2」
   weaponTypeId  武器タイプのIDです。数値が一致すると発動可能になります。-1だと無条件です。
   例：戦士系の武器タイプID（デフォルトの場合）
   「剣:0」
   「槍:1」
   「斧:2」
   minDistance　最低射程です。敵との距離がこれ以上だと発動可能になります。-1だと無条件です。
   maxDistance  最高射程です。敵との距離がこれ以下だと発動可能になります。-1だと無条件です。
   minAttackerDistance　最低射程です。攻撃者（味方）との距離がこれ以上だと発動可能になります。-1だと無条件です。
   maxAttackerDistance  最高射程です。攻撃者（味方）との距離がこれ以下だと発動可能になります。-1だと無条件です。
   isPinching  1に設定すると攻撃したユニットの位置と対極のユニットが発動可能になります。0だと無条件です。
   isAttackRange  0に設定すると攻撃射程が足りなくても強制的に攻撃に参加できます

■注意点
　改造は自由ですが、
　追撃の時に反撃させて味方が死亡した場合のデバッグとかはやってないので
　自己責任でお願いします。

■設定例（４種類）

・挟み撃ち
　自分または他の味方が攻撃した後、対極の位置にいる自分または他の味方が攻撃
　（射程２以上の武器、例えば弓同士でも対極の位置に居れば攻撃します）
  カスタムキーワード「Ryba_AlignmentMainAndSupport」
  （全員にこのスキルを持たせる場合、キーワードはRyba_AlignmentSupportでも良い）
  カスパラ
   {
    isPinching:1
   }

・包囲攻撃
　自身が攻撃した後、その敵と隣接している攻撃可能な全味方が攻撃する
  カスタムキーワード「Ryba_AlignmentMain」
  カスパラ
   {
    minDistance:1,
    maxDistance:1
   }

・援護射撃
　味方が攻撃した後、その敵に攻撃可能で武器タイプタブ「弓兵系」の武器を装備しているなら攻撃
  カスタムキーワード「Ryba_AlignmentSupport」
  カスパラ
   {
    weaponCategoryType:1
   }

・デュアルアタック
　フュージョン状態なら、元のユニットが攻撃した後で同じ射程で攻撃可能なら攻撃
  カスタムキーワード「Ryba_AlignmentFusion」
  カスパラ（{}とだけ入力しないとエラーになります）
   {
   }


■対応バージョン
　SRPG Studio Version:1.311

■作成者：熱帯魚(/RYBA)

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

■更新履歴
　2025/04/29 作成
  2025/04/30 反撃を忘れていたため攻陣反撃を追加。ついでに攻陣と連携攻撃の発動表示スキルのIDを分けれるように
  2025/05/01 相手に先制された時に攻陣が発生しないことが有ったのを修正。攻撃者（味方）との距離を設定条件に追加
  2025/05/04 AfterBattleSkill競合対策
-----------------------------------------------------------------------------------------------*/
var Ryba = Ryba || {};
Ryba.AlignmentControl = {
    //----------------------------------------------------------------------------------------
    //調整項目
    //発動トリガー
    //Main:自身が攻撃した時
    MainSkillKeyword:'Ryba_AlignmentMain',
    //Support:他の味方が攻撃した時
    SupportSkillKeyword:'Ryba_AlignmentSupport',
    //MainAndSupport:自身または味方が攻撃した時
    MainAndSupportSkillKeyword:'Ryba_AlignmentMainAndSupport',
    //Fusion:自分がフュージョンされているとき
    FusionSkillKeyword:'Ryba_AlignmentFusion',
    //発動時に表示するスキルのID
    //-1にすると何も表示しない
    DefaultSkillNumber: 33,
    //追撃を仕掛けるユニットに一時的に付与されるステートのID
    //(このステートは連携攻撃時に必ず付与される)
    //このステートを付与されているユニットは相手の反撃を受けない
    //このステートは
    //「メニュー上で表示しない」にチェックを入れ
    //自動解除条件「戦闘に入った 1」にしておくこと
    CounterAttackStateId: 6,
    //  このIDのグローバルスイッチがオンだと
    // （環境でリアル戦闘をオンにしていても）
    // 連携攻撃時のみ、戦闘アニメは強制的に簡易戦闘になる
    // -1以下を指定するとこの機能は無効になる
    EasyBattleSwitchId:-1,
    //=====================================================
    // 攻陣関連
    //攻陣の時に追加で一時的に付与されるステートのID
    //「メニュー上で表示しない」にチェックを入れ
    //自動解除条件「戦闘に入った 1」にしておくこと
    AttackFormationStateId:7,
    // メイン攻撃を行う前の連携攻撃する時に付与されるステートID
    //「メニュー上で表示しない」にチェックを入れ
    //自動解除条件「なし」にしておくこと
    NoEraseAttackStateId:8,
    // 一時的にHP0でも存在できるようにするステートID
    //「メニュー上で表示しない」にチェックを入れ
    //自動解除条件「なし」にしておくこと
    NoEraseStateId:9,
    //攻陣発動時に表示するスキルのID
    //-1にすると何も表示しない
    AttackFormationShowSkillNumber: -1,
    // 隣接している他の味方が戦闘前に攻撃してくれる人数の上限
    // 0以下にすると攻撃しなくなる
    AttackFormationCount: 1,
    // trueだと攻撃者にフュージョンユニットがいると発動しない。
    // falseだと居ても発動できる
    AttackFormationNotFusion: true,
    //ダメージ倍率(%)
    //50だと半分のダメージ。100だと通常のダメージ
    AttackFormationDamageRate:50,
    // trueだと攻陣する人が追撃を行える
    // falseだと追撃不可
    // falseにした場合、追撃の分のダメージは予測ダメージに反映されないので要注意
    AttackFormationRound:false,
    // trueだと反撃でも攻陣が発生するようになる
    // falseだと攻撃者が攻撃を仕掛けた時だけ発動する
    // ただし、下記の事情のため、trueにすると確率発動の先制攻撃スキルorどちらかの追撃発生時に挙動が原本と異なってしまう...
    AttackFormationCounter:true,
    // falseにした場合、常に（通常）の処理順となる。
    // 発動率100%未満の先制攻撃を実装している場合、falseしないと挙動がおかしくなる
    // （条件を満たすと必ず発動するタイプ先制攻撃は大丈夫）
    // 『』内は通常の戦闘を行うAttackFormationFastAttackCheck。
    // この間に他のユニットの攻撃を差し込むことは物理的に不可能なため
    // どちらかの追撃が発生するとちょっと辺になるが仕様という事で...。
    // ・攻撃者が先制する場合（通常）
    // 　味方攻陣→『攻撃者の攻撃→敵の反撃』→敵の攻陣→味方の追加攻撃（援護射撃など）
    // ・反撃者が先制する場合（先制発生）
    // 　敵の攻陣→『敵の攻撃→攻撃者の反撃』→味方攻陣→味方の追加攻撃（援護射撃など）
    AttackFormationFastAttackCheck:true,
    //----------------------------------------------------------------------------------------
    _defaultShowSkill:null,
    _attackFormationShowSkill:null,

    setup:function(){
        if(this.DefaultSkillNumber < 0){
            return;
        }
        var list = root.getBaseData().getSkillList();
        this._defaultShowSkill = list.getDataFromId(this.DefaultSkillNumber);
        this._attackFormationShowSkill = list.getDataFromId(this.AttackFormationShowSkillNumber);
    },

    findNoCounterState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.CounterAttackStateId);
		return StateControl.getTurnState(unit, state);
    },
    findNoEraseAttackState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.NoEraseAttackStateId);
		return StateControl.getTurnState(unit, state);
    },
    findNoEraseState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.NoEraseStateId);
		return StateControl.getTurnState(unit, state);
    },

    removeNoEraseState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.NoEraseStateId);
        StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
    },

    removeNoEraseAttackState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.NoEraseAttackStateId);
        StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
    },

    noEraseStateTempDeath:function(active,passive){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.NoEraseStateId);
        StateControl.arrangeState(passive, state, IncreaseType.INCREASE);
    },

    beforeAttackState:function(unit,data){
        var stateBaseList = root.getBaseData().getStateList();
        var state;

        if( data.isAttackFormation ) {
            state = stateBaseList.getDataFromId(this.AttackFormationStateId);
            StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        }

        if( data.isNoErase ) {
            state = stateBaseList.getDataFromId(this.NoEraseAttackStateId);
            StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
        }

        state = stateBaseList.getDataFromId(this.CounterAttackStateId);
        return StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
    },

    checkWeaponCondSkill: function(skill,weapon){
        if(!skill || !weapon){
            return false;
        }
        var defautCategory = -1;
        var weaponType,weaponCategoryType,weaponTypeId;
        weaponType = weapon.getWeaponType();
        weaponCategoryType = weaponType.getWeaponCategoryType();
        weaponTypeId = weaponType.getId();
        var skillWeaponCategory, skillWeaponTypeId;
    
        //カテゴリ、強弓に習って指定なしならWeaponCategoryType.SHOOT(1)とする
        skillWeaponCategory = defautCategory;
        if( typeof skill.custom.weaponCategoryType === 'number'){
            skillWeaponCategory = skill.custom.weaponCategoryType;
        }
        //-1ならカテゴリチェックしない
        if(skillWeaponCategory > -1){
            if( skillWeaponCategory !== weaponCategoryType){
                return false;
            }
            //weaponTypeIdチェック
            skillWeaponTypeId = -1;
            if( typeof skill.custom.weaponTypeId === 'number'){
                skillWeaponTypeId = skill.custom.weaponTypeId;
            }
            if(skillWeaponTypeId > -1){
                if( skillWeaponTypeId !== weaponTypeId){
                    return false;
                }
            }
        }
    
        return true;
    },

    //ユニットAとBの距離を図る
	getUnitDistance:function(a,b){
		return this.getUnitDistanceToXY(a.getMapX(), a.getMapY(), b.getMapX(), b.getMapY());
	},

	getUnitDistanceToXY:function(aX,aY,bX,bY){
		var x, y;
		//root.log('a=('+a.getMapX()+','+a.getMapY()+') b=('+b.getMapX()+','+b.getMapY());
		if(aX > bX){
			x = aX - bX;
		}else{
			x = bX - aX;
		}
		if(aY > bY){
			y = aY - bY;
		}else{
			y = bY - aY;
		}
		return x + y;
	},

    getAlignmentData_Main:function(skillArray){
        return Ryba.AlignmentControl.getAlignmentDataToArray(skillArray, 
            [Ryba.AlignmentControl.MainSkillKeyword, Ryba.AlignmentControl.MainAndSupportSkillKeyword], null);
    },

    getAlignmentData_Support:function(skillArray,weapon){
        return Ryba.AlignmentControl.getAlignmentDataToArray(skillArray, 
            [Ryba.AlignmentControl.SupportSkillKeyword, Ryba.AlignmentControl.MainAndSupportSkillKeyword], weapon);
    },

    getAlignmentData_Fusion:function(skillArray,weapon){
        return Ryba.AlignmentControl.getAlignmentData(skillArray, Ryba.AlignmentControl.FusionSkillKeyword,weapon,null);
    },

    //weaponの引数をnullにした場合、武器条件を無視して判定する
    getAlignmentDataToArray:function(skillArray,keywordArray,weapon){
        var i, data;
        var dataCount = 0;
        var count = keywordArray.length;
        var result = [];
        for(i = 0; i < count; ++i){
            data = this.getAlignmentData(skillArray,keywordArray[i],weapon);
            dataCount = data.length;
            if(dataCount > 0){
                result = result.concat(data);
            }
        }
        return result;
    },
    getAlignmentData:function(skillArray,keyword,weapon,obj){

        var result = [];

        var skills = Ryba.AlignmentSkillControl.getCustomSkillFromArrayToArray(skillArray, keyword, weapon);
        if(!skills || skills.length < 1){
            return result;
        }

        var i, skill, obj;
        var count = skills.length;
        for( i = 0; i < count; ++i){
            skill = skills[i];

            if(weapon){
                //武器タイプが異なる場合無視
                if( !this.checkWeaponCondSkill(skill,weapon) ) {
                    continue;
                }
            }

            //適応スキルが１つでもあった場合false
            obj = this._buildAlignmentData();
            obj.minDistance = this._lessValue(skill.custom.minDistance,obj.minDistance);
            obj.maxDistance = this._overValue(skill.custom.maxDistance,obj.maxDistance);
            obj.minAttackerDistance = this._lessValue(skill.custom.minAttackerDistance,obj.minAttackerDistance);
            obj.maxAttackerDistance = this._overValue(skill.custom.maxAttackerDistance,obj.maxAttackerDistance);
            if(!obj.isPinching){
                if(typeof skill.custom.isPinching === 'number'){
                    obj.isPinching = (skill.custom.isPinching === 1);
                }
            }
            if(obj.isAttackRange){
                if(typeof skill.custom.isAttackRange === 'number'){
                    obj.isAttackRange = (skill.custom.isAttackRange === 1);
                }
            }
            result.push(obj);
        }

        return result;
    },

    _lessValue:function(value,defValue){
        if(typeof value === 'number'){
            if(defValue < 0 || value < defValue){
                return value;
            }
        }
        return defValue;
    },

    _overValue:function(value,defValue){
        if(typeof value === 'number'){
            if(defValue < 0 || defValue < value){
                return value;
            }
        }
        return defValue;
    },

    _buildAlignmentData:function(){
        return {
            minDistance:-1,
            maxDistance:-1,
            minAttackerDistance:-1,
            maxAttackerDistance:-1,
            isExchange:false,
            isPinching:false,
            isAttackRange:true
        };
    },

    buildCheckDataParam:function(){
        return {
            data:null,
            attakcer:null,
            targetUnit:null,
            unit:null,
            weapon:null,
            distance:0,
            attackerDistance:0
        }
    },

    checkData:function(param){
        var i;
        var arr = param.data;
        var count = arr.length;

        for( i = 0; i < count; ++i ){
            var data = arr[i];
            if(data === null || param.unit === null){
                continue;
            }
            //root.log('checkData'+param.unit.getName())
            //動けないなら攻撃も出来ないはず
            if(StateControl.isBadStateOption(param.unit, BadStateOption.NOACTION)){
                continue;
            }
            //root.log('isBadStateOption')
            //敵との距離
            if(!this.checkDistance(data.minDistance,data.maxDistance,param.distance)){
                continue;
            }
            //味方の攻撃者との距離
            if(!this.checkDistance(data.minAttackerDistance,data.maxAttackerDistance,param.attackerDistance)){
                continue;
            }
            //root.log('checkDistance')
            if(!this.checkPinching(data,param.attakcer, param.targetUnit,param.unit)){
                continue;
            }
            //root.log('checkPinching')
            if(!this.checkAttackRange(data, param.weapon, param.targetUnit,param.unit)){
                continue;
            }
            //root.log('checkAttackRange')
            return true;
        }
        
        return false;
    },

    checkPinching:function(data,attakcer,targetUnit,unit){
        if(!data.isPinching){
            return true;
        }
        if(targetUnit === null){
            return false;
        }
        //root.log(attakcer.getName() + ':'+ unit.getName() ) ;
        var pos = this.getUnitPosDistance(targetUnit,attakcer);
        var targetX = targetUnit.getMapX() - pos.x;
        var targetY = targetUnit.getMapY() - pos.y;
        //root.log('pos = '+ pos.x +','+ pos.y ) ;
        //root.log('x = '+ unit.getMapX() +'!=='+ targetX ) ;
        if(unit.getMapX() !== targetX){
            return false;
        }
        //root.log('y = '+ unit.getMapY() +'!=='+ targetY ) ;
        if(unit.getMapY() !== targetY){
            return false;
        }
        return true;
    },

    //ユニットの位置差分をXとYで返す
    getUnitPosDistance:function(unit1,unit2){
        var mainX = unit1.getMapX();
        var mainY = unit1.getMapY();
        var unitX = unit2.getMapX();
        var unitY = unit2.getMapY();
        return {x:unitX-mainX,y:unitY-mainY};
    },

    checkDistance:function(minDistance,maxDistance,dis){
        
        if( minDistance > -1 ){
            if( minDistance > dis ) {
                return false;
            }
        }
        if( maxDistance > -1 ){
            if( dis > maxDistance ) {
                return false;
            }
        }
        return true;
    },


    checkAttackRange:function(data,weapon,targetUnit,unit){
        if(!weapon){
            return false;
        }
        if(!data.isAttackRange){
            return true;
        }

        var indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
		
		return IndexArray.findPos(indexArray, targetUnit.getMapX(), targetUnit.getMapY());
    },

    createAlignmentActionData:function(unit, isExchange, isCounter, isAttackFormation, skill){
        if(skill === null){
            skill = isAttackFormation ? this._attackFormationShowSkill : this._defaultShowSkill;
        }
        return {
            unit: unit,
            isExchange: isExchange,
            skill: skill,
            //反撃者の連携
            isCounter: isCounter,
            isAttackFormation: isAttackFormation,
            isNoErase:false,
            isBeforeAlignment: false
        }
    },

    registerShowSkill:function(unit, skill){
        unit.custom.alignmentSkill = skill;
    },

    getShowSkill:function(unit){
        if(unit.custom.alignmentSkill){
            return unit.custom.alignmentSkill;
        }
        return null;
    },

    removeShowSkill:function(unit){
        delete unit.custom.alignmentSkill;
    }
};

AttackStartType.Alignment = 1001;
Ryba.AlignmentSkillControl = {
	checkAndPushSkill: function(active, passive, attackEntry, isActive, skilltype) {
		var skill = this.getPossessionSkill(active, skilltype);
		
		if (SkillRandomizer.isSkillInvoked(active, passive, skill)) {
			// スキルに「発動時に表示する」が設定されているか調べる
			if (skill.isSkillDisplayable()) {
				// 表示する場合は、描画時にスキルを参照できるように保存する
				if (isActive) {
					attackEntry.skillArrayActive.push(skill);
				}
				else {
					attackEntry.skillArrayPassive.push(skill);
				}
			}
			return skill;
		}
		
		return null;
	},
	
	checkAndPushCustomSkill: function(active, passive, attackEntry, isActive, keyword) {
		var skill = this.getPossessionCustomSkill(active, keyword);
		
		if (SkillRandomizer.isCustomSkillInvoked(active, passive, skill, keyword)) {
			if (skill.isSkillDisplayable()) {
				if (isActive) {
					attackEntry.skillArrayActive.push(skill);
				}
				else {
					attackEntry.skillArrayPassive.push(skill);
				}
			}
			return skill;
		}
		
		return null;
	},
	
	getBattleSkill: function(active, passive, skilltype) {
		var arr = this.getDirectSkillArray(active, skilltype, '');
		var skill = this._returnSkill(skilltype, arr);
		
		return this._getBattleSkillInternal(active, passive, skill);
	},
	
	getBattleSkillFromFlag: function(active, passive, skilltype, flag) {
		var i, count, skill;
		var arr = this.getDirectSkillArray(active, skilltype, '');
		
		count = arr.length;
		for (i = 0; i < count; i++) {
			if (arr[i].skill.getSkillType() === skilltype && arr[i].skill.getSkillValue() & flag) {
				skill = this._getBattleSkillInternal(active, passive, arr[i].skill);
				if (skill !== null) {
					return skill;
				}
			}
		}
		
		return null;
	},
	
	getBattleSkillFromValue: function(active, passive, skilltype, value) {
		var i, count, skill;
		var arr = this.getDirectSkillArray(active, skilltype, '');
		
		count = arr.length;
		for (i = 0; i < count; i++) {
			if (arr[i].skill.getSkillType() === skilltype && arr[i].skill.getSkillValue() === value) {
				skill = this._getBattleSkillInternal(active, passive, arr[i].skill);
				if (skill !== null) {
					return skill;
				}
			}
		}
		
		return null;
	},
	
	// unitがskilltypeのスキルを所持しているか調べる。
	// 戻り値は、所持しているスキル。
	getPossessionSkill: function(unit, skilltype) {
		var arr = this.getDirectSkillArray(unit, skilltype, '');
		
		return this._returnSkill(skilltype, arr);
	},
	
	// 最も数値が大きいスキルを返す
	getBestPossessionSkill: function(unit, skilltype) {
		var i, count;
		var arr = this.getDirectSkillArray(unit, skilltype, '');
		var max = -1000;
		var index = -1;
		
		count = arr.length;
		for (i = 0; i < count; i++) {
			if (arr[i].skill.getSkillType() === skilltype && arr[i].skill.getSkillValue() > max) {
				max = arr[i].skill.getSkillValue();
				index = i;
			}
		}
		
		if (index === -1) {
			return null;
		}
		
		return arr[index].skill;
	},
	
	getPossessionCustomSkill: function(unit, keyword) {
		var arr = this.getDirectSkillArray(unit, SkillType.CUSTOM, keyword);
		
		return this._returnSkill(SkillType.CUSTOM, arr);
	},
	
	getDirectSkillArray: function(unit, skilltype, keyword) {
		if (unit === null) {
			return [];
		}
		
		return this.getSkillMixArray(unit, ItemControl.getEquippedWeapon(unit), skilltype, keyword);
	},
	
	// skilltypeが-1の場合は、unitに関連する全てのスキルが対象になる
	getSkillMixArray: function(unit, weapon, skilltype, keyword) {
		var objectFlag = ObjectFlag.UNIT | ObjectFlag.CLASS | ObjectFlag.WEAPON | ObjectFlag.ITEM | ObjectFlag.STATE | ObjectFlag.TERRAIN | ObjectFlag.FUSION;
		
		return this.getSkillObjectArray(unit, weapon, skilltype, keyword, objectFlag);
	},
	
	getSkillObjectArray: function(unit, weapon, skilltype, keyword, objectFlag) {
		var arr = [];
		
		if (unit === null) {
			return arr;
		}
		
		this._pushObjectSkill(unit, weapon, arr, skilltype, keyword, objectFlag);
		
		return this._getValidSkillArray(arr);
	},
	
	_getBattleSkillInternal: function(active, passive, skill) {
		if (skill === null) {
			return null;
		}
	
		// 「有効相手」として許可されない
		if (passive !== null && !skill.getTargetAggregation().isCondition(passive)) {
			return null;
		}
		
		return skill;
	},
	
	_pushObjectSkill: function(unit, weapon, arr, skilltype, keyword, objectFlag) {
		var i, item, list, count, terrain, child;
		var checkerArray = [];
		var cls = unit.getClass();
		
		if (objectFlag & ObjectFlag.UNIT) {
			// ユニットのスキルを追加する
			this._pushSkillValue(unit, ObjectType.UNIT, arr, skilltype, keyword);
		}
		
		if (objectFlag & ObjectFlag.CLASS) {
			// ユニットが属するクラスのスキルを追加する
			this._pushSkillValue(cls, ObjectType.CLASS, arr, skilltype, keyword);
		}
		
		if (objectFlag & ObjectFlag.WEAPON) {
			if (weapon !== null) {
				// 武器のスキルを追加する
				this._pushSkillValue(weapon, ObjectType.WEAPON, arr, skilltype, keyword);
			}
		}
		
		if (objectFlag & ObjectFlag.ITEM) {
			count = UnitItemControl.getPossessionItemCount(unit);
			for (i = 0; i < count; i++) {
				item = UnitItemControl.getItem(unit, i);
				if (!ItemIdentityChecker.isItemReused(checkerArray, item)) {
					continue;
				}
				
				if (item !== null && ItemControl.isItemUsable(unit, item)) {
					// アイテムを使用できる場合は、スキルを追加する
					this._pushSkillValue(item, ObjectType.ITEM, arr, skilltype, keyword);
				}
			}
		}
		
		if (objectFlag & ObjectFlag.STATE) {
			// ユニットにかかっているステートのスキルを追加する
			list = unit.getTurnStateList();
			count = list.getCount();
			for (i = 0; i < count; i++) {
				this._pushSkillValue(list.getData(i).getState(), ObjectType.STATE, arr, skilltype, keyword);
			}
		}
		
		if (objectFlag & ObjectFlag.TERRAIN) {
			terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());
			if (terrain !== null) {
				this._pushSkillValue(terrain, ObjectType.TERRAIN, arr, skilltype, keyword);
			}
		}
		
		if (objectFlag & ObjectFlag.FUSION) {
			child = FusionControl.getFusionChild(unit);
			if (child !== null) {
				objectFlag = FusionControl.getFusionData(unit).getSkillIncludedObjectFlag();
				this._pushObjectSkillFromFusion(child, ItemControl.getEquippedWeapon(child), arr, skilltype, keyword, objectFlag);
			}
		}
	},
	
	_pushObjectSkillFromFusion: function(unit, weapon, arr, skilltype, keyword, objectFlag) {
		var i, item, list, count;
		var checkerArray = [];
		var cls = unit.getClass();
		
		// 全ての_pushSkillValueにはObjectType.FUSIONが指定される
		
		if (objectFlag & ObjectFlag.UNIT) {
			this._pushSkillValue(unit, ObjectType.FUSION, arr, skilltype, keyword);
		}
		
		if (objectFlag & ObjectFlag.CLASS) {
			this._pushSkillValue(cls, ObjectType.FUSION, arr, skilltype, keyword);
		}
		
		if (objectFlag & ObjectFlag.WEAPON) {
			if (weapon !== null) {
				this._pushSkillValue(weapon, ObjectType.FUSION, arr, skilltype, keyword);
			}
		}
		
		if (objectFlag & ObjectFlag.ITEM) {
			count = UnitItemControl.getPossessionItemCount(unit);
			for (i = 0; i < count; i++) {
				item = UnitItemControl.getItem(unit, i);
				if (!ItemIdentityChecker.isItemReused(checkerArray, item)) {
					continue;
				}
				
				if (item !== null && ItemControl.isItemUsable(unit, item)) {
					this._pushSkillValue(item, ObjectType.FUSION, arr, skilltype, keyword);
				}
			}
		}
		
		if (objectFlag & ObjectFlag.STATE) {
			list = unit.getTurnStateList();
			count = list.getCount();
			for (i = 0; i < count; i++) {
				this._pushSkillValue(list.getData(i).getState(), ObjectType.FUSION, arr, skilltype, keyword);
			}
		}
	},
	
	_pushSkillValue: function(data, objecttype, arr, skilltype, keyword) {
        var i, skill, skillEntry, isBuild;
        var list = data.getSkillReferenceList();
        var count = list.getTypeCount();
        
        // スキルリストからtypeで識別されるスキルを探す。
        // 見つかった場合は、そのスキルの値をarrに保存する。
        for (i = 0; i < count; i++) {
            skill = list.getTypeData(i);
            
            isBuild = false;
            if (skilltype === -1) {
                isBuild = true;
            }
            else if (skill.getSkillType() === skilltype) {
                isBuild = true;
            }
            
            if (isBuild) {
                skillEntry = StructureBuilder.buildMixSkillEntry();
                skillEntry.objecttype = objecttype;
                skillEntry.skill = skill;
                arr.push(skillEntry);
            }
        }
    },
	
	_returnSkill: function(skilltype, arr) {
		var i;
		var count = arr.length;
		var max = -1000;
		var index = -1;
		
		// arrの中からskilltypeと一致スキルを探す。
		// 同種スキルが複数存在する場合は、発動率が高いスキルを優先する
		for (i = 0; i < count; i++) {
			if (arr[i].skill.getSkillType() === skilltype && arr[i].skill.getInvocationValue() > max) {
				max = arr[i].skill.getInvocationValue();
				index = i;
			}
		}
		
		if (index === -1) {
			return null;
		}
		
		return arr[index].skill;
	},
	
	_getValidSkillArray: function(arr) {
		var i;
		var count = arr.length;
		var usedAry = [];
		
		for (i = 0; i < count; i++) {
			// 既に追加されているスキルは、再び追加してはならない
			if (this._isUsed(usedAry, arr[i])) {
				continue;
			}
			
			usedAry.push(arr[i]);
		}
		
		return usedAry;
	},
	
	_isUsed: function(arr, obj) {
		var i;
		var count = arr.length;
		
		for (i = 0; i < count; i++) {
			if (arr[i].skill.getId() === obj.skill.getId()) {
				return true;
			}
		}
		
		return false;
	},

    getCustomSkillFromArrayToArray :function(arr, keyword) {
        var i, skill;
        var count = arr.length;
        var resultArray = [];
        
        // arrの中からskilltypeと一致スキルを探す。
        for (i = 0; i < count; i++) {
            skill = arr[i].skill;
            if (skill.getCustomKeyword() === keyword) {
                resultArray.push(skill);
            }
        }
        if( resultArray.length < 1){
            return null;
        }
        return resultArray;
    },

    getCustomSkillArray :function(unit) {
        return this.getDirectSkillArray(unit, SkillType.CUSTOM, '');
    }

};

Ryba.AlignmentActionControl = {

    //先制攻撃のチェック
    //(発動率100%以外の先制攻撃は無理,発動率100%以外のチェックを行うと乱数がずれる)
    getDefaultPriorityData: function(active,passive) {
        
        var result = {
            isDefaultPriority:true,
            isCounterattack:AttackChecker.isCounterattack(active,passive)
        }
        if(!Ryba.AlignmentControl.AttackFormationFastAttackCheck){
            //TODO:確率発動スキルの判定を正確に取得するにはどこかに値を保持して参照する必要があるため非常に面倒である。
            // そのため確率発動スキルがある場合は常に通常の処理順とする
            return result;
        }
        var skilltype = SkillType.FASTATTACK;
        var skill = SkillControl.getPossessionSkill(active, skilltype);
        if (SkillRandomizer.isSkillInvoked(active, passive, skill)) {
			// 攻撃をしかけた方が「先制攻撃」のスキルを持つ場合は、その時点で通常戦闘と判断する
			result.isDefaultPriority = true;
            return result;
		}
        if( result.isCounterattack ) {
            skill = SkillControl.getPossessionSkill(passive, skilltype);	
            if (SkillRandomizer.isSkillInvoked(passive, active, skill)) {
				result.isDefaultPriority = false;
                return result;
			}
        }
        return result;
    },
    //味方のリストを返す
    getFellowUnitList:function(unitType){
        var list = null;
        if(unitType === UnitType.PLAYER){
            list = PlayerList.getSortieList();
        }else if(unitType=== UnitType.ENEMY){
            list = EnemyList.getAliveList();
        }else if(unitType === UnitType.ALLY){
            list = AllyList.getAliveList();
        }
        return list;
    },
    //連携攻撃の予測ダメージを返す
    //予測ダメージを実装したい場合はこの関数の戻り値を利用して表示してください
    //連携攻撃が発生しない場合-1を返す（戻り値0は連携攻撃は発生するがノーダメージ）
    totalDamageCalculator:function(selfUnit,targetUnit){
        var result = 0;

        var mainData = [];

        //次の盤面の味方をチェック
        var i, unit, weapon, activeTotalStatus, passiveTotalStatus, data, damage;
        var list;
        var isCounter = false;

        list = this.getFellowUnitList(selfUnit.getUnitType());

        if(list === null){
            return -1;
        }

        passiveTotalStatus = SupportCalculator.createTotalStatus(targetUnit);

        //スキルの追加攻撃のダメージ分
        var count = list.getCount();
        var attackerOn = false;
        for( i = 0; i < count; ++i ){
            unit = list.getData(i);
            //自分同士で連携するのはおかしい
            if(selfUnit === unit){
               continue; 
            }
            weapon = ItemControl.getEquippedWeapon(unit);
            if(!this._alignmentUnitAppendCheck(mainData,unit,targetUnit,selfUnit,weapon)){
                continue;
            } 
            //支援効果の計算処理は非常に重たいため利用していないなら{}を渡したほうが良い
            activeTotalStatus = SupportCalculator.createTotalStatus(unit);//{}
            result += DamageCalculator.calculateDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0);
            attackerOn = true;
        }

        //攻陣ダメージ分
        var attackFormationList = this._createAttackFormationList(selfUnit,targetUnit,isCounter);
        count = attackFormationList.length;
        //root.log('attackFormationList' + count);
        for( i = 0; i < count; ++i ){
            data = attackFormationList[i];
            unit = data.unit;
            weapon = ItemControl.getEquippedWeapon(unit);
            activeTotalStatus = SupportCalculator.createTotalStatus(unit);//{}
            damage = DamageCalculator.calculateDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0);
            damage = Math.floor(damage * Ryba.AlignmentControl.AttackFormationDamageRate / 100);
            result += damage;
            attackerOn = true;
        }
        //root.log('attackerOn' + result);
        if(!attackerOn){
            if(result === 0){
                return -1;
            }
        }
        //root.log('最終連携ダメージ' + result);
        return result;
    },
    moveBeforeAlignmentAttack: function(pearent,selfUnit,targetUnit, defaultPriorityData) {
        //this.totalDamageCalculator(selfUnit,targetUnit,false);
        var isNoErase = true;
        if(defaultPriorityData.isDefaultPriority){
            pearent._alignmentList = this._createAttackFormationList(selfUnit,targetUnit,false,isNoErase);
        }else{
            pearent._alignmentList = [];
            if(Ryba.AlignmentControl.AttackFormationCounter){
                //root.log('counter' + defaultPriorityData.isCounterattack)
                if(defaultPriorityData.isCounterattack){
                    pearent._alignmentList = this._createAttackFormationList(targetUnit,selfUnit,true,isNoErase);
                    //root.log('pearent._alignmentList' + pearent._alignmentList.length)
                }
            }
        }
        
        var result = this._nextAlignment(selfUnit,targetUnit,pearent._alignmentList);
        if(result !== null){
            pearent._preAttack = result.preAttack;
            pearent._lastAttackParam = result.attackParam;
            return MoveResult.CONTINUE;
        }
        return MoveResult.END;
    },
    moveAlignmentAttack: function(pearent,selfUnit,targetUnit,defaultPriorityData) {
        var result = this._checkAlignmentAttack(pearent,selfUnit,targetUnit,defaultPriorityData);
        if(result !== null){
            pearent._preAttack = result.preAttack;
            pearent._lastAttackParam = result.attackParam;
            return MoveResult.CONTINUE;
        }
        return MoveResult.END;
    },
    _checkAlignmentAttack: function(pearent,selfUnit,targetUnit,defaultPriorityData){
        //死亡している場合追撃する意味はない
        if( !targetUnit || targetUnit.getHp() < 1 || selfUnit.getHp() < 1){
            return null;
        }
        var isNoErase = false;
        pearent._alignmentList = [];
        if(defaultPriorityData.isDefaultPriority){
            if(Ryba.AlignmentControl.AttackFormationCounter){
                if(defaultPriorityData.isCounterattack){
                    pearent._alignmentList = this._createAttackFormationList(targetUnit,selfUnit,true,isNoErase);
                }
            }
        }else{
            pearent._alignmentList = this._createAttackFormationList(selfUnit,targetUnit,false,isNoErase);
        }

        pearent._alignmentList = pearent._alignmentList.concat(this._createAlignmentList(selfUnit,targetUnit,false,isNoErase));
    
        return this._nextAlignment(selfUnit,targetUnit,pearent._alignmentList);
    },
    _createAttackFormationList:function(selfUnit,targetUnit,isCounter,isNoErase){
        var result = [];

        if( Ryba.AlignmentControl.AttackFormationFusion ) {
            if(FusionControl.getFusionChild(selfUnit) !== null){
                return result;
            }
        }
        //root.log('selfUnit' + selfUnit.getName())
        var i, x, y, unit, data, param;
        for (i = 0; i < DirectionType.COUNT; i++) {
            //必要数以上だった場合、そこで終了
            if(result.length >= Ryba.AlignmentControl.AttackFormationCount){
                return result;
            }

			x = selfUnit.getMapX() + XPoint[i];
			y = selfUnit.getMapY() + YPoint[i];
		
			unit = PosChecker.getUnitFromPos(x, y);
			if (unit === null){
                continue;
            }
            //root.log('PosChecker.getUnitFromPos' + unit.getName() + unit.getUnitType() + ';' +unit.getUnitType())
            //違う陣営なら連携しない
            if(unit.getUnitType() !== selfUnit.getUnitType()){
                continue;
            }
            //root.log('unit.getUnitType() === selfUnit.getUnitType()')
            data = Ryba.AlignmentControl.createAlignmentActionData(unit,false,isCounter,true,null);
            data.isNoErase = isNoErase;

            //まずメインデータのチェック
            param = Ryba.AlignmentControl.buildCheckDataParam();
            param.data = [data];
            param.attakcer = selfUnit;//isCounter ? targetUnit : selfUnit;
            param.targetUnit = targetUnit;//isCounter ? selfUnit : targetUnit;
            param.unit = unit;
            param.weapon = ItemControl.getEquippedWeapon(unit);
            if(Ryba.AlignmentControl.checkData(param)){
                //条件を満たしていたら追加
                result.push(data);
            }
		}
        //root.log('data' + result.length)
        return result;
    },
    _createAlignmentList: function(selfUnit,targetUnit,isCounter,isNoErase){
        var result = [];
        var list = this.getFellowUnitList(selfUnit.getUnitType());
        var skillArray = Ryba.AlignmentSkillControl.getCustomSkillArray(selfUnit);

        if( skillArray === null ){
            return result;
        }
        
        var mainData = Ryba.AlignmentControl.getAlignmentData_Main(skillArray);
        
        //まずフュージョンチェック
        this._alignmentFusionAppendCheck(selfUnit,targetUnit,isCounter,result);
    
        //次の盤面の味方をチェック
        var i, unit, weapon;
        var count = list.getCount();
        for( i = 0; i < count; ++i ){
            unit = list.getData(i);
            //自分同士で連携するのはおかしい
            if(selfUnit === unit){
               continue; 
            }
            weapon = ItemControl.getEquippedWeapon(unit);
            if(!this._alignmentUnitAppendCheck(mainData,unit,targetUnit,selfUnit,weapon)){
                continue;
            } 
            data = Ryba.AlignmentControl.createAlignmentActionData(unit,false,isCounter,false,null);
            data.isNoErase = isNoErase;
            result.push(data);
        }
        return result;
    },
    _alignmentFusionAppendCheck: function(selfUnit, targetUnit, isCounter,result){
        var child = FusionControl.getFusionChild(selfUnit);
        if(!child){
            return false;
        }
        //root.log(child.getName());
        //違う陣営同士だと連携するのはおかしい
        if(child.getUnitType() !== selfUnit.getUnitType()){
            return false;
        }
        //root.log(child.getUnitType());
        var weapon = ItemControl.getEquippedWeapon(child);
        //root.log('攻撃可能');
        var childSkillArray = Ryba.AlignmentSkillControl.getCustomSkillArray(child);
        var fusionAlignmentData = Ryba.AlignmentControl.getAlignmentData_Fusion(childSkillArray, weapon);
        var distance = Ryba.AlignmentControl.getUnitDistance(child, targetUnit);
    
        var param = Ryba.AlignmentControl.buildCheckDataParam();
        param.data = fusionAlignmentData;
        param.attakcer = selfUnit;
        param.targetUnit = targetUnit;
        param.unit = child;
        param.weapon = weapon;
        param.distance = distance;
        param.attackerDistance = Ryba.AlignmentControl.getUnitDistance(child, selfUnit);
        if(!Ryba.AlignmentControl.checkData(param)){
            return false;
        }
        //root.log('条件クリア');
        result.push(Ryba.AlignmentControl.createAlignmentActionData(child,fusionAlignmentData.isExchange,isCounter,false,null));
    },
    _alignmentUnitAppendCheck: function(mainData,unit,targetUnit,selfUnit,weapon){
        //前提条件（そもそも攻撃できるかどうか）
        if(!weapon){
            return false;
        }
        
        //射程距離計測
        var distance = Ryba.AlignmentControl.getUnitDistance(unit, targetUnit);
        var attackerDistance = Ryba.AlignmentControl.getUnitDistance(unit, selfUnit);
    
        //まずメインデータのチェック
        var param = Ryba.AlignmentControl.buildCheckDataParam();
        param.data = mainData;
        param.attakcer = selfUnit;
        param.targetUnit = targetUnit;
        param.unit = unit;
        param.weapon = weapon;
        param.distance = distance;
        param.attackerDistance = attackerDistance;
        if(Ryba.AlignmentControl.checkData(param)){
            //条件を満たしていたらtrue
            return true;
        }
    
        //次にサブデータチェック
        //スキル配列作成
        var skillArray = Ryba.AlignmentSkillControl.getCustomSkillArray(unit);
        var subData = Ryba.AlignmentControl.getAlignmentData_Support(skillArray, weapon);
        param = Ryba.AlignmentControl.buildCheckDataParam();
        param.data = subData;
        param.attakcer = selfUnit;
        param.targetUnit = targetUnit;
        param.unit = unit;
        param.weapon = weapon;
        param.distance = distance;
        param.attackerDistance = attackerDistance;
        if(!Ryba.AlignmentControl.checkData(param)){
            return false;
        }
    
        return true;
    },
    nextAlignment: function(pearent, attacker, targetUnit,alignmentList) {
        var result = this._nextAlignment(attacker, targetUnit, alignmentList);
        if(result !== null){
            pearent._preAttack = result.preAttack;
            pearent._lastAttackParam = result.attackParam;
            return true;
        }
        return false;
    },
    _nextAlignment: function(attacker,targetUnit,alignmentList){
        if(alignmentList.length < 1){
            return null;
        }
        
        var data = alignmentList[0];
        alignmentList.shift();

        var attackParam = StructureBuilder.buildAttackParam();

        if( data.isCounter ) {
            attackParam.unit = data.unit;
            attackParam.targetUnit = attacker;
        }else{
            attackParam.unit = data.unit;
            attackParam.targetUnit = targetUnit;
        }

        //死亡している場合追撃する意味はない
        if( !attackParam.targetUnit || attackParam.targetUnit.getHp() < 1){
            return null;
        }
        
        attackParam.attackStartType = AttackStartType.Alignment;
    
        //表示用スキルを登録
        Ryba.AlignmentControl.registerShowSkill(data.unit,data.skill);
    
        //絶対に反撃されないステートのIDは210
        Ryba.AlignmentControl.beforeAttackState(attackParam.unit, data);
    
        var preAttack = createObject(PreAttack);
        var result = preAttack.enterPreAttackCycle(attackParam);
        
        if (result === EnterResult.NOTENTER) {
            Ryba.AlignmentControl.removeShowSkill(data.unit);
            return this._nextAlignment(attacker,targetUnit,alignmentList);
        }
        // root.log(attackParam === null);
        // root.log('attackParam')
        return {
            attackParam:attackParam,
            preAttack:preAttack
        };
    }
};

AttackCommandMode.AutoAttack = 1001;
AttackCommandMode.AutoAttackSelect = 1002;
AttackCommandMode.BeforeAutoAttack = 1003;
UnitCommand.Attack._skillArray = null;
UnitCommand.Attack._alignmentList = null;
UnitCommand.Attack._defaultPriorityData = null;
UnitCommand.Attack._attackParam = null;
//新規関数
UnitCommand.Attack.setSkillArray = function(array){
    this._skillArray = array;
};
UnitCommand.Attack._lastAttackParam = null;

UnitCommand.Attack._moveBeforeAutoAttack = function(){
    var result = this._baseMoveAutoAttack(this._attackParam.unit,this._attackParam.targetUnit);
    if(result === MoveResult.END){
        if(this._mainAttackStart() === MoveResult.END){
            return MoveResult.END;
        }
        this.changeCycleMode(AttackCommandMode.RESULT);
    }
    return MoveResult.CONTINUE;
};
UnitCommand.Attack._moveAutoAttack = function() {
    var result = this._baseMoveAutoAttack(this._attackParam.unit,this._attackParam.targetUnit);
    if(result === MoveResult.END){
        this.endCommandAction();
        return MoveResult.END;
    }
    return MoveResult.CONTINUE;
};

UnitCommand.Attack._baseMoveAutoAttack = function(attacker, targetUnit){
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        if(Ryba.AlignmentActionControl.nextAlignment(this,attacker, targetUnit,this._alignmentList)){
            return MoveResult.CONTINUE;
        }
        if(this._lastAttackParam){
            Ryba.AlignmentControl.removeShowSkill(this._lastAttackParam.unit);
            this._lastAttackParam = null;
        }
        return MoveResult.END;
    }
    
    return MoveResult.CONTINUE;
};

//既存関数の変更
UnitCommand.Attack.moveCommand = function() {
    var mode = this.getCycleMode();
    var result = MoveResult.CONTINUE;
    
    if (mode === AttackCommandMode.TOP) {
        result = this._moveTop();
    }
    else if (mode === AttackCommandMode.SELECTION) {
        result = this._moveSelection();
    }
    else if (mode === AttackCommandMode.RESULT) {
        result = this._moveResult();
    }else if (mode === AttackCommandMode.BeforeAutoAttack) {
        result = this._moveBeforeAutoAttack();
    }else if (mode === AttackCommandMode.AutoAttack) {
        result = this._moveAutoAttack();
    }
    
    return result;
};
UnitCommand.Attack.drawCommand = function() {
    var mode = this.getCycleMode();
    
    if (mode === AttackCommandMode.TOP) {
        this._drawTop();
    }
    else if (mode === AttackCommandMode.SELECTION) {
        this._drawSelection();
    }
    else if (mode === AttackCommandMode.RESULT) {
        this._drawResult();
    }else if(mode === AttackCommandMode.BeforeAutoAttack || mode === AttackCommandMode.AutoAttack){
        this._preAttack.drawPreAttackCycle();
    }
};
UnitCommand.Attack._mainAttackStart = function(){
    var result = this._preAttack.enterPreAttackCycle(this._attackParam);
    if (result === EnterResult.NOTENTER) {
        this.endCommandAction();
        return MoveResult.END;
    }
    
    return MoveResult.CONTINUE;
};
UnitCommand.Attack._moveSelection = function() {
    var result = this._posSelector.movePosSelector();
    
    if (result === PosSelectorResult.SELECT) {
        if (this._isPosSelectable()) {
            this._posSelector.endPosSelector();
            
            this._preAttack = createObject(PreAttack);
            this._attackParam = this._createAttackParam();
            this._defaultPriorityData = Ryba.AlignmentActionControl.getDefaultPriorityData(this._attackParam.unit,this._attackParam.targetUnit);
            var result = Ryba.AlignmentActionControl.moveBeforeAlignmentAttack(this,this._attackParam.unit,this._attackParam.targetUnit,this._defaultPriorityData);
            if(result === MoveResult.CONTINUE){
                this.changeCycleMode(AttackCommandMode.BeforeAutoAttack);
                return MoveResult.CONTINUE;
            }else{
               //通常戦闘分の処理
               if(this._mainAttackStart() === MoveResult.END){
                    return MoveResult.END;
               }

               this.changeCycleMode(AttackCommandMode.RESULT);
            }
        }
    }
    else if (result === PosSelectorResult.CANCEL) {
        this._posSelector.endPosSelector();
        if (this._isWeaponSelectDisabled) {
            return MoveResult.END;
        }
        
        this._weaponSelectMenu.setMenuTarget(this.getCommandTarget());
        this.changeCycleMode(AttackCommandMode.TOP);
    }
    
    return MoveResult.CONTINUE;
};
UnitCommand.Attack._moveResult = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        var result = Ryba.AlignmentActionControl.moveAlignmentAttack(this,this._attackParam.unit,this._attackParam.targetUnit,this._defaultPriorityData);
        if(result === MoveResult.CONTINUE){
            this.changeCycleMode(AttackCommandMode.AutoAttack);
            return MoveResult.CONTINUE;
        }
        this.endCommandAction();
        return MoveResult.END;
    }
    return MoveResult.CONTINUE;
};
//敵側-------
WeaponAutoActionMode.AutoAttack = 1001;
WeaponAutoAction._defaultPriorityData = null;
WeaponAutoAction.moveAutoAction = function() {
    var result = MoveResult.CONTINUE;
    var mode = this.getCycleMode();
    
    if (mode === WeaponAutoActionMode.CURSORSHOW) {
        result = this._moveCursorShow();
    }
    else if (mode === WeaponAutoActionMode.PREATTACK) {
        result = this._movePreAttack();
    }else if (mode === AttackCommandMode.BeforeAutoAttack) {
        result = this._moveBeforeAutoAttack();
    }else if(mode === AttackCommandMode.AutoAttack){
        result = this._moveAutoAttack();
    }
    
    return result;
};

WeaponAutoAction.drawAutoAction = function() {
    var mode = this.getCycleMode();
    
    if (mode === WeaponAutoActionMode.CURSORSHOW) {
        this._drawCurosrShow();
    }
    else if (mode === WeaponAutoActionMode.PREATTACK) {
        this._drawPreAttack();
    }else if(mode === AttackCommandMode.BeforeAutoAttack || mode === AttackCommandMode.AutoAttack){
        this._preAttack.drawPreAttackCycle();
    }
};
WeaponAutoAction._baseEnterAutoAction = function() {
    var isSkipMode = this.isSkipMode();
    
    if (isSkipMode) {
        if (this._enterAttack() === EnterResult.NOTENTER) {
            return EnterResult.NOTENTER;
        }
        
        this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
    }
    else {
        this._changeCursorShow();
        this.changeCycleMode(WeaponAutoActionMode.CURSORSHOW);
    }
    
    return EnterResult.OK;
};
WeaponAutoAction.enterAutoAction = function() {
    this._defaultPriorityData = Ryba.AlignmentActionControl.getDefaultPriorityData(this._unit,this._targetUnit);
    var result = Ryba.AlignmentActionControl.moveBeforeAlignmentAttack(this,this._unit,this._targetUnit,this._defaultPriorityData);
    if(result === MoveResult.CONTINUE){
        this.changeCycleMode(AttackCommandMode.BeforeAutoAttack);
    }else{
        //通常戦闘分の処理
        if(this._baseEnterAutoAction() === EnterResult.NOTENTER){
            return EnterResult.NOTENTER;
        }
    }
    
    return EnterResult.OK;
};

WeaponAutoAction._movePreAttack = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        
        var result = Ryba.AlignmentActionControl.moveAlignmentAttack(this,this._unit,this._targetUnit,this._defaultPriorityData);
        if(result === MoveResult.CONTINUE){
            this.changeCycleMode(AttackCommandMode.AutoAttack);
            return MoveResult.CONTINUE;
        }
        return MoveResult.END;
    }
    
    return MoveResult.CONTINUE;
};
WeaponAutoAction._moveAutoAttack = function() {
    return UnitCommand.Attack._baseMoveAutoAttack.call(this,this._unit,this._targetUnit);
};
WeaponAutoAction._moveBeforeAutoAttack = function() {
    var result = UnitCommand.Attack._baseMoveAutoAttack.call(this,this._unit,this._targetUnit);
    if(result === MoveResult.END){
        if(this._baseEnterAutoAction() === EnterResult.NOTENTER){
            return MoveResult.END;
        }
    }
    return MoveResult.CONTINUE;
};
WeaponAutoAction.isSkipAllowed = function() {
    var mode = this.getCycleMode();
    
    if (mode === WeaponAutoActionMode.PREATTACK || mode === AttackCommandMode.AutoAttack || mode === AttackCommandMode.BeforeAutoAttack) {
        return false;
    }

    return true;
};

//連携攻撃演出関連
Ryba.AlignmentAttackInfoBuilder = defineObject(NormalAttackInfoBuilder,
{
    createAttackInfo: function(attackParam) {
        //基本的にNormalAttackInfoBuilderと同じ処理とする
        var attackInfo = NormalAttackInfoBuilder.createAttackInfo.call(this, attackParam);

        if(Ryba.AlignmentControl.EasyBattleSwitchId > -1){
            var switchTable = root.getMetaSession().getGlobalSwitchTable();
            var switchIndex = switchTable.getSwitchIndexFromId(Ryba.AlignmentControl.EasyBattleSwitchId);
            var flag = switchTable.isSwitchOn(switchIndex);
            if(flag){
                attackInfo.battleType = BattleType.FORCEEASY;
            }
        }
        var weapon = ItemControl.getEquippedWeapon(attackParam.unit);
        if(weapon){
            //最大射程が1しかない場合は近接モーション
            attackInfo.isDirectAttack = (weapon.getEndRange() === 1);
        }
        
        return attackInfo;
    }
}
);
CoreAttack._checkAttack = function() {
    if (this._attackParam.attackStartType === AttackStartType.NORMAL) {
        this._startNormalAttack();
    }
    else if (this._attackParam.attackStartType === AttackStartType.FORCE) {
        this._startForceAttack();
    }
    else if (this._attackParam.attackStartType === AttackStartType.Alignment) {
        this._startAlignmentAttack();
    }
};
CoreAttack._startAlignmentAttack = function() {
    var infoBuilder = createObject(Ryba.AlignmentAttackInfoBuilder);
    var orderBuilder = createObject(NormalAttackOrderBuilder);
    var attackInfo = infoBuilder.createAttackInfo(this._attackParam);
    var attackOrder = orderBuilder.createAttackOrder(attackInfo);
    
    return this._startCommonAttack(attackInfo, attackOrder);
};

DamageControl.checkHp = function(active, passive) {
    var hp = passive.getHp();
    if (hp > 0) {
        return;
    }
    if (FusionControl.getFusionAttackData(active) !== null) {
        // 後で呼ばれるisLostedのために、この時点ではhpを1にしない
        this.setCatchState(passive, false);
    }
    else {
        if( !Ryba.AlignmentControl.findNoEraseState(passive) ) {
            this.setDeathState(passive);
        }
    }
};

AttackFlow.executeAttackPocess = function(){
    var active = this._order.getActiveUnit();
	var passive = this._order.getPassiveUnit();
    if( Ryba.AlignmentControl.findNoEraseAttackState(active) ) {
        Ryba.AlignmentControl.noEraseStateTempDeath(active,passive);
    }
    this._doAttackAction();
	this._order.nextOrder();
};

AttackFlow.isBattleUnitLosted = function(){
    var active = this._order.getActiveUnit();
	var passive = this._order.getPassiveUnit();

    if( Ryba.AlignmentControl.findNoEraseAttackState(active) || Ryba.AlignmentControl.findNoEraseState(passive)) {
        return false;
    }
		
	return DamageControl.isLosted(active) || DamageControl.isLosted(passive);
};

AttackFlow._pushFlowEntriesEnd = function(straightFlow) {
    straightFlow.pushFlowEntry(UnitDeathFlowEntry);
    straightFlow.pushFlowEntry(UnitSyncopeFlowEntry);
    
    // リアル戦闘用の経験値取得と、簡易戦闘用の経験値取得を追加しているが、
    // 実際に処理が実行されるのはどちらか片方である。
    straightFlow.pushFlowEntry(RealExperienceFlowEntry);
    straightFlow.pushFlowEntry(EasyExperienceFlowEntry);
    
    straightFlow.pushFlowEntry(WeaponBrokenFlowEntry);
    straightFlow.pushFlowEntry(StateAutoRemovalFlowEntry);
    straightFlow.pushFlowEntry(Ryba.AttackAlignmentFlowEntry);
};

Ryba.AttackAlignmentFlowEntry = defineObject(BaseFlowEntry,
{	
    enterFlowEntry: function(coreAttack) {
        var attackFlow = coreAttack.getAttackFlow();
        var order = attackFlow.getAttackOrder();
        var active = order.getActiveUnit();
	    var passive = order.getPassiveUnit();
        Ryba.AlignmentControl.removeNoEraseAttackState(active);
        Ryba.AlignmentControl.removeNoEraseState(passive);
        return EnterResult.NOTENTER;
    }
}
);

//-----------
(function() {
    var aliasSetup = SetupControl.setup
    SetupControl.setup = function() {
            aliasSetup.call(this);
            
            Ryba.AlignmentControl.setup();
    };

    // スキル所有者が攻撃する際にスキル発動表示を行う
    var alias = NormalAttackOrderBuilder._setInitialSkill;
    NormalAttackOrderBuilder._setInitialSkill = function(virtualActive, virtualPassive, attackEntry) {
        
        alias.call(this, virtualActive, virtualPassive, attackEntry);
        var activeUnit = virtualActive.unitSelf;
        //root.log('NormalAttackOrderBuilder._setInitialSkill' + activeUnit.getName());
        var skill = Ryba.AlignmentControl.getShowSkill(activeUnit);
        if(skill){
            attackEntry.skillArrayActive.push(skill);
            Ryba.AlignmentControl.removeShowSkill(activeUnit);
        }
        
    };

    var aliasCounterattack = AttackChecker.isCounterattack;
    AttackChecker.isCounterattack = function(unit, targetUnit) {
        //絶対に反撃を封じるステートを所持している場合、反撃できない
		if( Ryba.AlignmentControl.findNoCounterState(unit) ){
			return false;
		}
		return aliasCounterattack.call(this,unit, targetUnit);
	};

    var aliasUnitCommandAttackPre = UnitCommand.Attack._prepareCommandMemberData;
    UnitCommand.Attack._prepareCommandMemberData = function(){
        aliasUnitCommandAttackPre.call(this);
        this.setSkillArray(Ryba.AlignmentSkillControl.getCustomSkillArray(this.getCommandTarget()));
    };

    //敵側-------
    var aliasAutoAction_setAutoActionInfo = WeaponAutoAction.setAutoActionInfo;
    WeaponAutoAction.setAutoActionInfo = function(unit, combination) {
        aliasAutoAction_setAutoActionInfo.call(this,unit,combination);
    };
    //-----------

    var aliasSetDeathState = DamageControl.setDeathState;
    DamageControl.setDeathState = function(unit) {
        //root.log('setDeathState')
        aliasSetDeathState.call(this,unit);
        Ryba.AlignmentControl.removeNoEraseState(unit);
    };

    var aliasCalculateDamage = DamageCalculator.calculateDamage;
    DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
        var damage = aliasCalculateDamage.call(this,active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue);
        if( Ryba.AlignmentControl.findNoEraseAttackState(active) ) {
            damage = Math.floor(damage * Ryba.AlignmentControl.AttackFormationDamageRate / 100);
        }
        return damage;
    };

    var aliasCalculateRoundCount = Calculator.calculateRoundCount;
    Calculator.calculateRoundCount = function(active, passive, weapon) {
        var count = aliasCalculateRoundCount.call(this,active, passive, weapon);
        if(!Ryba.AlignmentControl.AttackFormationRound){
            if( Ryba.AlignmentControl.findNoEraseAttackState(active) ) {
                return 1;
            }
        }
        return count;
    }
})();
