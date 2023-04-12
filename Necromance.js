/*-----------------------------------------------------------------------------------------------
    
　自分から攻撃して敵を倒すと複製体を生み出して自軍として使役できる
　「ネクロマンス」スキルを作成します。
　使役できるのはそのマップ中の間だけです。

　複製体はゲストユニットとして加入します。
　（下記の設定しないと持ち物が交換できてしまうので注意）
　「データ設定」→「コンフィグ」→「ゲームオプション」で
　「ゲストユニットのアイテム増減を有効にする」のチェックを外すと
　ゲストとアイテム交換ができなくなります。

■事前準備（必須）

　「データ設定」→「コンフィグ」→「ゲームオプション」で
　「ユニットの選択時にブックマークタブを表示する」のチェックを入れないと使用できません。

■設定項目
カスタムスキルのカスタムキーワードに「Ryba_Necromance」と記載
発動時アニメの「マップアニメ」で表示するアニメを決めることが可能です。
発動率を指定する事ができます。
有効相手を指定する事ができます。（例：悪魔系の敵や、重要度モブのみにしたいなどの設定が可能）

■カスパラ(カスパラは全て省略することも可能です)
{
    easyAnimeId:105,
    bookMarkId:-1,
    unitWait:true,
    createUnitCount:-1,
    createUnitBitFlag:CreateUnitBitFlag.All
}

easyAnimeId は発動時のアニメをＩＤで指定できます。負の値で指定するとランタイム以外のアニメが対象になります。
（発動時アニメの「マップアニメ」の設定が優先されます）
どっちも指定しないとアニメはランタイムの105となります。

bookMarkIdはベースとなるブックマークユニットを指定できます。
指定しないとRyba.NecromanceControl.BookMarkIdと同じ値になります。

unitWaitは出したユニットを待機にするかどうかです
指定しないとtrue（待機状態で出現）となります。

createUnitCountはネクロマンスしたユニットが同時に何体存在できるかです。
ネクロマンスしたら、この数値を超えてしまう場合は発動できなくなります。
(発動できる回数じゃないのでネクロマンスした敵が死亡するとまた出せるようになります)
省略すると-1となり、-1だと無限に出せます。
(一応0は指定できますがその場合、意味のないスキルとなります)

createUnitBitFlagは倒した敵の情報をどの程度上書きするかです。
省略するとCreateUnitBitFlag.Allとなります。
ほとんどがネクロマンスする相手の情報に下記変わってしまいますが
スキルだけは上書きされないで追加される形になります。
CreateUnitBitFlag.Noneを指定するとブックマークユニットそのものが出現するようにもできます。

■カスパラ例(複雑そうなの)

アニメIDは101
ブックマークIDは3を使用
同時に２体まで
敵のクラスと名前だけコピーして後はブックマークユニットの値を参照する
{
    easyAnimeId:101,
    bookMarkId:3,
    createUnitCount:2,
    createUnitBitFlag: CreateUnitBitFlag.Class | CreateUnitBitFlag.Name
}

敵のスキル以外をコピーする
{
    createUnitBitFlag: CreateUnitBitFlag.All ^ CreateUnitBitFlag.Skill
}

敵を複製せず、ブックマークユニットそのものを出す
{
    createUnitBitFlag: CreateUnitBitFlag.None
}

■対応バージョン
　SRPG Studio Version:1.280

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
//生成ビット
var CreateUnitBitFlag = {
    None:0,
    Level:0x01,
    Item:0x02,
    Class:0x04,
    Face:0x08,
    Skill:0x10,
    Name:0x20,
    Param:0x40,

    //Allは全部のフラグを持つ
    All:0xFF
};

Ryba.NecromanceControl = {
    //ベースとなるブックマークユニットのID（スキルのカスパラにIDを指定しない場合に有効になります）
    BookMarkId:0,
    //カスタムスキルのキーワード
    SkillKeyword:'Ryba_Necromance',

    necromanceTargetRegister:function(unit,targetUnit){
        unit.custom.necromanceUnit = targetUnit;
    },
    getNecromanceTarget:function(unit){
        var result = unit.custom.necromanceUnit;
        if( result == undefined){
            return null;
        }
        return result;
    },
    clearNecromanceTarget:function(unit){
        if(unit === null){
            return;
        }
        delete unit.custom.necromanceUnit;
    },
    getNecroUnitId:function(skill){
        var id = skill.custom.bookMarkId;
        if(typeof id === 'number'){
            return id;
        }
        return -1;
    },
    getSkillMapCount:function(skill){
        var createUnitCount = -1;
        if(typeof skill.custom.createUnitCount === 'number'){
            createUnitCount = skill.custom.createUnitCount;
        }
        return createUnitCount;
    },
    getCreateUnitBitFlag:function(skill){
        var bitFlag = CreateUnitBitFlag.All;
        if(typeof skill.custom.createUnitBitFlag === 'number'){
            bitFlag = skill.custom.createUnitBitFlag;
        }
        return bitFlag;
    },
    getUnitWait:function(skill){
        var wait = true;
        if(typeof skill.custom.unitWait === 'boolean'){
            wait = skill.custom.unitWait;
        }
        return wait;
    },
    getSkillInfoMapNecroUnitCount:function(skill){
        if(skill.getCustomKeyword() !== this.SkillKeyword){
            return -1;
        }
        return this.getSkillMapCount(skill);
    },
    getMapNecroUnitCount:function(unit){
        var u, summonerId;
		var list = PlayerList.getSortieDefaultList();
		var count = list.getCount();
        var mapCount = 0;
		for (var i = 0; i < count; i++) {
			u = list.getData(i);
            root.log(u.getName())
            if(!u || !u.isGuest()){
                continue;
            }
            if(!u.custom.isNecromance){
                continue;
            }
            summonerId = u.custom.necromanceParentUnitId;
            if(typeof summonerId === 'number'){
                if(summonerId === unit.getId()){
                    mapCount++;
                }
            }
		}
        return mapCount;
    }
};
Ryba.UnitCreateControl = {
    _copyBitFlag:CreateUnitBitFlag.All,
    _bookmark_unitid:524288,
    createNecromance:function(unit,x,y,unitType,bookMarkId,bitFlag){
        this._copyBitFlag = bitFlag;

        var maxhp = 1;
        var bookmarkId = bookMarkId + this._bookmark_unitid;
        var resultUnit = this._baseCreatePhantom(unit,x,y,bookmarkId,unitType,maxhp);
        //ネクロマンスしているユニットはカスパラにフラグを立てておく
        resultUnit.custom.isNecromance = true;
        return resultUnit;
    },
    _baseCreatePhantom:function(unit,x,y,bookmarkId,unitType,maxhp){
        var list = root.getBaseData().getBookmarkUnitList();
        var bookmarkUnit = list.getDataFromId(bookmarkId);
        if(!bookmarkUnit){
            return null;
        }
        return this._baseCreatePhantomToBookmarkUnit(unit,x,y,bookmarkUnit,unitType,maxhp);
    },
    _baseCreatePhantomToBookmarkUnit:function(unit,x,y,bookmarkUnit,unitType,maxhp){
        if(!unit){
            return null;
        }
        if( unitType < 0 || unitType > 2){
            unitType = 0;
        }
        if(!bookmarkUnit){
            return null;
        }
        var newUnit = this.createUnit(bookmarkUnit, x, y, unitType);
        if(!newUnit){
            return null;
        }
        this.unitDataOverride(newUnit,unit,maxhp);
        return newUnit;
    },
    createUnit:function(baseUnit, x, y, unitType){
        var i;
        var listArray = FilterControl.getListArray(FilterControl.getNormalFilter(unitType));
        var listCount = listArray.length;
		
		for (i = 0; i < listCount; i++) {
            if (listArray[i].getCount() >= DataConfig.getMaxAppearUnitCount()) {
                return null;
            }
        }
        var pos = {x:x,y:y};
        if (PosChecker.getUnitFromPos(x,y) !== null) {
            pos = PosChecker.getNearbyPosFromSpecificPos(x, y, baseUnit, null);
        }
        if (!pos) {
            return null;
        }

        var unit = root.getObjectGenerator().generateUnitFromBookmarkUnit(baseUnit,unitType);
        if (unit !== null) {
            unit.setMapX(pos.x);
            unit.setMapY(pos.y);
            UnitProvider.recoveryPrepareUnit(unit);
        }

        return unit;

    },
    unitDataOverride:function(unit, baseUnit, maxhp){
       
        if(this._copyBitFlag & CreateUnitBitFlag.Item){
            this.itemOverride(unit,baseUnit);
        }
        if(this._copyBitFlag & CreateUnitBitFlag.Class){
            this.classOverride(unit,baseUnit);
        }
        if(this._copyBitFlag & CreateUnitBitFlag.Face){
            this.setFace(unit,baseUnit);
        }
        if(this._copyBitFlag & CreateUnitBitFlag.Skill){
            this.skillOverride(unit,baseUnit);
        }
        if(this._copyBitFlag & CreateUnitBitFlag.Name){
            unit.setName(baseUnit.getName());
        }
        if(this._copyBitFlag & CreateUnitBitFlag.Level){
            this.setLevel(unit,baseUnit);
        }


        if(this._copyBitFlag & CreateUnitBitFlag.Param){
            var index = ParamGroup.getParameterIndexFromType(ParamType.MHP);
            var n;
            if(maxhp > 0){
                n = maxhp;
                ParamGroup.setUnitValue(unit, index, maxhp);
            }else{
                n = ParamBonus.getMhp(unit);
            }
    
            unit.setHp(n);
        }
        
    },

    itemOverride:function(unit, baseUnit){
        var count = DataConfig.getMaxUnitItemCount();
        var item,baseItem;
        for (var i = 0; i < count; i++) {
            UnitItemControl.cutItem(unit,i);
            baseItem = UnitItemControl.getItem(baseUnit, i);
            if(baseItem){
                item = root.duplicateItem(baseItem);
                unit.setItem(i, item);
            }
        }
        UnitItemControl.arrangeItem(unit);
    },

    setLevel: function(unit, baseUnit) {
        var defaultParamValue;
        var paramTypeIndex = 0;
        var count = ParamGroup.getParameterCount();
        var weapon = null;
        var n = 0;
        
        for (var i = 0; i < count; i++) {
            defaultParamValue = ParamGroup.getUnitValue(baseUnit,i);
            ParamGroup.setUnitValue(unit,i,defaultParamValue);
        }
        unit.setLv(baseUnit.getLv());
    },

    setFace:function(unit,baseUnit){
        unit.setFaceResourceHandle(baseUnit.getFaceResourceHandle());
    },

    classOverride:function(unit, baseUnit){
        Miscellaneous.changeClass(unit, baseUnit.getClass());
    },

    skillOverride:function(unit, baseUnit){
        var i, skill;
        var skillList = baseUnit.getSkillReferenceList();
        var skillCount = skillList.getTypeCount();

        for (i = 0; i < skillCount; i++) {
            skill = skillList.getTypeData(i);
            SkillChecker.arrangeSkill(unit, skill, IncreaseType.INCREASE)
        }
    }
};

var NecromanceFlowMode = {
    SkillName: 0,
    Necromance: 1
};

Ryba.NecromanceFlowEntry = defineObject(BaseFlowEntry,
{
    _flowActive:false,
    _activeUnit:null,
    _necromanceUnit: null,
    _skill: null,
    _playerTurn: null,
    _anime: null,
    _dynamicAnime: null,
    _counter: null,

    enterFlowEntry: function(playerTurn) {
        this._prepareMemberData(playerTurn);
        return this._completeMemberData(playerTurn);
    },

    moveFlowEntry: function() {
        var mode = this.getCycleMode();
        var result = MoveResult.END;

        if (mode === NecromanceFlowMode.Before) {
            result = this._moveBefore();
        }
        else if (mode === NecromanceFlowMode.Necromance) {
            result = this._moveNecromance();
        }
        return result;
    },

    drawFlowEntry: function() {
        var mode = this.getCycleMode();

        if (mode === NecromanceFlowMode.Before) {
            result = this._drawBefore();
        }else if(mode === NecromanceFlowMode.Necromance) {
            result = this._drawAnime();
        }
    },

    _moveBefore: function() {
        if (this._counter.moveCycleCounter() !== MoveResult.CONTINUE) {
            this._mainAction();
            this.changeCycleMode(NecromanceFlowMode.Necromance);
        }
        return MoveResult.CONTINUE;
    },

    _drawBefore: function() {
        var x, y;
        var textui = root.queryTextUI('itemuse_title');
        var color = textui.getColor();
        var font = textui.getFont();
        var pic = textui.getUIImage();
        var text = this._skill.getName();
        var width = (TitleRenderer.getTitlePartsCount(text, font) + 2) * TitleRenderer.getTitlePartsWidth();
    
        x = LayoutControl.getUnitCenterX(this._necromanceUnit, width, 0);
        y = LayoutControl.getUnitBaseY(this._necromanceUnit, TitleRenderer.getTitlePartsHeight()) - 20;
    
        TextRenderer.drawTitleText(x, y, text, color, font, TextFormat.CENTER, pic);
    },

    _moveNecromance: function() {
        if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
            return MoveResult.END;
        }
        return MoveResult.CONTINUE;
    },

    _drawAnime: function() {
        this._dynamicAnime.drawDynamicAnime();
    },

    _prepareMemberData: function(playerTurn) {
        this._playerTurn = playerTurn;
        this._flowActive = this._setUnitData();
        //アニメの設定
        this._prepareSetAnime(this._skill);
        this._dynamicAnime = createObject(DynamicAnime);
        this._counter = createObject(CycleCounter);
    },

    _prepareSetAnime:function(skill){
        if(skill){
            this._anime = skill.getEasyAnime();
            if ( this._anime === null) {
                var id = skill.custom.easyAnimeId;
                if(typeof id !== 'number'){
                    id = 105;
                }
                this._anime = this.getAnimeToId(id);
            }
        }
    },

    getAnimeToId: function(id){
		//trueだとランタイム、falseだとオリジナル参照のためこうする
		var runtime = true;
		if(id < 0){
			runtime = false;
			id = id * -1;
		}
		var list = root.getBaseData().getEffectAnimationList(runtime);
		var anime = list.getDataFromId(id);
		return anime;
	},

    _completeMemberData: function(playerTurn) {
        if (!this._flowActive) {
            this._endAction();
            return EnterResult.NOTENTER;
        }
        this._startAction();
        this._endAction();
        return EnterResult.OK;
    },

    _setUnitData: function(){
        this._necromanceUnit = null;
        this._activeUnit = this._playerTurn.getTurnTargetUnit();
        
        var passiveUnit = Ryba.NecromanceControl.getNecromanceTarget(this._activeUnit);
        if(!passiveUnit){
            return false;
        }
        if(passiveUnit.getAliveState() === AliveType.ALIVE ){
            //そもそも生きているのでネクロマンスできない
            return false;
        }
        //root.log('passiveUnit');
        this._unitPos = {x:passiveUnit.getMapX(),y:passiveUnit.getMapY()};
        var posUnit = PosChecker.getUnitFromPos(this._unitPos.x, this._unitPos.y);
        if( posUnit !== null ){
            //ユニットが存在しているためネクロマンス不可
            return false;
        }
        //root.log('getUnitFromPos');
        this._skill = SkillControl.getPossessionCustomSkill(this._activeUnit, Ryba.NecromanceControl.SkillKeyword);
        if(!this._skill){
            return false;
        }

        //存在数の確認
        var mapCount = Ryba.NecromanceControl.getSkillMapCount(this._skill);
        if(mapCount > -1){
            if( mapCount <= Ryba.NecromanceControl.getMapNecroUnitCount(this._activeUnit) ){
                return false;
            }
        }

        //有効相手じゃないとキャンセル
        if(!this._skill.getTargetAggregation().isCondition(passiveUnit)){
            return false;
        }

        //発動率チェック
        if( !Probability.getInvocationProbabilityFromSkill(this._activeUnit, this._skill) ){
            return false;
        }

        //root.log('_skill');
        var necroId = Ryba.NecromanceControl.getNecroUnitId(this._skill);
        if(necroId < 0){
            necroId = Ryba.NecromanceControl.BookMarkId;
        }

        this._necromanceUnit = Ryba.UnitCreateControl.createNecromance(
            passiveUnit,this._unitPos.x,this._unitPos.y,this._activeUnit.getUnitType(),necroId,
            Ryba.NecromanceControl.getCreateUnitBitFlag(this._skill)
        );

        this._necromanceUnit.custom.necromanceParentUnitId = this._activeUnit.getId();
        
        if(this._necromanceUnit){
            this._necromanceUnit.setInvisible(true);
        }
        return true;
    },

    _startAction:function(){
        this._counter.setCounterInfo(36);
        this.changeCycleMode(NecromanceFlowMode.Before);
        MediaControl.soundDirect('skillinvocation');
    },
    
    //効果処理
    _mainAction:function(){
        this._necromanceUnit.setAliveState(AliveType.ALIVE);
        this._necromanceUnit.setInvisible(false);
        this._necromanceUnit.setWait(Ryba.NecromanceControl.getUnitWait(this._skill));

        var x = LayoutControl.getPixelX(this._unitPos.x);
        var y = LayoutControl.getPixelY(this._unitPos.y);
        var pos = LayoutControl.getMapAnimationPos(x, y, this._anime);

        this._dynamicAnime.startDynamicAnime(this._anime, pos.x, pos.y);
    },

    //終了時の処理
    _endAction: function(){
        Ryba.NecromanceControl.clearNecromanceTarget(this._activeUnit);
    }
}
);


(function() {
    var alias1 = DamageControl.checkHp;
	DamageControl.checkHp = function(active, passive) {
		alias1.call(this,active,passive);
		//倒した場合
		if( passive.getAliveState() === AliveType.DEATH 
			|| passive.getAliveState() === AliveType.INJURY ){
                Ryba.NecromanceControl.necromanceTargetRegister(active,passive);
		}
	}
    //味方
	var alias2 = MapSequenceCommand._pushFlowEntries;
	MapSequenceCommand._pushFlowEntries = function(straightFlow) {
		alias2.call( this, straightFlow );
        straightFlow.pushFlowEntry(Ryba.NecromanceFlowEntry);
	};
	//敵
	var alias3 = WaitAutoAction._pushFlowEntries;
	WaitAutoAction._pushFlowEntries = function(straightFlow) {
		alias3.call(this,straightFlow );
		straightFlow.pushFlowEntry(Ryba.NecromanceFlowEntry);
	};
    //スキル情報
    var aliasSkillInfoWindow_getWindowHeight = SkillInfoWindow.getWindowHeight;
	SkillInfoWindow.getWindowHeight = function() {
		var count = 0;
		var y = aliasSkillInfoWindow_getWindowHeight.call(this);

		if (this._skill === null) {
			return y;
		}

        var mapCount = Ryba.NecromanceControl.getSkillInfoMapNecroUnitCount(this._skill);
		if (mapCount > -1) {
			count += 1;
		}
		
		return y + (count * ItemInfoRenderer.getSpaceY());
	}
    var alias4 = SkillInfoWindow.drawWindowContent;
	SkillInfoWindow.drawWindowContent = function(x, y) {
		var text, skillText, count;
		var length = this._getTextLength();
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (this._skill === null) {
			return;
		}

        alias4.call(this,x,y);

		y += aliasSkillInfoWindow_getWindowHeight.call(this) - ItemInfoRenderer.getSpaceY();

        var mapCount = Ryba.NecromanceControl.getSkillInfoMapNecroUnitCount(this._skill);
		if (mapCount > -1) {
			TextRenderer.drawKeywordText(x, y, '同時に' + mapCount + '体まで', length, ColorValue.KEYWORD, font);
		}
	};
})();