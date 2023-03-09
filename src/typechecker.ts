/**
* This code was taken from Lab 4 from CSC-312. I will make edits when given the chance
*/

import * as L from './lang'

/**
 * Checks to ensure that the types are accurate to the expression that 
 * has been given in the parameters
 */
export function typecheck(e: L.Exp): L.Typ {
  switch(e.tag){
    //Checks num
    case 'num':
      return L.tynat
    //Checks bool
    case 'bool':
      return L.tybool
    //Checks not
    case 'not':
      let enot = e.exp
      if(enot.tag === 'bool'){
        return L.tybool
      }else{
        throw new Error("Incompatible type: not")
      }
    //Checks plus
    case 'plus':
      let eplus1 = e.e1
      let eplus2 = e.e2
      if(eplus1.tag === "num" && eplus2.tag === 'num'){
        return L.tynat
      } else {
        throw new Error("Incompatible type: plus")
      }
    //Checks equals
    case 'eq':
      let eeq1 = e.e1
      let eeq2 = e.e2
      if(eeq1.tag === 'bool' && eeq2.tag === 'bool'){
        return L.tybool 
      } else if ( eeq1.tag === 'num' && eeq2.tag === 'num'){
        return L.tynat
      } else {
        throw new Error("Incompatible type: eq")
      }
    //Checks and
    case 'and':
      let eand1 = e.e1
      let eand2 = e.e2
      if (eand1.tag === 'bool' && eand2.tag === 'bool'){
        return L.tybool
      } else {
        throw new Error("Incompatible type: and")
      }
    //Checks or
    case 'or':
      let eor1 = e.e1
       let eor2 = e.e2
      if (eor1.tag === 'bool' && eor2.tag === 'bool'){
         return L.tybool
      }else {
        throw new Error("Incompatible type: or")
      }
    //Checks if
    case 'if':
      let eif1 = e.e1
       if(eif1.tag === 'bool'){
        return L.tybool 
      } else {
        throw new Error("Incompatible type: if")
      }
    //Checks unit
    case 'unit':
      return L.tyunit

    //Checks pair
    case 'pair':
      let pair1 = e.e1
      let pair2 = e.e2
      if ((pair1.tag === 'bool' || pair1.tag === 'num'|| pair1.tag === 'pair' || pair1.tag === 'unit') &&
      (pair2.tag === 'bool' || pair2.tag === 'num'|| pair2.tag === 'pair' || pair2.tag === 'unit')){
        return L.typair
      } else {
        throw new Error ("Incompatible type: pair")
      }
   
    //Check fst
    case 'fst':
      let efst = e.e
      if (efst.tag === 'pair'){
        return typecheck(efst.e1)
      } else {
        throw new Error ("Incompatible type: fst")
      }

    //Check snd
      case 'snd':
        let esnd = e.e
        if (esnd.tag === 'pair'){
          return typecheck(esnd.e2)
        } else {
          throw new Error ("Incompatible type: snd")
        }
    //Checks default 
    default: 
       throw new Error("Not a valid expression")
    }
}
