/*-----------------------------------------------------------------------------------------------
    
　某ゲームの「追撃（挟み撃ち）」みたいな事ができるようになります。
　（対局の位置にいる味方が攻撃してくれるスキル）

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
//参照を切るのが面倒なのでSkillControlのほぼコピペ
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
	}
};
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

AttackCommandMode.AutoAttack = 1001;
AttackCommandMode.AutoAttackSelect = 1002;
UnitCommand.Attack._skillArray = null;
UnitCommand.Attack._alignmentList = null;
//新規関数
UnitCommand.Attack.setSkillArray = function(array){
    this._skillArray = array;
};
UnitCommand.Attack._drawAutoAttack = function() {
    //戦闘予測画面いらない
    // if (this._preAttack.isPosMenuDraw()) {
    //     // 下記コードがなければ、簡易戦闘で一瞬ちらつく
    //     this._posSelector.drawPosMenu();
    // }
    
    this._preAttack.drawPreAttackCycle();
};
UnitCommand.Attack._checkAlignmentAttack = function(){
    if( this._skillArray === null ){
        return false;
    }
    var selfUnit = this.getCommandTarget();
    var targetUnit = this._posSelector.getSelectorTarget(false);
    //死亡している場合追撃する意味はない
    if( !targetUnit || targetUnit.getHp() < 1 || selfUnit.getHp() < 1){
        return false;
    }
    this._alignmentList = this._createAlignmentList(targetUnit);

    return this._nextAlignment();
};
UnitCommand.Attack._createAlignmentList = function(targetUnit){
    var result = [];
    
    var mainData = Ryba.AlignmentControl.getAlignmentData_Main(this._skillArray);
    var selfUnit = this.getCommandTarget();
    
    //まずフュージョンチェック
    this._alignmentFusionAppendCheck(selfUnit,targetUnit,result);

    //次の盤面の味方をチェック
    var i, unit;
    var list = PlayerList.getSortieList();
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
};
UnitCommand.Attack._alignmentFusionAppendCheck = function(selfUnit, targetUnit, result){
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
};
UnitCommand.Attack._alignmentUnitAppendCheck = function(mainData,unit,targetUnit,selfUnit){
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
};
UnitCommand.Attack._lastAttackParam = null;
UnitCommand.Attack._nextAlignment = function(){
    this._lastAttackParam = null;
    if(this._alignmentList.length < 1){
        return false;
    }
    var targetUnit = this._posSelector.getSelectorTarget(false);
    //死亡している場合追撃する意味はない
    if( !targetUnit || targetUnit.getHp() < 1){
        return false;
    }
    var data = this._alignmentList[0];
    this._alignmentList.shift();
    var attackParam = StructureBuilder.buildAttackParam();
    attackParam.unit = data.unit;
    attackParam.targetUnit = targetUnit
    attackParam.attackStartType = AttackStartType.NORMAL;

    //表示用スキルを登録
    Ryba.AlignmentControl.registerShowSkill(data.unit,data.skill);

    //絶対に反撃されないステートのIDは210
    Ryba.AlignmentControl.beforeAttackState(attackParam.unit);

    this._preAttack = createObject(PreAttack);
    var result = this._preAttack.enterPreAttackCycle(attackParam);
    
    if (result === EnterResult.NOTENTER) {
        Ryba.AlignmentControl.removeShowSkill(data.unit);
        return this._nextAlignment();
    }

    this._lastAttackParam = attackParam;

    return true;
};
UnitCommand.Attack._moveAutoAttack = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        if(this._nextAlignment()){
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
        this._drawAutoAttack();
    }
    // else if (mode === AttackCommandMode.AutoAttackSelect) {
    //     result = this._moveAutoAttackSelect();
    // }
};
UnitCommand.Attack._moveResult = function() {
    if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
        if(this._checkAlignmentAttack()){
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
})();
