/*--------------------------------------------------------------------------
  
Make the official event jumping feature available for the opening and ending events as well.

How to use

jumpOpeningEvent(id)
jumpEndingEvent(id)

update
20/08/17@create
Version
@SRPG Studio Version:1.216
URL
https://github.com/RYBA549/RYBA_SrpgStudio
MIT License Copyright (c) 2020 RYBA(熱帯魚)
  
--------------------------------------------------------------------------*/
RYBA = RYBA || {};

RYBA.EventControl = {
  eventRegister:function(list,id){
    var i, count, event;
    count = list.getCount();
    for (i = 0; i < count; i++) {
      event = list.getData(i);
      if (event.getId() === id) {
        event.setExecutedMark(EventExecutedType.FREE);
        EventCommandManager._activeEventChecker._eventIndex = i;
        break;
      }
    }
  }
};


function jumpOpeningEvent(id)
{
	
	var session = root.getCurrentSession();
	
	if (session === null) {
		return;
  }

	RYBA.EventControl.eventRegister(session.getOpeningEventList(),id);
}

function jumpEndingEvent(id)
{
	
	var session = root.getCurrentSession();
	
	if (session === null) {
		return;
  }

	RYBA.EventControl.eventRegister(session.getEndingEventList(),id);
}