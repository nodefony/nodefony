
import {
  ref,
  reactive
} from 'vue'


function useParsePdu(){
  const parsePdu = function(pdu) {
    if (!pdu) {
      return
    }
    switch (true) {
      case pdu.severity <= 3:
        pdu.type = 'error';
        pdu.color = 'red';
        break;
      case pdu.severity === 4:
        pdu.type = 'warning';
        pdu.color = 'yellow';
        break;
      case pdu.severity === 5:
        pdu.type = 'info';
        pdu.color = 'blue';
        break;
      case pdu.severity === 6:
        pdu.type = 'success';
        pdu.color = 'green';
        break;
      case pdu.severity === 7:
        pdu.type = 'success';
        pdu.color = 'teal';
        break;
      default:
        pdu.type = 'info';
        pdu.color = 'teal';
    }

    return pdu;
  }
  return {parsePdu}
}



export  {
  useParsePdu
}
