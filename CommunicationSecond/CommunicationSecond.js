/*--------------------------------------------------------------------------------------------------
■指定したブックマークのイベントを強引にコミュニティ（情報収集）として呼び出すスクリプト
　「情報収集2」の別コマンドとして追加する事ができる

■作成者
熱帯魚

■対応バージョン
SRPG Stduio Version:1.259
--------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------------------------------
■設定項目
--------------------------------------------------------------------------------------------------*/

//コマンド名
var CommunicationSecondTitle = '情報収集2';
//表示するブックマークイベントのID
var CommunicationSecondIdList = [0,1,2];

//------------------------------------------------------------
//executedMarkの判定を差し替えるためにentryのデータを変更する
//------------------------------------------------------------
var Nettaigyo = Nettaigyo || {};

//このリストにブックマークイベントのIDを追加すると
//元の「情報収集」の下にイベント項目が追加できる
CommunicationScreen._bookmarkEventIdList = [];
CommunicationScreen._getBookmarkEventIdList = function(){
    return this._bookmarkEventIdList;
};
CommunicationScreen._addBookmarkEvent = function(eventArray, eventList,numAry){
    
    var i, count, number, data, resultArray;
    resultArray = [];

    //まず条件をチェックする
    count = eventArray.length;
    for (i = 0; i < count; i++) {
        data = eventArray[i];
        if (this._isEvent(data)) {
            resultArray.push(this._createEntryData(data,false,data.getExecutedMark()));
        }
    }

    //次にブックマーク入れる
    count = numAry.length;
    for (i = count-1; 0 <= i; i--) {
        number = numAry[i];
        data = eventList.getDataFromId(number);
        if (this._isEvent(data)) {
            resultArray.push(this._createEntryData(data,false,EventExecutedType.FREE));
        }
    }
    
    return resultArray;
};
CommunicationScreen._createEntryData = function(event,isLock,executedMark){
    return {
        event:event,
        isLock:false,
        executedMark:executedMark
    };
};
CommunicationScreen._getBaseEnvet = function(){
    return EventCommonArray.createArray(root.getCurrentSession().getCommunicationEventList(), EventType.COMMUNICATION);
};
CommunicationScreen._rebuildCommunicationEventList = function(){
    var i, count, data, entry;
    var arr = this._getBaseEnvet();
    arr = this._addBookmarkEvent(arr,root.getBaseData().getBookmarkEventList(), this._getBookmarkEventIdList());
    var indexPrev = this._scrollbar.getIndex();
    var countPrev = this._scrollbar.getObjectCount();
    var xScrollPrev = this._scrollbar.getScrollXValue();
    var yScrollPrev = this._scrollbar.getScrollYValue();
    
    this._scrollbar.resetScrollData();
    
    // イベントの実行後に、別イベントが表示/非表示になる可能性があるため再構築する
    count = arr.length;
    for (i = 0; i < count; i++) {
        this._scrollbar.objectSet(arr[i]);
    }
    
    this._scrollbar.objectSetEnd();
    
    count = this._scrollbar.getObjectCount();
    if (count === countPrev) {
        // スクロール位置を戻す
        this._scrollbar.setScrollXValue(xScrollPrev);
        this._scrollbar.setScrollYValue(yScrollPrev);
    }
    else if (indexPrev >= count) {
        this._scrollbar.setIndex(0);
    }
    else {
        this._scrollbar.setIndex(indexPrev);
    }
};

//------------------------------------------------------------
//getCommunicationEventTypeがnullの場合、typeをINFORMATIONとする
//------------------------------------------------------------
CommunicationScreen.getCommunicationEventType = function(object) {
    var info;
    
    if (root.getBaseScene() === SceneType.REST) {
        info = object.event.getRestEventInfo();
    }
    else {
        info = object.event.getCommunicationEventInfo();
    }

    if(info == null){
        return CommunicationEventType.INFORMATION;
    }
    
    return info.getCommunicationEventType();
};

//------------------------------------------------------------
//executedMarkの判定を差し替える
//------------------------------------------------------------
CommunicationScrollbar._isSelectable = function(object) {
    if (object === null || object.event === null) {
        return false;
    }
    
    // イベントが実行されていなければ、選択可能とみなす
    return object.executedMark === EventExecutedType.FREE;
};
CommunicationScreen._startEvent = function() {
    var type, entry;
    var isExecuteMark = true;
    
    entry = this._scrollbar.getObject();
    if (entry === null) {
        return;
    }
    
    // 既にイベントが実行されている場合は続行しない
    if (entry.executedMark === EventExecutedType.EXECUTED) {
        return;
    }
    
    // イベントが終了した後に、イベント名を灰色にする目的
    entry.isLock = true;
    
    type = this.getCommunicationEventType(entry);
    if (type === CommunicationEventType.INFORMATION) {
        // 情報タイプは、実行済みを記録しないようにする
        isExecuteMark = false;
    }
    this._capsuleEvent.enterCapsuleEvent(entry.event, isExecuteMark);
    
    this.changeCycleMode(CommunicationMode.EVENT);
};

//---------------------------------------------------------
//コマンドを追加する
//---------------------------------------------------------

Nettaigyo.CommunicationScreenSecond = defineObject(CommunicationScreen, 
{
    _bookmarkEventIdList:CommunicationSecondIdList,
    _getBaseEnvet: function(){
        return [];
    }
});

SetupCommand.CommunicationSecond = defineObject(BaseListCommand, 
{
    _unitSortieScreen: null,
    
    openCommand: function() {
        var screenParam = this._createScreenParam();
    
        this._unitSortieScreen = createObject(Nettaigyo.CommunicationScreenSecond);
        SceneManager.addScreen(this._unitSortieScreen, screenParam);
    },
    
    moveCommand: function() {
        if (SceneManager.isScreenClosed(this._unitSortieScreen)) {
            return MoveResult.END;
        }
        
        return MoveResult.CONTINUE;
    },
    
    _createScreenParam: function() {
        var screenParam = {};
        
        return screenParam;
    },

    getCommandName: function() {
        return CommunicationSecondTitle;
    },

    isCommandDisplayable: function() {
        return true;
    }
}
);

//---------------------------------------------------------
//「情報収集３」の追加例
// 3以降は
// Nettaigyo.CommunicationScreenThird
// SetupCommand.CommunicationThird
// 上記二つのコピペし、必要箇所を設定しなおす
// _bookmarkEventIdListの配列に必要なイベントのID番号を
//---------------------------------------------------------

Nettaigyo.CommunicationScreenThird = defineObject(CommunicationScreen, 
{
    _bookmarkEventIdList:[26,25,24],
    _getBaseEnvet: function(){
        return [];
    }
});
    
SetupCommand.CommunicationThird = defineObject(BaseListCommand, 
{
    _unitSortieScreen: null,
    
    openCommand: function() {
        var screenParam = this._createScreenParam();
    
        this._unitSortieScreen = createObject(Nettaigyo.CommunicationScreenThird);
        SceneManager.addScreen(this._unitSortieScreen, screenParam);
    },
    
    moveCommand: function() {
        if (SceneManager.isScreenClosed(this._unitSortieScreen)) {
            return MoveResult.END;
        }
        
        return MoveResult.CONTINUE;
    },
    
    _createScreenParam: function() {
        var screenParam = {};
        
        return screenParam;
    },

    getCommandName: function() {
        return '情報収集3';
    },

    isCommandDisplayable: function() {
        return true;
    }
}
);

//---------------------------------------------------------
//「情報収集３」の追加例
// groupArray.insertObject(SetupCommand.CommunicationThird, index);
// の文を追加する
//---------------------------------------------------------

(function () {

    var aliasSetupCommands = SetupCommand.configureCommands;
    SetupCommand.configureCommands = function(groupArray) {
		aliasSetupCommands.call(this,groupArray);

        var index = groupArray.length - 1;
        if( index > 3){
            index = 3;
        }
        //groupArray.insertObject(SetupCommand.CommunicationThird, index);
		groupArray.insertObject(SetupCommand.CommunicationSecond, index);
	}

    var aliasRestCommands = RestCommand.configureCommands;
    RestCommand.configureCommands = function(groupArray) {
        aliasRestCommands.call(this, groupArray);

        var index = groupArray.length - 1;

        if( index > 2){
            index = 2;
        }

        //groupArray.insertObject(SetupCommand.CommunicationThird, index);
        groupArray.insertObject(SetupCommand.CommunicationSecond, index);
        
    };
})();