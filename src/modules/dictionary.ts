import { DictionaryLookUp } from "../types";
//import * as A from "../data/dictionary/a.json";
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

export async function getDefinition(
  word: string,
): Promise<DictionaryLookUp | undefined> {
  const upper = word.toUpperCase();
  const firstLetter = word[0].toUpperCase();
  switch (firstLetter) {
    case "A":
      const A = await import("../data/dictionary/a.json");
      /*prettier-ignore*/ console.log("[dictionary.ts,37] A: ", A);
      return A[upper];
    case "B":
      const B = await import("../data/dictionary/b.json");
      return B[upper];
    case "C":
      const C = await import("../data/dictionary/c.json");
      return C[upper];
    case "D":
      const D = await import("../data/dictionary/d.json");
      return D[upper];
    case "E":
      const E = await import("../data/dictionary/e.json");
      return E[upper];
    case "F":
      const F = await import("../data/dictionary/f.json");
      return F[upper];
    case "G":
      const G = await import("../data/dictionary/g.json");
      return G[upper];
    case "H":
      const H = await import("../data/dictionary/h.json");
      return H[upper];
    case "I":
      const I = await import("../data/dictionary/i.json");
      return I[upper];
    case "J":
      const J = await import("../data/dictionary/j.json");
      return J[upper];
    case "K":
      const K = await import("../data/dictionary/k.json");
      return K[upper];
    case "L":
      const L = await import("../data/dictionary/l.json");
      return L[upper];
    case "M":
      const M = await import("../data/dictionary/m.json");
      return M[upper];
    case "N":
      const N = await import("../data/dictionary/n.json");
      return N[upper];
    case "O":
      const O = await import("../data/dictionary/o.json");
      return O[upper];
    case "P":
      const P = await import("../data/dictionary/p.json");
      return P[upper];
    case "Q":
      const Q = await import("../data/dictionary/q.json");
      return Q[upper];
    case "R":
      const R = await import("../data/dictionary/r.json");
      return R[upper];
    case "S":
      const S = await import("../data/dictionary/s.json");
      return S[upper];
    case "T":
      const T = await import("../data/dictionary/t.json");
      return T[upper];
    case "U":
      const U = await import("../data/dictionary/u.json");
      return U[upper];
    case "V":
      const V = await import("../data/dictionary/v.json");
      return V[upper];
    case "W":
      const W = await import("../data/dictionary/w.json");
      return W[upper];
    case "X":
      const X = await import("../data/dictionary/x.json");
      return X[upper];
    case "Y":
      const Y = await import("../data/dictionary/y.json");
      return Y[upper];
    case "Z":
      const Z = await import("../data/dictionary/z.json");
      return Z[upper];
    default:
      return;
  }
}
