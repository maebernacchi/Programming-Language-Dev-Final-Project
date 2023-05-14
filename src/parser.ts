import * as Sexp from './sexp'

console.log(Sexp.parse('(+ (hello (1) 1 ())) (ab12 $&@!* bjakj)').map(Sexp.sexpToString).join('\n'))
