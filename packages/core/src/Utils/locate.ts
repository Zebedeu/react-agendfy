import {
    af,
    arSA,
    arDZ,
    arEG,
    az,
    be,
    bg,
    bn,
    ca,
    cs,
    cy,
    da,
    de,
    el,
    enAU,
    enCA,
    enGB,
    enIN,
    enNZ,
    enUS,
    enZA,
    eo,
    es,
    et,
    faIR,
    fi,
    fr,
    frCA,
    frCH,
    fy,
    gd,
    gl,
    gu,
    he,
    hi,
    hr,
    hu,
    id,
    is,
    it,
    ja,
    ka,
    kk,
    km,
    kn,
    ko,
    lb,
    lt,
    lv,
    mk,
    mn,
    ms,
    mt,
    nb,
    nl,
    nn,
    pl,
    ptBR,
    ro,
    ru,
    sk,
    sl,
    sq,
    srLatn,
    sr,
    sv,
    ta,
    te,
    th,
    tr,
    uk,
    uz,
    vi,
    zhCN,
    zhHK,
    zhTW,
  } from 'date-fns/locale';
  
  export const getLocale = (lang: string) => {
    switch (lang) {
      case 'af': return af;
      case 'arSA': return arSA;
      case 'arDZ': return arDZ;
      case 'arEG': return arEG;
      case 'az': return az;
      case 'be': return be;
      case 'bg': return bg;
      case 'bn': return bn;
      case 'ca': return ca;
      case 'cs': return cs;
      case 'cy': return cy;
      case 'da': return da;
      case 'de': return de;
      case 'el': return el;
      case 'enAU': return enAU;
      case 'enCA': return enCA;
      case 'enGB': return enGB;
      case 'enIN': return enIN;
      case 'enNZ': return enNZ;
      case 'enUS': return enUS;
      case 'enZA': return enZA;
      case 'eo': return eo;
      case 'es': return es;
      case 'et': return et;
      case 'faIR': return faIR;
      case 'fi': return fi;
      case 'fr': return fr;
      case 'frCA': return frCA;
      case 'frCH': return frCH;
      case 'fy': return fy;
      case 'gd': return gd;
      case 'gl': return gl;
      case 'gu': return gu;
      case 'he': return he;
      case 'hi': return hi;
      case 'hr': return hr;
      case 'hu': return hu;
      case 'id': return id;
      case 'is': return is;
      case 'it': return it;
      case 'ja': return ja;
      case 'ka': return ka;
      case 'kk': return kk;
      case 'km': return km;
      case 'kn': return kn;
      case 'ko': return ko;
      case 'lb': return lb;
      case 'lt': return lt;
      case 'lv': return lv;
      case 'mk': return mk;
      case 'mn': return mn;
      case 'ms': return ms;
      case 'mt': return mt;
      case 'nb': return nb;
      case 'nl': return nl;
      case 'nn': return nn;
      case 'pl': return pl;
      case 'pt': return ptBR;
      case 'ro': return ro;
      case 'ru': return ru;
      case 'sk': return sk;
      case 'sl': return sl;
      case 'sq': return sq;
      case 'srLatn': return srLatn;
      case 'sr': return sr;
      case 'sv': return sv;
      case 'ta': return ta;
      case 'te': return te;
      case 'th': return th;
      case 'tr': return tr;
      case 'uk': return uk;
      case 'uz': return uz;
      case 'vi': return vi;
      case 'zhCN': return zhCN;
      case 'zhHK': return zhHK;
      case 'zhTW': return zhTW;
      default: return enUS; // Retorna enUS por padrão
    }
  };