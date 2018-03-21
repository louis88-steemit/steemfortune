var teilnehmerliste = [];

/* neuer Teilnehmer Konstruktor*/
function neuerTeilnehmer(name, lose, pburl) {
	var teilnehmer = {};
    if (lose !== undefined) {
    	teilnehmer["lose"] = lose;
    }
    if (pburl !== undefined) {
    	teilnehmer["pburl"] = pburl;
    }
  	if (name !== undefined) {
    	teilnehmer["name"] = name;
    }
    return teilnehmer;
}

function fuegeTeilnehmerlisteHinzu(teilnehmer) {
	var alreadyInList = false;
    for (var i=0; i < teilnehmerliste.length; i++) {
        if (teilnehmerliste[i].name === teilnehmer.name) {
            alreadyInList = true;
            break;
        }
    }
    if (!alreadyInList) {
    	teilnehmerliste.push(teilnehmer);
    } else {
        if (window.location.href.indexOf("/en/") == -1) {
            // German notification error
            placeNotification("Fehler!", "<p>Teilnehmer " + teilnehmer.name + " bereits in Liste vorhanden!</p>");
        } else {
            placeNotification("Error!", "<p>Participant " + teilnehmer.name + " is already in the participants list!</p>");
        }
    }
}

// steemian hinzufuegen
var knopf = document.getElementById("knopf");
knopf.addEventListener("click", function(){
	// feld holen
    var eingabefeld = document.getElementById("teilnehmer");
    var wert = eingabefeld.value;
    // feld leeren
    eingabefeld.value = "";
    // teilnehmer hinzufuegen
    if (wert != undefined && wert.length > 0) {
        var neu = neuerTeilnehmer(wert);
        fuegeTeilnehmerlisteHinzu(neu);
    }
    // liste darstellen
    stelleListedar();
});

var loeschenknopf = document.getElementById("loeschen");
loeschenknopf.addEventListener("click", function(){
    listeLeeren();
});

function listeLeeren() {
    teilnehmerliste = [];
    sichtbareListeLeeren();
}

function sichtbareListeLeeren () {
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    while (guiTeilnehmerliste.firstChild) {
        guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
    }
}

function loescheEintrag (index) {
	teilnehmerliste.splice(index, 1);
    stelleListedar();
}

function stelleListedar() {
	 // ul liste holen
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    // ul liste leeren
    while (guiTeilnehmerliste.firstChild) {
        guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
  	}
    // ul liste f�llen
    for (var i=0; i < teilnehmerliste.length; i++) {
  		var li = document.createElement("li");
  		var textKnoten = document.createTextNode(teilnehmerliste[i].name);
  	 	li.appendChild(textKnoten);
        // remove x an li h�ngen
        var span = document.createElement("span");
        var txt = document.createTextNode("x");
        span.className = "delete";
        span.appendChild(txt);
        li.appendChild(span);
        // li mit data index ausstatten
        li.setAttribute('data-array-index', i);
        // li in gui platzieren
        guiTeilnehmerliste.appendChild(li);
  	}
    
    // deletes funktion anh�ngen
    var deletes = document.getElementsByClassName("delete");
  	for (var j = 0; j < deletes .length; j++) {
    	    deletes [j].onclick = function() {
    	    var eintrag = this.parentElement;  // auf das LI zugreifen
    	    var referenz = eintrag.getAttribute('data-array-index');
    	    loescheEintrag(referenz);
    	};
    }
}

/* Gewinner ermitteln  */
var ermittelnKnopf = document.getElementById("ermitteln");
ermittelnKnopf.addEventListener("click", function(){
    var anzahlGewinner = document.getElementById("anzahlGewinner");
    var wert = anzahlGewinner.value;
    var gewinnerString = "";
    var lostopf = generiereLostopf();
	for (var i = 0; i < wert; i++) {
	    var gewinner = giveRandomItem(lostopf);
	    if (i == 0) {
	        gewinnerString += gewinner.name;
	    } else {
	        gewinnerString += "<br>" + gewinner.name;
	    }
	}
	if (window.location.href.indexOf("/en/") == -1) {
	    // German notification 
	    if (wert == 1) {
	        placeNotification("Gl&uuml;ckwunsch!", "<p>Der Gewinner ist: " + gewinnerString + "</p>");
	    } else {
	        placeNotification("Gl&uuml;ckwunsch!", "<p>Die Gewinner sind: " + gewinnerString + "</p>");
	    }
	} else {
	    if (wert == 1) {
	        placeNotification("Congrantulations!", "<p>The winner is " + gewinnerString + " !</p>");
	    } else {
	        placeNotification("Congrantulations!", "<p>The winners are " + gewinnerString + " !</p>");
	    }
	}
});

// Returns a random item from a given array
function giveRandomItem (array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Generates the lottery pot, based on the amount of tickets each participant has
function generiereLostopf() {
    var lostopf = [];
    for (var i=0; i < teilnehmerliste.length; i++) {
  	    var teilnehmer = teilnehmerliste[i];
        var lose = 1;
        if (teilnehmer.lose != undefined) {
            var lose = teilnehmer.lose;
        }
        for (var j = 0; j < lose; j++) {
            lostopf.push(teilnehmer);
        }
    }
    return lostopf;
}


/* Upvoter mit Steemit api abholen */
var upvoterKnopf = document.getElementById("upvoterHinzufuegen");
upvoterKnopf.addEventListener("click", function() {
	var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("upvoterLink").value;
    var author = ulink.match(regex)[1];
    var link = ulink.match(regex)[2];
    steem.api.getActiveVotes(author, link, function(err, result) {
        if (result != undefined) {
          var length = result.length;
		  for(var i= 0; i < length; i++) {
            var neu = neuerTeilnehmer(result[i].voter);
    		fuegeTeilnehmerlisteHinzu(neu);
		  }
          // give user feedback about new added participants
		  addedParticipantsNotification(length);
        }
        stelleListedar();
    });
});

/* Kommentatoren mit Steemit api abholen */
var kommentatorenKnopf = document.getElementById("kommentatorenHinzufuegen");
kommentatorenKnopf.addEventListener("click", function(){
	var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("kommentatorenLink").value;
    var author = ulink.match(regex)[1];
    var link = ulink.match(regex)[2];
    steem.api.getContentReplies(author, link, function(err, result) {
        if (result != undefined) {
            var length = result.length;
		    for (var i= 0; i < length; i++) {
                var neu = neuerTeilnehmer(result[i].author);
    		    fuegeTeilnehmerlisteHinzu(neu);
		    }
            // give user feedback about new added participants
		    addedParticipantsNotification(length);
        }
        stelleListedar();
    });
});

/* Reestemer mit Steemit api abholen */
var reestemerKnopf = document.getElementById("reestemerHinzufuegen");
reestemerKnopf.addEventListener("click", function () {
    var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("reestemerLink").value;
    var author = ulink.match(regex)[1];
    var link = ulink.match(regex)[2];
    steem.api.getRebloggedBy(author, link, function (err, result) {
        if (result != undefined) {
            var length = result.length;
            for (var i = 0; i < length; i++) {
                // exclude the author from his own post
                if (author != result[i]) {
                    var neu = neuerTeilnehmer(result[i]);
                    fuegeTeilnehmerlisteHinzu(neu);
                } 
            }
            // correct result length if author was within list
            for (var i = 0; i < result.length; i++) {
                if (author == result[i]) {
                    length -= 1;
                }
            }
            // give user feedback about new added participants
            addedParticipantsNotification(length);
        }
        stelleListedar();
    });
});

// Feedback how many new Entries got added
function addedParticipantsNotification(amount) {
    if (window.location.href.indexOf("/en/") == -1) {
        // German notification 
        placeNotification("Hinweis", "<p>Es wurden insgesammt " + amount + " Eintr&auml;ge der Liste hinzugef&uuml;gt!</p>");
    } else {
        placeNotification("Hint", "<p>A total of " + amount + " participants got added to the list!</p>");
    }
}

/* Notification erstellen */
function placeNotification(headline, content) {
    // scroll to top
    window.scrollTo(0,0);
    removeNotifications();
    var notification = document.createElement("div");
    // fill notification content string
    var tempElementString = "";
    tempElementString += "<div id='notification' class='notification'>";
    tempElementString +=    "<div class='content-wrapper'>";
    tempElementString +=        "<div class='content'>";
    tempElementString +=            "<h3>"+ headline +"</h3>";
    tempElementString +=            content;
    tempElementString +=        "</div>";
    tempElementString +=        "<div class='action'>";
    tempElementString +=            "<a href='#' id='closeNotification' title='OK'>OK</a>";
    tempElementString +=        "</div>";
    tempElementString +=    "</div>";
    tempElementString += "</div>";
    notification.innerHTML = tempElementString;
    document.body.appendChild(notification);
    // add close on action
    var close = document.getElementById("closeNotification");
    close.addEventListener("click", function () {
        var temp = document.getElementById("notification");
        temp.parentNode.removeChild(temp);
    });
}

function removeNotifications() {
    var notifications = document.getElementsByClassName("notification");
    for (var i = 0; i < notifications.length; i++) {
        var temp = notifications[i];
        temp.parentNode.removeChild(temp);
    }
}