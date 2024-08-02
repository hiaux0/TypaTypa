import * as A from "../data/a.json";
import * as B from "../data/b.json";
import * as C from "../data/c.json";
//import * as D from "../data/d.json";
//import * as E from "../data/e.json";
//import * as F from "../data/f.json";
//import * as G from "../data/g.json";
//import * as H from "../data/h.json";
//import * as I from "../data/i.json";
//import * as J from "../data/j.json";
//import * as K from "../data/k.json";
//import * as L from "../data/l.json";
//import * as M from "../data/m.json";
//import * as N from "../data/n.json";
//import * as O from "../data/o.json";
//import * as P from "../data/p.json";
//import * as Q from "../data/q.json";
//import * as R from "../data/r.json";
//import * as S from "../data/s.json";
//import * as T from "../data/t.json";
//import * as U from "../data/u.json";
//import * as V from "../data/v.json";
//import * as W from "../data/w.json";
//import * as X from "../data/x.json";
//import * as Y from "../data/y.json";
//import * as Z from "../data/z.json";

export function getDefinition(word: string): unknown {
  const upper = word.toUpperCase();
  const firstLetter = word[0].toUpperCase();
  /*prettier-ignore*/ console.log("[dictionary.ts,30] firstLetter: ", firstLetter);
  switch (firstLetter) {
    case "A":
      return A[upper];
    case "B":
      return B[upper];
    case "C":
      return C[upper];
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
      return "Word not found";
  }
}
