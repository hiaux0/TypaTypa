import * as A from "../data/dictionary/a.json";
import { DictionaryLookUp } from "../types";
//import * as B from "../data/dictionary/b.json";
//import * as C from "../data/dictionary/c.json";
//import * as D from "../data/dictionary/d.json";
//import * as E from "../data/dictionary/e.json";
//import * as F from "../data/dictionary/f.json";
//import * as G from "../data/dictionary/g.json";
//import * as H from "../data/dictionary/h.json";
//import * as I from "../data/dictionary/i.json";
//import * as J from "../data/dictionary/j.json";
//import * as K from "../data/dictionary/k.json";
//import * as L from "../data/dictionary/l.json";
//import * as M from "../data/dictionary/m.json";
//import * as N from "../data/dictionary/n.json";
//import * as O from "../data/dictionary/o.json";
//import * as P from "../data/dictionary/p.json";
//import * as Q from "../data/dictionary/q.json";
//import * as R from "../data/dictionary/r.json";
//import * as S from "../data/dictionary/s.json";
//import * as T from "../data/dictionary/t.json";
//import * as U from "../data/dictionary/u.json";
//import * as V from "../data/dictionary/v.json";
//import * as W from "../data/dictionary/w.json";
//import * as X from "../data/dictionary/x.json";
//import * as Y from "../data/dictionary/y.json";
//import * as Z from "../data/dictionary/z.json";

export function getDefinition(word: string): DictionaryLookUp | undefined {
  const upper = word.toUpperCase();
  const firstLetter = word[0].toUpperCase();
  /*prettier-ignore*/ console.log("[dictionary.ts,30] firstLetter: ", firstLetter);
  switch (firstLetter) {
    case "A":
      return A[upper];
    //case "B":
    //  return B[upper];
    //case "C":
    //  return C[upper];
    //case "D":
    //  return D[upper];
    //case "E":
    //  return E[upper];
    //case "F":
    //  return F[upper];
    //case "G":
    //  return G[upper];
    //case "H":
    //  return H[upper];
    //case "I":
    //  return I[upper];
    //case "J":
    //  return J[upper];
    //case "K":
    //  return K[upper];
    //case "L":
    //  return L[upper];
    //case "M":
    //  return M[upper];
    //case "N":
    //  return N[upper];
    //case "O":
    //  return O[upper];
    //case "P":
    //  return P[upper];
    //case "Q":
    //  return Q[upper];
    //case "R":
    //  return R[upper];
    //case "S":
    //  return S[upper];
    //case "T":
    //  return T[upper];
    //case "U":
    //  return U[upper];
    //case "V":
    //  return V[upper];
    //case "W":
    //  return W[upper];
    //case "X":
    //  return X[upper];
    //case "Y":
    //  return Y[upper];
    //case "Z":
    //  return Z[upper];
    default:
      return;
  }
}
