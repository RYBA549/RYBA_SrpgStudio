/*-----------------------------------------------------------------------------------------------
    
　某ゲームの「追撃（挟み撃ち）」みたいな事ができるようになります。
　（対局の位置にいる味方が攻撃してくれるスキル）

　※敵対応版です。無印の方を入れている場合は削除してください

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
    isPinching:0
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
   minDistance　最低射程です。これ以上だと発動可能になります。-1だと無条件です。
   maxDistance  最高射程です。これ以下だと発動可能になります。-1だと無条件です。
   isPinching  1に設定すると攻撃したユニットの位置と対極のユニットが発動可能になります。0だと無条件です。



■設定項目
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
　SRPG Studio Version:1.274

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
Ryba.AlignmentSkillControl = null;
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
    //このステートを付与されているユニットは相手の反撃を受けない
    //このステートは
    //「メニュー上で表示しない」にチェックを入れ
    //自動解除条件「戦闘に入った 1」にしておくこと
    CounterAttackStateId: 6,
    //----------------------------------------------------------------------------------------
    _defaultShowSkill:null,

    setup:function(){
        if(this.DefaultSkillNumber < 0){
            return;
        }
        var list = root.getBaseData().getSkillList();
        this._defaultShowSkill = list.getDataFromId(this.DefaultSkillNumber);
    
        Ryba.AlignmentSkillControl = SkillControl;
        Ryba.AlignmentSkillControl._pushSkillValue = function(data, objecttype, arr, skilltype, keyword) {
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
        };
        Ryba.AlignmentSkillControl.getCustomSkillArray = function(unit) {
            return this.getDirectSkillArray(unit, SkillType.CUSTOM, '');
        };
        Ryba.AlignmentSkillControl.getCustomSkillFromArrayToArray = function(arr, keyword) {
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
        };
    
    },

    findNoCounterState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.CounterAttackStateId);
		return StateControl.getTurnState(unit, state);
    },

    beforeAttackState:function(unit){
        var stateBaseList = root.getBaseData().getStateList();
        var state = stateBaseList.getDataFromId(this.CounterAttackStateId);
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

        var i, skill, minDis, maxDis, obj;
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
            minDis = skill.custom.minDistance;
            if(typeof minDis === 'number'){
                if(obj.minDistance < 0 || minDis < obj.minDistance){
                    obj.minDistance = minDis;
                }
            }
            maxDis = skill.custom.maxDistance;
            if(typeof maxDis === 'number'){
                if(obj.maxDistance < 0 || obj.maxDistance < maxDis){
                    obj.maxDistance = maxDis;
                }
            }
            if(!obj.isPinching){
                if(typeof skill.custom.isPinching === 'number'){
                    obj.isPinching = (skill.custom.isPinching === 1);
                }
            }
            result.push(obj);
        }

        return result;
    },

    _buildAlignmentData:function(){
        return {
            minDistance:-1,
            maxDistance:-1,
            isExchange:false,
            isPinching:false
        };
    },

    buildCheckDataParam:function(){
        return {
            data:null,
            attakcer:null,
            targetUnit:null,
            unit:null,
            distance:0
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
            if(!this.checkDistance(data,param.distance)){
                continue;
            }
            if(!this.checkPinching(data,param.attakcer, param.targetUnit,param.unit)){
                continue;
            }
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

    checkDistance:function(data,dis){
        
        if( data.minDistance > -1 ){
            if( data.minDistance > dis ) {
                return false;
            }
        }
        if( data.maxDistance > -1 ){
            if( dis > data.maxDistance ) {
                return false;
            }
        }
        return true;
    },

    createAlignmentActionData:function(unit, isExchange, skill){
        if(skill === null){
            skill = this._defaultShowSkill;
        }
        return {
            unit: unit,
            isExchange: isExchange,
            skill: skill
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
Ryba.AlignmentActionControl = {
    moveAlignmentAttack: function(pearent,selfUnit,targetUnit,skillArray, list) {
        var result = this._checkAlignmentAttack(pearent,selfUnit,targetUnit,skillArray,list);
        if(result !== null){
            pearent._preAttack = result.preAttack;
            pearent._lastAttackParam = result.attackParam;
            return MoveResult.CONTINUE;
        }
        return MoveResult.END;
    },
    _checkAlignmentAttack: function(pearent,selfUnit,targetUnit,skillArray,list){
        if( skillArray === null ){
            return null;
        }
        //死亡している場合追撃する意味はない
        if( !targetUnit || targetUnit.getHp() < 1 || selfUnit.getHp() < 1){
            return null;
        }
        pearent._alignmentList = this._createAlignmentList(selfUnit,targetUnit,skillArray,list);
    
        return this._nextAlignment(targetUnit,pearent._alignmentList);
    },
    _createAlignmentList: function(selfUnit,targetUnit,skillArray, list){
        var result = [];
        
        var mainData = Ryba.AlignmentControl.getAlignmentData_Main(skillArray);
        
        //まずフュージョンチェック
        this._alignmentFusionAppendCheck(selfUnit,targetUnit,result);
    
        //次の盤面の味方をチェック
        var i, unit;
        var count = list.getCount();
        for( i = 0; i < count; ++i ){
            unit = list.getData(i);
            //自分同士で連携するのはおかしい
            if(selfUnit === unit){
               continue; 
            }
            if(!this._alignmentUnitAppendCheck(mainData,unit,targetUnit,selfUnit)){
                continue;
            } 
            result.push(Ryba.AlignmentControl.createAlignmentActionData(unit,false,null));
        }
        return result;
    },
    _alignmentFusionAppendCheck: function(selfUnit, targetUnit, result){
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
        var weapon = AttackChecker.checkCounterattack(targetUnit,child);
        if(!weapon){
            return false;
        }
        //root.log('攻撃可能');
        var childSkillArray = Ryba.AlignmentSkillControl.getCustomSkillArray(child);
        var fusionAlignmentData = Ryba.AlignmentControl.getAlignmentData_Fusion(childSkillArray, weapon);
        var distance = Ryba.AlignmentControl.getUnitDistance(child, targetUnit);
    
        var param = Ryba.AlignmentControl.buildCheckDataParam();
        param.data = fusionAlignmentData;
        param.attakcer = selfUnit;
        param.targetUnit = targetUnit;
        param.unit = child;
        param.distance = distance;
        if(!Ryba.AlignmentControl.checkData(param)){
            return false;
        }
        //root.log('条件クリア');
        result.push(Ryba.AlignmentControl.createAlignmentActionData(child,fusionAlignmentData.isExchange,null));
    },
    _alignmentUnitAppendCheck: function(mainData,unit,targetUnit,selfUnit){
        //前提条件（そもそも攻撃できるかどうか）
        var weapon = AttackChecker.checkCounterattack(targetUnit,unit);
        if(!weapon){
            return false;
        }
        
        //射程距離計測
        var distance = Ryba.AlignmentControl.getUnitDistance(unit, targetUnit);
    
        //まずメインデータのチェック
        var param = Ryba.AlignmentControl.buildCheckDataParam();
        param.data = mainData;
        param.attakcer = selfUnit;
        param.targetUnit = targetUnit;
        param.unit = unit;
        param.distance = distance;
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
        param.distance = distance;
        if(!Ryba.AlignmentControl.checkData(param)){
            return false;
        }
    
        return true;
    },
    nextAlignment: function(pearent,targetUnit,alignmentList) {
        var result = this._nextAlignment(targetUnit,alignmentList);
        if(result !== null){
            pearent._preAttack = result.preAttack;
            pearent._lastAttackParam = result.attackParam;
            return true;
        }
        return false;
    },
    _nextAlignment: function(targetUnit,alignmentList){
        if(alignmentList.length < 1){
            return null;
        }
        //死亡している場合追撃する意味はない
        if( !targetUnit || targetUnit.getHp() < 1){
            return null;
        }
        var data = alignmentList[0];
        alignmentList.shift();
        var attackParam = StructureBuilder.buildAttackParam();
        attackParam.unit = data.unit;
        attackParam.targetUnit = targetUnit
        attackParam.attackStartType = AttackStartType.NORMAL;
    
        //表示用スキルを登録
        Ryba.AlignmentControl.registerShowSkill(data.unit,data.skill);
    
        //絶対に反撃されないステートのIDは210
        Ryba.AlignmentControl.beforeAttackState(attackParam.unit);
    
        var preAttack = createObject(PreAttack);
        var result = preAttack.enterPreAttackCycle(attackParam);
        
        if (result === EnterResult.NOTENTER) {
            Ryba.AlignmentControl.removeShowSkill(data.unit);
            return this._nextAlignment(targetUnit,alignmentList);
        }
        root.log(attackParam === null);
        root.log('attackParam')
        return {
            attackParam:attackParam,
            preAttack:preAttack
        };
    }
};

AttackCommandMode.AutoAttack = 1001;
AttackCommandMode.AutoAttackSelect = 1002;
UnitCommand.Attack._skillArray = null;
UnitCommand.Attack._alignmentList = null;
//新規関数
UnitCommand.Attack.setSkillArray = function(array){
    this._skillArray = array;
};
UnitCommand.Attack._lastAttackParam = null;
UnitCommand.Attack._moveAutoAttack = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        var targetUnit = this._posSelector.getSelectorTarget(false);
        if(Ryba.AlignmentActionControl.nextAlignment(this,targetUnit,this._alignmentList)){
            return MoveResult.CONTINUE;
        }
        if(this._lastAttackParam){
            Ryba.AlignmentControl.removeShowSkill(this._lastAttackParam.unit);
            this._lastAttackParam = null;
        }
        this.endCommandAction();
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
    }else if (mode === AttackCommandMode.AutoAttack) {
        result = this._moveAutoAttack();
    }
    // else if (mode === AttackCommandMode.AutoAttackSelect) {
    //     result = this._moveAutoAttackSelect();
    // }
    
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
    }else if(mode === AttackCommandMode.AutoAttack){
        this._preAttack.drawPreAttackCycle();
    }
    // else if (mode === AttackCommandMode.AutoAttackSelect) {
    //     result = this._moveAutoAttackSelect();
    // }
};
UnitCommand.Attack._moveResult = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        var selfUnit = this.getCommandTarget();
        var targetUnit = this._posSelector.getSelectorTarget(false);
        var result = Ryba.AlignmentActionControl.moveAlignmentAttack(this,selfUnit,targetUnit,this._skillArray,PlayerList.getSortieList());
        if(result === MoveResult.CONTINUE){
            this.changeCycleMode(AttackCommandMode.AutoAttack);
            return MoveResult.CONTINUE;
        }
        this.endCommandAction();
        return MoveResult.END;
    }
    return MoveResult.CONTINUE;
};
AttackChecker.checkCounterattack = function(unit, targetUnit) {
    if(StateControl.isBadStateOption(targetUnit, BadStateOption.NOACTION)){
        return null;
    }
    var weapon = ItemControl.getEquippedWeapon(targetUnit);
    if(weapon === null){
        return null;
    }
    if(AttackChecker.isCounterattackPos(unit, targetUnit, unit.getMapX(), unit.getMapY())){
        return weapon;
    }
    return null;
};
//敵側-------
WeaponAutoActionMode.AutoAttack = 1001;
WeaponAutoAction.moveAutoAction = function() {
    var result = MoveResult.CONTINUE;
    var mode = this.getCycleMode();
    
    if (mode === WeaponAutoActionMode.CURSORSHOW) {
        result = this._moveCursorShow();
    }
    else if (mode === WeaponAutoActionMode.PREATTACK) {
        result = this._movePreAttack();
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
    }else if(mode === AttackCommandMode.AutoAttack){
        this._preAttack.drawPreAttackCycle();
    }
};

WeaponAutoAction._movePreAttack = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        
        var result = Ryba.AlignmentActionControl.moveAlignmentAttack(this,this._unit,this._targetUnit,this._skillArray,EnemyList.getAliveList());
        if(result === MoveResult.CONTINUE){
            this.changeCycleMode(AttackCommandMode.AutoAttack);
            return MoveResult.CONTINUE;
        }
        return MoveResult.END;
    }
    
    return MoveResult.CONTINUE;
};

WeaponAutoAction._moveAutoAttack = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        if(Ryba.AlignmentActionControl.nextAlignment(this,this._targetUnit,this._alignmentList)){
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
WeaponAutoAction.isSkipAllowed = function() {
    var mode = this.getCycleMode();
    
    if (mode === WeaponAutoActionMode.PREATTACK || mode === AttackCommandMode.AutoAttack) {
        return false;
    }

    return true;
};
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
        this._skillArray = Ryba.AlignmentSkillControl.getCustomSkillArray(unit);
    };
    //-----------
})();
