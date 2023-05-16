import * as Sexp from './sexp'

console.log(Sexp.parse('(+ (hallo (1) 1 ())) (ab12 $&@!* bjakj)').map(Sexp.sexpToString).join('\n'))
