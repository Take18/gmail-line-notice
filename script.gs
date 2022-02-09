const prop = PropertiesService.getScriptProperties().getProperties();

function sendLine(Me){
  const payload = {'message' :   Me};
  const options = {
    "method"  : "post",
    "payload" : payload,
    "headers" : {"Authorization" : "Bearer "+ prop.LINE_TOKEN}  
  };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}


function fetchContactMail() {
  const now_time = Math.floor(new Date().getTime() / 1000) ;
  const time_term = now_time - ((60 * prop.TRIGGER_INTERVAL_MINUTE) + 3);

  const strTerms = '(is:unread after:'+ time_term + ')';
 
 const myThreads = GmailApp.search(strTerms);
 const myMsgs = GmailApp.getMessagesForThreads(myThreads);
 const valMsgs = [];
 for(let i = 0; i < myMsgs.length;i++){
  if ( !isRegisteredMailAddress(myMsgs[i].slice(-1)[0].getFrom()) ) continue;
  const mailData = myMsgs[i].slice(-1)[0];
  valMsgs[i] = "\n " + mailData.getDate().getMonth() + "/"+ mailData.getDate().getDate()
  + " " + mailData.getDate().getHours() + ":" + mailData.getDate().getMinutes()
  + "\n[送信元]\n" + mailData.getFrom()
  + "\n\n[題名]\n" + mailData.getSubject()
  + "\n\n[本文]\n" + mailData.getPlainBody();
 }

 return valMsgs;
}

function isRegisteredMailAddress( mailAdress ) {
  const spreadsheet = SpreadsheetApp.openById(prop.SHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  const values = sheet.getRange('A:A').getValues();
  for ( let i=0; i<values.length; i++ ) {
    if ( values[i] == "" ) continue;
    if (mailAdress.includes(values[i])) {
      return true;
    }
  }
  return false;
}

function main() {
 new_Me = fetchContactMail()
 if(new_Me.length > 0) {
   for(let i = new_Me.length-1; i >= 0; i--) {
     sendLine(new_Me[i])
   }
 }
}